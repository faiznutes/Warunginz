<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Product Adjustments</h1>
        <p class="text-slate-500 mt-1">Track and manage inventory stock adjustments</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showAdjustmentModal = true"
          class="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-[20px]">add_circle</span>
          <span>New Adjustment</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-card border border-slate-100 p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Period</label>
          <div class="relative">
             <select
              v-model="dateFilter"
              class="appearance-none block w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
              @change="applyDateFilter"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
             <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">expand_more</span>
          </div>
        </div>
        <div v-if="dateFilter === 'custom'">
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">From Date</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="block w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
            @change="loadAdjustments"
          />
        </div>
        <div v-if="dateFilter === 'custom'">
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">To Date</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="block w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
            @change="loadAdjustments"
          />
        </div>
        <div class="lg:col-span-2">
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Search Product</label>
          <div class="relative">
             <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search by product name or SKU..."
              class="block w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
              @input="loadAdjustments"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Type</label>
          <div class="relative">
            <select
              v-model="filters.type"
              class="appearance-none block w-full pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
              @change="loadAdjustments"
            >
              <option value="">All Types</option>
              <option value="INCREASE">Increase (+)</option>
              <option value="DECREASE">Decrease (-)</option>
            </select>
            <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center">
         <div class="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
         <span class="text-slate-500 font-medium">Loading adjustments...</span>
      </div>
    </div>

    <!-- Adjustments List -->
    <div v-else class="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden flex flex-col flex-1">
      <div class="overflow-x-auto flex-1">
        <table class="min-w-full divide-y divide-slate-100">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Change</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-100">
            <tr v-for="adjustment in adjustments" :key="adjustment.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                {{ formatDateTime(adjustment.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex flex-col">
                  <span class="font-bold text-slate-900">{{ adjustment.product?.name || 'Unknown Product' }}</span>
                  <span v-if="adjustment.product?.sku" class="text-xs text-slate-400 font-mono mt-0.5">{{ adjustment.product.sku }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm"
                  :class="[
                    adjustment.type === 'INCREASE'
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-red-50 text-red-700 border-red-100'
                  ]"
                >
                  {{ adjustment.type === 'INCREASE' ? 'Increase' : 'Decrease' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold" :class="adjustment.type === 'INCREASE' ? 'text-green-600' : 'text-red-600'">
                {{ adjustment.type === 'INCREASE' ? '+' : '-' }}{{ adjustment.quantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="text-slate-400">{{ adjustment.stockBefore }}</span>
                  <span class="material-symbols-outlined text-[14px] text-slate-300">arrow_forward</span>
                  <span class="font-bold text-slate-900">{{ adjustment.stockAfter }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 max-w-xs truncate" :title="adjustment.reason">
                {{ adjustment.reason }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                 <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                      {{ (adjustment.user?.name || 'U').charAt(0).toUpperCase() }}
                    </div>
                    <span class="text-slate-600">{{ adjustment.user?.name || 'Unknown' }}</span>
                 </div>
              </td>
            </tr>
            <tr v-if="adjustments.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                 <span class="material-symbols-outlined text-4xl mb-2 text-slate-300">history</span>
                 <p>No adjustment history found</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="bg-white px-6 py-4 flex items-center justify-between border-t border-slate-100">
        <div class="text-sm text-slate-500">
          Showing <span class="font-medium text-slate-900">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> to
          <span class="font-medium text-slate-900">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> of
          <span class="font-medium text-slate-900">{{ pagination.total }}</span> results
        </div>
        <div class="flex space-x-2">
          <button
            @click="loadAdjustments(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-2 font-medium bg-white"
          >
            Previous
          </button>
          <button
            @click="loadAdjustments(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-primary transition-colors flex items-center gap-2 font-medium bg-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Adjustment Modal -->
    <div
      v-if="showAdjustmentModal"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity"
      @click.self="showAdjustmentModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 transform transition-all scale-100">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-slate-900">New Stock Adjustment</h3>
            <button
              @click="closeModal"
              class="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form @submit.prevent="saveAdjustment" class="space-y-5">
            <!-- Alasan Selection -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Reason for Adjustment *</label>
              <div class="relative">
                <select
                  v-model="adjustmentForm.reasonType"
                  required
                  class="appearance-none w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
                  @change="handleReasonChange"
                >
                  <option value="">Select Reason</option>
                  <option value="STOCK_OPNAME">Stock Opname / Stocktaking</option>
                  <option value="RETUR_SUPPLIER">Return to Supplier</option>
                  <option value="BARANG_RUSAK">Damaged / Expired Goods</option>
                  <option value="PENYESUAIAN_SISTEM">System Adjustment</option>
                  <option value="KOREKSI_DATA">Data Correction</option>
                  <option value="BARANG_HILANG">Lost / Theft</option>
                  <option value="SAMPLE_PROMOSI">Sample / Promotion</option>
                  <option value="TRANSFER_STOK">Stock Transfer</option>
                  <option value="CUSTOM">Custom Reason</option>
                </select>
                <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <!-- Supplier Selection (for Retur Supplier) -->
            <div v-if="adjustmentForm.reasonType === 'RETUR_SUPPLIER'">
              <label class="block text-sm font-bold text-slate-700 mb-2">Supplier *</label>
              <div class="relative">
                <select
                  v-model="adjustmentForm.supplierId"
                  required
                  class="appearance-none w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
                  @change="handleSupplierChange"
                >
                  <option value="">Select Supplier</option>
                  <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                    {{ supplier.name }}
                  </option>
                </select>
                <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
               </div>
            </div>

            <!-- Transfer Stok Form -->
            <div v-if="adjustmentForm.reasonType === 'TRANSFER_STOK'" class="space-y-4 border-t border-slate-100 pt-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-2">From Store *</label>
                  <div class="relative">
                    <select
                      v-model="transferForm.fromOutletId"
                      required
                      class="appearance-none w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
                    >
                      <option value="">Select Store</option>
                      <option v-for="outlet in outlets" :key="outlet.id" :value="outlet.id">
                        {{ outlet.name }}
                      </option>
                    </select>
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-2">To Store *</label>
                  <div class="relative">
                    <select
                      v-model="transferForm.toOutletId"
                      required
                      class="appearance-none w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
                    >
                      <option value="">Select Store</option>
                      <option v-for="outlet in outlets" :key="outlet.id" :value="outlet.id">
                        {{ outlet.name }}
                      </option>
                    </select>
                     <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-bold text-slate-700">Products & Quantity *</label>
                  <button
                    type="button"
                    @click="addTransferItem"
                    class="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition"
                  >
                    + Add Product
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(item, index) in transferForm.items"
                    :key="index"
                    class="grid grid-cols-12 gap-3 items-end p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <div class="col-span-8">
                       <label class="block text-xs font-semibold text-slate-500 mb-1">Product</label>
                      <div 
                        @click="openProductSelector('transfer', index)"
                        class="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white cursor-pointer hover:border-blue-400 transition"
                      >
                        <div v-if="item.productId" class="flex flex-col">
                          <span class="font-bold text-sm text-slate-900 truncate">{{ item.productName }}</span>
                          <span class="text-[10px] text-slate-500">Stock: {{ item.currentStock }}</span>
                        </div>
                        <span v-else class="text-sm text-slate-400">Select Product</span>
                      </div>
                    </div>
                    <div class="col-span-3">
                       <label class="block text-xs font-semibold text-slate-500 mb-1">Qty</label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="1"
                        required
                        placeholder="Qty"
                        class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                      />
                    </div>
                    <div class="col-span-1 flex items-center justify-end pb-1">
                      <button
                        type="button"
                        @click="removeTransferItem(index)"
                        class="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-xl transition"
                      >
                        <span class="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Selection (for non-transfer) -->
            <div v-if="adjustmentForm.reasonType !== 'TRANSFER_STOK' && adjustmentForm.reasonType !== ''">
              <label class="block text-sm font-bold text-slate-700 mb-2">Product *</label>
              <div 
                @click="openProductSelector('single')"
                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 hover:bg-white cursor-pointer transition-all flex items-center justify-between"
              >
                <div v-if="adjustmentForm.productId">
                  <span class="font-bold text-slate-900 block">{{ adjustmentForm.productName }}</span>
                  <span class="text-xs text-slate-500">Current Stock: {{ adjustmentForm.currentStock }}</span>
                </div>
                <span v-else class="text-slate-500">Select Product</span>
                <span class="material-symbols-outlined text-slate-400">inventory_2</span>
              </div>
            </div>

            <!-- Adjustment Type (only for CUSTOM reason) -->
            <div v-if="adjustmentForm.reasonType === 'CUSTOM'">
              <label class="block text-sm font-bold text-slate-700 mb-2">Adjustment Type *</label>
              <div class="relative">
                <select
                  v-model="adjustmentForm.type"
                  required
                  class="appearance-none w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
                >
                  <option value="INCREASE">Increase Stock (+)</option>
                  <option value="DECREASE">Decrease Stock (-)</option>
                </select>
                 <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>

            <!-- Quantity (for non-transfer) -->
            <div v-if="adjustmentForm.reasonType !== 'TRANSFER_STOK' && adjustmentForm.reasonType !== ''">
              <label class="block text-sm font-bold text-slate-700 mb-2">Quantity *</label>
              <input
                v-model.number="adjustmentForm.quantity"
                type="number"
                required
                min="1"
                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            <!-- Custom Reason Input (only for CUSTOM) -->
            <div v-if="adjustmentForm.reasonType === 'CUSTOM'">
              <label class="block text-sm font-bold text-slate-700 mb-2">Detailed Reason *</label>
              <textarea
                v-model="adjustmentForm.reason"
                required
                rows="3"
                placeholder="Explain the reason for stock adjustment..."
                class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50 focus:bg-white transition-all resize-none"
              ></textarea>
            </div>

            <div class="flex gap-3 pt-6">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving || !isFormValid"
                class="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
              >
                {{ saving ? 'Saving...' : 'Save Adjustment' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

    <!-- Product Selector Modal -->
  <ProductSelectorModal
    :show="showProductSelector"
    :title="selectorContext.type === 'transfer' ? 'Select Product for Transfer' : 'Select Product to Adjust'"
    :allow-multiple="false"
    @confirm="handleProductSelection"
    @cancel="showProductSelector = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../api';
import { formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';
import { useAuthStore } from '../../stores/auth';
import ProductSelectorModal from '../../components/ProductSelectorModal.vue';

const authStore = useAuthStore();
const { success: showSuccess, error: showError } = useNotification();

const loading = ref(false);
const saving = ref(false);
const adjustments = ref<any[]>([]);
// const products = ref<any[]>([]); // Removed: No longer loading all products
const outlets = ref<any[]>([]);
const suppliers = ref<any[]>([]);
const showAdjustmentModal = ref(false);
const dateFilter = ref('');

const filters = ref({
  search: '',
  type: '',
  startDate: '',
  endDate: '',
});

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const adjustmentForm = ref({
  reasonType: '',
  productId: '',
  supplierId: '',
  type: 'DECREASE' as 'INCREASE' | 'DECREASE',
  quantity: 1,
  reason: '',
  productName: '', // Added for display
  currentStock: 0, // Added for display
});

const transferForm = ref({
  fromOutletId: '',
  toOutletId: '',
  items: [{ productId: '', quantity: 1, productName: '', currentStock: 0 }],
});

const showProductSelector = ref(false);
const selectorContext = ref<{ type: 'single' | 'transfer', index?: number }>({ type: 'single' });

const openProductSelector = (type: 'single' | 'transfer', index?: number) => {
  selectorContext.value = { type, index };
  showProductSelector.value = true;
};

const handleProductSelection = async (selectedIds: string[]) => {
  if (selectedIds.length === 0) return;
  const productId = selectedIds[0];
  showProductSelector.value = false;

  try {
    // Fetch product details - use /products/:id for single product (faster and more reliable)
    const response = await api.get(`/products/${productId}`);
    const product = response.data;

    if (!product) {
        await showError('Failed to load product details');
        return;
    }

    if (selectorContext.value.type === 'single') {
        adjustmentForm.value.productId = product.id;
        adjustmentForm.value.productName = product.name;
        adjustmentForm.value.currentStock = product.stock;
    } else if (selectorContext.value.type === 'transfer' && selectorContext.value.index !== undefined) {
        const item = transferForm.value.items[selectorContext.value.index];
        item.productId = product.id;
        item.productName = product.name;
        item.currentStock = product.stock;
    }
  } catch (error) {
    console.error('Error fetching selected product:', error);
    await showError('Failed to select product');
  }
};

const reasonMap: Record<string, string> = {
  'STOCK_OPNAME': 'Stock Opname / Stocktaking',
  'RETUR_SUPPLIER': 'Return to Supplier',
  'BARANG_RUSAK': 'Damaged / Expired Goods',
  'PENYESUAIAN_SISTEM': 'System Adjustment',
  'KOREKSI_DATA': 'Data Correction',
  'BARANG_HILANG': 'Lost / Theft',
  'SAMPLE_PROMOSI': 'Sample / Promotion',
  'TRANSFER_STOK': 'Stock Transfer',
  'CUSTOM': '',
};

const isFormValid = computed(() => {
  if (!adjustmentForm.value.reasonType) return false;
  
  if (adjustmentForm.value.reasonType === 'TRANSFER_STOK') {
    return transferForm.value.fromOutletId && 
           transferForm.value.toOutletId && 
           transferForm.value.items.length > 0 &&
           transferForm.value.items.every(item => item.productId && item.quantity > 0);
  }
  
  if (adjustmentForm.value.reasonType === 'RETUR_SUPPLIER') {
    return adjustmentForm.value.supplierId && 
           adjustmentForm.value.productId && 
           adjustmentForm.value.quantity > 0;
  }
  
  if (adjustmentForm.value.reasonType === 'CUSTOM') {
    return adjustmentForm.value.productId && 
           adjustmentForm.value.quantity > 0 && 
           adjustmentForm.value.reason.trim() !== '';
  }
  
  return adjustmentForm.value.productId && adjustmentForm.value.quantity > 0;
});

const applyDateFilter = () => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  switch (dateFilter.value) {
    case 'today':
      filters.value.startDate = today.toISOString().split('T')[0];
      filters.value.endDate = today.toISOString().split('T')[0];
      break;
    case 'week':
      filters.value.startDate = startOfWeek.toISOString().split('T')[0];
      filters.value.endDate = today.toISOString().split('T')[0];
      break;
    case 'month':
      filters.value.startDate = startOfMonth.toISOString().split('T')[0];
      filters.value.endDate = today.toISOString().split('T')[0];
      break;
    case 'custom':
      // User will set dates manually
      break;
    default:
      filters.value.startDate = '';
      filters.value.endDate = '';
  }
  loadAdjustments();
};

const handleReasonChange = () => {
  // Auto-set type based on reason
  if (adjustmentForm.value.reasonType === 'BARANG_RUSAK' || 
      adjustmentForm.value.reasonType === 'BARANG_HILANG' || 
      adjustmentForm.value.reasonType === 'SAMPLE_PROMOSI') {
    adjustmentForm.value.type = 'DECREASE';
  } else if (adjustmentForm.value.reasonType === 'RETUR_SUPPLIER') {
    adjustmentForm.value.type = 'DECREASE';
  }
  
  // Reset form fields
  adjustmentForm.value.productId = '';
  adjustmentForm.value.supplierId = '';
  adjustmentForm.value.quantity = 1;
  adjustmentForm.value.reason = '';
  calcStock(adjustmentForm.value); // Reset
  transferForm.value = {
    fromOutletId: '',
    toOutletId: '',
    items: [{ productId: '', quantity: 1, productName: '', currentStock: 0 }],
  };
};

const calcStock = (form: any) => {
    form.productName = '';
    form.currentStock = 0;
};

const handleSupplierChange = () => {
  // Load products when supplier is selected (if needed)
};

const loadAdjustments = async (page = 1) => {
  loading.value = true;
  try {
    const params: any = {
      page,
      limit: pagination.value.limit,
    };

    if (filters.value.search) params.search = filters.value.search;
    if (filters.value.type) params.type = filters.value.type;
    if (filters.value.startDate) params.startDate = filters.value.startDate;
    if (filters.value.endDate) params.endDate = filters.value.endDate;
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }

    const response = await api.get('/products/adjustments', { params });
    
    // Handle null products (deleted products) and ensure all fields exist
    adjustments.value = (response.data.data || []).map((adj: any) => ({
      ...adj,
      product: adj.product || { 
        id: adj.productId || '', 
        name: 'Product Deleted', 
        sku: null 
      },
      user: adj.user || {
        id: '',
        name: 'Unknown',
        email: ''
      },
    }));
    
    pagination.value = response.data.pagination || pagination.value;
    pagination.value.page = page;
  } catch (error: any) {
    console.error('Error loading adjustments:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to load adjustments';
    
    // If it's a 404 or "Product not found" error, still show empty list instead of error
    if (error.response?.status === 404 || errorMessage.includes('Product not found')) {
      adjustments.value = [];
      pagination.value = { page: 1, limit: 20, total: 0, totalPages: 0 };
      console.warn('Product not found error, showing empty list');
    } else {
      await showError(errorMessage);
    }
  } finally {
    loading.value = false;
  }
};

// Removed loadProducts as we select via modal
/*
const loadProducts = async () => {
  try {
    const params: any = { limit: 1000 };
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/products', { params });
    products.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading products:', error);
  }
};
*/

const loadOutlets = async () => {
  try {
    const params: any = { limit: 100 };
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/outlets', { params });
    outlets.value = response.data.data || response.data || [];
  } catch (error: any) {
    console.error('Error loading outlets:', error);
  }
};

const loadSuppliers = async () => {
  try {
    const params: any = { limit: 100 };
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/suppliers', { params });
    suppliers.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading suppliers:', error);
  }
};

const addTransferItem = () => {
  transferForm.value.items.push({ productId: '', quantity: 1, productName: '', currentStock: 0 });
};

const removeTransferItem = (index: number) => {
  transferForm.value.items.splice(index, 1);
};

const closeModal = () => {
  showAdjustmentModal.value = false;
  adjustmentForm.value = {
    reasonType: '',
    productId: '',
    supplierId: '',
    type: 'DECREASE',
    quantity: 1,
    reason: '',
    productName: '',
    currentStock: 0,
  };
  transferForm.value = {
    fromOutletId: '',
    toOutletId: '',
    items: [{ productId: '', quantity: 1, productName: '', currentStock: 0 }],
  };
};

const saveAdjustment = async () => {
  // Validate form before submitting
  if (!isFormValid.value) {
    await showError('Please complete all required fields');
    return;
  }
  
    // Product valid if set (modal ensures existence)
    if (!adjustmentForm.value.productId) {
      await showError('Please select a product.');
      return;
    }
  
  // Validate transfer items (modal ensures existence)
  if (adjustmentForm.value.reasonType === 'TRANSFER_STOK') {
    for (const item of transferForm.value.items) {
      if (!item.productId) {
         await showError('Please select a product for all transfer items.');
         return;
      }
    }
  }
  
  saving.value = true;
  try {
    if (adjustmentForm.value.reasonType === 'TRANSFER_STOK') {
      // Handle stock transfer
      const data = {
        type: 'TRANSFER',
        reason: 'Stock Transfer',
        fromOutletId: transferForm.value.fromOutletId,
        toOutletId: transferForm.value.toOutletId,
        transferItems: transferForm.value.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };
      await api.post('/products/adjustments', data);
      await showSuccess('Stock transfer created successfully');
    } else {
      // Handle regular adjustment
      let reason = reasonMap[adjustmentForm.value.reasonType] || adjustmentForm.value.reason;
      
      if (adjustmentForm.value.reasonType === 'RETUR_SUPPLIER') {
        const supplier = suppliers.value.find(s => s.id === adjustmentForm.value.supplierId);
        reason = `Return to Supplier: ${supplier?.name || ''}`;
      }
      
      const data = {
        productId: adjustmentForm.value.productId,
        type: adjustmentForm.value.type,
        quantity: adjustmentForm.value.quantity,
        reason: reason,
      };
      
      await api.post('/products/adjustments', data);
      await showSuccess('Product adjustment saved successfully');
    }
    
    closeModal();
    await loadAdjustments(pagination.value.page);
    // await loadProducts(); // No longer needed
  } catch (error: any) {
    console.error('Error saving adjustment:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to save adjustment';
    
    // Better error messages
    if (errorMessage.includes('Product not found') || errorMessage.includes('not found')) {
      await showError('Product not found. Please ensure the product is active.');
    } else if (errorMessage.includes('Insufficient stock')) {
      await showError('Insufficient stock for this adjustment.');
    } else {
      await showError(errorMessage);
    }
  } finally {
    saving.value = false;
  }
};



onMounted(() => {
  loadAdjustments();
  // loadProducts(); // Removed
  loadOutlets();
  loadSuppliers();
});
</script>
