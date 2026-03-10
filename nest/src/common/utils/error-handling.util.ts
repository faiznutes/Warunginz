/**
 * Error Handling Utilities
 * Provides retry logic, error recovery mechanisms, and error categorization
 */

export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHORIZATION = 'AUTHORIZATION',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  TRANSIENT = 'TRANSIENT', // Database connection, external service errors
  PERMANENT = 'PERMANENT', // Programming errors, configuration issues
  UNKNOWN = 'UNKNOWN',
}

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  shouldRetry?: (error: any) => boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

/**
 * Categorize error for appropriate handling
 */
export function categorizeError(error: any): ErrorCategory {
  if (error.status === 400 || error.code === 'VALIDATION_ERROR') {
    return ErrorCategory.VALIDATION;
  }

  if (error.status === 401 || error.status === 403 || error.code === 'FORBIDDEN') {
    return ErrorCategory.AUTHORIZATION;
  }

  if (error.status === 404 || error.code === 'NOT_FOUND') {
    return ErrorCategory.RESOURCE_NOT_FOUND;
  }

  if (error.status === 409 || error.code === 'CONFLICT') {
    return ErrorCategory.CONFLICT;
  }

  if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') {
    return ErrorCategory.RATE_LIMIT;
  }

  // Transient errors (retryable)
  if (
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT' ||
    error.status === 502 ||
    error.status === 503 ||
    error.status === 504
  ) {
    return ErrorCategory.TRANSIENT;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Delay execution (exponential backoff)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry logic with exponential backoff
 * Returns result if successful, throws error if max attempts exceeded
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;
  let delayMs = finalConfig.initialDelayMs;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (finalConfig.shouldRetry && !finalConfig.shouldRetry(error)) {
        throw error;
      }

      if (attempt < finalConfig.maxAttempts) {
        await delay(delayMs);
        delayMs = Math.min(
          delayMs * finalConfig.backoffMultiplier,
          finalConfig.maxDelayMs,
        );
      }
    }
  }

  throw lastError;
}

/**
 * Circuit breaker pattern - prevent cascading failures
 */
export class CircuitBreaker {
  private failureCount = 0;
  private successCount = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private lastFailureTime: number | null = null;

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeoutMs: number = 60000,
    private readonly successThreshold: number = 2,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (
        this.lastFailureTime &&
        Date.now() - this.lastFailureTime > this.resetTimeoutMs
      ) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();

      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= this.successThreshold) {
          this.state = 'CLOSED';
          this.failureCount = 0;
          this.successCount = 0;
        }
      } else {
        this.failureCount = Math.max(0, this.failureCount - 1);
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
      }

      throw error;
    }
  }

  getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }
}

/**
 * Determine if error is transient and should be retried
 */
export function isTransientError(error: any): boolean {
  const category = categorizeError(error);
  return category === ErrorCategory.TRANSIENT;
}

/**
 * Sanitize error message for client response (avoid exposing internals)
 */
export function sanitizeErrorMessage(error: any): string {
  const category = categorizeError(error);

  switch (category) {
    case ErrorCategory.VALIDATION:
      return error.message || 'Validation error';
    case ErrorCategory.AUTHORIZATION:
      return 'Access denied';
    case ErrorCategory.RESOURCE_NOT_FOUND:
      return 'Resource not found';
    case ErrorCategory.CONFLICT:
      return error.message || 'Resource conflict';
    case ErrorCategory.RATE_LIMIT:
      return 'Too many requests';
    case ErrorCategory.TRANSIENT:
      return 'Service temporarily unavailable. Please try again.';
    case ErrorCategory.PERMANENT:
      return 'An error occurred. Please contact support.';
    default:
      return 'An unexpected error occurred';
  }
}
