import { Module } from "@nestjs/common";
import { AdvancedReportingController } from "./advanced-reporting.controller";

@Module({
  controllers: [AdvancedReportingController],
})
export class AdvancedReportingModule {}
