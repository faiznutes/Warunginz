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
import { DiscountService } from "./discount.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("discounts")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getDiscounts(@TenantId() tenantId: string, @Query() query: any) {
    return this.discountService.getDiscounts(tenantId, query);
  }

  @Get("active")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getActiveDiscounts(@TenantId() tenantId: string) {
    return this.discountService.getActiveDiscounts(tenantId);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getDiscountById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.discountService.getDiscountById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createDiscount(
    @Body() createDiscountDto: CreateDiscountDto,
    @TenantId() tenantId: string,
  ) {
    return this.discountService.createDiscount(createDiscountDto, tenantId);
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updateDiscount(
    @Param("id") id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
    @TenantId() tenantId: string,
  ) {
    return this.discountService.updateDiscount(id, updateDiscountDto, tenantId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteDiscount(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.discountService.deleteDiscount(id, tenantId);
  }

  @Post(":id/toggle")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async toggleDiscount(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.discountService.toggleDiscount(id, tenantId);
  }

  @Get("stats")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getDiscountStats(@TenantId() tenantId: string) {
    return this.discountService.getDiscountStats(tenantId);
  }

  @Post("validate")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async validateDiscount(
    @TenantId() tenantId: string,
    @Body() body: { code: string; orderTotal: number },
  ) {
    return this.discountService.validateDiscount(
      tenantId,
      body.code,
      body.orderTotal,
    );
  }

  @Get("applicable")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getApplicableDiscounts(
    @TenantId() tenantId: string,
    @Query("orderTotal") orderTotal?: number,
  ) {
    return this.discountService.getApplicableDiscounts(tenantId, orderTotal);
  }
}
