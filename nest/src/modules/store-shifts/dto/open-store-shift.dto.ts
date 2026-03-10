import { IsString, IsUUID, IsNumber, IsOptional, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class OpenStoreShiftDto {
  @IsUUID()
  outletId: string;

  @IsString()
  @MinLength(1)
  shiftType: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  modalAwal?: number;

  @IsOptional()
  @IsString()
  catatan?: string;
}
