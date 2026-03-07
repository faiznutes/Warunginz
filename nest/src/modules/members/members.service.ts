import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateMemberDto } from "./dto/create-member.dto";
import { UpdateMemberDto } from "./dto/update-member.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMembers(tenantId: string, query: any) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    let where: any = { tenantId };

    if (query.search) {
      where = {
        ...where,
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
          { phone: { contains: query.search, mode: "insensitive" } },
          { memberCode: { contains: query.search, mode: "insensitive" } },
        ],
      };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === "true";
    }

    const [members, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          memberCode: true,
          discountType: true,
          discountValue: true,
          isActive: true,
          loyaltyPoints: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.member.count({ where }),
    ]);

    return {
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMemberById(id: string, tenantId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        memberCode: true,
        discountType: true,
        discountValue: true,
        isActive: true,
        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    if (member.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this member");
    }

    return member;
  }

  async createMember(data: CreateMemberDto, tenantId: string) {
    const existing = await this.prisma.member.findFirst({
      where: {
        tenantId,
        phone: data.phone,
      },
    });

    if (existing) {
      throw new BadRequestException(
        "Phone number already exists for this tenant",
      );
    }

    const member = await this.prisma.member.create({
      data: {
        ...data,
        tenantId,
      } as any,
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        memberCode: true,
        discountType: true,
        discountValue: true,
        isActive: true,
        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return member;
  }

  async updateMember(id: string, data: UpdateMemberDto, tenantId: string) {
    const member = await this.getMemberById(id, tenantId);

    if (data.phone && data.phone !== member.phone) {
      const existing = await this.prisma.member.findFirst({
        where: {
          tenantId,
          phone: data.phone,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException(
          "Phone number already exists for this tenant",
        );
      }
    }

    const updated = await this.prisma.member.update({
      where: { id },
      data,
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        memberCode: true,
        discountType: true,
        discountValue: true,
        isActive: true,
        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async deleteMember(id: string, tenantId: string) {
    await this.getMemberById(id, tenantId);

    await this.prisma.member.delete({
      where: { id },
    });

    return { message: "Member deleted successfully" };
  }

  async addLoyaltyPoints(id: string, tenantId: string, points: number) {
    await this.getMemberById(id, tenantId);

    if (points < 0) {
      throw new BadRequestException("Points must be positive");
    }

    const updated = await this.prisma.member.update({
      where: { id },
      data: {
        loyaltyPoints: {
          increment: points,
        },
      },
      select: {
        id: true,
        name: true,
        loyaltyPoints: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async getMemberStats(tenantId: string) {
    const total = await this.prisma.member.count({ where: { tenantId } });
    const active = await this.prisma.member.count({
      where: { tenantId, isActive: true },
    });
    return { total, active, inactive: total - active };
  }

  async exportMembers(tenantId: string) {
    return this.prisma.member.findMany({ where: { tenantId } });
  }

  async bulkImportMembers(tenantId: string, members: any[]) {
    const created = await this.prisma.member.createMany({
      data: members.map((m) => ({ ...m, tenantId })),
    });
    return { message: `${created.count} members imported` };
  }
}
