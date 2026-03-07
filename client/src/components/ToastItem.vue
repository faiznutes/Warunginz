<template>
  <div
    class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out hover:shadow-xl"
    :class="[
      typeClass,
      show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    ]"
    role="alert"
    @mouseenter="pauseTimer"
    @mouseleave="resumeTimer"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <component :is="iconComponent" class="h-6 w-6" :class="iconClass" aria-hidden="true" />
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p class="text-sm font-bold text-gray-900 dark:text-white" v-if="title">{{ title }}</p>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-snug">{{ message }}</p>
          <!-- Undo Button -->
          <button
            v-if="undoAction"
            @click="handleUndo"
            class="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-emerald-300 underline"
          >
            {{ undoLabel || 'Undo' }}
          </button>
        </div>
        <div class="ml-4 flex flex-shrink-0">
          <button
            type="button"
            class="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="$emit('close')"
          >
            <span class="sr-only">Close</span>
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>
    </div>
    <!-- Progress Bar -->
    <div class="h-1 w-full bg-gray-100 dark:bg-slate-700">
      <div
        class="h-full transition-all duration-100 ease-linear"
        :class="progressBarClass"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, h } from 'vue';

const props = defineProps<{
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  undoAction?: () => void | Promise<void>;
  undoLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'undo'): void;
}>();

const handleUndo = async () => {
  if (props.undoAction) {
    await props.undoAction();
  }
  emit('undo');
  closeToast();
};

const show = ref(false);
const progress = ref(100);
let timer: any = null;
let progressInterval: any = null;
const remainingTime = ref(props.duration || 3000);
const startTime = ref(Date.now());

// Mount animation
onMounted(() => {
  requestAnimationFrame(() => {
    show.value = true;
  });
  startTimer();
});

const startTimer = () => {
  if (remainingTime.value <= 0) return;
  
  const totalDuration = props.duration || 3000;
  startTime.value = Date.now();
  
  timer = setTimeout(() => {
    closeToast();
  }, remainingTime.value);

  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime.value;
    const currentRemaining = Math.max(0, remainingTime.value - elapsed);
    progress.value = (currentRemaining / totalDuration) * 100;
  }, 100); // 100ms update rate for bar
};

const pauseTimer = () => {
  if (timer) clearTimeout(timer);
  if (progressInterval) clearInterval(progressInterval);
  
  const elapsed = Date.now() - startTime.value;
  remainingTime.value -= elapsed;
};

const resumeTimer = () => {
  startTimer();
};

const closeToast = () => {
  show.value = false;
  setTimeout(() => {
    emit('close');
  }, 300); // Wait for transition out
};

onUnmounted(() => {
  if (timer) clearTimeout(timer);
  if (progressInterval) clearInterval(progressInterval);
});

// Styles
const typeClass = computed(() => {
  return 'border-l-4 ' + (
    props.type === 'success' ? 'border-green-500' :
    props.type === 'error' ? 'border-red-500' :
    props.type === 'warning' ? 'border-yellow-500' :
    'border-blue-500'
  );
});

const iconClass = computed(() => {
  return props.type === 'success' ? 'text-green-500' :
         props.type === 'error' ? 'text-red-500' :
         props.type === 'warning' ? 'text-yellow-500' :
         'text-blue-500';
});

const progressBarClass = computed(() => {
    return props.type === 'success' ? 'bg-green-500' :
         props.type === 'error' ? 'bg-red-500' :
         props.type === 'warning' ? 'bg-yellow-500' :
         'bg-blue-500';
});

const iconComponent = computed(() => {
    const icons: Record<string, any> = {
    success: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })]),
    error: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' })]),
    warning: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })]),
    info: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })])
  };
  return icons[props.type] || icons.info;
});

</script>
