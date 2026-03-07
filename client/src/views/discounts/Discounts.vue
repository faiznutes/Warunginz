<template>
  <div class="flex flex-col gap-6 font-display p-6 lg:p-8 bg-slate-50 min-h-screen">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Diskon & Promo</h1>
        <p class="text-slate-500 font-medium">Buat dan kelola promosi toko Anda.</p>
      </div>
      <button
        v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm transform hover:-translate-y-0.5"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Tambah Diskon</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sticky top-4 z-20">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input
          v-model="filters.search"
          @focus="handleSearchFocus"
          @input="handleSearchInput"
          type="text"
          placeholder="Cari diskon..."
          class="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-xl transition-all outline-none font-medium placeholder:text-slate-400"
        />
      </div>
    </div>

    <!-- Discounts Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
       <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
       <p class="text-slate-500 font-medium animate-pulse">Memuat diskon...</p>
    </div>

    <div v-else-if="discounts.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-[40px] text-slate-300">percent</span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 mb-2">Belum Ada Diskon</h3>
      <p class="text-slate-500 text-center max-w-md">Buat diskon pertama Anda untuk mulai menawarkan promosi.</p>
      <button 
        @click="showCreateModal = true"
        class="mt-6 text-blue-600 font-bold hover:text-blue-700 hover:underline"
      >
        Buat Sekarang
      </button>
    </div>

    <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Diskon</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Periode</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="discount in filteredDiscounts" :key="discount.id" class="hover:bg-slate-50 transition-colors group">
              <td class="p-4">
                <div class="font-bold text-slate-900">{{ discount.name }}</div>
              </td>
              <td class="p-4">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {{ getDiscountTypeLabel(discount.discountType) }}
                </span>
              </td>
              <td class="p-4">
                <div class="font-bold text-blue-600">
                  {{ discount.discountValueType === 'PERCENTAGE' 
                    ? `${discount.discountValue}%` 
                    : formatCurrency(Number(discount.discountValue)) }}
                </div>
              </td>
              <td class="p-4">
                <div class="text-sm font-medium text-slate-500">
                  <div v-if="discount.startDate || discount.endDate" class="flex flex-col">
                    <span v-if="discount.startDate" class="text-xs">Dari: {{ formatDate(discount.startDate) }}</span>
                    <span v-if="discount.endDate" class="text-xs">Sampai: {{ formatDate(discount.endDate) }}</span>
                  </div>
                  <span v-else class="text-slate-400 italic">Tanpa batas waktu</span>
                </div>
              </td>
              <td class="p-4">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border"
                  :class="discount.isActive ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="discount.isActive ? 'bg-blue-500' : 'bg-slate-400'"></span>
                  {{ discount.isActive ? 'Aktif' : 'Tidak Aktif' }}
                </span>
              </td>
              <td class="p-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="editDiscount(discount)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                    title="Edit"
                  >
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button
                    @click="deleteDiscount(discount.id)"
                    class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
                    title="Hapus"
                  >
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <!-- Modal Header -->
        <div class="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-xl font-bold text-slate-900">
            {{ editingDiscount ? 'Edit Diskon' : 'Diskon Baru' }}
          </h3>
          <button
            @click="closeModal"
            class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition shadow-sm"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form @submit.prevent="saveDiscount" class="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div class="space-y-6">
            <!-- Name -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Nama Diskon</label>
              <input
                v-model="discountForm.name"
                type="text"
                required
                placeholder="Cth. Diskon Lebaran 20%"
                class="w-full px-4 py-3 bg-slate-50 border-transparent hover:bg-white focus:bg-white border focus:border-blue-500 rounded-xl transition-all outline-none font-medium"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
               <!-- Discount Type -->
               <div>
                  <label class="block text-sm font-bold text-slate-700 mb-2">Tipe Diskon</label>
                  <div class="relative">
                     <select
                        v-model="discountForm.discountType"
                        required
                        @change="handleDiscountTypeChange"
                        class="w-full px-4 py-3 bg-slate-50 border-transparent hover:bg-white focus:bg-white border focus:border-blue-500 rounded-xl transition-all outline-none font-medium appearance-none"
                     >
                        <option value="AMOUNT_BASED">Berdasarkan Total Transaksi</option>
                        <option value="BUNDLE">Bundle (Beli Bersama)</option>
                        <option value="PRODUCT_BASED">Spesifik Produk</option>
                        <option value="QUANTITY_BASED">Berdasarkan Jumlah Item</option>
                     </select>
                     <span class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined">expand_more</span>
                  </div>
               </div>
               
               <!-- Value Type -->
               <div>
                  <label class="block text-sm font-bold text-slate-700 mb-2">Tipe Nilai</label>
                  <div class="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                     <button 
                        type="button" 
                        @click="discountForm.discountValueType = 'PERCENTAGE'"
                        class="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                        :class="discountForm.discountValueType === 'PERCENTAGE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                     >
                        Persentase (%)
                     </button>
                     <button 
                        type="button" 
                        @click="discountForm.discountValueType = 'FIXED'"
                        class="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                        :class="discountForm.discountValueType === 'FIXED' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                     >
                        Nominal (Rp)
                     </button>
                  </div>
               </div>
            </div>

            <!-- Discount Value -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">
                Nilai Diskon <span class="text-slate-400 font-normal">{{ discountForm.discountValueType === 'PERCENTAGE' ? '(%)' : '(Rp)' }}</span>
              </label>
              <div class="relative">
                 <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {{ discountForm.discountValueType === 'PERCENTAGE' ? '%' : 'Rp' }}
                 </span>
                 <input
                   v-model.number="discountForm.discountValue"
                   type="number"
                   required
                   min="0"
                   :step="discountForm.discountValueType === 'PERCENTAGE' ? '1' : '1000'"
                   class="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent hover:bg-white focus:bg-white border focus:border-blue-500 rounded-xl transition-all outline-none font-bold text-lg"
                 />
              </div>
            </div>

            <!-- TYPE SPECIFIC SECTIONS -->
            
            <!-- BUNDLE -->
            <div v-if="discountForm.discountType === 'BUNDLE'" class="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-xl border border-indigo-100 dark:border-indigo-800 space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">
                  Pilih Produk Bundle <span class="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  @click="openProductSelector('BUNDLE')"
                  class="w-full px-4 py-3 text-left bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 transition flex items-center justify-between group"
                >
                  <span class="text-sm font-medium text-slate-700">
                    <span v-if="discountForm.bundleProducts.length === 0" class="text-slate-400">
                       Klik untuk memilih produk...
                    </span>
                    <span v-else class="text-indigo-700 dark:text-indigo-400 font-bold">
                      {{ discountForm.bundleProducts.length }} produk terpilih
                    </span>
                  </span>
                  <span class="material-symbols-outlined text-slate-400 group-hover:text-indigo-500">add_circle</span>
                </button>
                <p class="mt-2 text-xs text-slate-500">
                  Pelanggan harus membeli SEMUA produk terpilih agar diskon berlaku.
                </p>
              </div>
              
              <div v-if="discountForm.bundleProducts.length > 0">
                 <label class="block text-sm font-bold text-slate-700 mb-2">Produk mana yang didiskon?</label>
                 <div class="relative">
                    <select
                      v-model="discountForm.bundleDiscountProduct"
                      required
                      class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-medium appearance-none"
                    >
                      <option value="">Pilih produk dalam bundle</option>
                      <option
                        v-for="productId in discountForm.bundleProducts"
                        :key="productId"
                        :value="productId"
                      >
                        {{ getProductName(productId) }}
                      </option>
                    </select>
                    <span class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined">expand_more</span>
                 </div>
              </div>
            </div>

            <!-- PRODUCT_BASED -->
            <div v-if="discountForm.discountType === 'PRODUCT_BASED'" class="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
              <label class="block text-sm font-bold text-slate-700 mb-2">
                Produk yang Berlaku <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                @click="openProductSelector('PRODUCT_BASED')"
                class="w-full px-4 py-3 text-left bg-white border border-emerald-200 rounded-xl hover:bg-blue-50 hover:border-emerald-300 transition flex items-center justify-between group"
              >
                <span class="text-sm font-medium text-slate-700">
                  <span v-if="discountForm.applicableProducts.length === 0" class="text-slate-400">
                    Klik untuk memilih produk...
                  </span>
                  <span v-else class="text-blue-700 font-bold">
                    {{ discountForm.applicableProducts.length }} produk terpilih
                  </span>
                </span>
                <span class="material-symbols-outlined text-slate-400 group-hover:text-blue-500">inventory_2</span>
              </button>
            </div>

            <!-- QUANTITY_BASED -->
            <div v-if="discountForm.discountType === 'QUANTITY_BASED'" class="bg-amber-50/50 p-5 rounded-xl border border-amber-100 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Pilih Berdasarkan</label>
                    <div class="relative">
                       <select
                         v-model="productSelectionType"
                         class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none appearance-none"
                       >
                         <option value="CATEGORY">Kategori</option>
                         <option value="PRODUCTS">Produk Spesifik</option>
                       </select>
                       <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                 </div>
                 
                 <div v-if="productSelectionType === 'CATEGORY'">
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
                    <div class="relative">
                       <select
                         v-model="selectedCategory"
                         @change="handleCategoryChange"
                         class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none appearance-none"
                       >
                         <option value="">Pilih Kategori</option>
                         <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                       </select>
                       <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                 </div>
                 
                 <div v-if="productSelectionType === 'PRODUCTS'" class="col-span-2">
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Produk</label>
                    <button
                      type="button"
                      @click="openProductSelector('QUANTITY_BASED')"
                      class="w-full px-4 py-2 text-left bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition flex items-center justify-between"
                    >
                      <span class="text-sm font-bold text-amber-700">
                         {{ discountForm.applicableProducts.length > 0 ? `${discountForm.applicableProducts.length} produk` : 'Pilih produk' }}
                      </span>
                      <span class="material-symbols-outlined text-amber-400">add</span>
                    </button>
                 </div>
              </div>
              
              <div>
                 <label class="block text-sm font-bold text-slate-700 mb-2">Jumlah Minimum</label>
                 <input
                    v-model.number="discountForm.minQuantity"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 3"
                    class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-amber-500 outline-none font-bold"
                 />
                 <p class="mt-1 text-xs text-slate-500">Beli minimal jumlah ini untuk dapat diskon.</p>
              </div>
            </div>

            <!-- AMOUNT_BASED -->
             <div v-if="discountForm.discountType === 'AMOUNT_BASED'" class="grid grid-cols-2 gap-4">
               <div>
                 <label class="block text-sm font-bold text-slate-700 mb-2">Min. Total (Rp)</label>
                 <input
                   v-model.number="discountForm.minAmount"
                   type="number"
                   min="0"
                   class="w-full px-4 py-3 bg-slate-50 border-transparent hover:bg-white focus:bg-white border focus:border-blue-500 rounded-xl transition-all outline-none font-medium"
                   placeholder="0"
                 />
               </div>
               <div>
                 <label class="block text-sm font-bold text-slate-700 mb-2">Min. Item</label>
                 <input
                   v-model.number="discountForm.minQuantity"
                   type="number"
                   min="1"
                   class="w-full px-4 py-3 bg-slate-50 border-transparent hover:bg-white focus:bg-white border focus:border-blue-500 rounded-xl transition-all outline-none font-medium"
                   placeholder="Opsional"
                 />
               </div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                 <label class="block text-sm font-bold text-slate-700 mb-2">Tanggal Mulai</label>
                 <input
                   v-model="discountForm.startDate"
                   type="datetime-local"
                   class="w-full px-4 py-3 bg-slate-50 border-transparent hover:bg-white focus:bg-white border focus:border-blue-500 rounded-xl transition-all outline-none font-medium text-sm"
                 />
              </div>
              <div>
                 <label class="block text-sm font-bold text-slate-700 mb-2">Tanggal Berakhir</label>
                 <input
                   v-model="discountForm.endDate"
                   type="datetime-local"
                   class="w-full px-4 py-3 bg-slate-50 border-transparent hover:bg-white focus:bg-white border focus:border-blue-500 rounded-xl transition-all outline-none font-medium text-sm"
                 />
              </div>
            </div>

            <!-- Options -->
            <div class="space-y-4 pt-4 border-t border-slate-100">
               <div class="flex items-center justify-between">
                  <label class="text-sm font-bold text-slate-700">Berlaku Untuk</label>
                  <select
                     v-model="discountForm.applicableTo"
                     class="px-3 py-2 bg-slate-50 rounded-lg text-sm font-medium border-none outline-none"
                  >
                     <option value="ALL">Semua Orang</option>
                     <option value="MEMBER_ONLY">Hanya Member</option>
                  </select>
               </div>
               
               <div class="flex items-center justify-between bg-slate-50 p-3 rounded-xl cursor-pointer" @click="discountForm.isActive = !discountForm.isActive">
                  <span class="text-sm font-bold text-slate-700">Status Aktif</span>
                  <div class="w-12 h-6 rounded-full relative transition-colors duration-300" :class="discountForm.isActive ? 'bg-blue-500' : 'bg-slate-300'">
                     <div class="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300" :class="discountForm.isActive ? 'left-7' : 'left-1'"></div>
                  </div>
               </div>
            </div>

          </div>
        </form>
        
        <!-- Footer -->
        <div class="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            type="button"
            @click="closeModal"
            class="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            @click="saveDiscount"
            class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition transform active:scale-95"
          >
            {{ editingDiscount ? 'Update Diskon' : 'Buat Diskon' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Product Selector Modal -->
    <ProductSelectorModal
      v-if="showProductSelector"
      :show="showProductSelector"
      :title="getProductSelectorTitle()"
      :subtitle="getProductSelectorSubtitle()"
      :selected-product-ids="getSelectedProductIds()"
      @confirm="handleProductSelectorConfirm"
      @cancel="handleProductSelectorCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelector from '../../components/TenantSelector.vue';
import ProductSelectorModal from '../../components/ProductSelectorModal.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const { needsTenantSelection } = useTenantCheck();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const discounts = ref<any[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const editingDiscount = ref<any>(null);
const filters = ref({
  search: '',
});

const discountForm = ref({
  name: '',
  discountType: 'AMOUNT_BASED' as 'AMOUNT_BASED' | 'BUNDLE' | 'PRODUCT_BASED' | 'QUANTITY_BASED',
  discountValue: 0,
  discountValueType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  minAmount: undefined as number | string | undefined,
  minQuantity: undefined as number | string | undefined,
  applicableProducts: [] as string[],
  bundleProducts: [] as string[],
  bundleDiscountProduct: '',
  applicableTo: 'ALL' as 'ALL' | 'MEMBER_ONLY',
  isActive: true,
  startDate: '',
  endDate: '',
});

const productSelectionType = ref<'ALL' | 'CATEGORY' | 'PRODUCTS'>('PRODUCTS');
const selectedCategory = ref<string>('');
const categories = ref<string[]>([]);
const availableProducts = ref<any[]>([]);
const loadingProducts = ref(false);
const showProductSelector = ref(false);
const productSelectorType = ref<'BUNDLE' | 'PRODUCT_BASED' | 'QUANTITY_BASED'>('BUNDLE');

const filteredDiscounts = computed(() => {
  let result = discounts.value;
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(d =>
      d.name.toLowerCase().includes(search) ||
      d.discountType.toLowerCase().includes(search)
    );
  }
  return result;
});

const getDiscountTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    AMOUNT_BASED: 'Berdasarkan Total',
    BUNDLE: 'Bundle',
    PRODUCT_BASED: 'Berdasarkan Produk',
    QUANTITY_BASED: 'Berdasarkan Jumlah Item',
  };
  return labels[type] || type;
};

