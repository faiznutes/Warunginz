<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Stock Alerts</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Monitor products with low stock levels.</p>
      </div>
      <button
        @click="sendAlerts"
        :disabled="sending"
        class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-green-500/30 transition-all font-medium text-sm disabled:opacity-50"
      >
        <span class="material-symbols-outlined text-[20px]">mail</span>
        <span>{{ sending ? 'Sending...' : 'Send Alerts' }}</span>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-[#4c739a] uppercase tracking-wide mb-1">Low Stock</p>
            <p class="text-2xl font-bold text-amber-600">{{ stats.lowStockCount || 0 }}</p>
          </div>
          <div class="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <span class="material-symbols-outlined text-amber-600">warning</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-[#4c739a] uppercase tracking-wide mb-1">Out of Stock</p>
            <p class="text-2xl font-bold text-red-600">{{ stats.outOfStockCount || 0 }}</p>
          </div>
          <div class="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <span class="material-symbols-outlined text-red-600">inventory_2</span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-[#4c739a] uppercase tracking-wide mb-1">Total Alerts</p>
            <p class="text-2xl font-bold text-blue-600">{{ stats.totalAlerts || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-blue-600">notifications_active</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Low Stock Products Table -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden">
      <div class="p-6 border-b border-slate-100 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 rounded-xl">
            <span class="material-symbols-outlined">inventory</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Low Stock Products</h3>
        </div>
      </div>
      
      <div v-if="lowStockProducts.length === 0" class="text-center py-16">
        <span class="material-symbols-outlined text-[48px] text-green-500 mb-4">check_circle</span>
        <p class="text-slate-500">All products have sufficient stock levels.</p>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/50">
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stock</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Min Stock</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="product in lowStockProducts" :key="product.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-slate-900 dark:text-white">{{ product.name }}</div>
                <div class="text-xs text-slate-500">{{ product.sku || 'No SKU' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-bold" :class="product.stock === 0 ? 'text-red-600' : 'text-yellow-600'">
                  {{ product.stock }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-900 dark:text-white">{{ product.minStock }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                  :class="product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'"
                >
                  <span class="material-symbols-outlined text-[14px]">{{ product.stock === 0 ? 'error' : 'warning' }}</span>
                  {{ product.stock === 0 ? 'Out of Stock' : 'Low Stock' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <router-link
                  :to="`/app/inventory/purchase-orders`"
                  class="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-end gap-1 transition"
                >
                  <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  Create PO
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError } = useNotification();

interface Product {
  id: string;
  name: string;
  sku?: string;
  stock: number;
  minStock: number;
}

const lowStockProducts = ref<Product[]>([]);
const stats = ref<any>({});
const loading = ref(false);
const sending = ref(false);

const loadLowStockProducts = async () => {
  loading.value = true;
  try {
    const [productsResponse, statsResponse] = await Promise.all([
      api.get('/stock-alerts/low-stock'),
      api.get('/stock-alerts/stats'),
    ]);
    lowStockProducts.value = productsResponse.data;
    stats.value = statsResponse.data;
  } catch (error: any) {
    console.error('Error loading low stock products:', error);
    await showError('Failed to load low stock products');
  } finally {
    loading.value = false;
  }
};

const sendAlerts = async () => {
  sending.value = true;
  try {
    const response = await api.post('/stock-alerts/send');
    await showSuccess(response.data.message || 'Stock alerts sent successfully');
    await loadLowStockProducts();
  } catch (error: any) {
    console.error('Error sending alerts:', error);
    await showError('Failed to send stock alerts');
  } finally {
    sending.value = false;
  }
};

onMounted(() => {
  loadLowStockProducts();
});
</script>
