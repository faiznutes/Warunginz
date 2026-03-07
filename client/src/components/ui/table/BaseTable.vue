<template>
  <div class="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm font-display relative flex flex-col">
    <!-- Optional Table Header / Toolbar Slot -->
    <div v-if="$slots.toolbar" class="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 backdrop-blur-sm">
      <slot name="toolbar"></slot>
    </div>

    <!-- Table Container -->
    <div class="overflow-x-auto custom-scrollbar flex-1 relative" :class="heightClass">
      
      <!-- Loading Overlay -->
      <div v-if="loading" class="absolute inset-0 z-10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-[2px] flex items-center justify-center fade-in">
        <div class="flex flex-col items-center gap-3">
          <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-xs font-bold text-slate-500 animate-pulse">Memuat data...</p>
        </div>
      </div>

      <table class="w-full text-left border-collapse">
        <slot></slot>
      </table>
      
      <!-- Empty State -->
      <div v-if="!loading && isEmpty" class="flex flex-col items-center justify-center p-12 text-center animate-fade-in">
        <div class="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
           <slot name="empty-icon">
             <span class="material-symbols-outlined text-4xl text-slate-300">inbox</span>
           </slot>
        </div>
        <h3 class="text-lg font-black text-slate-900 dark:text-white mb-1">
          <slot name="empty-title">Data Kosong</slot>
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          <slot name="empty-description">Belum ada data yang tersedia untuk ditampilkan saat ini.</slot>
        </p>
        <div v-if="$slots['empty-action']" class="mt-6">
          <slot name="empty-action"></slot>
        </div>
      </div>
    </div>

    <!-- Footer / Pagination -->
    <div v-if="$slots.footer" class="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-4">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  loading?: boolean;
  isEmpty?: boolean;
  maxHeight?: string;
}>();

const heightClass = computed(() => {
  return props.maxHeight ? `max-h-[${props.maxHeight}]` : '';
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
