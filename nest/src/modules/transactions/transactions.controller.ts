import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

@Controller("transactions")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async createTransaction(
    @Body()
    body: {
      orderId: string;
      amount: number;
      paymentMethod: string;
      status?: string;
      reference?: string;
      qrCode?: string;
      qrCodeImage?: string;
      notes?: string;
      servedBy?: string;
    },
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.transactionsService.createTransaction(body, user.id, tenantId, user);
  }

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getTransactions(
    @TenantId() tenantId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("outletId") outletId?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.transactionsService.getTransactions(tenantId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      startDate,
      endDate,
      outletId,
    }, user);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getTransactionById(
    @Param("id") id: string,
    @TenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.transactionsService.getTransactionById(id, tenantId, user);
  }
}
