<template>
  <div class="flex-1 overflow-y-auto bg-white h-full">
    <div v-if="loading" class="flex items-center justify-center h-full min-h-[400px] px-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
    
    <div v-else class="w-full flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="flex flex-col">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Selamat datang kembali, {{ tenantName }}</h2>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Berikut ringkasan performa toko harian Anda.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative group">
            <select v-model="dateRange" class="appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary/50 transition-colors">
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
            </select>
            <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
            <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">expand_more</span>
          </div>
          <router-link to="/app/products" class="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 font-medium text-sm">
            <span class="material-symbols-outlined text-[20px]">add</span>
            <span>Add Product</span>
          </router-link>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Pendapatan Bersih -->
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
          <div class="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
            <span class="material-symbols-outlined text-[120px] text-primary">payments</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/50 text-green-600 rounded-xl shadow-sm">
              <span class="material-symbols-outlined">payments</span>
            </div>
            <span class="text-slate-500 text-sm font-medium">Pendapatan Bersih</span>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-2">{{ formatCurrencyShort(stats?.overview?.totalRevenue || 0) }}</h3>
            <div v-if="stats?.overview?.revenueGrowth" class="flex items-center gap-1 mt-1">
              <span class="text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center" :class="stats.overview.revenueGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                <span class="material-symbols-outlined text-[12px] mr-1">{{ stats.overview.revenueGrowth >= 0 ? 'trending_up' : 'trending_down' }}</span> {{ Math.abs(stats.overview.revenueGrowth).toFixed(1) }}%
              </span>
              <span class="text-slate-400 text-xs">vs periode lalu</span>
            </div>
          </div>
        </div>

        <!-- Total Pesanan -->
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-40 relative overflow-hidden group">
          <div class="absolute right-[-20px] top-[-20px] opacity-5 group-hover:opacity-10 transition-opacity">
            <span class="material-symbols-outlined text-[120px] text-indigo-500">shopping_cart</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <span class="material-symbols-outlined">shopping_cart</span>
            </div>
            <span class="text-slate-500 text-sm font-medium">Total Pesanan</span>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-2">{{ stats?.overview?.totalOrders || 0 }}</h3>
            <div v-if="stats?.overview?.ordersGrowth" class="flex items-center gap-1 mt-1">
              <span class="text-xs px-1.5 py-0.5 rounded font-medium flex items-center" :class="stats.overview.ordersGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                <span class="material-symbols-outlined text-[12px] mr-0.5">{{ stats.overview.ordersGrowth >= 0 ? 'trending_up' : 'trending_down' }}</span> {{ Math.abs(stats.overview.ordersGrowth).toFixed(1) }}%
              </span>
              <span class="text-slate-400 text-xs">vs periode lalu</span>
            </div>
          </div>
        </div>

        <!-- Langganan -->
        <div class="col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-white to-indigo-50 dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl shadow-card border border-indigo-100 dark:border-slate-700 flex flex-col justify-between h-40 relative">
          <div class="flex justify-between items-start">
            <div class="flex flex-col">
              <span class="text-slate-500 text-sm font-medium">Langganan</span>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                {{ getPlanName(currentLangganan?.plan || 'BASIC') }}
                <span class="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider" :class="currentLangganan?.status === 'active' ? 'bg-primary text-white' : 'bg-red-500 text-white'">
                  {{ currentLangganan?.status || 'Unknown' }}
                </span>
              </h3>
            </div>
            <div class="h-8 w-8 rounded-full bg-white/50 flex items-center justify-center">
              <span class="material-symbols-outlined text-primary">diamond</span>
            </div>
          </div>
          <div class="mt-2">
            <p class="text-xs text-slate-500 mb-3">Perpanjang pada {{ formatDate(currentLangganan?.currentPeriodEnd) }}</p>
            <router-link to="/app/subscription" class="block w-full text-center py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary hover:border-primary transition-colors">Kelola Paket</router-link>
          </div>
        </div>

        <!-- Stok Menipis -->
        <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between h-40 border-l-4 border-l-red-500">
          <div class="flex justify-between items-start">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-red-50 text-red-600 rounded-xl">
                <span class="material-symbols-outlined">warning</span>
              </div>
              <span class="text-slate-500 text-sm font-medium">Stok Menipis</span>
            </div>
          </div>
          <div>
            <div class="flex items-baseline gap-2 mt-2">
              <h3 class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats?.alerts?.lowStockProducts || 0 }}</h3>
              <span class="text-sm text-slate-500">item perlu perhatian</span>
            </div>
            <router-link to="/app/products?filter=low_stock" class="inline-flex items-center gap-1 text-xs font-semibold text-red-500 mt-2 hover:underline">
              Lihat Inventaris <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Charts & Tables Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Revenue Chart -->
        <div v-if="showSalesChart" class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6 flex flex-col h-full animate-in fade-in zoom-in duration-300">
          <div class="flex items-center justify-between mb-6 flex-shrink-0">
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Pertumbuhan Pendapatan</h3>
              <p class="text-sm text-slate-500">Pendapatan Kotor vs Bersih</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="flex items-center gap-1 text-xs text-slate-500">
                <span class="w-2.5 h-2.5 rounded-full bg-primary"></span> Revenue
              </span>
            </div>
          </div>
          <div class="flex flex-col flex-1 min-h-[250px] overflow-hidden">
             <div class="relative w-full h-full">
                <canvas ref="revenueChartRef"></canvas>
             </div>
          </div>
        </div>
        <div v-else class="lg:col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 flex items-center justify-center text-slate-400">
           <div class="text-center">
              <span class="material-symbols-outlined text-4xl mb-2">bar_chart_off</span>
              <p class="text-sm font-medium">Grafik Penjualan disembunyikan</p>
              <router-link to="/app/settings/preferences" class="text-xs text-primary hover:underline mt-1 block">Ubah Preferensi</router-link>
           </div>
        </div>

        <!-- Produk Terlaris -->
        <div v-if="showTopProducts" class="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 p-6 flex flex-col animate-in fade-in zoom-in duration-300 delay-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Produk Terlaris</h3>
            <router-link to="/app/products" class="text-sm text-primary hover:text-primary-hover font-medium">Lihat Semua</router-link>
          </div>
          <div class="flex-1 overflow-y-auto pr-2 space-y-4">
            <div v-for="(item, index) in topProducts" :key="index" class="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group">
              <div class="h-12 w-12 rounded-xl bg-cover bg-center shrink-0 border border-slate-100 dark:border-slate-700 flex items-center justify-center bg-gray-100 text-gray-400"
                   :style="{ backgroundImage: item.product?.image ? `url('${item.product.image}')` : 'none' }">
                   <span v-if="!item.product?.image" class="material-symbols-outlined">image</span>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ item.product?.name || 'Unknown Product' }}</h4>
                <p class="text-xs text-slate-500">{{ item.totalQuantity }} terjual</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrencyShort(item.totalRevenue) }}</p>
                <!-- <span class="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 rounded">+12%</span> -->
              </div>
            </div>
            <!-- Fallback if no products -->
            <div v-if="topProducts.length === 0" class="text-center py-8 text-slate-500 text-sm">
                Data produk tidak tersedia.
            </div>
          </div>
        </div>
        <div v-else class="lg:col-span-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 flex items-center justify-center text-slate-400">
           <div class="text-center">
              <span class="material-symbols-outlined text-4xl mb-2">inventory_2</span>
              <p class="text-sm font-medium">Produk Terlaris disembunyikan</p>
           </div>
        </div>
      </div>

      <!-- Transaksi Terbaru -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden mb-8">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Transaksi Terbaru</h3>
          <div class="flex gap-2">
            <button @click="handleExportTransactions" class="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Ekspor</button>
            <router-link to="/app/orders" class="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors">Lihat Semua</router-link>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/30">
              <tr>
                <th class="px-6 py-4 font-medium">ID Pesanan</th>
                <th class="px-6 py-4 font-medium">Tanggal</th>
                <th class="px-6 py-4 font-medium">Pelanggan</th>
                <th class="px-6 py-4 font-medium">Outlet</th>
                <th class="px-6 py-4 font-medium">Jumlah</th>
                <th class="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                <td class="px-6 py-4 font-medium text-primary">#{{ order.orderNumber }}</td>
                <td class="px-6 py-4 text-slate-600">{{ formatDateTime(order.createdAt) }}</td>
                <td class="px-6 py-4 text-slate-900 dark:text-white font-medium">{{ order.customerName || order.customer?.name || 'Tamu' }}</td>
                <td class="px-6 py-4 text-slate-600">{{ order.outletName || order.store?.name || '-' }}</td>
                <td class="px-6 py-4 font-semibold text-slate-900 dark:text-white">{{ formatCurrencyShort(order.totalAmount || order.total) }}</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" :class="getStatusClass(order.status)">
                    <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(order.status)"></span>
                    {{ getStatusLabel(order.status) }}
                  </span>
                </td>
              </tr>
              <tr v-if="recentOrders.length === 0">
                 <td colspan="6" class="px-6 py-8 text-center text-slate-500">Tidak ada transaksi terbaru.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
import { formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';
import { useShiftReminder } from '../../composables/useShiftReminder';

const router = useRouter();
const authStore = useAuthStore();
const { warning: showWarning } = useNotification();

// Shift reminder
const { startChecking, stopChecking } = useShiftReminder();

const loading = ref(true);
const stats = ref<any>(null);
const recentOrders = ref<any[]>([]);
const currentLangganan = ref<any>(null);
const dateRange = ref('week');
const revenueChartRef = ref<HTMLCanvasElement | null>(null);
let revenueChart: any = null;
const showSalesChart = ref(localStorage.getItem('user_showSalesChart') !== 'false');
const showTopProducts = ref(localStorage.getItem('user_showTopProducts') !== 'false');

const tenantName = computed(() => {
  return authStore.user?.tenantName || authStore.user?.name || 'User';
});

const topProducts = computed(() => {
  if (!stats.value || !stats.value.charts || !stats.value.charts.topProducts) return [];
  // Return top 4 products
  return stats.value.charts.topProducts.slice(0, 4);
});

// Helper functions matching User HTML style requirements
const formatCurrencyShort = (value: number) => {
  if (!value) return 'Rp 0';
  if (value >= 1000000000) {
     return `Rp ${(value / 1000000000).toFixed(1)}M`;
  }
  if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}jt`;
  }
  if (value >= 1000) {
    return `Rp ${(value / 1000).toFixed(0)}rb`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
};

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getPlanName = (plan: string) => {
    const map: Record<string, string> = {
        'BASIC': 'Starter Plan',
        'PRO': 'Pro Plan',
        'ENTERPRISE': 'Enterprise',
        'FREE': 'Free Trial'
    };
    return map[plan] || plan;
};

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-green-100 text-green-700';
    case 'processing': return 'bg-yellow-100 text-yellow-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getStatusDotClass = (status: string) => {
    switch (status?.toLowerCase()) {
    case 'completed': return 'bg-green-500';
    case 'processing': return 'bg-yellow-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-slate-500';
  }
};

const getStatusLabel = (status: string) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
};

// Data Loading
// Data Loading

const loadStats = async () => {
  try {
    const response = await api.get('/dashboard/stats', {
      params: { range: dateRange.value }
    });
    stats.value = response.data || {};
  } catch (error) {
    console.error('Error loading stats:', error);
    stats.value = {}; // Empty stats on error instead of mock
  }

};

const loadLangganan = async () => {
  try {
    const response = await api.get('/subscriptions/current');
    currentLangganan.value = response.data || {};
  } catch (error) {
    console.error('Error loading subscription:', error);
    currentLangganan.value = {};
  }
};

const loadRecentOrders = async () => {
    try {
        const response = await api.get('/orders', {
            params: { page: 1, limit: 5 }
        });
        const data = response.data.data;
        if (!data || data.length === 0) {
           recentOrders.value = [];
        } else {
           recentOrders.value = data;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        recentOrders.value = [];
    }
}

const handleExportTransactions = () => {
  // Navigate to full transactions page for export
  router.push('/app/finance/transactions');
};


const renderRevenueChart = async () => {
  if (!revenueChartRef.value) return;
  
  const { default: Chart } = await import('chart.js/auto');
  
  if (revenueChart) {
    revenueChart.destroy();
  }

  const ctx = revenueChartRef.value.getContext('2d');
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)'); 
  gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

  // Use real data if available, fallback to mock (though stats logic above handles this mostly, chart specific check here)
  const chartData = stats.value?.charts?.revenue || { labels: [], data: [] };
  const labels = chartData.labels;
  const data = chartData.data;

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Revenue',
          data: data,
          borderColor: '#2563eb', 
          backgroundColor: gradient,
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: '#e2e8f0', 
            // @ts-expect-error - Chart.js type definition mismatch for borderDash array
            borderDash: [5, 5],
            drawBorder: false
          },
          ticks: {
             callback: function(value: any) {
                if (value >= 1000000) return (value/1000000) + 'M';
                if (value >= 1000) return (value/1000) + 'k';
                return value;
             },
             color: '#94a3b8',
             font: { size: 11, family: 'Inter' }
          },
          border: { display: false }
        },
        x: {
          grid: { display: false },
          ticks: {
             color: '#94a3b8',
             font: { size: 11, family: 'Inter' }
          },
             border: { display: false }
        }
      }
    }
  });
};

watch(dateRange, async () => {
    loading.value = true;
    await loadStats();
    nextTick(() => {
        renderRevenueChart();
        loading.value = false;
    });
});

// Check subscription expiry warning (7 days before) — only for ADMIN_TENANT
const checkSubscriptionExpiry = () => {
  // Only admin tenant handles billing — cashier/spv/kitchen don't need this warning
  const role = authStore.user?.role;
  if (role !== 'ADMIN_TENANT') return;

  if (!currentLangganan.value?.subscription?.endDate) return;
  
  const endDate = new Date(currentLangganan.value.subscription.endDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Show warning if 7 days or less remaining
  if (diffDays <= 7 && diffDays > 0) {
    showWarning(
      `Langganan Anda akan berakhir dalam ${diffDays} hari. Silakan perpanjang untuk melanjutkan layanan.`,
      'Peringatan Langganan'
    );
  } else if (diffDays <= 0 && !currentLangganan.value.isExpired) {
    showWarning(
      'Langganan Anda telah berakhir. Silakan perpanjang untuk melanjutkan layanan.',
      'Langganan Berakhir'
    );
  }
};

onMounted(async () => {
  try {
    await Promise.all([loadStats(), loadLangganan(), loadRecentOrders()]);
    
    // Check subscription expiry after loading
    nextTick(() => {
      checkSubscriptionExpiry();
    });
    
    // Start shift reminder checking (only for relevant roles)
    const role = authStore.user?.role;
    if (role === 'CASHIER' || role === 'SUPERVISOR' || role === 'ADMIN_TENANT') {
      startChecking();
    }
  } finally {
    loading.value = false;
    nextTick(() => {
      renderRevenueChart();
    });
  }
});

// Watch for subscription changes
watch(() => currentLangganan.value, () => {
  checkSubscriptionExpiry();
}, { deep: true });

onUnmounted(() => {
  if (revenueChart) {
    revenueChart.destroy();
  }
  stopChecking();
});
</script>

<style scoped>
/* Scrollbar Styles from User HTML */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
