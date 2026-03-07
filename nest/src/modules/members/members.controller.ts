import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { MembersService } from "./members.service";
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("members")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getMembers(@TenantId() tenantId: string, @Query() query: any) {
    return this.membersService.getMembers(tenantId, query);
  }

  @Get(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getMemberById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.membersService.getMemberById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async createMember(
    @Body() createMemberDto: CreateMemberDto,
    @TenantId() tenantId: string,
  ) {
    return this.membersService.createMember(createMemberDto, tenantId);
  }

  @Put(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async updateMember(
    @Param("id") id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @TenantId() tenantId: string,
  ) {
    return this.membersService.updateMember(id, updateMemberDto, tenantId);
  }

  @Delete(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteMember(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.membersService.deleteMember(id, tenantId);
  }

  @Post(":id([0-9a-fA-F-]{36})/loyalty-points")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async addLoyaltyPoints(
    @Param("id") id: string,
    @Body("points") points: number,
    @TenantId() tenantId: string,
  ) {
    return this.membersService.addLoyaltyPoints(id, tenantId, points);
  }

  @Get("stats")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getMemberStats(@TenantId() tenantId: string) {
    return this.membersService.getMemberStats(tenantId);
  }

  @Get("export")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async exportMembers(@TenantId() tenantId: string) {
    return this.membersService.exportMembers(tenantId);
  }

  @Post("bulk-import")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async bulkImportMembers(@TenantId() tenantId: string, @Body() body: any) {
    return this.membersService.bulkImportMembers(tenantId, body.members);
  }
}
