<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="toggle"
    class="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
    :class="[
      modelValue ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
      :class="[modelValue ? 'translate-x-5' : 'translate-x-0']"
    ></span>
    <span class="sr-only">{{ label }}</span>
  </button>
  <span v-if="label" class="ml-3 text-sm font-bold text-slate-900 dark:text-white cursor-pointer" @click="!disabled && toggle()">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: boolean;
  label?: string;
  disabled?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const toggle = () => {
  if (props.disabled) return;
  emit('update:modelValue', !props.modelValue);
};
</script>