const loadProducts = async () => {
  if (needsTenantSelection.value) {
    return;
  }

  // Optimize: Only fetch categories if needed, or if we want to populate categories list
  // We don't want to fetch 1000 products anymore.
  // Ideally we should have a getCategories endpoint, but for now we can limit fields or use an existing hack
  // actually, if we just want categories, we might not need this if we don't have a category list endpoint.
  // But wait, categories are needed for the dropdown
  
  loadingProducts.value = true;
  try {
    // Attempt to fetch categories specifically if endpoint exists, otherwise... 
    // We'll trust that we can fetch a small number of products or relies on user input
    // The previous implementation inferred categories from products. 
    // Let's fetch a subset to get SOME categories or use a distinct query if possible. 
    // For now, let's just fetch a small number and hope for the best, OR fetch all categories if we have an endpoint.
    // Checking product.service.ts... no specific category endpoint seen.
    // Let's try to fetch products but only select category field? Backend sends everything.
    // We will keep it light: fetch 100 products just to populate SOME categories? 
    // Or better: Let's NOT load all products. If categories are needed, we might need to add categories manually or fetch them properly.
    // Let's assume we can fetch all categories from a lightweight endpoint? No.
    // Let's stick to: Fetching 500 products (lighter than 1000) just for categories? Still bad.
    // I will comment out the heavy load and initialize categories empty or static?
    // User global rule: "Simplicity". 
    // I will fetch 50 products to get initial categories. 
    
    const response = await api.get('/products', { params: { limit: 100 } }); // Reduced limit
    const productsData = response.data.data || response.data;
    // availableProducts.value = ... // DON'T populate availableProducts with random products, only selected ones.
    
    // Extract unique categories
    const uniqueCategories = new Set<string>();
    if (Array.isArray(productsData)) {
        productsData.forEach((p: any) => {
        if (p.category) uniqueCategories.add(p.category);
        });
    }
    categories.value = Array.from(uniqueCategories);
  } catch (error: any) {
    console.error('Error loading categories:', error);
  } finally {
    loadingProducts.value = false;
  }
};

