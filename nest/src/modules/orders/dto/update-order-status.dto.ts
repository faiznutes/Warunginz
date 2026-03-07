import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED'])
  status: string;
}
