import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import { TenantProfileService } from "./tenant-profile.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("tenant")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class TenantProfileController {
  constructor(private readonly tenantProfileService: TenantProfileService) {}

  @Get("profile")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
  async getProfile(@TenantId() tenantId: string) {
    return this.tenantProfileService.getProfile(tenantId);
  }

  @Put("profile")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updateProfile(@Body() data: any, @TenantId() tenantId: string) {
    return this.tenantProfileService.updateProfile(tenantId, data);
  }
}
