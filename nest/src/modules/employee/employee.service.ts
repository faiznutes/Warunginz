import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployees(tenantId: string, query: any) {
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

    if (query.position) {
      where.position = query.position;
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || "createdAt"]: query.sortOrder || "desc" },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeeById(id: string, tenantId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    if (employee.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this employee");
    }

    return employee;
  }

  async createEmployee(data: CreateEmployeeDto, tenantId: string) {
    const existing = await this.prisma.employee.findFirst({
      where: {
        tenantId,
        email: data.email,
      },
    });

    if (existing) {
      throw new BadRequestException("Email already exists for this tenant");
    }

    const employee = await this.prisma.employee.create({
      data: {
        ...data,
        tenantId,
      },
    });

    return employee;
  }

  async updateEmployee(id: string, data: UpdateEmployeeDto, tenantId: string) {
    await this.getEmployeeById(id, tenantId);

    if (data.email) {
      const existing = await this.prisma.employee.findFirst({
        where: {
          tenantId,
          email: data.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw new BadRequestException("Email already exists for this tenant");
      }
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteEmployee(id: string, tenantId: string) {
    await this.getEmployeeById(id, tenantId);

    await this.prisma.employee.delete({
      where: { id },
    });

    return { message: "Employee deleted successfully" };
  }

  async getEmployeeStats(tenantId: string) {
    const total = await this.prisma.employee.count({ where: { tenantId } });
    const active = await this.prisma.employee.count({
      where: { tenantId, isActive: true },
    });

    return { total, active, inactive: total - active };
  }

  async activateEmployee(id: string, tenantId: string) {
    await this.getEmployeeById(id, tenantId);
    return this.prisma.employee.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateEmployee(id: string, tenantId: string) {
    await this.getEmployeeById(id, tenantId);
    return this.prisma.employee.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async exportEmployees(tenantId: string) {
    return this.prisma.employee.findMany({ where: { tenantId } });
  }
}