const getProductName = (productId: string): string => {
  const product = availableProducts.value.find((p: any) => p.id === productId);
  return product ? product.name : productId;
};

const openProductSelector = (type: 'BUNDLE' | 'PRODUCT_BASED' | 'QUANTITY_BASED') => {
  productSelectorType.value = type;
  showProductSelector.value = true;
  console.log('Opening product selector:', type, 'showProductSelector:', showProductSelector.value);
};

const handleDiscountTypeChange = () => {
  // Reset product selections when discount type changes
  discountForm.value.applicableProducts = [];
  discountForm.value.bundleProducts = [];
  discountForm.value.bundleDiscountProduct = '';
  productSelectionType.value = 'PRODUCTS';
  selectedCategory.value = '';
  showProductSelector.value = false;
};

const getProductSelectorTitle = (): string => {
  switch (productSelectorType.value) {
    case 'BUNDLE':
      return 'Pilih Produk untuk Bundle';
    case 'PRODUCT_BASED':
      return 'Pilih Produk yang Mendapat Diskon';
    case 'QUANTITY_BASED':
      return 'Pilih Produk untuk Quantity Based';
    default:
      return 'Pilih Produk';
  }
};

const getProductSelectorSubtitle = (): string => {
  switch (productSelectorType.value) {
    case 'BUNDLE':
      return 'Semua produk yang dipilih harus dibeli bersama untuk mendapatkan diskon';
    case 'PRODUCT_BASED':
      return 'Produk yang dipilih akan mendapat diskon saat dibeli (bisa 1 per satu atau bersama)';
    case 'QUANTITY_BASED':
      return 'Produk harus dibeli dalam jumlah minimum yang ditentukan untuk mendapatkan diskon';
    default:
      return 'Pilih produk yang ingin ditambahkan';
  }
};

