<template>
  <label
    :class="[
      'inline-flex items-start gap-3 cursor-pointer group font-display select-none',
      disabled ? 'cursor-not-allowed opacity-60' : ''
    ]"
  >
    <div class="relative flex items-center pt-0.5">
      <input
        type="radio"
        :checked="modelValue === value"
        :value="value"
        :disabled="disabled"
        class="peer sr-only"
        @change="$emit('update:modelValue', value)"
      />
      <!-- Custom Radio Circle -->
      <div
        :class="[
          'w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center shadow-sm',
          modelValue === value
            ? 'border-blue-600' 
            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-500',
          disabled ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'peer-focus:ring-2 peer-focus:ring-blue-500/30'
        ]"
      >
        <div
          class="w-2.5 h-2.5 rounded-full bg-blue-600 transition-transform duration-200"
          :class="modelValue === value ? 'scale-100' : 'scale-0'"
        ></div>
      </div>
    </div>
    
    <div class="flex flex-col">
       <span v-if="label" :class="['text-sm font-bold transition-colors', modelValue === value ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400']">
         {{ label }}
       </span>
       <span v-if="description" class="text-xs text-slate-400 font-medium">
         {{ description }}
       </span>
    </div>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: any;
  value?: any;
  label?: string;
  description?: string;
  disabled?: boolean;
}>();

defineEmits(['update:modelValue']);
</script>
