<template>
  <div class="animate-pulse">
    <table class="w-full">
      <thead class="bg-slate-50 dark:bg-slate-900/50">
        <tr>
          <th v-for="i in columns" :key="i" class="px-6 py-4">
            <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row" class="border-b border-slate-100 dark:border-slate-800">
          <td v-for="col in columns" :key="col" class="px-6 py-4">
            <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded" :class="col === 1 ? 'w-full' : 'w-2/3'"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  rows?: number;
  columns?: number;
}>();
</script>
