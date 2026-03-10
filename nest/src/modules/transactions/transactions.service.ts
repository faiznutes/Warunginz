import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { parsePagination } from "../../common/utils/pagination.util";
import {
  StoreScopedUser,
  getAllowedOutletIds,
} from "../../common/utils/store-scope.util";

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransactions(
    tenantId: string,
    query: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      outletId?: string;
    },
    user?: StoreScopedUser,
  ) {
    const { page, limit, skip } = parsePagination(
      query.page || 1,
      query.limit || 20,
    );

    const where: Record<string, unknown> = { tenantId };
    const allowedOutletIds = getAllowedOutletIds(user);

    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate + "T23:59:59.999Z"),
      };
    }

    if (allowedOutletIds) {
      if (query.outletId && !allowedOutletIds.includes(query.outletId)) {
        throw new NotFoundException("Transaction not found");
      }
      where.order =
        allowedOutletIds.length === 1
          ? { outletId: allowedOutletIds[0] }
          : { outletId: { in: allowedOutletIds } };
    } else if (query.outletId) {
      where.order = { outletId: query.outletId };
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { order: true },
      }),
      this.prisma.transaction.count({ where: where as any }),
    ]);

    return {
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(
    id: string,
    tenantId: string,
    user?: StoreScopedUser,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (transaction.tenantId !== tenantId) {
      throw new NotFoundException("Transaction not found");
    }

    const allowedOutletIds = getAllowedOutletIds(user);
    if (allowedOutletIds) {
      const outletId = transaction.order?.outletId || null;
      if (!outletId || !allowedOutletIds.includes(outletId)) {
        throw new NotFoundException("Transaction not found");
      }
    }

    return transaction;
  }

  async createTransaction(
    data: {
      orderId: string;
      amount: number;
      paymentMethod: string;
      status?: string;
      reference?: string;
      qrCode?: string;
      qrCodeImage?: string;
      notes?: string;
      servedBy?: string;
    },
    userId: string,
    tenantId: string,
    user?: StoreScopedUser,
  ) {
    const {
      orderId,
      amount,
      paymentMethod,
      status,
      reference,
      qrCode,
      qrCodeImage,
      notes,
      servedBy,
    } = data;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.tenantId !== tenantId) {
      throw new NotFoundException("Order not found");
    }

    const allowedOutletIds = getAllowedOutletIds(user);
    if (allowedOutletIds) {
      if (!order.outletId || !allowedOutletIds.includes(order.outletId)) {
        throw new NotFoundException("Order not found");
      }
    }

    const normalizedStatus = (status || "PENDING").toUpperCase();

    const transaction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          tenantId,
          orderId,
          userId,
          amount: Number(amount),
          paymentMethod: paymentMethod as any,
          status: normalizedStatus as any,
          reference,
          qrCode,
          qrCodeImage,
          notes,
          servedBy,
        },
      });

      if (normalizedStatus === "COMPLETED" && order.status !== "COMPLETED") {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "COMPLETED" },
        });
      }

      return created;
    });

    return transaction;
  }
}