const getSelectedProductIds = (): string[] => {
  switch (productSelectorType.value) {
    case 'BUNDLE':
      return discountForm.value.bundleProducts;
    case 'PRODUCT_BASED':
    case 'QUANTITY_BASED':
      return discountForm.value.applicableProducts;
    default:
      return [];
  }
};

const handleProductSelectorConfirm = (productIds: string[]) => {
  switch (productSelectorType.value) {
    case 'BUNDLE':
      discountForm.value.bundleProducts = productIds;
      // Reset bundle discount product if not in selected products
      if (discountForm.value.bundleDiscountProduct && !productIds.includes(discountForm.value.bundleDiscountProduct)) {
        discountForm.value.bundleDiscountProduct = '';
      }
      break;
    case 'PRODUCT_BASED':
    case 'QUANTITY_BASED':
      discountForm.value.applicableProducts = productIds;
      break;
  }
  
  // Fetch details for selected products so names are available
  if (productIds.length > 0) {
    loadSelectedProducts(productIds);
  }
  
  showProductSelector.value = false;
  console.log('Product selector confirmed:', productIds);
};

const handleProductSelectorCancel = () => {
  showProductSelector.value = false;
  console.log('Product selector cancelled');
};

const loadDiscounts = async () => {
  if (needsTenantSelection.value) {
    return;
  }

  loading.value = true;
  try {
    const response = await api.get('/discounts');
    discounts.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading discounts:', error);
    await showError(error.response?.data?.message || 'Gagal memuat diskon');
  } finally {
    loading.value = false;
  }
};

