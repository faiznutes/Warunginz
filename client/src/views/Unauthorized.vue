<template>
  <div class="min-h-screen flex items-center justify-center font-display bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e] px-4">
    <div class="text-center max-w-2xl">
      <!-- Icon -->
      <div class="mb-6">
        <div class="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center animate-bounce-slow">
          <span class="material-symbols-outlined text-red-500 text-[48px]">block</span>
        </div>
      </div>

      <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">Akses Ditolak</h1>

      <!-- Addon Required -->
      <div v-if="reason === 'addon'" class="mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 p-8 border border-slate-100 dark:border-slate-700/50 mb-6 backdrop-blur-sm">
          <p class="text-lg text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
            Fitur ini memerlukan add-on <strong class="text-primary font-semibold">{{ getAddonName(addonType) }}</strong> untuk dapat diakses.
          </p>
          <p class="text-slate-500 dark:text-slate-400 mb-6">
            Silakan berlangganan add-on tersebut terlebih dahulu untuk menggunakan fitur ini.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link
              to="/app/super-dashboard/addons"
              class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 font-medium shadow-lg shadow-primary/30 transform hover:-translate-y-1"
            >
              <span class="material-symbols-outlined text-[20px]">extension</span>
              Lihat Add-on Tersedia
            </router-link>
            <router-link
              to="/app"
              class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 font-medium"
            >
              <span class="material-symbols-outlined text-[20px]">arrow_back</span>
              Kembali ke Dashboard
            </router-link>
          </div>
        </div>
      </div>

      <!-- General Access Denied -->
      <div v-else class="mb-8">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 p-8 border border-slate-100 dark:border-slate-700/50 mb-6 backdrop-blur-sm">
          <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            {{ getIndonesianMessage(route.query.message as string) || 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.' }}
          </p>
          <router-link
            to="/app"
            class="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 font-medium shadow-lg shadow-primary/30 transform hover:-translate-y-1"
          >
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            Kembali ke Dashboard
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const reason = computed(() => route.query.reason as string);
const addonType = computed(() => route.query.addon as string);

const getAddonName = (type: string | undefined) => {
  const addonNames: Record<string, string> = {
    'BUSINESS_ANALYTICS': 'Analisis Bisnis & Wawasan',
    'EXPORT_REPORTS': 'Ekspor Laporan',
    'RESTOCK_SUGGESTION': 'Saran Stok Ulang',
    'STOCK_TRANSFER': 'Transfer Stok Antar Toko',
    'SUPERVISOR_ROLE': 'Peran Supervisor',
    'PRICE_RECOMMENDATION_PLUS': 'Rekomendasi Harga Plus',
    'BULK_IMPORT': 'Impor Massal',
    'RECEIPT_EDITOR': 'Editor Struk Simpel',
    'DELIVERY_MARKETING': 'Pengiriman & Pemasaran',
  };
  return addonNames[type || ''] || type || 'Add-on';
};

const getIndonesianMessage = (msg: string | undefined) => {
  if (!msg) return null;
  // Simple mapping for common error messages if needed, or just return msg if already Indonesian
  return msg; // Assuming backend might send English, but for now we'll handle frontend strings. Ideally backend sends ID.
};
</script>
