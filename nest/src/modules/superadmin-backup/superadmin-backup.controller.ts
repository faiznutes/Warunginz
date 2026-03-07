import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Res,
  HttpStatus,
} from "@nestjs/common";
import { SuperadminBackupService } from "./superadmin-backup.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Response } from "express";

@Controller("superadmin/backups")
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
export class SuperadminBackupController {
  constructor(
    private readonly superadminBackupService: SuperadminBackupService,
  ) {}

  @Get("critical")
  @Roles("SUPER_ADMIN")
  async getCriticalBackups() {
    return this.superadminBackupService.getCriticalBackups();
  }

  @Get()
  @Roles("SUPER_ADMIN")
  async getBackupLogs(
    @Query("tenantId") tenantId?: string,
    @Query("status") status?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.superadminBackupService.getBackupLogs(
      tenantId,
      status,
      startDate,
      endDate,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Post(":tenantId/regenerate")
  @Roles("SUPER_ADMIN")
  async regenerateBackup(@Param("tenantId") tenantId: string) {
    return this.superadminBackupService.regenerateBackup(tenantId);
  }

  @Post(":backupId/resend-email")
  @Roles("SUPER_ADMIN")
  async resendBackupEmail(@Param("backupId") backupId: string) {
    return this.superadminBackupService.resendBackupEmail(backupId);
  }

  @Get(":backupId/download")
  @Roles("SUPER_ADMIN")
  async downloadBackup(
    @Param("backupId") backupId: string,
    @Res() res: Response,
  ) {
    const result = await this.superadminBackupService.getBackupFile(backupId);
    if (!result) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Backup not found" });
    }

    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.fileName}"`,
    );
    return res.send(result.content);
  }

  @Get(":backupId/view")
  @Roles("SUPER_ADMIN")
  async viewBackup(@Param("backupId") backupId: string, @Res() res: Response) {
    const result = await this.superadminBackupService.getBackupFile(backupId);
    if (!result) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Backup not found" });
    }

    res.setHeader("Content-Type", "text/html");
    return res.send(result.content);
  }
}
