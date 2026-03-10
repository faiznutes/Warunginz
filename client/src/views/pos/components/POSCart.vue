<template>
  <div class="bg-white rounded-xl shadow-md p-4 flex flex-col h-full">
    <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">CART</h2>
    
    <!-- Cart Items -->
    <div class="flex-1 overflow-y-auto mb-4 space-y-2">
      <div
        v-for="item in cart"
        :key="item.id"
        class="bg-gray-50 rounded-xl p-3 flex items-center justify-between"
      >
        <div class="flex-1">
          <div class="flex justify-between items-start mb-1">
            <h3 class="font-medium text-gray-900 line-clamp-1">{{ item.name }}</h3>
            <span class="text-sm font-bold text-primary ml-2">
              {{ formatCurrency(item.price * item.quantity) }}
            </span>
          </div>
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>{{ formatCurrency(item.price) }} / unit</span>
          </div>
        </div>
        
        <!-- Qty Controls -->
        <div class="flex items-center gap-3 ml-4">
          <button
            @click="updateQuantity(item, -1)"
            class="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 flex items-center justify-center transition-colors"
          >
            -
          </button>
          <span class="w-4 text-center font-medium">{{ item.quantity }}</span>
          <button
            @click="updateQuantity(item, 1)"
            class="w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex items-center justify-center transition-colors"
          >
            +
          </button>
          <button
            @click="removeItem(item)"
            class="ml-2 w-8 h-8 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="cart.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
        <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p>Keranjang kosong</p>
      </div>
    </div>

    <!-- Summary -->
    <div class="border-t border-gray-100 pt-4 space-y-2">
      <div class="flex justify-between text-gray-500">
        <span>Subtotal</span>
        <span>{{ formatCurrency(subtotal) }}</span>
      </div>
      <div v-if="discount > 0" class="flex justify-between text-green-600">
        <span>Diskon</span>
        <span>-{{ formatCurrency(discount) }}</span>
      </div>
      <div class="flex justify-between text-xl font-bold text-gray-900 pt-2">
        <span>Total</span>
        <span>{{ formatCurrency(total) }}</span>
      </div>
      
      <button
        @click="$emit('checkout')"
        :disabled="cart.length === 0"
        class="w-full mt-4 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        Bayar
      </button>
      
      <button
        @click="$emit('clear-cart')"
        :disabled="cart.length === 0"
        class="w-full py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
      >
        Kosongkan Keranjang
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define types based on usage
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  [key: string]: any;
}

defineProps<{
  cart: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}>();

const emit = defineEmits<{
  (e: 'update-quantity', item: CartItem, change: number): void;
  (e: 'remove-item', item: CartItem): void;
  (e: 'checkout'): void;
  (e: 'clear-cart'): void;
}>();

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const updateQuantity = (item: CartItem, change: number) => {
  emit('update-quantity', item, change);
};

const removeItem = (item: CartItem) => {
  emit('remove-item', item);
};
</script>
