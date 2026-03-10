import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("email-templates")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles("SUPER_ADMIN", "ADMIN_TENANT")
export class EmailTemplatesController {
  @Get()
  async getTemplates(@TenantId() _tenantId: string) {
    return { data: [], total: 0 };
  }

  @Post()
  async createTemplate(@Body() data: any, @TenantId() _tenantId: string) {
    return { success: true, id: "stub-template-id", ...data };
  }

  @Put(":id")
  async updateTemplate(@Param("id") id: string, @Body() data: any) {
    return { success: true, id, ...data };
  }

  @Delete(":id")
  async deleteTemplate(@Param("id") id: string) {
    return { success: true, message: `Template ${id} deleted` };
  }
}
