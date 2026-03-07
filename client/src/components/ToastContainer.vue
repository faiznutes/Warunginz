<template>
  <div
    aria-live="assertive"
    class="pointer-events-none fixed inset-0 z-[200] flex items-end px-4 py-6 sm:items-start sm:p-6"
  >
    <div class="flex w-full flex-col items-center space-y-4 sm:items-end">
      <!-- Transition Group for stacking -->
      <TransitionGroup
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ToastItem
          v-for="toast in toasts"
          :key="toast.id"
          v-bind="toast"
          @close="removeToast(toast.id)"
          @undo="removeToast(toast.id)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '../composables/useNotification';
import ToastItem from './ToastItem.vue';

const { toasts, removeToast } = useNotification();
</script>
