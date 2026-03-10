<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pengaturan Toko</h1>
      <p class="text-slate-500 dark:text-slate-400 font-medium">Kelola informasi dan pengaturan toko Anda.</p>
    </div>

    <!-- Store Information Card -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
      <div class="flex items-center gap-4 mb-8">
        <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-sm">
          <span class="material-symbols-outlined text-[24px]">store</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Informasi Toko</h3>
          <p class="text-sm font-medium text-slate-500">Detail identitas dan kontak toko</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Toko</label>
          <input
            v-model="storeInfo.name"
            type="text"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            placeholder="Masukkan nama toko"
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Telepon</label>
          <input
            v-model="storeInfo.phone"
            type="tel"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            placeholder="0812..."
          />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
          <input
            v-model="storeInfo.email"
            type="email"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            placeholder="email@toko.com"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alamat</label>
          <textarea
            v-model="storeInfo.address"
            rows="3"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white resize-none"
            placeholder="Alamat lengkap toko..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Feature Toggles Card -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
      <div class="flex items-center gap-4 mb-8">
        <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl shadow-sm">
          <span class="material-symbols-outlined text-[24px]">toggle_on</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white">Fitur Tambahan</h3>
          <p class="text-sm font-medium text-slate-500">Konfigurasi fitur operasional toko</p>
        </div>
      </div>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
          <div class="flex items-center gap-4">
            <div class="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400">
               <span class="material-symbols-outlined">touch_app</span>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-900 dark:text-white">Mode Kasir Simpel</label>
              <p class="text-xs text-slate-500 mt-0.5">Aktifkan mode kasir sederhana dengan tombol besar</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="features.simplePosMode"
              type="checkbox"
              class="sr-only peer"
              @change="updateFeatures"
            />
            <div class="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 dark:peer-focus:ring-blue-800/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div class="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
          <div class="flex items-center gap-4">
            <div class="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400">
               <span class="material-symbols-outlined">mail</span>
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-900 dark:text-white">Backup Email Harian</label>
              <p class="text-xs text-slate-500 mt-0.5">Kirim laporan harian secara otomatis via email</p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="features.email_backup_enabled"
              type="checkbox"
              class="sr-only peer"
              @change="updateFeatures"
            />
            <div class="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 dark:peer-focus:ring-blue-800/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Receipt Template Management Card -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-sm">
            <span class="material-symbols-outlined text-[24px]">receipt_long</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Template Struk</h3>
            <p class="text-sm font-medium text-slate-500">Kelola template struk untuk berbagai ukuran kertas</p>
          </div>
        </div>
        <button
          @click="showTemplateManager = true"
          class="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 px-5 py-2.5 rounded-xl transition-all font-bold text-sm border border-emerald-200 dark:border-blue-800"
        >
          <span class="material-symbols-outlined text-[20px]">settings</span>
          <span>Kelola Template</span>
        </button>
      </div>
      <div class="text-sm text-slate-500 space-y-2 pl-0 sm:pl-[72px]">
        <p class="flex items-center gap-2 font-medium"><span class="material-symbols-outlined text-[18px] text-blue-500">check_circle</span> Template untuk A4, Thermal 58mm, atau Thermal 80mm</p>
        <p class="flex items-center gap-2 font-medium"><span class="material-symbols-outlined text-[18px] text-blue-500">check_circle</span> Kustomisasi header, footer, dan kolom yang ditampilkan</p>
        <p class="flex items-center gap-2 font-medium"><span class="material-symbols-outlined text-[18px] text-blue-500">check_circle</span> Dukungan untuk pencetakan Browser, Thermal, dan Bluetooth</p>
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end pt-4">
      <button
        @click="saveSettings"
        :disabled="saving"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 font-bold disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <div v-if="saving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span class="material-symbols-outlined text-[20px]" v-else>save</span>
        <span>{{ saving ? 'Menyimpan...' : 'Simpan Pengaturan' }}</span>
      </button>
    </div>

    <!-- Receipt Template Manager -->
    <ReceiptTemplateManager
      :show="showTemplateManager"
      @close="showTemplateManager = false"
      @updated="loadSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';
import ReceiptTemplateManager from '../../components/ReceiptTemplateManager.vue';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const { success: showSuccess, error: showError } = useNotification();

const storeInfo = ref({
  name: '',
  address: '',
  phone: '',
  email: '',
});

const receiptSettings = ref({
  header: '',
  footer: '',
});
const showTemplateManager = ref(false);
const features = ref({
  simplePosMode: false,
  email_backup_enabled: true,
});
const saving = ref(false);

const loadSettings = async () => {
  if (!authStore.isAuthenticated) return;
  
  try {
    const response = await api.get('/tenant/profile');
    storeInfo.value = {
      name: response.data.name || '',
      address: response.data.address || '',
      phone: response.data.phone || '',
      email: response.data.email || '',
    };
    receiptSettings.value = {
      header: response.data.receiptHeader || '',
      footer: response.data.receiptFooter || '',
    };
    
    // Load features
    const tenantFeatures = response.data.features || {};
    features.value = {
      simplePosMode: tenantFeatures.simplePosMode === true,
      email_backup_enabled: tenantFeatures.email_backup_enabled !== false, // Default true
    };
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return;
    }
    console.error('Error loading settings:', error);
    if (authStore.isAuthenticated && error.response?.status !== 404) {
      await showError('Gagal memuat pengaturan toko');
    }
  }
};

const updateFeatures = async () => {
  if (!authStore.isAuthenticated) return;
  
  try {
    await api.put('/tenant/profile', {
      features: features.value,
    });
    await showSuccess('Fitur berhasil diperbarui');
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return;
    }
    console.error('Error updating features:', error);
    const errorMessage = error.response?.data?.message || 'Gagal memperbarui fitur';
    await showError(errorMessage);
    await loadSettings();
  }
};

const saveSettings = async () => {
  if (!authStore.isAuthenticated) return;
  saving.value = true;
  
  try {
    await api.put('/tenant/profile', {
      ...storeInfo.value,
      receiptHeader: receiptSettings.value.header,
      receiptFooter: receiptSettings.value.footer,
      features: features.value,
    });
    await showSuccess('Pengaturan berhasil disimpan');
    await loadSettings();
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return;
    }
    console.error('Error saving settings:', error);
    const errorMessage = error.response?.data?.message || 'Gagal menyimpan pengaturan';
    await showError(errorMessage);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadSettings();
});
</script>
