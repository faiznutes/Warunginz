<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Manajemen Backup</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1 font-medium">Monitor dan kelola cadangan data harian untuk seluruh tenant ekosistem.</p>
      </div>
      <div class="flex items-center gap-3">
         <div class="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-2">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span class="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Auto-Backup Aktif</span>
         </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-3 mb-6">
         <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
           <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">filter_list</span>
         </div>
         <h3 class="font-black text-slate-900 dark:text-white text-lg">Filter Data Backup</h3>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Pilih Tenant</label>
          <div class="relative group">
             <select
               v-model="filters.tenantId"
               class="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white appearance-none cursor-pointer group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm"
             >
               <option value="">Semua Tenant</option>
               <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id">
                 {{ tenant.name }}
               </option>
             </select>
             <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                <span class="material-symbols-outlined">expand_more</span>
             </div>
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Status Backup</label>
          <div class="relative group">
             <select
               v-model="filters.status"
               class="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white appearance-none cursor-pointer group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors shadow-sm"
             >
               <option value="">Semua Status</option>
               <option value="success">Berhasil</option>
               <option value="failed">Gagal</option>
               <option value="email_failed">Gagal Kirim Email</option>
             </select>
             <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
                <span class="material-symbols-outlined">expand_more</span>
             </div>
          </div>
        </div>
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Dari Tanggal</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
          />
        </div>
        <div>
          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Sampai Tanggal</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
          />
        </div>
      </div>
      <div class="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
        <button
          @click="resetFilters"
          class="px-6 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-sm font-bold transition-all hover:shadow-sm"
        >
          Reset
        </button>
        <button
          @click="loadBackups"
          class="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <span class="material-symbols-outlined text-[20px]">search</span>
          Terapkan Filter
        </button>
      </div>
    </div>

    <!-- Backup Logs Table -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-0 animate-fade-in-up">
      <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
        <div class="flex items-center gap-3">
           <span class="material-symbols-outlined text-slate-400">history</span>
           <h2 class="text-lg font-black text-slate-900 dark:text-white">Riwayat Backup</h2>
        </div>
        <button
          @click="loadBackups"
          class="p-2.5 text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-all"
          title="Refresh Data"
        >
          <span class="material-symbols-outlined text-[20px]">refresh</span>
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-24">
         <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
         <div class="text-slate-500 font-bold text-sm animate-pulse">Memuat data backup...</div>
      </div>

      <div v-else-if="backupLogs.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
        <div class="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-full mb-4">
            <span class="material-symbols-outlined text-slate-300 text-4xl">backup_table</span>
        </div>
        <p class="text-slate-900 dark:text-white font-black text-lg">Tidak ada log backup ditemukan</p>
        <p class="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Coba sesuaikan filter pencarian atau pastikan scheduler backup berjalan.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="px-6 py-4">Tenant</th>
              <th class="px-6 py-4">Waktu Backup</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Email Terkirim</th>
              <th class="px-6 py-4">Ukuran</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr
              v-for="log in backupLogs"
              :key="log.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
              :class="{
                'bg-red-50/30 dark:bg-red-900/10': criticalTenants.has(log.tenantId) || (log.status === 'failed' && !criticalTenants.has(log.tenantId)),
                'bg-amber-50/30 dark:bg-amber-900/10': log.status === 'email_failed' && !criticalTenants.has(log.tenantId),
              }"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                    {{ log.tenant.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="text-sm font-bold text-slate-900 dark:text-white">{{ log.tenant.name }}</div>
                    <div class="text-xs text-slate-500 font-mono mt-0.5">{{ log.tenant.email }}</div>
                  </div>
                  <span
                    v-if="criticalTenants.has(log.tenantId)"
                    class="px-2 py-0.5 text-[10px] font-black rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-center gap-1 ml-2 animate-pulse"
                    title="Backup gagal 3+ hari berturut-turut"
                  >
                    <span class="material-symbols-outlined text-[12px]">warning</span>
                    KRITIS
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-sm">
                {{ formatDate(log.generatedAt) }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm"
                  :class="[
                    log.status === 'success' ? 'bg-blue-50 text-blue-700 border-emerald-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                    log.status === 'email_failed' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' :
                    'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                  ]"
                >
                  <span class="size-1.5 rounded-full" :class="log.status === 'success' ? 'bg-blue-500' : log.status === 'email_failed' ? 'bg-amber-500' : 'bg-red-500'"></span>
                  {{ log.status === 'success' ? 'Berhasil' : log.status === 'email_failed' ? 'Gagal Email' : 'Gagal' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                <div v-if="log.emailSentAt" class="flex items-center gap-1.5">
                   <span class="material-symbols-outlined text-[16px] text-blue-500">mark_email_read</span>
                   {{ formatDate(log.emailSentAt) }}
                </div>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="px-6 py-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                {{ formatFileSize(log.size || 0) }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="viewBackup(log.id)"
                    class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    title="Lihat Detail"
                  >
                    <span class="material-symbols-outlined text-[18px]">visibility</span>
                  </button>
                  <button
                    @click="downloadBackup(log.id)"
                    class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    title="Download File"
                  >
                    <span class="material-symbols-outlined text-[18px]">download</span>
                  </button>
                  <button
                    v-if="log.status === 'email_failed' || !log.emailSentAt"
                    @click="resendEmail(log.id)"
                    class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                    title="Kirim Ulang Email"
                  >
                   <span class="material-symbols-outlined text-[18px]">send</span>
                  </button>
                  <button
                    @click="regenerateBackup(log.tenantId)"
                    class="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-violet-100"
                    title="Backup Ulang Manual"
                  >
                    <span class="material-symbols-outlined text-[18px]">autorenew</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
        <div class="text-xs font-bold text-slate-500">
          Menampilkan <span class="text-slate-900 dark:text-white">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> - <span class="text-slate-900 dark:text-white">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> dari <span class="text-slate-900 dark:text-white">{{ pagination.total }}</span> entries
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-300 shadow-sm"
          >
            Sebelumnya
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-300 shadow-sm"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>

    <!-- View Backup Modal -->
    <Teleport to="body">
      <div
        v-if="showViewModal"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="showViewModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-slate-200 dark:border-slate-700">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <div class="flex items-center gap-4">
               <div class="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">description</span>
               </div>
               <div>
                  <h3 class="text-lg font-black text-slate-900 dark:text-white">Detail Isi Backup</h3>
                  <p class="text-xs text-slate-500 font-bold">Pratinjau konten arsip data tenant.</p>
               </div>
            </div>
            <button
              @click="showViewModal = false"
              class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <span class="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
          <div class="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/50 p-8 custom-scrollbar">
            <div v-if="viewingBackup" class="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
               <div class="prose max-w-none text-sm font-mono whitespace-pre-wrap text-slate-600 dark:text-slate-300 leading-relaxed" v-html="viewingBackup"></div>
            </div>
            <div v-else class="flex flex-col items-center justify-center h-full text-slate-400">
               <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
               <p class="font-bold text-sm">Sedang mendekripsi dan memuat konten backup...</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const loading = ref(true);
const backupLogs = ref<any[]>([]);
const tenants = ref<any[]>([]);
const criticalTenants = ref<Set<string>>(new Set());
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const filters = ref({
  tenantId: '',
  status: '',
  startDate: '',
  endDate: '',
});

const showViewModal = ref(false);
const viewingBackup = ref<string | null>(null);

const loadTenants = async () => {
  try {
    const response = await api.get('/tenants', { 
      params: { limit: 1000 },
      timeout: 5000, 
    });
    tenants.value = response.data?.data || [];
  } catch (error: any) {
    console.error('Error loading tenants:', error);
    tenants.value = []; 
  }
};

const loadCriticalTenants = async () => {
  try {
    const response = await api.get('/superadmin/backups/critical', {
      timeout: 5000,
    });
    const critical = response.data?.criticalTenants || [];
    criticalTenants.value = new Set(critical.map((t: any) => t.tenantId));
    
    if (critical.length > 0) {
      showError(
        `⚠️ Peringatan: ${critical.length} tenant memiliki backup gagal 3+ hari berturut-turut!`,
        'Tenant Bermasalah'
      );
    }
  } catch (error: any) {
    console.error('Error loading critical tenants:', error);
    criticalTenants.value = new Set();
  }
};

const loadBackups = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    if (filters.value.tenantId) params.tenantId = filters.value.tenantId;
    if (filters.value.status) params.status = filters.value.status;
    if (filters.value.startDate) params.startDate = filters.value.startDate;
    if (filters.value.endDate) params.endDate = filters.value.endDate;

    const response = await api.get('/superadmin/backups', { 
      params,
      timeout: 10000, 
    });
    
    if (response.data && response.data.data) {
      backupLogs.value = response.data.data || [];
      pagination.value = response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };
    } else {
      backupLogs.value = [];
      pagination.value = { page: 1, limit: 20, total: 0, totalPages: 0 };
    }
  } catch (error: any) {
    console.error('Error loading backups:', error);
    const errorCode = error.response?.data?.error || '';
    
    if (errorCode === 'DATABASE_CONNECTION_ERROR') {
      await showError('Koneksi database gagal. Silakan coba lagi nanti.', 'Koneksi Error');
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      await showError('Request timeout. Silakan coba lagi.', 'Timeout');
    } else if (error.response?.status !== 404) {
      // Don't show generic error immediately for empty lists, let state handle it
    }
    
    backupLogs.value = [];
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = { tenantId: '', status: '', startDate: '', endDate: '' };
  pagination.value.page = 1;
  loadBackups();
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadBackups();
};

const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const viewBackup = async (backupId: string) => {
  try {
    showViewModal.value = true;
    viewingBackup.value = null;
    const response = await api.get(`/superadmin/backups/${backupId}/view`, {
      responseType: 'text',
    });
    if (response.data) {
      viewingBackup.value = response.data;
    } else {
      throw new Error('Konten backup kosong');
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal memuat konten backup';
    await showError(errorMessage);
    showViewModal.value = false;
    viewingBackup.value = null;
  }
};

const downloadBackup = async (backupId: string) => {
  try {
    const response = await api.get(`/superadmin/backups/${backupId}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${backupId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showSuccess('Backup berhasil diunduh');
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal mengunduh backup');
  }
};

const resendEmail = async (backupId: string) => {
  const confirmed = await showConfirm(
    'Kirim Ulang Email',
    'Apakah Anda yakin ingin mengirim ulang email backup ini?',
    'Kirim',
    'Batal'
  );

  if (!confirmed) return;

  try {
    await api.post(`/superadmin/backups/${backupId}/resend-email`);
    showSuccess('Email backup berhasil dikirim ulang');
    await loadBackups();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal mengirim ulang email');
  }
};

const regenerateBackup = async (tenantId: string) => {
  const confirmed = await showConfirm(
    'Backup Ulang',
    'Apakah Anda yakin ingin membuat ulang backup untuk tenant ini secara manual?',
    'Buat Backup',
    'Batal'
  );

  if (!confirmed) return;

  try {
    await api.post(`/superadmin/backups/${tenantId}/regenerate`);
    showSuccess('Proses backup manual dimulai dalam background job');
    // Tidak reload langsung karena async job
    setTimeout(() => loadBackups(), 2000); 
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal memicu backup ulang');
  }
};

onMounted(async () => {
  loadTenants().catch(console.error);
  loadBackups().catch(console.error);
  loadCriticalTenants().catch(console.error);
});
</script>

<style scoped>
/* No specific styles needed unless custom scrollbar logic is added globally */
</style>
