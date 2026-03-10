<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Accounting & Finance</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Complete financial reports: Balance Sheet, Cash Flow and analysis.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="showPeriodModal = true"
          class="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 text-[#4c739a] dark:text-slate-400 rounded-xl text-sm font-medium transition-all bg-white dark:bg-slate-800 shadow-sm"
        >
          <span class="material-symbols-outlined text-[20px]">calendar_today</span>
          <span>Select Period</span>
        </button>
        <button
          @click="exportFinancialReport"
          class="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">file_download</span>
          <span>Export Report</span>
        </button>
      </div>
    </div>

    <!-- Financial Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Revenue -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
        <div class="flex justify-between items-start mb-4">
          <div>
             <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Total Revenue</p>
             <p class="text-[10px] text-slate-400">Total income</p>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
             <span class="material-symbols-outlined text-[24px]">payments</span>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(financialSummary.revenue) }}</h3>
          <div class="flex items-center gap-1">
             <span class="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded flex items-center">
               <span class="material-symbols-outlined text-[10px]">arrow_upward</span>
               {{ financialSummary.revenueGrowth }}%
             </span>
             <span class="text-[10px] text-[#4c739a]">vs last month</span>
          </div>
        </div>
      </div>

      <!-- Total Expenses -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
        <div class="flex justify-between items-start mb-4">
          <div>
             <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Total Expenses</p>
             <p class="text-[10px] text-slate-400">Operating costs</p>
          </div>
          <div class="bg-red-50 dark:bg-red-900/30 p-2 rounded-xl text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
             <span class="material-symbols-outlined text-[24px]">shopping_bag</span>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ formatCurrency(financialSummary.expenses) }}</h3>
          <div class="h-4"></div> <!-- Spacer to align with growth indicator -->
        </div>
      </div>

      <!-- Net Profit -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
        <div class="flex justify-between items-start mb-4">
          <div>
             <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Net Profit</p>
             <p class="text-[10px] text-slate-400">Net income</p>
          </div>
          <div class="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
             <span class="material-symbols-outlined text-[24px]">account_balance_wallet</span>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="text-2xl font-bold" :class="financialSummary.profit >= 0 ? 'text-[#0d141b] dark:text-white' : 'text-red-600'">{{ formatCurrency(financialSummary.profit) }}</h3>
          <div class="h-4"></div>
        </div>
      </div>

      <!-- Profit Margin -->
      <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
        <div class="flex justify-between items-start mb-4">
          <div>
             <p class="text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-1">Profit Margin</p>
             <p class="text-[10px] text-slate-400">Margin percentage</p>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-xl text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
             <span class="material-symbols-outlined text-[24px]">pie_chart</span>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ financialSummary.profitMargin }}%</h3>
          <div class="h-4"></div>
        </div>
      </div>
    </div>

    <!-- Financial Reports Tabs & Content -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex-1 flex flex-col">
      <!-- Tabs -->
      <div class="flex border-b border-slate-100 dark:border-slate-700 px-6 pt-4 gap-6">
        <button
          @click="activeTab = 'balance-sheet'"
          class="pb-4 text-sm font-bold border-b-2 transition-all px-2 relative"
          :class="activeTab === 'balance-sheet' ? 'border-blue-500 text-blue-600' : 'border-transparent text-[#4c739a] hover:text-[#0d141b]'"
        >
          Balance Sheet
        </button>
        <button
          @click="activeTab = 'cash-flow'"
          class="pb-4 text-sm font-bold border-b-2 transition-all px-2 relative"
          :class="activeTab === 'cash-flow' ? 'border-blue-500 text-blue-600' : 'border-transparent text-[#4c739a] hover:text-[#0d141b]'"
        >
          Cash Flow
        </button>
      </div>

      <!-- Content Container -->
      <div class="p-6 flex-1 overflow-y-auto">
        <!-- Balance Sheet -->
        <div v-if="activeTab === 'balance-sheet'" class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          <!-- Assets -->
          <div class="bg-[#f8fafc] dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700 h-fit">
            <h4 class="font-bold text-[#0d141b] dark:text-white text-lg mb-4 flex items-center gap-2">
               <span class="material-symbols-outlined text-blue-500">account_balance</span>
               Assets
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center text-sm py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <span class="text-[#4c739a] dark:text-slate-400">Cash & Bank</span>
                <span class="font-semibold text-[#0d141b] dark:text-white">{{ formatCurrency(balanceSheet.cash) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <span class="text-[#4c739a] dark:text-slate-400">Accounts Receivable</span>
                <span class="font-semibold text-[#0d141b] dark:text-white">{{ formatCurrency(balanceSheet.receivables) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <span class="text-[#4c739a] dark:text-slate-400">Inventory</span>
                <span class="font-semibold text-[#0d141b] dark:text-white">{{ formatCurrency(balanceSheet.inventory) }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 mt-2">
                <span class="font-bold text-[#0d141b] dark:text-white">Total Assets</span>
                <span class="font-bold text-blue-600 text-lg">{{ formatCurrency(balanceSheet.totalAssets) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Pasiva -->
          <div class="bg-[#f8fafc] dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700 h-fit">
            <h4 class="font-bold text-[#0d141b] dark:text-white text-lg mb-4 flex items-center gap-2">
               <span class="material-symbols-outlined text-orange-500">account_balance_wallet</span>
               Pasiva (Liabilities & Equity)
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between items-center text-sm py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <span class="text-[#4c739a] dark:text-slate-400">Hutang Usaha</span>
                <span class="font-semibold text-[#0d141b] dark:text-white">{{ formatCurrency(balanceSheet.liabilities) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm py-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <span class="text-[#4c739a] dark:text-slate-400">Modal (Equity)</span>
                <span class="font-semibold text-[#0d141b] dark:text-white">{{ formatCurrency(balanceSheet.equity) }}</span>
              </div>
              <div class="flex justify-between items-center pt-3 mt-2">
                <span class="font-bold text-[#0d141b] dark:text-white">Total Pasiva</span>
                <span class="font-bold text-blue-600 text-lg">{{ formatCurrency(balanceSheet.totalLiabilities) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cash Flow -->
        <div v-if="activeTab === 'cash-flow'" class="space-y-6 animate-fade-in max-w-4xl mx-auto">
          <!-- Operasi -->
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
             <div class="bg-[#f8fafc] dark:bg-slate-900/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
               <h4 class="font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                 <span class="material-symbols-outlined text-indigo-500">work</span>
                 Aktivitas Operasi
               </h4>
               <span class="font-bold text-blue-600">{{ formatCurrency(cashFlow.operating.net) }}</span>
             </div>
             <div class="p-6 space-y-3 bg-white dark:bg-slate-800">
                <div class="flex justify-between items-center text-sm ml-8">
                  <span class="text-[#4c739a]">Penerimaan dari pelanggan</span>
                  <span class="font-mono text-blue-600 font-medium">+{{ formatCurrency(cashFlow.operating.inflow) }}</span>
                </div>
                <div class="flex justify-between items-center text-sm ml-8">
                  <span class="text-[#4c739a]">Pembayaran ke supplier & beban</span>
                  <span class="font-mono text-red-600 font-medium">-{{ formatCurrency(cashFlow.operating.outflow) }}</span>
                </div>
             </div>
          </div>

          <!-- Investasi -->
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
             <div class="bg-[#f8fafc] dark:bg-slate-900/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
               <h4 class="font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                 <span class="material-symbols-outlined text-purple-500">trending_up</span>
                 Aktivitas Investasi
               </h4>
               <span class="font-bold" :class="cashFlow.investing.net >= 0 ? 'text-blue-600' : 'text-[#4c739a]'">{{ formatCurrency(cashFlow.investing.net) }}</span>
             </div>
             <div class="p-6 space-y-3 bg-white dark:bg-slate-800">
                <div class="flex justify-between items-center text-sm ml-8">
                  <span class="text-[#4c739a]">Pembelian aset tetap</span>
                  <span class="font-mono text-red-600 font-medium">-{{ formatCurrency(cashFlow.investing.outflow) }}</span>
                </div>
             </div>
          </div>

          <!-- Pendanaan -->
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
             <div class="bg-[#f8fafc] dark:bg-slate-900/50 px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
               <h4 class="font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
                 <span class="material-symbols-outlined text-orange-500">attach_money</span>
                 Aktivitas Pendanaan
               </h4>
               <span class="font-bold text-blue-600">{{ formatCurrency(cashFlow.financing.net) }}</span>
             </div>
             <div class="p-6 space-y-3 bg-white dark:bg-slate-800">
               <div class="flex justify-between items-center text-sm ml-8">
                  <span class="text-[#4c739a]">Penerimaan modal / pinjaman</span>
                  <span class="font-mono text-blue-600 font-medium">+{{ formatCurrency(cashFlow.financing.inflow) }}</span>
                </div>
             </div>
          </div>

          <!-- Total -->
          <div class="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex justify-between items-center">
             <span class="font-bold text-[#0d141b] dark:text-white text-lg">Net Cash Flow</span>
             <span class="font-bold text-2xl" :class="cashFlow.total >= 0 ? 'text-blue-600' : 'text-red-500'">{{ formatCurrency(cashFlow.total) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Period Selection Modal -->
    <Teleport to="body">
      <div
        v-if="showPeriodModal"
        class="fixed inset-0 bg-[#0d141b]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="showPeriodModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden flex flex-col">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Pilih Periode</h3>
            <button @click="showPeriodModal = false" class="text-[#4c739a] hover:text-[#0d141b] transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="p-6 space-y-5">
            <div>
              <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Dari Tanggal</label>
              <input
                v-model="periodForm.startDate"
                type="date"
                class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[#0d141b] dark:text-white"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Sampai Tanggal</label>
              <input
                v-model="periodForm.endDate"
                type="date"
                class="w-full px-4 py-2.5 bg-[#f8fafc] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-[#0d141b] dark:text-white"
              />
            </div>
            
            <div class="flex gap-3 pt-2">
              <button
                @click="showPeriodModal = false"
                class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-[#4c739a] hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                @click="loadFinancialData"
                class="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';
import { generateFinancialReportPDF } from '../../utils/financial-report-export';

const authStore = useAuthStore();
const { needsTenantSelection } = useTenantCheck();
const { success: showSuccess, error: showError } = useNotification();

interface FinancialSummary {
  revenue: number;
  revenueGrowth: number;
  expenses: number;
  profit: number;
  profitMargin: number;
}

interface BalanceSheet {
  cash: number;
  receivables: number;
  inventory: number;
  totalAssets: number;
  liabilities: number;
  equity: number;
  totalLiabilities: number;
}

interface CashFlow {
  operating: { inflow: number; outflow: number; net: number };
  investing: { inflow: number; outflow: number; net: number };
  financing: { inflow: number; outflow: number; net: number };
  total: number;
}

const activeTab = ref('balance-sheet');
const loading = ref(false);
const showPeriodModal = ref(false);

const financialSummary = ref<FinancialSummary>({
  revenue: 0,
  revenueGrowth: 0,
  expenses: 0,
  profit: 0,
  profitMargin: 0,
});

// ProfitLoss removed - using separate page /app/profit-loss

const balanceSheet = ref<BalanceSheet>({
  cash: 0,
  receivables: 0,
  inventory: 0,
  totalAssets: 0,
  liabilities: 0,
  equity: 0,
  totalLiabilities: 0,
});

const cashFlow = ref<CashFlow>({
  operating: { inflow: 0, outflow: 0, net: 0 },
  investing: { inflow: 0, outflow: 0, net: 0 },
  financing: { inflow: 0, outflow: 0, net: 0 },
  total: 0,
});

const periodForm = ref({
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
});

const loadFinancialData = async () => {
  // Super Admin tidak perlu select tenant - bisa langsung load data platform
  if (needsTenantSelection.value && !authStore.isSuperAdmin) return;

  loading.value = true;
  try {
    // For Super Admin, use platform data (subscriptions & addons)
    // For tenant admin, use tenant data
    const [summaryRes, balanceRes, cashFlowRes] = await Promise.all([
      api.get('/finance/summary', { params: periodForm.value }).catch(() => ({ data: financialSummary.value })),
      api.get('/finance/balance-sheet', { params: periodForm.value }).catch(() => ({ data: balanceSheet.value })),
      api.get('/finance/cash-flow', { params: periodForm.value }).catch(() => ({ data: cashFlow.value })),
    ]);

    financialSummary.value = summaryRes.data;
    balanceSheet.value = balanceRes.data;
    cashFlow.value = cashFlowRes.data;
    showPeriodModal.value = false;
  } catch (error: any) {
    console.error('Error loading financial data:', error);
  } finally {
    loading.value = false;
  }
};

const exportFinancialReport = async () => {
  try {
    await generateFinancialReportPDF({
      summary: financialSummary.value,
      balanceSheet: balanceSheet.value,
      cashFlow: cashFlow.value,
      startDate: periodForm.value.startDate,
      endDate: periodForm.value.endDate,
    });
    await showSuccess('Export berhasil! PDF telah didownload.');
  } catch (error: any) {
    console.error('Error exporting report:', error);
    await showError(error.message || 'Gagal mengekspor laporan');
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // For super admin, ensure selectedTenantId is synced with localStorage
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  if (!needsTenantSelection.value) {
    loadFinancialData();
  }
});
</script>

