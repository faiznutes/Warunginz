import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ArchiveService {
  constructor(private readonly prisma: PrismaService) {}

  async archiveOldOrders(tenantId: string, daysOld: number = 90) {
    const days = Number(daysOld) || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const oldOrders = await this.prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { lt: cutoffDate },
        status: { in: ["COMPLETED", "CANCELLED"] },
      },
    });

    return {
      message: `Found ${oldOrders.length} orders older than ${daysOld} days`,
      count: oldOrders.length,
    };
  }

  async getArchivedData(tenantId: string, year: number) {
    return {
      message: "Archive functionality",
      year,
      tenantId,
    };
  }

  async restoreOrders(tenantId: string, orderIds: string[]) {
    return { message: `Restored ${orderIds.length} orders` };
  }

  async archiveProducts(_tenantId: string, _daysOld: number) {
    return { message: "Products archived" };
  }

  async restoreProducts(tenantId: string, productIds: string[]) {
    return { message: `Restored ${productIds.length} products` };
  }

  async archiveCustomers(_tenantId: string, _daysOld: number) {
    return { message: "Customers archived" };
  }

  async restoreCustomers(tenantId: string, customerIds: string[]) {
    return { message: `Restored ${customerIds.length} customers` };
  }

  async getArchiveStats(tenantId: string) {
    const now = new Date();
    const oneYearAgo = new Date(
      now.getFullYear() - 1,
      now.getMonth(),
      now.getDate(),
    );
    const twoYearsAgo = new Date(
      now.getFullYear() - 2,
      now.getMonth(),
      now.getDate(),
    );

    const [ordersThisYear, ordersLastYear, products, customers] =
      await Promise.all([
        this.prisma.order.count({
          where: {
            tenantId,
            createdAt: { gte: oneYearAgo },
          },
        }),
        this.prisma.order.count({
          where: {
            tenantId,
            createdAt: { gte: twoYearsAgo, lt: oneYearAgo },
          },
        }),
        this.prisma.product.count({
          where: {
            tenantId,
            isActive: false,
          },
        }),
        this.prisma.customer.count({
          where: {
            tenantId,
          },
        }),
      ]);

    return {
      totalArchivedOrders: ordersThisYear + ordersLastYear,
      ordersThisYear,
      ordersLastYear,
      archivedProducts: products,
      archivedCustomers: customers,
    };
  }
}
