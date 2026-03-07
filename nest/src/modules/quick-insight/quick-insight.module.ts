import { Module } from "@nestjs/common";
import { QuickInsightController } from "./quick-insight.controller";

@Module({
  controllers: [QuickInsightController],
})
export class QuickInsightModule {}
