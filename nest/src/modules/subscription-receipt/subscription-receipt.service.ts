import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SubscriptionReceiptService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubscriptionHistory(tenantId: string) {
    return this.prisma.subscriptionHistory.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSubscriptionById(id: string, tenantId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        history: true,
      },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    if (subscription.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this subscription");
    }

    return subscription;
  }

  async createSubscription(data: any, tenantId: string) {
    return this.prisma.subscription.create({
      data: {
        tenantId,
        plan: data.plan,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: "ACTIVE",
        amount: data.amount,
        purchasedBy: data.purchasedBy || "SELF",
      },
    });
  }

  async updateSubscription(id: string, data: any, tenantId: string) {
    await this.getSubscriptionById(id, tenantId);
    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }

  async renewSubscription(id: string, tenantId: string) {
    await this.getSubscriptionById(id, tenantId);
    return { message: "Subscription renewed" };
  }

  async deleteSubscription(id: string, tenantId: string) {
    await this.getSubscriptionById(id, tenantId);
    await this.prisma.subscription.delete({ where: { id } });
    return { message: "Subscription deleted" };
  }

  async getLatestSubscription(tenantId: string) {
    return this.prisma.subscription.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }
}
