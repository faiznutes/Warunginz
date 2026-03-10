import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { PaymentLegacyController } from "./payment-legacy.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController, PaymentLegacyController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
