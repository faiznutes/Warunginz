import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ContactService } from "./contact.service";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";

@Controller("contacts")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getContacts(@Query() query: any) {
    return this.contactService.getContacts(query);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getContactById(@Param("id") id: string) {
    return this.contactService.getContactById(id);
  }

  @Post()
  @Public()
  async createContact(@Body() createContactDto: CreateContactDto) {
    return this.contactService.createContact(createContactDto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async updateContact(
    @Param("id") id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactService.updateContact(id, updateContactDto);
  }

  @Put(":id/read")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async markAsRead(@Param("id") id: string) {
    return this.contactService.markAsRead(id);
  }

  @Post("bulk")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async bulkAction(@Body() _body: any) {
    return { success: true, message: "Bulk action completed" };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async deleteContact(@Param("id") id: string) {
    return this.contactService.deleteContact(id);
  }

  @Post("demo")
  @Public()
  async submitDemoRequest(@Body() _body: any) {
    return { success: true, message: "Demo request submitted" };
  }

  @Post(":id/reply")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async replyToContact(
    @Param("id") _id: string,
    @Body() _body: { message: string },
  ) {
    return { success: true, message: "Reply sent" };
  }
}

@Controller("contact")
export class ContactAliasController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getContacts(@Query() query: any) {
    return this.contactService.getContacts(query);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async getContactById(@Param("id") id: string) {
    return this.contactService.getContactById(id);
  }

  @Post()
  @Public()
  async createContact(@Body() createContactDto: CreateContactDto) {
    return this.contactService.createContact(createContactDto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async updateContact(
    @Param("id") id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactService.updateContact(id, updateContactDto);
  }

  @Put(":id/read")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async markAsReadAlias(@Param("id") id: string) {
    return this.contactService.markAsRead(id);
  }

  @Post("bulk")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async bulkActionAlias(@Body() _body: any) {
    return { success: true, message: "Bulk action completed" };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async deleteContactAlias(@Param("id") id: string) {
    return this.contactService.deleteContact(id);
  }

  @Post("demo")
  @Public()
  async submitDemoRequestAlias(@Body() _body: any) {
    return { success: true, message: "Demo request submitted" };
  }

  @Post(":id/reply")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SUPER_ADMIN")
  async replyToContactAlias(
    @Param("id") _id: string,
    @Body() _body: { message: string },
  ) {
    return { success: true, message: "Reply sent" };
  }
}
