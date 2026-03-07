import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueReport(tenantId: string, startDate?: string, endDate?: string) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const transactions = await this.prisma.transaction.findMany({
      where: {
        tenantId,
        createdAt: { gte: start, lte: end },
        status: "COMPLETED",
      },
      include: {
        order: true,
      },
    });

    const revenueByPaymentMethod: { [key: string]: number } = {};
    let totalRevenue = 0;

    for (const tx of transactions) {
      const amount = Number(tx.amount);
      totalRevenue += amount;
      revenueByPaymentMethod[tx.paymentMethod] =
        (revenueByPaymentMethod[tx.paymentMethod] || 0) + amount;
    }

    return {
      totalRevenue,
      transactionCount: transactions.length,
      revenueByPaymentMethod,
      period: { startDate, endDate },
    };
  }

  async getProfitReport(tenantId: string, startDate?: string, endDate?: string) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          tenantId,
          createdAt: { gte: start, lte: end },
          status: "COMPLETED",
        },
      },
    });

    let totalRevenue = 0;
    let totalCost = 0;

    for (const item of orderItems) {
      totalRevenue += Number(item.subtotal);
      if (item.cost) {
        totalCost += Number(item.cost) * item.quantity;
      }
    }

    return {
      totalRevenue,
      totalCost,
      profit: totalRevenue - totalCost,
      margin:
        totalRevenue > 0
          ? ((totalRevenue - totalCost) / totalRevenue) * 100
          : 0,
    };
  }

  async getCashFlow(tenantId: string, startDate?: string, endDate?: string) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: start, lte: end },
        status: "COMPLETED",
      },
    });

    let totalIn = 0;
    const totalOut = 0;

    for (const order of orders) {
      totalIn += Number(order.total);
    }

    return {
      operating: totalIn - totalOut,
      investing: 0,
      financing: 0,
      netCashFlow: totalIn - totalOut,
    };
  }
}
