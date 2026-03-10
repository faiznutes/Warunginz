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
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { CustomersService } from "./customers.service";
import { GetCustomersDto } from "./dto/get-customers.dto";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("customers")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getCustomers(
    @TenantId() tenantId: string,
    @Query() query: GetCustomersDto,
  ) {
    return this.customersService.getCustomers(tenantId, query);
  }

  @Get(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getCustomerById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.customersService.getCustomerById(id, tenantId);
  }

  @Get(":id([0-9a-fA-F-]{36})/orders")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getCustomerOrders(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
  ) {
    return this.customersService.getCustomerOrders(id, tenantId, page, limit);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @TenantId() tenantId: string,
    @Res() res: Response,
  ) {
    const customer = await this.customersService.createCustomer(
      createCustomerDto,
      tenantId,
    );
    res.status(201).json(customer);
  }

  @Put(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async updateCustomer(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @TenantId() tenantId: string,
  ) {
    return this.customersService.updateCustomer(
      id,
      updateCustomerDto,
      tenantId,
    );
  }

  @Delete(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async deleteCustomer(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Res() res: Response,
  ) {
    await this.customersService.deleteCustomer(id, tenantId);
    res.status(204).send();
  }

  @Post(":id([0-9a-fA-F-]{36})/loyalty-points")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async addLoyaltyPoints(
    @Param("id") id: string,
    @Body("points") points: number,
    @TenantId() tenantId: string,
  ) {
    return this.customersService.addLoyaltyPoints(id, tenantId, points);
  }

  @Post(":id([0-9a-fA-F-]{36})/activate")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async activateCustomer(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.customersService.activateCustomer(id, tenantId);
  }

  @Post(":id([0-9a-fA-F-]{36})/deactivate")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deactivateCustomer(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.customersService.deactivateCustomer(id, tenantId);
  }

  @Get("export")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async exportCustomers(@TenantId() tenantId: string) {
    return this.customersService.exportCustomers(tenantId);
  }

  @Get("stats")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getCustomerStats(@TenantId() tenantId: string) {
    return this.customersService.getCustomerStats(tenantId);
  }
}
