import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { AdminMonitorService } from "../admin-monitor/admin-monitor.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import { AddonService } from "../addon/addon.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminMonitorService: AdminMonitorService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly addonService: AddonService,
  ) {}

  @Get("health")
  @Roles("SUPER_ADMIN")
  async getHealth() {
    return this.adminMonitorService.getSystemHealth();
  }

  @Get("server/resources")
  @Roles("SUPER_ADMIN")
  async getServerResources() {
    return this.adminMonitorService.getServerResources();
  }

  @Get("docker/containers")
  @Roles("SUPER_ADMIN")
  async getDockerContainers() {
    return this.adminMonitorService.getDockerContainers();
  }

  @Get("docker/logs/:name")
  @Roles("SUPER_ADMIN")
  async getDockerLogs(@Param("name") name: string) {
    return this.adminMonitorService.getContainerLogs(name);
  }

  @Post("docker/restart/:name")
  @Roles("SUPER_ADMIN")
  async restartContainer(@Param("name") name: string) {
    return this.adminMonitorService.restartContainer(name);
  }

  @Post("docker/stop/:name")
  @Roles("SUPER_ADMIN")
  async stopContainer(@Param("name") name: string) {
    return this.adminMonitorService.stopContainer(name);
  }

  @Get("logs/:type")
  @Roles("SUPER_ADMIN")
  async getLogs(@Param("type") type: string) {
    return { data: [], type, total: 0 };
  }

  @Get("subscriptions/:id")
  @Roles("SUPER_ADMIN")
  async getSubscription(@Param("id") id: string) {
    return this.subscriptionsService.getCurrentSubscription(id);
  }

  @Put("subscriptions/:id")
  @Roles("SUPER_ADMIN")
  async updateSubscription(@Param("id") id: string, @Body() data: any) {
    if (data.plan) {
      return this.subscriptionsService.upgradeSubscription(id, {
        plan: data.plan,
        duration: data.duration || 30,
        purchasedBy: "ADMIN",
      } as any);
    }
    if (data.duration && data.action === "extend") {
      return this.subscriptionsService.extendSubscription(id, {
        duration: data.duration,
      });
    }
    if (data.duration && data.action === "reduce") {
      return this.subscriptionsService.reduceSubscription(id, data.duration);
    }
    return this.subscriptionsService.upgradeSubscription(id, {
      plan: data.plan || "BASIC",
      duration: data.duration || 30,
      purchasedBy: "ADMIN",
    } as any);
  }

  @Delete("subscriptions/:id")
  @Roles("SUPER_ADMIN")
  async deleteSubscription(@Param("id") id: string) {
    const tenant = await this.subscriptionsService.getCurrentSubscription(id);
    if (tenant.latestSubscription) {
      return this.subscriptionsService.deleteSubscription(tenant.latestSubscription.id);
    }
    return { success: true, message: "No active subscription to delete" };
  }

  @Get("addons-purchase/:id")
  @Roles("SUPER_ADMIN")
  async getAddonPurchase(@Param("id") id: string) {
    const addons = await this.addonService.getActiveAddons(id);
    return { id, addons };
  }

  @Put("addons-purchase/:id")
  @Roles("SUPER_ADMIN")
  async updateAddonPurchase(@Param("id") id: string, @Body() data: any) {
    if (data.addonId) {
      return this.subscriptionsService.addAddon(id, {
        ...data,
        purchasedBy: "ADMIN",
      });
    }
    return { success: true, id, ...data };
  }

  @Delete("addons-purchase/:id")
  @Roles("SUPER_ADMIN")
  async deleteAddonPurchase(@Param("id") id: string, @Body() data?: any) {
    if (data?.addonId) {
      return this.subscriptionsService.removeAddon(id, data.addonId);
    }
    const addons = await this.addonService.getActiveAddons(id);
    for (const addon of addons) {
      await this.subscriptionsService.removeAddon(id, addon.id);
    }
    return { success: true, message: "All addons removed" };
  }
}
