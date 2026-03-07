import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  Min,
  IsBoolean,
} from "class-validator";

export class UpdateDiscountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsString()
  discountValueType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @IsOptional()
  @IsArray()
  applicableProducts?: any;

  @IsOptional()
  @IsArray()
  bundleProducts?: any;

  @IsOptional()
  @IsString()
  bundleDiscountProduct?: string;

  @IsOptional()
  @IsString()
  applicableTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
