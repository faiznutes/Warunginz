import { Module } from "@nestjs/common";
import { FinancialManagementController } from "./financial-management.controller";
import { FinancialManagementService } from "./financial-management.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [FinancialManagementController],
  providers: [FinancialManagementService],
  exports: [FinancialManagementService],
})
export class FinancialManagementModule {}
