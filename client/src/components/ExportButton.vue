<template>
  <div class="relative group">
    <button
      @click="showMenu = !showMenu"
      class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center space-x-2"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Ekspor</span>
    </button>
    <!-- Export Menu -->
    <div
      v-if="showMenu"
      ref="menuRef"
      class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-10 border border-gray-200"
    >
      <button
        @click="handleExport('csv')"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-xl flex items-center space-x-2"
      >
        <span>📄</span>
        <span>Export CSV</span>
      </button>
      <button
        @click="handleExport('excel')"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
      >
        <span>📊</span>
        <span>Export Excel</span>
      </button>
      <button
        @click="handleExport('pdf')"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
      >
        <span>📑</span>
        <span>Export PDF</span>
      </button>
      <button
        @click="handleExport('email')"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-xl flex items-center space-x-2 border-t border-gray-100"
      >
        <span>✉️</span>
        <span>Kirim ke Email</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Props {
  data: any[];
  filename: string;
  title?: string;
  headers?: string[];
}

withDefaults(defineProps<Props>(), {
  title: 'Data Export',
  headers: undefined,
});

const emit = defineEmits<{
  (e: 'export', format: 'csv' | 'excel' | 'pdf' | 'email'): void;
}>();

const showMenu = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const handleExport = (format: 'csv' | 'excel' | 'pdf' | 'email') => {
  showMenu.value = false;
  emit('export', format);
};

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
