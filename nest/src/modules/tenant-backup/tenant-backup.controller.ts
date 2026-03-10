import { Controller, Get, UseGuards } from "@nestjs/common";
import { TenantBackupService } from "./tenant-backup.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("tenant/backup")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class TenantBackupController {
  constructor(private readonly tenantBackupService: TenantBackupService) {}

  @Get("preview")
  @Roles("ADMIN_TENANT", "SUPERVISOR")
  async getBackupPreview(@TenantId() tenantId: string) {
    return this.tenantBackupService.getBackupPreview(tenantId);
  }

  @Get("latest")
  @Roles("ADMIN_TENANT", "SUPERVISOR")
  async getLatestBackup(@TenantId() tenantId: string) {
    return this.tenantBackupService.getLatestBackup(tenantId);
  }
}
