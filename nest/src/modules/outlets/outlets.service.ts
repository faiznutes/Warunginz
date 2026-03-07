import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateOutletDto,
  UpdateOutletDto,
  GetOutletsDto,
} from "./dto/outlet.dto";
import { parsePagination } from "../../common/utils/pagination.util";
import {
  StoreScopedUser,
  applyOutletScopeToWhere,
  getAllowedOutletIds,
} from "../../common/utils/store-scope.util";

@Injectable()
export class OutletsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOutlets(
    tenantId: string,
    query: GetOutletsDto,
    user?: StoreScopedUser,
  ) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    const where: Record<string, unknown> = { tenantId };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds, undefined, "id");

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { address: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search, mode: "insensitive" } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    const [outlets, total] = await Promise.all([
      this.prisma.outlet.findMany({
        where: where as any,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.outlet.count({ where: where as any }),
    ]);

    return {
      data: outlets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOutletById(id: string, tenantId: string, user?: StoreScopedUser) {
    const where: Record<string, unknown> = { id, tenantId };
    const allowedOutletIds = getAllowedOutletIds(user);

    if (allowedOutletIds) {
      where.id = { in: allowedOutletIds.filter((outletId) => outletId === id) };
    }

    const outlet = await this.prisma.outlet.findFirst({
      where: where as any,
    });

    if (!outlet) {
      throw new NotFoundException("Outlet not found");
    }

    return outlet;
  }

  async createOutlet(data: CreateOutletDto, tenantId: string) {
    const outlet = await this.prisma.outlet.create({
      data: {
        ...data,
        tenantId,
        isActive: true,
      },
    });

    return outlet;
  }

  async updateOutlet(
    id: string,
    data: UpdateOutletDto,
    tenantId: string,
    user?: StoreScopedUser,
  ) {
    await this.getOutletById(id, tenantId, user);

    const updated = await this.prisma.outlet.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteOutlet(id: string, tenantId: string, user?: StoreScopedUser) {
    await this.getOutletById(id, tenantId, user);

    await this.prisma.outlet.delete({
      where: { id },
    });

    return { message: "Outlet deleted successfully" };
  }

  async getOutletStats(id: string, tenantId: string, user?: StoreScopedUser) {
    await this.getOutletById(id, tenantId, user);
    return { id, message: "Outlet stats" };
  }

  async toggleOutletStatus(id: string, tenantId: string, user?: StoreScopedUser) {
    const outlet = await this.getOutletById(id, tenantId, user);
    return this.prisma.outlet.update({
      where: { id },
      data: { isActive: !outlet.isActive },
    });
  }

  async getOutletOrders(id: string, tenantId: string, user?: StoreScopedUser) {
    await this.getOutletById(id, tenantId, user);
    return this.prisma.order.findMany({
      where: { outletId: id, tenantId },
      take: 50,
    });
  }

  async getActiveOutlets(tenantId: string, user?: StoreScopedUser) {
    const where: Record<string, unknown> = { tenantId, isActive: true };
    const allowedOutletIds = getAllowedOutletIds(user);

    applyOutletScopeToWhere(where, allowedOutletIds, undefined, "id");

    return this.prisma.outlet.findMany({ where: where as any });
  }
}
