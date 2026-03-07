import { IsOptional, IsEnum, IsNumber, Max, IsString, IsPositive, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class GetOrdersDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsEnum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'])
  status?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  outletId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['createdAt', 'total', 'orderNumber'])
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder: string = 'desc';

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  sendToKitchen?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.length > 0) return [value];
    return undefined;
  })
  @IsArray()
  @IsEnum(['PENDING', 'COOKING', 'READY', 'SERVED'], { each: true })
  kitchenStatus?: string[];
}
