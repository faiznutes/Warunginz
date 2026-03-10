import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { REQUIRED_TENANT_FEATURES_KEY } from "../decorators/require-tenant-feature.decorator";
import {
  buildTenantEntitlements,
  hasTenantFeature,
  TenantFeatureCode,
} from "../utils/subscription-catalog.util";

/**
 * SubscriptionGuard keeps tenant activation strict, but treats expired plans
 * as a fallback to BASIC. Premium modules are enforced via RequireTenantFeature.
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if @Public() is applied
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role;
    const tenantId = request.tenantId || request.headers["x-tenant-id"];

    if (userRole === "SUPER_ADMIN") {
      return true;
    }

    // Require tenantId
    if (!tenantId) {
      throw new ForbiddenException("Tenant ID is required");
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        subscriptionEnd: true,
        subscriptionPlan: true,
        isActive: true,
        addons: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
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
      throw new ForbiddenException("Tenant not found");
    }

    if (!tenant.isActive) {
      throw new ForbiddenException("Tenant is inactive");
    }

    const now = new Date();
    const entitlements = buildTenantEntitlements(tenant, tenant.addons, now);
    request.subscriptionContext = {
      tenantId: tenant.id,
      currentPlan: entitlements.currentPlan,
      effectivePlan: entitlements.effectivePlan,
      subscriptionExpired: entitlements.subscriptionExpired,
      features: entitlements.features,
      limits: entitlements.limits,
    };

    const requiredFeatures =
      this.reflector.getAllAndOverride<TenantFeatureCode[]>(
        REQUIRED_TENANT_FEATURES_KEY,
        [context.getHandler(), context.getClass()],
      ) || [];

    if (!requiredFeatures.length) {
      return true;
    }

    const missingFeature = requiredFeatures.find(
      (feature) =>
        !hasTenantFeature(
          feature,
          entitlements.effectivePlan,
          entitlements.activeAddons,
          now,
        ),
    );

    if (missingFeature) {
      throw new ForbiddenException(
        `Feature ${missingFeature} is not available on the current tenant plan`,
      );
    }

    return true;
  }
}
