<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Preferensi Pengguna</h1>
      <p class="text-slate-500 dark:text-slate-400 font-medium">Sesuaikan pengalaman penggunaan aplikasi Anda.</p>
    </div>

    <div class="space-y-4">
      <!-- Language & Region Group -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <button
          @click="toggleSection('language')"
          class="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
              <span class="material-symbols-outlined text-[24px]">language</span>
            </div>
            <div class="text-left">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Bahasa & Wilayah</h3>
              <p class="text-sm text-slate-500">Pilih bahasa tampilan aplikasi</p>
            </div>
          </div>
          <span
            class="material-symbols-outlined text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180': expandedSections.language }"
          >
            expand_more
          </span>
        </button>
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[500px]"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[500px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="expandedSections.language" class="px-6 pb-6">
            <div class="pl-[68px]">
              <select v-model="settings.language" class="w-full max-w-xs px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Notifications Group -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <button
          @click="toggleSection('notifications')"
          class="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
              <span class="material-symbols-outlined text-[24px]">notifications</span>
            </div>
            <div class="text-left">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Notifikasi</h3>
              <p class="text-sm text-slate-500">Kelola pemberitahuan yang ingin Anda terima</p>
            </div>
          </div>
          <span
            class="material-symbols-outlined text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180': expandedSections.notifications }"
          >
            expand_more
          </span>
        </button>
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[500px]"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[500px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="expandedSections.notifications" class="px-6 pb-6">
            <div class="pl-[68px] space-y-3">
              <label class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-amber-200 transition-colors">
                <span class="font-bold text-slate-700 dark:text-slate-200">Peringatan Stok Rendah</span>
                <div class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="settings.notifyLowStock" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                </div>
              </label>
              <label class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-amber-200 transition-colors">
                <span class="font-bold text-slate-700 dark:text-slate-200">Pesanan Baru Masuk</span>
                <div class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="settings.notifyNewOrder" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                </div>
              </label>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Dashboard Widgets Group -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <button
          @click="toggleSection('dashboard')"
          class="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
              <span class="material-symbols-outlined text-[24px]">dashboard</span>
            </div>
            <div class="text-left">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Widget Dashboard</h3>
              <p class="text-sm text-slate-500">Pilih widget yang tampil di halaman utama</p>
            </div>
          </div>
          <span
            class="material-symbols-outlined text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180': expandedSections.dashboard }"
          >
            expand_more
          </span>
        </button>
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[500px]"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[500px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="expandedSections.dashboard" class="px-6 pb-6">
            <div class="pl-[68px] space-y-3">
              <label class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-emerald-200 transition-colors">
                <span class="font-bold text-slate-700 dark:text-slate-200">Ringkasan Penjualan (Grafik)</span>
                <div class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="settings.showSalesChart" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </div>
              </label>
              <label class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-emerald-200 transition-colors">
                <span class="font-bold text-slate-700 dark:text-slate-200">Produk Terlaris</span>
                <div class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="settings.showTopProducts" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
                </div>
              </label>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end">
      <button @click="saveSettings" :disabled="saved" class="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
        <span v-if="saved" class="material-symbols-outlined">check</span>
        <span>{{ saved ? 'Tersimpan' : 'Simpan Perubahan' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const saved = ref(false);

// Expanded sections state (persist to localStorage)
const EXPANDED_SECTIONS_KEY = 'preferences_expanded_sections';
const loadExpandedSections = () => {
  try {
    const stored = localStorage.getItem(EXPANDED_SECTIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load expanded sections:', e);
  }
  // Default: first section expanded
  return { language: true, notifications: false, dashboard: false };
};

const expandedSections = ref(loadExpandedSections());

const toggleSection = (section: string) => {
  expandedSections.value[section] = !expandedSections.value[section];
  // Save to localStorage
  try {
    localStorage.setItem(EXPANDED_SECTIONS_KEY, JSON.stringify(expandedSections.value));
  } catch (e) {
    console.warn('Failed to save expanded sections:', e);
  }
};

const settings = reactive({
  language: localStorage.getItem('user_language') || 'id',
  notifyLowStock: localStorage.getItem('user_notifyLowStock') !== 'false', // Default true
  notifyNewOrder: localStorage.getItem('user_notifyNewOrder') !== 'false', // Default true
  showSalesChart: localStorage.getItem('user_showSalesChart') !== 'false', // Default true
  showTopProducts: localStorage.getItem('user_showTopProducts') !== 'false', // Default true
});

const saveSettings = () => {
   localStorage.setItem('user_language', settings.language);
   localStorage.setItem('user_notifyLowStock', String(settings.notifyLowStock));
   localStorage.setItem('user_notifyNewOrder', String(settings.notifyNewOrder));
   localStorage.setItem('user_showSalesChart', String(settings.showSalesChart));
   localStorage.setItem('user_showTopProducts', String(settings.showTopProducts));
   
   saved.value = true;
   setTimeout(() => saved.value = false, 2000);
   
   // Emit event or reload if language changed significantly?
   if (settings.language !== 'id') {
      // Simple alert for now as full i18n isn't implemented
      // alert('Bahasa diubah. Beberapa bagian mungkin memerlukan reload.');
   }
};
</script>
