import { extractErrorDetails, getResponseCodeMessage } from '../api/response-adapter';

/**
 * Standardizes error messages for user display (Indonesian)
 * Handles both legacy Express format and new NestJS standardized format
 */
export const getFriendlyErrorMessage = (error: any): string => {
  // Extract error details from response
  const { code, message, details } = extractErrorDetails(error);
  const status = error?.response?.status;

  // NestJS ResponseCode mapping (preferred)
  if (code && !code.startsWith('HTTP_')) {
    // Handle validation errors with field details
    if (code === 'VALIDATION_ERROR' && details?.errors) {
      const fieldErrors = Array.isArray(details.errors)
        ? details.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')
        : JSON.stringify(details.errors);
      return `Validasi gagal: ${fieldErrors}`;
    }

    if (code === 'VALIDATION_ERROR' && details?.message) {
      return `Validasi gagal: ${details.message}`;
    }

    // Use the standardized message from response adapter
    return getResponseCodeMessage(code, message);
  }

  // Legacy HTTP status code handling
  if (status) {
    // Network Errors
    if (status === 0 || error?.code === 'ERR_NETWORK' || error?.code === 'ERR_INTERNET_DISCONNECTED' || message?.includes('Network Error')) {
      return 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
    }

    // Timeout
    if (error?.code === 'ECONNABORTED' || message?.includes('timeout')) {
      return 'Waktu permintaan habis. Silakan coba lagi.';
    }

    // Auth Errors
    if (status === 401 || message?.includes('Unauthorized') || message?.includes('token')) {
      return 'Sesi Anda telah berakhir. Silakan login kembali.';
    }

    if (status === 403) {
      return 'Anda tidak memiliki akses untuk melakukan tindakan ini.';
    }

    // Database/Prisma Errors (if exposed)
    if (code === 'P2002') {
      return 'Data sudah ada (duplikat). Mohon periksa kembali input Anda.';
    }

    if (code === 'P2025') {
      return 'Data tidak ditemukan.';
    }

    // Custom Application Errors (legacy format compatibility)
    if (message?.includes('Insufficient stock') || message?.includes('Stok tidak mencukupi')) {
      return 'Stok produk tidak mencukupi.';
    }

    // Validation Errors
    if (status === 400) {
      // If it's a validation array
      if (Array.isArray(error?.response?.data?.errors)) {
        return error.response.data.errors.map((e: any) => e.msg || e.message).join(', ');
      }
      return message || 'Permintaan tidak valid. Periksa input Anda.';
    }

    // Conflict (duplicate, state conflict, etc.)
    if (status === 409) {
      return message || 'Terjadi konflik dengan data yang sudah ada. Silakan periksa kembali.';
    }

    // Rate limit
    if (status === 429) {
      return 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.';
    }

    // Server Errors
    if (status >= 500) {
      return 'Terjadi kesalahan pada server. Silakan hubungi admin.';
    }
  }

  // Default fallback
  return message || 'Terjadi kesalahan yang tidak diketahui.';
};

/**
 * Extract field-level validation errors from response
 * Useful for displaying errors next to form fields
 */
export const getFieldErrors = (error: any): Record<string, string> => {
  const { details } = extractErrorDetails(error);
  const fieldErrors: Record<string, string> = {};

  if (details?.errors && Array.isArray(details.errors)) {
    details.errors.forEach((e: any) => {
      if (e.field) {
        fieldErrors[e.field] = e.message || e.constraint || 'Invalid value';
      }
    });
  }

  return fieldErrors;
};
