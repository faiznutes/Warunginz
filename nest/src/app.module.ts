import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as Joi from "joi";
import { join } from "path";
import { PrismaModule } from "./prisma/prisma.module";
import { CorrelationIdMiddleware } from "./common/middleware/correlation-id.middleware";
import { HealthModule } from "./common/health/health.module";
import { LoggerModule } from "./common/logger/logger.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ProductsModule } from "./modules/products/products.module";
import { ProductAdjustmentModule } from "./modules/product-adjustment/product-adjustment.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { CashShiftsModule } from "./modules/cash-shifts/cash-shifts.module";
import { StoreShiftsModule } from "./modules/store-shifts/store-shifts.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { OutletsModule } from "./modules/outlets/outlets.module";
import { UsersModule } from "./modules/users/users.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { MembersModule } from "./modules/members/members.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { DiscountModule } from "./modules/discount/discount.module";
import { SupplierModule } from "./modules/supplier/supplier.module";
import { EmployeeModule } from "./modules/employee/employee.module";
import { WebhookModule } from "./modules/webhook/webhook.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { SessionModule } from "./modules/session/session.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { FinancialManagementModule } from "./modules/financial-management/financial-management.module";
import { SuperadminBackupModule } from "./modules/superadmin-backup/superadmin-backup.module";
import { TenantBackupModule } from "./modules/tenant-backup/tenant-backup.module";
import { TwoFactorModule } from "./modules/2fa/two-factor.module";
import { AddonModule } from "./modules/addon/addon.module";
import { ArchiveModule } from "./modules/archive/archive.module";
import { AuditLogModule } from "./modules/audit-log/audit-log.module";
import { ContactModule } from "./modules/contact/contact.module";
import { DeliveryModule } from "./modules/delivery/delivery.module";
import { InternalModule } from "./modules/internal/internal.module";
import { PasswordModule } from "./modules/password/password.module";
import { PdfModule } from "./modules/pdf/pdf.module";
import { PurchaseOrderModule } from "./modules/purchase-order/purchase-order.module";
import { ReceiptModule } from "./modules/receipt/receipt.module";
import { StockAlertModule } from "./modules/stock-alert/stock-alert.module";
import { StockTransferModule } from "./modules/stock-transfer/stock-transfer.module";
import { SubscriptionReceiptModule } from "./modules/subscription-receipt/subscription-receipt.module";
import { SupportModule } from "./modules/support/support.module";
import { MarketingModule } from "./modules/marketing/marketing.module";
import { EmailModule } from "./modules/email/email.module";
import { TenantProfileModule } from "./modules/tenant-profile/tenant-profile.module";
import { AdminModule } from "./modules/admin/admin.module";
import { RewardsModule } from "./modules/rewards/rewards.module";
import { RetentionModule } from "./modules/retention/retention.module";
import { GdprModule } from "./modules/gdpr/gdpr.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { ProductStubModule } from "./modules/product-stub/product-stub.module";
import { QuickInsightModule } from "./modules/quick-insight/quick-insight.module";
import { AdvancedReportingModule } from "./modules/advanced-reporting/advanced-reporting.module";
import { CustomerEngagementModule } from "./modules/customer-engagement/customer-engagement.module";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("production"),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default("7d"),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  CORS_ORIGIN: Joi.string().required(),
  FRONTEND_URL: Joi.string().required(),
  BACKEND_URL: Joi.string().required(),
  INTERNAL_API_KEY: Joi.string().min(16).allow(""),
  MIDTRANS_MERCHANT_ID: Joi.string().allow(""),
  MIDTRANS_SERVER_KEY: Joi.string().allow(""),
  MIDTRANS_CLIENT_KEY: Joi.string().allow(""),
  MIDTRANS_IS_PRODUCTION: Joi.boolean().default(false),
  SMTP_HOST: Joi.string().allow(""),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().allow(""),
  SMTP_PASS: Joi.string().allow(""),
  SMTP_FROM: Joi.string().allow(""),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../.env"],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist'),
      exclude: ['/api/(.*)'],
      serveStaticOptions: {
        fallthrough: true, // Allow 404 to fall through to other handlers/filters if file not found
      },
    }),
    LoggerModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    ProductAdjustmentModule,
    ProductsModule,
    OrdersModule,
    CashShiftsModule,
    StoreShiftsModule,
    CustomersModule,
    ReportsModule,
    SubscriptionsModule,
    OutletsModule,
    UsersModule,
    SettingsModule,
    TenantsModule,
    PaymentsModule,
    AnalyticsModule,
    MembersModule,
    DashboardModule,
    DiscountModule,
    SupplierModule,
    EmployeeModule,
    WebhookModule,
    FinanceModule,
    SessionModule,
    TransactionsModule,
    FinancialManagementModule,
    SuperadminBackupModule,
    TenantBackupModule,
    TwoFactorModule,
    AddonModule,
    ArchiveModule,
    AuditLogModule,
    ContactModule,
    DeliveryModule,
    InternalModule,
    PasswordModule,
    PdfModule,
    PurchaseOrderModule,
    ReceiptModule,
    StockAlertModule,
    StockTransferModule,
    SubscriptionReceiptModule,
    SupportModule,
    MarketingModule,
    EmailModule,
    TenantProfileModule,
    AdminModule,
    RewardsModule,
    RetentionModule,
    GdprModule,
    InventoryModule,
    ProductStubModule,
    QuickInsightModule,
    AdvancedReportingModule,
    CustomerEngagementModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes("*");
  }
}
