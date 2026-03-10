import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { PrismaService } from "../../prisma/prisma.service";

@Controller("inventory")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("restock-suggestions")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getRestockSuggestions(@TenantId() tenantId: string) {
    try {
      const products = await this.prisma.product.findMany({
        where: { tenantId, isActive: true },
        orderBy: { stock: "asc" },
        take: 50,
      });
      const lowStock = products.filter((p) => p.stock <= p.minStock);
      return { data: lowStock, total: lowStock.length };
    } catch {
      return { data: [], total: 0 };
    }
  }

  @Get("restock-suggestions/critical")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getCriticalRestockSuggestions(@TenantId() tenantId: string) {
    try {
      const criticalProducts = await this.prisma.product.findMany({
        where: { tenantId, isActive: true, stock: { lte: 0 } },
        orderBy: { stock: "asc" },
        take: 50,
      });
      return { data: criticalProducts, total: criticalProducts.length };
    } catch {
      return { data: [], total: 0 };
    }
  }
}
