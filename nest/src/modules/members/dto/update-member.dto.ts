import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
  IsBoolean,
} from "class-validator";

export class UpdateMemberDto {
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
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  memberCode?: string;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  loyaltyPoints?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
