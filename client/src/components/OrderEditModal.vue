<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="$emit('close')"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-display">
          <!-- Header -->
          <div class="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h3 class="text-xl font-bold text-slate-900">Edit Order</h3>
              <p class="text-sm text-slate-500 mt-1 font-medium" v-if="order">#{{ order.orderNumber }}</p>
            </div>
            <button
              @click="$emit('close')"
              class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition shadow-sm"
            >
              <span class="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
            <div v-if="loading" class="flex flex-col items-center justify-center py-12">
               <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p class="text-slate-500 font-medium animate-pulse">Loading order...</p>
            </div>

            <div v-else-if="order" class="space-y-6">
              <!-- Order Info -->
              <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="block text-slate-500 font-medium mb-1">Status</span>
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold border" :class="getStatusClass(order.status)">
                       {{ getStatusLabel(order.status) }}
                    </span>
                  </div>
                  <div>
                    <span class="block text-slate-500 font-medium mb-1">Date</span>
                    <span class="font-bold text-slate-900">{{ formatDateTime(order.createdAt) }}</span>
                  </div>
                  <div>
                    <span class="block text-slate-500 font-medium mb-1">Current Total</span>
                    <span class="font-bold text-blue-600 text-lg">{{ formatCurrency(Number(order.total)) }}</span>
                  </div>
                </div>
              </div>

              <!-- Order Items -->
              <div>
                <div class="flex items-center justify-between mb-4">
                   <h4 class="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span class="material-symbols-outlined text-blue-500">shopping_cart</span>
                      Order Items
                   </h4>
                   <button
                    @click="showAddProduct = true"
                    class="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition border border-blue-100 flex items-center gap-2"
                  >
                    <span class="material-symbols-outlined text-[18px]">add</span>
                    Add Product
                  </button>
                </div>
                
                <div class="space-y-3">
                  <div
                    v-for="(item, index) in orderItems"
                    :key="index"
                    class="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div class="flex-1">
                      <div class="font-bold text-slate-900 text-lg">{{ item.product?.name || item.name }}</div>
                      <div class="text-sm font-medium text-slate-500 mt-1">
                        {{ formatCurrency(Number(item.price)) }} x {{ item.quantity }}
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-6">
                      <!-- Quantity Control -->
                      <div class="flex items-center bg-slate-100 rounded-xl p-1">
                        <button
                          @click="updateItemQuantity(index, -1)"
                          :disabled="item.quantity <= 1"
                          class="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:text-blue-600 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
                        >
                          -
                        </button>
                        <input
                          v-model.number="item.quantity"
                          type="number"
                          min="1"
                          class="w-12 text-center bg-transparent font-bold text-slate-900 outline-none"
                          @change="updateItemTotal(index)"
                        />
                        <button
                          @click="updateItemQuantity(index, 1)"
                          class="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:text-blue-600 shadow-sm transition font-bold"
                        >
                          +
                        </button>
                      </div>
                      
                      <div class="text-right min-w-[100px]">
                        <div class="font-bold text-slate-900 text-lg">{{ formatCurrency(Number(item.subtotal)) }}</div>
                      </div>
                      
                      <button
                        @click="removeItem(index)"
                        class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                        title="Remove Item"
                      >
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Summary -->
              <div class="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div class="space-y-3">
                  <div class="flex justify-between text-sm">
                    <span class="font-medium text-slate-600">Subtotal</span>
                    <span class="font-bold text-slate-900">{{ formatCurrency(calculatedSubtotal) }}</span>
                  </div>
                  <div v-if="order && Number(order.discount) > 0" class="flex justify-between text-sm">
                    <span class="font-medium text-slate-600">Discount</span>
                    <span class="font-bold text-red-500">-{{ formatCurrency(Number(order.discount)) }}</span>
                  </div>
                  <div class="flex justify-between text-xl font-bold border-t border-slate-200 pt-4 mt-2">
                    <span class="text-slate-900">Total</span>
                    <span class="text-blue-600">{{ formatCurrency(calculatedTotal) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 bg-white border-t border-slate-100 flex gap-4 sticky bottom-0 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleSave"
              :disabled="saving || orderItems.length === 0"
              class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              <div v-if="saving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{{ saving ? 'Saving Changes...' : 'Save Changes' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { safeMap } from '../utils/array-helpers';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import api from '../api';

interface OrderItem {
  id?: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
  name?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string | number;
  subtotal: string | number;
  discount: string | number;
  createdAt: string;
  items: OrderItem[];
}

interface Props {
  show: boolean;
  order: Order | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  saved: [order: Order];
}>();

const loading = ref(false);
const saving = ref(false);
const orderItems = ref<OrderItem[]>([]);
const showAddProduct = ref(false);

const calculatedSubtotal = computed(() => {
  return orderItems.value.reduce((sum, item) => {
    return sum + (Number(item.price) * item.quantity);
  }, 0);
});

const calculatedTotal = computed(() => {
  const discount = Number(props.order?.discount || 0);
  return calculatedSubtotal.value - discount;
});

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  };
  return labels[status] || status;
};

const getStatusClass = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
    case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'PROCESSING': return 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800';
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
    case 'REFUNDED': return 'bg-purple-100 text-purple-700 border-purple-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

watch(() => props.order, (newOrder) => {
  if (newOrder) {
    // Clone items for editing
    orderItems.value = safeMap(newOrder.items || [], (item: any) => ({
      ...item,
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: Number(item.subtotal),
    }));
  }
}, { immediate: true });

const updateItemQuantity = (index: number, delta: number) => {
  const item = orderItems.value[index];
  const newQuantity = Math.max(1, item.quantity + delta);
  item.quantity = newQuantity;
  updateItemTotal(index);
};

const updateItemTotal = (index: number) => {
  const item = orderItems.value[index];
  item.subtotal = Number(item.price) * item.quantity;
};

const removeItem = (index: number) => {
  orderItems.value.splice(index, 1);
};

const handleSave = async () => {
  if (orderItems.value.length === 0) {
    return;
  }

  saving.value = true;
  try {
    // Calculate new totals
    const newSubtotal = calculatedSubtotal.value;
    const discount = Number(props.order?.discount || 0);
    const newTotal = newSubtotal - discount;

    // Update order items
    const updateData: any = {
      items: orderItems.value.map(item => ({
        productId: item.productId || item.product?.id,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: newSubtotal.toString(),
      total: newTotal.toString(),
    };

    const response = await api.put(`/orders/${props.order?.id}`, updateData);
    emit('saved', response.data);
    emit('close');
  } catch (error: any) {
    console.error('Error updating order:', error);
    // Error handling will be done by parent component
    throw error;
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
