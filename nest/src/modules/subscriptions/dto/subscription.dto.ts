import { IsString, IsOptional, IsNumber, IsPositive } from "class-validator";

export class GetSubscriptionsDto {
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  limit: number = 10;
}

export class CreateSubscriptionDto {
  @IsString()
  planId: string;
}

export class UpgradeSubscriptionDto {
  @IsOptional()
  @IsString()
  newPlanId?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  purchasedBy?: string;
}

export class AddAddonDto {
  @IsString()
  addonId: string;

  @IsOptional()
  @IsString()
  addonName?: string;

  @IsOptional()
  @IsString()
  addonType?: string;

  @IsOptional()
  @IsPositive()
  quantity: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  purchasedBy?: string;
}
