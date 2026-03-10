import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(navigator.onLine);
const wasOffline = ref(false);

// Listen to online/offline events
const handleOnline = () => {
  isOnline.value = true;
  wasOffline.value = false;
};

const handleOffline = () => {
  isOnline.value = false;
  wasOffline.value = true;
};

export function useOffline() {
  onMounted(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    isOnline.value = navigator.onLine;
  });

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  });

  return {
    isOnline,
    wasOffline,
  };
}

