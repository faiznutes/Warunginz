import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { DeliveryService } from "./delivery.service";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { UpdateDeliveryDto } from "./dto/update-delivery.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("delivery")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get("couriers")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getCourierConfigs(@TenantId() tenantId: string) {
    return this.deliveryService.getCourierConfigs(tenantId);
  }

  @Get("couriers/:id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getCourierConfigById(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.deliveryService.getCourierConfigById(id, tenantId);
  }

  @Post("couriers")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createCourierConfig(
    @Body() createDeliveryDto: CreateDeliveryDto,
    @TenantId() tenantId: string,
  ) {
    return this.deliveryService.createCourierConfig(
      createDeliveryDto,
      tenantId,
    );
  }

  @Put("couriers/:id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updateCourierConfig(
    @Param("id") id: string,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
    @TenantId() tenantId: string,
  ) {
    return this.deliveryService.updateCourierConfig(
      id,
      updateDeliveryDto,
      tenantId,
    );
  }

  @Delete("couriers/:id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteCourierConfig(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.deliveryService.deleteCourierConfig(id, tenantId);
  }

  @Get("orders")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getDeliveryOrders(@TenantId() tenantId: string) {
    return { data: await this.deliveryService.getDeliveryOrders(tenantId) };
  }

  @Post("orders/:orderId/process")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async processDeliveryOrder(
    @Param("orderId") orderId: string,
    @TenantId() tenantId: string,
    @Body() body: { trackingNumber?: string; courier?: string },
  ) {
    return this.deliveryService.processDeliveryOrder(orderId, tenantId, body);
  }

  @Post("shipments")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async createShipment(
    @Body() body: { courier: string; orderId: string },
    @TenantId() tenantId: string,
  ) {
    return this.deliveryService.createShipment(body, tenantId);
  }

  @Post("track")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async trackShipment(
    @Body() body: { trackingNumber: string; courier: string },
  ) {
    return this.deliveryService.trackShipment(body);
  }
}
