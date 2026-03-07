import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
  UseInterceptors,
} from "@nestjs/common";
import { Response } from "express";
import { SubscriptionsService } from "./subscriptions.service";
import {
  GetSubscriptionsDto,
  UpgradeSubscriptionDto,
  AddAddonDto,
} from "./dto/subscription.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { PassthroughInterceptor } from "../../common/interceptors/passthrough.interceptor";

@Controller("subscriptions")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@UseInterceptors(PassthroughInterceptor)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get("plans")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getAvailablePlans() {
    return this.subscriptionsService.getAvailablePlans();
  }

  @Get("addons")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getAvailableAddons() {
    return this.subscriptionsService.getAvailableAddons();
  }

  @Get("current")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
  async getCurrentSubscription(@TenantId() tenantId: string) {
    return this.subscriptionsService.getCurrentSubscription(tenantId);
  }

  @Get("history")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getSubscriptionHistory(
    @TenantId() tenantId: string,
    @Query() query: GetSubscriptionsDto,
  ) {
    return this.subscriptionsService.getSubscriptionHistory(tenantId, query);
  }

  @Post("upgrade")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async upgradeSubscription(
    @TenantId() tenantId: string,
    @Body() upgradeData: UpgradeSubscriptionDto,
  ) {
    return this.subscriptionsService.upgradeSubscription(tenantId, upgradeData);
  }

  @Post("extend")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async extendSubscription(
    @TenantId() tenantId: string,
    @Body() body: { plan?: string; duration: number },
  ) {
    return this.subscriptionsService.extendSubscription(tenantId, body);
  }

  @Post("reduce")
  @Roles("SUPER_ADMIN")
  async reduceSubscription(
    @TenantId() tenantId: string,
    @Body() body: { duration: number },
  ) {
    return this.subscriptionsService.reduceSubscription(
      tenantId,
      body.duration,
    );
  }

  @Post("revert-temporary")
  @Roles("SUPER_ADMIN")
  async revertTemporarySubscriptions() {
    return this.subscriptionsService.revertTemporaryUpgrades();
  }

  @Put(":id")
  @Roles("SUPER_ADMIN")
  async updateSubscription(
    @Param("id") id: string,
    @Body()
    body: {
      plan?: string;
      amount?: number;
      status?: string;
      purchasedBy?: string;
    },
  ) {
    return this.subscriptionsService.updateSubscription(id, body);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN")
  async deleteSubscription(@Param("id") id: string, @Res() res: Response) {
    const result = await this.subscriptionsService.deleteSubscription(id);
    res.status(200).json(result);
  }

  @Post("bulk-delete")
  @Roles("SUPER_ADMIN")
  async bulkDeleteSubscriptions(@Body() body: { ids: string[] }) {
    return this.subscriptionsService.bulkDeleteSubscriptions(body.ids);
  }

  @Post("addons")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async addAddon(
    @TenantId() tenantId: string,
    @Body() addAddonData: AddAddonDto,
  ) {
    return this.subscriptionsService.addAddon(tenantId, addAddonData);
  }

  @Delete("addons/:addonId")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async removeAddon(
    @TenantId() tenantId: string,
    @Param("addonId") addonId: string,
    @Res() res: Response,
  ) {
    const result = await this.subscriptionsService.removeAddon(
      tenantId,
      addonId,
    );
    res.status(200).json(result);
  }
}
