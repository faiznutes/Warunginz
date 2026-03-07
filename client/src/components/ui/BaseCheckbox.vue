<template>
  <label
    :class="[
      'inline-flex items-start gap-3 cursor-pointer group font-display select-none',
      disabled ? 'cursor-not-allowed opacity-60' : ''
    ]"
  >
    <div class="relative flex items-center pt-0.5">
      <input
        type="checkbox"
        :checked="isChecked"
        :value="value"
        :disabled="disabled"
        class="peer sr-only"
        @change="handleChange"
      />
      <!-- Custom Checkbox Box -->
      <div
        :class="[
          'w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center shadow-sm',
          isChecked 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400 dark:group-hover:border-blue-500',
          disabled ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'peer-focus:ring-2 peer-focus:ring-blue-500/30'
        ]"
      >
        <svg
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="isChecked ? 'scale-100' : 'scale-0'"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="3"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    
    <div class="flex flex-col">
       <span v-if="label" :class="['text-sm font-bold transition-colors', isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400']">
         {{ label }}
       </span>
       <span v-if="description" class="text-xs text-slate-400 font-medium">
         {{ description }}
       </span>
    </div>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue?: boolean | any[];
  value?: any;
  label?: string;
  description?: string;
  disabled?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value);
  }
  return props.modelValue === true;
});

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const checked = target.checked;

  if (Array.isArray(props.modelValue)) {
    const newValue = [...props.modelValue];
    if (checked) {
      newValue.push(props.value);
    } else {
      const index = newValue.indexOf(props.value);
      if (index > -1) newValue.splice(index, 1);
    }
    emit('update:modelValue', newValue);
  } else {
    emit('update:modelValue', checked);
  }
};
</script>
