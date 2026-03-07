import { IsString, IsOptional, IsDateString } from "class-validator";

export class UpdateStockTransferDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @IsOptional()
  @IsString()
  receivedBy?: string;
}
