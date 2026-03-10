import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { OpenCashShiftDto } from "./dto/open-cash-shift.dto";
import { CloseCashShiftDto } from "./dto/close-cash-shift.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class CashShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async openShift(
    tenantId: string,
    userId: string,
    userRole: string,
    dto: OpenCashShiftDto,
    user?: { assignedStoreId?: string | null },
  ) {
    // Only CASHIER can open shift
    if (userRole !== "CASHIER") {
      throw new ForbiddenException("Only cashier can open shift");
    }

    // Check if cashier already has active shift
    const existingShift = await this.prisma.cashShift.findFirst({
      where: {
        tenantId,
        kasirId: userId,
        status: "open",
      },
      select: { id: true },
    });

    if (existingShift) {
      throw new BadRequestException(
        "Cashier still has an active shift. Please close the previous shift first.",
      );
    }

    // Validate modal awal > 0
    if (dto.modalAwal <= 0) {
      throw new BadRequestException("Initial capital must be greater than 0");
    }

    // Verify user is CASHIER and belongs to this tenant
    const cashier = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        role: "CASHIER",
      },
      select: {
        id: true,
        permissions: true,
      },
    });

    if (!cashier) {
      throw new ForbiddenException("User is not a cashier in this tenant");
    }

    const assignedStoreId =
      user?.assignedStoreId ||
      ((cashier.permissions as { assignedStoreId?: string | null } | null)
        ?.assignedStoreId ?? null);

    if (!assignedStoreId) {
      throw new ConflictException(
        "Cashier does not have an assigned store. Please contact admin.",
      );
    }

    const activeStoreShift = await this.prisma.storeShift.findFirst({
      where: {
        tenantId,
        outletId: assignedStoreId,
        status: "open",
      },
      select: {
        id: true,
        outletId: true,
        shiftType: true,
        status: true,
        openedAt: true,
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

    if (!activeStoreShift) {
      throw new ConflictException(
        "Store shift belum dibuka. Buka shift toko terlebih dahulu sebelum membuka shift kasir.",
      );
    }

    // Create shift
    const shift = await this.prisma.cashShift.create({
      data: {
        tenantId,
        storeShiftId: activeStoreShift.id,
        kasirId: userId,
        modalAwal: dto.modalAwal.toString(),
        catatan: dto.catatan || null,
        status: "open",
        shiftStart: new Date(),
      },
      select: {
        id: true,
        modalAwal: true,
        catatan: true,
        status: true,
        shiftStart: true,
        storeShiftId: true,
        storeShift: {
          select: {
            id: true,
            outletId: true,
            shiftType: true,
            status: true,
            openedAt: true,
            outlet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        kasir: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Shift opened successfully",
      data: this.formatCashShift(shift),
    };
  }

  async closeShift(
    tenantId: string,
    userId: string,
    userRole: string,
    dto: CloseCashShiftDto,
  ) {
    // Only CASHIER can close shift
    if (userRole !== "CASHIER") {
      throw new ForbiddenException("Only cashier can close shift");
    }

    // Find active shift
    const shift = await this.prisma.cashShift.findFirst({
      where: {
        tenantId,
        kasirId: userId,
        status: "open",
      },
      select: {
        id: true,
        modalAwal: true,
        shiftStart: true,
        storeShiftId: true,
      },
    });

    if (!shift) {
      throw new NotFoundException("No active shift found");
    }

    // Calculate total sales from completed orders in this shift
    const totalSales = await this.calculateTotalSales(
      tenantId,
      userId,
      shift.shiftStart,
      new Date(),
    );

    const modalAwal = Number(shift.modalAwal);
    const saldoSeharusnya = modalAwal + totalSales;
    const selisih = dto.uangFisikTutup - saldoSeharusnya;

    // Update shift
    const updatedShift = await this.prisma.cashShift.update({
      where: { id: shift.id },
      data: {
        shiftEnd: new Date(),
        uangFisikTutup: dto.uangFisikTutup.toString(),
        saldoSeharusnya: saldoSeharusnya.toString(),
        selisih: selisih.toString(),
        status: "closed",
        catatan: dto.catatan,
      },
      select: {
        id: true,
        modalAwal: true,
        uangFisikTutup: true,
        saldoSeharusnya: true,
        selisih: true,
        status: true,
        shiftStart: true,
        shiftEnd: true,
        storeShiftId: true,
        storeShift: {
          select: {
            id: true,
            outletId: true,
            shiftType: true,
            status: true,
            openedAt: true,
            closedAt: true,
            outlet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        kasir: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Shift closed successfully",
      data: this.formatCashShift(updatedShift, totalSales),
    };
  }

  async getCurrentShift(tenantId: string, userId: string) {
    const shift = await this.prisma.cashShift.findFirst({
      where: {
        tenantId,
        kasirId: userId,
        status: "open",
      },
      select: {
        id: true,
        modalAwal: true,
        catatan: true,
        status: true,
        shiftStart: true,
        storeShiftId: true,
        storeShift: {
          select: {
            id: true,
            outletId: true,
            shiftType: true,
            status: true,
            openedAt: true,
            closedAt: true,
            outlet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        kasir: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        shiftStart: "desc",
      },
    });

    if (!shift) {
      return null;
    }

    const totalSales = await this.calculateTotalSales(
      tenantId,
      userId,
      shift.shiftStart,
      new Date(),
    );

    return this.formatCashShift(shift, totalSales);
  }

  async getShiftHistory(
    tenantId: string,
    page: number = 1,
    limit: number = 20,
    kasirId?: string,
    startDate?: string,
    endDate?: string,
    user?: { id: string; role: string },
  ) {
    const { skip } = parsePagination(page, limit);

    const where: any = { tenantId };

    const effectiveKasirId = user?.role === 'CASHIER' ? user.id : kasirId;

    if (effectiveKasirId) {
      where.kasirId = effectiveKasirId;
    }

    if (startDate || endDate) {
      where.shiftStart = {};
      if (startDate) {
        where.shiftStart.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.shiftStart.lte = end;
      }
    }

    const [shifts, total] = await Promise.all([
      this.prisma.cashShift.findMany({
        where,
        select: {
          id: true,
          modalAwal: true,
          uangFisikTutup: true,
          saldoSeharusnya: true,
          selisih: true,
          status: true,
          shiftStart: true,
          shiftEnd: true,
          catatan: true,
          storeShiftId: true,
          storeShift: {
            select: {
              id: true,
              outletId: true,
              shiftType: true,
              status: true,
              openedAt: true,
              closedAt: true,
              outlet: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          kasir: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { shiftStart: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.cashShift.count({ where }),
    ]);

    // Calculate total sales for each shift
    const shiftsWithSales = await Promise.all(
      shifts.map(async (shift: any) => {
        const totalSales =
          shift.status === "open"
            ? await this.calculateTotalSales(
                tenantId,
                shift.kasir.id,
                shift.shiftStart,
                new Date(),
              )
            : shift.saldoSeharusnya
              ? parseFloat(shift.saldoSeharusnya) - parseFloat(shift.modalAwal)
              : 0;
        return this.formatCashShift(shift, totalSales);
      }),
    );

    return {
      data: shiftsWithSales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async hasActiveShift(tenantId: string, userId: string): Promise<boolean> {
    const shift = await this.prisma.cashShift.findFirst({
      where: {
        tenantId,
        kasirId: userId,
        status: "open",
      },
      select: { id: true },
    });

    return !!shift;
  }

  private async calculateTotalSales(
    tenantId: string,
    kasirId: string,
    shiftStart: Date,
    shiftEnd: Date,
  ): Promise<number> {
    const aggregate = await this.prisma.order.aggregate({
      where: {
        tenantId,
        userId: kasirId,
        status: "COMPLETED",
        createdAt: {
          gte: shiftStart,
          lte: shiftEnd,
        },
      },
      _sum: {
        total: true,
      },
    });

    return aggregate._sum.total ? Number(aggregate._sum.total) : 0;
  }

  private formatCashShift(shift: any, totalSales?: number) {
    const modalAwal = parseFloat(shift.modalAwal);
    const computedTotalSales =
      totalSales || (shift.saldoSeharusnya ? parseFloat(shift.saldoSeharusnya) - modalAwal : 0);
    const saldoSeharusnya = shift.saldoSeharusnya
      ? parseFloat(shift.saldoSeharusnya)
      : computedTotalSales
        ? modalAwal + computedTotalSales
        : undefined;

    return {
      id: shift.id,
      kasirId: shift.kasir.id,
      kasirName: shift.kasir.name,
      kasirEmail: shift.kasir.email,
      storeShiftId: shift.storeShiftId ?? shift.storeShift?.id ?? null,
      storeShift: shift.storeShift
        ? {
            id: shift.storeShift.id,
            outletId: shift.storeShift.outletId ?? shift.storeShift.outlet?.id ?? null,
            outletName: shift.storeShift.outlet?.name ?? null,
            shiftType: shift.storeShift.shiftType,
            status: shift.storeShift.status,
            openedAt: shift.storeShift.openedAt,
            closedAt: shift.storeShift.closedAt ?? null,
          }
        : null,
      storeName: shift.storeShift?.outlet?.name ?? null,
      modalAwal,
      uangFisikTutup: shift.uangFisikTutup
        ? parseFloat(shift.uangFisikTutup)
        : null,
      saldoSeharusnya,
      selisih: shift.selisih ? parseFloat(shift.selisih) : null,
      status: shift.status,
      shiftStart: shift.shiftStart,
      shiftEnd: shift.shiftEnd,
      catatan: shift.catatan,
      totalSales: computedTotalSales,
      totalPenjualan: computedTotalSales,
    };
  }
}
