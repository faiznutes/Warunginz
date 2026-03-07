<template>
  <div :class="containerClass">
    <div 
      :class="[
        'border-4 rounded-full animate-spin',
        sizeClass,
        colorClass
      ]"
      :style="{ borderTopColor: 'transparent' }"
    ></div>
    <p v-if="label" :class="labelClass">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'slate';
  label?: string;
  center?: boolean;
}>();

const sizeClass = computed(() => {
  const sizes = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-3',
    lg: 'w-10 h-10 border-4',
    xl: 'w-16 h-16 border-4'
  };
  return sizes[props.size || 'md'];
});

const colorClass = computed(() => {
  const colors = {
    primary: 'border-blue-600',
    white: 'border-white',
    slate: 'border-slate-400'
  };
  return colors[props.color || 'primary'];
});

const containerClass = computed(() => {
  return props.center 
    ? 'flex flex-col items-center justify-center gap-3' 
    : 'inline-flex flex-col items-center gap-2';
});

const labelClass = computed(() => {
  return 'text-sm font-bold text-slate-500 dark:text-slate-400 animate-pulse';
});
</script>
