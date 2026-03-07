import { IsString, IsOptional, IsObject, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum CurrencyEnum {
  USD = 'USD',
  IDR = 'IDR',
  SGD = 'SGD',
  MYR = 'MYR',
}

export enum TimezoneEnum {
  UTC = 'UTC',
  ASIA_JAKARTA = 'Asia/Jakarta',
  ASIA_BANGKOK = 'Asia/Bangkok',
  ASIA_SINGAPORE = 'Asia/Singapore',
  ASIA_KUALA_LUMPUR = 'Asia/Kuala_Lumpur',
}

export class PosSettingsDto {
  @IsString()
  @IsOptional()
  orderPrefix?: string;

  @IsString()
  @IsOptional()
  receiptFormat?: string;

  @IsString()
  @IsOptional()
  numberingPattern?: string;

  @IsString()
  @IsOptional()
  companyLogo?: string;
}

export class EmailSettingsDto {
  @IsString()
  @IsOptional()
  senderEmail?: string;

  @IsString()
  @IsOptional()
  senderName?: string;

  @IsString()
  @IsOptional()
  replyTo?: string;

  @IsObject()
  @IsOptional()
  templates?: Record<string, string>;
}

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsEnum(TimezoneEnum)
  @IsOptional()
  timezone?: TimezoneEnum;

  @IsEnum(CurrencyEnum)
  @IsOptional()
  currency?: CurrencyEnum;

  @ValidateNested()
  @Type(() => PosSettingsDto)
  @IsOptional()
  posSettings?: PosSettingsDto;

  @ValidateNested()
  @Type(() => EmailSettingsDto)
  @IsOptional()
  emailSettings?: EmailSettingsDto;

  @IsObject()
  @IsOptional()
  featureToggles?: Record<string, boolean>;

  @IsString()
  @IsOptional()
  supportPhone?: string;

  @IsString()
  @IsOptional()
  supportEmail?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

export class GetSettingsResponseDto {
  id: string;
  tenantId: string;
  businessName: string;
  taxId: string;
  timezone: TimezoneEnum;
  currency: CurrencyEnum;
  posSettings: PosSettingsDto;
  emailSettings: EmailSettingsDto;
  featureToggles: Record<string, boolean>;
  supportPhone: string;
  supportEmail: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}
