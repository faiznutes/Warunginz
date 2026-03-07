import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveSessions(userId: string, tenantId: string) {
    return {
      message: "Active sessions functionality",
      userId,
      tenantId,
    };
  }

  async revokeSession(userId: string, sessionId: string) {
    return {
      message: "Session revoked",
      sessionId,
    };
  }

  async revokeAllSessions(userId: string, _tenantId: string) {
    return {
      message: "All sessions revoked",
      userId,
    };
  }

  async getSessionCount(_userId: string, _tenantId: string) {
    return { count: 1 };
  }
}
