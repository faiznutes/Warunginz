import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("rewards")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
export class RewardsController {
  @Get("balance")
  async getBalance(@TenantId() tenantId: string) {
    return { balance: 0, tenantId };
  }

  @Get("daily-limit")
  async getDailyLimit(@TenantId() _tenantId: string) {
    return { limit: 10, used: 0, remaining: 10 };
  }

  @Get("transactions")
  async getTransactions(@TenantId() _tenantId: string) {
    return { data: [], total: 0 };
  }

  @Get("config")
  async getConfig(@TenantId() _tenantId: string) {
    return {
      adsEnabled: false,
      redeemEnabled: false,
      pointsPerAd: 10,
      subscriptionRedeemCost: 1000,
      addonRedeemCost: 500,
    };
  }

  @Post("redeem/subscription")
  async redeemSubscription(@Body() _data: any, @TenantId() _tenantId: string) {
    return { success: false, message: "Insufficient reward points" };
  }

  @Post("redeem/addon")
  async redeemAddon(@Body() _data: any, @TenantId() _tenantId: string) {
    return { success: false, message: "Insufficient reward points" };
  }

  @Post("watch-ad")
  async watchAd(@TenantId() _tenantId: string) {
    return { success: true, pointsEarned: 0, newBalance: 0 };
  }
}
