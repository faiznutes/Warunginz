import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { PdfService } from "./pdf.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("pdf")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get("receipt/:orderId")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async generateReceipt(
    @Param("orderId") orderId: string,
    @TenantId() tenantId: string,
  ) {
    return this.pdfService.generateReceipt(orderId, tenantId);
  }

  @Get("report")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async generateReport(
    @Query("type") type: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @TenantId() tenantId: string,
  ) {
    return this.pdfService.generateReport(type, tenantId, startDate, endDate);
  }
}
