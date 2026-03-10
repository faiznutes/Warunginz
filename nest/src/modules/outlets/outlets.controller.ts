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
import { OutletsService } from "./outlets.service";
import {
  CreateOutletDto,
  UpdateOutletDto,
  GetOutletsDto,
} from "./dto/outlet.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

@Controller("outlets")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class OutletsController {
  constructor(private readonly outletsService: OutletsService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getOutlets(
    @TenantId() tenantId: string,
    @Query() query: GetOutletsDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.outletsService.getOutlets(tenantId, query, user);
  }

  @Get(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
  async getOutletById(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.outletsService.getOutletById(id, tenantId, user);
  }

  @Get(":id([0-9a-fA-F-]{36})/stats")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getOutletStats(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.outletsService.getOutletStats(id, tenantId, user);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createOutlet(
    @Body() createOutletDto: CreateOutletDto,
    @TenantId() tenantId: string,
    @Res() res: Response,
  ) {
    const outlet = await this.outletsService.createOutlet(
      createOutletDto,
      tenantId,
    );
    res.status(201).json(outlet);
  }

  @Put(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async updateOutlet(
    @Param("id") id: string,
    @Body() updateOutletDto: UpdateOutletDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.outletsService.updateOutlet(id, updateOutletDto, tenantId, user);
  }

  @Delete(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteOutlet(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Res() res: Response,
  ) {
    await this.outletsService.deleteOutlet(id, tenantId, user);
    res.status(204).send();
  }

  @Post(":id([0-9a-fA-F-]{36})/toggle-status")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async toggleOutletStatus(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.outletsService.toggleOutletStatus(id, tenantId, user);
  }

  @Get(":id([0-9a-fA-F-]{36})/orders")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getOutletOrders(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.outletsService.getOutletOrders(id, tenantId, user);
  }

  @Get("active")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getActiveOutlets(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.outletsService.getActiveOutlets(tenantId, user);
  }
}
