<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-sm"
        @click="skip"
      >
        <!-- Spotlight Effect -->
        <div
          v-if="currentStep < steps.length"
          class="absolute rounded-2xl border-4 border-blue-500 shadow-2xl shadow-blue-500/50 pointer-events-none transition-all duration-300"
          :style="spotlightStyle"
        ></div>
        
        <!-- Tour Content -->
        <div class="absolute inset-0 p-4 pointer-events-none">
          <div
            v-if="currentStep < steps.length"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 pointer-events-auto animate-scale-in"
            :style="contentStyle"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                  <span class="material-symbols-outlined text-[24px]">explore</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white">Selamat Datang!</h3>
                  <p class="text-xs text-slate-500">Langkah {{ currentStep + 1 }} dari {{ steps.length }}</p>
                </div>
              </div>
              <button
                @click="skip"
                class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
              >
                <span class="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div class="mb-6">
              <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {{ steps[currentStep].title }}
              </h4>
              <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {{ steps[currentStep].content }}
              </p>
            </div>
            
            <!-- Progress Indicator -->
            <div class="flex items-center gap-2 mb-6">
              <div
                v-for="(step, index) in steps"
                :key="index"
                class="flex-1 h-1.5 rounded-full transition-all"
                :class="index <= currentStep ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'"
              ></div>
            </div>
            
            <!-- Actions -->
            <div class="flex items-center justify-between gap-3">
              <button
                v-if="currentStep > 0"
                @click="previous"
                class="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Sebelumnya
              </button>
              <div v-else></div>
              
              <div class="flex items-center gap-2">
                <button
                  @click="skip"
                  class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Lewati
                </button>
                <button
                  v-if="currentStep < steps.length - 1"
                  @click="next"
                  class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/30"
                >
                  Lanjut
                </button>
                <button
                  v-else
                  @click="finish"
                  class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/30"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, nextTick } from 'vue';
import { useTour } from '../composables/useTour';

interface TourStep {
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: TourStep[] = [
  {
    title: 'Selamat Datang di Warungin POS!',
    content: 'Aplikasi POS yang mudah digunakan untuk mengelola toko Anda. Mari kita mulai dengan tour singkat.',
    position: 'center',
  },
  {
    title: 'Dashboard',
    content: 'Dashboard menampilkan ringkasan penjualan, produk terlaris, dan statistik penting. Gunakan filter untuk melihat data periode tertentu.',
    target: 'a[href="/app/dashboard"]',
    position: 'bottom',
  },
  {
    title: 'Produk',
    content: 'Kelola produk Anda di sini. Tambah, edit, atau hapus produk dengan mudah. Gunakan filter dan search untuk menemukan produk dengan cepat.',
    target: 'a[href="/app/products"]',
    position: 'bottom',
  },
  {
    title: 'Pesanan & Transaksi',
    content: 'Lihat dan kelola semua pesanan. Filter berdasarkan status atau tanggal. Badge merah menunjukkan pesanan baru yang perlu ditangani.',
    target: 'a[href="/app/orders"]',
    position: 'bottom',
  },
  {
    title: 'Bantuan & Shortcuts',
    content: 'Gunakan tombol bantuan (?) untuk mendapatkan bantuan konteks. Tekan ? untuk melihat semua keyboard shortcuts. Tekan Ctrl+K untuk global search.',
    target: 'button[title="Bantuan"]',
    position: 'bottom',
  },
];

const { show, currentStep, next, previous, skip, finish } = useTour();

const spotlightStyle = computed(() => {
  if (currentStep.value >= steps.length) return {};
  
  const step = steps[currentStep.value];
  if (!step.target) {
    return { display: 'none' };
  }
  
  const element = document.querySelector(step.target) as HTMLElement;
  if (!element) {
    return { display: 'none' };
  }
  
  const rect = element.getBoundingClientRect();
  const padding = 8;
  
  return {
    left: `${rect.left - padding}px`,
    top: `${rect.top - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`,
  };
});

const contentStyle = computed(() => {
  if (currentStep.value >= steps.length) {
    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }
  
  const step = steps[currentStep.value];
  if (!step.target || step.position === 'center') {
    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }
  
  const element = document.querySelector(step.target) as HTMLElement;
  if (!element) {
    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }
  
  const rect = element.getBoundingClientRect();
  const padding = 20;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let top = '50%';
  let left = '50%';
  let transform = 'translate(-50%, -50%)';
  
  switch (step.position) {
    case 'top':
      top = `${Math.max(padding, rect.top - padding)}px`;
      left = `${Math.min(viewportWidth - 200, Math.max(200, rect.left + rect.width / 2))}px`;
      transform = 'translate(-50%, -100%)';
      break;
    case 'bottom':
      top = `${Math.min(viewportHeight - 300, rect.bottom + padding)}px`;
      left = `${Math.min(viewportWidth - 200, Math.max(200, rect.left + rect.width / 2))}px`;
      transform = 'translate(-50%, 0)';
      break;
    case 'left':
      top = `${Math.min(viewportHeight - 300, Math.max(padding, rect.top + rect.height / 2))}px`;
      left = `${Math.max(padding, rect.left - padding)}px`;
      transform = 'translate(-100%, -50%)';
      break;
    case 'right':
      top = `${Math.min(viewportHeight - 300, Math.max(padding, rect.top + rect.height / 2))}px`;
      left = `${Math.min(viewportWidth - 200, rect.right + padding)}px`;
      transform = 'translate(0, -50%)';
      break;
  }
  
  return {
    top,
    left,
    transform,
    position: 'fixed' as const,
  };
});

// Scroll to target element when step changes
watch(currentStep, async (step) => {
  if (step >= steps.length) return;
  
  await nextTick();
  const stepData = steps[step];
  if (stepData.target) {
    const element = document.querySelector(stepData.target) as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}, { immediate: false });
</script>

