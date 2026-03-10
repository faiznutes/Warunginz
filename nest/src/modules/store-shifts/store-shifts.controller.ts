import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { StoreShiftsService } from "./store-shifts.service";
import { OpenStoreShiftDto } from "./dto/open-store-shift.dto";
import { CloseStoreShiftDto } from "./dto/close-store-shift.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { TenantRequired } from "../../common/decorators/tenant-required.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("store-shift")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
@TenantRequired()
@Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
export class StoreShiftsController {
  constructor(private readonly storeShiftsService: StoreShiftsService) {}

  @Get("current")
  async getCurrentShift(
    @TenantId() tenantId: string | null,
    @Query("outletId") outletId?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    const effectiveOutletId = outletId || user?.assignedStoreId || undefined;

    if (!effectiveOutletId) {
      return { message: "Outlet ID is required" };
    }

    const shift = await this.storeShiftsService.getCurrentShift(
      tenantId,
      effectiveOutletId,
      user,
    );

    return {
      success: true,
      data: shift,
      message: shift ? undefined : "No active shift for this store",
    };
  }

  @Get("open")
  async getOpenShifts(
    @TenantId() tenantId: string | null,
    @Query("outletId") outletId?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    const shifts = await this.storeShiftsService.getOpenShifts(
      tenantId,
      outletId,
      user,
    );

    return {
      success: true,
      data: shifts,
    };
  }

  @Get("history")
  async getShiftHistory(
    @TenantId() tenantId: string | null,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("outletId") outletId?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.storeShiftsService.getShiftHistory(
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      outletId,
      user,
    );
  }

  @Post("open")
  @HttpCode(HttpStatus.OK)
  async openShift(
    @TenantId() tenantId: string | null,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: OpenStoreShiftDto,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.storeShiftsService.openShift(
      tenantId,
      user.id,
      user.role,
      dto,
      user,
    );
  }

  @Post("close")
  @HttpCode(HttpStatus.OK)
  async closeShift(
    @TenantId() tenantId: string | null,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CloseStoreShiftDto,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.storeShiftsService.closeShift(
      tenantId,
      user.id,
      user.role,
      dto,
      user,
    );
  }

  @Get("check-active")
  async checkActiveShift(
    @TenantId() tenantId: string | null,
    @Query("outletId") outletId?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    const effectiveOutletId = outletId || user?.assignedStoreId || undefined;
    return this.storeShiftsService.checkActiveShift(tenantId, effectiveOutletId, user);
  }

  @Get("summary")
  async getShiftSummary(
    @TenantId() tenantId: string | null,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.storeShiftsService.getShiftSummary(
      tenantId,
      startDate,
      endDate,
      user,
    );
  }

  @Get("today")
  async getTodayShifts(
    @TenantId() tenantId: string | null,
    @Query("outletId") outletId?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    const effectiveOutletId = outletId || user?.assignedStoreId || undefined;
    return this.storeShiftsService.getShiftHistory(
      tenantId,
      1,
      50,
      effectiveOutletId,
      user,
    );
  }

  @Get(":id/details")
  async getShiftDetails(
    @TenantId() tenantId: string | null,
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Query("includeOrders") includeOrders?: string,
    @Query("includeStockTransfers") includeStockTransfers?: string,
    @Query("includeProductAdjustments") includeProductAdjustments?: string,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.storeShiftsService.getShiftDetails(tenantId, id, {
      includeOrders: includeOrders !== "false",
      includeStockTransfers: includeStockTransfers !== "false",
      includeProductAdjustments: includeProductAdjustments !== "false",
    }, user);
  }
}
