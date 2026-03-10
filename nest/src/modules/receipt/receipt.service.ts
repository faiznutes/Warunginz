import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReceiptDto } from "./dto/create-receipt.dto";
import { UpdateReceiptDto } from "./dto/update-receipt.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class ReceiptService {
  constructor(private readonly prisma: PrismaService) {}

  async getReceipts(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    let where: any = { tenantId };

    if (query.search) {
      where = {
        ...where,
        OR: [{ name: { contains: query.search, mode: "insensitive" } }],
      };
    }

    const [receipts, total] = await Promise.all([
      this.prisma.receiptTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
      }),
      this.prisma.receiptTemplate.count({ where }),
    ]);

    return {
      data: receipts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getReceiptById(id: string, tenantId: string) {
    const receipt = await this.prisma.receiptTemplate.findUnique({
      where: { id },
    });

    if (!receipt) {
      throw new NotFoundException("Receipt template not found");
    }

    if (receipt.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this receipt");
    }

    return receipt;
  }

  async createReceipt(data: CreateReceiptDto, tenantId: string) {
    if (data.isDefault) {
      await this.prisma.receiptTemplate.updateMany({
        where: { tenantId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const receipt = await this.prisma.receiptTemplate.create({
      data: {
        ...data,
        tenantId,
      },
    });

    return receipt;
  }

  async updateReceipt(id: string, data: UpdateReceiptDto, tenantId: string) {
    await this.getReceiptById(id, tenantId);

    if (data.isDefault) {
      await this.prisma.receiptTemplate.updateMany({
        where: { tenantId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.receiptTemplate.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteReceipt(id: string, tenantId: string) {
    await this.getReceiptById(id, tenantId);

    await this.prisma.receiptTemplate.delete({
      where: { id },
    });

    return { message: "Receipt template deleted successfully" };
  }

  async getReceiptTemplates(tenantId: string) {
    return this.prisma.receiptTemplate.findMany({
      where: { tenantId },
    });
  }

  async getDefaultTemplate(tenantId: string) {
    return this.prisma.receiptTemplate.findFirst({
      where: { tenantId, isDefault: true },
    });
  }

  async getTemplateById(id: string, tenantId: string) {
    const template = await this.prisma.receiptTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException("Template not found");
    }

    if (template.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access");
    }

    return template;
  }
}
