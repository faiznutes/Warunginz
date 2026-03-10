import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminMonitorModule } from "../admin-monitor/admin-monitor.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { AddonModule } from "../addon/addon.module";

@Module({
  imports: [AdminMonitorModule, SubscriptionsModule, AddonModule],
  controllers: [AdminController],
})
export class AdminModule {}