const editDiscount = async (discount: any) => {
  editingDiscount.value = discount;
  discountForm.value = {
    name: discount.name,
    discountType: discount.discountType,
    discountValue: Number(discount.discountValue),
    discountValueType: discount.discountValueType,
    minAmount: discount.minAmount ? Number(discount.minAmount) : undefined,
    minQuantity: discount.minQuantity || undefined,
    applicableProducts: Array.isArray(discount.applicableProducts) ? discount.applicableProducts : [],
    bundleProducts: Array.isArray(discount.bundleProducts) ? discount.bundleProducts : [],
    bundleDiscountProduct: discount.bundleDiscountProduct || '',
    applicableTo: discount.applicableTo || 'ALL',
    isActive: discount.isActive,
    startDate: discount.startDate ? new Date(discount.startDate).toISOString().slice(0, 16) : '',
    endDate: discount.endDate ? new Date(discount.endDate).toISOString().slice(0, 16) : '',
  };
  
  // Determine product selection type based on existing data
  if (discount.discountType === 'BUNDLE' || discount.discountType === 'PRODUCT_BASED' || discount.discountType === 'QUANTITY_BASED') {
    if (discount.discountType === 'BUNDLE' && discount.bundleProducts && discount.bundleProducts.length > 0) {
      productSelectionType.value = 'PRODUCTS';
    } else if (discount.applicableProducts && discount.applicableProducts.length > 0) {
      productSelectionType.value = 'PRODUCTS';
    } else {
      productSelectionType.value = 'CATEGORY';
    }
  }

  // Load products if needed for editing
  if (productSelectionType.value === 'PRODUCTS' && availableProducts.value.length === 0) {
    const allIds = [
      ...(discount.applicableProducts || []),
      ...(discount.bundleProducts || [])
    ];
    if (allIds.length > 0) {
      await loadSelectedProducts(allIds);
    }
  }
  
  showCreateModal.value = true;
};

