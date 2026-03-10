<template>
  <div class="relative inline-block" @mouseenter="show" @mouseleave="hide" @focus="show" @blur="hide">
    <slot></slot>
    
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible && content"
        :class="[
          'absolute z-50 px-3 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none',
          positionClasses
        ]"
        role="tooltip"
      >
        {{ content }}
        <div :class="['absolute w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45', arrowClasses]"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  content?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}>();

const isVisible = ref(false);
let timeoutId: number | null = null;

const positionClasses = computed(() => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };
  return positions[props.position || 'top'];
});

const arrowClasses = computed(() => {
  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 -mt-1',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1',
    left: 'left-full top-1/2 -translate-y-1/2 -ml-1',
    right: 'right-full top-1/2 -translate-y-1/2 -mr-1'
  };
  return arrows[props.position || 'top'];
});

const show = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = window.setTimeout(() => {
    isVisible.value = true;
  }, props.delay || 300);
};

const hide = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  isVisible.value = false;
};
</script>
