<template>
  <button
    :class="[
      'relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
      sizeClasses[size],
      variantClasses[variant],
      roundedClass,
      block ? 'w-full' : '',
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>

    <!-- Content -->
    <span :class="[loading ? 'opacity-0' : '', 'flex items-center gap-2']">
      <slot name="icon-left">
        <span v-if="icon" class="material-symbols-outlined text-[1.25em]">{{ icon }}</span>
      </slot>
      <slot></slot>
      <slot name="icon-right"></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  icon?: string;
  rounded?: 'full' | 'xl' | 'lg' | 'md' | 'none';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
  icon: '',
  rounded: 'xl',
});

defineEmits(['click']);

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
};

const variantClasses = {
  primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 focus:ring-blue-500',
  secondary: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-slate-500',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5 focus:ring-red-500',
  success: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 focus:ring-blue-500',
  outline: 'border-2 border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:ring-slate-400',
  ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 focus:ring-blue-500',
  white: 'bg-white text-slate-900 shadow-md hover:shadow-lg hover:-translate-y-0.5 focus:ring-white/50 border border-slate-100',
};

const roundedClass = computed(() => {
  switch (props.rounded) {
    case 'full': return 'rounded-full';
    case 'xl': return 'rounded-xl';
    case 'lg': return 'rounded-lg';
    case 'md': return 'rounded-md';
    case 'none': return 'rounded-none';
    default: return 'rounded-xl';
  }
});
</script>
