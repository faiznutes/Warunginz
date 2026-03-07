import { IsOptional, IsString, IsDateString, IsEnum, Max, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDailySalesDto {
  @IsOptional()
  @IsDateString()
  startDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsDateString()
  endDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  outletId?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(100)
  limit: number = 30;
}

export class GetProductSummaryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['revenue', 'quantity', 'profit'])
  sortBy: string = 'revenue';

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number = 20;
}

export class GetCustomerRevenueDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['total', 'order_count', 'avg_order'])
  sortBy: string = 'total';

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit: number = 20;
}

export class GetShiftSummaryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  outletId?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(100)
  limit: number = 10;
}

export class ExportReportDto {
  @IsString()
  @IsEnum(['daily-sales', 'product-summary', 'customer-revenue', 'shift-summary'])
  reportType: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  format: string = 'csv'; // csv, json
}
