/**
 * Response adapter to handle NestJS standardized response format
 * 
 * NestJS returns:
 * {
 *   success: boolean,
 *   code: ResponseCode,
 *   message: string,
 *   data: T,
 *   pagination?: { page, limit, total, totalPages },
 *   timestamp: string,
 *   path: string,
 *   correlationId: string
 * }
 * 
 * This adapter unwraps the response to maintain backward compatibility
 * with frontend code that expects just the data
 */

export interface NestJSResponse<T = any> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
  path: string;
  correlationId: string;
}

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
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

/**
 * Unwrap NestJS response format
 * Converts standardized format to simple data format for backward compatibility
 */
export function unwrapResponse<T = any>(response: any): T {
  // If it's already a NestJS format response
  if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
    // Store pagination info if it exists
    if (response.pagination) {
      // Attach pagination to data for components that need it
      if (response.data && typeof response.data === 'object') {
        (response.data as any).__pagination = response.pagination;
      }
    }
    return response.data as T;
  }

  // If it's already unwrapped or array format, return as is
  return response as T;
}

/**
 * Map NestJS response code to HTTP status code
 */
export function responseCodeToHttpStatus(code: string): number {
  switch (code) {
    case ResponseCode.SUCCESS:
      return 200;
    case ResponseCode.CREATED:
      return 201;
    case ResponseCode.UPDATED:
      return 200;
    case ResponseCode.DELETED:
      return 200;
    case ResponseCode.VALIDATION_ERROR:
      return 400;
    case ResponseCode.UNAUTHORIZED:
      return 401;
    case ResponseCode.FORBIDDEN:
      return 403;
    case ResponseCode.NOT_FOUND:
      return 404;
    case ResponseCode.CONFLICT:
      return 409;
    case ResponseCode.RATE_LIMIT_EXCEEDED:
      return 429;
    case ResponseCode.INSUFFICIENT_STOCK:
      return 409;
    case ResponseCode.INTERNAL_ERROR:
      return 500;
    case ResponseCode.SERVICE_UNAVAILABLE:
      return 503;
    default:
      return 500;
  }
}

/**
 * Check if response indicates success
 */
export function isSuccessResponse(response: any): boolean {
  return response?.success === true || response?.code === ResponseCode.SUCCESS;
}

/**
 * Get friendly error message from response code
 */
export function getResponseCodeMessage(code: string, customMessage?: string): string {
  if (customMessage) return customMessage;

  const messages: Record<string, string> = {
    [ResponseCode.VALIDATION_ERROR]: 'Data tidak valid. Silakan periksa input Anda.',
    [ResponseCode.UNAUTHORIZED]: 'Sesi Anda telah berakhir. Silakan login kembali.',
    [ResponseCode.FORBIDDEN]: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
    [ResponseCode.NOT_FOUND]: 'Data tidak ditemukan.',
    [ResponseCode.CONFLICT]: 'Data sudah ada atau ada konflik dengan data lain.',
    [ResponseCode.RATE_LIMIT_EXCEEDED]: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
    [ResponseCode.INSUFFICIENT_STOCK]: 'Stok produk tidak mencukupi.',
    [ResponseCode.INTERNAL_ERROR]: 'Terjadi kesalahan pada server. Silakan hubungi admin.',
    [ResponseCode.SERVICE_UNAVAILABLE]: 'Layanan sedang tidak tersedia. Silakan coba lagi nanti.',
  };

  return messages[code] || 'Terjadi kesalahan yang tidak diketahui.';
}

/**
 * Extract error details from response
 */
export function extractErrorDetails(error: any): {
  code: string;
  message: string;
  details?: any;
} {
  const response = error?.response;

  // NestJS error format
  if (response?.data?.code) {
    return {
      code: response.data.code,
      message: response.data.message || 'Unknown error',
      details: response.data.details,
    };
  }

  // Axios error with status
  if (response?.status) {
    return {
      code: `HTTP_${response.status}`,
      message: response.data?.message || response.statusText || 'Unknown error',
      details: response.data,
    };
  }

  // Network or other error
  return {
    code: 'NETWORK_ERROR',
    message: error?.message || 'Network error occurred',
    details: error,
  };
}
