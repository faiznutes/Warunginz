import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

/**
 * SubscriptionGuard checks if tenant subscription is active
 * Blocks access to protected features (POS, Kitchen, Orders, Products, etc.) if subscription is expired
 * SUPER_ADMIN and ADMIN_TENANT are always allowed
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

    // Skip check for SUPER_ADMIN and ADMIN_TENANT (they can manage subscriptions)
    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN_TENANT") {
      return true;
    }

    // Require tenantId
    if (!tenantId) {
      throw new ForbiddenException("Tenant ID is required");
    }

    // Check subscription status
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionEnd: true,
        subscriptionPlan: true,
        isActive: true,
      },
    });

    if (!tenant) {
      throw new ForbiddenException("Tenant not found");
    }

    if (!tenant.isActive) {
      throw new ForbiddenException("Tenant is inactive");
    }

    // Check if subscription is still valid
    const now = new Date();
    if (tenant.subscriptionEnd && tenant.subscriptionEnd < now) {
      throw new ForbiddenException(
        "Tenant subscription has expired. Please renew your subscription.",
      );
    }

    return true;
  }
}
