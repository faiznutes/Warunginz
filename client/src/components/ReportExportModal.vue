<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-white/20">
      <div class="p-8">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-4">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                  <span class="material-symbols-outlined text-[28px]">download</span>
              </div>
              <div>
                   <h3 class="text-2xl font-black text-slate-900 dark:text-white leading-tight">Ekspor Laporan</h3>
                   <p class="text-sm text-slate-500 font-medium">Unduh data laporan dalam format PDF atau CSV.</p>
              </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-slate-600"
          >
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <form @submit.prevent="handleExport" class="space-y-6">
          <!-- Export Type Selection -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pilih Data yang Diekspor</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                @click="exportForm.exportType = 'report'"
                class="px-4 py-4 rounded-2xl border-2 transition flex flex-col items-center gap-3 relative overflow-hidden group"
                :class="exportForm.exportType === 'report' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
              >
                <div v-if="exportForm.exportType === 'report'" class="absolute -right-3 -top-3 bg-blue-500 w-10 h-10 rounded-full flex items-end justify-start p-1.5">
                    <span class="material-symbols-outlined text-white text-[14px]">check</span>
                </div>
                <span class="material-symbols-outlined text-[32px]">description</span>
                <span class="text-xs font-bold uppercase tracking-wider">Laporan</span>
              </button>
              <button
                type="button"
                @click="exportForm.exportType = 'analytics'"
                class="px-4 py-4 rounded-2xl border-2 transition flex flex-col items-center gap-3 relative overflow-hidden group"
                :class="exportForm.exportType === 'analytics' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                   : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
              >
                 <div v-if="exportForm.exportType === 'analytics'" class="absolute -right-3 -top-3 bg-blue-500 w-10 h-10 rounded-full flex items-end justify-start p-1.5">
                    <span class="material-symbols-outlined text-white text-[14px]">check</span>
                </div>
                <span class="material-symbols-outlined text-[32px]">analytics</span>
                <span class="text-xs font-bold uppercase tracking-wider">Analitik</span>
              </button>
              <button
                type="button"
                @click="exportForm.exportType = 'both'"
                class="px-4 py-4 rounded-2xl border-2 transition flex flex-col items-center gap-3 relative overflow-hidden group"
                :class="exportForm.exportType === 'both' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
              >
                 <div v-if="exportForm.exportType === 'both'" class="absolute -right-3 -top-3 bg-blue-500 w-10 h-10 rounded-full flex items-end justify-start p-1.5">
                    <span class="material-symbols-outlined text-white text-[14px]">check</span>
                </div>
                <span class="material-symbols-outlined text-[32px]">folder_zip</span>
                <span class="text-xs font-bold uppercase tracking-wider">Keduanya</span>
              </button>
            </div>
          </div>

          <!-- Report Type (only show if export type is report or both) -->
          <div v-if="exportForm.exportType === 'report' || exportForm.exportType === 'both'" class="animate-fade-in">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipe Laporan</label>
            <div class="relative">
                 <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">category</span>
                <select
                  v-model="exportForm.reportType"
                  required
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="sales">Laporan Penjualan</option>
                  <option value="product">Laporan Produk</option>
                  <option value="customers">Laporan Pelanggan</option>
                  <option value="inventory">Laporan Inventori</option>
                  <option value="financial">Laporan Keuangan</option>
                </select>
                <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">expand_more</span>
            </div>
          </div>

          <!-- Period Filter -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Periode Waktu</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                @click="exportForm.period = 'daily'"
                class="px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all"
                :class="exportForm.period === 'daily' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
              >
                Harian
              </button>
              <button
                type="button"
                @click="exportForm.period = 'weekly'"
                class="px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all"
                :class="exportForm.period === 'weekly' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
              >
                Mingguan
              </button>
              <button
                type="button"
                @click="exportForm.period = 'monthly'"
                class="px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all"
                :class="exportForm.period === 'monthly' 
                   ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
              >
                Bulanan
              </button>
              <button
                type="button"
                @click="exportForm.period = 'all'"
                class="px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all"
                :class="exportForm.period === 'all' 
                   ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
              >
                Semua
              </button>
            </div>
          </div>

          <!-- Date Range (if not 'all') -->
          <div v-if="exportForm.period !== 'all'" class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dari Tanggal</label>
               <div class="relative">
                 <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                <input
                    v-model="exportForm.startDate"
                    type="date"
                    required
                    class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
               </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sampai Tanggal</label>
               <div class="relative">
                 <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                <input
                    v-model="exportForm.endDate"
                    type="date"
                    required
                    class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
               </div>
            </div>
          </div>

          <!-- Template Selection (only for PDF) -->
          <div v-if="exportForm.format === 'PDF'" class="animate-fade-in">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pilih Template PDF</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <!-- Helper component or direct button loops would be cleaner but verbose here -->
               <button
                type="button"
                @click="exportForm.template = 'clean'"
                class="px-2 py-3 rounded-xl border-2 transition flex flex-col items-center gap-1"
                :class="exportForm.template === 'clean'
                  ? 'border-slate-800 bg-slate-900 text-white' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
              >
                <div class="w-8 h-10 bg-current opacity-20 rounded mb-1"></div>
                <span class="text-xs font-bold">Clean</span>
              </button>
              
               <button
                type="button"
                @click="exportForm.template = 'contemporary'"
                class="px-2 py-3 rounded-xl border-2 transition flex flex-col items-center gap-1"
                :class="exportForm.template === 'contemporary'
                  ? 'border-blue-600 bg-blue-600 text-white' 
                   : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
              >
                 <div class="w-8 h-10 bg-current opacity-20 rounded mb-1"></div>
                <span class="text-xs font-bold">Modern</span>
              </button>

               <button
                type="button"
                @click="exportForm.template = 'vibrant'"
                class="px-2 py-3 rounded-xl border-2 transition flex flex-col items-center gap-1"
                :class="exportForm.template === 'vibrant'
                  ? 'border-purple-600 bg-purple-600 text-white' 
                   : 'border-slate-200 dark:border-slate-700 hover:border-purple-400 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
              >
                 <div class="w-8 h-10 bg-current opacity-20 rounded mb-1"></div>
                <span class="text-xs font-bold">Vibrant</span>
              </button>

               <button
                type="button"
                @click="exportForm.template = 'professional'"
                class="px-2 py-3 rounded-xl border-2 transition flex flex-col items-center gap-1"
                :class="exportForm.template === 'professional'
                  ? 'border-blue-600 bg-blue-600 text-white' 
                   : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
              >
                 <div class="w-8 h-10 bg-current opacity-20 rounded mb-1"></div>
                <span class="text-xs font-bold">Pro</span>
              </button>

               <button
                type="button"
                @click="exportForm.template = 'executive'"
                class="px-2 py-3 rounded-xl border-2 transition flex flex-col items-center gap-1"
                :class="exportForm.template === 'executive'
                  ? 'border-amber-600 bg-amber-600 text-white' 
                   : 'border-slate-200 dark:border-slate-700 hover:border-amber-400 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
              >
                 <div class="w-8 h-10 bg-current opacity-20 rounded mb-1"></div>
                <span class="text-xs font-bold">Premium</span>
              </button>
            </div>
          </div>

          <!-- Action Mode Selection -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Aksi</label>
            <div class="grid grid-cols-2 gap-4">
              <button
                type="button"
                @click="shareMode = false"
                class="px-6 py-6 rounded-2xl border-2 transition flex flex-col items-center gap-3 relative overflow-hidden group"
                :class="!shareMode 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
              >
                <div v-if="!shareMode" class="absolute -right-3 -top-3 bg-blue-500 w-10 h-10 rounded-full flex items-end justify-start p-1.5">
                    <span class="material-symbols-outlined text-white text-[14px]">check</span>
                </div>
                <span class="material-symbols-outlined text-[32px]">download</span>
                <div class="text-center">
                    <span class="block text-sm font-bold">Unduh File</span>
                </div>
              </button>
              <button
                type="button"
                @click="shareMode = true"
                class="px-6 py-6 rounded-2xl border-2 transition flex flex-col items-center gap-3 relative overflow-hidden group"
                :class="shareMode 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
              >
                <div v-if="shareMode" class="absolute -right-3 -top-3 bg-blue-500 w-10 h-10 rounded-full flex items-end justify-start p-1.5">
                    <span class="material-symbols-outlined text-white text-[14px]">check</span>
                </div>
                <span class="material-symbols-outlined text-[32px]">share</span>
                <div class="text-center">
                    <span class="block text-sm font-bold">Buat Link Berbagi</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Export Format (only show if download mode) -->
          <div v-if="!shareMode">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Format File</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="exportForm.format = 'CSV'"
                :disabled="exportForm.exportType === 'analytics'"
                class="px-4 py-4 rounded-xl border-2 transition flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                :class="exportForm.format === 'CSV' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
              >
                <div class="p-2 rounded-full" :class="exportForm.format === 'CSV' ? 'bg-blue-200 dark:bg-blue-800' : 'bg-slate-100 dark:bg-slate-700'">
                    <span class="material-symbols-outlined text-[24px]">table_chart</span>
                </div>
                <div class="text-center">
                    <span class="block text-sm font-bold">CSV / Excel</span>
                    <span v-if="exportForm.exportType === 'analytics'" class="block text-[10px] text-red-500 font-bold mt-1">Tidak tersedia untuk Analitik</span>
                </div>
              </button>
              <button
                type="button"
                @click="canExportPDF ? exportForm.format = 'PDF' : null"
                :disabled="!canExportPDF"
                class="px-4 py-4 rounded-xl border-2 transition flex flex-col items-center gap-2 group"
                :class="!canExportPDF
                  ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60 cursor-not-allowed'
                  : exportForm.format === 'PDF' 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-red-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
              >
                 <div class="p-2 rounded-full" :class="exportForm.format === 'PDF' && canExportPDF ? 'bg-red-200 dark:bg-red-800' : 'bg-slate-100 dark:bg-slate-700'">
                    <span class="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                 </div>
                <div class="text-center">
                    <span class="block text-sm font-bold">PDF Document</span>
                    <span v-if="!canExportPDF" class="block text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1">Hanya untuk paket berbayar</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Share Link Section -->
          <div v-if="shareMode" class="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-emerald-200 dark:border-blue-800 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-blue-600 text-[24px]">link</span>
                <div class="flex-1">
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-2">Link Berbagi</h4>
                  <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">Salin link ini untuk dibagikan dengan tim atau stakeholder.</p>
                  <div class="flex gap-2">
                    <input
                      :value="shareableLink"
                      readonly
                      class="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      @click="copyShareLink"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition flex items-center gap-2"
                    >
                      <span class="material-symbols-outlined text-[18px]">{{ linkCopied ? 'check' : 'content_copy' }}</span>
                      {{ linkCopied ? 'Tersalin!' : 'Salin' }}
                    </button>
                  </div>
                  <p v-if="linkCopied" class="text-xs text-blue-600 font-medium mt-2 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">check_circle</span>
                    Link berhasil disalin ke clipboard!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              @click="$emit('close')"
              class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-bold text-sm"
            >
              Batal
            </button>
            <button
              v-if="!shareMode"
              type="submit"
              :disabled="exporting"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
               <div v-if="exporting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="material-symbols-outlined text-[20px]" v-else>download</span>
              {{ exporting ? 'Mengekspor...' : 'Mulai Export' }}
            </button>
            <button
              v-else
              type="button"
              @click="generateShareLink"
              :disabled="generatingLink"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
               <div v-if="generatingLink" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="material-symbols-outlined text-[20px]" v-else>link</span>
              {{ generatingLink ? 'Membuat Link...' : 'Buat Link Berbagi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import api from '../api';
import { exportToCSV } from '../utils/export';
import { generateFlexboxExport } from '../utils/export-templates';
import { useAuthStore } from '../stores/auth';
import { useNotification } from '../composables/useNotification';

const { error: showError, warning: showWarning, success: showSuccess } = useNotification();
const authStore = useAuthStore();

interface Props {
  show: boolean;
  reportType?: string;
  defaultPeriod?: string;
  reportData?: any;
  analyticsData?: any;
}

const props = withDefaults(defineProps<Props>(), {
  reportType: 'sales',
  defaultPeriod: 'all',
});

const emit = defineEmits<{
  close: [];
  exported: [];
}>();

const exporting = ref(false);
const shareMode = ref(false);
const shareableLink = ref('');
const linkCopied = ref(false);
const generatingLink = ref(false);

const exportForm = ref({
  exportType: 'report' as 'report' | 'analytics' | 'both',
  reportType: props.reportType,
  period: props.defaultPeriod,
  startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  format: (authStore.isSuperAdmin || authStore.isSubscriptionActive ? 'PDF' : 'CSV') as 'CSV' | 'PDF',
  template: 'contemporary' as 'clean' | 'contemporary' | 'vibrant' | 'professional' | 'executive' | 'minimalist' | 'modern' | 'classic' | 'colorful' | 'elegant',
});

// PDF export only available for Super Admin or tenants with active (paid) subscription
const canExportPDF = computed(() => authStore.isSuperAdmin || authStore.isSubscriptionActive);

const generateShareLink = async () => {
  generatingLink.value = true;
  linkCopied.value = false;
  
  try {
    // Build shareable URL with report parameters
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      reportType: exportForm.value.reportType || props.reportType,
      period: exportForm.value.period || props.defaultPeriod,
      exportType: exportForm.value.exportType || 'report',
      view: 'shared',
    });
    
    if (exportForm.value.period !== 'all') {
      params.append('startDate', exportForm.value.startDate);
      params.append('endDate', exportForm.value.endDate);
    }
    
    // Generate shareable link
    shareableLink.value = `${baseUrl}/app/reports?${params.toString()}`;
    
    // Auto copy to clipboard
    await copyShareLink();
    
    await showSuccess('Link berbagi berhasil dibuat dan disalin!');
  } catch (error: any) {
    console.error('Error generating share link:', error);
    await showError('Gagal membuat link berbagi');
  } finally {
    generatingLink.value = false;
  }
};

