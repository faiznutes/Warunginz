import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { FinancialManagementService } from "./financial-management.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("financial-management")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class FinancialManagementController {
  constructor(
    private readonly financialManagementService: FinancialManagementService,
  ) {}

  @Get("cash-flow/summary")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getCashFlowSummary(
    @TenantId() tenantId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.financialManagementService.getCashFlowSummary(
      tenantId,
      startDate,
      endDate,
    );
  }

  @Get("expenses/by-category")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getExpensesByCategory(
    @TenantId() tenantId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.financialManagementService.getExpensesByCategory(
      tenantId,
      startDate,
      endDate,
    );
  }

  @Post("tax/calculate")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async calculateTax(
    @TenantId() tenantId: string,
    @Body("period") period: string,
  ) {
    return this.financialManagementService.calculateTax(tenantId, period);
  }

  @Get("forecast")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getForecast(
    @TenantId() tenantId: string,
    @Query("months") months?: string,
  ) {
    return this.financialManagementService.getForecast(
      tenantId,
      months ? parseInt(months) : 6,
    );
  }

  @Post("cash-flow")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async createCashFlow(
    @TenantId() tenantId: string,
    @Body()
    body: {
      type: string;
      category?: string;
      amount: number;
      description: string;
      date?: string;
      paymentMethod?: string;
      reference?: string;
    },
  ) {
    return this.financialManagementService.createCashFlow(tenantId, body);
  }

  @Post("expenses")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async createExpense(
    @TenantId() tenantId: string,
    @Body()
    body: {
      category: string;
      amount: number;
      description: string;
      date?: string;
      vendor?: string;
      isTaxDeductible?: boolean;
    },
  ) {
    return this.financialManagementService.createExpense(tenantId, body);
  }

  @Post("bank-reconciliation")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async createBankReconciliation(
    @TenantId() tenantId: string,
    @Body()
    body: {
      bankAccount: string;
      statementDate?: string;
      statementBalance: number;
      transactions?: any[];
    },
  ) {
    return this.financialManagementService.createBankReconciliation(
      tenantId,
      body,
    );
  }
}
