import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetOrdersDto } from "./dto/get-orders.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { parsePagination } from "../../common/utils/pagination.util";
import {
  StoreScopedUser,
  applyOutletScopeToWhere,
  getAllowedOutletIds,
} from "../../common/utils/store-scope.util";

const VALID_ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

const DELETABLE_ORDER_STATUSES = new Set(["CANCELLED", "REFUNDED"]);

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTenantId(tenantId: string | null | undefined): string {
    if (!tenantId) {
      throw new BadRequestException("Tenant ID is required");
    }
    return tenantId;
  }

  async getOrders(
    tenantId: string,
    query: GetOrdersDto,
    user?: StoreScopedUser,
  ) {
    this.validateTenantId(tenantId);

    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Record<string, unknown> = { tenantId };
    const allowedOutletIds = getAllowedOutletIds(user);

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.startDate || query.endDate) {
      const createdAt: Record<string, Date> = {};

      if (query.startDate) {
        const start = new Date(query.startDate);
        start.setHours(0, 0, 0, 0);
        createdAt.gte = start;
      }

      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        createdAt.lte = end;
      }

      where.createdAt = createdAt;
    }

    if (query.sendToKitchen !== undefined) {
      const normalizedSendToKitchen =
        query.sendToKitchen === "true" || query.sendToKitchen === "1";
      where.sendToKitchen = normalizedSendToKitchen;
    }

    if (query.kitchenStatus && query.kitchenStatus.length > 0) {
      where.kitchenStatus =
        query.kitchenStatus.length === 1
          ? query.kitchenStatus[0]
          : { in: query.kitchenStatus };
    }

    applyOutletScopeToWhere(where, allowedOutletIds, query.outletId);

    const safeSortBy =
      query.sortBy && ["createdAt", "total", "orderNumber"].includes(query.sortBy)
        ? query.sortBy
        : "createdAt";
    const safeSortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: safeSortOrder },
      }),
      this.prisma.order.count({ where: where as any }),
    ]);

    return {
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getOrderById(id: string, tenantId: string, user?: StoreScopedUser) {
    this.validateTenantId(tenantId);
    const where: Record<string, unknown> = { id, tenantId };
    const allowedOutletIds = getAllowedOutletIds(user);

    if (allowedOutletIds) {
      where.outletId =
        allowedOutletIds.length === 1
          ? allowedOutletIds[0]
          : { in: allowedOutletIds };
    }

    const order = await this.prisma.order.findFirst({
      where: where as any,
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  async createOrder(dto: any, tenantId: string, user?: StoreScopedUser) {
    this.validateTenantId(tenantId);
    const allowedOutletIds = getAllowedOutletIds(user);
    const requestedOutletId =
      typeof dto?.outletId === "string" ? dto.outletId : null;

    if (allowedOutletIds && requestedOutletId) {
      if (!allowedOutletIds.includes(requestedOutletId)) {
        throw new ForbiddenException("You are not allowed to create order here");
      }
    }

    const scopedOutletId = allowedOutletIds
      ? requestedOutletId || allowedOutletIds[0]
      : requestedOutletId;

    // Use atomic transaction to ensure idempotency check + order creation is atomic
    const order = await this.prisma.$transaction(async (tx) => {
      // Check idempotency key if provided to prevent duplicate orders
      // This check is now inside transaction to prevent race conditions
      if (dto.idempotencyKey) {
        const existingOrder = await tx.order.findFirst({
          where: { idempotencyKey: dto.idempotencyKey, tenantId },
        });
        if (existingOrder) {
          return existingOrder;
        }
      }

      // Create new order with idempotency key (unique constraint will prevent duplicates)
      const newOrder = await tx.order.create({
        data: {
          tenantId,
          total: dto.total || 0,
          ...(scopedOutletId ? { outletId: scopedOutletId } : {}),
          status: "PENDING",
          idempotencyKey: dto.idempotencyKey || null,
        } as any,
      });

      // If items provided, create them within the same transaction
      if (dto.items && dto.items.length > 0) {
        // Fetch current product prices for price snapshot
        const productIds = dto.items.map((item: any) => item.productId);
        const products = await tx.product.findMany({
          where: { id: { in: productIds }, tenantId },
          select: { id: true, price: true },
        });
        const productPriceMap = new Map(
          products.map((p) => [p.id, Number(p.price)]),
        );

        // Create order items with snapshot prices
        const orderItems = dto.items.map((item: any) => ({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: productPriceMap.get(item.productId) || item.price || 0,
          subtotal:
            (productPriceMap.get(item.productId) || item.price || 0) *
            item.quantity,
        }));

        await tx.orderItem.createMany({ data: orderItems });

        // Calculate total from items
        const total = orderItems.reduce(
          (sum: number, item: any) => sum + item.subtotal,
          0,
        );
        await tx.order.update({
          where: { id: newOrder.id },
          data: { total },
        });
      }

      return newOrder;
    });

    return order;
  }

  async updateOrder(id: string, dto: any, tenantId: string, user?: StoreScopedUser) {
    await this.getOrderById(id, tenantId, user);

    // Validate status if provided - prevent mass assignment
    if (dto.status && !VALID_ORDER_STATUSES.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status. Valid values: ${VALID_ORDER_STATUSES.join(", ")}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.notes && { notes: dto.notes }),
      } as any,
    });

    return updated;
  }

  async updateOrderStatus(
    id: string,
    dto: UpdateOrderStatusDto,
    tenantId: string,
    user?: StoreScopedUser,
  ) {
    await this.getOrderById(id, tenantId, user);

    // Validate status - prevent mass assignment
    if (!VALID_ORDER_STATUSES.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status. Valid values: ${VALID_ORDER_STATUSES.join(", ")}`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status as any },
    });

    return updated;
  }

  async getOrderStats(
    tenantId: string,
    startDate?: string,
    endDate?: string,
    user?: StoreScopedUser,
  ) {
    const where: Record<string, unknown> = { tenantId };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds);

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const [totalOrders, revenueData, completedOrders, pendingOrders] =
      await Promise.all([
        this.prisma.order.count({ where: where as any }),
        this.prisma.order.aggregate({
          where: { ...where, status: "COMPLETED" } as any,
          _sum: { total: true },
        }),
        this.prisma.order.count({ where: { ...where, status: "COMPLETED" } as any }),
        this.prisma.order.count({ where: { ...where, status: "PENDING" } as any }),
      ]);

    const totalRevenue = revenueData._sum.total
      ? Number(revenueData._sum.total)
      : 0;

    return {
      totalOrders,
      totalRevenue,
      completedOrders,
      pendingOrders,
      averageOrderValue:
        completedOrders > 0 ? totalRevenue / completedOrders : 0,
    };
  }

  async updateKitchenStatus(
    id: string,
    status: "PENDING" | "COOKING" | "READY" | "SERVED",
    tenantId: string,
    user?: StoreScopedUser,
  ) {
    const order = await this.getOrderById(id, tenantId, user);

    if (!order.sendToKitchen) {
      throw new BadRequestException("Order is not sent to kitchen");
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { kitchenStatus: status },
    });

    return updated;
  }

  async confirmOrder(id: string, tenantId: string, user?: StoreScopedUser) {
    const order = await this.getOrderById(id, tenantId, user);

    if (order.status !== "PENDING") {
      throw new BadRequestException("Only pending orders can be confirmed");
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    return updated;
  }

  async cancelOrder(id: string, tenantId: string, user?: StoreScopedUser) {
    const allowedOutletIds = getAllowedOutletIds(user);
    const where: Record<string, unknown> = { id, tenantId };

    if (allowedOutletIds) {
      where.outletId =
        allowedOutletIds.length === 1
          ? allowedOutletIds[0]
          : { in: allowedOutletIds };
    }

    // Use atomic transaction with proper tenant isolation
    const result = await this.prisma.$transaction(async (tx) => {
      // Fetch order with tenant isolation
      const order = await tx.order.findFirst({
        where: where as any,
      });

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      // Prevent double cancel - check if already cancelled
      if (order.status === "CANCELLED") {
        throw new BadRequestException("Order is already cancelled");
      }

      // Only PENDING and PROCESSING orders can be cancelled
      if (order.status !== "PENDING" && order.status !== "PROCESSING") {
        throw new BadRequestException(
          `Cannot cancel order with status: ${order.status}. Only PENDING or PROCESSING orders can be cancelled.`,
        );
      }

      // Fetch order items within the same transaction
      const orderItems = await tx.orderItem.findMany({
        where: { orderId: id },
      });

      // Restore stock for each item (if stock was decremented)
      // Only restore if order was not cancelled before
      for (const item of orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Update order status
      await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
      });

      return { message: "Order cancelled successfully", orderId: id };
    });

    return result;
  }

  async completeOrder(id: string, tenantId: string, user?: StoreScopedUser) {
    await this.getOrderById(id, tenantId, user);

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    return updated;
  }

  async addItems(
    id: string,
    items: any[],
    tenantId: string,
    user?: StoreScopedUser,
  ) {
    const allowedOutletIds = getAllowedOutletIds(user);
    const where: Record<string, unknown> = { id, tenantId };

    if (allowedOutletIds) {
      where.outletId =
        allowedOutletIds.length === 1
          ? allowedOutletIds[0]
          : { in: allowedOutletIds };
    }

    // Use atomic transaction to ensure items and total are updated together
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: where as any,
      });

      if (!order) {
        throw new NotFoundException("Order not found");
      }

      if (order.status !== "PENDING") {
        throw new BadRequestException("Can only add items to pending orders");
      }

      // Fetch current product prices to ensure price consistency
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, tenantId },
        select: { id: true, price: true },
      });

      const productPriceMap = new Map(
        products.map((p) => [p.id, Number(p.price)]),
      );

      // Create order items with current product prices (snapshot)
      const orderItems = await tx.orderItem.createMany({
        data: items.map((item) => {
          const currentPrice =
            productPriceMap.get(item.productId) || item.price;
          return {
            orderId: id,
            productId: item.productId,
            quantity: item.quantity,
            price: currentPrice,
            subtotal: currentPrice * item.quantity,
          };
        }),
      });

      const totalIncrease = items.reduce((sum, item) => {
        const currentPrice = productPriceMap.get(item.productId) || item.price;
        return sum + currentPrice * item.quantity;
      }, 0);

      await tx.order.update({
        where: { id },
        data: { total: { increment: totalIncrease } },
      });

      return { message: "Items added successfully", count: orderItems.count };
    });
  }

  async bulkUpdateKitchen(
    orderIds: string[],
    status: "PENDING" | "COOKING" | "READY" | "SERVED",
    tenantId: string,
    user?: StoreScopedUser,
  ) {
    const allowedOutletIds = getAllowedOutletIds(user);
    const where: Record<string, unknown> = {
      id: { in: orderIds },
      tenantId,
      sendToKitchen: true,
    };

    if (allowedOutletIds) {
      where.outletId =
        allowedOutletIds.length === 1
          ? allowedOutletIds[0]
          : { in: allowedOutletIds };
    }

    const orders = await this.prisma.order.findMany({
      where: where as any,
    });

    if (orders.length !== orderIds.length) {
      throw new BadRequestException(
        "Some orders not found or not sent to kitchen",
      );
    }

    await this.prisma.order.updateMany({
      where: where as any,
      data: { kitchenStatus: status },
    });

    return { message: "Kitchen status updated", count: orderIds.length };
  }

  async bulkRefund(orderIds: string[], tenantId: string, user?: StoreScopedUser) {
    const allowedOutletIds = getAllowedOutletIds(user);
    const where: Record<string, unknown> = {
      id: { in: orderIds },
      tenantId,
      status: "COMPLETED",
    };

    if (allowedOutletIds) {
      where.outletId =
        allowedOutletIds.length === 1
          ? allowedOutletIds[0]
          : { in: allowedOutletIds };
    }

    const orders = await this.prisma.order.findMany({
      where: where as any,
    });

    if (orders.length !== orderIds.length) {
      throw new BadRequestException(
        "Some orders not found or not eligible for refund",
      );
    }

    await this.prisma.order.updateMany({
      where: where as any,
      data: { status: "REFUNDED" as any },
    });

    return { message: "Orders refunded", count: orderIds.length };
  }

  async bulkDelete(orderIds: string[], tenantId: string, user?: StoreScopedUser) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new BadRequestException("orderIds must contain at least one order");
    }

    const uniqueOrderIds = Array.from(
      new Set(orderIds.filter((id) => typeof id === "string" && id.trim().length > 0)),
    );
    if (uniqueOrderIds.length === 0) {
      throw new BadRequestException("orderIds must contain at least one valid order ID");
    }

    const allowedOutletIds = getAllowedOutletIds(user);
    const where: Record<string, unknown> = {
      id: { in: uniqueOrderIds },
      tenantId,
    };

    if (allowedOutletIds) {
      where.outletId =
        allowedOutletIds.length === 1
          ? allowedOutletIds[0]
          : { in: allowedOutletIds };
    }

    const existingOrders = await this.prisma.order.findMany({
      where: where as any,
      select: { id: true, status: true },
    });

    if (existingOrders.length !== uniqueOrderIds.length) {
      throw new BadRequestException(
        "Some orders not found or out of scope for current user",
      );
    }

    const nonDeletable = existingOrders.filter(
      (order) => !DELETABLE_ORDER_STATUSES.has(order.status),
    );
    if (nonDeletable.length > 0) {
      throw new BadRequestException(
        "Only CANCELLED or REFUNDED orders can be deleted",
      );
    }

    const deleted = await this.prisma.order.deleteMany({
      where: where as any,
    });

    return { message: "Orders deleted successfully", count: deleted.count };
  }

  async deleteOrder(id: string, tenantId: string, user?: StoreScopedUser) {
    const order = await this.getOrderById(id, tenantId, user);

    if (!DELETABLE_ORDER_STATUSES.has(order.status)) {
      throw new BadRequestException(
        "Only CANCELLED or REFUNDED orders can be deleted",
      );
    }

    await this.prisma.order.delete({
      where: { id },
    });

    return { message: "Order deleted successfully" };
  }

  async searchOrders(tenantId: string, query: string, user?: StoreScopedUser) {
    const where: Record<string, unknown> = {
      tenantId,
      OR: [
        { id: { contains: query } },
        { orderNumber: { contains: query, mode: "insensitive" } },
      ],
    };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds);

    return this.prisma.order.findMany({
      where: where as any,
      take: 20,
    });
  }

  async getOrdersByStatus(
    tenantId: string,
    status: string,
    user?: StoreScopedUser,
  ) {
    const where: Record<string, unknown> = { tenantId, status: status as any };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds);

    return this.prisma.order.findMany({
      where: where as any,
      take: 50,
    });
  }

  async batchUpdateStatus(
    tenantId: string,
    orderIds: string[],
    status: string,
    user?: StoreScopedUser,
  ) {
    const where: Record<string, unknown> = {
      id: { in: orderIds },
      tenantId,
    };
    const allowedOutletIds = getAllowedOutletIds(user);

    if (allowedOutletIds) {
      where.outletId =
        allowedOutletIds.length === 1
          ? allowedOutletIds[0]
          : { in: allowedOutletIds };
    }

    await this.prisma.order.updateMany({
      where: where as any,
      data: { status: status as any },
    });

    return { message: "Orders updated", count: orderIds.length };
  }
}
