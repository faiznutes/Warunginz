<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-scale-in border border-slate-100 dark:border-slate-700">
      <div class="p-6 md:p-8">
        <div class="flex items-center justify-between mb-8">
          <div>
              <h3 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {{ editingProduct ? 'Edit Produk' : 'Tambah Produk Baru' }}
              </h3>
              <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">Lengkapi informasi produk di bawah ini</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
          >
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit(false)" class="space-y-6">
          <div class="space-y-4">
             <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nama Produk <span class="text-red-500">*</span></label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white font-medium transition-all placeholder:text-slate-400"
                  placeholder="Contoh: Nasi Goreng Spesial"
                />
             </div>

             <div>
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Deskripsi</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white font-medium transition-all placeholder:text-slate-400 resize-none"
                  placeholder="Deskripsi singkat produk..."
                ></textarea>
             </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Harga Jual <span class="text-red-500">*</span></label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                <input
                  v-model.number="form.price"
                  type="number"
                  required
                  min="0"
                  step="100"
                  class="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Harga Pokok (HPP) <span class="text-red-500">*</span></label>
              <div class="relative mb-1">
                 <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                 <input
                  v-model.number="form.cost"
                  type="number"
                  min="0"
                  step="100"
                  class="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-lg transition-all"
                  placeholder="0"
                  @input="loadPriceSuggestions"
                />
              </div>
              <p class="text-[10px] text-slate-400 font-medium">Diperlukan untuk hitung margin</p>
            </div>
          </div>

          <!-- Price Suggestions -->
          <div v-if="priceSuggestions && form.cost && form.cost > 0" class="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-5 shadow-inner">
            <h4 class="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px] text-indigo-500">lightbulb</span>
              Rekomendasi Harga Jual
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" @click="applyPrice(priceSuggestions.suggestedPrice20)">
                <div>
                  <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Margin 20%</p>
                  <p class="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{{ formatCurrency(priceSuggestions.suggestedPrice20) }}</p>
                </div>
                <span class="material-symbols-outlined text-indigo-300 group-hover:text-indigo-600">add_circle</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" @click="applyPrice(priceSuggestions.suggestedPrice30)">
                 <div>
                  <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Margin 30%</p>
                  <p class="text-lg font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{{ formatCurrency(priceSuggestions.suggestedPrice30) }}</p>
                </div>
                <span class="material-symbols-outlined text-indigo-300 group-hover:text-indigo-600">add_circle</span>
              </div>
              <div v-if="priceSuggestions.marketPrice" class="col-span-1 sm:col-span-2 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-emerald-200/50 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-shadow group cursor-pointer" @click="applyPrice(priceSuggestions.marketPrice!)">
                <div class="flex flex-col">
                  <p class="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Harga Pasaran</p>
                  <p class="text-lg font-black text-blue-700 dark:text-blue-400">{{ formatCurrency(priceSuggestions.marketPrice) }}</p>
                </div>
                 <span class="material-symbols-outlined text-blue-400 group-hover:text-blue-600">check_circle</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kategori</label>
              <input
                v-model="form.category"
                type="text"
                class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white font-medium transition-all"
                placeholder="Contoh: Makanan, Minuman"
                @blur="generateSkuSuggestion"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                SKU (Kode Produk)
                <button
                  v-if="!form.sku"
                  type="button"
                  @click="generateSkuSuggestion"
                  class="ml-2 text-[10px] text-blue-600 hover:text-blue-700 font-normal underline"
                  title="Generate SKU otomatis"
                >
                  Auto-generate
                </button>
              </label>
              <div class="relative">
                <input
                  v-model="form.sku"
                  type="text"
                  class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white font-medium transition-all"
                  placeholder="Kode unik produk (opsional)"
                  maxlength="50"
                />
                <button
                  v-if="form.sku"
                  type="button"
                  @click="generateSkuSuggestion"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700 transition-colors"
                  title="Generate ulang SKU"
                >
                  <span class="material-symbols-outlined text-[18px]">refresh</span>
                </button>
              </div>
              <p v-if="form.sku" class="text-[10px] text-slate-400 mt-1">SKU: {{ form.sku }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Jenis Produk</label>
              <div class="flex items-center h-12 px-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-white transition-colors cursor-pointer" @click="form.isConsignment = !form.isConsignment">
                <input
                  v-model="form.isConsignment"
                  type="checkbox"
                  id="isConsignment"
                  class="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label for="isConsignment" class="ml-3 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                  Produk Titipan (Consignment)
                </label>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Stok Awal <span class="text-red-500">*</span></label>
              <input
                v-model.number="form.stock"
                type="number"
                required
                min="0"
                class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white font-bold transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Stok Minimum</label>
              <input
                v-model.number="form.minStock"
                type="number"
                min="0"
                class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white font-bold transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Gambar / Emoji</label>
            
            <!-- Type Selection -->
            <div class="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4 max-w-sm">
              <button
                type="button"
                @click="imageType = 'image'"
                class="flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                :class="imageType === 'image' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'"
              >
                📷 Gambar
              </button>
              <button
                type="button"
                @click="imageType = 'emoji'"
                class="flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                :class="imageType === 'emoji' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'"
              >
                😀 Emoji
              </button>
            </div>

            <!-- Image Type -->
            <div v-if="imageType === 'image'" class="animate-fade-in">
              <!-- Image Preview -->
              <div v-if="form.image" class="mb-4">
                <div class="relative inline-block w-40 h-40 group">
                  <img
                    :src="form.image"
                    alt="Product preview"
                    class="w-full h-full object-cover rounded-2xl border-2 border-slate-200 shadow-sm"
                  />
                  <div class="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <button
                    type="button"
                    @click="form.image = ''"
                    class="absolute -top-3 -right-3 bg-white text-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition shadow-md border border-red-100"
                  >
                    <span class="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              <!-- Drag & Drop Zone -->
              <div
                v-if="!form.image"
                ref="dropZone"
                @drop.prevent="handleDrop"
                @dragover.prevent="isDragging = true"
                @dragenter.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                :class="[
                  'border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer',
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 scale-[1.02]'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/5'
                ]"
                @click="openFileInput"
              >
                <div class="flex flex-col items-center gap-3">
                  <span class="material-symbols-outlined text-5xl" :class="isDragging ? 'text-blue-500' : 'text-slate-400'">
                    {{ isDragging ? 'cloud_upload' : 'image' }}
                  </span>
                  <div>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {{ isDragging ? 'Lepaskan untuk mengunggah' : 'Seret & lepas gambar di sini' }}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      atau klik untuk memilih dari galeri
                    </p>
                  </div>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Format: JPG, PNG, WebP (Maks. 5MB)
                  </p>
                </div>
              </div>

              <!-- Action Buttons (shown when image exists) -->
              <div v-if="form.image" class="flex flex-col sm:flex-row gap-3 mb-2">
                <button
                  type="button"
                  @click="openFileInput"
                  class="flex-1 px-5 py-3 bg-blue-50 text-blue-700 border border-emerald-200 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 font-bold"
                >
                  <span class="material-symbols-outlined text-[20px]">image</span>
                  <span>Ganti Gambar</span>
                </button>
                <button
                  type="button"
                  @click="openUrlInput"
                  class="flex-1 px-5 py-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2 font-bold"
                >
                   <span class="material-symbols-outlined text-[20px]">link</span>
                  <span>Gunakan URL</span>
                </button>
              </div>

              <!-- URL Input (hidden by default) -->
              <div v-if="showUrlInput" class="mt-3 animate-fade-in-up">
                <div class="relative">
                     <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">link</span>
                    <input
                      v-model="form.image"
                      type="url"
                      class="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
                      placeholder="https://example.com/image.jpg"
                      @blur="showUrlInput = false"
                    />
                </div>
              </div>

              <!-- Hidden File Input -->
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
            </div>

            <!-- Emoji Type -->
            <div v-else class="animate-fade-in">
              <!-- Emoji Preview -->
              <div v-if="form.emoji" class="mb-4 text-center sm:text-left">
                <div class="relative inline-block">
                  <div class="w-32 h-32 bg-slate-50 rounded-2xl border-2 border-slate-200 flex items-center justify-center">
                    <span class="text-6xl filter drop-shadow-sm">{{ form.emoji }}</span>
                  </div>
                  <button
                    type="button"
                    @click="form.emoji = ''"
                    class="absolute -top-3 -right-3 bg-white text-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition shadow-md border border-red-100"
                  >
                    <span class="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              <!-- Emoji Picker -->
              <div class="mb-4">
                <input
                  v-model="form.emoji"
                  type="text"
                  maxlength="2"
                  class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 text-4xl text-center font-bold placeholder:text-lg placeholder:font-normal placeholder:text-slate-400"
                  placeholder="Ketik 1 Emoji Disini..."
                />
              </div>

              <!-- Popular Emojis -->
              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Emoji Populer</p>
                <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                  <button
                    v-for="emoji in popularEmojis"
                    :key="emoji"
                    type="button"
                    @click="form.emoji = emoji"
                    class="w-10 h-10 text-2xl hover:bg-white hover:shadow-sm rounded-xl transition-all flex items-center justify-center border border-transparent hover:border-slate-200"
                    :class="{ 'bg-blue-100 border-emerald-300 ring-2 ring-blue-500/20': form.emoji === emoji }"
                  >
                    {{ emoji }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center pt-2">
            <div class="flex items-center h-12 px-4 rounded-xl bg-slate-50 w-full hover:bg-slate-100 transition-colors cursor-pointer" @click="form.isActive = !form.isActive">
                <div class="relative flex items-center">
                    <input
                      v-model="form.isActive"
                      type="checkbox"
                      id="isActive"
                      class="peer sr-only"
                    />
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </div>
                <label for="isActive" class="ml-3 text-sm font-bold text-slate-700 cursor-pointer select-none">
                  Produk Aktif
                </label>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-slate-100 dark:border-slate-700 mt-8">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-5 py-3.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm"
            >
              Batal
            </button>
            <button
              v-if="!editingProduct"
              type="button"
              :disabled="saving"
              @click="handleSubmit(true)"
              class="flex-1 px-5 py-3.5 bg-white text-blue-600 border border-emerald-200 font-bold rounded-xl hover:bg-blue-50 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[20px]">playlist_add</span>
              Simpan & Input Lagi
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="flex-1 px-5 py-3.5 bg-gradient-to-r from-blue-500 to-green-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-green-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <div v-if="saving" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {{ saving ? 'Menyimpan...' : (editingProduct ? 'Simpan Perubahan' : 'Simpan Produk') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Image Cropper Modal -->
    <ImageCropperModal
      :show="showCropper"
      :image-src="selectedImageSrc"
      @close="showCropper = false"
      @cropped="handleImageCropped"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import ImageCropperModal from './ImageCropperModal.vue';
import { useNotification } from '../composables/useNotification';
import api from '../api';
import { formatCurrency } from '../utils/formatters';

const { error: showError } = useNotification();

interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  category?: string;
  sku?: string;
  image?: string;
  emoji?: string;
  isActive: boolean;
  isConsignment?: boolean;
}

