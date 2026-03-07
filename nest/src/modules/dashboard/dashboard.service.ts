import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  StoreScopedUser,
  applyOutletScopeToWhere,
  getAllowedOutletIds,
} from "../../common/utils/store-scope.util";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTenantId(tenantId: string | null | undefined): string {
    if (!tenantId) {
      throw new BadRequestException("Tenant ID is required");
    }
    return tenantId;
  }

  async getDashboardSummary(tenantId: string, user?: StoreScopedUser) {
    this.validateTenantId(tenantId);
    const allowedOutletIds = getAllowedOutletIds(user);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orderTodayWhere: Record<string, unknown> = {
      tenantId,
      createdAt: { gte: today, lt: tomorrow },
      status: { in: ["COMPLETED", "PROCESSING"] },
    };
    const transactionTodayWhere: Record<string, unknown> = {
      tenantId,
      createdAt: { gte: today, lt: tomorrow },
      status: "COMPLETED",
    };
    const pendingOrderWhere: Record<string, unknown> = {
      tenantId,
      status: "PENDING",
    };

    applyOutletScopeToWhere(orderTodayWhere, allowedOutletIds);
    applyOutletScopeToWhere(pendingOrderWhere, allowedOutletIds);

    if (allowedOutletIds) {
      transactionTodayWhere.order =
        allowedOutletIds.length === 1
          ? { outletId: allowedOutletIds[0] }
          : { outletId: { in: allowedOutletIds } };
    }

    const [
      totalProducts,
      totalCustomers,
      totalMembers,
      todayOrders,
      todayRevenue,
      lowStockProducts,
      pendingOrders,
    ] = await Promise.all([
      this.prisma.product.count({ where: { tenantId, isActive: true } }),
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.member.count({ where: { tenantId, isActive: true } }),
      this.prisma.order.count({
        where: orderTodayWhere as any,
      }),
      this.prisma.transaction.aggregate({
        where: transactionTodayWhere as any,
        _sum: { amount: true },
      }),
      this.prisma.product.count({
        where: {
          tenantId,
          isActive: true,
          minStock: { gt: 0 },
        },
      }),
      this.prisma.order.count({
        where: pendingOrderWhere as any,
      }),
    ]);

    return {
      totalProducts,
      totalCustomers,
      totalMembers,
      todayOrders,
      todayRevenue: todayRevenue._sum.amount || 0,
      lowStockProducts,
      pendingOrders,
    };
  }

  async getRecentOrders(
    tenantId: string,
    limit: number = 10,
    user?: StoreScopedUser,
  ) {
    this.validateTenantId(tenantId);
    const where: Record<string, unknown> = { tenantId };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds);

    return this.prisma.order.findMany({
      where: where as any,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        user: {
          select: { name: true },
        },
      },
    });
  }

  async getTopProducts(
    tenantId: string,
    limit: number = 10,
    user?: StoreScopedUser,
  ) {
    this.validateTenantId(tenantId);
    const allowedOutletIds = getAllowedOutletIds(user);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const orderScope: Record<string, unknown> = {
      tenantId,
      createdAt: { gte: thirtyDaysAgo },
      status: { in: ["COMPLETED", "PROCESSING"] },
    };

    applyOutletScopeToWhere(orderScope, allowedOutletIds);

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: orderScope as any,
      },
      include: {
        product: {
          select: { id: true, name: true },
        },
      },
    });

    const productSales: { [key: string]: { name: string; quantity: number } } =
      {};

    for (const item of orderItems) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.product.name,
          quantity: 0,
        };
      }
      productSales[item.productId].quantity += item.quantity;
    }

    return Object.entries(productSales)
      .map(([id, data]) => ({ productId: id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }

  async getDashboardStats(
    tenantId: string | null,
    startDate?: Date,
    endDate?: Date,
    includeMetrics?: boolean,
    outletId?: string,
    user?: StoreScopedUser,
  ) {
    if (!tenantId) {
      return {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        totalTransactions: 0,
      };
    }

    const start = startDate || new Date();
    start.setHours(0, 0, 0, 0);
    const end = endDate || new Date();
    end.setHours(23, 59, 59, 999);

    const where: Record<string, unknown> = {
      tenantId,
      createdAt: { gte: start, lte: end },
    };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds, outletId);

    const [totalOrders, completedOrders, pendingOrders, cancelledOrders] =
      await Promise.all([
        this.prisma.order.count({ where: where as any }),
        this.prisma.order.count({
          where: { ...where, status: "COMPLETED" } as any,
        }),
        this.prisma.order.count({
          where: { ...where, status: "PENDING" } as any,
        }),
        this.prisma.order.count({
          where: { ...where, status: "CANCELLED" } as any,
        }),
      ]);

    const revenueResult = await this.prisma.order.aggregate({
      where: { ...where, status: "COMPLETED" } as any,
      _sum: { total: true },
    });

    const transactionWhere: any = {
      tenantId,
      createdAt: { gte: start, lte: end },
      status: "COMPLETED",
    };
    if (allowedOutletIds) {
      transactionWhere.order =
        allowedOutletIds.length === 1
          ? { outletId: allowedOutletIds[0] }
          : { outletId: { in: allowedOutletIds } };
    } else if (outletId) {
      transactionWhere.order = { outletId };
    }
    const transactionResult = await this.prisma.transaction.aggregate({
      where: transactionWhere,
      _sum: { amount: true },
    });

    const totalRevenue = Number(revenueResult._sum.total || 0);
    const totalTransactions = Number(transactionResult._sum.amount || 0);

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      totalTransactions,
      period: { startDate: start.toISOString(), endDate: end.toISOString() },
    };
  }

  async getCashierStats(
    tenantId: string,
    userId: string,
    assignedStoreId?: string,
    user?: StoreScopedUser,
  ) {
    this.validateTenantId(tenantId);
    const allowedOutletIds = getAllowedOutletIds(user);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const effectiveOutletId =
      allowedOutletIds?.[0] || assignedStoreId || user?.assignedStoreId || null;
    const outletFilter = effectiveOutletId ? { outletId: effectiveOutletId } : {};

    const [todayOrders, todayRevenue, recentTransactions] = await Promise.all([
      this.prisma.order.count({
        where: {
          tenantId,
          userId,
          createdAt: { gte: today },
          ...outletFilter,
        },
      }),
      this.prisma.order.aggregate({
        where: {
          tenantId,
          userId,
          status: "COMPLETED",
          createdAt: { gte: today },
          ...outletFilter,
        },
        _sum: { total: true },
      }),
      this.prisma.order.findMany({
        where: {
          tenantId,
          userId,
          ...outletFilter,
        },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { product: true },
          },
        },
      }),
    ]);

    return {
      todayOrders,
      todayRevenue: Number(todayRevenue._sum.total || 0),
      recentTransactions,
    };
  }

  async getKitchenStats(
    tenantId: string,
    assignedStoreId?: string,
    user?: StoreScopedUser,
  ) {
    this.validateTenantId(tenantId);
    const allowedOutletIds = getAllowedOutletIds(user);
    const effectiveOutletId =
      allowedOutletIds?.[0] || assignedStoreId || user?.assignedStoreId || null;
    const outletFilter = effectiveOutletId ? { outletId: effectiveOutletId } : {};

    const [pendingOrders, cookingOrders, readyOrders] = await Promise.all([
      this.prisma.order.count({
        where: {
          tenantId,
          sendToKitchen: true,
          kitchenStatus: "PENDING",
          ...outletFilter,
        },
      }),
      this.prisma.order.count({
        where: {
          tenantId,
          sendToKitchen: true,
          kitchenStatus: "COOKING",
          ...outletFilter,
        },
      }),
      this.prisma.order.count({
        where: {
          tenantId,
          sendToKitchen: true,
          kitchenStatus: "READY",
          ...outletFilter,
        },
      }),
    ]);

    return {
      pendingOrders,
      cookingOrders,
      readyOrders,
      totalOrders: pendingOrders + cookingOrders + readyOrders,
    };
  }
}
