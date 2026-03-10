import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  MaxLength,
} from "class-validator";

export class UpdateReceiptDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  templateType?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  paperSize?: string;

  @IsOptional()
  @IsObject()
  header?: any;

  @IsOptional()
  @IsObject()
  footer?: any;

  @IsOptional()
  @IsObject()
  fields?: any;

  @IsOptional()
  @IsObject()
  styles?: any;
}
