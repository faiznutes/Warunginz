import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateStockTransferDto } from "./dto/create-stock-transfer.dto";
import { UpdateStockTransferDto } from "./dto/update-stock-transfer.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class StockTransferService {
  constructor(private readonly prisma: PrismaService) {}

  async getStockTransfers(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: any = { tenantId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.fromOutletId) {
      where.fromOutletId = query.fromOutletId;
    }

    if (query.toOutletId) {
      where.toOutletId = query.toOutletId;
    }

    if (query.outletId) {
      where.OR = [{ fromOutletId: query.outletId }, { toOutletId: query.outletId }];
    }

    if (query.date) {
      const start = new Date(query.date);
      if (!Number.isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        where.transferDate = {
          gte: start,
          lt: end,
        };
      }
    }

    const allowedSortFields = new Set(["createdAt", "updatedAt", "transferDate", "status", "transferNumber"]);
    const sortBy = allowedSortFields.has(query.sortBy) ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [transfers, total] = await Promise.all([
      this.prisma.stockTransfer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      this.prisma.stockTransfer.count({ where }),
    ]);

    return {
      data: transfers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStockTransferById(id: string, tenantId: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException("Stock transfer not found");
    }

    if (transfer.tenantId !== tenantId) {
      throw new ForbiddenException(
        "Unauthorized access to this stock transfer",
      );
    }

    return transfer;
  }

  async createStockTransfer(
    data: CreateStockTransferDto,
    tenantId: string,
    userId: string,
  ) {
    if (data.fromOutletId === data.toOutletId) {
      throw new BadRequestException("Source dan destination store harus berbeda");
    }

    if (!Array.isArray(data.items) || data.items.length === 0) {
      throw new BadRequestException("Minimal satu item transfer wajib diisi");
    }

    const cleanedItems = data.items
      .filter((item) => item?.productId && Number(item.quantity) > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
        notes: item.notes?.trim() || null,
      }));

    if (cleanedItems.length === 0) {
      throw new BadRequestException("Item transfer tidak valid");
    }

    const [outlets, products] = await Promise.all([
      this.prisma.outlet.findMany({
        where: {
          tenantId,
          id: { in: [data.fromOutletId, data.toOutletId] },
        },
        select: { id: true },
      }),
      this.prisma.product.findMany({
        where: {
          tenantId,
          id: { in: cleanedItems.map((item) => item.productId) },
          isActive: true,
        },
        select: { id: true },
      }),
    ]);

    if (outlets.length !== 2) {
      throw new BadRequestException("Store sumber atau tujuan tidak valid");
    }

    const validProductIds = new Set(products.map((product) => product.id));
    const missingProduct = cleanedItems.find(
      (item) => !validProductIds.has(item.productId),
    );
    if (missingProduct) {
      throw new BadRequestException("Ada produk transfer yang tidak valid");
    }

    const transferNumber = `ST-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    return this.prisma.stockTransfer.create({
      data: {
        tenantId,
        fromOutletId: data.fromOutletId,
        toOutletId: data.toOutletId,
        transferNumber,
        status: "PENDING",
        notes: data.notes?.trim() || null,
        createdBy: userId,
        items: {
          create: cleanedItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async updateStockTransfer(
    id: string,
    data: UpdateStockTransferDto,
    tenantId: string,
  ) {
    await this.getStockTransferById(id, tenantId);

    const updated = await this.prisma.stockTransfer.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteStockTransfer(id: string, tenantId: string) {
    await this.getStockTransferById(id, tenantId);

    await this.prisma.stockTransfer.delete({
      where: { id },
    });

    return { message: "Stock transfer deleted successfully" };
  }
}
