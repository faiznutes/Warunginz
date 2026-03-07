<template>
  <div id="app-wrapper" class="w-full min-h-screen">
    <!-- Global Error Boundary -->
    <div v-if="globalError" class="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <svg class="w-20 h-20 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
      <p class="text-gray-600 text-center max-w-md mb-4">{{ globalErrorMessage || 'Terjadi kesalahan saat memuat aplikasi. Silakan refresh halaman.' }}</p>
      <button
        @click="handleGlobalErrorRetry"
        class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
      >
        Refresh Halaman
      </button>
    </div>
    
    <template v-else>
      <router-view />
      <NotificationModal
        :show="showNotification"
        :type="notificationOptions.type"
        :title="notificationOptions.title"
        :message="notificationOptions.message"
        :confirm-text="notificationOptions.confirmText"
        :cancel-text="notificationOptions.cancelText"
        @confirm="handleConfirm"
        @cancel="handleCancel"
        @close="handleClose"
      />
      <ToastContainer />
      <PWAInstallPrompt />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onErrorCaptured, onUnmounted } from 'vue';
import { useAuthStore } from './stores/auth';
import NotificationModal from './components/NotificationModal.vue';
import ToastContainer from './components/ToastContainer.vue';
import PWAInstallPrompt from './components/PWAInstallPrompt.vue';
import { useNotification } from './composables/useNotification';
import { getFriendlyErrorMessage } from './utils/error-messages';
import {
  handleNotificationConfirm as handleConfirm,
  handleNotificationCancel as handleCancel,
  handleNotificationClose as handleClose,
} from './composables/useNotification';

const authStore = useAuthStore();
const { showNotification, notificationOptions, notify } = useNotification();
const globalError = ref(false);
const globalErrorMessage = ref<string>('');

const handleGlobalErrorRetry = () => {
  globalError.value = false;
  globalErrorMessage.value = '';
  window.location.reload();
};

// Global error handler untuk menangkap semua error Vue
onErrorCaptured((err: any, instance, info) => {
  console.error('Vue Error Captured:', err, info);
  
  const friendlyMessage = getFriendlyErrorMessage(err);
  
  // If error is from an event handler, it's likely not fatal to the UI tree
  // We can just show a notification instead of crashing the whole app
  if (info === 'native event handler' || info === 'v-on handler') {
    notify({
      type: 'error',
      title: 'Terjadi Kesalahan',
      message: friendlyMessage,
    });
    return false; // Prevent propagation
  }

  // If it's a network error during mount, maybe just show toast?
  if (err.message && (err.message.includes('Network') || err.message.includes('fetch'))) {
     notify({
      type: 'error',
      title: 'Koneksi Bermasalah',
      message: friendlyMessage,
    });
    return false;
  }

  globalError.value = true;
  globalErrorMessage.value = friendlyMessage;
  return false; // Prevent error from propagating
});

// Handle unhandled promise rejections (e.g. failed fetches without catch)
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  // Ignore resize observer loop limit exceeded
  if (event.reason?.message?.includes('ResizeObserver loop')) return;

  console.error('Unhandled Promise Rejection:', event.reason);
  const friendlyMessage = getFriendlyErrorMessage(event.reason);
  
  notify({
    type: 'error',
    title: 'Terjadi Kesalahan Sistem',
    message: friendlyMessage,
  });
};

onUnmounted(() => {
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
});

onMounted(async () => {
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  
  // Skip restore if we're on login page (to avoid flash)
  if (window.location.pathname === '/login') {
    return;
  }
  
  // Restore authentication state if token exists (check both localStorage and sessionStorage)
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  
  if (token) {
    // Restore token to store
    if (rememberMe) {
      authStore.token = localStorage.getItem('token');
    } else {
      authStore.token = sessionStorage.getItem('token') || localStorage.getItem('token');
    }
    
    // Restore user from localStorage if available (synchronous, no flash)
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        authStore.user = JSON.parse(storedUser);
      }
      
      // Verify token is still valid by fetching user data (async, but only if not on login)
      // This is done in background to avoid blocking
      authStore.fetchMe().catch((error) => {
        console.error('Failed to restore session:', error);
        // If fetchMe fails, token might be invalid, clear everything
        authStore.clearAuth();
      });
    } catch (error) {
      console.error('Failed to restore user from localStorage:', error);
      authStore.clearAuth();
    }
  } else {
    // No token, ensure auth is cleared
    authStore.clearAuth();
  }
});
</script>

