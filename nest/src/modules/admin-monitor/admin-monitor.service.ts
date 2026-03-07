import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminMonitorService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemHealth() {
    const [totalTenants, activeTenants, totalUsers, totalOrders] =
      await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.tenant.count({ where: { isActive: true } }),
        this.prisma.user.count(),
        this.prisma.order.count(),
      ]);

    return {
      status: "healthy",
      totalTenants,
      activeTenants,
      totalUsers,
      totalOrders,
      timestamp: new Date(),
    };
  }

  async getTenantStats() {
    const tenants = await this.prisma.tenant.findMany({
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            orders: true,
          },
        },
      },
    });

    return tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
      subscriptionPlan: tenant.subscriptionPlan,
      isActive: tenant.isActive,
      userCount: tenant._count.users,
      productCount: tenant._count.products,
      orderCount: tenant._count.orders,
    }));
  }

  async getDockerContainers() {
    return { containers: [] };
  }

  async restartContainer(name: string) {
    return { success: true, message: `Container ${name} restarted` };
  }

  async stopContainer(name: string) {
    return { success: true, message: `Container ${name} stopped` };
  }

  async getContainerLogs(_name: string) {
    return { logs: [] };
  }

  async getServerResources() {
    return { cpu: 0, memory: 0, disk: 0 };
  }

  async getDatabaseStats() {
    const prisma = this.prisma;
    const [tenantCount, userCount, orderCount] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.order.count(),
    ]);

    return { tenants: tenantCount, users: userCount, orders: orderCount };
  }
}
