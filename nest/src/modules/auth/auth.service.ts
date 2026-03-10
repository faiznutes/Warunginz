import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { PrismaService } from "../../prisma/prisma.service";
import { LoggerService } from "../../common/logger/logger.service";
import { LoginDto } from "./dto/login.dto";

const isDebug = process.env.DEBUG === "true";

export interface TokenPayload {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

export interface AuthResult {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId: string | null;
    tenantName: string | null;
    isActive: boolean;
    permissions: unknown;
    subscriptionEnd: Date | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  private get jwtSecret(): string {
    const secret = this.config.get<string>("JWT_SECRET");
    if (!secret || secret.length < 32) {
      throw new Error(
        "JWT_SECRET is missing or too short (min 32 chars). Application cannot sign tokens safely.",
      );
    }
    return secret;
  }

  private get jwtExpiresIn(): string {
    return this.config.get<string>("JWT_EXPIRES_IN") || "7d";
  }

  private generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }

  private generateRefreshToken(payload: TokenPayload): string {
    const refreshSecret =
      this.config.get<string>("JWT_REFRESH_SECRET") || this.jwtSecret;
    return jwt.sign(payload, refreshSecret, { expiresIn: "30d" });
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const email = dto.email.toLowerCase().trim();

    let user = await this.prisma.user.findFirst({
      where: { email, role: "SUPER_ADMIN" },
      include: { tenant: true },
    });

    if (!user) {
      const allUsers = await this.prisma.user.findMany({
        where: { email: { equals: email, mode: "insensitive" } },
        include: { tenant: true },
        take: 1,
      });
      user = allUsers[0] ?? null;
    }

    if (!user) {
      throw new UnauthorizedException(
        "Akun tidak ditemukan. Silakan hubungi admin.",
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        "Akun tidak aktif. Silakan hubungi admin.",
      );
    }

    if (user.role !== "SUPER_ADMIN") {
      if (!user.tenant) throw new ForbiddenException("Tenant not found");
      if (!user.tenant.isActive)
        throw new ForbiddenException("Tenant is inactive");
    } else if (!user.tenant) {
      throw new ForbiddenException("Tenant not found");
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException("Password salah");
    }

    await this.validateStoreAssignment(user);

    const tenantId = user.tenantId || "";
    const payload: TokenPayload = {
      userId: user.id,
      tenantId,
      role: user.role,
      email: user.email,
    };

    const token = this.generateToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name ?? null,
        isActive: user.isActive,
        permissions: (user.permissions as object) ?? {},
        subscriptionEnd: user.tenant?.subscriptionEnd ?? null,
      },
    };
  }

  private async validateStoreAssignment(user: {
    role: string;
    tenantId: string;
    permissions: unknown;
    tenant?: { id: string };
  }): Promise<void> {
    if (
      user.role !== "CASHIER" &&
      user.role !== "KITCHEN" &&
      user.role !== "SUPERVISOR"
    )
      return;

    const perms =
      (user.permissions as {
        assignedStoreId?: string;
        allowedStoreIds?: string[];
      }) ?? {};

    if (user.role === "CASHIER" || user.role === "KITCHEN") {
      const storeId = perms.assignedStoreId;
      if (!storeId) {
        throw new ForbiddenException(
          "Store belum ditetapkan untuk akun Anda. Silakan hubungi administrator.",
        );
      }
      const store = await this.prisma.outlet.findFirst({
        where: { id: storeId, tenantId: user.tenantId || user.tenant?.id },
      });
      if (!store)
        throw new ForbiddenException("Store yang ditetapkan tidak ditemukan.");
      if (!store.isActive) {
        throw new ForbiddenException(
          `Store "${store.name}" tidak aktif. Silakan hubungi administrator.`,
        );
      }
      return;
    }

    if (user.role === "SUPERVISOR") {
      const allowedIds = perms.allowedStoreIds ?? [];
      if (allowedIds.length === 0) {
        throw new ForbiddenException(
          "Belum ada store yang diizinkan. Silakan hubungi administrator.",
        );
      }
      const stores = await this.prisma.outlet.findMany({
        where: {
          id: { in: allowedIds },
          tenantId: user.tenantId || user.tenant?.id,
        },
      });
      const active = stores.filter((s: { isActive: boolean }) => s.isActive);
      if (active.length === 0) {
        const names = stores.map((s: { name: string }) => s.name).join(", ");
        throw new ForbiddenException(
          `Semua store yang diizinkan (${names}) tidak aktif. Silakan hubungi administrator.`,
        );
      }
    }
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const refreshSecret =
      this.config.get<string>("JWT_REFRESH_SECRET") || this.jwtSecret;
    let payload: TokenPayload;
    try {
      payload = jwt.verify(refreshToken, refreshSecret) as TokenPayload;
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: { tenant: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("User not found or inactive");
    }

    const newPayload: TokenPayload = {
      userId: user.id,
      tenantId: user.tenantId || "",
      role: user.role,
      email: user.email,
    };

    return {
      token: this.generateToken(newPayload),
      refreshToken: this.generateRefreshToken(newPayload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name ?? null,
        isActive: user.isActive,
        permissions: (user.permissions as object) ?? {},
        subscriptionEnd: user.tenant?.subscriptionEnd ?? null,
      },
    };
  }

  async getMe(userId: string) {
    if (isDebug) console.log("getMe called with userId:", userId);
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { tenant: true },
      });

      if (isDebug)
        console.log("getMe user result:", user ? "found" : "not found");

      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const result = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantName: user.tenant?.name ?? null,
          isActive: user.isActive,
          permissions: user.permissions ?? null,
          subscriptionEnd: user.tenant?.subscriptionEnd ?? null,
        },
      };
      return result;
    } catch (error) {
      console.error("Error in getMe:", error);
      throw error;
    }
  }

  async getMeFromToken(token: string) {
    try {
      const secret = this.jwtSecret;
      if (isDebug) console.log("[DEBUG] JWT_SECRET loaded from config");

      const decoded = jwt.verify(token, secret) as TokenPayload;
      if (isDebug) console.log("[DEBUG] Token decoded:", decoded);
      return this.getMe(decoded.userId);
    } catch (error) {
      if (isDebug)
        console.log("[DEBUG] Token verification failed:", error.message);
      throw new UnauthorizedException("Invalid token");
    }
  }
}
