import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { GetOrdersDto } from "./dto/get-orders.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { CheckoutOrderDto } from "./dto/checkout-order.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";

@Controller("orders")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
@Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getOrders(
    @TenantId() tenantId: string,
    @Query() query: GetOrdersDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.getOrders(tenantId, query, user);
  }

  @Get("stats/summary")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getOrderStats(
    @TenantId() tenantId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.ordersService.getOrderStats(tenantId, startDate, endDate, user);
  }

  @Get("export")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async exportOrders(
    @TenantId() tenantId: string,
    @Query() query: GetOrdersDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.getOrders(
      tenantId,
      { ...query, limit: 10000 } as any,
      user,
    );
  }

  @Get("search")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async searchOrders(
    @TenantId() tenantId: string,
    @Query("q") query: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.searchOrders(tenantId, query, user);
  }

  @Get("by-status")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getOrdersByStatus(
    @TenantId() tenantId: string,
    @Query("status") status: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.getOrdersByStatus(tenantId, status, user);
  }

  @Post("checkout")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async checkoutOrder(
    @TenantId() tenantId: string,
    @Body() dto: CheckoutOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.checkoutOrder(dto, tenantId, user);
  }

  @Get(":id")
  async getOrderById(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.getOrderById(id, tenantId, user);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async createOrder(
    @TenantId() tenantId: string,
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.createOrder(dto, tenantId, user);
  }

  @Put(":id/status")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
  async updateOrderStatus(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body("status") status: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      { status } as any,
      tenantId,
      user,
    );
  }

  @Put(":id/kitchen-status")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
  async updateKitchenStatus(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body("status") status: "PENDING" | "COOKING" | "READY" | "SERVED",
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.updateKitchenStatus(id, status, tenantId, user);
  }

  @Put(":id/confirm")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async confirmOrder(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.confirmOrder(id, tenantId, user);
  }

  @Put(":id/cancel")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async cancelOrder(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.cancelOrder(id, tenantId, user);
  }

  @Put(":id/complete")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async completeOrder(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.completeOrder(id, tenantId, user);
  }

  @Post(":id/items")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async addItems(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body("items") items: any[],
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.addItems(id, items, tenantId, user);
  }

  @Put("bulk-update-kitchen")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "KITCHEN")
  async bulkUpdateKitchen(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body()
    body: {
      orderIds: string[];
      status: "PENDING" | "COOKING" | "READY" | "SERVED";
    },
  ) {
    return this.ordersService.bulkUpdateKitchen(
      body.orderIds,
      body.status,
      tenantId,
      user,
    );
  }

  @Post("bulk-refund")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async bulkRefund(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { orderIds: string[] },
  ) {
    return this.ordersService.bulkRefund(body.orderIds, tenantId, user);
  }

  @Post("bulk-delete")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async bulkDelete(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { orderIds: string[] },
  ) {
    return this.ordersService.bulkDelete(body.orderIds, tenantId, user);
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async updateOrder(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @Body() dto: any,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.updateOrder(id, dto, tenantId, user);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async deleteOrder(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.deleteOrder(id, tenantId, user);
  }

  @Post("batch-status")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async batchUpdateStatus(
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() body: { orderIds: string[]; status: string },
  ) {
    return this.ordersService.batchUpdateStatus(
      tenantId,
      body.orderIds,
      body.status,
      user,
    );
  }
}
