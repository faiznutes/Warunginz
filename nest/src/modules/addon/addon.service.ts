import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAddonDto } from "./dto/create-addon.dto";
import { UpdateAddonDto } from "./dto/update-addon.dto";
import { parsePagination } from "../../common/utils/pagination.util";
import {
  ADDON_CATALOG,
  buildTenantEntitlements,
  PLAN_LIMITS,
} from "../../common/utils/subscription-catalog.util";
@Injectable()
export class AddonService {
  constructor(private readonly prisma: PrismaService) {}

  async assertLimitAvailable(code: string, tenantId: string, resourceLabel: string) {
    const snapshot = await this.checkLimit(code, tenantId);
    if (snapshot.allowed) {
      return snapshot;
    }

    throw new BadRequestException(
      `${resourceLabel} limit reached (${snapshot.current}/${snapshot.limit}) for plan ${snapshot.plan}. Upgrade subscription or add the relevant addon first.`,
    );
  }

  private async resolveAddonRecord(idOrAddonId: string, tenantId: string) {
    const byId = await this.prisma.tenantAddon.findFirst({
      where: { id: idOrAddonId, tenantId },
    });

    if (byId) {
      return byId;
    }

    const byAddonId = await this.prisma.tenantAddon.findFirst({
      where: { addonId: idOrAddonId, tenantId },
      orderBy: { subscribedAt: "desc" },
    });

    return byAddonId;
  }

