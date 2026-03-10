<template>
  <div :class="['animate-pulse', containerClass]">
    <slot>
      <!-- Default skeleton layout if no slot content -->
      <div class="space-y-4">
        <div v-if="showAvatar" class="flex items-center gap-4">
          <div :class="['rounded-full bg-slate-200 dark:bg-slate-700', avatarSize]"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          </div>
        </div>
        
        <div v-if="showTitle" class="space-y-2">
          <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        
        <div v-if="(lines ?? 0) > 0" class="space-y-3">
          <div 
            v-for="i in (lines ?? 0)" 
            :key="i"
            class="h-4 bg-slate-200 dark:bg-slate-700 rounded"
            :class="i === (lines ?? 0) ? 'w-5/6' : 'w-full'"
          ></div>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  lines?: number;
  showAvatar?: boolean;
  showTitle?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}>();

const containerClass = computed(() => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  return paddings[props.padding || 'md'];
});

const avatarSize = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };
  return sizes[props.avatarSize || 'md'];
});
</script>
