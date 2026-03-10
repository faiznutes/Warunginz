import { ref } from 'vue';

// Toast Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  undoAction?: () => void | Promise<void>;
  undoLabel?: string;
}

// Modal Types
interface NotificationOptions {
  type?: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

// Global state
const toasts = ref<Toast[]>([]);
const showNotification = ref(false); // Modal visibility
const notificationOptions = ref<NotificationOptions>({
  type: 'info',
  message: '',
});

let resolvePromise: ((value: boolean) => void) | null = null;

// Modal Handlers
export const handleNotificationConfirm = () => {
  if (resolvePromise) {
    resolvePromise(true);
    resolvePromise = null;
  }
  showNotification.value = false;
};

export const handleNotificationCancel = () => {
  if (resolvePromise) {
    resolvePromise(false);
    resolvePromise = null;
  }
  showNotification.value = false;
};

export const handleNotificationClose = () => {
  if (resolvePromise && notificationOptions.value.type !== 'confirm') {
    resolvePromise(true);
    resolvePromise = null;
  }
  showNotification.value = false;
};

// Toast Handlers
const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substring(2, 9);
  toasts.value.push({ ...toast, id });
  return id;
};

const removeToast = (id: string) => {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

export function useNotification() {
  // Legacy modal trigger (internal use for confirm)
  const notifyModal = (options: NotificationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      notificationOptions.value = {
        type: options.type || 'info',
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
      };
      showNotification.value = true;
      resolvePromise = resolve;
    });
  };

  // Toast triggers
  const success = (message: string, title?: string, duration = 3000, undoAction?: () => void | Promise<void>, undoLabel = 'Undo') => {
    addToast({ type: 'success', message, title, duration, undoAction, undoLabel });
    return Promise.resolve(true);
  };

  const error = (message: string, title?: string, duration = 5000) => {
    addToast({ type: 'error', message, title, duration });
    return Promise.resolve(true);
  };

  const warning = (message: string, title?: string, duration = 4000) => {
    addToast({ type: 'warning', message, title, duration });
    return Promise.resolve(true);
  };

  const info = (message: string, title?: string, duration = 3000) => {
    addToast({ type: 'info', message, title, duration });
    return Promise.resolve(true);
  };

  // Confirm remains as Modal
  const confirm = (message: string, title?: string, confirmText = 'Ya', cancelText = 'Batal'): Promise<boolean> => {
    return notifyModal({ type: 'confirm', message, title, confirmText, cancelText });
  };

  // Original notify method - checking use case
  // If called directly, we check type. type 'confirm' -> Modal. Others -> Toast.
  const notify = (options: NotificationOptions): Promise<boolean> => {
    if (options.type === 'confirm') {
      return notifyModal(options);
    } else {
      // Map legacy notify calls to toasts
      const type = (options.type as Toast['type']) || 'info';
      addToast({
        type,
        title: options.title,
        message: options.message,
      });
      return Promise.resolve(true);
    }
  };

  return {
    // Toast State & Methods
    toasts,
    removeToast,

    // Modal State & Methods (for App.vue)
    showNotification,
    notificationOptions,

    // Public API
    notify,
    success,
    error,
    warning,
    info,
    confirm,
  };
}

