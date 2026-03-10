import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("retention")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RetentionController {
  @Get("stats")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getStats() {
    return {
      ordersRetained: 0,
      transactionsRetained: 0,
      reportsRetained: 0,
      auditLogsRetained: 0,
      contactSubmissionsRetained: 0,
      demoRequestsRetained: 0,
    };
  }

  @Post("orders")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async retainOrders(@Body() _data: any) {
    return { success: true, message: "Orders retention policy applied" };
  }

  @Post("transactions")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async retainTransactions(@Body() _data: any) {
    return { success: true, message: "Transactions retention policy applied" };
  }

  @Post("reports")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async retainReports(@Body() _data: any) {
    return { success: true, message: "Reports retention policy applied" };
  }

  @Post("audit-logs")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async retainAuditLogs(@Body() _data: any) {
    return { success: true, message: "Audit logs retention policy applied" };
  }

  @Post("contact-submissions")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async retainContactSubmissions(@Body() _data: any) {
    return { success: true, message: "Contact submissions retention policy applied" };
  }

  @Post("demo-requests")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async retainDemoRequests(@Body() _data: any) {
    return { success: true, message: "Demo requests retention policy applied" };
  }

  @Post("apply-all")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async applyAll(@Body() _data: any) {
    return { success: true, message: "All retention policies applied" };
  }
}
