import { IsString, IsOptional } from "class-validator";

export class UpdateContactDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  reply?: string;

  @IsOptional()
  @IsString()
  repliedBy?: string;
}
