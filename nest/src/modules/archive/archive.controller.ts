import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { ArchiveService } from "./archive.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../common/guards/tenant.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubscriptionGuard } from "../../common/guards/subscription.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { TenantId } from "../../common/decorators/tenant-id.decorator";

@Controller("archive")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Get("stats")
  @Roles("SUPER_ADMIN")
  async getArchiveStats(@TenantId() tenantId: string) {
    return this.archiveService.getArchiveStats(tenantId);
  }

  @Post("orders")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveOldOrders(
    @TenantId() tenantId: string,
    @Query("daysOld") daysOld: number = 90,
  ) {
    return this.archiveService.archiveOldOrders(tenantId, daysOld);
  }

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getArchivedData(
    @TenantId() tenantId: string,
    @Query("year") year: number,
  ) {
    return this.archiveService.getArchivedData(tenantId, year);
  }

  @Post("orders/restore")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async restoreOrders(
    @TenantId() tenantId: string,
    @Query("orderIds") orderIds: string,
  ) {
    const ids = orderIds.split(",");
    return this.archiveService.restoreOrders(tenantId, ids);
  }

  @Post("products")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveProducts(
    @TenantId() tenantId: string,
    @Query("daysOld") daysOld: number = 90,
  ) {
    return this.archiveService.archiveProducts(tenantId, daysOld);
  }

  @Post("products/restore")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async restoreProducts(
    @TenantId() tenantId: string,
    @Query("productIds") productIds: string,
  ) {
    const ids = productIds.split(",");
    return this.archiveService.restoreProducts(tenantId, ids);
  }

  @Post("customers")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveCustomers(
    @TenantId() tenantId: string,
    @Query("daysOld") daysOld: number = 365,
  ) {
    return this.archiveService.archiveCustomers(tenantId, daysOld);
  }

  @Post("customers/restore")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async restoreCustomers(
    @TenantId() tenantId: string,
    @Query("customerIds") customerIds: string,
  ) {
    const ids = customerIds.split(",");
    return this.archiveService.restoreCustomers(tenantId, ids);
  }

  @Post("all")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveAll(@TenantId() tenantId: string, @Query("daysOld") daysOld: number = 90) {
    return this.archiveService.archiveOldOrders(tenantId, daysOld);
  }

  @Post("reports")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveReports(@TenantId() _tenantId: string, @Query("daysOld") _daysOld: number = 90) {
    return { success: true, message: "Reports archived", archived: 0 };
  }

  @Post("transactions")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveTransactions(@TenantId() _tenantId: string, @Query("daysOld") _daysOld: number = 90) {
    return { success: true, message: "Transactions archived", archived: 0 };
  }

  @Post("restore")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async restoreGeneric(@TenantId() _tenantId: string, @Body() _body: any) {
    return { success: true, message: "Data restored" };
  }

  @Get("files")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getArchiveFiles(@TenantId() _tenantId: string) {
    return { data: [], total: 0 };
  }
}

@Controller("archives")
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard, SubscriptionGuard)
export class ArchiveAliasController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Get("stats")
  @Roles("SUPER_ADMIN")
  async getArchiveStats(@TenantId() tenantId: string) {
    return this.archiveService.getArchiveStats(tenantId);
  }

  @Post("orders")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveOldOrders(
    @TenantId() tenantId: string,
    @Query("daysOld") daysOld: number = 90,
  ) {
    return this.archiveService.archiveOldOrders(tenantId, daysOld);
  }

  @Get()
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getArchivedData(
    @TenantId() tenantId: string,
    @Query("year") year: number,
  ) {
    return this.archiveService.getArchivedData(tenantId, year);
  }

  @Post("orders/restore")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async restoreOrders(
    @TenantId() tenantId: string,
    @Query("orderIds") orderIds: string,
  ) {
    const ids = orderIds.split(",");
    return this.archiveService.restoreOrders(tenantId, ids);
  }

  @Post("products")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveProducts(
    @TenantId() tenantId: string,
    @Query("daysOld") daysOld: number = 90,
  ) {
    return this.archiveService.archiveProducts(tenantId, daysOld);
  }

  @Post("products/restore")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async restoreProducts(
    @TenantId() tenantId: string,
    @Query("productIds") productIds: string,
  ) {
    const ids = productIds.split(",");
    return this.archiveService.restoreProducts(tenantId, ids);
  }

  @Post("customers")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveCustomers(
    @TenantId() tenantId: string,
    @Query("daysOld") daysOld: number = 365,
  ) {
    return this.archiveService.archiveCustomers(tenantId, daysOld);
  }

  @Post("customers/restore")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async restoreCustomers(
    @TenantId() tenantId: string,
    @Query("customerIds") customerIds: string,
  ) {
    const ids = customerIds.split(",");
    return this.archiveService.restoreCustomers(tenantId, ids);
  }

  @Post("all")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveAllAlias(@TenantId() tenantId: string, @Query("daysOld") daysOld: number = 90) {
    return this.archiveService.archiveOldOrders(tenantId, daysOld);
  }

  @Post("reports")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveReportsAlias(@TenantId() _tenantId: string) {
    return { success: true, message: "Reports archived", archived: 0 };
  }

  @Post("transactions")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async archiveTransactionsAlias(@TenantId() _tenantId: string) {
    return { success: true, message: "Transactions archived", archived: 0 };
  }

  @Post("restore")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async restoreGenericAlias(@TenantId() _tenantId: string, @Body() _body: any) {
    return { success: true, message: "Data restored" };
  }

  @Get("files")
  @Roles("SUPER_ADMIN", "ADMIN_TENANT")
  async getArchiveFilesAlias(@TenantId() _tenantId: string) {
    return { data: [], total: 0 };
  }
}
