import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSalesAnalytics(tenantId: string, startDate: Date, endDate: Date) {
    const result = await this.prisma.order.aggregate({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { total: true },
      _count: true,
    });

    const totalRevenue = Number(result._sum.total || 0);
    const totalOrders = result._count;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
    };
  }

  async getProductAnalytics(tenantId: string, limit = 10) {
    const orderItems = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          tenantId,
          status: "COMPLETED",
        },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    if (orderItems.length === 0) {
      return [];
    }

    const productIds = orderItems.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true, image: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return orderItems.map((item) => {
      const product = productMap.get(item.productId);
      return {
        product: product || {
          id: item.productId,
          name: "Unknown",
          category: "",
          image: null,
        },
        totalQuantity: item._sum.quantity || 0,
        totalRevenue: Number(item._sum.subtotal || 0),
      };
    });
  }

  async getCustomerAnalytics(tenantId: string) {
    const totalCustomers = await this.prisma.customer.count({
      where: { tenantId },
    });

    const newCustomers = await this.prisma.customer.count({
      where: {
        tenantId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    return {
      totalCustomers,
      newCustomers,
    };
  }

  async getDashboardSummary(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, pendingOrders, lowStockProducts] = await Promise.all([
      this.prisma.order.count({
        where: { tenantId, createdAt: { gte: today }, status: "COMPLETED" },
      }),
      this.prisma.order.count({
        where: { tenantId, status: "PENDING" },
      }),
      this.prisma.product.count({
        where: { tenantId, stock: { lte: 10 } },
      }),
    ]);

    const todayRevenueAgg = await this.prisma.order.aggregate({
      where: { tenantId, createdAt: { gte: today }, status: "COMPLETED" },
      _sum: { total: true },
    });

    return {
      todayOrders,
      todayRevenue: Number(todayRevenueAgg._sum.total) || 0,
      pendingOrders,
      lowStockProducts,
    };
  }

  async getPredictions(tenantId: string, method: string = "moving_average") {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: sixMonthsAgo },
      },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const monthlyRevenue: Record<string, number> = {};
    for (const order of orders) {
      const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(order.total);
    }

    const sortedEntries = Object.entries(monthlyRevenue).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const values = sortedEntries.map(([, v]) => v);

    let nextMonth = 0;
    let trend = 0;
    let accuracy = 75;

    if (values.length === 0) {
      return { nextMonth: 0, trend: 0, accuracy: 0 };
    }

    if (method === "linear_regression" && values.length >= 2) {
      const n = values.length;
      const xMean = (n - 1) / 2;
      const yMean = values.reduce((a, b) => a + b, 0) / n;

      let numerator = 0;
      let denominator = 0;
      for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (values[i] - yMean);
        denominator += (i - xMean) * (i - xMean);
      }

      const slope = denominator !== 0 ? numerator / denominator : 0;
      const intercept = yMean - slope * xMean;
      nextMonth = Math.round(Math.max(0, intercept + slope * n));

      const lastValue = values[values.length - 1];
      trend =
        lastValue > 0
          ? Math.round(((nextMonth - lastValue) / lastValue) * 100 * 10) / 10
          : 0;

      let ssRes = 0;
      let ssTot = 0;
      for (let i = 0; i < n; i++) {
        const predicted = intercept + slope * i;
        ssRes += (values[i] - predicted) ** 2;
        ssTot += (values[i] - yMean) ** 2;
      }
      accuracy =
        ssTot > 0
          ? Math.round(Math.max(0, Math.min(100, (1 - ssRes / ssTot) * 100)))
          : 50;
    } else {
      const windowSize = Math.min(3, values.length);
      const recent = values.slice(-windowSize);
      nextMonth = Math.round(recent.reduce((a, b) => a + b, 0) / recent.length);

      const lastValue = values[values.length - 1];
      const prevValue =
        values.length > 1 ? values[values.length - 2] : lastValue;
      trend =
        prevValue > 0
          ? Math.round(((lastValue - prevValue) / prevValue) * 100 * 10) / 10
          : 0;
      accuracy = Math.min(95, 70 + values.length * 4);
    }

    return {
      nextMonth,
      trend,
      accuracy,
      method,
      dataPoints: values.length,
    };
  }

  async getTopProducts(tenantId: string, limit: number = 10) {
    const topItems = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          tenantId,
          status: "COMPLETED",
        },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    if (topItems.length === 0) {
      return [];
    }

    const productIds = topItems.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true, image: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return topItems.map((item) => {
      const product = productMap.get(item.productId);
      return {
        id: item.productId,
        name: product?.name || "Unknown Product",
        category: product?.category || "",
        image: product?.image || null,
        sales: item._sum.quantity || 0,
        revenue: Number(item._sum.subtotal || 0),
      };
    });
  }

  async getCustomReports(tenantId: string) {
    const reports = await this.prisma.report.findMany({
      where: {
        tenantId,
        type: "CUSTOM",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formattedReports = reports.map((report) => {
      const data = report.data as any;
      return {
        id: report.id,
        name: data?.name || "Untitled Report",
        description: data?.description || "",
        dataType: data?.dataType || "SALES",
        metrics: data?.metrics || [],
        startDate: data?.startDate || null,
        endDate: data?.endDate || null,
        createdAt: report.createdAt,
      };
    });

    return { data: formattedReports };
  }

  async getRevenueByHour(tenantId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: targetDate, lte: endDate },
        status: "COMPLETED",
      },
    });

    const hourlyRevenue: number[] = new Array(24).fill(0);
    const hourlyOrders: number[] = new Array(24).fill(0);

    for (const order of orders) {
      const hour = order.createdAt.getHours();
      hourlyRevenue[hour] += Number(order.total);
      hourlyOrders[hour]++;
    }

    return { hourlyRevenue, hourlyOrders };
  }

  async getRevenueByOutlet(tenantId: string) {
    const outlets = await this.prisma.outlet.findMany({
      where: { tenantId, isActive: true },
      select: { id: true, name: true },
    });

    const outletRevenue = await Promise.all(
      outlets.map(async (outlet) => {
        const orders = await this.prisma.order.aggregate({
          where: {
            tenantId,
            outletId: outlet.id,
            status: "COMPLETED",
          },
          _sum: { total: true },
          _count: true,
        });

        return {
          outletId: outlet.id,
          outletName: outlet.name,
          revenue: Number(orders._sum.total || 0),
          orderCount: orders._count,
        };
      }),
    );

    return outletRevenue;
  }

  async getRevenueByPaymentMethod(tenantId: string) {
    const transactions = await this.prisma.transaction.groupBy({
      by: ["paymentMethod"],
      where: {
        tenantId,
        status: "COMPLETED",
      },
      _sum: { amount: true },
      _count: true,
    });

    return transactions.map((t) => ({
      paymentMethod: t.paymentMethod,
      revenue: Number(t._sum.amount || 0),
      count: t._count,
    }));
  }
}
