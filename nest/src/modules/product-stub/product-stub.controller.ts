import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("product")
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductStubController {
  @Get("price-suggestion/by-cost")
  async getPriceSuggestionByCost(
    @Query("cost") cost: string,
    @TenantId() _tenantId: string,
  ) {
    const costNum = parseFloat(cost) || 0;
    return {
      cost: costNum,
      suggestedPrice: costNum * 1.3,
      margin: 30,
      minPrice: costNum * 1.1,
      maxPrice: costNum * 2.0,
    };
  }
}
