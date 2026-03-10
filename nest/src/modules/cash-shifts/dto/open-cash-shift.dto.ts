import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class OpenCashShiftDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  modalAwal: number;

  @IsOptional()
  @IsString()
  catatan?: string;
}
