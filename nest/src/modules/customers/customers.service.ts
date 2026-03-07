import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { GetCustomersDto } from "./dto/get-customers.dto";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { parsePagination } from "../../common/utils/pagination.util";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers(tenantId: string, query: GetCustomersDto) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);

    // Build search filter
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

    // OPTIMIZATION: Parallel fetch with explicit select
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
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
          loyaltyPoints: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id: string, tenantId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        phone: true,
        address: true,

        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    // Check tenant access
    if (customer.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this customer");
    }

    return customer;
  }

  async createCustomer(data: CreateCustomerDto, tenantId: string) {
    // Validate email uniqueness per tenant (optional but good practice)
    if (data.email) {
      const existing = await this.prisma.customer.findFirst({
        where: {
          tenantId,
          email: data.email,
        },
      });

      if (existing) {
        throw new BadRequestException("Email already exists for this tenant");
      }
    }

    const customer = await this.prisma.customer.create({
      data: {
        ...data,
        tenantId,
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        phone: true,
        address: true,

        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return customer;
  }

  async updateCustomer(id: string, data: UpdateCustomerDto, tenantId: string) {
    const customer = await this.getCustomerById(id, tenantId);

    // Check email uniqueness if updating email
    if (data.email && data.email !== customer.email) {
      const existing = await this.prisma.customer.findFirst({
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

    const updated = await this.prisma.customer.update({
      where: { id },
      data,
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        phone: true,
        address: true,

        loyaltyPoints: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async deleteCustomer(id: string, tenantId: string) {
    await this.getCustomerById(id, tenantId);

    await this.prisma.customer.delete({
      where: { id },
    });

    return { message: "Customer deleted successfully" };
  }

  async getCustomerOrders(
    id: string,
    tenantId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const customer = await this.getCustomerById(id, tenantId);

    const { skip } = parsePagination(page, limit);

    // OPTIMIZATION: Explicit select to avoid N+1
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { customerId: id, tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          subtotal: true,
          discount: true,
          createdAt: true,
        },
      }),
      this.prisma.order.count({
        where: { customerId: id, tenantId },
      }),
    ]);

    return {
      customer,
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addLoyaltyPoints(id: string, tenantId: string, points: number) {
    await this.getCustomerById(id, tenantId);

    if (points < 0) {
      throw new BadRequestException("Points must be positive");
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        loyaltyPoints: {
          increment: points,
        },
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        loyaltyPoints: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async activateCustomer(_id: string, _tenantId: string) {
    return { message: "Customer activated" };
  }

  async deactivateCustomer(_id: string, _tenantId: string) {
    return { message: "Customer deactivated" };
  }

  async exportCustomers(tenantId: string) {
    return this.prisma.customer.findMany({ where: { tenantId } });
  }

  async getCustomerStats(tenantId: string) {
    const total = await this.prisma.customer.count({ where: { tenantId } });
    return { total };
  }
}
