import { IsString, IsOptional, MaxLength, IsBoolean } from "class-validator";

export class CreateDeliveryDto {
  @IsString()
  @MaxLength(50)
  courier: string;

  @IsString()
  apiKey: string;

  @IsString()
  apiSecret: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  baseUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
