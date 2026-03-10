<template>
  <div class="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div v-for="i in count" :key="i" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
      <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
      <div class="space-y-2">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
      </div>
      <div class="flex gap-2 pt-2">
        <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
        <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count?: number;
}>();
</script>
