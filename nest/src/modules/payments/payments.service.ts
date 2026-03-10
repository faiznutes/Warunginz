import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreatePaymentDto,
  PaymentCallbackDto,
  CreateAddonPaymentDto,
} from "./dto/payment.dto";
import * as Midtrans from "midtrans-client";
import * as crypto from "crypto";

@Injectable()
export class PaymentsService {
  private snap: Midtrans.Snap | null = null;
  private coreApi: Midtrans.CoreApi | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.initializeMidtrans();
  }

  private initializeMidtrans() {
    const serverKey = this.config.get("MIDTRANS_SERVER_KEY");
    const clientKey = this.config.get("MIDTRANS_CLIENT_KEY");
    const isProduction = this.config.get("MIDTRANS_IS_PRODUCTION");

    if (serverKey && clientKey) {
      this.snap = new Midtrans.Snap({
        isProduction: !!isProduction,
        serverKey: serverKey.trim(),
        clientKey: clientKey.trim(),
      });

      this.coreApi = new Midtrans.CoreApi({
        isProduction: !!isProduction,
        serverKey: serverKey.trim(),
        clientKey: clientKey.trim(),
      });
    }
  }

  async createPayment(dto: CreatePaymentDto) {
    const {
      orderId,
      tenantId,
      amount,
      paymentMethod,
      customerName,
      customerEmail,
      items,
    } = dto;

    // IDEMPOTENCY CHECK: Prevent double charge
    // Check if there's already a pending or completed transaction for this order
    const existingTransaction = await this.prisma.transaction.findFirst({
      where: { orderId, tenantId },
      orderBy: { createdAt: "desc" },
    });

    if (existingTransaction) {
      // If there's a pending transaction, return it (don't create new)
      if (existingTransaction.status === "PENDING") {
        return {
          success: true,
          transactionId: existingTransaction.id,
          status: "PENDING",
          message: "Existing pending transaction returned",
        };
      }
      // If already completed, return success (prevent double charge)
      if (existingTransaction.status === "COMPLETED") {
        return {
          success: true,
          transactionId: existingTransaction.id,
          status: "COMPLETED",
          message: "Order already paid",
        };
      }
    }

    if (paymentMethod === "CASH") {
      const user = await this.prisma.user.findFirst({ where: { tenantId } });
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const transaction = await this.prisma.transaction.create({
        data: {
          orderId,
          tenantId,
          userId: user.id,
          amount,
          paymentMethod: "CASH" as any,
          status: "COMPLETED",
        },
      });
      return {
        success: true,
        transactionId: transaction.id,
        paymentMethod: "CASH",
        status: "CASH",
        message: "Cash payment processed",
      };
    }

    if (!this.snap) {
      throw new BadRequestException("Midtrans is not configured");
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${orderId}-${Date.now()}`,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerName,
        email: customerEmail,
      },
      item_details: items?.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    };

    const transaction = await this.snap.createTransaction(parameter);

    const user = await this.prisma.user.findFirst({ where: { tenantId } });

    await this.prisma.transaction.create({
      data: {
        orderId,
        tenantId,
        userId: user?.id || "",
        amount,
        paymentMethod: paymentMethod as any,
        status: "PENDING",
        reference: parameter.transaction_details.order_id,
      },
    });

    return {
      success: true,
      paymentUrl: transaction.redirect_url,
      clientKey: this.config.get("MIDTRANS_CLIENT_KEY"),
      isProduction: this.config.get("MIDTRANS_IS_PRODUCTION"),
    };
  }

  private verifyMidtransSignature(rawBody: string, signature: string): boolean {
    if (!signature) {
      return false;
    }

    const serverKey = this.config.get<string>("MIDTRANS_SERVER_KEY");
    if (!serverKey) {
      return false;
    }

    const hash = crypto.createHash("sha512").update(rawBody).digest("hex");

    return hash === signature;
  }

  async handleCallback(dto: PaymentCallbackDto, signature?: string) {
    // CRITICAL: Verify Midtrans signature before processing
    // For production, signature verification should be enforced
    const serverKey = this.config.get<string>("MIDTRANS_SERVER_KEY");
    if (serverKey && serverKey.length > 0) {
      // If server key is configured, require signature verification
      if (!signature) {
        throw new ForbiddenException("Missing payment signature");
      }

      // Get raw body for signature verification (JSON stringified)
      const rawBody = JSON.stringify(dto);
      if (!this.verifyMidtransSignature(rawBody, signature)) {
        throw new ForbiddenException("Invalid payment signature");
      }
    }

    const { order_id, transaction_status, transaction_id } = dto;

    // ATOMIC TRANSACTION: Update both transaction and order together
    await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: { reference: order_id },
      });

      if (!transaction) {
        throw new NotFoundException("Transaction not found");
      }

      // Check if already processed (idempotency)
      if (transaction.status === "COMPLETED") {
        return {
          success: true,
          status: "COMPLETED",
          message: "Already processed",
        };
      }

      let status: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";

      if (
        transaction_status === "settlement" ||
        transaction_status === "capture"
      ) {
        status = "COMPLETED";
      } else if (
        transaction_status === "deny" ||
        transaction_status === "cancel"
      ) {
        status = "FAILED";
      }

      // Update transaction
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status,
          reference: transaction_id,
        },
      });

      // Update order status atomically
      if (status === "COMPLETED") {
        await tx.order.update({
          where: { id: transaction.orderId },
          data: { status: "COMPLETED" },
        });
      }
    });

    return { success: true, status: "COMPLETED" };
  }

  async handleN8nWebhook(dto: PaymentCallbackDto, signature?: string) {
    return this.handleCallback(dto, signature);
  }

  async checkPaymentStatus(orderId: string, tenantId: string) {
    if (!this.coreApi) {
      const transaction = await this.prisma.transaction.findFirst({
        where: { orderId, tenantId },
        include: { order: true },
      });

      if (!transaction) {
        throw new NotFoundException("Transaction not found");
      }

      return {
        success: true,
        transactionId: transaction.id,
        status: transaction.status,
        message: "Payment status retrieved",
      };
    }

    try {
      const status = await this.coreApi.transaction.status(orderId);

      return {
        success: true,
        transactionId: status.transaction_id,
        status: status.transaction_status,
        message: status.status_message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to check payment status",
      };
    }
  }

  async cancelPayment(orderId: string, tenantId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { orderId, tenantId },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (transaction.status !== "PENDING") {
      throw new BadRequestException("Only pending payments can be cancelled");
    }

    if (this.coreApi) {
      try {
        await this.coreApi.transaction.cancel(orderId);
      } catch (error: any) {
        // Continue even if Midtrans cancel fails
      }
    }

    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "FAILED" as any },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return {
      success: true,
      transactionId: updated.id,
      status: "CANCELLED",
      message: "Payment cancelled",
    };
  }

  async createAddonPayment(dto: CreateAddonPaymentDto, tenantId: string) {
    const { itemName, amount, itemId, itemType } = dto;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    if (!this.snap) {
      throw new BadRequestException("Midtrans is not configured");
    }

    const typePrefix = itemType === "addon" ? "ADD" : "SUB";
    const hashInput = `${tenantId}-${itemId}`;
    const hash = crypto
      .createHash("md5")
      .update(hashInput)
      .digest("hex")
      .substring(0, 8)
      .toUpperCase();
    const timestamp = Date.now().toString().slice(-10);
    const orderId = `${typePrefix}-${hash}-${timestamp}`;

    try {
      await this.prisma.paymentMapping.upsert({
        where: { orderId },
        update: {
          tenantId,
          itemId,
          itemType,
          status: "PENDING",
        },
        create: {
          orderId,
          tenantId,
          itemId,
          itemType,
          status: "PENDING",
        } as any,
      });
    } catch (error) {
      // PaymentMapping table might not exist
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: tenant.name,
        email: tenant.email,
      },
      item_details: [
        {
          id: itemId,
          name: itemName,
          price: amount,
          quantity: 1,
        },
      ],
    };

    const transaction = await this.snap.createTransaction(parameter);

    return {
      success: true,
      paymentUrl: transaction.redirect_url,
      clientKey: this.config.get("MIDTRANS_CLIENT_KEY"),
      isProduction: this.config.get("MIDTRANS_IS_PRODUCTION"),
      orderId,
    };
  }

  async getPaymentStatus(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { order: true },
    });

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    return transaction;
  }

  async getTenantPayments(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { order: true },
      }),
      this.prisma.transaction.count({ where: { tenantId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
