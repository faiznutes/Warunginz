import { Controller, Get, Post, Param, Query, Body, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { RequireTenantFeature } from "../../common/decorators/require-tenant-feature.decorator";

@Controller("analytics")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
@RequireTenantFeature("BUSINESS_ANALYTICS")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("sales")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  getSalesAnalytics(
    @TenantId() tenantId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.analyticsService.getSalesAnalytics(
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get("products")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  getProductAnalytics(
    @TenantId() tenantId: string,
    @Query("limit") limit?: number,
  ) {
    return this.analyticsService.getProductAnalytics(tenantId, limit || 10);
  }

  @Get("customers")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  getCustomerAnalytics(@TenantId() tenantId: string) {
    return this.analyticsService.getCustomerAnalytics(tenantId);
  }

  @Get("dashboard")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  getDashboardSummary(@TenantId() tenantId: string) {
    return this.analyticsService.getDashboardSummary(tenantId);
  }

  @Get("predictions")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  getPredictions(
    @TenantId() tenantId: string,
    @Query("method") method?: string,
  ) {
    return this.analyticsService.getPredictions(
      tenantId,
      method || "moving_average",
    );
  }

  @Get("top-products")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  getTopProducts(@TenantId() tenantId: string, @Query("limit") limit?: number) {
    return this.analyticsService.getTopProducts(tenantId, limit || 10);
  }

  @Get("custom-reports")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  getCustomReports(@TenantId() tenantId: string) {
    return this.analyticsService.getCustomReports(tenantId);
  }

  @Post("custom-reports")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createCustomReport(@Body() data: any, @TenantId() _tenantId: string) {
    return { success: true, id: "stub-report-id", ...data };
  }

  @Get("custom-reports/:id/export")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async exportCustomReport(@Param("id") id: string, @TenantId() _tenantId: string) {
    return { success: true, id, data: [], format: "csv" };
  }

  @Get("revenue-by-hour")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  getRevenueByHour(@TenantId() tenantId: string, @Query("date") date?: string) {
    return this.analyticsService.getRevenueByHour(tenantId, date);
  }

  @Get("revenue-by-outlet")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  getRevenueByOutlet(@TenantId() tenantId: string) {
    return this.analyticsService.getRevenueByOutlet(tenantId);
  }

  @Get("revenue-by-payment-method")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  getRevenueByPaymentMethod(@TenantId() tenantId: string) {
    return this.analyticsService.getRevenueByPaymentMethod(tenantId);
  }
}
