<template>
  <tr
    :class="[
      'group transition-colors duration-200',
      stripe ? 'even:bg-slate-50/50 dark:even:bg-slate-800/30' : '',
      hover ? 'hover:bg-blue-50/50 dark:hover:bg-slate-700/50 cursor-pointer' : '',
      selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-slate-800'
    ]"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </tr>
</template>

<script setup lang="ts">
defineProps<{
  hover?: boolean;
  stripe?: boolean;
  selected?: boolean;
}>();

defineEmits(['click']);
</script>
