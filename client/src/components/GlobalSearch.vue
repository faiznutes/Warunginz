<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 md:p-20" role="dialog" aria-modal="true" @keydown.esc="close">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" @click="close"></div>

      <!-- Search Modal -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-show="true" class="relative mx-auto max-w-2xl transform divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-black/5 transition-all">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[24px]">search</span>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="h-14 w-full border-0 bg-transparent pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm font-medium"
              placeholder="Cari produk, pesanan, atau pelanggan..."
              @keydown.down.prevent="moveSelection(1)"
              @keydown.up.prevent="moveSelection(-1)"
              @keydown.enter="handleSelect"
            />
            <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span class="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-[10px] font-bold text-slate-400">ESC</span>
            </div>
          </div>

          <!-- Results Section -->
          <div v-if="results.length > 0 || loading" class="max-h-[60vh] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            <div v-if="loading" class="flex items-center justify-center py-12">
               <div class="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            
            <div v-else class="space-y-4">
              <!-- Result Groups -->
              <div v-for="group in groupedResults" :key="group.title">
                <h3 class="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{{ group.title }}</h3>
                <ul class="space-y-1">
                  <li
                    v-for="item in group.items"
                    :key="item.id"
                    :class="[
                      'group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-all',
                      selectedIndex === item.globalIndex ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    ]"
                    @mouseenter="selectedIndex = item.globalIndex"
                    @click="handleItemClick(item)"
                  >
                    <div 
                      class="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm"
                      :class="selectedIndex === item.globalIndex ? 'text-blue-600' : 'text-slate-400'"
                    >
                      <span class="material-symbols-outlined">{{ item.icon }}</span>
                    </div>
                    <div class="flex-auto">
                      <p class="text-sm font-bold text-slate-900 dark:text-white">{{ item.name }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.description }}</p>
                    </div>
                    <span v-if="selectedIndex === item.globalIndex" class="flex-none text-[10px] font-bold text-blue-600">ENTER</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Empty/Recent State -->
          <div v-else-if="query.length > 0 && !loading" class="px-6 py-14 text-center sm:px-14">
            <span class="material-symbols-outlined text-4xl text-slate-300 mb-4">search_off</span>
            <p class="text-sm font-medium text-slate-900 dark:text-white">Tidak ada hasil ditemukan</p>
            <p class="mt-2 text-xs text-slate-500">Coba kata kunci lain untuk mencari produk, pesanan, atau pelanggan.</p>
          </div>

          <div v-else class="px-6 py-14 text-center sm:px-14">
            <div class="flex flex-col items-center">
              <div class="grid grid-cols-3 gap-8 mb-8 text-slate-400">
                <div class="flex flex-col items-center gap-2">
                  <span class="material-symbols-outlined text-3xl">inventory_2</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest">Produk</span>
                </div>
                <div class="flex flex-col items-center gap-2 text-blue-500">
                  <span class="material-symbols-outlined text-3xl">search</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-blue-600">Pencarian</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <span class="material-symbols-outlined text-3xl">group</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest">Pelanggan</span>
                </div>
              </div>
              <p class="text-sm font-medium text-slate-900 dark:text-white tracking-tight">Ketik sesuatu untuk memulai pencarian...</p>
              <div class="mt-6 flex flex-wrap justify-center gap-2">
                <button 
                  v-for="hint in searchHints" 
                  :key="hint"
                  @click="query = hint"
                  class="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-emerald-200"
                >
                  {{ hint }}
                </button>
              </div>
            </div>
          </div>

          <!-- Footer / Help -->
          <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div class="flex gap-4">
              <span class="flex items-center gap-1.5"><span class="px-1 py-0.5 rounded border border-slate-200 bg-white">↑↓</span> Navigasi</span>
              <span class="flex items-center gap-1.5"><span class="px-1 py-0.5 rounded border border-slate-200 bg-white">↵</span> Pilih</span>
            </div>
            <div>
              <span class="text-slate-300">Warungin Global Search</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { formatCurrency } from '../utils/formatters';

const router = useRouter();
const isOpen = ref(false);
const query = ref('');
const results = ref<any[]>([]);
const loading = ref(false);
const selectedIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

// Recent searches storage
const RECENT_SEARCHES_KEY = 'global_search_recent';
const MAX_RECENT_SEARCHES = 5;

const recentSearches = ref<string[]>([]);

const loadRecentSearches = () => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      recentSearches.value = JSON.parse(stored).slice(0, MAX_RECENT_SEARCHES);
    }
  } catch (e) {
    console.warn('Failed to load recent searches:', e);
  }
};

