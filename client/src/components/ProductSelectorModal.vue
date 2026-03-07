<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-all"
      @click.self="handleCancel"
    >
    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-display">
      <!-- Header -->
      <div class="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h3 class="text-xl font-bold text-slate-900">{{ title }}</h3>
          <p class="text-sm text-slate-500 mt-1 font-medium">{{ subtitle }}</p>
        </div>
        <button
          @click="handleCancel"
          class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition shadow-sm"
        >
          <span class="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>

      <!-- Filters -->
      <div class="p-5 border-b border-slate-100 bg-white">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="md:col-span-2">
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                v-model="filters.search"
                type="text"
                placeholder="Cari produk..."
                class="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-xl transition-all outline-none font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <!-- Category Filter -->
          <div class="relative">
            <select
              v-model="filters.category"
              class="w-full px-4 py-3 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-xl transition-all outline-none font-medium appearance-none"
            >
              <option value="">Semua Kategori</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
          </div>

          <!-- Sort Filter -->
          <div class="relative">
            <select
              v-model="filters.sortBy"
              class="w-full px-4 py-3 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-xl transition-all outline-none font-medium appearance-none"
            >
              <option value="name">Nama A-Z</option>
              <option value="name-desc">Nama Z-A</option>
              <option value="price-asc">Harga: Rendah ke Tinggi</option>
              <option value="price-desc">Harga: Tinggi ke Rendah</option>
              <option value="stock">Stok: Tinggi ke Rendah</option>
            </select>
            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">sort</span>
          </div>
        </div>

        <!-- Selected Count -->
        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm text-slate-600 font-medium">
            <span class="text-blue-600 font-bold">{{ selectedProducts.length }}</span> terpilih
            <span v-if="filteredProducts.length > 0" class="text-slate-400">
              dari {{ filteredProducts.length }} tersedia
            </span>
          </div>
          <button
            v-if="selectedProducts.length > 0"
            @click="clearSelection"
            class="text-xs font-bold text-red-500 hover:text-red-700 hover:underline transition"
          >
            Hapus Pilihan
          </button>
        </div>
      </div>

      <!-- Product List -->
      <div class="flex-1 overflow-y-auto p-5 bg-slate-50 custom-scrollbar">
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
          <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div class="text-slate-500 font-medium animate-pulse">Memuat produk...</div>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center py-20">
          <div class="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
             <span class="material-symbols-outlined text-[40px] text-slate-400">inventory_2</span>
          </div>
          <p class="text-slate-500 font-medium">Produk tidak ditemukan</p>
        </div>

        <div v-else class="space-y-3">
          <label
            v-for="product in filteredProducts"
            :key="product.id"
            class="flex items-center gap-4 p-4 bg-white hover:bg-slate-50 rounded-2xl cursor-pointer border-2 transition-all duration-200 group"
            :class="isSelected(product.id) ? 'border-blue-500 shadow-md shadow-blue-500/10' : 'border-transparent hover:border-slate-200 shadow-sm'"
          >
            <div 
               class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors"
               :class="isSelected(product.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-300 group-hover:border-blue-400'"
            >
               <span v-if="isSelected(product.id)" class="material-symbols-outlined text-white text-[16px]">check</span>
            </div>
            
            <input
              type="checkbox"
              :checked="isSelected(product.id)"
              @change="toggleProduct(product.id)"
              class="hidden"
            />
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{{ product.name }}</p>
                  <div class="mt-1 flex items-center gap-3 text-xs font-medium text-slate-500">
                    <span v-if="product.category" class="bg-slate-100 px-2 py-0.5 rounded-md">{{ product.category }}</span>
                    <span :class="product.stock > 0 ? 'text-blue-600' : 'text-red-500'">
                      Stok: {{ product.stock }}
                    </span>
                  </div>
                </div>
                <span class="font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                   {{ formatCurrency(product.price) }}
                </span>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 bg-white border-t border-slate-100 flex items-center justify-between gap-4 sticky bottom-0 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
        <div class="text-sm font-bold text-slate-600 hidden sm:block">
          <span class="text-blue-600 text-lg">{{ selectedProducts.length }}</span> item terpilih
        </div>
        <div class="flex flex-1 sm:flex-none gap-3">
          <button
            @click="handleCancel"
            class="flex-1 sm:w-32 px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            @click="handleConfirm"
            :disabled="selectedProducts.length === 0"
            class="flex-1 sm:w-48 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[20px]">check</span>
            <span>Konfirmasi ({{ selectedProducts.length }})</span>
          </button>
        </div>
      </div>
    </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import api from '../api';
import { formatCurrency } from '../utils/formatters';

interface Product {
  id: string;
  name: string;
  category?: string;
  price: number;
  stock: number;
}

interface Props {
  show: boolean;
  title?: string;
  subtitle?: string;
  selectedProductIds?: string[];
  allowMultiple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Pilih Produk',
  subtitle: 'Pilih produk untuk ditambahkan',
  selectedProductIds: () => [],
  allowMultiple: true,
});

const emit = defineEmits<{
  confirm: [productIds: string[]];
  cancel: [];
}>();

const products = ref<Product[]>([]);
const loading = ref(false);
const selectedProducts = ref<string[]>([]);

const filters = ref({
  search: '',
  category: '',
  sortBy: 'name',
});

// Initialize selected products from props
watch(() => props.selectedProductIds, (newIds) => {
  selectedProducts.value = [...newIds];
}, { immediate: true });

watch(() => props.show, (newShow) => {
  if (newShow) {
    selectedProducts.value = [...props.selectedProductIds];
    loadProducts();
  }
});

const categories = computed(() => {
  const cats = new Set<string>();
  products.value.forEach(p => {
    if (p.category) cats.add(p.category);
  });
  return Array.from(cats).sort();
});

const filteredProducts = computed(() => {
  let filtered = [...products.value];

  // Search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      (p.category && p.category.toLowerCase().includes(search))
    );
  }

  // Category filter
  if (filters.value.category) {
    filtered = filtered.filter(p => p.category === filters.value.category);
  }

  // Sort
  switch (filters.value.sortBy) {
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filtered.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'stock':
      filtered.sort((a, b) => b.stock - a.stock);
      break;
  }

  return filtered;
});

const isSelected = (productId: string): boolean => {
  return selectedProducts.value.includes(productId);
};

const toggleProduct = (productId: string) => {
  if (props.allowMultiple) {
    const index = selectedProducts.value.indexOf(productId);
    if (index > -1) {
      selectedProducts.value.splice(index, 1);
    } else {
      selectedProducts.value.push(productId);
    }
  } else {
    selectedProducts.value = [productId];
  }
};

const clearSelection = () => {
  selectedProducts.value = [];
};

const loadProducts = async () => {
  loading.value = true;
  try {
    const params: Record<string, any> = { limit: 500, isActive: true, skipCache: '1' };
    const response = await api.get('/products', { params });
    const productsData = response.data.data || response.data;
    products.value = Array.isArray(productsData) ? productsData : [];
  } catch (error: any) {
    console.error('Error loading products:', error);
    products.value = [];
  } finally {
    loading.value = false;
  }
};

const handleConfirm = () => {
  emit('confirm', [...selectedProducts.value]);
};

const handleCancel = () => {
  emit('cancel');
};

onMounted(() => {
  if (props.show) {
    loadProducts();
  }
});
</script>
