import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  IsBoolean,
} from "class-validator";

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
