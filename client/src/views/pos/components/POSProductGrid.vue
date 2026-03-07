<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden relative">
    <!-- Search Bar Sticky -->
    <div class="p-4 lg:p-6 pb-2 sticky top-0 z-20 bg-slate-50/95 backdrop-blur-sm">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
          ref="searchInputRef"
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text" 
          aria-label="Search products"
          placeholder="Search menu, sku or barcode..." 
          class="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium placeholder:text-slate-400"
        >
      </div>
    </div>

    <!-- Virtual List Container -->
    <div 
      v-bind="containerProps" 
      class="flex-1 overflow-y-auto p-4 lg:p-6 pt-2 custom-scrollbar"
    >
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 pb-20 lg:pb-0">
         <div v-for="i in 8" :key="i" class="bg-white rounded-2xl p-4 animate-pulse h-64">
           <div class="w-full aspect-square bg-slate-200 rounded-xl mb-4"></div>
           <div class="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
           <div class="h-4 bg-slate-200 rounded w-1/2"></div>
         </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="safeProducts.length === 0" class="flex flex-col items-center justify-center h-64 text-slate-500">
         <span class="material-symbols-outlined text-5xl mb-2">search_off</span>
         <p>No products found</p>
      </div>

      <!-- Product List (Virtual Grid) -->
      <div 
        v-else 
        v-bind="wrapperProps" 
        class="pb-20 lg:pb-0"
      >
        <div 
          v-for="row in list" 
          :key="row.index"
          class="grid gap-3 lg:gap-4 mb-3 lg:mb-4"
          :class="{
            'grid-cols-2': cols === 2,
            'grid-cols-3': cols === 3,
            'grid-cols-4': cols === 4
          }"
        >
          <div 
            v-for="product in row.data" 
            :key="product.id"
            @click="handleProductClick(product)"
            @keydown.enter="handleProductClick(product)"
            @keydown.space.prevent="handleProductClick(product)"
            role="button"
            tabindex="0"
            class="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 relative focus:outline-none focus:ring-4 focus:ring-primary/20 hover:-translate-y-1 h-fit"
          >
             <!-- Image -->
             <div class="relative aspect-square w-full overflow-hidden bg-slate-100">
                <img 
                  v-if="product.image" 
                  :src="product.image" 
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Product"
                  loading="lazy"
                >
                <div v-else class="w-full h-full flex items-center justify-center text-3xl">
                  {{ product.emoji || '📦' }}
                </div>
                
                <!-- Category Badge -->
                <div class="absolute top-2 right-2 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-700 shadow-sm border border-slate-100">
                  {{ product.category || 'Item' }}
                </div>
                
                <!-- Add Overlay on Hover -->
                <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[1px]">
                   <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <span class="material-symbols-outlined text-primary font-bold text-2xl">add</span>
                   </div>
                </div>
                
                <!-- Stock Badge -->
                 <div v-if="product.stock <= 5" class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-white/95 shadow-lg backdrop-blur-md border border-slate-100/50" :class="product.stock === 0 ? 'text-red-500' : 'text-amber-600'">
                    {{ product.stock === 0 ? 'Habis' : `${product.stock} Tersisa` }}
                 </div>
             </div>

             <!-- Info -->
             <div class="p-3">
                <h3 class="text-slate-800 font-bold text-base truncate mb-2">{{ product.name }}</h3>
                <div class="flex justify-between items-end">
                   <p class="text-slate-500 text-xs font-medium">SKU: {{ product.sku || 'N/A' }}</p>
                   <p class="text-primary font-bold text-lg leading-none">{{ formatCurrency(product.price) }}</p>
                </div>
             </div>
             
             <!-- In Cart Indicator -->
              <div v-if="isInCart(product.id)" class="absolute top-3 left-3 w-7 h-7 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40 z-10 border-2 border-white animate-bounce-in">
                 <span class="material-symbols-outlined text-[16px] font-black">check</span>
              </div>
          </div>
          <!-- Fillers to keep grid alignment in the last row -->
          <template v-if="Array.isArray(row.data) && row.data.length < cols">
            <div v-for="i in (cols - (Array.isArray(row.data) ? row.data.length : 0))" :key="'filler-' + i" class="invisible"></div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useVirtualList, useBreakpoints, breakpointsTailwind } from '@vueuse/core';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  image?: string;
  emoji?: string;
  sku?: string;
}

const props = withDefaults(defineProps<{
  products: Product[];
  loading: boolean;
  searchQuery: string;
  cartItemIds: Set<string>;
}>(), {
  products: () => [],
  loading: false,
  searchQuery: '',
  cartItemIds: () => new Set<string>(),
});

const searchInputRef = ref<HTMLInputElement | null>(null);

import { useSound } from '@/composables/useSound';

// ...

const { playSound } = useSound();

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'add-to-cart', product: Product): void;
}>();

const handleProductClick = (product: Product) => {
  playSound('beep');
  emit('add-to-cart', product);
};

defineExpose({
  focusSearch: () => searchInputRef.value?.focus()
});

// Grid calculation using Tailwind breakpoints
const breakpoints = useBreakpoints(breakpointsTailwind);
const cols = computed(() => {
  if (breakpoints.xl.value) return 4;
  if (breakpoints.md.value) return 3;
  return 2;
});

const safeProducts = computed(() => (Array.isArray(props.products) ? props.products : []));

// Chunks products into rows based on the number of columns
const rows = computed(() => {
  const result = [];
  for (let i = 0; i < safeProducts.value.length; i += cols.value) {
    result.push(safeProducts.value.slice(i, i + cols.value));
  }
  return result;
});

// Row height estimation (adjust based on design)
// Image aspect is square + padding + text (~64px for top/bottom padding + ~60px for info)
// On desktop cols=4, mobile cols=2. Rough estimation is safe.
const itemHeight = computed(() => {
  // Rough estimate: row height changes slightly based on width, but virtual list
  // handles slight variations well if we provide a reasonable estimate.
  return window.innerWidth < 1024 ? 320 : 380;
});

const { list, containerProps, wrapperProps } = useVirtualList(rows, {
  itemHeight: itemHeight.value,
  overscan: 2,
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const isInCart = (productId: string) => {
  return props.cartItemIds.has(productId);
};
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.3);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(148, 163, 184, 0.5);
}

.animate-bounce-in {
  animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>
