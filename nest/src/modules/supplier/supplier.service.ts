import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class SupplierService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuppliers(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    let where: any = { tenantId };

    if (query.search) {
      where = {
        ...where,
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
          { phone: { contains: query.search, mode: "insensitive" } },
        ],
      };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    const [suppliers, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
      }),
      this.prisma.supplier.count({ where }),
    ]);

    return {
      data: suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSupplierById(id: string, tenantId: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException("Supplier not found");
    }

    if (supplier.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this supplier");
    }

    return supplier;
  }

  async createSupplier(data: CreateSupplierDto, tenantId: string) {
    const supplier = await this.prisma.supplier.create({
      data: {
        ...data,
        tenantId,
      },
    });

    return supplier;
  }

  async updateSupplier(id: string, data: UpdateSupplierDto, tenantId: string) {
    await this.getSupplierById(id, tenantId);

    const updated = await this.prisma.supplier.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteSupplier(id: string, tenantId: string) {
    await this.getSupplierById(id, tenantId);

    await this.prisma.supplier.delete({
      where: { id },
    });

    return { message: "Supplier deleted successfully" };
  }

  async getSupplierStats(tenantId: string) {
    const total = await this.prisma.supplier.count({ where: { tenantId } });
    return { total };
  }

  async exportSuppliers(tenantId: string) {
    return this.prisma.supplier.findMany({ where: { tenantId } });
  }
}
