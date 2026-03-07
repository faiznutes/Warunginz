<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h2 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Kepatuhan GDPR</h2>
      <p class="text-slate-500 dark:text-slate-400 font-medium">Kelola data pribadi Anda sesuai dengan peraturan GDPR.</p>
    </div>

    <div class="space-y-6">
      <!-- Data Export -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-sm">
            <span class="material-symbols-outlined text-[24px]">download</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Ekspor Data (Hak Portabilitas Data)</h3>
            <p class="text-sm font-medium text-slate-500">Unduh semua data pribadi Anda dalam format JSON.</p>
          </div>
        </div>
        <p class="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          Data ini mencakup semua informasi yang terkait dengan akun Anda. Anda berhak mendapatkan salinan data pribadi Anda dalam format yang terstruktur dan dapat dibaca mesin.
        </p>
        <button
          @click="exportData"
          :disabled="exporting"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm transform active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          <div v-if="exporting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span class="material-symbols-outlined text-[20px]" v-else>download</span>
          <span>{{ exporting ? 'Mengekspor...' : 'Ekspor Data Saya' }}</span>
        </button>
      </div>

      <!-- Data Deletion -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border-l-4 border-l-red-500 border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl shadow-sm">
            <span class="material-symbols-outlined text-[24px]">delete_forever</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Hapus Data (Hak untuk Dilupakan)</h3>
            <p class="text-sm font-medium text-slate-500">Hapus semua data pribadi Anda secara permanen.</p>
          </div>
        </div>
        
        <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-5 mb-6">
          <p class="text-sm text-red-800 dark:text-red-200 font-medium flex gap-2">
            <span class="material-symbols-outlined text-red-600 mt-0.5">warning</span>
            <span>
                <strong class="text-red-700 dark:text-red-100">Peringatan:</strong> Tindakan ini akan menghapus semua data pribadi Anda dan menonaktifkan akun Anda. Tindakan ini tidak dapat dibatalkan.
            </span>
          </p>
        </div>
        
        <div v-if="!showDeleteConfirm" class="space-y-4">
          <button
            @click="showDeleteConfirm = true"
            class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-md shadow-red-500/20"
          >
            <span class="material-symbols-outlined text-[20px]">delete_forever</span>
            Hapus Data Saya
          </button>
        </div>

        <div v-else class="space-y-6 animate-fade-in-up">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <p class="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Konfirmasi Penghapusan:
            </p>
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Ketik <strong class="text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30">DELETE_MY_DATA</strong> di bawah ini untuk konfirmasi penghapusan data Anda.
            </p>
            <input
              v-model="deleteConfirmText"
              type="text"
              placeholder="Ketik DELETE_MY_DATA"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-white transition-all"
            />
          </div>
          <div class="flex gap-4">
            <button
              @click="deleteData"
              :disabled="deleteConfirmText !== 'DELETE_MY_DATA' || deleting"
              class="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl transition-all font-bold text-sm shadow-lg shadow-red-500/30 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <div v-if="deleting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="material-symbols-outlined text-[20px]" v-else>delete_forever</span>
              {{ deleting ? 'Menghapus...' : 'Konfirmasi Hapus Data' }}
            </button>
            <button
              @click="showDeleteConfirm = false; deleteConfirmText = ''"
              class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all font-bold text-sm"
            >
              Batal
            </button>
          </div>
        </div>
      </div>

      <!-- Tenant Data Export (Admin Only) -->
      <div v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl shadow-sm">
            <span class="material-symbols-outlined text-[24px]">folder_zip</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Ekspor Data Tenant</h3>
            <p class="text-sm font-medium text-slate-500">Ekspor semua data tenant termasuk produk, pesanan, dan pelanggan.</p>
          </div>
        </div>
        <button
          @click="exportTenantData"
          :disabled="exportingTenant"
          class="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-purple-500/30 transition-all font-bold text-sm transform active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
        >
          <div v-if="exportingTenant" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span class="material-symbols-outlined text-[20px]" v-else>folder_zip</span>
          <span>{{ exportingTenant ? 'Mengekspor...' : 'Ekspor Data Tenant' }}</span>
        </button>
      </div>

      <!-- Info -->
      <div class="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
            <span class="material-symbols-outlined text-[24px]">info</span>
          </div>
          <h3 class="text-xl font-bold text-indigo-900 dark:text-indigo-100">Tentang GDPR</h3>
        </div>
        <ul class="space-y-4 text-sm font-medium text-indigo-800 dark:text-indigo-200">
          <li class="flex items-start gap-3 p-3 bg-white/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <span class="material-symbols-outlined text-indigo-600 text-[20px] shrink-0 mt-0.5">check_circle</span>
            <span><strong>Hak Portabilitas Data:</strong> Anda memiliki hak untuk mendapatkan salinan data pribadi Anda dalam format terstruktur yang dapat dibaca mesin.</span>
          </li>
          <li class="flex items-start gap-3 p-3 bg-white/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <span class="material-symbols-outlined text-indigo-600 text-[20px] shrink-0 mt-0.5">check_circle</span>
            <span><strong>Hak untuk Dilupakan:</strong> Anda memiliki hak untuk meminta penghapusan data pribadi Anda, dengan beberapa pengecualian untuk tujuan hukum atau bisnis yang sah.</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';

const { confirm, success, error } = useNotification();

const authStore = useAuthStore();

const exporting = ref(false);
const exportingTenant = ref(false);
const deleting = ref(false);
const showDeleteConfirm = ref(false);
const deleteConfirmText = ref('');

const exportData = async () => {
  exporting.value = true;
  try {
    const response = await api.get('/gdpr/export', {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `warungin-data-export-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    await success('Data berhasil diekspor', 'Sukses');
  } catch (err: any) {
    console.error('Error exporting data:', err);
    await error(err.response?.data?.message || 'Gagal mengekspor data', 'Error');
  } finally {
    exporting.value = false;
  }
};

const exportTenantData = async () => {
  exportingTenant.value = true;
  try {
    const response = await api.get('/gdpr/export-tenant', {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `warungin-tenant-export-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    await success('Data tenant berhasil diekspor', 'Sukses');
  } catch (err: any) {
    console.error('Error exporting tenant data:', err);
    await error(err.response?.data?.message || 'Gagal mengekspor data tenant', 'Error');
  } finally {
    exportingTenant.value = false;
  }
};

const deleteData = async () => {
  if (deleteConfirmText.value !== 'DELETE_MY_DATA') {
    return;
  }

  const confirmed = await confirm(
    'Apakah Anda yakin ingin menghapus semua data pribadi Anda? Tindakan ini tidak dapat dibatalkan dan akun Anda akan dinonaktifkan.',
    'Konfirmasi Hapus Data',
    'Ya, Hapus',
    'Batal'
  );
  
  if (!confirmed) return;

  deleting.value = true;
  try {
    await api.post('/gdpr/delete', {
      confirm: 'DELETE_MY_DATA',
    });

    await success('Data Anda telah dihapus. Anda akan dialihkan ke halaman login.', 'Data Dihapus');
    
    // Clear auth and redirect to login
    authStore.clearAuth();
    window.location.href = '/login';
  } catch (err: any) {
    console.error('Error deleting data:', err);
    await error(err.response?.data?.message || 'Gagal menghapus data', 'Error');
  } finally {
    deleting.value = false;
  }
};
</script>
