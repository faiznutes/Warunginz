import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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

    const [transfers, total] = await Promise.all([
      this.prisma.stockTransfer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
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
    const transferNumber = `ST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const transfer = await this.prisma.stockTransfer.create({
      data: {
        tenantId,
        fromOutletId: data.fromOutletId,
        toOutletId: data.toOutletId,
        transferNumber,
        status: "PENDING",
        notes: data.notes,
        createdBy: userId,
      },
    });

    return transfer;
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
