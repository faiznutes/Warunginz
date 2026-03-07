import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { SupportService } from "./support.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("support")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get("tickets")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getTickets(@TenantId() tenantId: string) {
    return this.supportService.getTickets(tenantId);
  }

  @Post("tickets")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async createTicket(
    @Body() data: any,
    @TenantId() tenantId: string,
    @Request() req: any,
  ) {
    return this.supportService.createTicket(data, tenantId, req.user?.id);
  }

  @Put("tickets/:id/assign")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async assignTicket(@Param("id") id: string, @Body() data: any) {
    return this.supportService.assignTicket(id, data);
  }

  @Post("tickets/:id/notes")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async addNote(@Param("id") id: string, @Body() data: any) {
    return this.supportService.addNote(id, data);
  }

  @Post("tickets/:id/reply")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async replyTicket(@Param("id") id: string, @Body() data: any) {
    return this.supportService.replyTicket(id, data);
  }
}
