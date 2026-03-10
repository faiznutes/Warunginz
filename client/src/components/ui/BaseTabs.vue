<template>
  <div class="w-full">
    <!-- Tab Headers -->
    <div :class="['flex border-b border-slate-200 dark:border-slate-700', headerClass]">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selectTab(index)"
        :class="[
          'px-6 py-3 text-sm font-bold transition-all duration-200 relative',
          'hover:text-blue-600 dark:hover:text-blue-400',
          'focus:outline-none focus:text-blue-600',
          activeTab === index
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-slate-500 dark:text-slate-400',
          tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        ]"
        :disabled="tab.disabled"
        role="tab"
        :aria-selected="activeTab === index"
      >
        <div class="flex items-center gap-2">
          <span v-if="tab.icon" class="material-symbols-outlined text-[20px]">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <BaseBadge v-if="tab.badge" size="xs" :variant="tab.badgeVariant || 'primary'">
            {{ tab.badge }}
          </BaseBadge>
        </div>
        
        <!-- Active Indicator -->
        <div
          v-if="activeTab === index"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 animate-scale-in"
        ></div>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="mt-6">
      <Transition
        :name="transitionName"
        mode="out-in"
      >
        <div :key="activeTab" class="animate-fade-in">
          <slot :name="`tab-${activeTab}`">
            <slot></slot>
          </slot>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseBadge from './BaseBadge.vue';

interface Tab {
  label: string;
  icon?: string;
  badge?: string | number;
  badgeVariant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'orange';
  disabled?: boolean;
}

const props = defineProps<{
  tabs: Tab[];
  modelValue?: number;
  headerClass?: string;
  transition?: 'fade' | 'slide' | 'none';
}>();

const emit = defineEmits(['update:modelValue', 'change']);

const activeTab = ref(props.modelValue || 0);

const transitionName = props.transition === 'slide' ? 'slide-fade' : props.transition === 'none' ? '' : 'fade';

const selectTab = (index: number) => {
  if (props.tabs[index]?.disabled) return;
  
  activeTab.value = index;
  emit('update:modelValue', index);
  emit('change', index);
};

watch(() => props.modelValue, (newValue) => {
  if (newValue !== undefined && newValue !== activeTab.value) {
    activeTab.value = newValue;
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from {
  transform: translateX(10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-10px);
  opacity: 0;
}
</style>
