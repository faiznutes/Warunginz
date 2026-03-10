import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;

  constructor() {
    const isProd = process.env.NODE_ENV === 'production';
    this.logger = pino({
      level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
      transport: isProd ? undefined : { target: 'pino-pretty', options: { colorize: true } },
      base: { service: 'warungin-nest' },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  log(message: string, context?: string) {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message);
  }

  warn(message: string, context?: string) {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: string) {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string) {
    this.logger.trace({ context }, message);
  }

  getPino(): pino.Logger {
    return this.logger;
  }
}
