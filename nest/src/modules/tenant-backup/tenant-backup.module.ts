import { Module } from "@nestjs/common";
import { TenantBackupController } from "./tenant-backup.controller";
import { TenantBackupService } from "./tenant-backup.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [TenantBackupController],
  providers: [TenantBackupService],
  exports: [TenantBackupService],
})
export class TenantBackupModule {}
