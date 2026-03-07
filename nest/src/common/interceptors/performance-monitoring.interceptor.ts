import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

interface RequestMetrics {
  method: string;
  path: string;
  statusCode: number;
  responseTimeMs: number;
  responseSize: number;
  timestamp: Date;
}

@Injectable()
export class PerformanceMonitoringInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');
  private readonly slowRequestThresholdMs = 1000; // Warn if > 1 second
  private readonly largeResponseSizeBytes = 1000000; // Warn if > 1MB

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const metrics: RequestMetrics = {
      method: request.method,
      path: request.path,
      statusCode: 200,
      responseTimeMs: 0,
      responseSize: 0,
      timestamp: new Date(),
    };

    return next.handle().pipe(
      tap(
        (data) => {
          metrics.statusCode = response.statusCode;
          metrics.responseTimeMs = Date.now() - startTime;
          metrics.responseSize = data ? JSON.stringify(data).length : 0;

          this.logMetrics(metrics);
        },
        (error) => {
          metrics.responseTimeMs = Date.now() - startTime;
          metrics.statusCode = error.status || 500;

          this.logMetrics(metrics, error);
        },
      ),
    );
  }

  private logMetrics(metrics: RequestMetrics, error?: any) {
    const isSlow = metrics.responseTimeMs > this.slowRequestThresholdMs;
    const isLarge = metrics.responseSize > this.largeResponseSizeBytes;

    if (isSlow) {
      this.logger.warn(
        `SLOW REQUEST: ${metrics.method} ${metrics.path} - ${metrics.responseTimeMs}ms (${metrics.statusCode})`,
      );
    }

    if (isLarge) {
      this.logger.warn(
        `LARGE RESPONSE: ${metrics.method} ${metrics.path} - ${(metrics.responseSize / 1000000).toFixed(2)}MB`,
      );
    }

    if (error && metrics.statusCode >= 500) {
      this.logger.error(
        `ERROR: ${metrics.method} ${metrics.path} - ${metrics.statusCode} in ${metrics.responseTimeMs}ms`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    // Log all metrics if in debug mode
    if (process.env.DEBUG_PERFORMANCE === 'true') {
      this.logger.debug(
        `METRICS: ${metrics.method} ${metrics.path} - ${metrics.responseTimeMs}ms, ${metrics.statusCode}, ${metrics.responseSize}B`,
      );
    }
  }
}
