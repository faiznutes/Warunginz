<template>
  <div class="flex flex-col gap-6 font-display p-6 bg-slate-50 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Failed Sync Orders</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage and retry offline orders that failed to sync.</p>
      </div>
      
      <div class="flex items-center gap-3">
        <RouterLink to="/pos" class="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to POS
        </RouterLink>
        <button
          @click="refreshList"
          class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 font-bold text-sm hover:-translate-y-0.5"
        >
          <span class="material-symbols-outlined text-[20px]">refresh</span>
          <span>Refresh List</span>
        </button>
      </div>
    </div>

    <!-- Alert Boxes -->
    <div class="space-y-4">
      <!-- No Failed Orders -->
      <div v-if="failedOrders.length === 0 && !loading" class="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
           <span class="material-symbols-outlined text-[28px]">cloud_done</span>
        </div>
        <div>
          <h3 class="font-bold text-blue-900 text-lg">All caught up!</h3>
          <p class="text-sm text-blue-700 font-medium">All valid orders have been successfully synced to the server.</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm">
        <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-slate-500 font-medium animate-pulse">Checking for unsynced orders...</p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
        <div class="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
           <span class="material-symbols-outlined text-[24px]">error_outline</span>
        </div>
        <div>
          <h3 class="font-bold text-red-900">Sync Error</h3>
          <p class="text-sm text-red-700 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Failed Orders List -->
    <div class="grid gap-4">
      <div
        v-for="order in failedOrders"
        :key="order.id"
        class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group"
      >
        <!-- Order Header -->
        <div class="p-5 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
             <div class="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-red-500 shadow-sm">
                <span class="material-symbols-outlined text-2xl">receipt_long</span>
             </div>
             <div>
                <h3 class="text-lg font-bold text-slate-800">Order #{{ order.id.slice(0, 8) }}</h3>
                <div class="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                   <span class="material-symbols-outlined text-[14px]">schedule</span>
                   {{ new Date(order.timestamp).toLocaleString('en-US') }}
                </div>
             </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider">
               <span class="material-symbols-outlined text-[16px]">sync_problem</span>
               <span>Failed</span>
            </span>
            <span v-if="order.retryCount" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold">
               {{ order.retryCount }} Retries
            </span>
          </div>
        </div>

        <!-- Order Content -->
        <div class="p-6 grid lg:grid-cols-2 gap-6">
           <!-- Items & Total -->
           <div class="space-y-4">
              <div>
                 <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Order Summary</p>
                 <div class="space-y-2">
                    <div
                      v-for="(item, idx) in order.orderData?.items?.slice(0, 3)"
                      :key="idx"
                      class="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div class="flex gap-2 items-center">
                         <span class="w-5 h-5 bg-white rounded border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">{{ item.quantity }}</span>
                         <span class="font-medium text-slate-700 truncate max-w-[150px]">{{ item.name || item.productId }}</span>
                      </div>
                      <span class="font-bold text-slate-900">{{ formatCurrency((item.price || 0) * (item.quantity || 0)) }}</span>
                    </div>
                    <div v-if="(order.orderData?.items?.length || 0) > 3" class="text-center text-xs text-slate-500 font-medium italic pt-1">
                       + {{ (order.orderData?.items?.length || 0) - 3 }} more items
                    </div>
                 </div>
              </div>
              
              <div class="flex justify-between items-center pt-4 border-t border-slate-100">
                 <span class="font-bold text-slate-700">Total Amount</span>
                 <span class="text-xl font-black text-blue-600">
                    {{ formatCurrency(calculateTotal(order.orderData)) }}
                 </span>
              </div>
           </div>
           
           <!-- Error & Actions -->
           <div class="flex flex-col h-full">
              <div class="flex-1 bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                 <h4 class="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                   <span class="material-symbols-outlined text-[18px]">bug_report</span>
                   Sync Error Detail
                 </h4>
                 <p class="text-sm text-red-600 bg-white/50 p-3 rounded-lg border border-red-100 font-mono break-all">
                    {{ order.syncError || 'Unknown connection error' }}
                 </p>
              </div>
              
              <div class="grid grid-cols-2 gap-3 mt-auto">
                 <button
                    @click="discardOrder(order.id)"
                    :disabled="discarding === order.id"
                    class="px-4 py-3 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                 >
                    <span class="material-symbols-outlined text-[20px]">delete_forever</span>
                    <span>Discard</span>
                 </button>
                 <button
                    @click="retrySync(order.id)"
                    :disabled="retrying === order.id || retryOrder?.id === order.id"
                    class="px-4 py-3 bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/30 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                 >
                    <div v-if="retrying === order.id" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span v-else class="material-symbols-outlined text-[20px]">cloud_upload</span>
                    <span>{{ retrying === order.id ? 'Syncing...' : 'Retry Sync' }}</span>
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Troubleshooting Tips -->
    <div v-if="failedOrders.length > 0" class="mt-8 bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
      <h3 class="font-bold text-indigo-900 mb-4 flex items-center gap-2">
        <span class="material-symbols-outlined">tips_and_updates</span>
        Troubleshooting Tips
      </h3>
      <div class="grid md:grid-cols-2 gap-4">
         <div class="flex gap-3 items-start p-3 bg-white rounded-xl border border-indigo-100 opacity-80">
            <span class="material-symbols-outlined text-indigo-500 mt-0.5">inventory_2</span>
            <div>
               <p class="font-bold text-indigo-900 text-sm">Insufficient Stock</p>
               <p class="text-xs text-indigo-700">Check if products have valid stock levels in Inventory.</p>
            </div>
         </div>
         <div class="flex gap-3 items-start p-3 bg-white rounded-xl border border-indigo-100 opacity-80">
             <span class="material-symbols-outlined text-indigo-500 mt-0.5">wifi_off</span>
            <div>
               <p class="font-bold text-indigo-900 text-sm">Connection Issues</p>
               <p class="text-xs text-indigo-700">Ensure you have a stable internet connection before retrying.</p>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { offlineStorage } from '../../utils/offline-storage';
