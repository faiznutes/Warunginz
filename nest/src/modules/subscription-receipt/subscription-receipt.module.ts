import { Module } from "@nestjs/common";
import { SubscriptionReceiptController } from "./subscription-receipt.controller";
import { SubscriptionReceiptService } from "./subscription-receipt.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SubscriptionReceiptController],
  providers: [SubscriptionReceiptService],
  exports: [SubscriptionReceiptService],
})
export class SubscriptionReceiptModule {}
