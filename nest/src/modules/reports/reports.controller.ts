import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import {
  GetDailySalesDto,
  GetProductSummaryDto,
  GetCustomerRevenueDto,
  GetShiftSummaryDto,
} from './dto/report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { TenantRequired } from '../../common/decorators/tenant-required.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard/summary')
  @Roles('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER')
  async getSummaryDashboard(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query('outletId') outletId?: string,
  ) {
    return this.reportsService.getSummaryDashboard(tenantId, user, outletId);
  }

  @Get('dashboard/revenue-trend')
  @Roles('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR')
  async getRevenueTrend(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reportsService.getRevenueTrend(tenantId, user);
  }

  @Get('daily-sales')
  @Roles('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER')
  async getDailySales(
    @TenantId() tenantId: string,
    @Query() query: GetDailySalesDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reportsService.getDailySales(tenantId, query, user);
  }

  @Get('products/summary')
  @Roles('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR')
  async getProductSummary(
    @TenantId() tenantId: string,
    @Query() query: GetProductSummaryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reportsService.getProductSummary(tenantId, query, user);
  }

  @Get('customers/revenue')
  @Roles('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR')
  async getCustomerRevenue(
    @TenantId() tenantId: string,
    @Query() query: GetCustomerRevenueDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reportsService.getCustomerRevenue(tenantId, query, user);
  }

  @Get('shifts/summary')
  @Roles('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR')
  async getShiftSummary(
    @TenantId() tenantId: string,
    @Query() query: GetShiftSummaryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reportsService.getShiftSummary(tenantId, query, user);
  }

  @Post('export')
  @Roles('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR')
  async exportReport(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query('type') reportType: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const reportTypes: any = {
      'daily-sales': () =>
        this.reportsService.getDailySales(tenantId, {
          startDate,
          endDate,
          page: 1,
          limit: 365, // Full year max
        }, user),
      'product-summary': () =>
        this.reportsService.getProductSummary(tenantId, {
          startDate,
          endDate,
          sortBy: 'revenue',
          limit: 500,
        }, user),
      'customer-revenue': () =>
        this.reportsService.getCustomerRevenue(tenantId, {
          startDate,
          endDate,
          sortBy: 'total',
          limit: 500,
        }, user),
      'shift-summary': () =>
        this.reportsService.getShiftSummary(tenantId, {
          startDate,
          endDate,
          page: 1,
          limit: 500,
        }, user),
    };

    if (!reportTypes[reportType]) {
      return res?.status(400).json({ message: 'Invalid report type' });
    }

    const data = await reportTypes[reportType]();

    // Return as JSON for now (CSV export can be added later)
    res?.setHeader('Content-Type', 'application/json');
    res?.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${reportType}-${Date.now()}.json"`,
    );
    res?.json(data);
  }

  @Get('tenant')
  @Roles('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER')
  async getTenantReport(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reportsService.getSummaryDashboard(tenantId, user);
  }

  @Get('global')
  @Roles('SUPER_ADMIN')
  @TenantRequired(false)
  async getGlobalReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return {
      data: await this.reportsService.getGlobalReport(startDate, endDate),
    };
  }

  @Get('multi')
  @Roles('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR')
  async getMultiStoreReport(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.reportsService.getSummaryDashboard(tenantId, user);
  }
}

