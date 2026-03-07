<template>
  <div class="flex flex-col gap-1.5 font-display">
    <label v-if="label" :for="id" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative group">
      <textarea
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows"
        :class="[
          'w-full p-4 bg-slate-50 dark:bg-slate-900 border transition-all duration-300 rounded-xl text-sm font-bold shadow-sm placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 resize-y',
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-red-900 dark:text-red-100 placeholder:text-red-300' 
            : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white',
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'hover:border-blue-300 dark:hover:border-slate-600'
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      ></textarea>
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
interface Props {
  label?: string;
  modelValue?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  id?: string;
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  required: false,
  rows: 4,
  id: () => `textarea-${Math.random().toString(36).substr(2, 9)}`,
});

defineEmits(['update:modelValue', 'blur', 'focus']);
</script>
