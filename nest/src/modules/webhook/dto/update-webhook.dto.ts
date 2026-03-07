import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
} from "class-validator";

export class UpdateWebhookDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsArray()
  events?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  secret?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  retryCount?: number;

  @IsOptional()
  @IsNumber()
  timeout?: number;
}
