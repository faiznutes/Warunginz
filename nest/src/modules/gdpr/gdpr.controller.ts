import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("gdpr")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
export class GdprController {
  @Get("export")
  async exportData(@TenantId() tenantId: string) {
    return { data: {}, tenantId, exportedAt: new Date() };
  }

  @Get("export-tenant")
  async exportTenantData(@TenantId() tenantId: string) {
    return { data: {}, tenantId, exportedAt: new Date() };
  }

  @Post("delete")
  async deleteData(@Body() _data: any, @TenantId() _tenantId: string) {
    return { success: true, message: "Data deletion request submitted" };
  }
}
