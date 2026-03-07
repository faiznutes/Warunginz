import { Module } from "@nestjs/common";
import { CustomerEngagementController } from "./customer-engagement.controller";

@Module({
  controllers: [CustomerEngagementController],
})
export class CustomerEngagementModule {}
