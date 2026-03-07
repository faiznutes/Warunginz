import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  SetMetadata,
} from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantQueryDto,
} from "./dto/tenant.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  TenantGuard,
  TENANT_REQUIRED_KEY,
} from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";

@Controller("tenants")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles("SUPER_ADMIN")
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @SetMetadata(TENANT_REQUIRED_KEY, false)
  create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  findAll(@Query() query: TenantQueryDto) {
    return this.tenantsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.tenantsService.findOne(id);
  }

  @Public()
  @Get("slug/:slug")
  findBySlug(@Param("slug") slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Put(":id")
  update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.tenantsService.remove(id);
  }

  @Put(":id/subscription")
  updateSubscription(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: { plan: string; startDate: Date; endDate: Date },
  ) {
    return this.tenantsService.updateSubscription(
      id,
      body.plan,
      body.startDate,
      body.endDate,
    );
  }

  @Put(":id/upgrade-plan")
  upgradePlan(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: { subscriptionPlan: string; durationDays?: number },
  ) {
    return this.tenantsService.upgradePlan(
      id,
      body.subscriptionPlan,
      body.durationDays ?? 30,
    );
  }

  @Get(":id/users")
  getTenantUsers(@Param("id", ParseUUIDPipe) id: string) {
    return this.tenantsService.getTenantUsers(id);
  }

  @Get(":id/products")
  getTenantProducts(@Param("id", ParseUUIDPipe) id: string) {
    return this.tenantsService.getTenantProducts(id);
  }

  @Get(":id/orders")
  getTenantOrders(@Param("id", ParseUUIDPipe) id: string) {
    return this.tenantsService.getTenantOrders(id);
  }

  @Put(":id/status")
  updateTenantStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.tenantsService.updateTenantStatus(id, body.isActive);
  }

  @Post(":id/activate")
  activateTenant(@Param("id", ParseUUIDPipe) id: string) {
    return this.tenantsService.activateTenant(id);
  }

  @Post(":id/deactivate")
  deactivateTenant(@Param("id", ParseUUIDPipe) id: string) {
    return this.tenantsService.deactivateTenant(id);
  }

  @Post(":id/verify")
  @Roles("SUPER_ADMIN")
  async verifyTenant(@Param("id", ParseUUIDPipe) id: string) {
    return this.tenantsService.verifyTenant(id);
  }

  @Get("stats/overview")
  @Roles("SUPER_ADMIN")
  async getTenantStatsOverview() {
    return this.tenantsService.getTenantStatsOverview();
  }

  @Get(":id/usage")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getTenantUsage(@Param("id", ParseUUIDPipe) id: string) {
    return this.tenantsService.getTenantUsage(id);
  }

  @Post(":id/users")
  createTenantUser(
    @Param("id", ParseUUIDPipe) id: string,
    @Body()
    body: { name: string; email: string; password?: string; role?: string },
  ) {
    return this.tenantsService.createTenantUser(id, body);
  }

  @Post(":id/outlets")
  createTenantOutlet(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: { name: string; address?: string; phone?: string },
  ) {
    return this.tenantsService.createTenantOutlet(id, body);
  }
}
