import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class SuperadminBackupService {
  constructor(private prisma: PrismaService) {}

  async getCriticalBackups() {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    threeDaysAgo.setHours(0, 0, 0, 0);

    const failedBackups = await this.prisma.backupLog.findMany({
      where: {
        status: { in: ["failed", "email_failed"] },
        generatedAt: { gte: threeDaysAgo },
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { generatedAt: "desc" },
    });

    const tenantFailures: Record<
      string,
      {
        tenant: any;
        failures: number;
        lastFailure: Date;
        consecutiveDays: number;
      }
    > = {};

    for (const backup of failedBackups) {
      if (!tenantFailures[backup.tenantId]) {
        tenantFailures[backup.tenantId] = {
          tenant: backup.tenant,
          failures: 0,
          lastFailure: backup.generatedAt,
          consecutiveDays: 0,
        };
      }
      tenantFailures[backup.tenantId].failures++;
      if (backup.generatedAt > tenantFailures[backup.tenantId].lastFailure) {
        tenantFailures[backup.tenantId].lastFailure = backup.generatedAt;
      }
    }

    for (const tenantId in tenantFailures) {
      const tf = tenantFailures[tenantId];
      const last3Days = await this.prisma.backupLog.findMany({
        where: {
          tenantId,
          generatedAt: { gte: threeDaysAgo },
          status: { in: ["failed", "email_failed"] },
        },
        orderBy: { generatedAt: "desc" },
      });

      const failureDays = new Set(
        last3Days.map((b) => b.generatedAt.toISOString().split("T")[0]),
      );
      tf.consecutiveDays = failureDays.size;
    }

    const criticalTenants = Object.values(tenantFailures)
      .filter((tf) => tf.consecutiveDays >= 3)
      .map((tf) => ({
        tenantId: tf.tenant.id,
        tenantName: tf.tenant.name,
        tenantEmail: tf.tenant.email,
        failures: tf.failures,
        consecutiveDays: tf.consecutiveDays,
        lastFailure: tf.lastFailure,
      }));

    return { criticalTenants };
  }

  async getBackupLogs(
    tenantId?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const where: any = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.generatedAt = {};
      if (startDate) {
        where.generatedAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.generatedAt.lte = end;
      }
    }

    const [backupLogs, total] = await Promise.all([
      this.prisma.backupLog.findMany({
        where,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { generatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.backupLog.count({ where }),
    ]);

    return {
      data: backupLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async regenerateBackup(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return { success: false, error: "Tenant not found" };
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [orders, transactions, products] = await Promise.all([
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
            createdAt: { gte: today, lt: tomorrow },
            status: "COMPLETED",
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
        .slice(0, 10);
      const outOfStock = products.filter((p) => p.stock === 0).length;

      const storageDir = path.join(
        process.cwd(),
        "storage",
        "backups",
        tenantId,
      );
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      const fileName = `backup-${tenantId}-${today.toISOString().split("T")[0]}.html`;
      const filePath = path.join(storageDir, fileName);

      const htmlContent = `
<!DOCTYPE html>
<html>
<head><title>Backup ${tenant.name}</title></head>
<body>
<h1>Laporan Harian ${tenant.name}</h1>
<p>Tanggal: ${today.toLocaleDateString("id-ID")}</p>
<h2>Penjualan</h2>
<p>Total Pendapatan: Rp ${totalRevenue.toLocaleString("id-ID")}</p>
<p>Total Pesanan: ${totalOrders}</p>
<p>Total Item: ${totalItems}</p>
<h2>Kas</h2>
<p>Cash In: Rp ${cashIn.toLocaleString("id-ID")}</p>
<h2>Stok</h2>
<p>Stok Rendah: ${lowStockProducts.length}</p>
<p>Habis: ${outOfStock}</p>
</body>
</html>`;

      fs.writeFileSync(filePath, htmlContent, "utf8");
      const fileSize = fs.statSync(filePath).size;

      const backupLog = await this.prisma.backupLog.create({
        data: {
          tenantId,
          status: "success",
          generatedAt: new Date(),
          emailSentAt: new Date(),
          size: fileSize,
          filePath,
        },
      });

      return {
        success: true,
        backupLogId: backupLog.id,
        filePath,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error",
      };
    }
  }

  async resendBackupEmail(backupLogId: string) {
    const backupLog = await this.prisma.backupLog.findUnique({
      where: { id: backupLogId },
      include: {
        tenant: true,
      },
    });

    if (!backupLog) {
      return { success: false, error: "Backup log not found" };
    }

    if (!fs.existsSync(backupLog.filePath)) {
      return { success: false, error: "Backup file not found" };
    }

    try {
      fs.readFileSync(backupLog.filePath, "utf8");

      // Email sending would be implemented here with actual email service
      // For now, just log the backup as sent

      await this.prisma.backupLog.update({
        where: { id: backupLogId },
        data: {
          status: "success",
          emailSentAt: new Date(),
          errorMessage: null,
        },
      });

      return { success: true };
    } catch (error: any) {
      await this.prisma.backupLog.update({
        where: { id: backupLogId },
        data: {
          status: "email_failed",
          errorMessage: error.message,
        },
      });

      return { success: false, error: error.message };
    }
  }

  async getBackupFile(backupId: string) {
    const backupLog = await this.prisma.backupLog.findUnique({
      where: { id: backupId },
    });

    if (!backupLog) {
      return null;
    }

    if (!fs.existsSync(backupLog.filePath)) {
      return null;
    }

    const content = fs.readFileSync(backupLog.filePath, "utf8");
    const fileName = path.basename(backupLog.filePath);

    return { content, fileName };
  }
}