interface Props {
  show: boolean;
  product?: Product | null;
}

const props = withDefaults(defineProps<Props>(), {
  product: null,
});

const emit = defineEmits<{
  close: [];
  save: [product: Partial<Product>, keepOpen?: boolean];
}>();

const form = ref<Partial<Product>>({
  name: '',
  description: '',
  price: 0,
  cost: undefined,
  stock: 0,
  minStock: 0,
  category: '',
  sku: '',
  image: '',
  emoji: '',
  isActive: true,
  isConsignment: false,
});

// Auto-save logic
import { useAutoSave } from '../composables/useAutoSave';
const { loadDraft, clearDraft, hasDraft } = useAutoSave('draft_new_product', form.value, !props.product);

// Ask to restore draft on mount if not editing
onMounted(() => {
  if (!props.product && hasDraft.value) {
    if (confirm('Ditemukan draft produk yang belum tersimpan. Pulihkan?')) {
      loadDraft();
    } else {
      clearDraft();
    }
  }
});

const saving = ref(false);
const editingProduct = computed(() => !!props.product);
const fileInput = ref<HTMLInputElement | null>(null);
const dropZone = ref<HTMLDivElement | null>(null);
const isDragging = ref(false);
const showUrlInput = ref(false);
const showCropper = ref(false);
const selectedImageSrc = ref('');
const imageType = ref<'image' | 'emoji'>('image');
const priceSuggestions = ref<{
  suggestedPrice20: number;
  suggestedPrice30: number;
  marketPrice?: number;
  cost: number;
} | null>(null);
const loadingSuggestions = ref(false);

