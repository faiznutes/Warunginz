import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { FinanceService } from "./finance.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("finance")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get("revenue")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getRevenueReport(
    @TenantId() tenantId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.financeService.getRevenueReport(tenantId, startDate, endDate);
  }

  @Get("profit")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getProfitReport(
    @TenantId() tenantId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.financeService.getProfitReport(tenantId, startDate, endDate);
  }

  @Get("cash-flow")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getCashFlow(
    @TenantId() tenantId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.financeService.getCashFlow(tenantId, startDate, endDate);
  }

  @Get("summary")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getSummary(
    @TenantId() tenantId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    const [revenue, profit] = await Promise.all([
      this.financeService.getRevenueReport(tenantId, startDate, endDate),
      this.financeService.getProfitReport(tenantId, startDate, endDate),
    ]);
    return { ...revenue, ...profit };
  }

  @Get("balance-sheet")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getBalanceSheet(
    @TenantId() tenantId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    const revenue = await this.financeService.getRevenueReport(tenantId, startDate, endDate);
    return {
      assets: { cash: revenue.totalRevenue, inventory: 0, total: revenue.totalRevenue },
      liabilities: { total: 0 },
      equity: { total: revenue.totalRevenue },
      period: { startDate, endDate },
    };
  }

  @Get("profit-loss")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getProfitLoss(
    @TenantId() tenantId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.financeService.getProfitReport(tenantId, startDate, endDate);
  }
}
