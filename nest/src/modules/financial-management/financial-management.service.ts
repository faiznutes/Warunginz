import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class FinancialManagementService {
  constructor(private prisma: PrismaService) {}

  async getCashFlowSummary(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const dateFilter = { gte: start, lte: end };

    const [revenueResult, transactionsByMethod] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          tenantId,
          status: "COMPLETED",
          createdAt: dateFilter,
        },
        _sum: { total: true },
      }),
      this.prisma.transaction.groupBy({
        by: ["paymentMethod"],
        where: {
          tenantId,
          status: "COMPLETED",
          createdAt: dateFilter,
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome = Number(revenueResult._sum.total || 0);

    const expenseReports = await this.prisma.report.findMany({
      where: {
        tenantId,
        type: "EXPENSE",
        createdAt: dateFilter,
      },
    });

    let totalExpenses = 0;
    const byCategory: Record<string, number> = {};

    for (const report of expenseReports) {
      const data = report.data as any;
      const amount = Number(data?.amount || 0);
      totalExpenses += amount;
      const category = data?.category || "Uncategorized";
      byCategory[category] = (byCategory[category] || 0) + amount;
    }

    for (const group of transactionsByMethod) {
      const method = group.paymentMethod || "OTHER";
      byCategory[method] =
        (byCategory[method] || 0) + Number(group._sum.amount || 0);
    }

    await this.prisma.order.groupBy({
      by: ["status"],
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: dateFilter,
      },
      _sum: { total: true },
      _count: true,
    });

    const netCashFlow = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      byCategory,
      byMonth: [],
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    };
  }

  async getExpensesByCategory(
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const endDt = new Date(endDate);
      endDt.setHours(23, 59, 59, 999);
      dateFilter.lte = endDt;
    }

    const expenseReports = await this.prisma.report.findMany({
      where: {
        tenantId,
        type: "EXPENSE",
        ...(Object.keys(dateFilter).length > 0
          ? { createdAt: dateFilter }
          : {}),
      },
    });

    const byCategory: Record<string, number> = {};
    for (const report of expenseReports) {
      const data = report.data as any;
      const category = data?.category || "Uncategorized";
      const amount = Number(data?.amount || 0);
      byCategory[category] = (byCategory[category] || 0) + amount;
    }

    return byCategory;
  }

  async calculateTax(tenantId: string, period: string) {
    if (!period) {
      const now = new Date();
      period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }

    const [year, month] = period.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const [revenueResult] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          tenantId,
          status: "COMPLETED",
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { total: true },
      }),
    ]);

    const totalRevenue = Number(revenueResult._sum.total || 0);

    const expenseReports = await this.prisma.report.findMany({
      where: {
        tenantId,
        type: "EXPENSE",
        createdAt: { gte: startDate, lte: endDate },
      },
    });

    let totalExpenses = 0;
    for (const report of expenseReports) {
      const data = report.data as any;
      totalExpenses += Number(data?.amount || 0);
    }

    const taxRate = 0.11;
    const taxableIncome = totalRevenue;
    const taxAmount = taxableIncome * taxRate;

    return {
      period,
      totalRevenue,
      totalExpenses,
      taxableIncome,
      taxRate,
      taxAmount,
      details: {
        ppnRate: "11%",
        description: "PPN (Pajak Pertambahan Nilai) - Indonesian VAT",
      },
    };
  }

  async getForecast(tenantId: string, months: number = 6) {
    const now = new Date();
    const historicalMonths = 6;
    const startHistory = new Date(
      now.getFullYear(),
      now.getMonth() - historicalMonths,
      1,
    );

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: startHistory },
      },
      select: { total: true, createdAt: true },
    });

    const monthlyRevenue: Record<string, number> = {};
    for (const order of orders) {
      const key = `${order.createdAt.getFullYear()}-${String(
        order.createdAt.getMonth() + 1,
      ).padStart(2, "0")}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + Number(order.total);
    }

    const sortedMonths = Object.entries(monthlyRevenue).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const revenueValues = sortedMonths.map(([, v]) => v);

    let avgRevenue = 0;
    let trend = 0;
    if (revenueValues.length > 0) {
      avgRevenue =
        revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length;
      if (revenueValues.length > 1) {
        const lastHalf = revenueValues.slice(
          Math.floor(revenueValues.length / 2),
        );
        const firstHalf = revenueValues.slice(
          0,
          Math.floor(revenueValues.length / 2),
        );
        const avgLast = lastHalf.reduce((a, b) => a + b, 0) / lastHalf.length;
        const avgFirst =
          firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        trend = avgFirst > 0 ? (avgLast - avgFirst) / avgFirst : 0;
      }
    }

    const expenseReports = await this.prisma.report.findMany({
      where: {
        tenantId,
        type: "EXPENSE",
        createdAt: { gte: startHistory },
      },
    });

    const monthlyExpenses: Record<string, number> = {};
    for (const report of expenseReports) {
      const data = report.data as any;
      const key = `${report.createdAt.getFullYear()}-${String(
        report.createdAt.getMonth() + 1,
      ).padStart(2, "0")}`;
      monthlyExpenses[key] =
        (monthlyExpenses[key] || 0) + Number(data?.amount || 0);
    }

    const expenseValues = Object.values(monthlyExpenses);
    const avgExpenses =
      expenseValues.length > 0
        ? expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length
        : avgRevenue * 0.3;

    const forecast = [];
    for (let i = 1; i <= months; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthLabel = forecastDate.toLocaleString("id-ID", {
        month: "long",
        year: "numeric",
      });
      const growthFactor = 1 + trend * i * 0.5;
      const projectedRevenue = Math.round(avgRevenue * growthFactor);
      const projectedExpenses = Math.round(avgExpenses * (1 + trend * i * 0.3));
      const confidence = Math.max(0.5, 1 - i * 0.08);

      forecast.push({
        month: monthLabel,
        projectedRevenue,
        projectedExpenses,
        projectedProfit: projectedRevenue - projectedExpenses,
        confidence: Math.round(confidence * 100) / 100,
      });
    }

    return forecast;
  }

  async createCashFlow(
    tenantId: string,
    body: {
      type: string;
      category?: string;
      amount: number;
      description: string;
      date?: string;
      paymentMethod?: string;
      reference?: string;
    },
  ) {
    const {
      type,
      category,
      amount,
      description,
      date,
      paymentMethod,
      reference,
    } = body;

    if (!type || !amount || !description) {
      throw new BadRequestException("Type, amount, and description are required");
    }

    const reportType = type === "EXPENSE" ? "EXPENSE" : "CASH_FLOW";

    const record = await this.prisma.report.create({
      data: {
        tenantId,
        type: reportType,
        period: new Date(date || Date.now()).toISOString().slice(0, 7),
        data: {
          type,
          category: category || "General",
          amount: Number(amount),
          description,
          date: date || new Date().toISOString(),
          paymentMethod: paymentMethod || "",
          reference: reference || "",
        },
      },
    });

    return record;
  }

  async createExpense(
    tenantId: string,
    body: {
      category: string;
      amount: number;
      description: string;
      date?: string;
      vendor?: string;
      isTaxDeductible?: boolean;
    },
  ) {
    const { category, amount, description, date, vendor, isTaxDeductible } =
      body;

    if (!category || !amount || !description) {
      throw new BadRequestException("Category, amount, and description are required");
    }

    const record = await this.prisma.report.create({
      data: {
        tenantId,
        type: "EXPENSE",
        period: new Date(date || Date.now()).toISOString().slice(0, 7),
        data: {
          category,
          amount: Number(amount),
          description,
          date: date || new Date().toISOString(),
          vendor: vendor || "",
          isTaxDeductible: isTaxDeductible || false,
        },
      },
    });

    return record;
  }

  async createBankReconciliation(
    tenantId: string,
    body: {
      bankAccount: string;
      statementDate?: string;
      statementBalance: number;
      transactions?: any[];
    },
  ) {
    const { bankAccount, statementDate, statementBalance, transactions } = body;

    if (!bankAccount || statementBalance === undefined) {
      throw new BadRequestException("Bank account and statement balance are required");
    }

    const stmtDate = new Date(statementDate || Date.now());
    const monthStart = new Date(stmtDate.getFullYear(), stmtDate.getMonth(), 1);
    const monthEnd = new Date(
      stmtDate.getFullYear(),
      stmtDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const orderTotal = await this.prisma.order.aggregate({
      where: {
        tenantId,
        status: "COMPLETED",
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { total: true },
    });

    const bookBalance = Number(orderTotal._sum.total || 0);
    const stmtBal = Number(statementBalance);
    const difference = stmtBal - bookBalance;
    const reconciled = Math.abs(difference) < 0.01;

    const record = await this.prisma.report.create({
      data: {
        tenantId,
        type: "RECONCILIATION",
        period: stmtDate.toISOString().slice(0, 7),
        data: {
          bankAccount,
          statementDate: stmtDate.toISOString(),
          statementBalance: stmtBal,
          bookBalance,
          difference,
          reconciled,
          transactions: transactions || [],
        },
      },
    });

    return {
      id: record.id,
      bankAccount,
      statementDate: stmtDate.toISOString(),
      statementBalance: stmtBal,
      bookBalance,
      difference,
      reconciled,
      transactions: transactions || [],
    };
  }
}
