import { IsEmail, IsString, MinLength } from "class-validator";

export class ChangeOwnPasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;
}

export class ValidatePasswordDto {
  @IsString()
  password: string;
}
