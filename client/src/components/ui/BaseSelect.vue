<template>
  <div class="flex flex-col gap-1.5 font-display">
    <label v-if="label" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative group">
      <select
        :value="modelValue"
        :disabled="disabled"
        :class="[
          'w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border transition-all duration-300 rounded-xl text-sm font-bold shadow-sm appearance-none cursor-pointer focus:outline-none focus:bg-white dark:focus:bg-slate-800',
          modelValue === '' ? 'text-slate-400' : 'text-slate-900 dark:text-white',
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
            : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 group-hover:border-blue-300 dark:group-hover:border-slate-600',
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''
        ]"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        @blur="$emit('blur', $event)"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option
          v-for="option in normalizedOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- Custom Arrow -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none transition-colors duration-300">
         <span class="material-symbols-outlined text-[20px]" :class="error ? 'text-red-400' : 'text-slate-400 group-hover:text-blue-500'">expand_more</span>
      </div>
    </div>
    
    <span v-if="error" class="text-xs font-bold text-red-500 ml-1 animate-fade-in-down flex items-center gap-1">
       <span class="material-symbols-outlined text-[14px]">error</span>
       {{ error }}
    </span>
    <span v-else-if="hint" class="text-xs font-medium text-slate-400 ml-1">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  label?: string;
  modelValue?: string | number;
  options?: (string | Option)[];
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: 'Select an option',
  disabled: false,
  required: false,
});

defineEmits(['update:modelValue', 'blur']);

const normalizedOptions = computed(() => {
  return props.options.map(opt => {
    if (typeof opt === 'object' && opt !== null && 'label' in opt && 'value' in opt) {
      return opt;
    }
    return { label: String(opt), value: String(opt) };
  });
});
</script>
