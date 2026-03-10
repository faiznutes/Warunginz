<template>
  <div class="p-4 border-t border-[#e7edf3] dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 mt-auto">
    <div class="flex items-center gap-3 mb-4">
      <div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-600 shadow-sm bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
        {{ initials }}
      </div>
      <div class="flex flex-col min-w-0">
        <div class="flex items-center gap-1.5 overflow-hidden">
          <p class="text-sm font-bold text-[#0d141b] dark:text-white truncate">{{ name }}</p>
          <span 
            v-if="role"
            class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"
            :class="roleBadgeClass"
          >
            {{ roleLabel }}
          </span>
        </div>
        <p class="text-xs text-[#4c739a] dark:text-slate-400 truncate">{{ subtext }}</p>
      </div>
    </div>
    
    <button 
      @click="$emit('logout')" 
      class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#4c739a] dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors w-full text-left"
    >
      <span class="material-symbols-outlined text-[20px]">logout</span>
      <p class="text-sm font-bold">Keluar</p>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  name: string;
  initials: string;
  role: string;
  subtext: string;
  isSuperAdmin?: boolean;
}>();

defineEmits(['logout']);

const roleLabel = computed(() => {
  if (props.isSuperAdmin) return 'S-Admin';
  return props.role;
});

const roleBadgeClass = computed(() => {
  if (props.isSuperAdmin) return 'bg-red-50 text-red-600 border border-red-100';
  
  switch (props.role) {
    case 'ADMIN_TENANT':
    case 'SUPERVISOR':
      return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'CASHIER':
      return 'bg-orange-50 text-orange-600 border border-orange-100';
    case 'KITCHEN':
      return 'bg-purple-50 text-purple-600 border border-purple-100';
    case 'OWNER':
      return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'STAFF':
      return 'bg-orange-50 text-orange-600 border border-orange-100';
    default:
      return 'bg-slate-50 text-slate-600 border border-slate-100';
  }
});
</script>
