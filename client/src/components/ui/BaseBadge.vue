<template>
  <span
    :class="[
      'inline-flex items-center justify-center font-bold uppercase tracking-wider border shadow-sm',
      sizeClasses[size],
      variantClasses[variant],
      roundedClass,
      animation ? 'animate-fade-in' : ''
    ]"
  >
    <slot name="icon">
      <span v-if="icon" class="material-symbols-outlined mr-1" :class="iconSizeClass">{{ icon }}</span>
    </slot>
    <div v-if="dot" class="w-1.5 h-1.5 rounded-full mr-1.5" :class="dotClasses[variant]">
      <span v-if="pulse" class="absolute inline-flex w-1.5 h-1.5 rounded-full opacity-75 animate-ping" :class="dotClasses[variant]"></span>
    </div>
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'orange';
  size?: 'xs' | 'sm' | 'md';
  rounded?: 'full' | 'xl' | 'lg' | 'md';
  icon?: string;
  dot?: boolean;
  pulse?: boolean;
  animation?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'sm',
  rounded: 'xl',
  icon: '',
  dot: false,
  pulse: false,
  animation: false,
});

const sizeClasses = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-[10px]',
  md: 'px-3 py-1.5 text-xs',
};

const iconSizeClass = computed(() => {
  return props.size === 'xs' ? 'text-[12px]' : props.size === 'sm' ? 'text-[14px]' : 'text-[16px]';
});

const variantClasses = {
  success: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  warning: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
  error: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  info: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
  orange: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
};

const dotClasses = {
  success: 'bg-blue-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-500',
  primary: 'bg-indigo-500',
  orange: 'bg-orange-500',
};

const roundedClass = computed(() => {
  switch (props.rounded) {
    case 'full': return 'rounded-full';
    case 'xl': return 'rounded-xl';
    case 'lg': return 'rounded-lg';
    case 'md': return 'rounded-md';
    default: return 'rounded-xl';
  }
});
</script>
