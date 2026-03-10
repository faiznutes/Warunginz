<template>
  <div class="flex flex-col gap-1.5 font-display">
    <label v-if="label" :for="id" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative group">
      <!-- Left Icon -->
      <div v-if="icon" class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors duration-300">
        <span class="material-symbols-outlined text-[20px]" :class="error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'">{{ icon }}</span>
      </div>

      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        :class="[
          'w-full py-3 bg-slate-50 dark:bg-slate-900 border transition-all duration-300 rounded-xl text-sm font-bold shadow-sm placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800',
          icon ? 'pl-12' : 'pl-4',
          showSteppers && type === 'number' ? 'pr-20' : 'pr-4',
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-red-900 dark:text-red-100 placeholder:text-red-300' 
            : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white',
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'hover:border-blue-300 dark:hover:border-slate-600'
        ]"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <!-- Stepper Buttons (for number inputs) -->
      <div v-if="showSteppers && type === 'number' && !disabled" class="absolute inset-y-0 right-0 flex flex-col border-l border-slate-200 dark:border-slate-700 rounded-r-xl overflow-hidden">
        <button
          type="button"
          @click="increment"
          :disabled="disabled || (max !== undefined && Number(modelValue) >= Number(max))"
          class="flex-1 flex items-center justify-center px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-b border-slate-200 dark:border-slate-700"
          title="Tambah"
        >
          <span class="material-symbols-outlined text-[16px] text-slate-600 dark:text-slate-300">add</span>
        </button>
        <button
          type="button"
          @click="decrement"
          :disabled="disabled || (min !== undefined && Number(modelValue) <= Number(min))"
          class="flex-1 flex items-center justify-center px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Kurangi"
        >
          <span class="material-symbols-outlined text-[16px] text-slate-600 dark:text-slate-300">remove</span>
        </button>
      </div>

      <!-- Right Icon (e.g. for password toggle or status) -->
      <div v-if="$slots.append && (!showSteppers || type !== 'number')" class="absolute inset-y-0 right-0 flex items-center pr-4">
        <slot name="append"></slot>
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
interface Props {
  label?: string;
  modelValue?: string | number;
  type?: string;
  placeholder?: string;
  icon?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  id?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  showSteppers?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  showSteppers: false,
  step: 1,
  id: () => `input-${Math.random().toString(36).substr(2, 9)}`,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = props.type === 'number' ? Number(target.value) || 0 : target.value;
  emit('update:modelValue', value);
};

const increment = () => {
  if (props.disabled) return;
  const currentValue = Number(props.modelValue) || 0;
  const stepValue = Number(props.step) || 1;
  const newValue = currentValue + stepValue;
  const maxValue = props.max !== undefined ? Number(props.max) : undefined;
  const finalValue = maxValue !== undefined ? Math.min(newValue, maxValue) : newValue;
  emit('update:modelValue', finalValue);
};

const decrement = () => {
  if (props.disabled) return;
  const currentValue = Number(props.modelValue) || 0;
  const stepValue = Number(props.step) || 1;
  const newValue = currentValue - stepValue;
  const minValue = props.min !== undefined ? Number(props.min) : undefined;
  const finalValue = minValue !== undefined ? Math.max(newValue, minValue) : newValue;
  emit('update:modelValue', finalValue);
};
</script>
