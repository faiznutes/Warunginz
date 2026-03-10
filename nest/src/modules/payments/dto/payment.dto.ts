import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";

export enum PaymentMethod {
  CASH = "CASH",
  QRIS = "QRIS",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
}

export class PaymentItemDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;
}

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsString()
  tenantId: string;

  @IsNumber()
  amount: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentItemDto)
  items?: PaymentItemDto[];
}

export class PaymentCallbackDto {
  @IsString()
  order_id: string;

  @IsString()
  transaction_status: string;

  @IsOptional()
  @IsString()
  transaction_id?: string;

  @IsOptional()
  @IsString()
  status_code?: string;

  @IsOptional()
  @IsString()
  status_message?: string;
}

export class PaymentQueryDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}

export class CreateAddonPaymentDto {
  @IsString()
  itemName: string;

  @IsNumber()
  amount: number;

  @IsString()
  itemId: string;

  @IsEnum(["addon", "subscription"])
  itemType: "addon" | "subscription";
}

export class CancelPaymentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
