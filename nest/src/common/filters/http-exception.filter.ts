import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = (request as any).correlationId;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        message = Array.isArray((res as any).message) ? (res as any).message[0] : (res as any).message;
      }
      error = exception.name;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.message, exception.stack, 'HttpExceptionFilter');
    }

    const body = {
      success: false,
      data: null,
      message,
      error,
      ...(correlationId && { correlationId }),
    };

    if (status >= 500) {
      this.logger.error(
        `[${correlationId}] ${request.method} ${request.url} - ${status}: ${message}`,
        undefined,
        'HttpExceptionFilter',
      );
    }

    response.status(status).json(body);
  }
}
