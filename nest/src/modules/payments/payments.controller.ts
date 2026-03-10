import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Headers,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import {
  CreatePaymentDto,
  PaymentCallbackDto,
  PaymentQueryDto,
  CreateAddonPaymentDto,
} from "./dto/payment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { Public } from "../../common/decorators/public.decorator";

@Controller("payments")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "CASHIER")
  create(@Body() dto: CreatePaymentDto, @TenantId() tenantId: string) {
    return this.paymentsService.createPayment({ ...dto, tenantId });
  }

  @Post("callback")
  @Public()
  handleCallback(
    @Body() dto: PaymentCallbackDto,
    @Headers("x-midtrans-signature") signature: string,
  ) {
    return this.paymentsService.handleCallback(dto, signature);
  }

  @Post("webhook/n8n")
  @Public()
  handleN8nWebhook(
    @Body() dto: PaymentCallbackDto,
    @Headers("x-midtrans-signature") signature: string,
  ) {
    return this.paymentsService.handleN8nWebhook(dto, signature);
  }

  @Get("tenant/:tenantId")
  getTenantPayments(
    @Param("tenantId") tenantId: string,
    @Query() query: PaymentQueryDto,
  ) {
    return this.paymentsService.getTenantPayments(
      tenantId,
      query.page || 1,
      query.limit || 10,
    );
  }

  @Get("status/:orderId")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  checkStatus(@Param("orderId") orderId: string, @TenantId() tenantId: string) {
    return this.paymentsService.checkPaymentStatus(orderId, tenantId);
  }

  @Post("cancel/:orderId")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  cancel(@Param("orderId") orderId: string, @TenantId() tenantId: string) {
    return this.paymentsService.cancelPayment(orderId, tenantId);
  }

  @Post("addon")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  createAddonPayment(
    @Body() dto: CreateAddonPaymentDto,
    @TenantId() tenantId: string,
  ) {
    return this.paymentsService.createAddonPayment(dto, tenantId);
  }

  @Get(":transactionId")
  getPaymentStatus(@Param("transactionId") transactionId: string) {
    return this.paymentsService.getPaymentStatus(transactionId);
  }
}
