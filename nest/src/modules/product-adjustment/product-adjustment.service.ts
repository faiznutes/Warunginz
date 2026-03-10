import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class ProductAdjustmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdjustments(
    tenantId: string,
    query: {
      page?: number;
      limit?: number;
      productId?: string;
      search?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const { page, limit, skip } = parsePagination(
      query.page || 1,
      query.limit || 50,
    );

    const where: any = {
      tenantId,
      ...(query.productId && { productId: query.productId }),
      ...(query.type && { type: query.type }),
      ...(query.startDate &&
        query.endDate && {
          createdAt: {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate + "T23:59:59.999Z"),
          },
        }),
    };

    if (query.search) {
      where.OR = [{ reason: { contains: query.search, mode: "insensitive" } }];
    }

    const [adjustments, total] = await Promise.all([
      this.prisma.productAdjustment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.productAdjustment.count({ where }),
    ]);

    return {
      data: adjustments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAdjustmentById(id: string, tenantId: string) {
    const adjustment = await this.prisma.productAdjustment.findFirst({
      where: { id, tenantId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!adjustment) {
      throw new NotFoundException("Adjustment not found");
    }

    return adjustment;
  }

  async createAdjustment(
    data: {
      type: "INCREASE" | "DECREASE" | "TRANSFER";
      productId?: string;
      quantity?: number;
      reason: string;
      transferItems?: { productId: string; quantity: number }[];
      fromOutletId?: string;
      toOutletId?: string;
    },
    tenantId: string,
    userId: string,
  ) {
    if (data.type === "TRANSFER") {
      return await this.prisma.$transaction(async (tx) => {
        const results = [];
        for (const item of data.transferItems || []) {
          const product = await tx.product.findFirst({
            where: { id: item.productId, tenantId },
          });

          if (!product) continue;

          const stockBefore = product.stock;
          const stockAfter = Math.max(0, stockBefore - item.quantity);

          await tx.product.update({
            where: { id: product.id },
            data: { stock: stockAfter },
          });

          const adjustment = await tx.productAdjustment.create({
            data: {
              tenantId,
              productId: product.id,
              userId,
              type: "DECREASE",
              quantity: item.quantity,
              reason: data.reason,
              stockBefore,
              stockAfter,
            },
          });
          results.push(adjustment);
        }
        return results;
      });
    }

    if (!data.productId || !data.quantity) {
      throw new BadRequestException(
        "productId and quantity are required for regular adjustment",
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: data.productId, tenantId },
      });

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      const stockBefore = product.stock;
      let stockAfter: number;

      if (data.type === "INCREASE") {
        stockAfter = stockBefore + data.quantity;
      } else {
        stockAfter = Math.max(0, stockBefore - data.quantity);
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stock: stockAfter },
      });

      const adjustment = await tx.productAdjustment.create({
        data: {
          tenantId,
          productId: data.productId,
          userId,
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          stockBefore,
          stockAfter,
        },
      });

      return adjustment;
    });
  }
}
