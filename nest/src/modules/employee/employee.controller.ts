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
import { EmployeeService } from "./employee.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("employees")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getEmployees(@TenantId() tenantId: string, @Query() query: any) {
    return this.employeeService.getEmployees(tenantId, query);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getEmployeeById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.employeeService.getEmployeeById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @TenantId() tenantId: string,
  ) {
    return this.employeeService.createEmployee(createEmployeeDto, tenantId);
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updateEmployee(
    @Param("id") id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @TenantId() tenantId: string,
  ) {
    return this.employeeService.updateEmployee(id, updateEmployeeDto, tenantId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteEmployee(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.employeeService.deleteEmployee(id, tenantId);
  }

  @Get("stats")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getEmployeeStats(@TenantId() tenantId: string) {
    return this.employeeService.getEmployeeStats(tenantId);
  }

  @Post(":id/activate")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async activateEmployee(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.employeeService.activateEmployee(id, tenantId);
  }

  @Post(":id/deactivate")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deactivateEmployee(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.employeeService.deactivateEmployee(id, tenantId);
  }

  @Get("export")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async exportEmployees(@TenantId() tenantId: string) {
    return this.employeeService.exportEmployees(tenantId);
  }
}
