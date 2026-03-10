import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Headers,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import {
  CreatePaymentDto,
  PaymentCallbackDto,
  CreateAddonPaymentDto,
} from "./dto/payment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { Public } from "../../common/decorators/public.decorator";

@Controller("payment")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class PaymentLegacyController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("create")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "CASHIER")
  create(@Body() dto: CreatePaymentDto, @TenantId() tenantId: string) {
    return this.paymentsService.createPayment({ ...dto, tenantId });
  }

  @Post("webhook")
  @Public()
  handleWebhook(
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

  @Post("subscription")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  createSubscriptionPayment(
    @Body() dto: CreateAddonPaymentDto,
    @TenantId() tenantId: string,
  ) {
    return this.paymentsService.createAddonPayment(
      { ...dto, itemType: dto.itemType || "subscription" },
      tenantId,
    );
  }
}
