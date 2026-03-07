import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("customer-engagement")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles("SUPER_ADMIN", "ADMIN_TENANT")
export class CustomerEngagementController {
  @Get()
  async getEngagement(@TenantId() _tenantId: string) {
    return {
      data: [],
      total: 0,
      activeCustomers: 0,
      inactiveCustomers: 0,
      retentionRate: 0,
    };
  }

  @Get("stats/overall")
  async getOverallStats(@TenantId() _tenantId: string) {
    return {
      totalCustomers: 0,
      activeCustomers: 0,
      newCustomersThisMonth: 0,
      retentionRate: 0,
      averageOrderValue: 0,
      customerLifetimeValue: 0,
    };
  }
}
