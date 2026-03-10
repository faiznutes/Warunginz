import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from "@nestjs/common";
import { SessionService } from "./session.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("sessions")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getActiveSessions(
    @CurrentUser() user: any,
    @TenantId() tenantId: string,
  ) {
    return this.sessionService.getActiveSessions(user.id, tenantId);
  }

  @Delete(":sessionId")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async revokeSession(
    @Param("sessionId") sessionId: string,
    @CurrentUser() user: any,
  ) {
    return this.sessionService.revokeSession(user.id, sessionId);
  }

  @Delete()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async revokeAllSessions(
    @CurrentUser() user: any,
    @TenantId() tenantId: string,
  ) {
    return this.sessionService.revokeAllSessions(user.id, tenantId);
  }

  @Get("count")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getSessionCount(
    @CurrentUser() user: any,
    @TenantId() tenantId: string,
  ) {
    return this.sessionService.getSessionCount(user.id, tenantId);
  }

  @Delete("revoke-all")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async revokeAllSessionsAlias(
    @CurrentUser() user: any,
    @TenantId() tenantId: string,
  ) {
    return this.sessionService.revokeAllSessions(user.id, tenantId);
  }

  @Post("revoke-all")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async revokeAllSessionsPost(
    @CurrentUser() user: any,
    @TenantId() tenantId: string,
  ) {
    return this.sessionService.revokeAllSessions(user.id, tenantId);
  }
}