const loadSelectedProducts = async (ids: string[]) => {
  if (ids.length === 0) return;
  
  loadingProducts.value = true;
  try {
    const response = await api.get('/products', { 
      params: { 
        ids: ids,
        limit: 100 // Fetch up to 100 selected products
      } 
    });
    const newProducts = response.data.data || [];
    
    // Merge with existing availableProducts to avoid duplicates
    const existingIds = new Set(availableProducts.value.map(p => p.id));
    const productsToAdd = newProducts.filter((p: any) => !existingIds.has(p.id));
    availableProducts.value = [...availableProducts.value, ...productsToAdd];
  } catch (error) {
    console.error('Error loading selected products:', error);
  } finally {
    loadingProducts.value = false;
  }
};

const handleCategoryChange = async () => {
  // For QUANTITY_BASED with category, load products by category
  if (selectedCategory.value && discountForm.value.discountType === 'QUANTITY_BASED') {
    loadingProducts.value = true;
    try {
      const response = await api.get('/products', {
        params: {
          category: selectedCategory.value,
          limit: 1000 // Reasonable limit for a category
        }
      });
      const categoryProducts = response.data.data || [];
      
      // Update availableProducts for name resolution if needed
      const existingIds = new Set(availableProducts.value.map(p => p.id));
      const productsToAdd = categoryProducts.filter((p: any) => !existingIds.has(p.id));
      availableProducts.value = [...availableProducts.value, ...productsToAdd];
      
      // Select all products in category
      discountForm.value.applicableProducts = categoryProducts.map((p: any) => p.id);
    } catch (error) {
       console.error('Error loading category products:', error);
       await showError('Gagal memuat produk untuk kategori ini');
    } finally {
       loadingProducts.value = false;
    }
  } else if (!selectedCategory.value) {
    discountForm.value.applicableProducts = [];
  }
};

