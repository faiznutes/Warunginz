import {
  IsString,
  IsEmail,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
} from "class-validator";

export class CreateMemberDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MaxLength(20)
  phone: string;

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
}
