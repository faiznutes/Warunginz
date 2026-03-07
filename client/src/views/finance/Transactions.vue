<template>
  <div class="flex flex-col gap-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Transactions</p>
              <h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">{{ stats.totalCount.toLocaleString() }}</h3>
            </div>
            <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-primary">
              <span class="material-symbols-outlined icon-filled">receipt_long</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Total Volume</p>
              <h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">{{ formatCurrency(stats.totalVolume) }}</h3>
            </div>
            <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
              <span class="material-symbols-outlined icon-filled">payments</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Success Rate</p>
              <h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">{{ stats.successRate.toFixed(1) }}%</h3>
            </div>
            <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
              <span class="material-symbols-outlined icon-filled">check_circle</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between gap-2">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-[#4c739a] dark:text-slate-400 text-xs font-medium uppercase tracking-wide">Refunded</p>
              <h3 class="text-[#0d141b] dark:text-white text-2xl font-bold mt-1">{{ formatCurrency(stats.totalRefunded) }}</h3>
            </div>
            <div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600">
              <span class="material-symbols-outlined icon-filled">published_with_changes</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center z-20">
        <div class="relative w-full md:w-80">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">search</span>
          <input 
            v-model="searchQuery"
            @input="debouncedSearch"
            class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white" 
            placeholder="Search transaction ID, customer..." 
            type="text"
          />
        </div>
        <div class="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select v-model="statusFilter" @change="loadTransactions" class="pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-[#0d141b] dark:text-white cursor-pointer">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <div class="h-8 w-px bg-slate-200 dark:bg-slate-600 mx-1 hidden md:block"></div>
          <button @click="handleExport" :disabled="exporting" class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-[#0d141b] dark:text-white flex items-center gap-2 transition-colors disabled:opacity-50">
            <span v-if="exporting" class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span v-else class="material-symbols-outlined text-[18px]">download</span>
            {{ exporting ? 'Exporting...' : 'Export CSV' }}
          </button>
        </div>
      </div>

      <!-- Transaction Table -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
        <div class="overflow-x-auto min-h-[400px]">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 dark:bg-slate-900/50 text-[#4c739a] dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-4">Order #</th>
                <th class="px-6 py-4">Customer</th>
                <th class="px-6 py-4">Date & Time</th>
                <th class="px-6 py-4">Payment</th>
                <th class="px-6 py-4">Amount</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="trx in transactions" :key="trx.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-primary">
                  #{{ trx.orderNumber }}
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm font-medium text-[#0d141b] dark:text-white">{{ trx.customerName || 'Tamu' }}</p>
                  <p class="text-xs text-[#4c739a] dark:text-slate-500">{{ trx.store?.name || '-' }}</p>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm text-[#0d141b] dark:text-white">{{ formatDate(trx.createdAt) }}</p>
                  <p class="text-xs text-[#4c739a]">{{ formatTime(trx.createdAt) }}</p>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="p-1 rounded bg-blue-50 dark:bg-blue-900/30 text-primary">
                      <span class="material-symbols-outlined text-[16px]">{{ getPaymentIcon(trx.paymentMethod) }}</span>
                    </div>
                    <span class="text-sm text-[#0d141b] dark:text-white">{{ trx.paymentMethod || 'Cash' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm font-medium text-[#0d141b] dark:text-white">{{ formatCurrency(trx.totalAmount) }}</td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                    :class="getStatusClass(trx.status)"
                  >
                    <span class="size-1.5 rounded-full" :class="getStatusDotClass(trx.status)"></span>
                    {{ getStatusLabel(trx.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="viewTransaction(trx)" class="text-[#4c739a] hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>
              <tr v-if="transactions.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-slate-500">
                  <span class="material-symbols-outlined text-4xl mb-2 block">receipt_long</span>
                  Tidak ada transaksi ditemukan
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <p class="text-sm text-slate-500">
            Menampilkan {{ (pagination.page - 1) * pagination.limit + 1 }} - {{ Math.min(pagination.page * pagination.limit, pagination.total) }} dari {{ pagination.total }}
          </p>
          <div class="flex gap-2">
            <button 
              @click="changePage(pagination.page - 1)" 
              :disabled="pagination.page <= 1"
              class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Prev
            </button>
            <button 
              @click="changePage(pagination.page + 1)" 
              :disabled="pagination.page >= pagination.totalPages"
              class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Transaction Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showDetailModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Detail Transaksi</h3>
              <p class="text-sm text-slate-500">#{{ selectedTransaction?.orderNumber }}</p>
            </div>
            <button @click="showDetailModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div v-if="selectedTransaction" class="p-6 space-y-6">
            <!-- Order Info -->
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Customer</p>
                <p class="font-bold text-slate-900 dark:text-white">{{ selectedTransaction.customerName || 'Tamu' }}</p>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Tanggal</p>
                <p class="font-bold text-slate-900 dark:text-white">{{ formatDate(selectedTransaction.createdAt) }} {{ formatTime(selectedTransaction.createdAt) }}</p>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Metode Pembayaran</p>
                <p class="font-bold text-slate-900 dark:text-white">{{ selectedTransaction.paymentMethod || 'Cash' }}</p>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p class="text-xs text-slate-500 mb-1">Status</p>
                <span :class="getStatusClass(selectedTransaction.status)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium">
                  {{ getStatusLabel(selectedTransaction.status) }}
                </span>
              </div>
            </div>

            <!-- Order Items -->
            <div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-3">Item Pesanan</h4>
              <div class="space-y-2">
                <div v-for="item in selectedTransaction.items" :key="item.id" class="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                  <div>
                    <p class="font-medium text-slate-900 dark:text-white">{{ item.productName }}</p>
                    <p class="text-xs text-slate-500">{{ item.quantity }} x {{ formatCurrency(item.price) }}</p>
                  </div>
                  <p class="font-bold text-slate-900 dark:text-white">{{ formatCurrency(item.subtotal) }}</p>
                </div>
              </div>
            </div>

            <!-- Total -->
            <div class="border-t border-slate-100 dark:border-slate-700 pt-4">
              <div class="flex justify-between items-center text-lg">
                <span class="font-bold text-slate-900 dark:text-white">Total</span>
                <span class="font-bold text-primary text-xl">{{ formatCurrency(selectedTransaction.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNotification } from '../../composables/useNotification';
import api from '../../api';

const { success: showSuccess, error: showError } = useNotification();

const loading = ref(true);
const exporting = ref(false);
const searchQuery = ref('');
const statusFilter = ref('');
const transactions = ref<any[]>([]);
const showDetailModal = ref(false);
const selectedTransaction = ref<any>(null);

const stats = ref({
  totalCount: 0,
  totalVolume: 0,
  successRate: 0,
  totalRefunded: 0,
});

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

let searchTimeout: any = null;

const loadTransactions = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };
    if (searchQuery.value) params.search = searchQuery.value;
    if (statusFilter.value) params.status = statusFilter.value;

    const response = await api.get('/orders', { params });
    const data = response.data;
    
    transactions.value = data.data || [];
    pagination.value = {
      page: data.page || 1,
      limit: data.limit || 20,
      total: data.total || 0,
      totalPages: data.totalPages || 1,
    };

    // Calculate stats from transactions
    const completed = transactions.value.filter(t => t.status === 'completed');
    stats.value = {
      totalCount: pagination.value.total,
      totalVolume: transactions.value.reduce((sum, t) => sum + (t.totalAmount || 0), 0),
      successRate: pagination.value.total > 0 ? (completed.length / transactions.value.length) * 100 : 0,
      totalRefunded: transactions.value.filter(t => t.status === 'refunded').reduce((sum, t) => sum + (t.totalAmount || 0), 0),
    };
  } catch (error: any) {
    console.error('Error loading transactions:', error);
    showError('Gagal memuat data transaksi');
  } finally {
    loading.value = false;
  }
};

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    loadTransactions();
  }, 500);
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadTransactions();
};

const viewTransaction = (trx: any) => {
  selectedTransaction.value = trx;
  showDetailModal.value = true;
};

const handleExport = async () => {
  exporting.value = true;
  try {
    const response = await api.get('/orders/export', {
      params: { status: statusFilter.value, search: searchQuery.value },
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    showSuccess('Data berhasil diexport!');
  } catch (error: any) {
    console.error('Export error:', error);
    // Fallback: export current data as CSV
    exportToCSV();
  } finally {
    exporting.value = false;
  }
};

const exportToCSV = () => {
  const headers = ['Order Number', 'Customer', 'Date', 'Payment Method', 'Amount', 'Status'];
  const rows = transactions.value.map(t => [
    t.orderNumber,
    t.customerName || 'Tamu',
    new Date(t.createdAt).toLocaleString('id-ID'),
    t.paymentMethod || 'Cash',
    t.totalAmount,
    t.status,
  ]);
  
  const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  showSuccess('Data berhasil diexport!');
};

const formatCurrency = (value: number) => {
  if (!value) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const getPaymentIcon = (method: string) => {
  const icons: Record<string, string> = {
    'Credit Card': 'credit_card',
    'Debit Card': 'credit_card',
    'Bank Transfer': 'account_balance',
    'QRIS': 'qr_code_2',
    'E-Wallet': 'account_balance_wallet',
    'Cash': 'payments',
  };
  return icons[method] || 'payments';
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    completed: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
    failed: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return classes[status?.toLowerCase()] || classes.pending;
};

const getStatusDotClass = (status: string) => {
  const classes: Record<string, string> = {
    completed: 'bg-green-500',
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    failed: 'bg-red-500',
    refunded: 'bg-orange-500',
  };
  return classes[status?.toLowerCase()] || 'bg-slate-500';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    completed: 'Selesai',
    pending: 'Menunggu',
    processing: 'Diproses',
    failed: 'Gagal',
    refunded: 'Refund',
  };
  return labels[status?.toLowerCase()] || status;
};

onMounted(() => {
  loadTransactions();
});
</script>
