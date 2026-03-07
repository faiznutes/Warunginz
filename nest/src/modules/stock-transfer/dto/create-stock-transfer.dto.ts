import { IsString, IsOptional } from "class-validator";

export class CreateStockTransferDto {
  @IsString()
  fromOutletId: string;

  @IsString()
  toOutletId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
