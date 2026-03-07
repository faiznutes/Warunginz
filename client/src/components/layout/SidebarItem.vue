<template>
  <router-link 
    :to="to" 
    class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group relative"
    active-class="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
    :class="[isActive ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
    @click="$emit('click')"
  >
    <span class="material-symbols-outlined" :class="{ 'icon-filled': isActive }">{{ icon }}</span>
    <p class="text-sm font-medium leading-normal">{{ label }}</p>
    <slot name="suffix"></slot>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
  to: string;
  icon: string;
  label: string;
  exact?: boolean;
}>();

defineEmits(['click']);

const route = useRoute();
const isActive = computed(() => {
  if (props.exact) {
    return route.path === props.to;
  }
  return route.path.startsWith(props.to);
});
</script>
