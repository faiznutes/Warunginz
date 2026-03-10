<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show && visible"
        ref="tooltipRef"
        class="fixed z-[200] bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-2xl p-4 max-w-xs pointer-events-none"
        :style="tooltipStyle"
      >
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-blue-400 text-[20px] flex-shrink-0">lightbulb</span>
          <div class="flex-1">
            <h4 class="font-bold text-sm mb-1">{{ title }}</h4>
            <p class="text-xs text-slate-300 leading-relaxed">{{ content }}</p>
          </div>
          <button
            @click="dismiss"
            class="p-1 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0 pointer-events-auto"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
        <div class="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
          <button
            @click="dismiss"
            class="text-xs font-bold text-blue-400 hover:text-emerald-300 transition-colors pointer-events-auto"
          >
            Mengerti
          </button>
          <button
            @click="dontShowAgain"
            class="text-xs text-slate-400 hover:text-slate-300 transition-colors pointer-events-auto"
          >
            Jangan tampilkan lagi
          </button>
        </div>
        <!-- Arrow -->
        <div
          class="absolute w-3 h-3 bg-slate-900 dark:bg-slate-800 transform rotate-45"
          :style="arrowStyle"
        ></div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

interface Props {
  show: boolean;
  target: HTMLElement | null;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  tooltipId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
  tooltipId: '',
});

const emit = defineEmits<{
  dismiss: [];
  dontShowAgain: [];
}>();

const tooltipRef = ref<HTMLElement | null>(null);
const visible = ref(false);

const tooltipStyle = computed(() => {
  if (!props.target || !tooltipRef.value) return {};
  
  const targetRect = props.target.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  const gap = 8;
  
  let top = 0;
  let left = 0;
  
  switch (props.placement) {
    case 'top':
      top = targetRect.top - tooltipRect.height - gap;
      left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      break;
    case 'bottom':
      top = targetRect.bottom + gap;
      left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      break;
    case 'left':
      top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
      left = targetRect.left - tooltipRect.width - gap;
      break;
    case 'right':
      top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
      left = targetRect.right + gap;
      break;
  }
  
  // Keep within viewport
  const padding = 16;
  if (left < padding) left = padding;
  if (left + tooltipRect.width > window.innerWidth - padding) {
    left = window.innerWidth - tooltipRect.width - padding;
  }
  if (top < padding) top = padding;
  if (top + tooltipRect.height > window.innerHeight - padding) {
    top = window.innerHeight - tooltipRect.height - padding;
  }
  
  return {
    top: `${top}px`,
    left: `${left}px`,
  };
});

const arrowStyle = computed(() => {
  switch (props.placement) {
    case 'top':
      return { bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' };
    case 'bottom':
      return { top: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)' };
    case 'left':
      return { right: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' };
    case 'right':
      return { left: '-4px', top: '50%', transform: 'translateY(-50%) rotate(45deg)' };
    default:
      return {};
  }
});

const dismiss = () => {
  visible.value = false;
  emit('dismiss');
};

const dontShowAgain = () => {
  visible.value = false;
  emit('dontShowAgain');
};

watch(() => props.show, async (newShow) => {
  if (newShow) {
    await nextTick();
    visible.value = true;
  } else {
    visible.value = false;
  }
});

// Close on click outside
const handleClickOutside = (e: MouseEvent) => {
  if (props.show && tooltipRef.value && !tooltipRef.value.contains(e.target as Node) && 
      props.target && !props.target.contains(e.target as Node)) {
    dismiss();
  }
};

onMounted(() => {
  if (props.show) {
    nextTick(() => {
      visible.value = true;
    });
  }
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

