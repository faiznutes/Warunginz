import { IsString, IsEmail, IsOptional, MaxLength } from "class-validator";

export class CreateContactDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MaxLength(500)
  subject: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  type?: string;
}
