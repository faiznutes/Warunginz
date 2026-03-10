import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UpgradeSubscriptionDto } from "./dto/subscription.dto";
import {
  ADDON_CATALOG,
  buildTenantEntitlements,
  PLAN_CATALOG,
} from "../../common/utils/subscription-catalog.util";
@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentSubscription(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        addons: { where: { status: "ACTIVE" } },
        subscriptions: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    const entitlements = buildTenantEntitlements(tenant, tenant.addons);
    const currentPlanDetails =
      PLAN_CATALOG.find((p) => p.id === entitlements.currentPlan) || PLAN_CATALOG[0];
    const effectivePlanDetails =
      PLAN_CATALOG.find((p) => p.id === entitlements.effectivePlan) || PLAN_CATALOG[0];

    return {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        isActive: tenant.isActive,
      },
      currentPlan: entitlements.currentPlan,
      effectivePlan: entitlements.effectivePlan,
      currentPlanDetails,
      planDetails: effectivePlanDetails,
      subscriptionStart: tenant.subscriptionStart,
      subscriptionEnd: tenant.subscriptionEnd,
      subscriptionExpired: entitlements.subscriptionExpired,
      isActive: tenant.isActive,
      entitlements: entitlements.features,
      limits: entitlements.limits,
      activeAddons: entitlements.activeAddons,
      latestSubscription: tenant.subscriptions[0] || null,
    };
  }

  async upgradeSubscription(tenantId: string, data: UpgradeSubscriptionDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    const newPlan = data.plan || data.newPlanId;
    if (!newPlan) {
      throw new BadRequestException("Plan is required");
    }

    const planInfo = PLAN_CATALOG.find((p) => p.id === newPlan);
    if (!planInfo) {
      throw new BadRequestException(`Invalid plan: ${newPlan}`);
    }

    const durationDays = data.duration || 30;
    const now = new Date();
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const [updated, subscription] = await this.prisma.$transaction([
      this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          previousPlan: tenant.subscriptionPlan,
          subscriptionPlan: newPlan,
          subscriptionStart: now,
          subscriptionEnd: endDate,
        },
      }),
      this.prisma.subscription.create({
        data: {
          tenantId,
          plan: newPlan,
          startDate: now,
          endDate,
          status: "ACTIVE",
          amount: planInfo.price * (durationDays / 30),
          purchasedBy: data.purchasedBy || "SELF",
        },
      }),
    ]);

    await this.prisma.subscriptionHistory.create({
      data: {
        tenantId,
        subscriptionId: subscription.id,
        planType: newPlan,
        startDate: now,
        endDate,
        price: planInfo.price * (durationDays / 30),
        durationDays,
        isTemporary: false,
        reverted: false,
      },
    }).catch(() => {});

    return {
      message: "Subscription upgraded successfully",
      data: {
        ...updated,
        subscription,
      },
    };
  }

  async extendSubscription(
    tenantId: string,
    data: { plan?: string; duration: number },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    const currentEnd = tenant.subscriptionEnd || new Date();
    const baseDate = new Date(currentEnd) > new Date() ? new Date(currentEnd) : new Date();
    const newEnd = new Date(
      baseDate.getTime() + data.duration * 24 * 60 * 60 * 1000,
    );

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(data.plan && { subscriptionPlan: data.plan }),
        subscriptionEnd: newEnd,
      },
    });

    await this.prisma.subscriptionHistory.create({
      data: {
        tenantId,
        planType: updated.subscriptionPlan || "BASIC",
        startDate: new Date(),
        endDate: newEnd,
        price: 0,
        durationDays: data.duration,
        isTemporary: false,
        reverted: false,
      },
    }).catch(() => {});

    return {
      message: "Subscription extended successfully",
      data: updated,
    };
  }

  async reduceSubscription(tenantId: string, duration: number) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant || !tenant.subscriptionEnd) {
      throw new NotFoundException("Tenant or subscription not found");
    }

    const currentEnd = new Date(tenant.subscriptionEnd);
    const newEnd = new Date(
      currentEnd.getTime() - duration * 24 * 60 * 60 * 1000,
    );

    if (newEnd < new Date()) {
      throw new BadRequestException(
        "Cannot reduce subscription end date to the past",
      );
    }

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionEnd: newEnd,
      },
    });

    return {
      message: "Subscription reduced successfully",
      data: updated,
    };
  }

  async revertTemporaryUpgrades() {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        temporaryUpgrade: true,
        subscriptionEnd: { lt: new Date() },
      },
    });

    let reverted = 0;
    let failed = 0;

    for (const tenant of tenants) {
      try {
        await this.prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            subscriptionPlan: tenant.previousPlan || "BASIC",
            temporaryUpgrade: false,
            previousPlan: null,
          },
        });
        reverted++;
      } catch (error) {
        failed++;
      }
    }

    return { reverted, failed };
  }

  async updateSubscription(
    subscriptionId: string,
    data: {
      plan?: string;
      amount?: number;
      status?: string;
      purchasedBy?: string;
    },
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        ...(data.plan && { plan: data.plan }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.status && { status: data.status }),
        ...(data.purchasedBy && { purchasedBy: data.purchasedBy }),
      },
    });

    if (data.plan || data.status === "CANCELLED") {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: subscription.tenantId },
      });
      if (tenant && data.plan) {
        await this.prisma.tenant.update({
          where: { id: subscription.tenantId },
          data: { subscriptionPlan: data.plan },
        });
      }
      if (data.status === "CANCELLED") {
        const otherActive = await this.prisma.subscription.findFirst({
          where: {
            tenantId: subscription.tenantId,
            id: { not: subscriptionId },
            status: "ACTIVE",
            endDate: { gte: new Date() },
          },
        });
        if (!otherActive) {
          await this.prisma.tenant.update({
            where: { id: subscription.tenantId },
            data: {
              subscriptionPlan: "BASIC",
              temporaryUpgrade: false,
              previousPlan: null,
            },
          });
        }
      }
    }

    return updated;
  }

  async deleteSubscription(subscriptionId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        tenant: {
          select: {
            id: true,
            subscriptionPlan: true,
            subscriptionEnd: true,
            subscriptionStart: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }

    const tenantId = subscription.tenantId;

    await this.prisma.subscription.delete({
      where: { id: subscriptionId },
    });

    const otherActiveSubscriptions = await this.prisma.subscription.findFirst({
      where: {
        tenantId: tenantId,
        id: { not: subscriptionId },
        status: "ACTIVE",
        endDate: { gte: new Date() },
      },
    });

    if (!otherActiveSubscriptions) {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionPlan: "BASIC",
          temporaryUpgrade: false,
          previousPlan: null,
        },
      });
    }

    return { message: "Subscription deleted successfully" };
  }

  async bulkDeleteSubscriptions(ids: string[]) {
    const subscriptionsToDelete = await this.prisma.subscription.findMany({
      where: { id: { in: ids } },
      select: { id: true, tenantId: true },
    });

    const tenantIds = [
      ...new Set(subscriptionsToDelete.map((s) => s.tenantId)),
    ];

    const result = await this.prisma.subscription.deleteMany({
      where: { id: { in: ids } },
    });

    const now = new Date();

    for (const tenantId of tenantIds) {
      const otherActiveSubscriptions = await this.prisma.subscription.findFirst(
        {
          where: {
            tenantId: tenantId,
            id: { notIn: ids },
            status: "ACTIVE",
            endDate: { gte: now },
          },
        },
      );

      if (!otherActiveSubscriptions) {
        await this.prisma.tenant.update({
          where: { id: tenantId },
          data: {
            subscriptionPlan: "BASIC",
            temporaryUpgrade: false,
            previousPlan: null,
          },
        });
      }
    }

    return {
      message: `${result.count} subscription(s) deleted successfully`,
      deletedCount: result.count,
    };
  }

  async getAvailablePlans() {
    return PLAN_CATALOG;
  }

  async getAvailableAddons() {
    return ADDON_CATALOG;
  }

  async addAddon(tenantId: string, data: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    const existing = await this.prisma.tenantAddon.findFirst({
      where: { tenantId, addonId: data.addonId },
    });

    if (existing) {
      if (existing.status === "INACTIVE") {
        const reactivated = await this.prisma.tenantAddon.update({
          where: { id: existing.id },
          data: {
            status: "ACTIVE",
            subscribedAt: new Date(),
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            limit: data.limit || existing.limit,
            currentUsage: 0,
          },
        });
        return { message: "Addon reactivated successfully", data: reactivated };
      }
      throw new BadRequestException("Addon already active for this tenant");
    }

    const catalogItem = ADDON_CATALOG.find((a) => a.id === data.addonId);
    const catalogLimit =
      catalogItem && "limitPerUnit" in catalogItem ? catalogItem.limitPerUnit : null;

    const addon = await this.prisma.tenantAddon.create({
      data: {
        tenantId,
        addonId: data.addonId,
        addonName: data.addonName || catalogItem?.name || data.addonId,
        addonType: data.addonType || catalogItem?.type || "CUSTOM",
        status: "ACTIVE",
        limit: data.limit || catalogLimit || null,
        currentUsage: 0,
        purchasedBy: data.purchasedBy || "SELF",
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        config: data.config || null,
      },
    });

    return { message: "Addon added successfully", data: addon };
  }

  async removeAddon(tenantId: string, addonId: string) {
    const addon = await this.prisma.tenantAddon.findFirst({
      where: { tenantId, id: addonId },
    });

    if (!addon) {
      const byAddonId = await this.prisma.tenantAddon.findFirst({
        where: { tenantId, addonId: addonId },
      });
      if (!byAddonId) {
        throw new NotFoundException("Addon not found for this tenant");
      }
      await this.prisma.tenantAddon.update({
        where: { id: byAddonId.id },
        data: { status: "INACTIVE" },
      });
      return { message: "Addon removed successfully" };
    }

    await this.prisma.tenantAddon.update({
      where: { id: addon.id },
      data: { status: "INACTIVE" },
    });

    return { message: "Addon removed successfully" };
  }

  async getSubscriptionHistory(tenantId: string, _query?: any) {
    const subscriptions = await this.prisma.subscriptionHistory.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    return {
      data: subscriptions,
    };
  }
}
