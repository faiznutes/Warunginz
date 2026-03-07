import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("quick-insight")
@UseGuards(JwtAuthGuard, TenantGuard)
export class QuickInsightController {
  @Get()
  async getInsight(@TenantId() _tenantId: string) {
    return {
      todaySales: 0,
      todayOrders: 0,
      topProduct: null,
      trend: "stable",
      message: "No data available yet",
    };
  }
}
