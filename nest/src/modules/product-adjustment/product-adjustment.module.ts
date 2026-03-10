import { Module } from "@nestjs/common";
import { ProductAdjustmentService } from "./product-adjustment.service";
import { ProductAdjustmentController } from "./product-adjustment.controller";

@Module({
  controllers: [ProductAdjustmentController],
  providers: [ProductAdjustmentService],
  exports: [ProductAdjustmentService],
})
export class ProductAdjustmentModule {}
