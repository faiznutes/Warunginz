<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Welcome Section -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-slate-500 font-bold text-sm uppercase tracking-wider">Memuat data dashboard...</div>
    </div>

    <template v-else>
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black leading-tight tracking-tight flex items-center gap-2">
            <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Selamat Datang Kembali, {{ authStore.user?.name || 'Admin' }}</span>
            <span class="text-3xl" style="color: initial; font-family: 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;">👋</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Ringkasan performa platform periode: <span class="font-bold text-slate-700 dark:text-slate-300">{{ getDateRangeLabel() }}</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-3 items-center">
          <!-- Date Range Filter -->
          <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex items-center overflow-hidden">
            <button 
              v-for="range in dateRanges" 
              :key="range.value"
              @click="superAdminDateRange = range.value; loadSuperAdminStats()"
              :class="[
                'px-4 py-2.5 text-sm font-bold transition-all',
                superAdminDateRange === range.value 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              ]"
            >
              {{ range.label }}
            </button>
          </div>
          <router-link
            to="/app/reports/global"
            class="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white flex items-center gap-2 transition-all shadow-sm"
          >
            <span class="material-symbols-outlined text-[20px]">download</span>
            Ekspor Laporan
          </router-link>
          <router-link
            to="/app/tenants"
            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
          >
            <span class="material-symbols-outlined text-[20px]">add</span>
            Tenant Baru
          </router-link>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <!-- Stat 1: Total Revenue -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4 hover:shadow-lg hover:-translate-y-1 transition-all group">
          <div class="flex justify-between items-start">
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <span v-if="stats?.overview?.revenueGrowth" class="flex items-center text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-blue-100 dark:ring-blue-900/30">
              <span class="material-symbols-outlined text-[14px] mr-0.5">{{ stats.overview.revenueGrowth >= 0 ? 'trending_up' : 'trending_down' }}</span>
              {{ Math.abs(stats.overview.revenueGrowth).toFixed(1) }}%
            </span>
          </div>
          <div>
            <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Pendapatan</p>
            <p class="text-slate-900 dark:text-white text-2xl font-black">
              {{ formatCurrency(stats?.overview?.totalRevenue || 0) }}
            </p>
          </div>
        </div>

        <!-- Stat 2: Subscription Revenue -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4 hover:shadow-lg hover:-translate-y-1 transition-all group">
          <div class="flex justify-between items-start">
            <div class="p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-2xl group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[24px]">stars</span>
            </div>
          </div>
          <div>
            <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pendapatan Langganan</p>
            <p class="text-slate-900 dark:text-white text-2xl font-black">
              {{ formatCurrency(stats?.overview?.totalSubscriptionRevenue || 0) }}
            </p>
          </div>
        </div>

        <!-- Stat 3: Addon Revenue -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4 hover:shadow-lg hover:-translate-y-1 transition-all group">
          <div class="flex justify-between items-start">
            <div class="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-2xl group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[24px]">extension</span>
            </div>
          </div>
          <div>
            <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pendapatan Addon</p>
            <p class="text-slate-900 dark:text-white text-2xl font-black">
              {{ formatCurrency(stats?.overview?.totalAddonRevenue || 0) }}
            </p>
          </div>
        </div>

        <!-- Stat 4: Total Cost -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4 hover:shadow-lg hover:-translate-y-1 transition-all group">
          <div class="flex justify-between items-start">
            <div class="p-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 rounded-2xl group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[24px]">store</span>
            </div>
            <span class="flex items-center text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-blue-100 dark:ring-blue-900/30">
              +2%
            </span>
          </div>
          <div>
            <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Tenant</p>
            <p class="text-slate-900 dark:text-white text-2xl font-black">
              {{ stats?.overview?.totalTenants || superAdminStats?.totalTenants || 0 }}
            </p>
          </div>
        </div>

        <!-- Stat 5: Total Users -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-4 hover:shadow-lg hover:-translate-y-1 transition-all group">
          <div class="flex justify-between items-start">
            <div class="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-2xl group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-[24px]">group</span>
            </div>
            <span class="flex items-center text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-blue-100 dark:ring-blue-900/30">
              +5%
            </span>
          </div>
          <div>
            <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Pengguna</p>
            <p class="text-slate-900 dark:text-white text-2xl font-black">
              {{ stats?.overview?.totalUsers || 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main Layout Area: 2 Columns -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Left Column (Larger) -->
        <div class="xl:col-span-2 flex flex-col gap-8">
          <!-- Quick Actions (Aksi Cepat) -->
          <div class="flex flex-col gap-4">
            <h3 class="text-slate-900 dark:text-white text-xl font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-600">bolt</span>
                Aksi Cepat
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <router-link to="/app/tenants" class="flex flex-col items-center justify-center gap-4 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500/50 hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div class="bg-blue-50 dark:bg-slate-700 p-4 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600 shadow-sm">
                  <span class="material-symbols-outlined text-[28px]">add_business</span>
                </div>
                <span class="text-sm font-bold text-slate-700 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Tambah Tenant</span>
              </router-link>
              <router-link to="/app/reports/global" class="flex flex-col items-center justify-center gap-4 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-indigo-500/50 hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div class="bg-indigo-50 dark:bg-slate-700 p-4 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600 shadow-sm">
                  <span class="material-symbols-outlined text-[28px]">post_add</span>
                </div>
                <span class="text-sm font-bold text-slate-700 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Laporan Global</span>
              </router-link>
              <router-link to="/app/superadmin/contact-messages" class="flex flex-col items-center justify-center gap-4 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-blue-500/50 hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div class="bg-blue-50 dark:bg-slate-700 p-4 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600 shadow-sm">
                  <span class="material-symbols-outlined text-[28px]">support_agent</span>
                </div>
                <span class="text-sm font-bold text-slate-700 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Tiket Support</span>
              </router-link>
              <router-link to="/app/users" class="flex flex-col items-center justify-center gap-4 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-orange-500/50 hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div class="bg-orange-50 dark:bg-slate-700 p-4 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors text-orange-600 shadow-sm">
                  <span class="material-symbols-outlined text-[28px]">settings_account_box</span>
                </div>
                <span class="text-sm font-bold text-slate-700 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Kelola User</span>
              </router-link>
            </div>
          </div>

          <!-- Latest Addon Purchases Table -->
          <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 class="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                 <span class="material-symbols-outlined text-orange-500">shopping_cart</span>
                 Pembelian Addon Terbaru
              </h3>
              <router-link to="/app/addons" class="text-sm text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 transition-colors">
                 Lihat Semua <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </router-link>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th class="px-6 py-4">Tenant</th>
                    <th class="px-6 py-4">Addon</th>
                    <th class="px-6 py-4">Tanggal</th>
                    <th class="px-6 py-4">Jumlah</th>
                    <th class="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                  <tr v-for="addon in stats?.recentAddons?.slice(0, 5) || []" :key="addon.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm uppercase shadow-sm">
                           {{ addon.tenantName?.charAt(0) }}
                        </div>
                        <div>
                          <p class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{{ addon.tenantName }}</p>
                          <p class="text-xs text-slate-500 dark:text-slate-500 font-mono">#{{ addon.id?.toString().substring(0, 6) }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{{ addon.addonName }}</span>
                    </td>
                    <td class="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">{{ formatDateTime(addon.subscribedAt) }}</td>
                    <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(addon.price || 0) }}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border" 
                        :class="addon.status === 'active' 
                            ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                            : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'">
                        <span class="w-1.5 h-1.5 rounded-full" :class="addon.status === 'active' ? 'bg-blue-500' : 'bg-slate-400'"></span>
                        {{ addon.status }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!stats?.recentAddons?.length">
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500 text-sm italic">
                        <div class="flex flex-col items-center gap-2">
                            <span class="material-symbols-outlined text-[32px] text-slate-300">shopping_cart_off</span>
                            Belum ada pembelian addon terbaru.
                        </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Column (Smaller) -->
        <div class="flex flex-col gap-8">
          <!-- Best Selling Packages -->
          <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
            <h3 class="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-purple-600">leaderboard</span>
                Paket Terlaris
            </h3>
            <div class="flex flex-col gap-5">
              <div v-for="plan in stats?.subscriptionBreakdown?.sort((a: any, b: any) => b.count - a.count).slice(0, 5) || []" :key="plan.plan" class="flex flex-col gap-2">
                <div class="flex justify-between items-end">
                  <span class="text-sm font-bold text-slate-900 dark:text-white">{{ getPlanName(plan.plan) }}</span>
                  <span class="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">{{ plan.count }} Tenant</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" :style="{ width: `${(plan.count / (stats?.overview?.activeSubscriptions || 1)) * 100}%` }"></div>
                </div>
                <p class="text-[10px] font-medium text-slate-500 text-right">{{ Math.round((plan.count / (stats?.overview?.activeSubscriptions || 1)) * 100) }}% dari total</p>
              </div>
               <div v-if="!stats?.subscriptionBreakdown?.length" class="text-center py-8 text-slate-400 text-sm italic">
                Data langganan tidak tersedia.
              </div>
            </div>
          </div>

          <!-- Subscriptions by Status -->
          <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
            <h3 class="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                 <span class="material-symbols-outlined text-teal-600">pie_chart</span>
                 Status Langganan
            </h3>
            <div class="flex items-center gap-6">
              <div class="relative size-36 shrink-0 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center p-2 shadow-inner">
                 <!-- Gradient approximation based on active count vs total -->
                 <div class="absolute inset-0 rounded-full opacity-20" 
                      :style="`background: conic-gradient(#22c55e 0% ${stats?.overview?.activeSubscriptions ? Math.round((stats.overview.activeSubscriptions / (stats.overview.totalTenants || 1)) * 100) : 0}%, #64748b ${stats?.overview?.activeSubscriptions ? Math.round((stats.overview.activeSubscriptions / (stats.overview.totalTenants || 1)) * 100) : 0}% 100%);`"></div>
                <div class="absolute inset-2 rounded-full border-[6px] border-blue-500 shadow-lg shadow-blue-500/20" style="clip-path: circle(100%);"></div>
                
                <div class="absolute inset-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center flex-col z-10 shadow-sm">
                  <span class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ stats?.overview?.activeSubscriptions || 0 }}</span>
                  <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aktif</span>
                </div>
              </div>
              <div class="flex flex-col gap-3 flex-1">
                 <div v-for="statusGroup in getSubscriptionStatusGroups()" :key="statusGroup.status" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div class="flex items-center gap-2.5">
                    <span class="size-3 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm" :class="getSubscriptionStatusColor(statusGroup.status)"></span>
                    <span class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{{ getSubscriptionStatusLabel(statusGroup.status) }}</span>
                  </div>
                  <span class="text-sm font-black text-slate-900 dark:text-white">{{ statusGroup.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const { error: showError } = useNotification();
const loading = ref(false);
const superAdminDateRange = ref('month');

const dateRanges = [
  { value: 'today', label: 'Hari Ini' },
  { value: 'week', label: 'Minggu' },
  { value: 'month', label: 'Bulan' },
  { value: 'year', label: 'Tahun' },
];
const stats = ref<any>(null);
const globalReportData = ref<any>(null);
const superAdminStats = ref({
  totalTenants: 0,
  activeTenants: 0,
  totalRevenue: 0,
});

const getSuperAdminDateRange = () => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;
  
  switch (superAdminDateRange.value) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
  }
  
  return { startDate, endDate };
};

