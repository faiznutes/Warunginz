<template>
  <div class="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 px-4 py-2">
    <span v-if="icon" class="material-symbols-outlined text-[16px]">{{ icon }}</span>
    <span class="uppercase tracking-wider">
      <slot></slot>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
}>();
</script>