const saveRecentSearch = (query: string) => {
  if (!query || query.trim().length < 2) return;
  
  const trimmed = query.trim();
  // Remove if already exists
  const index = recentSearches.value.indexOf(trimmed);
  if (index !== -1) {
    recentSearches.value.splice(index, 1);
  }
  
  // Add to beginning
  recentSearches.value.unshift(trimmed);
  
  // Keep only MAX_RECENT_SEARCHES
  if (recentSearches.value.length > MAX_RECENT_SEARCHES) {
    recentSearches.value = recentSearches.value.slice(0, MAX_RECENT_SEARCHES);
  }
  
  // Save to localStorage
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches.value));
  } catch (e) {
    console.warn('Failed to save recent searches:', e);
  }
};

const searchHints = computed(() => {
  if (recentSearches.value.length > 0) {
    return recentSearches.value;
  }
  return ['Sembako', 'Order #123', 'John Doe', 'Minuman', 'Terbaru'];
});

interface SearchResult {
  id: string;
  type: 'product' | 'order' | 'customer';
  name: string;
  description: string;
  icon: string;
  url: string;
  globalIndex?: number;
}

const open = () => {
  isOpen.value = true;
  query.value = '';
  results.value = [];
  selectedIndex.value = 0;
  loadRecentSearches();
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const close = () => {
  isOpen.value = false;
};

// Expose methods
defineExpose({ open, close });

const moveSelection = (dir: number) => {
  const total = results.value.length;
  if (total === 0) return;
  selectedIndex.value = (selectedIndex.value + dir + total) % total;
};

const handleSelect = () => {
  const selectedItem = results.value[selectedIndex.value];
  if (selectedItem) {
    handleItemClick(selectedItem);
  }
};

const handleItemClick = (item: SearchResult) => {
  // Save to recent searches
  saveRecentSearch(query.value);
  router.push(item.url);
  close();
};

const groupedResults = computed(() => {
  const groups: Record<string, { title: string, items: any[] }> = {
    product: { title: 'Produk', items: [] },
    order: { title: 'Pesanan', items: [] },
    customer: { title: 'Pelanggan', items: [] }
  };

  results.value.forEach((item, idx) => {
    groups[item.type].items.push({ ...item, globalIndex: idx });
  });

  return Object.values(groups).filter(g => g.items.length > 0);
});

let searchTimeout: any = null;

const performSearch = async () => {
  if (query.value.trim().length < 2) {
    results.value = [];
    return;
  }

  loading.value = true;
  try {
    // Cross-entity search (using existing list APIs with filter)
    const [productsRes, ordersRes, customersRes] = await Promise.all([
      api.get('/products', { params: { search: query.value, limit: 5 } }),
      api.get('/orders', { params: { search: query.value, limit: 5 } }),
      api.get('/customers', { params: { search: query.value, limit: 5 } })
    ]);

    const mappedResults: SearchResult[] = [];

    // Map Products (Smart search: by name, SKU, barcode)
    if (productsRes.data?.data) {
      productsRes.data.data.forEach((p: any) => {
        const skuInfo = p.sku ? `SKU: ${p.sku}` : '';
        const barcodeInfo = p.barcode ? `Barcode: ${p.barcode}` : '';
        const extraInfo = [skuInfo, barcodeInfo].filter(Boolean).join(' • ');
        mappedResults.push({
          id: p.id,
          type: 'product',
          name: p.name,
          description: `${p.category || 'Tanpa Kategori'} • ${formatCurrency(p.price)} • Stok: ${p.stock}${extraInfo ? ` • ${extraInfo}` : ''}`,
          icon: 'inventory_2',
          url: `/app/products?highlight=${p.id}`
        });
      });
    }

    // Map Orders (Smart search: by order number, customer name, or ID)
    if (ordersRes.data?.data) {
      ordersRes.data.data.forEach((o: any) => {
        mappedResults.push({
          id: o.id,
          type: 'order',
          name: `Order #${o.orderNumber || o.id.slice(-6)}`,
          description: `${o.customerName || 'Walk-in'} • ${formatCurrency(o.total || o.totalAmount || 0)} • ${o.status || 'Unknown'}`,
          icon: 'receipt_long',
          url: `/app/orders?highlight=${o.id}`
        });
      });
    }

    // Map Customers (Smart search: by name, phone, email)
    if (customersRes.data?.data) {
      customersRes.data.data.forEach((c: any) => {
        const phoneDisplay = c.phone ? `${c.phone}` : 'No phone';
        const emailDisplay = c.email ? ` • ${c.email}` : '';
        mappedResults.push({
          id: c.id,
          type: 'customer',
          name: c.name,
          description: `${phoneDisplay}${emailDisplay} • Total: ${c.orderCount || 0} transaksi`,
          icon: 'person',
          url: `/app/customers?highlight=${c.id}`
        });
      });
    }

    results.value = mappedResults;
    selectedIndex.value = 0;
  } catch (err) {
    console.error('Search error:', err);
  } finally {
    loading.value = false;
  }
};

watch(query, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(performSearch, 300);
});

// Keyboard listener for Ctrl+K
const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    open();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.animate-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark ::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
