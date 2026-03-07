import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

/**
 * Custom exception classes for enterprise error handling
 * Each exception maps to specific response codes and HTTP status codes
 */

export class ValidationException extends BadRequestException {
  constructor(
    message: string = 'Validation error',
    public readonly fieldErrors?: Array<{ field: string; message: string }>,
  ) {
    super({
      success: false,
      code: 'VALIDATION_ERROR',
      message,
      errors: fieldErrors,
    });
  }
}

export class ResourceNotFoundException extends NotFoundException {
  constructor(resourceType: string, identifier?: string) {
    const message = identifier
      ? `${resourceType} with ID "${identifier}" not found`
      : `${resourceType} not found`;
    super({
      success: false,
      code: 'NOT_FOUND',
      message,
    });
  }
}

export class DuplicateResourceException extends ConflictException {
  constructor(resourceType: string, field: string, value: string) {
    super({
      success: false,
      code: 'CONFLICT',
      message: `${resourceType} with ${field} "${value}" already exists`,
    });
  }
}

export class UnauthorizedAccessException extends ForbiddenException {
  constructor(message: string = 'Unauthorized access') {
    super({
      success: false,
      code: 'FORBIDDEN',
      message,
    });
  }
}

export class InvalidOperationException extends BadRequestException {
  constructor(message: string = 'Invalid operation') {
    super({
      success: false,
      code: 'INVALID_OPERATION',
      message,
    });
  }
}

export class SubscriptionLimitException extends BadRequestException {
  constructor(feature: string, limit: number) {
    super({
      success: false,
      code: 'SUBSCRIPTION_LIMIT_EXCEEDED',
      message: `${feature} limit of ${limit} exceeded for current subscription`,
    });
  }
}

export class InsufficientStockException extends BadRequestException {
  constructor(productName: string, available: number, requested: number) {
    super({
      success: false,
      code: 'INSUFFICIENT_STOCK',
      message: `${productName}: Only ${available} units available, ${requested} requested`,
    });
  }
}

export class InvalidStateException extends BadRequestException {
  constructor(resource: string, currentState: string, attemptedAction: string) {
    super({
      success: false,
      code: 'INVALID_STATE',
      message: `Cannot ${attemptedAction} ${resource} in ${currentState} state`,
    });
  }
}

export class RateLimitException extends HttpException {
  constructor(retryAfter: number = 60) {
    super(
      {
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Please try again in ${retryAfter} seconds`,
        retryAfter,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class ExternalServiceException extends HttpException {
  constructor(serviceName: string, originalError?: string) {
    super(
      {
        success: false,
        code: 'EXTERNAL_SERVICE_ERROR',
        message: `${serviceName} service error: ${originalError || 'Please try again later'}`,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

export class DatabaseException extends HttpException {
  constructor(operation: string = 'database operation') {
    super(
      {
        success: false,
        code: 'DATABASE_ERROR',
        message: `Failed to complete ${operation}. Please try again later`,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class MultiTenantException extends ForbiddenException {
  constructor(_resourceTenantId: string, _requestTenantId: string) {
    super({
      success: false,
      code: 'MULTI_TENANT_VIOLATION',
      message: 'Access denied: Cross-tenant access is not allowed',
    });
  }
}
