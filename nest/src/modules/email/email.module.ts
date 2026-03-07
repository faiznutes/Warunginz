import { Module } from "@nestjs/common";
import { EmailSchedulerController } from "./email-scheduler.controller";
import { EmailTemplatesController } from "./email-templates.controller";
import { EmailAnalyticsController } from "./email-analytics.controller";

@Module({
  controllers: [EmailSchedulerController, EmailTemplatesController, EmailAnalyticsController],
})
export class EmailModule {}
