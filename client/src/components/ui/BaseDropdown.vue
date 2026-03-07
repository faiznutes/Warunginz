<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <button
      @click="toggle"
      :class="[
        'inline-flex items-center justify-center gap-2 transition-colors',
        buttonClass
      ]"
      :aria-expanded="isOpen"
      :aria-haspopup="true"
    >
      <slot name="trigger">
        <span>{{ label }}</span>
        <span class="material-symbols-outlined text-[20px] transition-transform" :class="{ 'rotate-180': isOpen }">
          expand_more
        </span>
      </slot>
    </button>

    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute z-50 mt-2 rounded-xl shadow-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden',
          widthClass,
          positionClass
        ]"
        role="menu"
        aria-orientation="vertical"
      >
        <div class="py-1 max-h-96 overflow-y-auto custom-scrollbar">
          <slot></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  label?: string;
  position?: 'left' | 'right';
  width?: 'auto' | 'sm' | 'md' | 'lg';
  buttonClass?: string;
}>();

const emit = defineEmits(['open', 'close']);

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const widthClass = computed(() => {
  const widths = {
    auto: 'w-auto min-w-[12rem]',
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80'
  };
  return widths[props.width || 'auto'];
});

const positionClass = computed(() => {
  return props.position === 'right' ? 'right-0' : 'left-0';
});

const toggle = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    emit('open');
  } else {
    emit('close');
  }
};

const close = () => {
  if (isOpen.value) {
    isOpen.value = false;
    emit('close');
  }
};

// Close on click outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close();
  }
};

// Close on Escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    close();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscape);
});

defineExpose({ close });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
