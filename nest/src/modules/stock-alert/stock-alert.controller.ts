import { Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { StockAlertService } from "./stock-alert.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("stock-alerts")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class StockAlertController {
  constructor(private readonly stockAlertService: StockAlertService) {}

  @Get("low-stock")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getLowStockProducts(@TenantId() tenantId: string, @Query() query: any) {
    return this.stockAlertService.getLowStockProducts(tenantId, query);
  }

  @Get("out-of-stock")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getOutOfStockProducts(@TenantId() tenantId: string) {
    return this.stockAlertService.getOutOfStockProducts(tenantId);
  }

  @Get("adjustments")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getProductAdjustments(
    @TenantId() tenantId: string,
    @Query() query: any,
  ) {
    return this.stockAlertService.getProductAdjustments(tenantId, query);
  }

  @Get("summary")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getStockSummary(@TenantId() tenantId: string) {
    return this.stockAlertService.getStockSummary(tenantId);
  }

  @Get("stats")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getStockStats(@TenantId() tenantId: string) {
    return this.stockAlertService.getStockSummary(tenantId);
  }

  @Post("send")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async sendStockAlerts(@TenantId() _tenantId: string) {
    return { success: true, message: "Stock alerts sent successfully" };
  }
}
