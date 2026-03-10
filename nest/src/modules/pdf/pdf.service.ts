import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PdfService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReceipt(orderId: string, tenantId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        transaction: true,
        customer: true,
        user: {
          select: { name: true },
        },
        tenant: true,
      },
    });

    if (!order || order.tenantId !== tenantId) {
      throw new NotFoundException("Order not found");
    }

    return {
      order: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
      },
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      customer: order.customer,
      tenant: {
        name: order.tenant.name,
        address: order.tenant.address,
      },
      total: order.total,
      discount: order.discount,
      paymentMethod: order.transaction?.paymentMethod,
    };
  }

  async generateReport(
    type: string,
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : now;

    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        createdAt: { gte: start, lte: end },
        status: "COMPLETED",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      type,
      period: { startDate, endDate },
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + Number(order.total), 0),
      orders,
    };
  }
}
