<template>
  <div class="w-full">
    <!-- Label and Percentage -->
    <div v-if="label || showPercentage" class="flex items-center justify-between mb-2">
      <span v-if="label" class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ label }}</span>
      <span v-if="showPercentage" class="text-sm font-bold text-slate-500 dark:text-slate-400">{{ percentage }}%</span>
    </div>

    <!-- Progress Bar -->
    <div :class="['w-full bg-slate-200 dark:bg-slate-700 overflow-hidden', sizeClass, roundedClass]">
      <div
        :class="[
          'h-full transition-all duration-500 ease-out',
          colorClass,
          striped ? 'bg-striped' : '',
          animated ? 'animate-progress' : ''
        ]"
        :style="{ width: `${percentage}%` }"
        role="progressbar"
        :aria-valuenow="value"
        :aria-valuemin="0"
        :aria-valuemax="max"
      >
        <span v-if="showValue" class="flex items-center justify-center h-full text-xs font-bold text-white px-2">
          {{ value }} / {{ max }}
        </span>
      </div>
    </div>

    <!-- Helper Text -->
    <p v-if="helperText" class="mt-2 text-xs text-slate-500 dark:text-slate-400">{{ helperText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: number;
  max?: number;
  label?: string;
  helperText?: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  showPercentage?: boolean;
  showValue?: boolean;
  striped?: boolean;
  animated?: boolean;
}>();

const percentage = computed(() => {
  const max = props.max || 100;
  return Math.min(Math.round((props.value / max) * 100), 100);
});

const sizeClass = computed(() => {
  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  return sizes[props.size || 'md'];
});

const roundedClass = computed(() => {
  const rounded = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  return rounded[props.rounded || 'full'];
});

const colorClass = computed(() => {
  const colors = {
    primary: 'bg-blue-600',
    success: 'bg-blue-600',
    warning: 'bg-amber-600',
    error: 'bg-red-600',
    info: 'bg-indigo-600'
  };
  return colors[props.variant || 'primary'];
});
</script>

<style scoped>
.bg-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

.animate-progress {
  animation: progress-animation 1s linear infinite;
}

@keyframes progress-animation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 1rem 0;
  }
}
</style>
