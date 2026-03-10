import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

  async getDiscounts(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    let where: any = { tenantId };

    if (query.search) {
      where = {
        ...where,
        name: { contains: query.search, mode: "insensitive" },
      };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    const [discounts, total] = await Promise.all([
      this.prisma.discount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
      }),
      this.prisma.discount.count({ where }),
    ]);

    return {
      data: discounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDiscountById(id: string, tenantId: string) {
    const discount = await this.prisma.discount.findUnique({
      where: { id },
    });

    if (!discount) {
      throw new NotFoundException("Discount not found");
    }

    if (discount.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this discount");
    }

    return discount;
  }

  async createDiscount(data: CreateDiscountDto, tenantId: string) {
    const discount = await this.prisma.discount.create({
      data: {
        ...data,
        tenantId,
      },
    });

    return discount;
  }

  async updateDiscount(id: string, data: UpdateDiscountDto, tenantId: string) {
    await this.getDiscountById(id, tenantId);

    const updated = await this.prisma.discount.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteDiscount(id: string, tenantId: string) {
    await this.getDiscountById(id, tenantId);

    await this.prisma.discount.delete({
      where: { id },
    });

    return { message: "Discount deleted successfully" };
  }

  async getActiveDiscounts(tenantId: string) {
    const now = new Date();

    const discounts = await this.prisma.discount.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return discounts;
  }

  async toggleDiscount(id: string, tenantId: string) {
    const discount = await this.getDiscountById(id, tenantId);
    return this.prisma.discount.update({
      where: { id },
      data: { isActive: !discount.isActive },
    });
  }

  async getDiscountStats(tenantId: string) {
    const total = await this.prisma.discount.count({ where: { tenantId } });
    const active = await this.prisma.discount.count({
      where: { tenantId, isActive: true },
    });
    return { total, active, inactive: total - active };
  }

  async validateDiscount(tenantId: string, code: string, orderTotal: number) {
    const discount = await this.prisma.discount.findFirst({
      where: {
        tenantId,
        name: code,
        isActive: true,
      },
    });

    if (!discount) {
      return { valid: false, message: "Discount code not found" };
    }

    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return { valid: false, message: "Discount not yet active" };
    }
    if (discount.endDate && new Date(discount.endDate) < now) {
      return { valid: false, message: "Discount has expired" };
    }

    if (discount.minAmount && Number(discount.minAmount) > orderTotal) {
      return {
        valid: false,
        message: `Minimum order total is ${discount.minAmount}`,
      };
    }

    return { valid: true, discount };
  }

  async getApplicableDiscounts(tenantId: string, orderTotal?: number) {
    const now = new Date();

    const discounts = await this.prisma.discount.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: { gte: now } },
        ],
      },
    });

    if (orderTotal !== undefined) {
      return discounts.filter(
        (d) => !d.minAmount || Number(d.minAmount) <= orderTotal,
      );
    }

    return discounts;
  }
}
