<template>
  <div class="flex flex-col gap-8">
    <!-- Error Message if Addon Not Active -->
    <div v-if="addonError" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-red-600 dark:text-red-400 mt-0.5">error</span>
        <div class="flex-1">
          <p class="text-red-800 dark:text-red-300 font-bold text-sm mb-1">{{ addonError }}</p>
          <router-link to="/app/addons" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs font-medium underline flex items-center gap-1">
            Subscribe to Business Analytics & Insight
            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">Advanced Analytics</h2>
        <p class="text-[#4c739a] dark:text-[#4c739a] mt-1">Sales predictions, forecasting, and deep insights.</p>
      </div>
      <button
        v-if="!addonError"
        @click="showCustomReportModal = true"
        class="flex items-center gap-2 px-4 py-2.5 bg-[#10b981] hover:bg-[#10b981]-hover rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all"
      >
        <span class="material-symbols-outlined text-[20px]">add_chart</span>
        <span>Create Custom Report</span>
      </button>
    </div>

    <!-- Analytics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Sales Prediction -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-card border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group hover:border-[#10b981]/50 transition-colors">
        <div class="flex justify-between items-start mb-4">
          <div>
             <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Sales Prediction</p>
             <p class="text-[10px] text-[#4c739a]">Next month estimate</p>
          </div>
          <div class="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
             <span class="material-symbols-outlined text-[24px]">query_stats</span>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(predictions.nextMonth) }}</h3>
        </div>
      </div>

      <!-- Trend -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-card border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group hover:border-[#10b981]/50 transition-colors">
        <div class="flex justify-between items-start mb-4">
          <div>
             <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Sales Trend</p>
             <p class="text-[10px] text-[#4c739a]">vs Last Month</p>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
             <span class="material-symbols-outlined text-[24px]">trending_up</span>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white" :class="predictions.trend > 0 ? 'text-blue-600' : 'text-red-600'">
            {{ predictions.trend > 0 ? '+' : '' }}{{ predictions.trend }}%
          </h3>
          <span 
            class="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"
            :class="predictions.trend > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'"
          >
            <span class="material-symbols-outlined text-[10px]">{{ predictions.trend > 0 ? 'arrow_upward' : 'arrow_downward' }}</span>
            {{ Math.abs(predictions.trend) }}%
          </span>
        </div>
      </div>

      <!-- Top Products Count -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-[#10b981]/50 transition-colors">
        <div class="flex justify-between items-start mb-4">
          <div>
             <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Produk Terlaris</p>
             <p class="text-[10px] text-[#4c739a]">Top performa</p>
          </div>
          <div class="bg-orange-50 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
             <span class="material-symbols-outlined text-[24px]">stars</span>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ topProducts.length }}</h3>
          <span class="text-xs text-[#4c739a]">Produk</span>
        </div>
      </div>

      <!-- Forecast Accuracy -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-[#10b981]/50 transition-colors">
        <div class="flex justify-between items-start mb-4">
          <div>
             <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Forecast Accuracy</p>
             <p class="text-[10px] text-[#4c739a]">Tingkat akurasi</p>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
             <span class="material-symbols-outlined text-[24px]">model_training</span>
          </div>
        </div>
        <div class="flex flex-col gap-3">
           <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ predictions.accuracy }}%</h3>
           <div class="relative">
             <select 
              v-model="forecastMethod" 
              @change="loadAnalytics"
              class="w-full appearance-none bg-[#f6f7f8] dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-2 py-1 text-[10px] font-medium text-[#0d141b] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#10b981]"
            >
              <option value="moving_average">Moving Average</option>
              <option value="linear_regression">Linear Regression</option>
            </select>
            <span class="absolute right-2 top-1.5 material-symbols-outlined text-[12px] text-[#4c739a] pointer-events-none">expand_more</span>
           </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sales Forecast Chart -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Sales Forecast</h3>
          <span class="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-[#4c739a] px-2 py-1 rounded-xl">3 Bulan Ke Depan</span>
        </div>
        
        <div class="h-64 flex items-center justify-center bg-[#f6f7f8] dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <div class="text-center">
            <div class="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mx-auto mb-3 inline-block">
               <span class="material-symbols-outlined text-3xl text-slate-300">bar_chart</span>
            </div>
            <p class="text-sm font-medium text-[#4c739a]">Chart Preview Area</p>
            <p class="text-xs text-[#4c739a] mt-1">Implementasi chart menggunakan Chart.js</p>
          </div>
        </div>
      </div>

      <!-- Top Products List -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Top 10 Produk</h3>
          <span class="text-xs text-[#10b981] bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-xl font-bold">Best Sellers</span>
        </div>
        
        <div class="space-y-4">
          <div
            v-for="(product, index) in topProducts"
            :key="product.id"
            class="group"
          >
            <div class="flex items-center justify-between mb-1.5 text-sm">
              <div class="flex items-center gap-3">
                 <span class="w-5 h-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-xs font-bold text-[#4c739a]">{{ index + 1 }}</span>
                 <span class="font-medium text-[#0d141b] dark:text-white truncate max-w-[150px] sm:max-w-xs">{{ product.name }}</span>
              </div>
              <span class="font-bold text-[#10b981]">{{ product.sales }} Sales</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
               <div
                  class="bg-[#10b981] h-full rounded-full transition-all duration-1000 ease-out group-hover:bg-blue-600"
                  :style="{ width: `${(product.sales / (topProducts[0]?.sales || 1)) * 100}%` }"
                ></div>
            </div>
          </div>
          
          <div v-if="topProducts.length === 0" class="text-center py-8">
            <p class="text-sm text-[#4c739a]">No product sales data yet.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Store Comparison Section (For Multi-Store) -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
       <div class="flex items-center justify-between mb-6">
         <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Perbandingan Performa Toko</h3>
         <button @click="handleExportStoreComparison" class="text-sm text-[#4c739a] hover:text-[#10b981] font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-[18px]">download</span> Export
         </button>
       </div>
       <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
             <thead class="text-xs text-[#4c739a] uppercase bg-slate-50 dark:bg-slate-700/30">
                <tr>
                   <th class="px-6 py-3 font-bold rounded-l-xl">Nama Toko</th>
                   <th class="px-6 py-3 font-bold text-right">Pendapatan</th>
                   <th class="px-6 py-3 font-bold text-right">Pesanan</th>
                   <th class="px-6 py-3 font-bold text-right rounded-r-xl">Rata-rata Order</th>
                </tr>
             </thead>
             <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                <tr v-for="store in storeComparison" :key="store.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                   <td class="px-6 py-4 font-bold text-[#0d141b] dark:text-white">{{ store.name }}</td>
                   <td class="px-6 py-4 text-right font-medium text-[#10b981]">{{ formatCurrency(store.revenue) }}</td>
                   <td class="px-6 py-4 text-right text-[#4c739a]">{{ store.orders }}</td>
                   <td class="px-6 py-4 text-right text-[#0d141b] dark:text-white font-medium">{{ formatCurrency(store.revenue / store.orders) }}</td>
                </tr>
             </tbody>
          </table>
       </div>
    </div>

    <!-- Custom Reports -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Custom Reports</h3>
        <button @click="handleViewAllReports" class="text-sm text-[#10b981] font-bold hover:underline">View All</button>
      </div>

      <div v-if="customReports.length === 0" class="flex flex-col items-center justify-center py-12 text-center bg-[#f6f7f8] dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        <div class="bg-white dark:bg-slate-800 p-3 rounded-full shadow-sm mb-3">
          <span class="material-symbols-outlined text-[#4c739a] text-2xl">folder_open</span>
        </div>
        <h4 class="text-sm font-bold text-[#0d141b] dark:text-white">No reports yet</h4>
        <p class="text-xs text-[#4c739a] mt-1 max-w-xs mx-auto">Create your first custom report to start analyzing specific data.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="report in customReports"
          :key="report.id"
          class="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md hover:border-[#10b981]/30 transition-all"
        >
          <div class="flex items-start justify-between mb-3">
             <div class="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                <span class="material-symbols-outlined text-[20px]">description</span>
             </div>
             <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="viewReport(report)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-[#4c739a] hover:text-[#10b981]" title="Lihat">
                  <span class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
                <button @click="exportReport(report)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-[#4c739a] hover:text-green-600" title="Export">
                  <span class="material-symbols-outlined text-[18px]">download</span>
                </button>
             </div>
          </div>
          
          <h4 class="font-bold text-[#0d141b] dark:text-white mb-1 truncate">{{ report.name }}</h4>
          <p class="text-xs text-[#4c739a] mb-4 line-clamp-2">{{ report.description || 'Tidak ada deskripsi' }}</p>
          
          <div class="flex items-center justify-between text-[10px] text-[#4c739a] pt-3 border-t border-slate-100 dark:border-slate-700">
             <span>{{ report.dataType }}</span>
             <span>{{ report.metrics.length }} Metrik</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Report Modal -->
    <Teleport to="body">
      <div
        v-if="showCustomReportModal"
        class="fixed inset-0 bg-[#0d141b]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="showCustomReportModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Buat Custom Report</h3>
            <button @click="showCustomReportModal = false" class="text-[#4c739a] hover:text-[#0d141b] transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto">
             <div class="flex flex-col gap-4">
                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Nama Report</label>
                  <input
                    v-model="reportForm.name"
                    type="text"
                    class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                    placeholder="Contoh: Laporan Penjualan Q1"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Tipe Data</label>
                  <select
                    v-model="reportForm.dataType"
                    class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 text-[#0d141b] dark:text-white"
                  >
                    <option value="SALES">Penjualan</option>
                    <option value="PRODUCTS">Produk</option>
                    <option value="CUSTOMERS">Customer</option>
                    <option value="INVENTORY">Inventory</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Metrik</label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-[#f6f7f8] dark:hover:bg-slate-800 transition-colors">
                      <input v-model="reportForm.metrics" type="checkbox" value="REVENUE" class="h-4 w-4 text-[#10b981] rounded focus:ring-[#10b981]" />
                      <span class="text-sm font-medium text-[#0d141b] dark:text-white">Revenue</span>
                    </label>
                    <label class="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-[#f6f7f8] dark:hover:bg-slate-800 transition-colors">
                      <input v-model="reportForm.metrics" type="checkbox" value="QUANTITY" class="h-4 w-4 text-[#10b981] rounded focus:ring-[#10b981]" />
                      <span class="text-sm font-medium text-[#0d141b] dark:text-white">Quantity</span>
                    </label>
                    <label class="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-[#f6f7f8] dark:hover:bg-slate-800 transition-colors">
                      <input v-model="reportForm.metrics" type="checkbox" value="PROFIT" class="h-4 w-4 text-[#10b981] rounded focus:ring-[#10b981]" />
                      <span class="text-sm font-medium text-[#0d141b] dark:text-white">Profit</span>
                    </label>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Dari Tanggal</label>
                    <input
                      v-model="reportForm.startDate"
                      type="date"
                      class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 text-[#0d141b] dark:text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Sampai Tanggal</label>
                    <input
                      v-model="reportForm.endDate"
                      type="date"
                      class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 text-[#0d141b] dark:text-white"
                    />
                  </div>
                </div>
             </div>
          </div>
          
          <div class="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3">
             <button
              @click="showCustomReportModal = false"
              class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-[#f6f7f8] dark:hover:bg-slate-700 transition"
            >
              Batal
            </button>
            <button
              @click="saveCustomReport"
              class="flex-1 px-4 py-2.5 bg-[#10b981] hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition"
            >
              Simpan Report
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Report Detail Modal -->
    <AnalyticsReportDetailModal
      :show="showReportDetailModal"
      :report="viewingReport"
      @close="showReportDetailModal = false; viewingReport = null"
      @export="exportReport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import AnalyticsReportDetailModal from '../../components/AnalyticsReportDetailModal.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';

const { needsTenantSelection } = useTenantCheck();
const { success: showSuccess, error: showError, info: showInfo } = useNotification();
import { useAuthStore } from '../../stores/auth';
const authStore = useAuthStore();

interface Prediction {
  nextMonth: number;
  trend: number;
  accuracy: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
}

interface CustomReport {
  id: string;
  name: string;
  description?: string;
  dataType: string;
  metrics: string[];
  startDate?: string;
  endDate?: string;
}

const predictions = ref<Prediction>({
  nextMonth: 0,
  trend: 0,
  accuracy: 0,
});

const topProducts = ref<TopProduct[]>([]);
const storeComparison = ref<any[]>([]); // Mock data container
const customReports = ref<CustomReport[]>([]);
const loading = ref(false);
const addonError = ref<string | null>(null);
const showCustomReportModal = ref(false);
const showReportDetailModal = ref(false);
const viewingReport = ref<CustomReport | null>(null);

const reportForm = ref({
  name: '',
  dataType: 'SALES',
  metrics: [] as string[],
  startDate: '',
  endDate: '',
});

const forecastMethod = ref<'moving_average' | 'linear_regression'>('moving_average');

const loadAnalytics = async () => {
  // Super Admin tidak perlu select tenant - bisa langsung load data platform
  if (needsTenantSelection.value && !authStore.isSuperAdmin) return;

  loading.value = true;
  try {
    const [predictionsRes, productsRes, reportsRes, storeComparisonRes] = await Promise.all([
      api.get('/analytics/predictions', { 
        params: { method: forecastMethod.value } 
      }).catch(() => ({ data: { nextMonth: 0, trend: 0, accuracy: 85 } })),
      api.get('/analytics/top-products', { params: { limit: 10 } }).catch(() => ({ data: [] })),
      // Custom reports hanya untuk tenant, bukan platform
      authStore.isSuperAdmin 
        ? Promise.resolve({ data: { data: [] } })
        : api.get('/analytics/custom-reports').catch(() => ({ data: { data: [] } })),
      // Store Comparison - load real outlet data
      api.get('/outlets').catch(() => ({ data: [] }))
    ]);

    predictions.value = predictionsRes.data;
    topProducts.value = productsRes.data || [];
    customReports.value = reportsRes.data?.data || reportsRes.data || [];
    // Outlets endpoint returns { data: [...], pagination: {...} }
    storeComparison.value = (storeComparisonRes.data?.data || storeComparisonRes.data || []).map((outlet: any) => ({
      id: outlet.id,
      name: outlet.name,
      revenue: outlet.totalRevenue || 0,
      orders: outlet.totalOrders || 0,
    }));
  } catch (error: any) {
    console.error('Error loading analytics:', error);
    if (error.response?.status === 403) {
      addonError.value = 'Business Analytics & Insight addon diperlukan untuk mengakses fitur ini';
      await showError('Business Analytics & Insight addon diperlukan untuk mengakses fitur ini');
    } else {
      addonError.value = null;
    }
  } finally {
    loading.value = false;
  }
};

const viewReport = (report: CustomReport) => {
  viewingReport.value = report;
  showReportDetailModal.value = true;
};

const exportReport = async (report: CustomReport) => {
  try {
    const response = await api.get(`/analytics/custom-reports/${report.id}/export`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${report.name}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error: any) {
    console.error('Error exporting report:', error);
    await showError('Gagal mengekspor report');
  }
};

const saveCustomReport = async () => {
  try {
    await api.post('/analytics/custom-reports', reportForm.value);
    await showSuccess('Custom report berhasil dibuat');
    showCustomReportModal.value = false;
    reportForm.value = {
      name: '',
      dataType: 'SALES',
      metrics: [],
      startDate: '',
      endDate: '',
    };
    await loadAnalytics();
  } catch (error: any) {
    console.error('Error saving custom report:', error);
    await showError(error.response?.data?.message || 'Gagal membuat custom report');
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadAnalytics();
});

const handleExportStoreComparison = () => {
  if (storeComparison.value.length === 0) {
    showInfo('Tidak ada data untuk diexport.');
    return;
  }
  const headers = ['Nama Toko', 'Pendapatan', 'Pesanan', 'Rata-rata Order'];
  const rows = storeComparison.value.map((s: any) => [
    s.name,
    s.revenue,
    s.orders,
    Math.round(s.revenue / s.orders),
  ]);
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `store-comparison-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  showSuccess('Data berhasil diexport!');
};

const handleViewAllReports = () => {
  // Scroll to custom reports section
  document.querySelector('[data-section="custom-reports"]')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

