import { Module } from "@nestjs/common";
import { StockAlertController } from "./stock-alert.controller";
import { StockAlertService } from "./stock-alert.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [StockAlertController],
  providers: [StockAlertService],
  exports: [StockAlertService],
})
export class StockAlertModule {}
