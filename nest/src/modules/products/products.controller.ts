import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Body,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { GetProductsDto } from "./dto/get-products.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { TenantRequired } from "../../common/decorators/tenant-required.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PassthroughInterceptor } from "../../common/interceptors/passthrough.interceptor";

@Controller("products")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
@TenantRequired()
@Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER", "KITCHEN")
@UseInterceptors(PassthroughInterceptor)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getProducts(
    @TenantId() tenantId: string | null,
    @Query() query: GetProductsDto,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.getProducts(tenantId, query);
  }

  @Get("low-stock/all")
  async getLowStock(@TenantId() tenantId: string | null) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.getLowStockProducts(tenantId);
  }

  @Get(":id([0-9a-fA-F-]{36})")
  async getById(@Param("id") id: string, @TenantId() tenantId: string | null) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.getProductById(id, tenantId);
  }

  @Post()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async createProduct(@TenantId() tenantId: string | null, @Body() dto: any) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.createProduct(dto, tenantId);
  }

  @Put(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async updateProduct(
    @Param("id") id: string,
    @TenantId() tenantId: string | null,
    @Body() dto: any,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.updateProduct(id, dto, tenantId);
  }

  @Delete(":id([0-9a-fA-F-]{36})")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async deleteProduct(
    @Param("id") id: string,
    @TenantId() tenantId: string | null,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.deleteProduct(id, tenantId);
  }

  @Put(":id([0-9a-fA-F-]{36})/stock")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async updateStock(
    @Param("id") id: string,
    @TenantId() tenantId: string | null,
    @Body() body: { quantity: number; operation?: "set" | "add" | "subtract" },
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.updateStock(
      id,
      body.quantity,
      tenantId,
      body.operation || "set",
    );
  }

  @Post("bulk-delete")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async bulkDeleteProducts(
    @TenantId() tenantId: string | null,
    @Body() body: { productIds: string[] },
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.bulkDeleteProducts(body.productIds, tenantId);
  }

  @Get("categories")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async getCategories(@TenantId() tenantId: string | null) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.getCategories(tenantId);
  }

  @Get("search")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR", "CASHIER")
  async searchProducts(
    @TenantId() tenantId: string | null,
    @Query("q") query: string,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.searchProducts(tenantId, query);
  }

  @Get(":id([0-9a-fA-F-]{36})/history")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT", "SUPERVISOR")
  async getProductHistory(
    @TenantId() tenantId: string | null,
    @Param("id") id: string,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.getProductHistory(tenantId, id);
  }

  @Post(":id([0-9a-fA-F-]{36})/duplicate")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async duplicateProduct(
    @TenantId() tenantId: string | null,
    @Param("id") id: string,
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.duplicateProduct(tenantId, id);
  }

  @Post("bulk-update")
  @Roles("ADMIN_TENANT", "SUPER_ADMIN")
  async bulkUpdateProducts(
    @TenantId() tenantId: string | null,
    @Body() body: { productIds: string[]; data: any },
  ) {
    if (!tenantId) throw new BadRequestException("TenantId required");
    return this.productsService.bulkUpdateProducts(
      tenantId,
      body.productIds,
      body.data,
    );
  }
}
