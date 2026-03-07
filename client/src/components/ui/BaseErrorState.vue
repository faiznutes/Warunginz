<template>
  <div class="flex flex-col items-center justify-center text-center p-12 animate-fade-in">
    <!-- Error Icon -->
    <div :class="['w-20 h-20 rounded-full flex items-center justify-center mb-6', iconBgClass]">
      <span :class="['material-symbols-outlined text-5xl', iconColorClass]">
        {{ icon }}
      </span>
    </div>

    <!-- Error Code -->
    <div v-if="code" class="text-6xl font-black text-slate-200 dark:text-slate-700 mb-2">
      {{ code }}
    </div>

    <!-- Title -->
    <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
      {{ description }}
    </p>

    <!-- Actions -->
    <div class="flex gap-3">
      <BaseButton 
        v-if="showRetry"
        variant="primary" 
        icon="refresh"
        @click="$emit('retry')"
      >
        {{ retryLabel || 'Coba Lagi' }}
      </BaseButton>
      
      <BaseButton 
        v-if="showHome"
        variant="outline" 
        icon="home"
        @click="$emit('home')"
      >
        {{ homeLabel || 'Kembali ke Beranda' }}
      </BaseButton>

      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  type?: 'error' | 'warning' | 'info' | 'forbidden';
  icon?: string;
  code?: string;
  title: string;
  description: string;
  showRetry?: boolean;
  showHome?: boolean;
  retryLabel?: string;
  homeLabel?: string;
}>();

defineEmits(['retry', 'home']);

const iconBgClass = computed(() => {
  const classes = {
    error: 'bg-red-50 dark:bg-red-900/10',
    warning: 'bg-amber-50 dark:bg-amber-900/10',
    info: 'bg-blue-50 dark:bg-blue-900/10',
    forbidden: 'bg-orange-50 dark:bg-orange-900/10'
  };
  return classes[props.type || 'error'];
});

const iconColorClass = computed(() => {
  const classes = {
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
    forbidden: 'text-orange-500'
  };
  return classes[props.type || 'error'];
});

const icon = computed(() => {
  if (props.icon) return props.icon;
  
  const icons = {
    error: 'error',
    warning: 'warning',
    info: 'info',
    forbidden: 'block'
  };
  return icons[props.type || 'error'];
});
</script>
