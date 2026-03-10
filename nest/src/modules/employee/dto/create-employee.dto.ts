import { IsString, IsEmail, IsOptional, MaxLength } from "class-validator";

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MaxLength(100)
  position: string;
}
