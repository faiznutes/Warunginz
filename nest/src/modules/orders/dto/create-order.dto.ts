import { IsUUID, IsNumber, IsPositive, IsArray, ArrayMinSize, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  memberId?: string;

  @IsOptional()
  @IsString()
  temporaryCustomerName?: string;

  @IsOptional()
  @IsUUID()
  outletId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount: number = 0;

  @IsOptional()
  sendToKitchen: boolean = false;

  @IsOptional()
  @IsString()
  notes?: string;
}
