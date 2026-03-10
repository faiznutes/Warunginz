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
import { ReceiptService } from "./receipt.service";
import { CreateReceiptDto } from "./dto/create-receipt.dto";
import { UpdateReceiptDto } from "./dto/update-receipt.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("receipts")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getReceipts(@TenantId() tenantId: string, @Query() query: any) {
    return this.receiptService.getReceipts(tenantId, query);
  }

  @Get("templates")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getReceiptTemplates(@TenantId() tenantId: string) {
    return this.receiptService.getReceiptTemplates(tenantId);
  }

  @Get("templates/default")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getDefaultTemplate(@TenantId() tenantId: string) {
    return this.receiptService.getDefaultTemplate(tenantId);
  }

  @Get("templates/:id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getTemplateById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.receiptService.getTemplateById(id, tenantId);
  }

  @Get("generate/:orderId")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async generateReceipt(@Param("orderId") orderId: string, @TenantId() tenantId: string) {
    const template = await this.receiptService.getDefaultTemplate(tenantId);
    return { orderId, template, generated: true };
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getReceiptById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.receiptService.getReceiptById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createReceipt(
    @Body() createReceiptDto: CreateReceiptDto,
    @TenantId() tenantId: string,
  ) {
    return this.receiptService.createReceipt(createReceiptDto, tenantId);
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updateReceipt(
    @Param("id") id: string,
    @Body() updateReceiptDto: UpdateReceiptDto,
    @TenantId() tenantId: string,
  ) {
    return this.receiptService.updateReceipt(id, updateReceiptDto, tenantId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteReceipt(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.receiptService.deleteReceipt(id, tenantId);
  }

  @Post("templates")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createTemplate(
    @Body() createReceiptDto: CreateReceiptDto,
    @TenantId() tenantId: string,
  ) {
    return this.receiptService.createReceipt(createReceiptDto, tenantId);
  }

  @Put("templates/:id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updateTemplate(
    @Param("id") id: string,
    @Body() updateReceiptDto: UpdateReceiptDto,
    @TenantId() tenantId: string,
  ) {
    return this.receiptService.updateReceipt(id, updateReceiptDto, tenantId);
  }

  @Delete("templates/:id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteTemplate(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.receiptService.deleteReceipt(id, tenantId);
  }

  @Post("templates/:id/set-default")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async setDefaultTemplate(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.receiptService.updateReceipt(id, { isDefault: true } as any, tenantId);
  }
}