const popularEmojis = [
  '🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚',
  '🍳', '🥞', '🧇', '🥨', '🥯', '🥐', '🍞', '🥖',
  '🥨', '🧀', '🥗', '🥙', '🥪', '🌮', '🌯', '🥫',
  '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪',
  '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢',
  '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂',
  '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰',
  '🥜', '☕', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺',
  '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾',
];

watch(() => props.product, (newProduct) => {
  if (newProduct) {
    form.value = {
      name: newProduct.name || '',
      description: newProduct.description || '',
      price: typeof newProduct.price === 'string' ? parseFloat(newProduct.price) : newProduct.price || 0,
      cost: typeof (newProduct as any).cost === 'string' ? parseFloat((newProduct as any).cost) : (newProduct as any).cost || undefined,
      sku: (newProduct as any).sku || '',
      stock: newProduct.stock || 0,
      minStock: newProduct.minStock || 0,
      category: newProduct.category || '',
      image: newProduct.image || '',
      emoji: newProduct.emoji || '',
      isActive: newProduct.isActive !== false,
      isConsignment: (newProduct as any).isConsignment || false,
    };
    // Set image type based on what exists
    imageType.value = newProduct.emoji ? 'emoji' : 'image';
    // Load price suggestions if cost exists
    if (form.value.cost && form.value.cost > 0) {
      loadPriceSuggestions();
    }
  } else {
    form.value = {
      name: '',
      description: '',
      price: 0,
      cost: undefined,
      stock: 0,
      minStock: 0,
      category: '',
      sku: '',
      image: '',
      emoji: '',
      isActive: true,
      isConsignment: false,
    };
    imageType.value = 'image';
  }
}, { immediate: true });

