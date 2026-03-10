import { Module } from "@nestjs/common";
import { ContactController, ContactAliasController } from "./contact.controller";
import { ContactService } from "./contact.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ContactController, ContactAliasController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
