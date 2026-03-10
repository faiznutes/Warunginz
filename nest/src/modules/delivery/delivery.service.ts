import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { UpdateDeliveryDto } from "./dto/update-delivery.dto";

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourierConfigs(tenantId: string) {
    return this.prisma.courierConfig.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getCourierConfigById(id: string, tenantId: string) {
    const config = await this.prisma.courierConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException("Courier config not found");
    }

    if (config.tenantId !== tenantId) {
      throw new ForbiddenException(
        "Unauthorized access to this courier config",
      );
    }

    return config;
  }

  async createCourierConfig(data: CreateDeliveryDto, tenantId: string) {
    const existing = await this.prisma.courierConfig.findFirst({
      where: {
        tenantId,
        courier: data.courier,
      },
    });

    if (existing) {
      throw new ForbiddenException(
        "Courier config already exists for this tenant",
      );
    }

    return this.prisma.courierConfig.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async updateCourierConfig(
    id: string,
    data: UpdateDeliveryDto,
    tenantId: string,
  ) {
    await this.getCourierConfigById(id, tenantId);

    return this.prisma.courierConfig.update({
      where: { id },
      data,
    });
  }

  async deleteCourierConfig(id: string, tenantId: string) {
    await this.getCourierConfigById(id, tenantId);

    await this.prisma.courierConfig.delete({
      where: { id },
    });

    return { message: "Courier config deleted successfully" };
  }

  async getDeliveryOrders(_tenantId: string) {
    return [];
  }

  async processDeliveryOrder(
    _orderId: string,
    _tenantId: string,
    _data: { trackingNumber?: string; courier?: string },
  ) {
    return { success: true, message: "Delivery processed" };
  }

  async createShipment(
    _data: { courier: string; orderId: string },
    _tenantId: string,
  ) {
    return { success: true, message: "Shipment created" };
  }

  async trackShipment(data: { trackingNumber: string; courier: string }) {
    return { status: "In Transit", trackingNumber: data.trackingNumber };
  }
}
