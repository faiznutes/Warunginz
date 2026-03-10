import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
} from "class-validator";

export class UpdateAddonDto {
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
}
