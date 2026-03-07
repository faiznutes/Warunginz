import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { CashShiftsService } from './cash-shifts.service';
import { OpenCashShiftDto } from './dto/open-cash-shift.dto';
import { CloseCashShiftDto } from './dto/close-cash-shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { TenantRequired } from '../../common/decorators/tenant-required.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('cash-shift')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
@TenantRequired()
@Roles('SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER')
export class CashShiftsController {
  constructor(private readonly cashShiftsService: CashShiftsService) {}

  @Post('open')
  @HttpCode(HttpStatus.OK)
  async openShift(
    @TenantId() tenantId: string | null,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: OpenCashShiftDto,
  ) {
    if (!tenantId) throw new BadRequestException('TenantId required');
    return this.cashShiftsService.openShift(
      tenantId,
      user.id,
      user.role,
      dto,
      user,
    );
  }

  @Post('close')
  @HttpCode(HttpStatus.OK)
  async closeShift(
    @TenantId() tenantId: string | null,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CloseCashShiftDto,
  ) {
    if (!tenantId) throw new BadRequestException('TenantId required');
    return this.cashShiftsService.closeShift(
      tenantId,
      user.id,
      user.role,
      dto,
    );
  }

  @Get('current')
  async getCurrentShift(
    @TenantId() tenantId: string | null,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (!tenantId) throw new BadRequestException('TenantId required');
    const shift = await this.cashShiftsService.getCurrentShift(
      tenantId,
      user.id,
    );
    return shift;
  }

  @Get('history')
  async getShiftHistory(
    @TenantId() tenantId: string | null,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('kasirId') kasirId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!tenantId) throw new BadRequestException('TenantId required');
    return this.cashShiftsService.getShiftHistory(
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      kasirId,
      startDate,
      endDate,
    );
  }

  @Get('check-active')
  async checkActiveShift(
    @TenantId() tenantId: string | null,
    @CurrentUser() user: any,
  ) {
    if (!tenantId) throw new BadRequestException('TenantId required');
    const hasActive = await this.cashShiftsService.hasActiveShift(
      tenantId,
      user.id,
    );
    return { hasActiveShift: hasActive };
  }
}
