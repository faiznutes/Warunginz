export enum ResponseCode {
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export class SuccessResponseDto<T = any> {
  success: boolean = true;
  code: ResponseCode;
  message: string;
  data?: T;
  timestamp: string;
  path: string;

  constructor(
    code: ResponseCode,
    message: string,
    data?: T,
    path: string = '',
  ) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}

export class ErrorResponseDto {
  success: boolean = false;
  code: ResponseCode;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  timestamp: string;
  path: string;
  statusCode: number;

  constructor(
    code: ResponseCode,
    message: string,
    statusCode: number = 500,
    path: string = '',
    errors: Array<{ field?: string; message: string; code?: string }> = [],
  ) {
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.errors = errors.length > 0 ? errors : undefined;
  }
}

export class PaginatedResponseDto<T = any> {
  success: boolean = true;
  code: ResponseCode = ResponseCode.SUCCESS;
  message: string = 'Data retrieved successfully';
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
  path: string;

  constructor(
    data: T[],
    pagination: { page: number; limit: number; total: number; totalPages: number },
    path: string = '',
  ) {
    this.data = data;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
    this.path = path;
  }
}
