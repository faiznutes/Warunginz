import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcryptjs";

@Injectable()
export class PasswordService {
  constructor(private readonly prisma: PrismaService) {}

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const current = currentPassword?.trim();
    const next = newPassword?.trim();

    if (!current || !next) {
      throw new BadRequestException(
        "Current password and new password are required",
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    const currentMatches = await bcrypt.compare(current, user.password);
    if (!currentMatches) {
      throw new BadRequestException("Current password is incorrect");
    }

    if (next.length < 8) {
      throw new BadRequestException(
        "New password must be at least 8 characters",
      );
    }

    const isSamePassword = await bcrypt.compare(next, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        "New password must be different from current password",
      );
    }

    const hashedPassword = await bcrypt.hash(next, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    return {
      message: "Password changed successfully",
      userId,
    };
  }

  async resetPassword(email: string) {
    return {
      message: "Password reset email sent",
      email,
    };
  }

  async validatePasswordStrength(password: string) {
    const candidate = typeof password === "string" ? password : "";
    const hasMinLength = candidate.length >= 8;
    const hasUpperCase = /[A-Z]/.test(candidate);
    const hasLowerCase = /[a-z]/.test(candidate);
    const hasNumber = /[0-9]/.test(candidate);

    const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

    return {
      isValid,
      requirements: {
        minLength: hasMinLength,
        upperCase: hasUpperCase,
        lowerCase: hasLowerCase,
        number: hasNumber,
      },
    };
  }
}