import { useNotification } from '../../composables/useNotification';
import api from '../../api';

interface OfflineOrder {
  id: string;
  orderData: any;
  timestamp: number;
  syncFailed?: boolean;
  syncError?: string;
  retryCount?: number;
}

const failedOrders = ref<OfflineOrder[]>([]);
const loading = ref(true);
const error = ref('');
const retrying = ref('');
const discarding = ref('');
const retryOrder = ref<OfflineOrder | null>(null);

const { success, error: showErrorNotification } = useNotification();

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const calculateTotal = (orderData: any): number => {
  if (!orderData?.items) return 0;
  const subtotal = orderData.items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  return orderData.discount ? subtotal - orderData.discount : subtotal;
};

const loadFailedOrders = async () => {
  loading.value = true;
  error.value = '';
  try {
    failedOrders.value = await offlineStorage.getFailedSyncOrders();
  } catch (err: any) {
    error.value = `Failed to load orders: ${err.message}`;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const refreshList = async () => {
  await loadFailedOrders();
  success('List updated');
};

const retrySync = async (orderId: string) => {
  retrying.value = orderId;
  try {
    const order = failedOrders.value.find(o => o.id === orderId);
    if (!order) return;

    retryOrder.value = order;

    // Try to sync this specific order
    const orderResponse = await api.post('/orders', order.orderData);
    const serverOrder = orderResponse.data;

    // Create transaction if needed
    if (order.orderData.transactionData) {
      const transactionData = {
        ...order.orderData.transactionData,
        orderId: serverOrder.id,
      };
      await api.post('/transactions', transactionData);
    }

    // Mark as synced and delete from failed list
    await offlineStorage.markOrderAsSynced(orderId, serverOrder.id);
    await offlineStorage.deleteOrder(orderId);

    // Reload list
    await loadFailedOrders();
    
    success('Order synced successfully!');
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
    showErrorNotification(`Sync failed: ${errorMsg}`);
    error.value = errorMsg;
  } finally {
    retrying.value = '';
    retryOrder.value = null;
  }
};

const discardOrder = async (orderId: string) => {
  if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
    return;
  }

  discarding.value = orderId;
  try {
    await offlineStorage.deleteOrder(orderId);
    await loadFailedOrders();
    success('Order deleted from history');
  } catch (err: any) {
    showErrorNotification(`Failed to delete order: ${err.message}`);
    error.value = err.message;
  } finally {
    discarding.value = '';
  }
};

onMounted(async () => {
  await loadFailedOrders();
});
</script>
