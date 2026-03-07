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
import { PurchaseOrderService } from "./purchase-order.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("purchase-orders")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getPurchaseOrders(@TenantId() tenantId: string, @Query() query: any) {
    return this.purchaseOrderService.getPurchaseOrders(tenantId, query);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getPurchaseOrderById(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.purchaseOrderService.getPurchaseOrderById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createPurchaseOrder(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.purchaseOrderService.createPurchaseOrder(
      createPurchaseOrderDto,
      tenantId,
      user.id,
    );
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updatePurchaseOrder(
    @Param("id") id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
    @TenantId() tenantId: string,
  ) {
    return this.purchaseOrderService.updatePurchaseOrder(
      id,
      updatePurchaseOrderDto,
      tenantId,
    );
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deletePurchaseOrder(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.purchaseOrderService.deletePurchaseOrder(id, tenantId);
  }

  @Post(":id/approve")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async approvePurchaseOrder(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.purchaseOrderService.approvePurchaseOrder(
      id,
      tenantId,
      user.id,
    );
  }

  @Post(":id/receive")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async receivePurchaseOrder(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() body: any,
  ) {
    return this.purchaseOrderService.receivePurchaseOrder(id, tenantId, body);
  }

  @Post(":id/cancel")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async cancelPurchaseOrder(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.purchaseOrderService.cancelPurchaseOrder(id, tenantId);
  }
}
