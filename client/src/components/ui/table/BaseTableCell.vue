<template>
  <td
    :class="[
      'px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors duration-200',
      align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
    ]"
  >
    <slot></slot>
  </td>
</template>

<script setup lang="ts">
defineProps<{
  align?: 'left' | 'center' | 'right';
}>();
</script>
