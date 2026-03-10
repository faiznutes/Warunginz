import { IsUUID } from 'class-validator';

export class CloseStoreShiftDto {
  @IsUUID()
  shiftId: string;

  @IsUUID()
  outletId: string;
}
