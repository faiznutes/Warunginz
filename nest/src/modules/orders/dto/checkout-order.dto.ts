import { Type } from "class-transformer";
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { CreateOrderDto } from "./create-order.dto";

const PAYMENT_METHODS = [
  "CASH",
  "QRIS",
  "CARD",
  "E_WALLET",
  "BANK_TRANSFER",
  "SHOPEEPAY",
  "DANA",
] as const;

export class CheckoutOrderDto extends CreateOrderDto {
  @IsIn(PAYMENT_METHODS)
  paymentMethod: (typeof PAYMENT_METHODS)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cashAmount?: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  qrCode?: string;

  @IsOptional()
  @IsString()
  qrCodeImage?: string;

  @IsOptional()
  @IsString()
  servedBy?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
