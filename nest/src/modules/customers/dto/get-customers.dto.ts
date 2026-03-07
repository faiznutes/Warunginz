import { IsOptional, IsString, IsNumber, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCustomersDto {
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
  @IsString()
  search?: string; // Search by name, email, phone

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  outletId?: string;

  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder: string = 'desc';

  @IsOptional()
  @IsString()
  skipCache?: string;
}
