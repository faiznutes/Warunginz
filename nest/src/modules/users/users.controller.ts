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
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
} from "./dto/user.dto";

@Controller("users")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("ADMIN_TENANT", "SUPER_ADMIN", "SUPERVISOR")
  async getUsers(
    @TenantId() tenantId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new BadRequestException("Invalid pagination parameters");
    }

    return this.usersService.getUsers(tenantId, pageNum, limitNum);
  }

  @Get("export")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async exportUsers(@TenantId() tenantId: string) {
    return this.usersService.exportUsers(tenantId);
  }

  @Get("stats")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async getUserStats(@TenantId() tenantId: string) {
    return this.usersService.getUserStats(tenantId);
  }

  @Post()
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @TenantId() tenantId: string,
  ) {
    return this.usersService.createUser(createUserDto, tenantId);
  }

  @Post("reset-password")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async resetPassword(
    @Body() body: { email: string },
    @TenantId() tenantId: string,
  ) {
    return this.usersService.resetPassword(body.email, tenantId);
  }

  @Post(":id([0-9a-fA-F-]{36})/reset-password")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async resetUserPassword(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.usersService.resetUserPassword(id, tenantId);
  }

  @Get(":id([0-9a-fA-F-]{36})")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN", "SUPERVISOR")
  async getUserById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.usersService.getUserById(id, tenantId);
  }

  @Put(":id([0-9a-fA-F-]{36})")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async updateUser(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @TenantId() tenantId: string,
  ) {
    return this.usersService.updateUser(id, updateUserDto, tenantId);
  }

  @Delete(":id([0-9a-fA-F-]{36})")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async deleteUser(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.usersService.deleteUser(id, tenantId);
  }

  @Post(":id([0-9a-fA-F-]{36})/change-password")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async changePassword(
    @Param("id") id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @TenantId() tenantId: string,
  ) {
    return this.usersService.changePassword(id, changePasswordDto, tenantId);
  }

  @Post(":id([0-9a-fA-F-]{36})/activate")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async activateUser(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.usersService.activateUser(id, tenantId);
  }

  @Post(":id([0-9a-fA-F-]{36})/deactivate")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async deactivateUser(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.usersService.deactivateUser(id, tenantId);
  }
}
