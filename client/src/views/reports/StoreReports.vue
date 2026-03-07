<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Laporan Toko</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Laporan penjualan dan stok per toko/cabang.</p>
      </div>
    </div>

    <!-- Date Filter -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dari Tanggal</label>
           <div class="relative">
             <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">event</span>
            <input
              v-model="startDate"
              type="date"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sampai Tanggal</label>
           <div class="relative">
             <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">event</span>
            <input
              v-model="endDate"
              type="date"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div class="flex items-end">
          <button
            @click="loadReport"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed h-[46px]"
          >
            <span class="material-symbols-outlined text-[20px]" v-if="!loading">bar_chart</span>
            <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            {{ loading ? 'Memuat...' : 'Buat Laporan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="text-slate-500 font-medium animate-pulse">Sedang memproses laporan...</p>
      </div>
    </div>

    <!-- Report Content -->
    <div v-else-if="report" class="space-y-8 animate-fade-in-up">
      <!-- Combined Summary -->
      <div class="bg-gradient-to-br from-blue-500/10 to-blue-500/10 dark:from-blue-900/20 dark:to-blue-900/20 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30 p-6">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
             <span class="material-symbols-outlined">analytics</span>
          </span>
          Ringkasan Gabungan - Semua Toko
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Pendapatan</p>
            <p class="text-3xl font-black text-blue-600 group-hover:scale-105 transition-transform origin-left">{{ formatCurrency(report.combined.revenue) }}</p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Pesanan</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{{ report.combined.orders }}</p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Item Terjual</p>
            <p class="text-3xl font-black text-slate-900 dark:text-white group-hover:scale-105 transition-transform origin-left">{{ report.combined.items }}</p>
          </div>
        </div>
      </div>

      <!-- Sales Per Store -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-500">storefront</span>
            Penjualan Per Toko
          </h3>
        </div>
        
        <div v-if="report.salesByOutlet.length === 0" class="text-center py-12">
          <div class="bg-slate-50 dark:bg-slate-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <span class="material-symbols-outlined text-[40px] text-slate-300">trending_flat</span>
          </div>
          <p class="text-slate-500 font-medium">Tidak ada data penjualan untuk periode ini</p>
        </div>
        
        <div v-else class="overflow-x-auto custom-scrollbar">
          <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900/50">
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Toko</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pendapatan</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pesanan</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Item Terjual</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata / Pesanan</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
              <tr
                v-for="store in report.salesByOutlet"
                :key="store.outlet.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-slate-900 dark:text-white">{{ store.outlet.name }}</div>
                  <div v-if="store.outlet.address" class="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                     <span class="material-symbols-outlined text-[12px]">location_on</span>
                     {{ store.outlet.address }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-black text-blue-600">
                  {{ formatCurrency(store.revenue) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                  {{ store.orders }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                  {{ store.items }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                  {{ formatCurrency(store.orders > 0 ? store.revenue / store.orders : 0) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stock Per Store -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-500">inventory_2</span>
            Stok Per Toko
          </h3>
        </div>
        
        <div v-if="report.stockByOutlet.length === 0" class="text-center py-12">
            <div class="bg-slate-50 dark:bg-slate-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <span class="material-symbols-outlined text-[40px] text-slate-300">inventory</span>
          </div>
          <p class="text-slate-500 font-medium">Data stok tidak tersedia</p>
        </div>
        
        <div v-else class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="store in report.stockByOutlet"
            :key="store.outlet.id"
            class="border rounded-2xl p-5 hover:shadow-lg transition-all"
            :class="store.lowStockCount > 0 ? 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'"
          >
            <h4 class="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <div class="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                  <span class="material-symbols-outlined text-blue-500 text-[20px]">store</span>
               </div>
              {{ store.outlet.name }}
            </h4>
            
            <div class="space-y-3 text-sm">
              <div class="flex justify-between items-center p-3 bg-white/60 dark:bg-slate-900/30 rounded-xl">
                <span class="text-slate-500 font-medium">Total Produk:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ store.totalProducts }}</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-white/60 dark:bg-slate-900/30 rounded-xl">
                <span class="text-slate-500 font-medium">Total Stok:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ store.totalStock }}</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-white/60 dark:bg-slate-900/30 rounded-xl">
                <span class="text-slate-500 font-medium">Stok Menipis:</span>
                <span
                  class="font-black flex items-center gap-1"
                  :class="store.lowStockCount > 0 ? 'text-amber-600' : 'text-blue-600'"
                >
                  <span v-if="store.lowStockCount > 0" class="material-symbols-outlined text-[18px]">warning</span>
                  {{ store.lowStockCount }}
                </span>
              </div>
            </div>
            
             <div v-if="store.lowStockCount > 0" class="mt-4 pt-3 border-t border-amber-200 dark:border-amber-800/30 text-xs text-amber-700 dark:text-amber-500 italic flex items-center gap-1">
                 <span class="material-symbols-outlined text-[14px]">info</span>
                 Perlakukan pengecekan stok segera.
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <div class="bg-slate-50 dark:bg-slate-900/50 w-24 h-24 rounded-full flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-[48px] text-slate-300">bar_chart</span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum Ada Laporan</h3>
      <p class="text-slate-500 text-center max-w-md font-medium">Pilih rentang tanggal dan klik "Buat Laporan" untuk melihat data laporan toko.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';

const { error: showError } = useNotification();

const loading = ref(false);
const report = ref<any>(null);
const startDate = ref('');
const endDate = ref('');

const loadReport = async () => {
  if (!startDate.value || !endDate.value) {
    showError('Mohon pilih tanggal mulai dan tanggal akhir');
    return;
  }

  loading.value = true;
  try {
    const response = await api.get('/reports/multi', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
      },
    });
    report.value = response.data;
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal memuat laporan');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  endDate.value = end.toISOString().split('T')[0];
  startDate.value = start.toISOString().split('T')[0];

  loadReport();
});
</script>

<style scoped>
/* Scoped styles */
</style>
