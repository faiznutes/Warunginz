import { Module } from "@nestjs/common";
import { PasswordController } from "./password.controller";
import { PasswordService } from "./password.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [PasswordController],
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}
