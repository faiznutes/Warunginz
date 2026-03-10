import { Controller, Get, Post, Body, UseGuards, Logger } from "@nestjs/common";
import { InternalService } from "./internal.service";
import { Public } from "../../common/decorators/public.decorator";
import { InternalApiKeyGuard } from "../../common/guards/internal-api-key.guard";

@Controller("internal")
@Public()
@UseGuards(InternalApiKeyGuard)
export class InternalController {
  private readonly logger = new Logger(InternalController.name);

  constructor(private readonly internalService: InternalService) {}

  @Get("health")
  async healthCheck() {
    return this.internalService.healthCheck();
  }

  @Get("info")
  async getSystemInfo() {
    return this.internalService.getSystemInfo();
  }

  @Post("payment/webhook")
  async handlePaymentWebhook(@Body() body: any) {
    return this.internalService.handlePaymentWebhook(body);
  }

  @Post("backup")
  async triggerBackup(@Body() body: { tenantId?: string; type?: string }) {
    this.logger.warn(`[AUDIT] Backup triggered: tenantId=${body.tenantId}, type=${body.type}`);
    return this.internalService.triggerBackup(body.tenantId, body.type);
  }

  @Post("subscription/revert")
  async revertSubscriptions() {
    this.logger.warn("[AUDIT] Subscription revert triggered");
    return this.internalService.revertSubscriptions();
  }

  @Get("tenants/active")
  async getActiveTenants() {
    this.logger.log("[AUDIT] Active tenants list accessed");
    return { data: await this.internalService.getActiveTenants() };
  }

  @Post("api-key/rotate")
  async rotateApiKey(@Body() body: { newKey: string }) {
    this.logger.warn("[AUDIT] API key rotation triggered");
    return this.internalService.rotateApiKey(body.newKey);
  }

  @Get("api-key/history")
  async getApiKeyHistory() {
    this.logger.log("[AUDIT] API key history accessed");
    return this.internalService.getApiKeyHistory();
  }
}
