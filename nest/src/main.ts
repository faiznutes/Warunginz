import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { PerformanceMonitoringInterceptor } from "./common/interceptors/performance-monitoring.interceptor";
import { EnhancedValidationPipe } from "./common/pipes/enhanced-validation.pipe";
import { LoggerService } from "./common/logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const logger = app.get(LoggerService);

  app.useLogger(logger);
  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  // Security: Helmet middleware
  app.use(helmet());

  // Rate Limiting - Global
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/", limiter);

  const isProduction = config.get("NODE_ENV") === "production";
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 10 : 100,
    skipSuccessfulRequests: true,
    message: "Too many login attempts, please try again later.",
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  app.setGlobalPrefix("api", { exclude: ["health"] });

  // Enhanced validation with field-level error reporting
  app.useGlobalPipes(
    new EnhancedValidationPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters and interceptors (order matters!)
  // Filters: catch exceptions
  // Interceptors: wrap responses and monitor performance
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new PerformanceMonitoringInterceptor(),
  );

  const configuredOrigins = config
    .get("CORS_ORIGIN", "http://localhost:5000")
    .split(",")
    .map((origin: string) => origin.trim())
    .filter(Boolean);
  const localDevOrigins = [
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
  ];
  const corsOrigins = Array.from(new Set([...configuredOrigins, ...localDevOrigins]));

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Correlation-ID",
      "X-Tenant-Id",
      "X-Internal-Api-Key",
    ],
    exposedHeaders: ["Content-Disposition", "Content-Type", "Content-Length"],
  });

  const port = parseInt(
    config.get<string>("PORT") || process.env.PORT || "3000",
    10,
  );

  // Enable graceful shutdown
  const server = await app.listen(port);

  process.on("SIGTERM", async () => {
    logger.warn("SIGTERM received, shutting down gracefully...", "Bootstrap");
    await app.close();
    server.close(() => {
      logger.log("Server closed", "Bootstrap");
      process.exit(0);
    });
  });

  logger.log(
    `✅ NestJS backend running on http://localhost:${port}/api`,
    "Bootstrap",
  );
}

bootstrap().catch((err) => {
  console.error("Failed to start NestJS:", err);
  process.exit(1);
});
