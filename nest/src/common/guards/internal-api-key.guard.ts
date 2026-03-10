import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(InternalApiKeyGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers["x-internal-api-key"];

    const expectedKey = this.config.get<string>("INTERNAL_API_KEY");

    if (!expectedKey || expectedKey.length < 16) {
      this.logger.error(
        "INTERNAL_API_KEY is not configured or too short. All internal endpoints are blocked.",
      );
      throw new UnauthorizedException("Internal endpoint not available");
    }

    if (!apiKey || apiKey !== expectedKey) {
      this.logger.warn(
        `Unauthorized internal endpoint access attempt from ${request.ip} to ${request.method} ${request.url}`,
      );
      throw new UnauthorizedException("Invalid internal API key");
    }

    this.logger.log(
      `Internal endpoint accessed: ${request.method} ${request.url} from ${request.ip}`,
    );

    return true;
  }
}
