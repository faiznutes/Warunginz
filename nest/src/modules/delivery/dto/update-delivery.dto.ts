import { IsString, IsOptional, MaxLength, IsBoolean } from "class-validator";

export class UpdateDeliveryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  courier?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiSecret?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  baseUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
