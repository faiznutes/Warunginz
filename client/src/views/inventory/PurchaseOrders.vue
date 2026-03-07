<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Purchase Orders</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Manage purchase orders for product restocking.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Create Purchase Order</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <select
          v-model="statusFilter"
          @change="loadPurchaseOrders"
          class="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="ORDERED">Ordered</option>
          <option value="RECEIVED">Received</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          v-model="supplierFilter"
          @change="loadPurchaseOrders"
          class="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All Suppliers</option>
          <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
            {{ supplier.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="purchaseOrders.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">receipt_long</span>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">No Purchase Orders</h3>
      <p class="text-slate-500 text-center max-w-md mb-4">Create your first purchase order to start restocking products.</p>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        Create First PO
      </button>
    </div>

    <!-- Purchase Orders List -->
    <div v-else class="space-y-4">
      <div
        v-for="po in purchaseOrders"
        :key="po.id"
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-card p-6 border-l-4 hover:shadow-lg transition"
        :class="getStatusBorderClass(po.status)"
      >
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ po.orderNumber }}</h3>
              <span
                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                :class="getStatusClass(po.status)"
              >
                {{ po.status }}
              </span>
            </div>
            <p class="text-sm text-slate-500 mb-4 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">local_shipping</span>
              Supplier: <span class="font-semibold text-slate-900 dark:text-white ml-1">{{ po.supplier.name }}</span>
            </p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Order Date</p>
                <p class="font-semibold text-slate-900 dark:text-white">{{ formatDate(po.orderDate) }}</p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Date</p>
                <p class="font-semibold text-slate-900 dark:text-white">{{ po.expectedDate ? formatDate(po.expectedDate) : '-' }}</p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                <p class="font-semibold text-blue-600">Rp {{ formatCurrency(po.totalAmount) }}</p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Items</p>
                <p class="font-semibold text-slate-900 dark:text-white">{{ po.items.length }} items</p>
              </div>
            </div>
            <div class="border-t border-slate-100 dark:border-slate-700 pt-4">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Items:</p>
              <div class="space-y-2">
                <div
                  v-for="item in po.items"
                  :key="item.id"
                  class="flex items-center justify-between text-sm bg-slate-50 dark:bg-slate-900 p-2 rounded-xl"
                >
                  <div>
                    <span class="font-medium text-slate-900 dark:text-white">{{ item.product.name }}</span>
                    <span class="text-slate-500 ml-2">({{ item.quantity }}x @ Rp {{ formatCurrency(item.unitPrice) }})</span>
                  </div>
                  <span class="font-bold text-slate-900 dark:text-white">Rp {{ formatCurrency(item.totalPrice) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex lg:flex-col items-center gap-2">
            <button
              v-if="po.status === 'PENDING'"
              @click="approvePurchaseOrder(po)"
              class="px-3 py-1.5 text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/40 transition flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">check</span>
              Approve
            </button>
            <button
              v-if="po.status === 'ORDERED' || po.status === 'APPROVED'"
              @click="receivePurchaseOrder(po)"
              class="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/40 transition flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">inventory</span>
              Receive
            </button>
            <button
              v-if="po.status !== 'RECEIVED' && po.status !== 'CANCELLED'"
              @click="cancelPurchaseOrder(po)"
              class="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">close</span>
              Cancel
            </button>
            <button
              @click="viewPurchaseOrder(po)"
              class="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">visibility</span>
              View
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <span class="material-symbols-outlined">receipt_long</span>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Create Purchase Order</h3>
              </div>
              <button
                @click="closeModal"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <form @submit.prevent="savePurchaseOrder" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Supplier *</label>
                  <select
                    v-model="poForm.supplierId"
                    required
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="">Select Supplier</option>
                    <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                      {{ supplier.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expected Date</label>
                  <input
                    v-model="poForm.expectedDate"
                    type="date"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
                <textarea
                  v-model="poForm.notes"
                  rows="3"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Items *</label>
                  <button
                    type="button"
                    @click="addItem"
                    class="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">add</span>
                    Add Item
                  </button>
                </div>
                <div class="space-y-2">
                  <div
                    v-for="(item, index) in poForm.items"
                    :key="index"
                    class="grid grid-cols-12 gap-2 items-end p-3 bg-slate-50 dark:bg-slate-900 rounded-xl"
                  >
                    <div class="col-span-5">
                      <select
                        v-model="item.productId"
                        required
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="">Select Product</option>
                        <option v-for="product in products" :key="product.id" :value="product.id">
                          {{ product.name }} (Stock: {{ product.stock }})
                        </option>
                      </select>
                    </div>
                    <div class="col-span-2">
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="Qty"
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div class="col-span-3">
                      <input
                        min="0"
                        step="0.01"
                        required
                        placeholder="Unit Price"
                        class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div class="col-span-2 flex items-center justify-end">
                      <button
                        type="button"
                        @click="removeItem(index)"
                        class="px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition flex items-center gap-1"
                      >
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <span class="text-lg font-bold text-slate-900 dark:text-white">Total: Rp {{ formatCurrency(calculateTotal) }}</span>
                <div class="flex gap-3">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="saving || poForm.items.length === 0"
                    class="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition font-medium shadow-lg shadow-blue-500/30"
                  >
                    {{ saving ? 'Saving...' : 'Create PO' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal && selectedPO"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showDetailModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
          <div class="p-6">
             <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl">
                  <span class="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ selectedPO.orderNumber }}</h3>
                  <p class="text-sm text-slate-500">{{ formatDate(selectedPO.orderDate) }}</p>
                </div>
              </div>
              <button
                @click="showDetailModal = false"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <div class="space-y-6">
              <!-- Info Grid -->
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-sm font-bold rounded-full"
                    :class="getStatusClass(selectedPO.status)"
                  >
                    {{ selectedPO.status }}
                  </span>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Supplier</p>
                  <p class="font-bold text-slate-900 dark:text-white">{{ selectedPO.supplier.name }}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Date</p>
                  <p class="font-bold text-slate-900 dark:text-white">{{ selectedPO.expectedDate ? formatDate(selectedPO.expectedDate) : '-' }}</p>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
                  <p class="font-bold text-blue-600 text-lg">Rp {{ formatCurrency(selectedPO.totalAmount) }}</p>
                </div>
              </div>

              <!-- Items Table -->
              <div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Order Items</h4>
                <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table class="w-full text-sm text-left">
                    <thead class="bg-slate-50 dark:bg-slate-900 text-slate-500 font-bold uppercase text-xs">
                      <tr>
                        <th class="px-4 py-3">Product</th>
                        <th class="px-4 py-3 text-right">Qty</th>
                        <th class="px-4 py-3 text-right">Unit Price</th>
                        <th class="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                      <tr v-for="item in selectedPO.items" :key="item.id" class="bg-white dark:bg-slate-800">
                        <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ item.product.name }}</td>
                        <td class="px-4 py-3 text-right text-slate-500">{{ item.quantity }}</td>
                        <td class="px-4 py-3 text-right text-slate-500">Rp {{ formatCurrency(item.unitPrice) }}</td>
                        <td class="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">Rp {{ formatCurrency(item.totalPrice) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl flex justify-end">
            <button
               @click="showDetailModal = false"
               class="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: { id: string; name: string };
  status: string;
  orderDate: string;
  expectedDate?: string;
  totalAmount: number;
  items: Array<{
    id: string;
    product: { id: string; name: string };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

const purchaseOrders = ref<PurchaseOrder[]>([]);
const suppliers = ref<any[]>([]);
const products = ref<any[]>([]);
const loading = ref(false);
const statusFilter = ref('');
const supplierFilter = ref('');
const showCreateModal = ref(false);
const saving = ref(false);

const poForm = ref({
  supplierId: '',
  expectedDate: '',
  notes: '',
  items: [{ productId: '', quantity: 1, unitPrice: 0 }],
});

const showDetailModal = ref(false);
const selectedPO = ref<PurchaseOrder | null>(null);

const calculateTotal = computed(() => {
  return poForm.value.items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);
});

const loadPurchaseOrders = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (statusFilter.value) params.status = statusFilter.value;
    if (supplierFilter.value) params.supplierId = supplierFilter.value;
    const response = await api.get('/purchase-orders', { params });
    purchaseOrders.value = response.data.data;
  } catch (error: any) {
    console.error('Error loading purchase orders:', error);
    await showError('Failed to load purchase orders');
  } finally {
    loading.value = false;
  }
};

const loadSuppliers = async () => {
  try {
    const response = await api.get('/suppliers', { params: { limit: 100 } });
    suppliers.value = response.data.data;
  } catch (error: any) {
    console.error('Error loading suppliers:', error);
  }
};

const loadProducts = async () => {
  try {
    const response = await api.get('/products', { params: { limit: 100, isActive: true } });
    products.value = response.data.data;
  } catch (error: any) {
    console.error('Error loading products:', error);
  }
};

const addItem = () => {
  poForm.value.items.push({ productId: '', quantity: 1, unitPrice: 0 });
};

const removeItem = (index: number) => {
  poForm.value.items.splice(index, 1);
};

const savePurchaseOrder = async () => {
  saving.value = true;
  try {
    const data = {
      supplierId: poForm.value.supplierId,
      expectedDate: poForm.value.expectedDate || undefined,
      notes: poForm.value.notes || undefined,
      items: poForm.value.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
    await api.post('/purchase-orders', data);
    await showSuccess('Purchase order created successfully');
    closeModal();
    await loadPurchaseOrders();
  } catch (error: any) {
    console.error('Error saving purchase order:', error);
    await showError('Failed to save purchase order');
  } finally {
    saving.value = false;
  }
};

const approvePurchaseOrder = async (po: PurchaseOrder) => {
  try {
    await api.put(`/purchase-orders/${po.id}`, { status: 'APPROVED' });
    await showSuccess('Purchase order approved successfully');
    await loadPurchaseOrders();
  } catch (error: any) {
    console.error('Error approving purchase order:', error);
    await showError('Failed to approve purchase order');
  }
};

const receivePurchaseOrder = async (po: PurchaseOrder) => {
  const confirmed = await showConfirm(
    'Receive Purchase Order',
    'Are you sure you want to receive this purchase order? Stock will be updated.'
  );
  if (!confirmed) return;

  try {
    await api.post(`/purchase-orders/${po.id}/receive`);
    await showSuccess('Purchase order received and stock updated');
    await loadPurchaseOrders();
  } catch (error: any) {
    console.error('Error receiving purchase order:', error);
    await showError('Failed to receive purchase order');
  }
};

const cancelPurchaseOrder = async (po: PurchaseOrder) => {
  const confirmed = await showConfirm(
    'Cancel Purchase Order',
    'Are you sure you want to cancel this purchase order?'
  );
  if (!confirmed) return;

  try {
    await api.post(`/purchase-orders/${po.id}/cancel`);
    await showSuccess('Purchase order cancelled');
    await loadPurchaseOrders();
  } catch (error: any) {
    console.error('Error cancelling purchase order:', error);
    await showError('Failed to cancel purchase order');
  }
};

const viewPurchaseOrder = (po: PurchaseOrder) => {
  selectedPO.value = po;
  showDetailModal.value = true;
};

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-blue-100 text-blue-700',
    ORDERED: 'bg-purple-100 text-purple-700',
    RECEIVED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-slate-100 text-slate-600',
  };
  return classes[status] || 'bg-slate-100 text-slate-600';
};

const getStatusBorderClass = (status: string): string => {
  const classes: Record<string, string> = {
    PENDING: 'border-yellow-500',
    APPROVED: 'border-blue-500',
    ORDERED: 'border-purple-500',
    RECEIVED: 'border-green-500',
    CANCELLED: 'border-slate-500',
  };
  return classes[status] || 'border-slate-500';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US');
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

const closeModal = () => {
  showCreateModal.value = false;
  poForm.value = {
    supplierId: '',
    expectedDate: '',
    notes: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }],
  };
};

onMounted(() => {
  loadPurchaseOrders();
  loadSuppliers();
  loadProducts();
});
</script>
