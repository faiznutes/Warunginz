import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { PasswordService } from "./password.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import {
  ChangeOwnPasswordDto,
  ResetPasswordDto,
  ValidatePasswordDto,
} from "./dto/password.dto";

@Controller("password")
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Post("change")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
  async changePassword(
    @Body() body: ChangeOwnPasswordDto,
    @CurrentUser() user: any,
  ) {
    return this.passwordService.changePassword(
      user.id,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Post("reset")
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.passwordService.resetPassword(body.email);
  }

  @Post("validate")
  async validatePasswordStrength(@Body() body: ValidatePasswordDto) {
    return this.passwordService.validatePasswordStrength(body.password);
  }

  @Post("update")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
  async updatePassword(
    @Body() body: ChangeOwnPasswordDto,
    @CurrentUser() user: any,
  ) {
    return this.passwordService.changePassword(
      user.id,
      body.currentPassword,
      body.newPassword,
    );
  }
}
