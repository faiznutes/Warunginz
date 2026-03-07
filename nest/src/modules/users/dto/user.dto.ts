import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class UserPermissionsDto {
  @IsOptional()
  @IsBoolean()
  canEditOrders?: boolean;

  @IsOptional()
  @IsBoolean()
  canDeleteOrders?: boolean;

  @IsOptional()
  @IsBoolean()
  canCancelOrders?: boolean;

  @IsOptional()
  @IsBoolean()
  canRefundOrders?: boolean;

  @IsOptional()
  @IsBoolean()
  canViewReports?: boolean;

  @IsOptional()
  @IsBoolean()
  canEditReports?: boolean;

  @IsOptional()
  @IsBoolean()
  canExportReports?: boolean;

  @IsOptional()
  @IsBoolean()
  canManageProducts?: boolean;

  @IsOptional()
  @IsBoolean()
  canManageCustomers?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedStoreIds?: string[];

  @IsOptional()
  @IsString()
  assignedStoreId?: string;
}

export class CreateUserDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  password?: string;

  @IsEnum(['SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'])
  role: string;

  @IsOptional()
  @IsString()
  outletId?: string; // For staff assignment

  @IsOptional()
  @ValidateNested()
  @Type(() => UserPermissionsDto)
  permissions?: UserPermissionsDto;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  password?: string;

  @IsOptional()
  @IsEnum(['SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR', 'CASHIER', 'KITCHEN'])
  role?: string;

  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  outletId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserPermissionsDto)
  permissions?: UserPermissionsDto;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MaxLength(255)
  newPassword: string;
}