const copyShareLink = async () => {
  if (!shareableLink.value) return;
  
  try {
    await navigator.clipboard.writeText(shareableLink.value);
    linkCopied.value = true;
    setTimeout(() => {
      linkCopied.value = false;
    }, 3000);
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = shareableLink.value;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      linkCopied.value = true;
      setTimeout(() => {
        linkCopied.value = false;
      }, 3000);
    } catch {
      await showError('Gagal menyalin link');
    }
    document.body.removeChild(textArea);
  }
};

const handleExport = async () => {
  exporting.value = true;
  try {
    let reportData = props.reportData;
    let analyticsData = props.analyticsData;
    
    // Fetch data if not provided
    if ((exportForm.value.exportType === 'report' || exportForm.value.exportType === 'both') && !reportData) {
      const response = await api.get('/reports/tenant', {
        params: {
          reportType: exportForm.value.reportType,
          period: exportForm.value.period,
          startDate: exportForm.value.period !== 'all' ? exportForm.value.startDate : undefined,
          endDate: exportForm.value.period !== 'all' ? exportForm.value.endDate : undefined,
        },
      });
      reportData = response.data;
    }
    
    if ((exportForm.value.exportType === 'analytics' || exportForm.value.exportType === 'both') && !analyticsData) {
      const [predictionsRes, topProductsRes] = await Promise.all([
        api.get('/analytics/predictions').catch(() => ({ data: null })),
        api.get('/analytics/top-products', { params: { limit: 10 } }).catch(() => ({ data: [] })),
      ]);
      analyticsData = {
        predictions: predictionsRes.data,
        topProducts: topProductsRes.data || [],
      };
    }
    
    // Use flexbox export for PDF
    if (exportForm.value.format === 'PDF') {
      await generateFlexboxExport({
        type: exportForm.value.exportType,
        reportData,
        analyticsData,
        reportType: exportForm.value.reportType,
        startDate: exportForm.value.startDate,
        endDate: exportForm.value.endDate,
        tenantName: authStore.user?.tenantName || 'Tenant',
        template: exportForm.value.template,
      });
      await showSuccess('Export berhasil! PDF telah didownload.');
      emit('exported');
      emit('close');
      return;
    }
    
    // CSV export (only for report type, not analytics)
    if (exportForm.value.format === 'CSV') {
      if (exportForm.value.exportType === 'analytics') {
        await showWarning('Export CSV hanya tersedia untuk laporan. Gunakan PDF untuk export analytics.');
        return;
      }
      
      // Format data based on report type
      let exportData: any[] = [];
      let headers: string[] = [];

    switch (exportForm.value.reportType) {
      case 'sales':
        exportData = reportData.byDate?.map((item: any) => ({
          Tanggal: new Date(item.date).toLocaleDateString('id-ID'),
          'Total Pendapatan': item.revenue,
          'Jumlah Transaksi': item.count,
          'Rata-rata': item.revenue / (item.count || 1),
        })) || [];
        headers = ['Tanggal', 'Total Pendapatan', 'Jumlah Transaksi', 'Rata-rata'];
        break;
      case 'product':
        exportData = reportData.products?.map((item: any) => ({
          'Nama Produk': item.product.name,
          'Kategori': item.product.category || '-',
          'Jumlah Terjual': item.totalSold,
          'Total Pendapatan': item.totalRevenue,
          'Stok Saat Ini': item.stockLevel,
          'Status Stok': item.isLowStock ? 'Rendah' : 'Normal',
        })) || [];
        headers = ['Nama Produk', 'Kategori', 'Jumlah Terjual', 'Total Pendapatan', 'Stok Saat Ini', 'Status Stok'];
        break;
      case 'customers':
        exportData = [
          ...(reportData.customers?.map((item: any) => ({
            'Nama Pelanggan': item.customer.name,
            'Email': item.customer.email || '-',
            'Telepon': item.customer.phone || '-',
            'Jumlah Transaksi': item.totalOrders,
            'Total Belanja': item.totalSpent,
            'Rata-rata Belanja': item.averageOrder,
          })) || []),
          ...(reportData.members?.map((item: any) => ({
            'Nama Pelanggan': item.member.name,
            'Email': item.member.email || '-',
            'Telepon': item.member.phone || '-',
            'Jumlah Transaksi': item.totalOrders,
            'Total Belanja': item.totalSpent,
            'Rata-rata Belanja': item.averageOrder,
          })) || []),
        ];
        headers = ['Nama Pelanggan', 'Email', 'Telepon', 'Jumlah Transaksi', 'Total Belanja', 'Rata-rata Belanja'];
        break;
      case 'inventory':
        exportData = reportData.inventory?.map((item: any) => ({
          'Nama Produk': item.product.name,
          'Kategori': item.product.category || '-',
          'Stok Saat Ini': item.currentStock,
          'Stok Minimum': item.minStock,
          'Nilai Stok': item.stockValue,
          'Total Terjual': item.totalSold,
          'Status': item.isLowStock ? 'Stok Rendah' : 'Normal',
        })) || [];
        headers = ['Nama Produk', 'Kategori', 'Stok Saat Ini', 'Stok Minimum', 'Nilai Stok', 'Total Terjual', 'Status'];
        break;
      case 'financial':
        exportData = reportData.byDate?.map((item: any) => ({
          Tanggal: new Date(item.date).toLocaleDateString('id-ID'),
          Pendapatan: reportData.revenue || 0,
          'Biaya Pokok': reportData.costOfGoods || 0,
          'Laba Kotor': reportData.grossProfit || 0,
          'Margin Laba': `${reportData.profitMargin?.toFixed(2) || 0}%`,
        })) || [];
        headers = ['Tanggal', 'Pendapatan', 'Biaya Pokok', 'Laba Kotor', 'Margin Laba'];
        break;
    }

      if (exportData.length === 0) {
        await showWarning('Tidak ada data untuk diekspor');
        return;
      }

      const filename = `laporan-${exportForm.value.reportType}-${exportForm.value.period}-${new Date().toISOString().split('T')[0]}`;

      exportToCSV(exportData, filename, headers);
      
      await showSuccess('Export berhasil!');
      emit('exported');
      emit('close');
    }
  } catch (error: any) {
    console.error('Error exporting report:', error);
    await showError(error.response?.data?.message || 'Gagal mengekspor laporan');
  } finally {
    exporting.value = false;
  }
};

watch(() => exportForm.value.exportType, (newType) => {
  // Auto-select PDF if analytics is selected (CSV not available)
  if (newType === 'analytics' && exportForm.value.format === 'CSV') {
    exportForm.value.format = 'PDF';
  }
});

watch(() => props.show, (newShow) => {
  if (newShow) {
    exportForm.value.reportType = props.reportType;
    exportForm.value.period = props.defaultPeriod;
  }
});
</script>

<style scoped>
/* Scoped styles */
</style>
