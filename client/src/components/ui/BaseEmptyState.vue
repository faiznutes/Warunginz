<template>
  <div :class="['flex flex-col items-center justify-center text-center animate-fade-in', paddingClass]">
    <!-- Icon/Illustration -->
    <div class="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
      <slot name="icon">
        <span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">
          {{ defaultIcon }}
        </span>
      </slot>
    </div>

    <!-- Title -->
    <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">
      <slot name="title">{{ title || 'Tidak Ada Data' }}</slot>
    </h3>

    <!-- Description -->
    <p class="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
      <slot name="description">{{ description || 'Belum ada data yang tersedia untuk ditampilkan saat ini.' }}</slot>
    </p>

    <!-- Action Button -->
    <div v-if="$slots.action || showAction">
      <slot name="action">
        <BaseButton 
          v-if="actionLabel" 
          :icon="actionIcon"
          @click="$emit('action')"
        >
          {{ actionLabel }}
        </BaseButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from './BaseButton.vue';

const props = defineProps<{
  icon?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: string;
  showAction?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}>();

defineEmits(['action']);

const defaultIcon = computed(() => props.icon || 'inbox');

const paddingClass = computed(() => {
  const paddings = {
    sm: 'p-8',
    md: 'p-12',
    lg: 'p-16',
    xl: 'p-24'
  };
  return paddings[props.padding || 'md'];
});
</script>
