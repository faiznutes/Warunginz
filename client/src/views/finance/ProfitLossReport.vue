<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Profit & Loss Report</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Analyze your business finances in detail.</p>
      </div>
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="flex items-center gap-2 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
          <input
            type="date"
            v-model="startDate"
            @change="loadProfitLoss"
            class="px-3 py-1.5 text-sm bg-transparent border-none focus:ring-0 text-[#0d141b] dark:text-white"
          />
          <span class="text-slate-500 text-xs font-medium px-1">to</span>
          <input
            type="date"
            v-model="endDate"
            @change="loadProfitLoss"
            class="px-3 py-1.5 text-sm bg-transparent border-none focus:ring-0 text-[#0d141b] dark:text-white"
          />
        </div>
        <button
          @click="exportReport"
          class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">download</span>
          <span>Export PDF</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-[#4c739a] font-medium text-sm">Loading report...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
      <div class="flex items-start gap-4">
        <span class="material-symbols-outlined text-red-500 text-3xl">error_outline</span>
        <div>
          <h3 class="font-bold text-red-700 dark:text-red-400">An Error Occurred</h3>
          <p class="text-sm text-red-600 dark:text-red-300 mt-1">{{ error }}</p>
          <router-link 
            v-if="error.includes('addon')" 
            to="/app/addons" 
            class="inline-block mt-3 text-sm font-bold text-red-700 underline hover:no-underline"
          >
            Subscribe to Business Analytics & Insight
          </router-link>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="profitLoss" class="space-y-6 animate-fade-in">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div class="flex justify-between items-start mb-4">
             <div>
               <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Revenue</p>
               <p class="text-[10px] text-slate-400">Total Income</p>
             </div>
             <div class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-[24px]">payments</span>
             </div>
          </div>
          <p class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(profitLoss.revenue) }}</p>
        </div>

        <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-red-500/50 transition-colors">
          <div class="flex justify-between items-start mb-4">
             <div>
               <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">COGS</p>
               <p class="text-[10px] text-slate-400">Harga Pokok Penjualan</p>
             </div>
             <div class="bg-red-50 dark:bg-red-900/30 p-2 rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-[24px]">inventory_2</span>
             </div>
          </div>
          <p class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(profitLoss.cogs) }}</p>
        </div>

        <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div class="flex justify-between items-start mb-4">
             <div>
               <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Gross Profit</p>
               <p class="text-[10px] text-slate-400">Laba Kotor</p>
             </div>
             <div class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-[24px]">insert_chart</span>
             </div>
          </div>
          <p class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(profitLoss.grossProfit) }}</p>
          <div class="mt-2 flex items-center gap-1 text-xs text-[#4c739a]">
            <span>Margin:</span>
            <span class="font-bold text-blue-600">{{ profitLoss.grossProfitMargin.toFixed(1) }}%</span>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-violet-500/50 transition-colors">
          <div class="flex justify-between items-start mb-4">
             <div>
               <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Net Profit</p>
               <p class="text-[10px] text-slate-400">Laba Bersih</p>
             </div>
             <div class="bg-violet-50 dark:bg-violet-900/30 p-2 rounded-xl text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-[24px]">monetization_on</span>
             </div>
          </div>
          <p class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(profitLoss.netProfit) }}</p>
          <div class="mt-2 flex items-center gap-1 text-xs text-[#4c739a]">
            <span>Margin:</span>
            <span class="font-bold text-violet-600">{{ profitLoss.netProfitMargin.toFixed(1) }}%</span>
          </div>
        </div>
      </div>

      <!-- Detailed Report -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Detail Laporan Laba Rugi</h3>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Revenue Section -->
          <div class="pb-6 border-b border-slate-100 dark:border-slate-700">
            <div class="flex justify-between items-center mb-4">
              <span class="text-base font-bold text-[#0d141b] dark:text-white">Revenue</span>
              <span class="text-base font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(profitLoss.revenue) }}</span>
            </div>
            <div class="pl-4 space-y-2">
               <div class="flex justify-between items-center text-sm">
                <span class="text-[#4c739a]">Penjualan</span>
                <span class="font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(profitLoss.revenue) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-[#4c739a]">Diskon</span>
                <span class="font-bold text-red-500">-{{ formatCurrency(profitLoss.discount) }}</span>
              </div>
            </div>
            <div class="flex justify-between items-center text-sm font-bold text-[#0d141b] dark:text-white mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <span class="pl-4">Net Revenue</span>
              <span>{{ formatCurrency(profitLoss.revenue - profitLoss.discount) }}</span>
            </div>
          </div>

          <!-- COGS Section -->
          <div class="pb-6 border-b border-slate-100 dark:border-slate-700">
            <div class="flex justify-between items-center mb-2">
              <span class="text-base font-bold text-[#0d141b] dark:text-white">Cost of Goods Sold (COGS)</span>
              <span class="text-base font-bold text-red-600">({{ formatCurrency(profitLoss.cogs) }})</span>
            </div>
            <p class="text-xs text-[#4c739a] pl-4">Biaya produk yang terjual</p>
          </div>

          <!-- Gross Profit -->
          <div class="p-4 bg-[#f8fafc] dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div class="flex justify-between items-center mb-1">
              <span class="text-base font-extrabold text-[#0d141b] dark:text-white">Gross Profit</span>
              <span class="text-lg font-extrabold text-blue-600">{{ formatCurrency(profitLoss.grossProfit) }}</span>
            </div>
            <div class="text-xs text-[#4c739a]">
              Gross Profit Margin: <span class="font-bold text-[#0d141b] dark:text-white">{{ profitLoss.grossProfitMargin.toFixed(2) }}%</span>
            </div>
          </div>

          <!-- Operating Expenses -->
          <div class="py-4 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div class="flex justify-between items-center mb-2">
              <span class="text-base font-bold text-[#0d141b] dark:text-white">Operating Expenses</span>
              <span class="text-base font-bold text-red-600">({{ formatCurrency(profitLoss.operatingExpenses) }})</span>
            </div>
            <p class="text-xs text-[#4c739a] pl-4">Biaya operasional & overhead</p>
          </div>

          <!-- Net Profit -->
          <div class="p-6 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border-2 border-blue-500/20">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xl font-extrabold text-[#0d141b] dark:text-white">Net Profit</span>
              <span 
                :class="profitLoss.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'"
                class="text-2xl font-extrabold"
              >
                {{ formatCurrency(profitLoss.netProfit) }}
              </span>
            </div>
            <div class="text-sm text-[#4c739a]">
              Net Profit Margin: 
              <span 
                class="font-bold"
                :class="profitLoss.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'"
              >
                {{ profitLoss.netProfitMargin.toFixed(2) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';

const { error: showError, success: showSuccess } = useNotification();

interface ProfitLoss {
  revenue: number;
  discount: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  grossProfitMargin: number;
  netProfitMargin: number;
}

const loading = ref(false);
const error = ref<string | null>(null);
const profitLoss = ref<ProfitLoss | null>(null);

// Set default date range to current month
const now = new Date();
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

const startDate = ref(firstDay.toISOString().split('T')[0]);
const endDate = ref(lastDay.toISOString().split('T')[0]);

const loadProfitLoss = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.get('/finance/profit-loss', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
      },
    });
    profitLoss.value = response.data;
  } catch (err: any) {
    if (err.response?.status === 403) {
      error.value = 'Business Analytics & Insight addon diperlukan untuk mengakses fitur ini';
    } else {
      error.value = err.response?.data?.message || 'Gagal memuat laporan laba rugi';
      await showError(error.value ?? 'Gagal memuat laporan');
    }
  } finally {
    loading.value = false;
  }
};

const exportReport = async () => {
  try {
    const response = await api.get('/finance/profit-loss', {
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
        export: true,
      },
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-laba-rugi-${startDate.value}-${endDate.value}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    await showSuccess('Laporan berhasil diekspor');
  } catch (err: any) {
    await showError(err.response?.data?.message || 'Gagal mengekspor laporan');
  }
};

onMounted(() => {
  loadProfitLoss();
});
</script>
