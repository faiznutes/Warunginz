<template>
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in-up">
    <div 
      class="p-6 rounded-full mb-6 relative group"
      :class="[
        iconBgColor || 'bg-slate-50 dark:bg-slate-800',
        { 'animate-bounce-subtle': animateIcon }
      ]"
    >
      <div 
        v-if="iconBgColor" 
        class="absolute inset-0 rounded-full opacity-20 animate-ping-slow"
        :class="iconBgColor"
      ></div>
      <span 
        class="material-symbols-outlined text-5xl relative z-10 transition-transform duration-300 group-hover:scale-110"
        :class="iconColor || 'text-slate-300 dark:text-slate-600'"
      >
        {{ icon || 'inbox' }}
      </span>
    </div>
    
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 max-w-md">
      {{ title || 'Data Tidak Ditemukan' }}
    </h3>
    
    <p class="text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
      {{ description || 'Belum ada data yang tersedia untuk ditampilkan saat ini.' }}
    </p>

    <div v-if="$slots.action || actionLabel" class="flex gap-3">
      <slot name="action">
        <button
          v-if="actionLabel"
          @click="$emit('action')"
          class="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-bold text-sm transform hover:-translate-y-0.5"
        >
          <span v-if="actionIcon" class="material-symbols-outlined text-[20px]">{{ actionIcon }}</span>
          <span>{{ actionLabel }}</span>
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: string;
  iconColor?: string;
  iconBgColor?: string;
  animateIcon?: boolean;
}>();

defineEmits(['action']);
</script>

<style scoped>
.animate-bounce-subtle {
  animation: bounce-subtle 2s infinite;
}

.animate-ping-slow {
  animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes bounce-subtle {
  0%, 100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