// Watch name changes to auto-generate SKU (only for new products)
watch(() => form.value.name, () => {
  if (!editingProduct.value && !form.value.sku && form.value.name && form.value.name.length >= 3) {
    generateSkuSuggestion();
  }
});

const resetForm = () => {
    form.value = {
      name: '',
      description: '',
      price: 0,
      cost: undefined,
      stock: 0,
      minStock: 0,
      category: '',
      sku: '',
      image: '',
      emoji: '',
      isActive: true,
      isConsignment: false,
    };
    imageType.value = 'image';
    priceSuggestions.value = null;
};

defineExpose({ resetForm });

watch(() => props.show, (newShow) => {
  if (!newShow) {
    // Reset form when modal closes
    resetForm();
  }
});

watch(() => imageType.value, (newType) => {
  // Clear the other type when switching
  if (newType === 'image') {
    form.value.emoji = '';
  } else if (newType === 'emoji') {
    form.value.image = '';
  }
});

// Watch emoji changes to ensure it's saved
watch(() => form.value.emoji, (newEmoji) => {
  if (newEmoji && imageType.value === 'emoji') {
    // Ensure image is cleared when emoji is set
    form.value.image = '';
  }
});

// Watch category changes to reload price suggestions
watch(() => form.value.category, () => {
  if (form.value.cost && form.value.cost > 0) {
    loadPriceSuggestions();
  }
});

const openFileInput = () => {
  fileInput.value?.click();
};

const openUrlInput = () => {
  showUrlInput.value = true;
};

const processFile = async (file: File) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    await showError('File harus berupa gambar');
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    await showError('Ukuran file maksimal 5MB');
    return;
  }

  // Read file as data URL
  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    selectedImageSrc.value = result;
    showCropper.value = true;
  };
  reader.readAsDataURL(file);
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  await processFile(file);

  // Reset input
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (!file) return;
  await processFile(file);
};

const handleImageCropped = (imageDataUrl: string) => {
  form.value.image = imageDataUrl;
  form.value.emoji = ''; // Clear emoji when image is set
  showCropper.value = false;
  selectedImageSrc.value = '';
};

const loadPriceSuggestions = async () => {
  if (!form.value.cost || form.value.cost <= 0) {
    priceSuggestions.value = null;
    return;
  }

  // Debounce: wait 500ms after user stops typing
  if ((window as any).priceSuggestionTimeout) {
    clearTimeout((window as any).priceSuggestionTimeout);
  }

  (window as any).priceSuggestionTimeout = setTimeout(async () => {
    loadingSuggestions.value = true;
    try {
      const params: any = { cost: form.value.cost };
      if (form.value.category) {
        params.category = form.value.category;
      }
      
      const response = await api.get('/product/price-suggestion/by-cost', { params });
      priceSuggestions.value = response.data;
    } catch (error: any) {
      console.error('Error loading price suggestions:', error);
      priceSuggestions.value = null;
    } finally {
      loadingSuggestions.value = false;
    }
  }, 500);
};

const applyPrice = (price: number) => {
  form.value.price = Math.round(price);
};

const generateSkuSuggestion = () => {
  if (!form.value.name) return;
  
  // Generate SKU from product name and category
  const name = form.value.name.trim();
  const category = form.value.category?.trim() || '';
  
  // Take first 3 letters of category (if exists) + first 3 letters of name + random 3 digits
  let sku = '';
  
  if (category) {
    const catPrefix = category
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase();
    sku += catPrefix + '-';
  }
  
  const namePrefix = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 3)
    .toUpperCase();
  sku += namePrefix;
  
  // Add 3 random digits
  const randomDigits = Math.floor(100 + Math.random() * 900);
  sku += '-' + randomDigits;
  
  form.value.sku = sku;
};

const handleSubmit = (keepOpen = false) => {
  saving.value = true;
  
  // Prepare data - ensure emoji/image are properly set based on type
  const submitData = { ...form.value };
  
  // If emoji type is selected, clear image
  if (imageType.value === 'emoji') {
    submitData.image = '';
  }
  // If image type is selected, clear emoji
  if (imageType.value === 'image') {
    submitData.emoji = '';
  }
  
  emit('save', submitData, keepOpen);
  
  // Clear draft on successful submit
  if (!props.product) {
    clearDraft();
  }

  setTimeout(() => {
    saving.value = false;
  }, 500);
};
</script>


