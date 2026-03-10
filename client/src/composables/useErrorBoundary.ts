import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

/**
 * Composable untuk error boundary yang konsisten di semua page
 * Memastikan semua page memiliki error handling yang sama
 */
export function useErrorBoundary() {
  const router = useRouter();
  const authStore = useAuthStore();
  const hasError = ref(false);
  const errorMessage = ref<string>('');

  const setError = (message: string) => {
    hasError.value = true;
    errorMessage.value = message;
  };

  const clearError = () => {
    hasError.value = false;
    errorMessage.value = '';
  };

  const handleError = (error: any, defaultMessage: string = 'Terjadi kesalahan saat memuat halaman') => {
    // If 401 Unauthorized, redirect to login
    if (error?.response?.status === 401) {
      authStore.clearAuth();
      router.push('/login');
      return;
    }

    // Clear selectedTenantId on error for Super Admin to prevent wrong view
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(null);
      localStorage.removeItem('selectedTenantId');
    }

    // Set error state
    const message = error?.response?.data?.message || error?.message || defaultMessage;
    setError(message);

    // Only redirect on 404 (not found)
    if (error?.response?.status === 404) {
      setTimeout(() => {
        // Clear selectedTenantId before redirect
        if (authStore.isSuperAdmin) {
          authStore.setSelectedTenant(null);
          localStorage.removeItem('selectedTenantId');
        }
        router.back();
      }, 1500);
    }
  };

  const retry = (retryFn: () => Promise<void> | void) => {
    clearError();
    retryFn();
  };

  return {
    hasError,
    errorMessage,
    setError,
    clearError,
    handleError,
    retry,
  };
}