  async getAddons(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    let where: any = { tenantId };

    if (query.search) {
      where = {
        ...where,
        OR: [
          { addonName: { contains: query.search, mode: "insensitive" } },
          { addonType: { contains: query.search, mode: "insensitive" } },
        ],
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    const [addons, total] = await Promise.all([
      this.prisma.tenantAddon.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sortBy || "subscribedAt"]: query.sortOrder || "desc",
        },
      }),
      this.prisma.tenantAddon.count({ where }),
    ]);

    return {
      data: addons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAddonById(id: string, tenantId: string) {
    const addon = await this.resolveAddonRecord(id, tenantId);

    if (!addon) {
      throw new NotFoundException("Addon not found");
    }

    return addon;
  }

  async createAddon(data: CreateAddonDto, tenantId: string) {
    const expiresAtFromDuration =
      data.duration && data.duration > 0
        ? new Date(Date.now() + data.duration * 24 * 60 * 60 * 1000)
        : null;
    const resolvedExpiresAt = data.expiresAt
      ? new Date(data.expiresAt)
      : expiresAtFromDuration;

    const existing = await this.prisma.tenantAddon.findFirst({
      where: {
        tenantId,
        addonId: data.addonId,
        status: "ACTIVE",
      },
    });

    if (existing) {
      throw new BadRequestException("Addon already active for this tenant");
    }

    const inactive = await this.prisma.tenantAddon.findFirst({
      where: {
        tenantId,
        addonId: data.addonId,
        status: { not: "ACTIVE" },
      },
    });

    if (inactive) {
      const reactivated = await this.prisma.tenantAddon.update({
        where: { id: inactive.id },
        data: {
          status: data.status || "ACTIVE",
          subscribedAt: new Date(),
          limit: data.limit ?? inactive.limit,
          currentUsage: 0,
          expiresAt: resolvedExpiresAt,
          purchasedBy: data.purchasedBy || "SELF",
          config: data.config || inactive.config,
        },
      });
      return reactivated;
    }

    const addon = await this.prisma.tenantAddon.create({
      data: {
        tenantId,
        addonId: data.addonId,
        addonName: data.addonName,
        addonType: data.addonType,
        status: data.status || "ACTIVE",
        limit: data.limit ?? null,
        currentUsage: data.currentUsage || 0,
        expiresAt: resolvedExpiresAt,
        purchasedBy: data.purchasedBy || "SELF",
        config: data.config || null,
      },
    });

    return addon;
  }

  async updateAddon(id: string, data: UpdateAddonDto, tenantId: string) {
    const addon = await this.getAddonById(id, tenantId);

    const updated = await this.prisma.tenantAddon.update({
      where: { id: addon.id },
      data,
    });

    return updated;
  }

  async deleteAddon(id: string, tenantId: string) {
    const addon = await this.resolveAddonRecord(id, tenantId);

    if (!addon) {
      throw new NotFoundException("Addon not found");
    }

    await this.prisma.tenantAddon.update({
      where: { id: addon.id },
      data: { status: "INACTIVE" },
    });

    return { message: "Addon unsubscribed successfully" };
  }

  async getActiveAddons(tenantId: string) {
    return this.prisma.tenantAddon.findMany({
      where: { tenantId, status: "ACTIVE" },
    });
  }

  async toggleAddon(id: string, tenantId: string) {
    const addon = await this.getAddonById(id, tenantId);
    const newStatus = addon.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    return this.prisma.tenantAddon.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async getAvailableAddons() {
    return ADDON_CATALOG;
  }

  async checkLimit(code: string, tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        addons: {
          where: { status: "ACTIVE" },
          select: {
            addonId: true,
            addonType: true,
            status: true,
            expiresAt: true,
            limit: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    const entitlements = buildTenantEntitlements(tenant, tenant.addons);
    const plan = entitlements.effectivePlan;
    const baseLimits = PLAN_LIMITS[plan] || PLAN_LIMITS.BASIC;
    const activeAddons = entitlements.activeAddons;

    let baseLimit = 0;
    let current = 0;
    let addonBonus = 0;

    switch (code.toUpperCase()) {
      case "ADD_OUTLETS":
      case "OUTLETS": {
        baseLimit = baseLimits.outlets;
        const outletAddons = activeAddons.filter((a) => a.addonType === "ADD_OUTLETS");
        addonBonus = outletAddons.reduce((sum, a) => sum + (a.limit || 0), 0);
        current = await this.prisma.outlet.count({ where: { tenantId, isActive: true } });
        break;
      }
      case "ADD_USERS":
      case "USERS": {
        baseLimit = baseLimits.users;
        const userAddons = activeAddons.filter((a) => a.addonType === "ADD_USERS");
        addonBonus = userAddons.reduce((sum, a) => sum + (a.limit || 0), 0);
        current = await this.prisma.user.count({ where: { tenantId, isActive: true } });
        break;
      }
      case "ADD_PRODUCTS":
      case "PRODUCTS": {
        baseLimit = baseLimits.products;
        const productAddons = activeAddons.filter((a) => a.addonType === "ADD_PRODUCTS");
        addonBonus = productAddons.reduce((sum, a) => sum + (a.limit || 0), 0);
        current = await this.prisma.product.count({ where: { tenantId } });
        break;
      }
      default: {
        const matchingAddon = activeAddons.find(
          (a) => a.addonType === code.toUpperCase() || a.addonId === code,
        );
        if (matchingAddon) {
          return {
            allowed: true,
            current: matchingAddon.currentUsage || 0,
            limit: matchingAddon.limit || 999,
            addonActive: true,
          };
        }
        return { allowed: true, current: 0, limit: 999, addonActive: false };
      }
    }

    const totalLimit = baseLimit + addonBonus;
    return {
      allowed: current < totalLimit,
      current,
      limit: totalLimit,
      baseLimit,
      addonBonus,
      plan,
    };
  }

  async extendAddon(id: string, tenantId: string, duration: number) {
    const addon = await this.getAddonById(id, tenantId);

    const currentExpiry = addon.expiresAt ? new Date(addon.expiresAt) : new Date();
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiry = new Date(baseDate.getTime() + duration * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.tenantAddon.update({
      where: { id: addon.id },
      data: { expiresAt: newExpiry },
    });

    return {
      message: "Addon extended successfully",
      data: updated,
    };
  }
}
