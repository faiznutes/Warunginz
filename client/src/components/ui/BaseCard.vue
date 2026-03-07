<template>
  <div
    :class="[
      'rounded-2xl border transition-all duration-300 font-display',
      glass 
        ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-slate-200 dark:border-slate-700' 
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      hover ? 'hover:shadow-lg hover:-translate-y-1' : 'shadow-sm',
      paddingClasses[padding]
    ]"
  >
    <div v-if="$slots.header || title" class="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4 flex items-center justify-between">
       <slot name="header">
          <div class="flex flex-col">
             <h3 v-if="title" class="text-lg font-black text-slate-900 dark:text-white">{{ title }}</h3>
             <p v-if="subtitle" class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ subtitle }}</p>
          </div>
       </slot>
       <slot name="actions"></slot>
    </div>
    
    <div :class="bodyClass">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  subtitle?: string;
  glass?: boolean;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bodyClass?: string;
}

withDefaults(defineProps<Props>(), {
  glass: true,
  hover: false,
  padding: 'md',
  bodyClass: '',
});

const paddingClasses = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};
</script>
