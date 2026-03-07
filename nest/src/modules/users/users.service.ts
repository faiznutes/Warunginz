import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
} from "./dto/user.dto";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { parsePagination } from "../../common/utils/pagination.util";

type UserPermissionsPayload = {
  canEditOrders?: boolean;
  canDeleteOrders?: boolean;
  canCancelOrders?: boolean;
  canRefundOrders?: boolean;
  canViewReports?: boolean;
  canEditReports?: boolean;
  canExportReports?: boolean;
  canManageProducts?: boolean;
  canManageCustomers?: boolean;
  allowedStoreIds?: string[];
  assignedStoreId?: string;
};

const PERMISSION_FLAGS: Array<keyof UserPermissionsPayload> = [
  "canEditOrders",
  "canDeleteOrders",
  "canCancelOrders",
  "canRefundOrders",
  "canViewReports",
  "canEditReports",
  "canExportReports",
  "canManageProducts",
  "canManageCustomers",
];

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeString(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private normalizePermissions(
    role: string,
    permissions?: UserPermissionsPayload | null,
  ): Record<string, unknown> | null {
    if (role === "SUPER_ADMIN" || role === "ADMIN_TENANT") {
      return null;
    }

    const source =
      permissions && typeof permissions === "object" ? permissions : {};
    const normalized: Record<string, unknown> = {};

    for (const key of PERMISSION_FLAGS) {
      normalized[key] = source[key] === true;
    }

    if (role === "CASHIER" || role === "KITCHEN") {
      normalized.assignedStoreId = this.normalizeString(source.assignedStoreId);
      return normalized;
    }

    if (role === "SUPERVISOR") {
      const allowedStoreIds = Array.isArray(source.allowedStoreIds)
        ? Array.from(
            new Set(
              source.allowedStoreIds
                .map((id) => this.normalizeString(id))
                .filter((id): id is string => Boolean(id)),
            ),
          )
        : [];
      normalized.allowedStoreIds = allowedStoreIds;
      return normalized;
    }

    return normalized;
  }

  private validateRoleStorePermissions(
    role: string,
    permissions: Record<string, unknown> | null,
  ): void {
    if (role === "CASHIER" || role === "KITCHEN") {
      const assignedStoreId = this.normalizeString(permissions?.assignedStoreId);
      if (!assignedStoreId) {
        throw new BadRequestException(
          "Assigned store is required for CASHIER and KITCHEN roles",
        );
      }
    }

    if (role === "SUPERVISOR") {
      const allowedStoreIds = Array.isArray(permissions?.allowedStoreIds)
        ? permissions.allowedStoreIds
        : [];
      if (!allowedStoreIds.length) {
        throw new BadRequestException(
          "Allowed stores are required for SUPERVISOR role",
        );
      }
    }
  }

  private generateTemporaryPassword(length = 10): string {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
    const bytes = randomBytes(length);
    let password = "";

    for (let i = 0; i < length; i++) {
      password += chars[bytes[i] % chars.length];
    }

    return password;
  }

  async getUsers(tenantId: string, page: number = 1, limit: number = 10) {
    const { skip } = parsePagination(page, limit);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          permissions: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where: { tenantId } }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized access to this user");
    }

    return user;
  }

  async createUser(data: CreateUserDto, tenantId: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        tenantId,
        email: data.email,
      },
    });

    if (existing) {
      throw new ConflictException("Email already exists for this tenant");
    }

    const normalizedPermissions = this.normalizePermissions(
      data.role,
      data.permissions as UserPermissionsPayload | undefined,
    );
    this.validateRoleStorePermissions(data.role, normalizedPermissions);

    const generatedPassword = Math.random().toString(36).slice(-8);
    const rawPassword = data.password?.trim() || generatedPassword;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as any,
        tenantId,
        isActive: true,
        permissions: normalizedPermissions as any,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    return {
      ...user,
      defaultPassword: data.password ? undefined : rawPassword,
    };
  }

  async updateUser(id: string, data: UpdateUserDto, tenantId: string) {
    const user = await this.getUserById(id, tenantId);

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findFirst({
        where: {
          tenantId,
          email: data.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException("Email already exists for this tenant");
      }
    }

    const updateData: any = { ...data };
    delete updateData.permissions;

    if (data.role) {
      updateData.role = data.role;
    }

    if (data.password) {
      const trimmedPassword = data.password.trim();
      if (!trimmedPassword) {
        throw new BadRequestException("Password cannot be empty");
      }
      updateData.password = await bcrypt.hash(trimmedPassword, 10);
      updateData.passwordChangedAt = new Date();
    }

    const targetRole = data.role || user.role;
    const hasPermissionsInPayload = Object.prototype.hasOwnProperty.call(
      data,
      "permissions",
    );
    if (hasPermissionsInPayload || data.role) {
      const sourcePermissions = hasPermissionsInPayload
        ? (data.permissions as UserPermissionsPayload | undefined)
        : (user.permissions as UserPermissionsPayload | undefined);
      const normalizedPermissions = this.normalizePermissions(
        targetRole,
        sourcePermissions,
      );
      this.validateRoleStorePermissions(targetRole, normalizedPermissions);
      updateData.permissions = normalizedPermissions as any;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        permissions: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async changePassword(id: string, data: ChangePasswordDto, tenantId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { password: true, tenantId: true },
    });

    if (!user || user.tenantId !== tenantId) {
      throw new ForbiddenException("Unauthorized");
    }

    const isValid = await bcrypt.compare(data.oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestException("Invalid old password");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
  }

  async deleteUser(id: string, tenantId: string) {
    await this.getUserById(id, tenantId);

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: "User deleted successfully" };
  }

  async getUserRole(id: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    return user?.role || null;
  }

  async exportUsers(tenantId: string) {
    const users = await this.prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return users;
  }

  async getUserStats(tenantId: string) {
    const total = await this.prisma.user.count({ where: { tenantId } });
    const active = await this.prisma.user.count({
      where: { tenantId, isActive: true },
    });
    return { total, active, inactive: total - active };
  }

  async resetPassword(_email: string, _tenantId: string) {
    return { message: "Password reset email sent" };
  }

  async resetUserPassword(id: string, tenantId: string) {
    await this.getUserById(id, tenantId);

    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
        passwordChangedAt: new Date(),
      },
    });

    return {
      message: "Temporary password generated successfully",
      password: temporaryPassword,
    };
  }

  async activateUser(id: string, tenantId: string) {
    await this.getUserById(id, tenantId);
    return this.prisma.user.update({ where: { id }, data: { isActive: true } });
  }

  async deactivateUser(id: string, tenantId: string) {
    await this.getUserById(id, tenantId);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
