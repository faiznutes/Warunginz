import {
  IsString,
  IsArray,
  IsOptional,
  IsNumber,
  IsBoolean,
  MaxLength,
} from "class-validator";

export class CreateWebhookDto {
  @IsString()
  @MaxLength(500)
  url: string;

  @IsArray()
  events: string[];

  @IsString()
  @MaxLength(255)
  secret: string;

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
