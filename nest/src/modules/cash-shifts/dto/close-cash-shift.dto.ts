import { IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CloseCashShiftDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  uangFisikTutup: number;

  @IsOptional()
  @IsString()
  catatan?: string;
}
