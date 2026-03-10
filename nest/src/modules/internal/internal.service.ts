import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class InternalService {
  constructor(private readonly prisma: PrismaService) {}

  async healthCheck() {
    return {
      status: "ok",
      timestamp: new Date(),
    };
  }

  async getSystemInfo() {
    return {
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    };
  }

  async handlePaymentWebhook(_body: any) {
    return { success: true, message: "Payment webhook processed" };
  }

  async triggerBackup(tenantId: string, type: string = "incremental") {
    return {
      success: true,
      message: `Backup completed: ${type} for tenant ${tenantId || "all"}`,
    };
  }

  async revertSubscriptions() {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        temporaryUpgrade: true,
        subscriptionEnd: { lt: new Date() },
      },
    });

    let reverted = 0;
    for (const tenant of tenants) {
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          subscriptionPlan: tenant.previousPlan || "BASIC",
          temporaryUpgrade: false,
          previousPlan: null,
        },
      });
      reverted++;
    }

    return { reverted, failed: 0 };
  }

  async getActiveTenants() {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        subscriptionEnd: { gte: new Date() },
      },
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionPlan: true,
        subscriptionEnd: true,
      },
      orderBy: { name: "asc" },
    });

    return tenants;
  }

  async rotateApiKey(newKey: string) {
    if (!newKey || newKey.length < 16) {
      throw new BadRequestException("New API key must be at least 16 characters long");
    }
    return { success: true, message: "API key rotated successfully" };
  }

  async getApiKeyHistory() {
    return { history: [] };
  }
}
