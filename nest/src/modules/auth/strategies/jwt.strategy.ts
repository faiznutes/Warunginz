import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../../prisma/prisma.service";

const isDebug = process.env.DEBUG === "true";

export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: (() => {
        const secret = config.get<string>("JWT_SECRET");
        if (!secret || secret.length < 32) {
          throw new Error(
            "JWT_SECRET must be at least 32 characters in production",
          );
        }
        return secret;
      })(),
    });
  }

  async validate(payload: JwtPayload) {
    if (isDebug)
      console.log(
        "JWT Strategy validate called with payload:",
        JSON.stringify(payload),
      );
    try {
      if (isDebug) console.log("Fetching user with ID:", payload.userId);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        include: { tenant: true },
      });
      if (isDebug) console.log("User found:", user ? "yes" : "no");
      if (user && isDebug) {
        console.log("User details:", {
          id: user.id,
          role: user.role,
          tenantId: user.tenantId,
          tenant: user.tenant?.name,
        });
      }

      if (!user) throw new UnauthorizedException("User not found");
      if (!user.isActive) throw new UnauthorizedException("User inactive");
      if (user.role !== "SUPER_ADMIN" && user.tenant && !user.tenant.isActive) {
        throw new UnauthorizedException("Tenant inactive");
      }

      const permissions =
        user.permissions && typeof user.permissions === "object"
          ? (user.permissions as Record<string, unknown>)
          : {};
      const assignedStoreId =
        (permissions as { assignedStoreId?: string }).assignedStoreId ?? null;

      const result = {
        id: user.id,
        tenantId: payload.tenantId || user.tenantId,
        role: user.role,
        email: user.email,
        name: user.name,
        permissions,
        assignedStoreId,
      };
      if (isDebug)
        console.log("Returning from validate:", JSON.stringify(result));
      return result;
    } catch (error) {
      if (isDebug) console.error("JWT validate error:", error.message || error);
      throw new UnauthorizedException("Invalid token");
    }
  }
}
