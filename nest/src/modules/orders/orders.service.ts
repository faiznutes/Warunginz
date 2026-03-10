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
const VALID_PAYMENT_METHODS = new Set([
  "CASH",
  "QRIS",
  "CARD",
  "E_WALLET",
  "BANK_TRANSFER",
  "SHOPEEPAY",
  "DANA",
]);

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTenantId(tenantId: string | null | undefined): string {
    if (!tenantId) {
      throw new BadRequestException("Tenant ID is required");
    }
    return tenantId;
  }
  private normalizeMoney(value: unknown, fieldName: string): number {
    const normalized = Number(value ?? 0);
    if (!Number.isFinite(normalized) || normalized < 0) {
      throw new BadRequestException(`${fieldName} must be a valid positive number`);
    }
    return Number(normalized.toFixed(2));
  }

  private normalizeOptionalString(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizePaymentMethod(value: unknown): string {
    if (typeof value !== "string") {
      throw new BadRequestException("Payment method is required");
    }

    const normalized = value.trim().toUpperCase();
    if (!VALID_PAYMENT_METHODS.has(normalized)) {
      throw new BadRequestException("Unsupported payment method");
    }

    return normalized;
  }

  private generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  private async resolveScopedOutletId(
    tx: any,
    tenantId: string,
    requestedOutletId: string | null,
    user?: StoreScopedUser,
  ): Promise<string | null> {
    const allowedOutletIds = getAllowedOutletIds(user);

    if (allowedOutletIds && requestedOutletId && !allowedOutletIds.includes(requestedOutletId)) {
      throw new ForbiddenException("You are not allowed to create order here");
    }

    const scopedOutletId = allowedOutletIds
      ? requestedOutletId || allowedOutletIds[0]
      : requestedOutletId;

    if (!scopedOutletId) {
      return null;
    }

    const outlet = await tx.outlet.findFirst({
      where: { id: scopedOutletId, tenantId, isActive: true },
      select: { id: true },
    });

    if (!outlet) {
      throw new NotFoundException("Outlet not found");
    }

    return scopedOutletId;
  }

  private async validateOrderActorScope(
    tx: any,
    tenantId: string,
    dto: any,
  ): Promise<void> {
    if (dto.customerId && dto.memberId) {
      throw new BadRequestException(
        "Customer and member cannot both be set on the same order",
      );
    }

    if (dto.customerId) {
      const customer = await tx.customer.findFirst({
        where: { id: dto.customerId, tenantId },
        select: { id: true },
      });
      if (!customer) {
        throw new NotFoundException("Customer not found");
      }
    }

    if (dto.memberId) {
      const member = await tx.member.findFirst({
        where: { id: dto.memberId, tenantId, isActive: true },
        select: { id: true },
      });
      if (!member) {
        throw new NotFoundException("Member not found");
      }
    }
  }

  private async getOpenStoreShiftId(
    tx: any,
    tenantId: string,
    userId: string,
    outletId: string | null,
  ): Promise<string | null> {
    const cashShift = await tx.cashShift.findFirst({
      where: {
        tenantId,
        kasirId: userId,
        status: "open",
        ...(outletId
          ? {
              storeShift: {
                outletId,
              },
            }
          : {}),
      },
      orderBy: { shiftStart: "desc" },
      select: { storeShiftId: true },
    });

    return cashShift?.storeShiftId ?? null;
  }

  private async buildOrderDraft(
    tx: any,
    dto: any,
    tenantId: string,
    user?: StoreScopedUser,
    options?: { orderStatus?: string },
  ) {
    const userId =
      user && typeof (user as { id?: unknown }).id === "string"
        ? (user as { id: string }).id
        : null;

    if (!userId) {
      throw new BadRequestException("Authenticated user is required");
    }

    if (!Array.isArray(dto?.items) || dto.items.length === 0) {
      throw new BadRequestException("Order items are required");
    }

    const normalizedItems = dto.items.map((item: any) => ({
      productId: typeof item?.productId === "string" ? item.productId : "",
      quantity: Number(item?.quantity ?? 0),
    }));

    if (
      normalizedItems.some(
        (item) =>
          !item.productId ||
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0,
      )
    ) {
      throw new BadRequestException("Each order item must have a valid product and quantity");
    }

    const scopedOutletId = await this.resolveScopedOutletId(
      tx,
      tenantId,
      this.normalizeOptionalString(dto?.outletId),
      user,
    );

    await this.validateOrderActorScope(tx, tenantId, dto);

    const productIds = Array.from(
      new Set(normalizedItems.map((item) => item.productId)),
    );
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds },
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        cost: true,
        stock: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException("Some products could not be found");
    }

    const productMap = new Map<string, any>(products.map((product: any) => [product.id, product] as const));

    const items = normalizedItems.map((item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new NotFoundException("Product not found");
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}`,
        );
      }

      const price = Number(product.price);
      const cost =
        product.cost === null || product.cost === undefined
          ? null
          : Number(product.cost);
      const subtotal = Number((price * item.quantity).toFixed(2));
      const profit =
        cost === null ? null : Number(((price - cost) * item.quantity).toFixed(2));

      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
        cost,
        subtotal,
        profit,
      };
    });

    const subtotal = Number(
      items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
    );
    const discount = Math.min(
      this.normalizeMoney(dto?.discount ?? 0, "Discount"),
      subtotal,
    );
    const total = Number(Math.max(0, subtotal - discount).toFixed(2));
    const sendToKitchen =
      dto?.sendToKitchen === true || dto?.sendToKitchen === "true";
    const orderStatus =
      typeof options?.orderStatus === "string" &&
      VALID_ORDER_STATUSES.includes(options.orderStatus)
        ? options.orderStatus
        : "PENDING";
    const storeShiftId = await this.getOpenStoreShiftId(
      tx,
      tenantId,
      userId,
      scopedOutletId,
    );

    return {
      tenantId,
      userId,
      orderNumber: this.generateOrderNumber(),
      outletId: scopedOutletId,
      customerId: dto?.customerId ?? null,
      memberId: dto?.memberId ?? null,
      temporaryCustomerName: this.normalizeOptionalString(dto?.temporaryCustomerName),
      notes: this.normalizeOptionalString(dto?.notes),
      idempotencyKey: this.normalizeOptionalString(dto?.idempotencyKey),
      subtotal,
      discount,
      total,
      status: orderStatus,
      sendToKitchen,
      kitchenStatus: sendToKitchen ? "PENDING" : null,
      storeShiftId,
      items,
    };
  }

  private async persistOrderDraft(tx: any, draft: any) {
    if (draft.idempotencyKey) {
      const existing = await tx.order.findFirst({
        where: {
          tenantId: draft.tenantId,
          idempotencyKey: draft.idempotencyKey,
        },
        include: {
          items: true,
          transaction: true,
        },
      });

      if (existing) {
        return existing;
      }
    }

    const order = await tx.order.create({
      data: {
        tenantId: draft.tenantId,
        orderNumber: draft.orderNumber,
        userId: draft.userId,
        customerId: draft.customerId,
        memberId: draft.memberId,
        outletId: draft.outletId,
        storeShiftId: draft.storeShiftId,
        subtotal: draft.subtotal,
        discount: draft.discount,
        total: draft.total,
        status: draft.status,
        sendToKitchen: draft.sendToKitchen,
        kitchenStatus: draft.kitchenStatus,
        temporaryCustomerName: draft.temporaryCustomerName,
        notes: draft.notes,
        idempotencyKey: draft.idempotencyKey,
      },
    });

    await tx.orderItem.createMany({
      data: draft.items.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        cost: item.cost,
        subtotal: item.subtotal,
        profit: item.profit,
      })),
    });

    for (const item of draft.items) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          tenantId: draft.tenantId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (updated.count === 0) {
        throw new BadRequestException("Failed to reserve product stock");
      }
    }

    return tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
        transaction: true,
      },
    });
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
    return this.prisma.$transaction(async (tx) => {
      const draft = await this.buildOrderDraft(tx, dto, tenantId, user, {
        orderStatus:
          typeof dto?.status === "string" ? dto.status.trim().toUpperCase() : "PENDING",
      });
      return this.persistOrderDraft(tx, draft);
    });
  }

  async checkoutOrder(dto: any, tenantId: string, user?: StoreScopedUser) {
    this.validateTenantId(tenantId);
    const paymentMethod = this.normalizePaymentMethod(dto?.paymentMethod);

    return this.prisma.$transaction(async (tx) => {
      const draft = await this.buildOrderDraft(tx, dto, tenantId, user, {
        orderStatus: "COMPLETED",
      });

      if (paymentMethod === "CASH") {
        const cashAmount = this.normalizeMoney(dto?.cashAmount ?? 0, "Cash amount");
        if (cashAmount < draft.total) {
          throw new BadRequestException("Cash amount is less than order total");
        }
      }

      const order = await this.persistOrderDraft(tx, draft);

      if (!order) {
        throw new BadRequestException("Failed to create order");
      }

      if (!order.transaction) {
        await tx.transaction.create({
          data: {
            tenantId,
            orderId: order.id,
            userId: draft.userId,
            amount: draft.total,
            paymentMethod: paymentMethod as any,
            status: "COMPLETED" as any,
            reference: this.normalizeOptionalString(dto?.reference),
            qrCode: this.normalizeOptionalString(dto?.qrCode),
            qrCodeImage: this.normalizeOptionalString(dto?.qrCodeImage),
            notes: draft.notes,
            servedBy:
              this.normalizeOptionalString(dto?.servedBy) ||
              (user && typeof (user as { name?: unknown }).name === "string"
                ? (user as { name: string }).name
                : "Cashier"),
          },
        });
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: true,
          transaction: true,
        },
      });
    });
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



