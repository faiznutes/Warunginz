<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Stock Transfers</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Manage stock transfers between stores/branches.</p>
      </div>
      <button
        @click="showTransferModal = true"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Add Transfer</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source Store</label>
          <select
            v-model="filters.fromStore"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Stores</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destination Store</label>
          <select
            v-model="filters.toStore"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Stores</option>
            <option v-for="store in stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
          <select
            v-model="filters.status"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
          <input
            v-model="filters.date"
            type="date"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Transfers Table -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/50">
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Transfer ID</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Source Store</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Destination Store</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-if="loading">
              <td colspan="8" class="px-6 py-12 text-center">
                <div class="flex items-center justify-center gap-3">
                  <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span class="text-slate-500">Loading data...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="transfers.length === 0">
              <td colspan="8" class="px-6 py-16 text-center">
                <span class="material-symbols-outlined text-[48px] text-slate-300 mb-4">swap_horiz</span>
                <p class="text-slate-500">No transfer data</p>
              </td>
            </tr>
            <tr v-else v-for="transfer in transfers" :key="transfer.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-mono font-bold text-slate-900 dark:text-white">{{ transfer.id.substring(0, 8) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-900 dark:text-white">{{ transfer.fromStore?.name || 'N/A' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-900 dark:text-white">{{ transfer.toStore?.name || 'N/A' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-900 dark:text-white">{{ transfer.product?.name || 'N/A' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ transfer.quantity }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-700': transfer.status === 'PENDING',
                    'bg-blue-100 text-blue-700': transfer.status === 'APPROVED',
                    'bg-green-100 text-green-700': transfer.status === 'COMPLETED',
                    'bg-red-100 text-red-700': transfer.status === 'CANCELLED',
                  }"
                >
                  {{ getStatusLabel(transfer.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-slate-500">{{ formatDate(transfer.createdAt) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="viewTransfer(transfer)"
                    class="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">visibility</span>
                    Details
                  </button>
                  <button
                    v-if="transfer.status === 'PENDING'"
                    @click="cancelTransfer(transfer.id)"
                    class="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">close</span>
                    Cancel
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div class="text-sm text-slate-500">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
          {{ pagination.total }} transfers
        </div>
        <div class="flex gap-2">
          <button
            @click="loadTransfers(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium text-sm"
          >
            Previous
          </button>
          <button
            @click="loadTransfers(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium text-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <Teleport to="body">
      <div
        v-if="showTransferModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showTransferModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-700">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <span class="material-symbols-outlined">swap_horiz</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Add Stock Transfer</h2>
          </div>
          <form @submit.prevent="createTransfer" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source Store</label>
              <select
                v-model="transferForm.fromOutletId"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Select Source Store</option>
                <option v-for="store in stores" :key="store.id" :value="store.id">
                  {{ store.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destination Store</label>
              <select
                v-model="transferForm.toOutletId"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Select Destination Store</option>
                <option v-for="store in stores" :key="store.id" :value="store.id">
                  {{ store.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product</label>
              <select
                v-model="transferForm.items[0].productId"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Select Product</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} (Stock: {{ product.stock }})
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quantity</label>
              <input
                min="1"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
              <textarea
                v-model="transferForm.notes"
                rows="3"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              ></textarea>
            </div>
            <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                @click="showTransferModal = false"
                class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium shadow-lg shadow-blue-500/30"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div v-if="showDetailModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-slate-900/75 transition-opacity" aria-hidden="true" @click="showDetailModal = false"></div>

          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div class="relative inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
            <!-- Header -->
            <div class="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100 dark:border-slate-700">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white" id="modal-title">
                    Transfer Details
                  </h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    ID: {{ selectedTransfer?.id }}
                  </p>
                </div>
                <button @click="showDetailModal = false" class="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 transition p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div v-if="selectedTransfer" class="px-4 py-5 sm:p-6">
              <div class="space-y-6">
                <!-- Status & Date -->
                <div class="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</span>
                    <div class="mt-1">
                      <span :class="{
                        'px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-100 dark:text-emerald-300 dark:bg-blue-500/20': selectedTransfer.status === 'COMPLETED',
                        'px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-500/20': selectedTransfer.status === 'APPROVED',
                        'px-2.5 py-1 rounded-lg text-xs font-bold text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-500/20': selectedTransfer.status === 'PENDING',
                        'px-2.5 py-1 rounded-lg text-xs font-bold text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-500/20': selectedTransfer.status === 'CANCELLED'
                      }">
                        {{ getStatusLabel(selectedTransfer.status) }}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</span>
                    <p class="mt-1 font-medium text-slate-900 dark:text-white">{{ formatDate(selectedTransfer.createdAt) }}</p>
                  </div>
                </div>

                <!-- Stores -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">From Store</span>
                    <p class="mt-1 font-medium text-slate-900 dark:text-white">{{ selectedTransfer.fromOutlet?.name || '-' }}</p>
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">To Store</span>
                    <p class="mt-1 font-medium text-slate-900 dark:text-white">{{ selectedTransfer.toOutlet?.name || '-' }}</p>
                  </div>
                </div>

                <!-- Items -->
                <div>
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Items</span>
                  <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead class="bg-slate-50 dark:bg-slate-900">
                        <tr>
                          <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                          <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Quantity</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        <tr v-for="(item, index) in selectedTransfer.items" :key="index">
                          <td class="px-4 py-3 text-sm text-slate-900 dark:text-white">
                            {{ item.product?.name || 'Unknown Product' }}
                          </td>
                          <td class="px-4 py-3 text-sm text-slate-900 dark:text-white text-right">
                            {{ item.quantity }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="selectedTransfer.notes">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</span>
                  <p class="mt-1 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    {{ selectedTransfer.notes }}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div class="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-100 dark:border-slate-700 gap-3">
              <button
                type="button"
                @click="showDetailModal = false"
                class="w-full inline-flex justify-center px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition sm:mt-0 sm:w-auto sm:text-sm"
              >
                Close
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
import { useNotification } from '../../composables/useNotification';
import { format } from 'date-fns';

const { success, error } = useNotification();

const loading = ref(false);
const transfers = ref<any[]>([]);
const stores = ref<any[]>([]);
const products = ref<any[]>([]);
const showTransferModal = ref(false);
const showDetailModal = ref(false);
const selectedTransfer = ref<any>(null);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const filters = ref({
  fromStore: '',
  toStore: '',
  status: '',
  date: '',
});

const transferForm = ref({
  fromOutletId: '',
  toOutletId: '',
  items: [{ productId: '', quantity: 1 }],
  notes: '',
});

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
};

const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

const loadStores = async () => {
  try {
    const response = await api.get('/outlets');
    stores.value = Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (err) {
    console.error('Failed to load stores:', err);
  }
};

const loadProducts = async () => {
  try {
    const response = await api.get('/products?limit=1000');
    products.value = Array.isArray(response.data?.data) ? response.data.data : [];
  } catch (err) {
    console.error('Failed to load products:', err);
  }
};

const loadTransfers = async (page: number = 1) => {
  loading.value = true;
  try {
    const params: any = {
      page,
      limit: pagination.value.limit,
    };
    // Note: Backend uses outletId for filtering, we can filter by from or to outlet
    if (filters.value.fromStore) params.outletId = filters.value.fromStore;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.date) params.date = filters.value.date;

    const response = await api.get('/stock-transfers', { params });
    transfers.value = Array.isArray(response.data?.data) ? response.data.data : [];
    if (response.data?.pagination) {
      pagination.value = {
        page: response.data.pagination.page || page,
        limit: response.data.pagination.limit || 10,
        total: response.data.pagination.total || 0,
        totalPages: response.data.pagination.totalPages || 0,
      };
    }
  } catch (err: any) {
    console.error('Failed to load transfers:', err);
    await error(err.response?.data?.message || 'Failed to load transfer data');
  } finally {
    loading.value = false;
  }
};

const createTransfer = async () => {
  try {
    await api.post('/stock-transfers', transferForm.value);
    await success('Stock transfer created successfully');
    showTransferModal.value = false;
    transferForm.value = {
      fromOutletId: '',
      toOutletId: '',
      items: [{ productId: '', quantity: 1 }],
      notes: '',
    };
    await loadTransfers(pagination.value.page);
  } catch (err: any) {
    console.error('Failed to create transfer:', err);
    await error(err.response?.data?.message || 'Failed to create stock transfer');
  }
};

const cancelTransfer = async (id: string) => {
  try {
    await api.put(`/stock-transfers/${id}/cancel`);
    await success('Stock transfer cancelled successfully');
    await loadTransfers(pagination.value.page);
  } catch (err: any) {
    console.error('Failed to cancel transfer:', err);
    await error(err.response?.data?.message || 'Failed to cancel stock transfer');
  }
};

const viewTransfer = (transfer: any) => {
  selectedTransfer.value = transfer;
  showDetailModal.value = true;
};

onMounted(async () => {
  await loadStores();
  await loadProducts();
  await loadTransfers();
});
</script>
