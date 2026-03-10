import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check() {
    const dbOk = await this.prisma.healthCheck();
    const status = dbOk ? 'ok' : 'degraded';
    return {
      success: true,
      data: {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: dbOk ? 'connected' : 'disconnected',
        },
      },
    };
  }
}
