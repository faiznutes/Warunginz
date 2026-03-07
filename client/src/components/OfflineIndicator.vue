<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-[-100%]"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-[-100%]"
  >
    <div
      v-if="!isOnline && !dismissed"
      class="fixed top-0 left-0 right-0 z-[200] bg-amber-500 text-white px-4 py-3 shadow-lg"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-[20px]">wifi_off</span>
          <div>
            <p class="font-bold text-sm">Anda sedang offline</p>
            <p class="text-xs text-amber-100">Menampilkan data dari cache. Beberapa fitur mungkin tidak tersedia.</p>
          </div>
        </div>
        <button
          @click="dismiss"
          class="p-1 hover:bg-amber-600 rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  </Transition>
  
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-[-100%]"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-[-100%]"
  >
    <div
      v-if="isOnline && wasOffline && !dismissed"
      class="fixed top-0 left-0 right-0 z-[200] bg-blue-500 text-white px-4 py-3 shadow-lg"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-[20px]">wifi</span>
          <div>
            <p class="font-bold text-sm">Koneksi kembali tersedia</p>
            <p class="text-xs text-blue-100">Data akan disinkronkan secara otomatis.</p>
          </div>
        </div>
        <button
          @click="dismiss"
          class="p-1 hover:bg-blue-600 rounded-lg transition-colors"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useOffline } from '../composables/useOffline';

const { isOnline, wasOffline } = useOffline();
const dismissed = ref(false);

const dismiss = () => {
  dismissed.value = true;
};

// Reset dismissed when going offline
watch(isOnline, (online) => {
  if (!online) {
    dismissed.value = false;
  } else {
    // Auto-dismiss online message after 3 seconds
    if (wasOffline.value) {
      setTimeout(() => {
        dismissed.value = true;
      }, 3000);
    }
  }
});
</script>

