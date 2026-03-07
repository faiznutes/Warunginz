import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Post,
  Param,
} from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { UpdateSettingsDto } from "./dto/settings.dto";

@Controller("settings")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles("ADMIN_TENANT", "SUPER_ADMIN", "SUPERVISOR")
  async getSettings(@TenantId() tenantId: string) {
    return this.settingsService.getSettings(tenantId);
  }

  @Put()
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async updateSettings(
    @TenantId() tenantId: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(tenantId, updateSettingsDto);
  }

  @Post("feature-toggles/:featureName")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async updateFeatureToggle(
    @TenantId() tenantId: string,
    @Param("featureName") featureName: string,
    @Body() body: { enabled: boolean },
  ) {
    return this.settingsService.updateFeatureToggle(
      tenantId,
      featureName,
      body.enabled,
    );
  }

  @Get("theme")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN", "SUPERVISOR")
  async getTheme(@TenantId() tenantId: string) {
    return this.settingsService.getTheme(tenantId);
  }

  @Put("theme")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async updateTheme(@TenantId() tenantId: string, @Body() body: any) {
    return this.settingsService.updateTheme(tenantId, body);
  }

  @Get("notifications")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN", "SUPERVISOR")
  async getNotificationSettings(@TenantId() tenantId: string) {
    return this.settingsService.getNotificationSettings(tenantId);
  }

  @Put("notifications")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async updateNotificationSettings(
    @TenantId() tenantId: string,
    @Body() body: any,
  ) {
    return this.settingsService.updateNotificationSettings(tenantId, body);
  }

  @Get("system")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN", "SUPERVISOR")
  async getSystemSettings(@TenantId() tenantId: string) {
    return this.settingsService.getSettings(tenantId);
  }

  @Put("system")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async updateSystemSettings(
    @TenantId() tenantId: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(tenantId, updateSettingsDto);
  }
}
