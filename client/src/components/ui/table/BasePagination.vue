<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 font-display">
    <!-- Info Text -->
    <div class="text-sm font-bold text-slate-500 dark:text-slate-400">
      Menampilkan <span class="text-slate-900 dark:text-white">{{ startItem }}</span> - <span class="text-slate-900 dark:text-white">{{ endItem }}</span> dari <span class="text-slate-900 dark:text-white">{{ total }}</span> data
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-2">
      <!-- Previous -->
      <button
        @click="onPageChange(currentPage - 1)"
        :disabled="currentPage === 1"
        class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-400 shadow-sm"
        title="Previous Page"
      >
        <span class="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center gap-1">
        <template v-for="(page, index) in visiblePages" :key="index">
          <button
            v-if="page !== '...'"
            @click="onPageChange(Number(page))"
            :class="[
              'w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all shadow-sm',
              Number(page) === currentPage
                ? 'bg-blue-600 text-white shadow-blue-500/30'
                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            ]"
          >
            {{ page }}
          </button>
          <span v-else class="w-9 h-9 flex items-center justify-center text-slate-400 font-bold">...</span>
        </template>
      </div>

      <!-- Next -->
      <button
        @click="onPageChange(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-400 shadow-sm"
        title="Next Page"
      >
        <span class="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  total: number;
  limit: number;
  currentPage: number;
}>();

const emit = defineEmits(['page-change']);

const totalPages = computed(() => Math.ceil(props.total / props.limit));

const startItem = computed(() => (props.currentPage - 1) * props.limit + 1);
const endItem = computed(() => Math.min(props.currentPage * props.limit, props.total));

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) pages.push(i);
  } else {
    if (props.currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages.value);
    } else if (props.currentPage >= totalPages.value - 2) {
      pages.push(1, '...', totalPages.value - 3, totalPages.value - 2, totalPages.value - 1, totalPages.value);
    } else {
      pages.push(1, '...', props.currentPage - 1, props.currentPage, props.currentPage + 1, '...', totalPages.value);
    }
  }
  return pages;
});

const onPageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit('page-change', page);
  }
};
</script>
