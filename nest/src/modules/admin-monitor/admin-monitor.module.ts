import { Module } from "@nestjs/common";
import { AdminMonitorController } from "./admin-monitor.controller";
import { AdminMonitorService } from "./admin-monitor.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AdminMonitorController],
  providers: [AdminMonitorService],
  exports: [AdminMonitorService],
})
export class AdminMonitorModule {}
