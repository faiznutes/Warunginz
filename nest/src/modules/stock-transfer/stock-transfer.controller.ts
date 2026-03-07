import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { StockTransferService } from "./stock-transfer.service";
import { CreateStockTransferDto } from "./dto/create-stock-transfer.dto";
import { UpdateStockTransferDto } from "./dto/update-stock-transfer.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("stock-transfers")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class StockTransferController {
  constructor(private readonly stockTransferService: StockTransferService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getStockTransfers(@TenantId() tenantId: string, @Query() query: any) {
    return this.stockTransferService.getStockTransfers(tenantId, query);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getStockTransferById(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.stockTransferService.getStockTransferById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createStockTransfer(
    @Body() createStockTransferDto: CreateStockTransferDto,
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.stockTransferService.createStockTransfer(
      createStockTransferDto,
      tenantId,
      user.id,
    );
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updateStockTransfer(
    @Param("id") id: string,
    @Body() updateStockTransferDto: UpdateStockTransferDto,
    @TenantId() tenantId: string,
  ) {
    return this.stockTransferService.updateStockTransfer(
      id,
      updateStockTransferDto,
      tenantId,
    );
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteStockTransfer(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.stockTransferService.deleteStockTransfer(id, tenantId);
  }

  @Put(":id/cancel")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async cancelStockTransfer(
    @Param("id") id: string,
    @TenantId() tenantId: string,
  ) {
    return this.stockTransferService.updateStockTransfer(
      id,
      { status: "CANCELLED" } as any,
      tenantId,
    );
  }
}
