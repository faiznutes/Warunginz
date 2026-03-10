<template>
  <div 
    class="flex items-center gap-2 px-2 py-1 rounded-full transition-colors cursor-help group relative"
    :class="{
      'bg-green-50 text-green-700 border border-green-100': quality === 'good',
      'bg-amber-50 text-amber-700 border border-amber-100': quality === 'poor',
      'bg-red-50 text-red-700 border border-red-100': quality === 'offline'
    }"
    :title="tooltipText"
  >
    <div class="relative flex items-center justify-center w-3 h-3">
      <span 
        class="absolute w-full h-full rounded-full opacity-75 animate-ping"
        :class="{
          'bg-green-500': quality === 'good',
          'bg-amber-500': quality === 'poor',
          'bg-red-500': quality === 'offline',
          'hidden': quality === 'offline' // Don't ping if offline to save visual noise
        }"
      ></span>
      <span 
        class="relative inline-flex rounded-full w-2 h-2"
        :class="{
          'bg-green-500': quality === 'good',
          'bg-amber-500': quality === 'poor',
          'bg-red-500': quality === 'offline'
        }"
      ></span>
    </div>
    
    <span class="text-[10px] font-bold uppercase hidden md:inline-block">
      {{ statusText }}
    </span>

    <!-- Tooltip -->
    <div class="absolute top-full right-0 mt-2 w-48 p-3 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-xs text-slate-600">
      <div class="font-bold text-slate-800 mb-1 flex justify-between">
        <span>Koneksi</span>
        <span :class="{
          'text-green-600': quality === 'good',
          'text-amber-600': quality === 'poor',
          'text-red-600': quality === 'offline'
        }">{{ statusText }}</span>
      </div>
      <div v-if="quality !== 'offline'">Latency: {{ latency }}ms</div>
      <div v-else>Memeriksa koneksi...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useConnectionQuality } from '@/composables/useConnectionQuality';

const { quality, latency } = useConnectionQuality();

const statusText = computed(() => {
  switch (quality.value) {
    case 'good': return 'Online';
    case 'poor': return 'Unstable';
    case 'offline': return 'Offline';
    default: return 'Online';
  }
});

const tooltipText = computed(() => {
  if (quality.value === 'offline') return 'Anda sedang offline';
  return `Koneksi ${quality.value === 'good' ? 'Stabil' : 'Lambat'} (${latency.value}ms)`;
});
</script>
