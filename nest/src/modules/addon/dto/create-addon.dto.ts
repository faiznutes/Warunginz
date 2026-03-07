import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
  IsInt,
  Min,
} from "class-validator";

export class CreateAddonDto {
  @IsString()
  addonId: string;

  @IsString()
  addonName: string;

  @IsString()
  addonType: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  currentUsage?: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsObject()
  config?: any;

  @IsOptional()
  @IsString()
  purchasedBy?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
