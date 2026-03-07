import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  GetDailySalesDto,
  GetProductSummaryDto,
  GetCustomerRevenueDto,
  GetShiftSummaryDto,
} from "./dto/report-query.dto";
import {
  StoreScopedUser,
  applyOutletScopeToWhere,
  getAllowedOutletIds,
} from "../../common/utils/store-scope.util";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailySales(
    tenantId: string,
    query: GetDailySalesDto,
    user?: StoreScopedUser,
  ) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 30, 100);
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      status: { in: ["COMPLETED", "CANCELLED"] },
    };
    const allowedOutletIds = getAllowedOutletIds(user);

    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt = { gte: startDate, lte: endDate };
    }

    applyOutletScopeToWhere(where, allowedOutletIds, query.outletId);

    const orders = await this.prisma.order.findMany({
      where,
      select: {
        createdAt: true,
        outletId: true,
        status: true,
        total: true,
        subtotal: true,
        discount: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const dailyMap = new Map<string, any>();
    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const outletKey = order.outletId || "default";
      const key = `${dateKey}-${outletKey}`;

      if (!dailyMap.has(key)) {
        dailyMap.set(key, {
          sales_date: dateKey,
          outlet_id: outletKey,
          order_count: 0,
          completed_orders: 0,
          gross_sales: 0,
          total_discount: 0,
          net_sales: 0,
        });
      }

      const entry = dailyMap.get(key);
      entry.order_count++;
      if (order.status === "COMPLETED") {
        entry.completed_orders++;
        entry.gross_sales += Number(order.subtotal || 0);
        entry.total_discount += Number(order.discount || 0);
        entry.net_sales += Number(order.total || 0);
      }
    }

    const data = Array.from(dailyMap.values())
      .sort((a: any, b: any) => b.sales_date.localeCompare(a.sales_date))
      .slice(skip, skip + limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total: dailyMap.size,
        totalPages: Math.ceil(dailyMap.size / limit),
      },
    };
  }

  async getProductSummary(
    tenantId: string,
    query: GetProductSummaryDto,
    user?: StoreScopedUser,
  ) {
    const limit = Math.min(query.limit || 50, 100);
    const allowedOutletIds = getAllowedOutletIds(user);
    const orderWhere: Record<string, unknown> = {
      tenantId,
      status: "COMPLETED",
    };

    applyOutletScopeToWhere(orderWhere, allowedOutletIds);

    const where: any = {
      order: orderWhere,
    };

    if (query.startDate && query.endDate) {
      where.order.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const orderItems = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      where,
      _sum: { quantity: true, subtotal: true },
      orderBy: {
        _sum: { subtotal: "desc" },
      },
      take: limit,
    });

    if (orderItems.length === 0) {
      return {
        data: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      };
    }

    const productIds = orderItems.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true, sku: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const data = orderItems.map((item) => {
      const product = productMap.get(item.productId);
      return {
        product_id: item.productId,
        product_name: product?.name || "Unknown",
        category: product?.category || "",
        sku: product?.sku || "",
        quantity_sold: item._sum.quantity || 0,
        revenue: Number(item._sum.subtotal || 0),
      };
    });

    return {
      data,
      pagination: { page: 1, limit, total: data.length, totalPages: 1 },
    };
  }

  async getCustomerRevenue(
    tenantId: string,
    query: GetCustomerRevenueDto,
    user?: StoreScopedUser,
  ) {
    const limit = Math.min(query.limit || 20, 100);
    const sortBy = query.sortBy || "total";
    const allowedOutletIds = getAllowedOutletIds(user);

    const where: any = {
      tenantId,
      status: "COMPLETED",
    };

    applyOutletScopeToWhere(where, allowedOutletIds);

    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const orders = await this.prisma.order.findMany({
      where,
      select: {
        customerId: true,
        total: true,
      },
      take: 1000,
    });

    const customerMap = new Map<
      string,
      { customerId: string; totalRevenue: number; orderCount: number }
    >();
    for (const order of orders) {
      if (!order.customerId) continue;

      if (!customerMap.has(order.customerId)) {
        customerMap.set(order.customerId, {
          customerId: order.customerId,
          totalRevenue: 0,
          orderCount: 0,
        });
      }

      const entry = customerMap.get(order.customerId)!;
      entry.totalRevenue += Number(order.total || 0);
      entry.orderCount++;
    }

    const data = Array.from(customerMap.values())
      .sort((a, b) =>
        sortBy === "orderCount"
          ? b.orderCount - a.orderCount
          : b.totalRevenue - a.totalRevenue,
      )
      .slice(0, limit);

    return {
      data,
      pagination: { page: 1, limit, total: data.length, totalPages: 1 },
    };
  }

  async getShiftSummary(
    tenantId: string,
    query: GetShiftSummaryDto,
    user?: StoreScopedUser,
  ) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds, query.outletId);

    if (query.startDate && query.endDate) {
      where.openedAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const [shifts, total] = await Promise.all([
      this.prisma.storeShift.findMany({
        where,
        orderBy: { openedAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.storeShift.count({ where }),
    ]);

    return {
      data: shifts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSummaryDashboard(tenantId: string, user?: StoreScopedUser) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const allowedOutletIds = getAllowedOutletIds(user);
    const orderWhere: Record<string, unknown> = {
      tenantId,
      createdAt: { gte: today },
    };
    const openShiftWhere: Record<string, unknown> = {
      tenantId,
      status: "open",
    };

    applyOutletScopeToWhere(orderWhere, allowedOutletIds);
    applyOutletScopeToWhere(openShiftWhere, allowedOutletIds);

    const [todayOrders, todayRevenue, activeShifts, totalProducts] =
      await Promise.all([
        this.prisma.order.count({
          where: orderWhere as any,
        }),
        this.prisma.order.aggregate({
          where: { ...orderWhere, status: "COMPLETED" } as any,
          _sum: { total: true },
        }),
        this.prisma.storeShift.count({ where: openShiftWhere as any }),
        this.prisma.product.count({ where: { tenantId, isActive: true } }),
      ]);

    return {
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.total || 0),
      activeShifts,
      totalProducts,
    };
  }

  async getRevenueTrend(tenantId: string, user?: StoreScopedUser) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const where: Record<string, unknown> = {
      tenantId,
      status: "COMPLETED",
      createdAt: { gte: thirtyDaysAgo },
    };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds);

    const orders = await this.prisma.order.findMany({
      where: where as any,
      select: { createdAt: true, total: true },
    });

    const dailyRevenue: Record<string, number> = {};
    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      dailyRevenue[dateKey] =
        (dailyRevenue[dateKey] || 0) + Number(order.total || 0);
    }

    const data = Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { data };
  }
}
