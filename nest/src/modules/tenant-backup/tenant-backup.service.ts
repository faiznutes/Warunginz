import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TenantBackupService {
  constructor(private prisma: PrismaService) {}

  async getBackupPreview(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [orders, transactions, products, receivables, payables] =
      await Promise.all([
        this.prisma.order.findMany({
          where: {
            tenantId,
            status: "COMPLETED",
            createdAt: { gte: today, lt: tomorrow },
          },
        }),
        this.prisma.transaction.findMany({
          where: {
            tenantId,
            status: "COMPLETED",
            createdAt: { gte: today, lt: tomorrow },
          },
        }),
        this.prisma.product.findMany({
          where: {
            tenantId,
            isActive: true,
          },
          select: {
            name: true,
            stock: true,
            minStock: true,
          },
        }),
        this.prisma.transaction.aggregate({
          where: {
            tenantId,
            status: "PENDING",
          },
          _sum: { amount: true },
        }),
        this.prisma.purchaseOrder.aggregate({
          where: {
            tenantId,
            status: "PENDING",
          },
          _sum: { totalAmount: true },
        }),
      ]);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const totalItems = await this.prisma.orderItem.count({
      where: {
        orderId: { in: orders.map((o) => o.id) },
      },
    });

    const cashIn = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const lowStockProducts = products
      .filter((p) => p.stock <= p.minStock && p.stock > 0)
      .slice(0, 10)
      .map((p) => ({
        name: p.name,
        stock: p.stock,
        minStock: p.minStock,
      }));
    const outOfStock = products.filter((p) => p.stock === 0).length;

    const report = {
      tenantId,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      date: today,
      sales: {
        totalRevenue,
        totalOrders,
        totalItems,
      },
      cash: {
        cashIn,
        cashOut: 0,
      },
      debts: {
        totalReceivables: Number(receivables._sum.amount || 0),
        totalPayables: Number(payables._sum.totalAmount || 0),
      },
      stock: {
        lowStock: lowStockProducts.length,
        outOfStock,
        lowStockProducts,
      },
    };

    const html = this.generateReportHTML(report);

    return { report, html };
  }

  async getLatestBackup(tenantId: string) {
    const latestBackup = await this.prisma.backupLog.findFirst({
      where: { tenantId },
      orderBy: { generatedAt: "desc" },
    });

    if (!latestBackup) {
      return null;
    }

    return latestBackup;
  }

  private generateReportHTML(report: any): string {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(value);
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    };

    return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan Harian - ${report.tenantName}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
    .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1e40af; margin-top: 30px; border-left: 4px solid #2563eb; padding-left: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .summary-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-card h3 { margin: 0 0 10px 0; font-size: 14px; opacity: 0.9; }
    .summary-card .value { font-size: 24px; font-weight: bold; }
    .section { margin: 25px 0; }
    .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
    .data-table th { background-color: #f9fafb; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Laporan Harian ${report.tenantName}</h1>
    <p><strong>Tanggal:</strong> ${formatDate(report.date)}</p>
    
    <div class="summary">
      <div class="summary-card">
        <h3>Total Pendapatan</h3>
        <div class="value">${formatCurrency(report.sales.totalRevenue)}</div>
      </div>
      <div class="summary-card">
        <h3>Total Pesanan</h3>
        <div class="value">${report.sales.totalOrders}</div>
      </div>
      <div class="summary-card">
        <h3>Total Item</h3>
        <div class="value">${report.sales.totalItems}</div>
      </div>
      <div class="summary-card">
        <h3>Cash In</h3>
        <div class="value">${formatCurrency(report.cash.cashIn)}</div>
      </div>
    </div>

    <div class="section">
      <h2>Piutang & Utang</h2>
      <table class="data-table">
        <tr><th>Piutang</th><td>${formatCurrency(report.debts.totalReceivables)}</td></tr>
        <tr><th>Utang</th><td>${formatCurrency(report.debts.totalPayables)}</td></tr>
      </table>
    </div>

    <div class="section">
      <h2>Stok Produk</h2>
      <p>Stok Rendah: ${report.stock.lowStock}</p>
      <p>Stok Habis: ${report.stock.outOfStock}</p>
      ${
        report.stock.lowStockProducts.length > 0
          ? `
      <table class="data-table">
        <thead><tr><th>Produk</th><th>Stok</th><th>Min Stok</th></tr></thead>
        <tbody>
          ${report.stock.lowStockProducts
            .map(
              (p: any) => `
            <tr><td>${p.name}</td><td>${p.stock}</td><td>${p.minStock}</td></tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
      `
          : ""
      }
    </div>
  </div>
</body>
</html>`;
  }
}
