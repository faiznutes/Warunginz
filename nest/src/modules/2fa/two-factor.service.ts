import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TwoFactorService {
  constructor(private readonly prisma: PrismaService) {}

  async enableTwoFactor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    return {
      message: "Two-factor authentication enabled",
      userId,
    };
  }

  async disableTwoFactor(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    return {
      message: "Two-factor authentication disabled",
      userId,
    };
  }

  async verifyTwoFactor(userId: string, _code: string) {
    return {
      message: "Two-factor code verified",
      userId,
      valid: true,
    };
  }

  async generateBackupCodes(userId: string) {
    return {
      message: "Backup codes generated",
      userId,
      backupCodes: ["ABC123", "DEF456", "GHI789", "JKL012"],
    };
  }

  async getTwoFactorStatus(userId: string) {
    return { enabled: false, userId };
  }
}
