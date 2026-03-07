import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class StockAlertService {
  constructor(private readonly prisma: PrismaService) {}

  async getLowStockProducts(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const products = await this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        minStock: { gt: 0 },
      },
      skip,
      take: limit,
      orderBy: { stock: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        minStock: true,
        category: true,
      },
    });

    const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

    return {
      data: lowStockProducts,
      pagination: {
        page,
        limit,
        total: lowStockProducts.length,
        totalPages: Math.ceil(lowStockProducts.length / limit),
      },
    };
  }

  async getOutOfStockProducts(tenantId: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        stock: 0,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        category: true,
      },
    });
  }

  async getProductAdjustments(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: any = { tenantId };

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [adjustments, total] = await Promise.all([
      this.prisma.productAdjustment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: { id: true, name: true, sku: true },
          },
          user: {
            select: { id: true, name: true },
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

  async getStockSummary(tenantId: string) {
    const [total, lowStock, outOfStock] = await Promise.all([
      this.prisma.product.count({ where: { tenantId, isActive: true } }),
      this.prisma.product.count({
        where: {
          tenantId,
          isActive: true,
          stock: { lte: this.prisma.product.fields.minStock },
        },
      }),
      this.prisma.product.count({
        where: { tenantId, isActive: true, stock: 0 },
      }),
    ]);

    return { total, lowStock, outOfStock };
  }
}
