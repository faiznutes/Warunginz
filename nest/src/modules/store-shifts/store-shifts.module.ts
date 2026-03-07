import { Module } from '@nestjs/common';
import { StoreShiftsController } from './store-shifts.controller';
import { StoreShiftsService } from './store-shifts.service';

@Module({
  controllers: [StoreShiftsController],
  providers: [StoreShiftsService],
  exports: [StoreShiftsService],
})
export class StoreShiftsModule {}
