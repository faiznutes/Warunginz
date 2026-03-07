<template>
  <div v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Product Adjustments</h3>
        <p class="text-sm text-gray-600">Record reasons for stock additions or reductions</p>
      </div>
      <button
        @click="showAdjustmentModal = true"
        class="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Adjustment
      </button>
    </div>

    <!-- Adjustments List -->
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">By</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="adjustment in adjustments" :key="adjustment.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(adjustment.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ adjustment.product?.name || 'N/A' }}
                <span v-if="adjustment.product?.sku" class="text-xs text-gray-500">({{ adjustment.product.sku }})</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    adjustment.type === 'INCREASE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ adjustment.type === 'INCREASE' ? 'Addition' : 'Reduction' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="adjustment.type === 'INCREASE' ? 'text-green-600' : 'text-red-600'">
                <div class="flex flex-col">
                  <span>{{ adjustment.type === 'INCREASE' ? '+' : '-' }}{{ adjustment.quantity }}</span>
                  <span class="text-xs text-gray-500">Before: {{ adjustment.stockBefore }} → After: {{ adjustment.stockAfter }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ adjustment.reason }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ adjustment.user?.name || 'N/A' }}
              </td>
            </tr>
            <tr v-if="adjustments.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-sm text-gray-500">
                No product adjustments yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Adjustment Modal -->
    <div
      v-if="showAdjustmentModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showAdjustmentModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Add Product Adjustment</h3>
            <button
              @click="showAdjustmentModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveAdjustment" class="space-y-4">
            <!-- Product Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Product</label>
              <select
                v-model="adjustmentForm.productId"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Product</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} (Stock: {{ product.stock }})
                </option>
              </select>
            </div>

            <!-- Adjustment Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Adjustment Type</label>
              <select
                v-model="adjustmentForm.type"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="INCREASE">Stock Addition</option>
                <option value="DECREASE">Stock Reduction</option>
              </select>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                v-model.number="adjustmentForm.quantity"
                type="number"
                required
                min="1"
                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <!-- Reason -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <textarea
                v-model="adjustmentForm.reason"
                required
                rows="3"
                placeholder="Example: Supplier return, Damaged goods, Stocktaking, etc."
                class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">Explain the reason for stock adjustment in detail</p>
            </div>

            <!-- Suggestion -->
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p class="text-xs font-medium text-blue-900 mb-1 flex items-center gap-1">
                <span class="text-base">💡</span>
                <span>Suggested Reasons:</span>
              </p>
              <ul class="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>Stocktaking / Stock Audit</li>
                <li>Return to Supplier</li>
                <li>Damaged / Expired Goods</li>
                <li>System Adjustment</li>
                <li>Data Correction</li>
                <li>Lost / Theft</li>
                <li>Samples / Promotions</li>
              </ul>
            </div>

            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
              >
                Save
              </button>
              <button
                type="button"
                @click="showAdjustmentModal = false"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';
import { formatDate } from '../utils/formatters';
import { useNotification } from '../composables/useNotification';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const { success: showSuccess, error: showError } = useNotification();

const adjustments = ref<any[]>([]);
const products = ref<any[]>([]);
const showAdjustmentModal = ref(false);
const loading = ref(false);

const adjustmentForm = ref({
  productId: '',
  type: 'INCREASE' as 'INCREASE' | 'DECREASE',
  quantity: 1,
  reason: '',
});

const loadAdjustments = async () => {
  loading.value = true;
  try {
    const response = await api.get('/products/adjustments');
    adjustments.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading adjustments:', error);
    await showError(error.response?.data?.message || 'Failed to load adjustment data');
  } finally {
    loading.value = false;
  }
};

const loadProducts = async () => {
  try {
    const response = await api.get('/products', { params: { limit: 1000 } });
    products.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading products:', error);
  }
};

const saveAdjustment = async () => {
  try {
    await api.post('/products/adjustments', adjustmentForm.value);
    await showSuccess('Product adjustment saved successfully');
    showAdjustmentModal.value = false;
    adjustmentForm.value = {
      productId: '',
      type: 'INCREASE',
      quantity: 1,
      reason: '',
    };
    await loadAdjustments();
    await loadProducts(); // Reload products to get updated stock
  } catch (error: any) {
    console.error('Error saving adjustment:', error);
    await showError(error.response?.data?.message || 'Failed to save adjustment');
  }
};

onMounted(() => {
  loadAdjustments();
  loadProducts();
});
</script>

