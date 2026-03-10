<template>
  <div 
    v-if="type === 'text'"
    class="flex flex-col gap-2 w-full animate-pulse"
  >
    <div 
      v-for="i in rows" 
      :key="i"
      class="bg-slate-200 dark:bg-slate-700/50 rounded-full"
      :style="{ 
        width: i === rows && rows > 1 ? '70%' : '100%', 
        height: height || '1rem' 
      }"
    ></div>
  </div>

  <div 
    v-else-if="type === 'circle'"
    class="bg-slate-200 dark:bg-slate-700/50 rounded-full animate-pulse shrink-0"
    :style="{ width: width || '40px', height: height || '40px' }"
  ></div>

  <div 
    v-else-if="type === 'rect'"
    class="bg-slate-200 dark:bg-slate-700/50 rounded-xl animate-pulse"
    :style="{ width: width || '100%', height: height || '200px' }"
  ></div>

  <div 
    v-else-if="type === 'product-card'"
    class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-0 overflow-hidden shadow-sm animate-pulse h-full"
  >
    <div class="w-full aspect-w-4 aspect-h-3 bg-slate-200 dark:bg-slate-700/50"></div>
    <div class="p-4 flex flex-col gap-3">
       <div class="h-5 bg-slate-200 dark:bg-slate-700/50 rounded-full w-3/4"></div>
       <div class="flex items-center justify-between mt-2">
          <div class="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full w-1/3"></div>
          <div class="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full w-1/4"></div>
       </div>
    </div>
  </div>
  
  <div 
    v-else-if="type === 'table-row'"
    class="w-full animate-pulse flex gap-4 py-4 border-b border-slate-100 dark:border-slate-800"
  >
      <div v-for="i in 5" :key="i" class="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full flex-1"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'text' | 'circle' | 'rect' | 'product-card' | 'table-row';
  rows?: number;
  width?: string;
  height?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  rows: 1,
});
</script>
