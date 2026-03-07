<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Delivery Orders</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Manage delivery orders and tracking.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="canSetupCourier"
          @click="showCourierModal = true"
          class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">local_shipping</span>
          <span>Setup Courier</span>
        </button>
        <button
          @click="showPromoModal = true"
          class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-green-500/30 transition-all font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">sell</span>
          <span>Create Promo</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
      <!-- Search Bar -->
      <div class="mb-6">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search orders..."
            class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <!-- Status & Courier Filters -->
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Status Filter -->
        <div class="flex-1">
          <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-3">Status</label>
          <div class="flex flex-wrap gap-2">
            <button
              @click="filters.status = ''"
              :class="!filters.status 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
              class="px-3 py-1.5 text-sm font-medium rounded-xl transition-all"
            >
              All
            </button>
            <button
              @click="filters.status = 'PENDING'"
              :class="filters.status === 'PENDING' 
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/30' 
                : 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
              class="px-3 py-1.5 text-sm font-medium rounded-xl transition-all"
            >
              Pending
            </button>
            <button
              @click="filters.status = 'PROCESSING'"
              :class="filters.status === 'PROCESSING' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
              class="px-3 py-1.5 text-sm font-medium rounded-xl transition-all"
            >
              Processing
            </button>
            <button
              @click="filters.status = 'SHIPPED'"
              :class="filters.status === 'SHIPPED' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                : 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
              class="px-3 py-1.5 text-sm font-medium rounded-xl transition-all"
            >
              Shipped
            </button>
            <button
              @click="filters.status = 'DELIVERED'"
              :class="filters.status === 'DELIVERED' 
                ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' 
                : 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
              class="px-3 py-1.5 text-sm font-medium rounded-xl transition-all"
            >
              Delivered
            </button>
            <button
              @click="filters.status = 'CANCELLED'"
              :class="filters.status === 'CANCELLED' 
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' 
                : 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
              class="px-3 py-1.5 text-sm font-medium rounded-xl transition-all"
            >
              Cancelled
            </button>
          </div>
        </div>

        <!-- Courier Filter -->
        <div class="flex-1">
          <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-3">Courier</label>
          <div class="flex flex-wrap gap-2">
            <button
              @click="filters.courier = ''"
              :class="!filters.courier 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
              class="px-3 py-1.5 text-sm font-medium rounded-xl transition-all"
            >
              All
            </button>
            <button
              v-for="courier in ['GOSEND', 'GRABEXPRESS', 'JNE', 'JT', 'SICEPAT', 'MANUAL']"
              :key="courier"
              @click="filters.courier = courier"
              :class="filters.courier === courier 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'"
              class="px-3 py-1.5 text-sm font-medium rounded-xl transition-all"
            >
              {{ getCourierLabel(courier) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="deliveryOrders.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">package_2</span>
      <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-2">No Delivery Orders</h3>
      <p class="text-[#4c739a] text-center max-w-md">Delivery orders will appear here when created.</p>
    </div>

    <!-- Delivery Orders Table -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/50">
              <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Order</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Courier</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Address</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-[#4c739a] uppercase tracking-wider">Tracking</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-[#4c739a] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-[#0d141b] dark:text-white">{{ order.orderNumber }}</div>
                <div class="text-xs text-[#4c739a]">{{ formatDateTime(order.createdAt) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-[#0d141b] dark:text-white">{{ order.customerName }}</div>
                <div class="text-xs text-[#4c739a]">{{ order.customerPhone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300">
                  <span class="material-symbols-outlined text-[14px]">local_shipping</span>
                  {{ getCourierLabel(order.courier) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-[#0d141b] dark:text-white max-w-[200px] truncate">{{ order.deliveryAddress }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                  :class="getStatusClass(order.status)"
                >
                  {{ getStatusLabel(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="order.trackingNumber" class="text-sm font-mono text-[#0d141b] dark:text-white">{{ order.trackingNumber }}</div>
                <div v-else class="text-sm text-slate-400">-</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="viewOrder(order)"
                    class="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">visibility</span>
                    Details
                  </button>
                  <button
                    v-if="order.status === 'PENDING'"
                    @click="processDelivery(order.id)"
                    class="px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/40 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">play_arrow</span>
                    Process
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Courier Setup Modal -->
    <Teleport to="body">
      <div
        v-if="showCourierModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showCourierModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-500 rounded-xl">
              <span class="material-symbols-outlined">local_shipping</span>
            </div>
            <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Setup Courier</h3>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Select Courier</label>
              <select
                v-model="courierForm.courier"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select Courier</option>
                <option value="GOSEND">GoSend</option>
                <option value="GRABEXPRESS">GrabExpress</option>
                <option value="JNE">JNE</option>
                <option value="JT">J&T</option>
                <option value="SICEPAT">SiCepat</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">API Key</label>
              <input
                v-model="courierForm.apiKey"
                type="text"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="Enter API Key"
              />
            </div>
            <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                @click="showCourierModal = false"
                class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                @click="saveCourier"
                class="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium shadow-lg shadow-blue-500/30"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Promo Modal -->
    <Teleport to="body">
      <div
        v-if="showPromoModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showPromoModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-xl">
              <span class="material-symbols-outlined">sell</span>
            </div>
            <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Create Promo</h3>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Promo Name</label>
              <input
                v-model="promoForm.name"
                type="text"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="e.g. Holiday Sale 20%"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Discount Type</label>
              <select
                v-model="promoForm.type"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Discount Value</label>
              <input
                v-model.number="promoForm.value"
                type="number"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder="20 or 50000"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Promo Code</label>
              <input
                v-model="promoForm.code"
                type="text"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase"
                placeholder="HOLIDAY20"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Start Date</label>
                <input
                  v-model="promoForm.startDate"
                  type="date"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">End Date</label>
                <input
                  v-model="promoForm.endDate"
                  type="date"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                @click="showPromoModal = false"
                class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                @click="savePromo"
                class="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-lg shadow-green-500/30"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delivery Order Detail Modal -->
    <DeliveryOrderDetailModal
      :show="showDetailModal"
      :order="viewingOrder"
      @close="showDetailModal = false; viewingOrder = null"
      @process="handleProcessFromDetail"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { formatDateTime } from '../../utils/formatters';
import DeliveryOrderDetailModal from '../../components/DeliveryOrderDetailModal.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';
import { useAuthStore } from '../../stores/auth';

const { needsTenantSelection } = useTenantCheck();
const { success: showSuccess, error: showError } = useNotification();
const authStore = useAuthStore();

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  courier: string;
  trackingNumber?: string;
  status: string;
  createdAt: string;
}

const deliveryOrders = ref<DeliveryOrder[]>([]);
const loading = ref(false);
const showCourierModal = ref(false);
const showPromoModal = ref(false);
const showDetailModal = ref(false);
const viewingOrder = ref<DeliveryOrder | null>(null);
const filters = ref({
  search: '',
  status: '',
  courier: '',
});

const courierForm = ref({
  courier: '',
  apiKey: '',
});

const promoForm = ref({
  name: '',
  type: 'PERCENTAGE',
  value: 0,
  code: '',
  startDate: '',
  endDate: '',
});

const canSetupCourier = computed(() => {
  const role = authStore.user?.role;
  return role === 'SUPER_ADMIN' || role === 'ADMIN_TENANT';
});

const filteredOrders = computed(() => {
  let result = deliveryOrders.value;

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(o =>
      o.orderNumber.toLowerCase().includes(search) ||
      o.customerName.toLowerCase().includes(search) ||
      o.trackingNumber?.toLowerCase().includes(search)
    );
  }

  if (filters.value.status) {
    result = result.filter(o => o.status === filters.value.status);
  }

  if (filters.value.courier) {
    result = result.filter(o => o.courier === filters.value.courier);
  }

  return result;
});

const getCourierLabel = (courier: string) => {
  const labels: Record<string, string> = {
    GOSEND: 'GoSend',
    GRABEXPRESS: 'GrabExpress',
    JNE: 'JNE',
    JT: 'J&T',
    SICEPAT: 'SiCepat',
    MANUAL: 'Manual',
  };
  return labels[courier] || courier;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return classes[status] || 'bg-slate-100 text-[#0d141b]';
};

const loadDeliveryOrders = async () => {
  if (needsTenantSelection.value) return;

  loading.value = true;
  try {
    const response = await api.get('/delivery/orders');
    deliveryOrders.value = response.data.data || response.data || [];
  } catch (error: any) {
    console.error('Error loading delivery orders:', error);
    // If endpoint doesn't exist, use empty array
    deliveryOrders.value = [];
  } finally {
    loading.value = false;
  }
};

const viewOrder = (order: DeliveryOrder) => {
  viewingOrder.value = order;
  showDetailModal.value = true;
};

const handleProcessFromDetail = async (orderId: string) => {
  showDetailModal.value = false;
  await processDelivery(orderId);
};

const processDelivery = async (orderId: string) => {
  try {
    await api.post(`/delivery/orders/${orderId}/process`);
    await loadDeliveryOrders();
    await showSuccess('Order processed successfully');
  } catch (error: any) {
    console.error('Error processing delivery:', error);
    await showError(error.response?.data?.message || 'Failed to process order');
  }
};

const saveCourier = async () => {
  if (!canSetupCourier.value) {
    await showError('Anda tidak memiliki izin untuk setup kurir');
    return;
  }

  try {
    await api.post('/delivery/couriers', courierForm.value);
    await showSuccess('Courier setup successfully');
    showCourierModal.value = false;
    courierForm.value = { courier: '', apiKey: '' };
  } catch (error: any) {
    console.error('Error saving courier:', error);
    await showError(error.response?.data?.message || 'Failed to save courier');
  }
};

const savePromo = async () => {
  try {
    await api.post('/marketing/promos', promoForm.value);
    await showSuccess('Promo created successfully');
    showPromoModal.value = false;
    promoForm.value = {
      name: '',
      type: 'PERCENTAGE',
      value: 0,
      code: '',
      startDate: '',
      endDate: '',
    };
  } catch (error: any) {
    console.error('Error saving promo:', error);
    await showError(error.response?.data?.message || 'Failed to create promo');
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadDeliveryOrders();
});
</script>
