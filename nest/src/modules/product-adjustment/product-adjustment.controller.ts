import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ProductAdjustmentService } from "./product-adjustment.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PassthroughInterceptor } from "../../common/interceptors/passthrough.interceptor";

@Controller("products/adjustments")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
@UseInterceptors(PassthroughInterceptor)
export class ProductAdjustmentController {
  constructor(
    private readonly productAdjustmentService: ProductAdjustmentService,
  ) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getAdjustments(
    @TenantId() tenantId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("productId") productId?: string,
    @Query("search") search?: string,
    @Query("type") type?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.productAdjustmentService.getAdjustments(tenantId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
      productId,
      search,
      type,
      startDate,
      endDate,
    });
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getAdjustmentById(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.productAdjustmentService.getAdjustmentById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async createAdjustment(
    @TenantId() tenantId: string,
    @CurrentUser("id") userId: string,
    @Body()
    body: {
      type: "INCREASE" | "DECREASE" | "TRANSFER";
      productId?: string;
      quantity?: number;
      reason: string;
      transferItems?: { productId: string; quantity: number }[];
    },
  ) {
    return this.productAdjustmentService.createAdjustment(
      body,
      tenantId,
      userId,
    );
  }
}
