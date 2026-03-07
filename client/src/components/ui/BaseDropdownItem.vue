<template>
  <button
    :class="[
      'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors w-full text-left',
      'hover:bg-slate-50 dark:hover:bg-slate-700',
      'focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-700',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10' : 'text-slate-700 dark:text-slate-300'
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
    role="menuitem"
  >
    <span v-if="icon" class="material-symbols-outlined text-[20px]">{{ icon }}</span>
    <span class="flex-1">
      <slot></slot>
    </span>
    <span v-if="shortcut" class="text-xs text-slate-400 font-mono">{{ shortcut }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  shortcut?: string;
}>();

defineEmits(['click']);
</script>
