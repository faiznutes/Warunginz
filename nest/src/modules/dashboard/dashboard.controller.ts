import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";
import { Request } from "express";

interface AuthRequest extends Request {
  user?: CurrentUserPayload;
  assignedStoreId?: string;
}

@Controller("dashboard")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getDashboardSummary(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.dashboardService.getDashboardSummary(tenantId, user);
  }

  @Get("recent-orders")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getRecentOrders(
    @TenantId() tenantId: string,
    @Query("limit") limit: number = 10,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.dashboardService.getRecentOrders(tenantId, limit, user);
  }

  @Get("top-products")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getTopProducts(
    @TenantId() tenantId: string,
    @Query("limit") limit: number = 10,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.dashboardService.getTopProducts(tenantId, limit, user);
  }

  @Get("stats")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
  async getDashboardStats(
    @TenantId() tenantId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("outletId") outletId?: string,
    @CurrentUser() user?: CurrentUserPayload,
    @Req() req?: AuthRequest,
  ) {
    try {
      const outletOverride =
        outletId || req?.assignedStoreId || req?.user?.assignedStoreId;

      return this.dashboardService.getDashboardStats(
        tenantId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        true,
        outletOverride,
        user,
      );
    } catch (error) {
      console.error("Dashboard stats error:", error);
      throw error;
    }
  }

  @Get("stats/cashier")
  @Roles("CASHIER")
  async getCashierStats(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: AuthRequest,
  ) {
    if (user?.role !== "CASHIER") {
      throw new ForbiddenException("Access denied. Cashier only.");
    }

    const assignedStoreId = req.assignedStoreId || user.assignedStoreId;
    return this.dashboardService.getCashierStats(
      tenantId,
      user.id,
      assignedStoreId,
      user,
    );
  }

  @Get("stats/kitchen")
  @Roles("KITCHEN")
  async getKitchenStats(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Req() req: AuthRequest,
  ) {
    if (user?.role !== "KITCHEN") {
      throw new ForbiddenException("Access denied. Kitchen only.");
    }

    const assignedStoreId = req.assignedStoreId || user.assignedStoreId;
    return this.dashboardService.getKitchenStats(tenantId, assignedStoreId, user);
  }
}
