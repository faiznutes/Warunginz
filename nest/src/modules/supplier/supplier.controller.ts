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
import { SupplierService } from "./supplier.service";
import { CreateSupplierDto } from "./dto/create-supplier.dto";
import { UpdateSupplierDto } from "./dto/update-supplier.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("suppliers")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getSuppliers(@TenantId() tenantId: string, @Query() query: any) {
    return this.supplierService.getSuppliers(tenantId, query);
  }

  @Get(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getSupplierById(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.supplierService.getSupplierById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async createSupplier(
    @Body() createSupplierDto: CreateSupplierDto,
    @TenantId() tenantId: string,
  ) {
    return this.supplierService.createSupplier(createSupplierDto, tenantId);
  }

  @Put(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async updateSupplier(
    @Param("id") id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @TenantId() tenantId: string,
  ) {
    return this.supplierService.updateSupplier(id, updateSupplierDto, tenantId);
  }

  @Delete(":id")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async deleteSupplier(@Param("id") id: string, @TenantId() tenantId: string) {
    return this.supplierService.deleteSupplier(id, tenantId);
  }

  @Get("stats")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getSupplierStats(@TenantId() tenantId: string) {
    return this.supplierService.getSupplierStats(tenantId);
  }

  @Get("export")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async exportSuppliers(@TenantId() tenantId: string) {
    return this.supplierService.exportSuppliers(tenantId);
  }
}
