import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { OpenStoreShiftDto } from "./dto/open-store-shift.dto";
import { CloseStoreShiftDto } from "./dto/close-store-shift.dto";
import { parsePagination } from "../../common/utils/pagination.util";
import {
  StoreScopedUser,
  applyOutletScopeToWhere,
  getAllowedOutletIds,
} from "../../common/utils/store-scope.util";

@Injectable()
export class StoreShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentShift(
    tenantId: string,
    outletId: string,
    user?: StoreScopedUser,
  ) {
    const where: Record<string, unknown> = {
      tenantId,
      status: "open",
    };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds, outletId);

    const shift = await this.prisma.storeShift.findFirst({
      where: where as any,
      select: {
        id: true,
        outletId: true,
        shiftType: true,
        openedAt: true,
        openedBy: true,
        modalAwal: true,
        catatan: true,
        status: true,
        opener: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        openedAt: "desc",
      },
    });

    if (!shift) {
      return null;
    }

    return this.formatStoreShift(shift);
  }

  async getOpenShifts(
    tenantId: string,
    outletId?: string,
    user?: StoreScopedUser,
  ) {
    const where: Record<string, unknown> = {
      tenantId,
      status: "open",
    };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds, outletId);

    const shifts = await this.prisma.storeShift.findMany({
      where,
      select: {
        id: true,
        outletId: true,
        shiftType: true,
        openedAt: true,
        openedBy: true,
        modalAwal: true,
        catatan: true,
        status: true,
        opener: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        openedAt: "desc",
      },
    });

    return shifts.map((shift: any) => this.formatStoreShift(shift));
  }

  async openShift(
    tenantId: string,
    userId: string,
    userRole: string,
    dto: OpenStoreShiftDto,
    user?: StoreScopedUser,
  ) {
    // Only SUPER_ADMIN, ADMIN_TENANT, SUPERVISOR, and CASHIER can open shift
    if (
      !["SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER"].includes(
        userRole,
      )
    ) {
      throw new ForbiddenException(
        "Only admin, supervisor, or cashier can open shift",
      );
    }

    const allowedOutletIds = getAllowedOutletIds(user);
    if (allowedOutletIds && !allowedOutletIds.includes(dto.outletId)) {
      throw new ForbiddenException(
        "You are not allowed to open shift for this store",
      );
    }

    // Validate shift type
    if (!dto.shiftType || dto.shiftType.trim().length === 0) {
      throw new BadRequestException("Shift type is required");
    }

    const shiftType = dto.shiftType.trim().toLowerCase();

    // Check if there's already an open shift for this store
    const existingShift = await this.prisma.storeShift.findFirst({
      where: {
        tenantId,
        outletId: dto.outletId,
        status: "open",
      },
      select: {
        id: true,
        outletId: true,
        shiftType: true,
        openedAt: true,
        openedBy: true,
        modalAwal: true,
        catatan: true,
        status: true,
        opener: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (existingShift) {
      // Return existing open shift
      return {
        success: true,
        message: "Shift already open for this store",
        data: this.formatStoreShift(existingShift),
      };
    }

    // Verify outlet exists and is active
    const outlet = await this.prisma.outlet.findFirst({
      where: {
        id: dto.outletId,
        tenantId,
        isActive: true,
      },
      select: { id: true, name: true },
    });

    if (!outlet) {
      throw new BadRequestException("Outlet not found or is inactive");
    }

    // Create shift
    const newShift = await this.prisma.storeShift.create({
      data: {
        tenantId,
        outletId: dto.outletId,
        shiftType,
        openedBy: userId,
        modalAwal: dto.modalAwal?.toString() || null,
        catatan: dto.catatan || null,
        status: "open",
        openedAt: new Date(),
      },
      select: {
        id: true,
        shiftType: true,
        openedAt: true,
        openedBy: true,
        modalAwal: true,
        catatan: true,
        status: true,
        opener: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      message: `Shift ${shiftType} opened successfully`,
      data: this.formatStoreShift(newShift),
    };
  }

  async closeShift(
    tenantId: string,
    userId: string,
    userRole: string,
    dto: CloseStoreShiftDto,
    user?: StoreScopedUser,
  ) {
    // Only SUPER_ADMIN, ADMIN_TENANT, SUPERVISOR, and CASHIER can close shift
    if (
      !["SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER"].includes(
        userRole,
      )
    ) {
      throw new ForbiddenException(
        "Only admin, supervisor, or cashier can close shift",
      );
    }

    const allowedOutletIds = getAllowedOutletIds(user);
    if (allowedOutletIds && !allowedOutletIds.includes(dto.outletId)) {
      throw new ForbiddenException(
        "You are not allowed to close shift for this store",
      );
    }

    // Find the shift
    const shift = await this.prisma.storeShift.findFirst({
      where: {
        id: dto.shiftId,
        tenantId,
        outletId: dto.outletId,
        status: "open",
      },
      select: { id: true },
    });

    if (!shift) {
      throw new NotFoundException("Shift not found or already closed");
    }

    const activeCashShift = await this.prisma.cashShift.findFirst({
      where: {
        tenantId,
        storeShiftId: shift.id,
        status: "open",
      },
      select: {
        id: true,
        kasir: {
          select: {
            name: true,
          },
        },
      },
    });

    if (activeCashShift) {
      throw new ConflictException(
        `Masih ada shift kasir aktif (${activeCashShift.kasir.name}). Tutup shift kasir terlebih dahulu sebelum menutup shift toko.`,
      );
    }

    // Close the shift
    const closedShift = await this.prisma.storeShift.update({
      where: { id: dto.shiftId },
      data: {
        status: "closed",
        closedAt: new Date(),
      },
      select: {
        id: true,
        outletId: true,
        shiftType: true,
        openedAt: true,
        closedAt: true,
        openedBy: true,
        modalAwal: true,
        catatan: true,
        status: true,
        opener: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Shift closed successfully",
      data: this.formatStoreShift(closedShift),
    };
  }

  async getShiftHistory(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    outletId?: string,
    user?: StoreScopedUser,
  ) {
    const { skip } = parsePagination(page, limit);

    const where: Record<string, unknown> = { tenantId };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds, outletId);

    const [shifts, total] = await Promise.all([
      this.prisma.storeShift.findMany({
        where,
        select: {
          id: true,
          outletId: true,
          shiftType: true,
          openedAt: true,
          closedAt: true,
          openedBy: true,
          modalAwal: true,
          catatan: true,
          status: true,
          opener: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { openedAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.storeShift.count({ where }),
    ]);

    return {
      data: shifts.map((shift: any) => this.formatStoreShift(shift)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private formatStoreShift(shift: any) {
    return {
      id: shift.id,
      outletId: shift.outletId ?? shift.outlet?.id ?? null,
      shiftType: shift.shiftType,
      openedAt: shift.openedAt,
      closedAt: shift.closedAt || null,
      openedBy: shift.openedBy,
      modalAwal: shift.modalAwal ? parseFloat(shift.modalAwal) : null,
      catatan: shift.catatan,
      status: shift.status,
      opener: shift.opener,
      outlet: shift.outlet,
    };
  }

  async checkActiveShift(
    tenantId: string,
    outletId?: string,
    user?: StoreScopedUser,
  ) {
    const where: Record<string, unknown> = { tenantId, status: "open" };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds, outletId);

    const shift = await this.prisma.storeShift.findFirst({ where });
    return { hasActive: !!shift };
  }

  async getShiftSummary(
    tenantId: string,
    startDate?: string,
    endDate?: string,
    user?: StoreScopedUser,
  ) {
    const where: Record<string, unknown> = { tenantId };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds);

    if (startDate && endDate) {
      where.openedAt = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    const total = await this.prisma.storeShift.count({ where });
    return { total, tenantId };
  }

  async getShiftDetails(
    tenantId: string,
    shiftId: string,
    filters: {
      includeOrders?: boolean;
      includeStockTransfers?: boolean;
      includeProductAdjustments?: boolean;
    },
    user?: StoreScopedUser,
  ) {
    const shift = await this.prisma.storeShift.findFirst({
      where: { id: shiftId, tenantId },
    });

    if (!shift) {
      throw new NotFoundException("Shift not found");
    }

    const allowedOutletIds = getAllowedOutletIds(user);
    if (allowedOutletIds && !allowedOutletIds.includes(shift.outletId)) {
      throw new NotFoundException("Shift not found");
    }

    const result: any = { shift };

    if (filters.includeOrders) {
      const orders = await this.prisma.order.findMany({
        where: {
          tenantId,
          outletId: shift.outletId,
          createdAt: {
            gte: shift.openedAt,
            lte: shift.closedAt || new Date(),
          },
        },
        take: 100,
      });
      result.orders = orders;
    }

    if (filters.includeStockTransfers) {
      const stockTransfers = await this.prisma.stockTransfer.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: shift.openedAt,
            lte: shift.closedAt || new Date(),
          },
        },
        take: 100,
      });
      result.stockTransfers = stockTransfers;
    }

    if (filters.includeProductAdjustments) {
      const productAdjustments = await this.prisma.productAdjustment.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: shift.openedAt,
            lte: shift.closedAt || new Date(),
          },
        },
        take: 100,
      });
      result.productAdjustments = productAdjustments;
    }

    return { success: true, data: result };
  }
}
