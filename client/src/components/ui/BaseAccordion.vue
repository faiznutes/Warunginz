<template>
  <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
    <button
      @click="toggle"
      :class="[
        'w-full flex items-center justify-between p-4 text-left transition-colors',
        'hover:bg-slate-50 dark:hover:bg-slate-700/50',
        'focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-700/50',
        isOpen ? 'bg-slate-50 dark:bg-slate-700/30' : ''
      ]"
      :aria-expanded="isOpen"
    >
      <div class="flex items-center gap-3 flex-1">
        <span v-if="icon" class="material-symbols-outlined text-[24px] text-slate-600 dark:text-slate-400">
          {{ icon }}
        </span>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ title }}</h3>
          <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ subtitle }}</p>
        </div>
      </div>
      
      <span 
        class="material-symbols-outlined text-[24px] text-slate-400 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      >
        expand_more
      </span>
    </button>

    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[1000px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-[1000px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="isOpen" class="overflow-hidden">
        <div class="p-4 pt-0 border-t border-slate-100 dark:border-slate-700">
          <slot></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  title: string;
  subtitle?: string;
  icon?: string;
  modelValue?: boolean;
  defaultOpen?: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'toggle']);

const isOpen = ref(props.modelValue ?? props.defaultOpen ?? false);

const toggle = () => {
  isOpen.value = !isOpen.value;
  emit('update:modelValue', isOpen.value);
  emit('toggle', isOpen.value);
};

watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined && newValue !== isOpen.value) {
    isOpen.value = newValue;
  }
});
</script>
