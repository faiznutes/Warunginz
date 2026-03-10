import { Module } from "@nestjs/common";
import { SuperadminBackupController } from "./superadmin-backup.controller";
import { SuperadminBackupService } from "./superadmin-backup.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SuperadminBackupController],
  providers: [SuperadminBackupService],
  exports: [SuperadminBackupService],
})
export class SuperadminBackupModule {}