const getDateRangeLabel = () => {
  const { startDate, endDate } = getSuperAdminDateRange();
  return `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`;
};

const getPlanName = (plan: string) => {
  const planNames: Record<string, string> = {
    BASIC: 'BASIC',
    PRO: 'PRO',
    ENTERPRISE: 'MAX',
    STARTER: 'BASIC',
    BOOST: 'PRO',
    MAX: 'MAX',
  };
  return planNames[plan] || plan;
};

const getSubscriptionStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ACTIVE: 'Aktif',
    EXPIRED: 'Kedaluwarsa',
    CANCELLED: 'Dibatalkan',
  };
  return labels[status] || status;
};

const getSubscriptionStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-blue-500',
    EXPIRED: 'bg-red-500',
    CANCELLED: 'bg-slate-500',
  };
  return colors[status] || 'bg-slate-500';
};

const getSubscriptionStatusGroups = () => {
  if (!globalReportData.value?.subscriptions) return [];
  
  const statusMap = new Map<string, number>();
  globalReportData.value.subscriptions.forEach((sub: any) => {
    const status = sub.status || 'UNKNOWN';
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });
  
  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));
};

const loadSuperAdminStats = async () => {
  loading.value = true;
  try {
    const response = await api.get('/dashboard/stats');
    stats.value = response.data;
    superAdminStats.value = {
      totalTenants: stats.value?.overview?.totalTenants || 0,
      activeTenants: stats.value?.overview?.activeTenants || 0,
      totalRevenue: stats.value?.overview?.totalRevenue || 0,
    };
  } catch (error: any) {
    if (!authStore.isAuthenticated) {
      return;
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return;
    }
    
    if (error.response?.status === 503) {
      console.error('Database connection error:', error.response?.data?.message);
      await showError('Koneksi database terputus. Silakan periksa konfigurasi database atau hubungi administrator.');
      stats.value = { overview: {} };
      superAdminStats.value = { totalTenants: 0, activeTenants: 0, totalRevenue: 0 };
      return;
    }
    
    console.error('Error loading super admin stats:', error);
    const errorMessage = error.response?.data?.message || 'Gagal memuat statistik super admin';
    await showError(errorMessage);
    if (!stats.value) {
      stats.value = { overview: {} };
    }
    if (!superAdminStats.value || Object.keys(superAdminStats.value).length === 0) {
      superAdminStats.value = { totalTenants: 0, activeTenants: 0, totalRevenue: 0 };
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (authStore.isAuthenticated) {
    loadSuperAdminStats();
  }
});
</script>
