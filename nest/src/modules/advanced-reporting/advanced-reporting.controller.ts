import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { RequireTenantFeature } from "../../common/decorators/require-tenant-feature.decorator";

@Controller("advanced-reporting")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
@Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
@RequireTenantFeature("BUSINESS_ANALYTICS")
export class AdvancedReportingController {
  @Get("templates")
  async getTemplates(@TenantId() _tenantId: string) {
    return { data: [], total: 0 };
  }

  @Get("scheduled")
  async getScheduled(@TenantId() _tenantId: string) {
    return { data: [], total: 0 };
  }

  @Get("dashboard-settings")
  async getDashboardSettings(@TenantId() _tenantId: string) {
    return { widgets: [], layout: "default" };
  }

  @Post("scheduled")
  async createScheduled(@Body() data: any, @TenantId() _tenantId: string) {
    return { success: true, id: "stub-scheduled-id", ...data };
  }

  @Put("scheduled/:id")
  async updateScheduled(@Param("id") id: string, @Body() data: any) {
    return { success: true, id, ...data };
  }

  @Delete("scheduled/:id")
  async deleteScheduled(@Param("id") id: string) {
    return { success: true, message: `Scheduled report ${id} deleted` };
  }

  @Post("templates")
  async createTemplate(@Body() data: any, @TenantId() _tenantId: string) {
    return { success: true, id: "stub-template-id", ...data };
  }

  @Put("templates/:id")
  async updateTemplate(@Param("id") id: string, @Body() data: any) {
    return { success: true, id, ...data };
  }

  @Post("generate")
  async generateReport(@Body() _data: any, @TenantId() _tenantId: string) {
    return { success: true, reportId: "stub-report-id", data: {} };
  }

  @Put("dashboard-settings")
  async updateDashboardSettings(
    @Body() data: any,
    @TenantId() _tenantId: string,
  ) {
    return { success: true, ...data };
  }
}
