import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateTenantDto,
  UpdateTenantDto,
  TenantQueryDto,
} from "./dto/tenant.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateTenantDto) {
    // 1. Generate Slug if missing
    let slug = dto.slug;
    if (!slug) {
      slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      // Append random suffix if short or empty
      if (slug.length < 3) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 7)}`;
      }
    }

    // Ensure slug uniqueness
    let existingSlug = await this.prisma.tenant.findUnique({ where: { slug } });
    let counter = 1;
    while (existingSlug) {
      slug = `${slug}-${counter}`;
      existingSlug = await this.prisma.tenant.findUnique({ where: { slug } });
      counter++;
    }

    // 2. Generate Email if missing
    const email = dto.email || `admin@${slug}.com`;

    // 3. Check for existing tenant with same email (global uniqueness check for email if needed, though schema enforces it)
    const existingEmail = await this.prisma.tenant.findUnique({ where: { email } });
    if (existingEmail) {
      throw new ConflictException("Tenant email already exists");
    }

    // 4. Generate Default Password
    const defaultPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 5. Create Tenant and User in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          slug,
          email,
          phone: dto.phone,
          address: dto.address,
          subscriptionPlan: dto.subscriptionPlan || "BASIC",
          tenantsLimit: dto.tenantsLimit || 1,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: `Admin ${tenant.name}`,
          email: email,
          password: hashedPassword,
          role: "ADMIN_TENANT",
        },
      });

      return { tenant, user };
    });

    return {
      ...result.tenant,
      defaultPassword,
      users: [result.user],
    };
  }

  async findAll(query: TenantQueryDto) {
    const { page = 1, limit = 10, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            outlets: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    const [users, stores, addons, subscription, invoices] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId: id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.outlet.findMany({
        where: { tenantId: id },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.tenantAddon.findMany({
        where: { tenantId: id },
        orderBy: { subscribedAt: "desc" },
      }),
      this.prisma.subscription.findFirst({
        where: { tenantId: id },
        orderBy: { endDate: "desc" },
      }),
      this.prisma.subscriptionHistory.findMany({
        where: { tenantId: id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return {
      ...tenant,
      tenant,
      users,
      stores,
      addons,
      subscription,
      invoices,
    };
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);

    return this.prisma.tenant.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.tenant.delete({
      where: { id },
    });

    return { success: true };
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      throw new NotFoundException("Tenant not found");
    }

    return tenant;
  }

  async updateSubscription(
    id: string,
    plan: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.tenant.update({
      where: { id },
      data: {
        subscriptionPlan: plan,
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      },
    });
  }

  async upgradePlan(id: string, subscriptionPlan: string, durationDays = 30) {
    await this.findOne(id);

    const startDate = new Date();
    const safeDuration = Number.isFinite(durationDays)
      ? Math.max(1, Math.floor(durationDays))
      : 30;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + safeDuration);

    return this.prisma.tenant.update({
      where: { id },
      data: {
        subscriptionPlan,
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      },
    });
  }

  async getTenantUsers(id: string) {
    return this.prisma.user.findMany({ where: { tenantId: id } });
  }

  async getTenantProducts(id: string) {
    return this.prisma.product.findMany({ where: { tenantId: id } });
  }

  async getTenantOrders(id: string) {
    return this.prisma.order.findMany({ where: { tenantId: id } });
  }

  async updateTenantStatus(id: string, isActive: boolean) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive },
    });
  }

  async activateTenant(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async deactivateTenant(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async verifyTenant(id: string) {
    return this.prisma.tenant.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async getTenantStatsOverview() {
    const [totalTenants, activeTenants, totalUsers] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { isActive: true } }),
      this.prisma.user.count(),
    ]);

    return {
      totalTenants,
      activeTenants,
      inactiveTenants: totalTenants - activeTenants,
      totalUsers,
    };
  }

  async getTenantUsage(id: string) {
    const [orders, products, customers, users] = await Promise.all([
      this.prisma.order.count({ where: { tenantId: id } }),
      this.prisma.product.count({ where: { tenantId: id } }),
      this.prisma.customer.count({ where: { tenantId: id } }),
      this.prisma.user.count({ where: { tenantId: id } }),
    ]);

    return { orders, products, customers, users };
  }

  async createTenantUser(
    tenantId: string,
    data: { name: string; email: string; password?: string; role?: string },
  ) {
    await this.findOne(tenantId);

    const existingUser = await this.prisma.user.findFirst({
      where: { tenantId, email: data.email },
    });
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    const generatedPassword = Math.random().toString(36).slice(-8);
    const rawPassword = data.password?.trim() || generatedPassword;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: (data.role as any) || "CASHIER",
      },
    });

    return {
      ...user,
      defaultPassword: data.password ? undefined : rawPassword,
    };
  }

  async createTenantOutlet(tenantId: string, data: { name: string; address?: string; phone?: string }) {
    await this.findOne(tenantId);
    return this.prisma.outlet.create({
      data: {
        tenantId,
        name: data.name,
        address: data.address,
        phone: data.phone,
      },
    });
  }
}
