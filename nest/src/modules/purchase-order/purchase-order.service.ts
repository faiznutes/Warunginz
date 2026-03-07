import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePurchaseOrderDto } from "./dto/create-purchase-order.dto";
import { UpdatePurchaseOrderDto } from "./dto/update-purchase-order.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class PurchaseOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async getPurchaseOrders(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: any = { tenantId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.supplierId) {
      where.supplierId = query.supplierId;
    }

    const [orders, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
        include: {
          supplier: true,
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPurchaseOrderById(id: string, tenantId: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException("Purchase order not found");
    }

    if (order.tenantId !== tenantId) {
      throw new ForbiddenException(
        "Unauthorized access to this purchase order",
      );
    }

    return order;
  }

  async createPurchaseOrder(
    data: CreatePurchaseOrderDto,
    tenantId: string,
    userId: string,
  ) {
    const orderNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await this.prisma.purchaseOrder.create({
      data: {
        tenantId,
        supplierId: data.supplierId,
        orderNumber,
        status: "PENDING",
        totalAmount: data.totalAmount || 0,
        notes: data.notes,
        expectedDate: data.expectedDate,
        createdBy: userId,
      },
    });

    return order;
  }

  async updatePurchaseOrder(
    id: string,
    data: UpdatePurchaseOrderDto,
    tenantId: string,
  ) {
    await this.getPurchaseOrderById(id, tenantId);

    const updated = await this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...data,
        approvedBy: data.approvedBy,
      },
    });

    return updated;
  }

  async deletePurchaseOrder(id: string, tenantId: string) {
    await this.getPurchaseOrderById(id, tenantId);

    await this.prisma.purchaseOrder.delete({
      where: { id },
    });

    return { message: "Purchase order deleted successfully" };
  }

  async approvePurchaseOrder(id: string, tenantId: string, userId: string) {
    await this.getPurchaseOrderById(id, tenantId);

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: "APPROVED", approvedBy: userId },
    });
  }

  async receivePurchaseOrder(id: string, tenantId: string, _data: any) {
    await this.getPurchaseOrderById(id, tenantId);

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: "RECEIVED", receivedDate: new Date() },
    });
  }

  async cancelPurchaseOrder(id: string, tenantId: string) {
    await this.getPurchaseOrderById(id, tenantId);

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }
}
