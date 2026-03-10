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
              <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                  <span class="material-symbols-outlined text-[28px]">public</span>
              </div>
              <div>
                   <h3 class="text-2xl font-black text-slate-900 dark:text-white leading-tight">Ekspor Laporan Global</h3>
                   <p class="text-sm text-slate-500 font-medium">Analisis komprehensif seluruh sistem.</p>
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
          <!-- Period Filter -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Periode Waktu</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                @click="exportForm.period = 'daily'"
                class="px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all"
                :class="exportForm.period === 'daily' 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30' 
                   : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
              >
                Harian
              </button>
              <button
                type="button"
                @click="exportForm.period = 'weekly'"
                class="px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all"
                :class="exportForm.period === 'weekly' 
                   ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30' 
                   : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
              >
                Mingguan
              </button>
              <button
                type="button"
                @click="exportForm.period = 'monthly'"
                 class="px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all"
                :class="exportForm.period === 'monthly' 
                   ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30' 
                   : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
              >
                Bulanan
              </button>
              <button
                type="button"
                @click="exportForm.period = 'custom'"
                class="px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all"
                :class="exportForm.period === 'custom' 
                   ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30' 
                   : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'"
              >
                Kustom
              </button>
            </div>
          </div>

          <!-- Date Range (if custom) -->
          <div v-if="exportForm.period === 'custom'" class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dari Tanggal</label>
               <div class="relative">
                 <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                <input
                    v-model="exportForm.startDate"
                    type="date"
                    required
                    class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                    class="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
               </div>
            </div>
          </div>

          <!-- Template Selection -->
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pilih Template PDF</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
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

          <!-- Summary -->
          <div class="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900/30">
            <h4 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <span class="material-symbols-outlined text-indigo-500">info</span>
                Ringkasan Ekspor
            </h4>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between items-center pb-2 border-b border-indigo-100 dark:border-indigo-800/30">
                <span class="text-slate-500 font-medium">Periode:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ getPeriodLabel(exportForm.period) }}</span>
              </div>
              <div v-if="exportForm.period === 'custom'" class="flex justify-between items-center pb-2 border-b border-indigo-100 dark:border-indigo-800/30">
                <span class="text-slate-500 font-medium">Tanggal:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ exportForm.startDate }} - {{ exportForm.endDate }}</span>
              </div>
              <div class="flex justify-between items-center pb-2 border-b border-indigo-100 dark:border-indigo-800/30">
                <span class="text-slate-500 font-medium">Format:</span>
                <span class="font-bold text-slate-900 dark:text-white badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 rounded">PDF Document</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 font-medium">Template:</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ getTemplateLabel(exportForm.template) }}</span>
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
              type="submit"
              :disabled="exporting"
               class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition font-bold text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              <div v-if="exporting" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="material-symbols-outlined text-[20px]" v-else>download</span>
              {{ exporting ? 'Mengekspor...' : 'Ekspor PDF' }}
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
import { generateFlexboxExport } from '../utils/export-templates';
import { useNotification } from '../composables/useNotification';
import { getPeriodLabel } from '../utils/export';

const { error: showError, success: showSuccess } = useNotification();

interface Props {
  show: boolean;
  defaultStartDate?: string;
  defaultEndDate?: string;
  reportData?: any;
}

const props = withDefaults(defineProps<Props>(), {
  defaultStartDate: '',
  defaultEndDate: '',
});

const emit = defineEmits<{
  close: [];
  exported: [];
}>();

const exporting = ref(false);

const exportForm = ref({
  period: 'custom' as 'daily' | 'weekly' | 'monthly' | 'custom',
  startDate: props.defaultStartDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
  endDate: props.defaultEndDate || new Date().toISOString().split('T')[0],
  template: 'contemporary' as 'clean' | 'contemporary' | 'vibrant' | 'professional' | 'executive' | 'minimalist' | 'modern' | 'classic' | 'colorful' | 'elegant',
});

const getTemplateLabel = (template: string) => {
  const labels: Record<string, string> = {
    clean: 'Clean & Simple',
    contemporary: 'Contemporary',
    vibrant: 'Vibrant',
    professional: 'Professional',
    executive: 'Executive',
    // Legacy support
    minimalist: 'Clean & Simple',
    modern: 'Contemporary',
    classic: 'Contemporary',
    colorful: 'Vibrant',
    elegant: 'Professional',
  };
  return labels[template] || template;
};

const computedDates = computed(() => {
  const now = new Date();
  let startDate = '';
  let endDate = now.toISOString().split('T')[0];

  switch (exportForm.value.period) {
    case 'daily':
      startDate = endDate;
      break;
    case 'weekly':
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0];
      break;
    case 'monthly':
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0];
      break;
    case 'custom':
      startDate = exportForm.value.startDate;
      endDate = exportForm.value.endDate;
      break;
  }

  return { startDate, endDate };
});

const handleExport = async () => {
  exporting.value = true;
  try {
    let reportData = props.reportData;
    
    // Fetch data if not provided
    if (!reportData) {
      const { startDate, endDate } = computedDates.value;
      const response = await api.get('/reports/global', {
        params: {
          startDate,
          endDate,
        },
      });
      reportData = response.data;
    }
    
    const { startDate, endDate } = computedDates.value;
    
    // Always use PDF export
    await generateFlexboxExport({
      type: 'report',
      reportData,
      reportType: 'global',
      startDate,
      endDate,
      tenantName: 'Laporan Global',
      template: exportForm.value.template,
      isGlobal: true,
    });
    
    await showSuccess('Export berhasil! PDF telah didownload.');
    emit('exported');
    emit('close');
  } catch (error: any) {
    console.error('Error exporting global report:', error);
    await showError(error.response?.data?.message || 'Gagal mengekspor laporan global');
  } finally {
    exporting.value = false;
  }
};

watch(() => exportForm.value.period, (newPeriod) => {
  if (newPeriod !== 'custom') {
    const { startDate, endDate } = computedDates.value;
    exportForm.value.startDate = startDate;
    exportForm.value.endDate = endDate;
  }
});

watch(() => props.show, (newShow) => {
  if (newShow) {
    exportForm.value.startDate = props.defaultStartDate || exportForm.value.startDate;
    exportForm.value.endDate = props.defaultEndDate || exportForm.value.endDate;
  }
});
</script>

<style scoped>
/* Scoped styles */
</style>
