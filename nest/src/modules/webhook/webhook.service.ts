import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateWebhookDto } from "./dto/create-webhook.dto";
import { UpdateWebhookDto } from "./dto/update-webhook.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  async getWebhooks(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: any = { tenantId };

    const [webhooks, total] = await Promise.all([
      this.prisma.webhook.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
      }),
      this.prisma.webhook.count({ where }),
    ]);

    return {
      data: webhooks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWebhookById(id: string, tenantId: string) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id },
    });

    if (!webhook) {
      throw new NotFoundException("Webhook not found");
    }

    if (webhook.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this webhook");
    }

    return webhook;
  }

  async createWebhook(data: CreateWebhookDto, tenantId: string) {
    const webhook = await this.prisma.webhook.create({
      data: {
        ...data,
        tenantId,
      },
    });

    return webhook;
  }

  async updateWebhook(id: string, data: UpdateWebhookDto, tenantId: string) {
    await this.getWebhookById(id, tenantId);

    const updated = await this.prisma.webhook.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteWebhook(id: string, tenantId: string) {
    await this.getWebhookById(id, tenantId);

    await this.prisma.webhook.delete({
      where: { id },
    });

    return { message: "Webhook deleted successfully" };
  }

  async testWebhook(id: string, tenantId: string) {
    const webhook = await this.getWebhookById(id, tenantId);

    return {
      message: "Webhook test initiated",
      webhookId: webhook.id,
      url: webhook.url,
    };
  }

  async toggleWebhook(id: string, tenantId: string) {
    const webhook = await this.getWebhookById(id, tenantId);

    const updated = await this.prisma.webhook.update({
      where: { id },
      data: {
        isActive: !webhook.isActive,
      },
    });

    return {
      message: `Webhook ${updated.isActive ? "enabled" : "disabled"} successfully`,
      webhook: updated,
    };
  }

  async getWebhookEvents(_tenantId: string) {
    const events = [
      {
        id: "order.created",
        name: "Order Created",
        description: "Triggered when a new order is created",
      },
      {
        id: "order.updated",
        name: "Order Updated",
        description: "Triggered when an order is updated",
      },
      {
        id: "order.completed",
        name: "Order Completed",
        description: "Triggered when an order is completed",
      },
      {
        id: "order.cancelled",
        name: "Order Cancelled",
        description: "Triggered when an order is cancelled",
      },
      {
        id: "payment.success",
        name: "Payment Success",
        description: "Triggered when a payment is successful",
      },
      {
        id: "payment.failed",
        name: "Payment Failed",
        description: "Triggered when a payment fails",
      },
      {
        id: "product.low_stock",
        name: "Low Stock Alert",
        description: "Triggered when product stock is low",
      },
      {
        id: "product.out_of_stock",
        name: "Out of Stock",
        description: "Triggered when product is out of stock",
      },
      {
        id: "customer.created",
        name: "Customer Created",
        description: "Triggered when a new customer is added",
      },
      {
        id: "subscription.created",
        name: "Subscription Created",
        description: "Triggered when a subscription is created",
      },
      {
        id: "subscription.expired",
        name: "Subscription Expired",
        description: "Triggered when a subscription expires",
      },
    ];

    return events;
  }
}
