import { Controller, Get, Post, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("marketing")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class MarketingController {
  @Get("campaigns")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getCampaigns(@TenantId() _tenantId: string) {
    return { data: [], total: 0 };
  }

  @Post("campaigns")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createCampaign(@Body() data: any, @TenantId() _tenantId: string) {
    return { success: true, id: "stub-campaign-id", ...data };
  }

  @Post("campaigns/:id/send")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async sendCampaign(@Param("id") id: string) {
    return { success: true, message: `Campaign ${id} sent` };
  }

  @Post("campaigns/send-sms")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async sendSms(@Body() _data: any) {
    return { success: true, message: "SMS sent" };
  }

  @Post("campaigns/send-email")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async sendEmail(@Body() _data: any) {
    return { success: true, message: "Email sent" };
  }

  @Post("promos")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async createPromo(@Body() data: any) {
    return { success: true, id: "stub-promo-id", ...data };
  }
}