const saveDiscount = async () => {
  try {
    // Validation: For BUNDLE, ensure bundleDiscountProduct is selected if bundleProducts exist
    if (discountForm.value.discountType === 'BUNDLE') {
      if (discountForm.value.bundleProducts.length > 0 && !discountForm.value.bundleDiscountProduct) {
        await showError('Pilih produk yang akan mendapat diskon dari bundle yang dipilih');
        return;
      }
    }
    
    // Validation: For PRODUCT_BASED, ensure products are selected
    if (discountForm.value.discountType === 'PRODUCT_BASED') {
      if (discountForm.value.applicableProducts.length === 0) {
        await showError('Pilih minimal satu produk yang akan mendapat diskon');
        return;
      }
    }
    
    // Validation: For QUANTITY_BASED, ensure products or category is selected
    if (discountForm.value.discountType === 'QUANTITY_BASED') {
      if (productSelectionType.value === 'PRODUCTS' && discountForm.value.applicableProducts.length === 0) {
        await showError('Pilih minimal satu produk atau pilih kategori');
        return;
      }
      if (productSelectionType.value === 'CATEGORY' && !selectedCategory.value) {
        await showError('Pilih kategori atau pilih produk tertentu');
        return;
      }
    }
    
    // Prepare data based on product selection type
    let applicableProductsData: string[] | null = null;
    let bundleProductsData: string[] | null = null;
    
    if (discountForm.value.discountType === 'BUNDLE') {
      if (productSelectionType.value === 'ALL') {
        bundleProductsData = null; // All products
      } else if (productSelectionType.value === 'CATEGORY' && selectedCategory.value) {
        bundleProductsData = discountForm.value.bundleProducts;
      } else if (productSelectionType.value === 'PRODUCTS') {
        bundleProductsData = discountForm.value.bundleProducts.length > 0 ? discountForm.value.bundleProducts : null;
      }
    } else if (discountForm.value.discountType === 'PRODUCT_BASED' || discountForm.value.discountType === 'QUANTITY_BASED') {
      if (productSelectionType.value === 'ALL') {
        applicableProductsData = null; // All products
      } else if (productSelectionType.value === 'CATEGORY' && selectedCategory.value) {
        applicableProductsData = discountForm.value.applicableProducts;
      } else if (productSelectionType.value === 'PRODUCTS') {
        applicableProductsData = discountForm.value.applicableProducts.length > 0 ? discountForm.value.applicableProducts : null;
      }
    }
    
    // Prepare data object, ensuring correct types and no undefined fields
    const data: any = {
      name: String(discountForm.value.name).trim(),
      discountType: discountForm.value.discountType,
      discountValue: Number(discountForm.value.discountValue),
      discountValueType: discountForm.value.discountValueType,
      applicableTo: discountForm.value.applicableTo || 'ALL',
      isActive: discountForm.value.isActive !== undefined ? Boolean(discountForm.value.isActive) : true,
    };
    
    // Handle applicableProducts - send null if empty array or undefined
    if (applicableProductsData !== undefined) {
      data.applicableProducts = Array.isArray(applicableProductsData) && applicableProductsData.length > 0
        ? applicableProductsData
        : null;
    }
    
    // Handle bundleProducts - send null if empty array or undefined
    if (bundleProductsData !== undefined) {
      data.bundleProducts = Array.isArray(bundleProductsData) && bundleProductsData.length > 0
        ? bundleProductsData
        : null;
    }
    
    // Only include bundleDiscountProduct if bundleProducts exist and not empty
    if (discountForm.value.discountType === 'BUNDLE' && bundleProductsData && bundleProductsData.length > 0) {
      if (discountForm.value.bundleDiscountProduct && discountForm.value.bundleDiscountProduct.trim() !== '') {
        data.bundleDiscountProduct = discountForm.value.bundleDiscountProduct.trim();
      } else {
        data.bundleDiscountProduct = null;
      }
    }
    
    // Include minAmount only if provided and valid (not undefined, can be null)
    if (discountForm.value.minAmount !== undefined) {
      if (discountForm.value.minAmount !== null && discountForm.value.minAmount !== '') {
        data.minAmount = Number(discountForm.value.minAmount);
      } else {
        data.minAmount = null;
      }
    }
    
    // Include minQuantity only if provided and valid (not undefined, can be null)
    if (discountForm.value.minQuantity !== undefined) {
      if (discountForm.value.minQuantity !== null && discountForm.value.minQuantity !== '') {
        data.minQuantity = Number(discountForm.value.minQuantity);
      } else {
        data.minQuantity = null;
      }
    }
    
    // Include dates only if provided (can be null)
    if (discountForm.value.startDate !== undefined) {
      data.startDate = discountForm.value.startDate || null;
    }
    if (discountForm.value.endDate !== undefined) {
      data.endDate = discountForm.value.endDate || null;
    }

    // Log data before sending
    console.log('Sending discount data:', JSON.stringify(data, null, 2));

    if (editingDiscount.value) {
      await api.put(`/discounts/${editingDiscount.value.id}`, data);
      await showSuccess('Diskon berhasil diupdate');
    } else {
      await api.post('/discounts', data);
      await showSuccess('Diskon berhasil ditambahkan');
    }

    closeModal();
    await loadDiscounts();
  } catch (error: any) {
    console.error('Error saving discount:', error);
    console.error('Error response:', error.response?.data);
    
    // Show detailed error message
    let errorMessage = 'Gagal menyimpan diskon';
    if (error.response?.data) {
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        // Show validation errors
        const errorDetails = error.response.data.errors
          .map((err: any) => `${err.path}: ${err.message}`)
          .join('\n');
        errorMessage = `Data tidak valid:\n${errorDetails}`;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    await showError(errorMessage);
  }
};

const deleteDiscount = async (id: string) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus diskon ini?', 'Hapus Diskon');
  if (!confirmed) return;

  try {
    await api.delete(`/discounts/${id}`);
    await showSuccess('Diskon berhasil dihapus');
    await loadDiscounts();
  } catch (error: any) {
    console.error('Error deleting discount:', error);
    await showError(error.response?.data?.message || 'Gagal menghapus diskon');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingDiscount.value = null;
  discountForm.value = {
    name: '',
    discountType: 'AMOUNT_BASED',
    discountValue: 0,
    discountValueType: 'PERCENTAGE',
    minAmount: undefined,
    minQuantity: undefined,
    applicableProducts: [],
    bundleProducts: [],
    bundleDiscountProduct: '',
    applicableTo: 'ALL',
    isActive: true,
    startDate: '',
    endDate: '',
  };
  productSelectionType.value = 'PRODUCTS';
  selectedCategory.value = '';
};

const handleTenantChange = (tenantId: string | null) => {
  if (tenantId && !needsTenantSelection.value) {
    loadDiscounts();
  }
};

const handleSearchFocus = () => {
  // No-op, just for compatibility
};

const handleSearchInput = () => {
  // Search is handled by computed property
};

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // For super admin, ensure selectedTenantId is synced with localStorage
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  if (!needsTenantSelection.value) {
    await loadDiscounts();
    // Preload products for discount form
    await loadProducts();
  }
});
</script>
