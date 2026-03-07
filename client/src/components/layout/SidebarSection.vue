<template>
  <div class="flex flex-col gap-1">
    <button 
      @click="$emit('toggle')"
      class="flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#4c739a] dark:text-slate-400 hover:text-blue-600 transition-colors w-full text-left"
    >
      <span>{{ label }}</span>
      <span class="material-symbols-outlined text-[16px] transition-transform duration-200" :class="{ 'rotate-180': isOpen }">
        keyboard_arrow_down
      </span>
    </button>
    
    <div v-show="isOpen" class="flex flex-col gap-1 mt-1">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  isOpen: boolean;
}>();

defineEmits(['toggle']);
</script>
