<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Webhook Tester</h2>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Uji, pratinjau, dan replay pengiriman webhook secara real-time.</p>
      </div>
      <router-link
        to="/app/settings/webhooks"
        class="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold text-sm shadow-sm"
      >
        <span class="material-symbols-outlined text-[18px]">arrow_back</span>
        Kembali ke Webhooks
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Webhook Selection & Testing -->
      <div class="space-y-6">
        <!-- Webhook Selection -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-6">
             <div class="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                 <span class="material-symbols-outlined text-[24px]">webhook</span>
             </div>
             <h3 class="text-lg font-bold text-slate-900 dark:text-white">Pilih Webhook</h3>
          </div>
          
          <div class="relative">
            <select
                v-model="selectedWebhookId"
                @change="loadWebhookDetails"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white appearance-none"
            >
                <option value="">Pilih Webhook target...</option>
                <option v-for="webhook in webhooks" :key="webhook.id" :value="webhook.id">
                {{ webhook.url }} ({{ webhook.events.length }} events)
                </option>
            </select>
            <span class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined">expand_more</span>
          </div>

          <div v-if="selectedWebhook" class="mt-6 space-y-4 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-500 uppercase tracking-wider text-xs">Target URL</span>
              <span class="font-bold text-slate-900 dark:text-white break-all text-right ml-4">{{ selectedWebhook.url }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-500 uppercase tracking-wider text-xs">Status</span>
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border"
                :class="selectedWebhook.isActive 
                    ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="selectedWebhook.isActive ? 'bg-blue-500' : 'bg-slate-400'"></span>
                {{ selectedWebhook.isActive ? 'Aktif' : 'Tidak Aktif' }}
              </span>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-bold text-slate-500 uppercase tracking-wider text-xs">Langganan Events</span>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="event in selectedWebhook.events"
                  :key="event"
                  class="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold shadow-sm"
                >
                  {{ event }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Test Webhook -->
        <div v-if="selectedWebhook" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-6">
             <div class="p-2.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-xl">
                 <span class="material-symbols-outlined text-[24px]">science</span>
             </div>
             <h3 class="text-lg font-bold text-slate-900 dark:text-white">Uji Coba Pengiriman</h3>
          </div>
          
          <div class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipe Event</label>
              <div class="relative">
                <select
                    v-model="testForm.event"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-slate-900 dark:text-white appearance-none"
                >
                    <option value="test.event">Event Uji Coba (test.event)</option>
                    <option
                    v-for="event in selectedWebhook.events"
                    :key="event"
                    :value="event"
                    >
                    {{ event }}
                    </option>
                </select>
                <span class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined">expand_more</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payload Kustom (JSON)</label>
              <div class="relative">
                <textarea
                    v-model="testForm.payload"
                    rows="8"
                    placeholder='{"test": true, "message": "Custom test payload"}'
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-mono text-slate-800 dark:text-slate-200"
                ></textarea>
                <div class="absolute right-2 bottom-2">
                    <button 
                        v-if="testForm.payload"
                        @click="testForm.payload = ''"
                        class="text-xs font-bold text-red-500 hover:text-red-700 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow border border-slate-200 dark:border-slate-700"
                    >
                        Clear
                    </button>
                </div>
              </div>
              <p class="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
                 <span class="material-symbols-outlined text-[14px]">info</span>
                 Biarkan kosong untuk menggunakan payload standar.
              </p>
            </div>

            <button
              @click="testWebhook"
              :disabled="testing"
              class="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-violet-500/30 transition-all active:scale-95 font-bold disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <div v-if="testing" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span class="material-symbols-outlined text-[20px]" v-else>send</span>
              {{ testing ? 'Mengirim...' : 'Kirim Webhook' }}
            </button>
          </div>
        </div>

        <!-- Preview Payload -->
        <div v-if="selectedWebhook" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div class="flex items-center justify-between mb-4">
             <h2 class="text-lg font-bold text-slate-900 dark:text-white">Pratinjau Payload</h2>
             <button
                @click="copyPayload"
                class="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition text-xs font-bold flex items-center gap-1"
             >
                <span class="material-symbols-outlined text-[14px]">content_copy</span>
                Salin
             </button>
          </div>
          <div class="bg-slate-900 rounded-xl p-4 overflow-hidden border border-slate-800 shadow-inner">
            <pre class="text-xs font-mono text-blue-400 overflow-x-auto custom-scrollbar">{{ previewPayload }}</pre>
          </div>
        </div>
      </div>

      <!-- Right: Delivery History -->
      <div class="space-y-6">
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 min-h-[600px] flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
                 <div class="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl">
                     <span class="material-symbols-outlined text-[24px]">history</span>
                 </div>
                 <h2 class="text-lg font-bold text-slate-900 dark:text-white">Riwayat Pengiriman</h2>
            </div>
            
            <button
              v-if="selectedWebhookId"
              @click="loadDeliveries"
              class="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition"
              title="Segarkan Riwayat"
            >
              <span class="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          </div>

          <div v-if="!selectedWebhookId" class="flex flex-col items-center justify-center flex-1 text-center py-12">
            <div class="bg-slate-100 dark:bg-slate-700 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <span class="material-symbols-outlined text-slate-300 text-4xl">webhook</span>
            </div>
            <p class="text-slate-500 font-medium">Pilih webhook di sebelah kiri untuk melihat riwayat pengiriman.</p>
          </div>

          <div v-else class="flex flex-col flex-1">
            <!-- Filters -->
            <div class="mb-4">
              <div class="relative">
                <select
                    v-model="deliveryFilter.status"
                    @change="loadDeliveries"
                    class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white appearance-none"
                >
                    <option value="">Semua Status</option>
                    <option value="SUCCESS">Berhasil (Success)</option>
                    <option value="FAILED">Gagal (Failed)</option>
                    <option value="PENDING">Pending</option>
                </select>
                <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 material-symbols-outlined">filter_list</span>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loadingDeliveries" class="flex flex-col items-center justify-center flex-1 py-12">
              <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Memuat riwayat...</p>
            </div>

            <!-- Deliveries List -->
            <div v-else class="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-3 max-h-[600px]">
              <div
                v-for="delivery in deliveries"
                :key="delivery.id"
                class="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-700 transition group"
              >
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1.5">
                      <span
                        class="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider"
                        :class="delivery.status === 'SUCCESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
                      >
                         {{ delivery.status }}
                      </span>
                      <span class="font-bold text-sm text-slate-900 dark:text-white">{{ delivery.event }}</span>
                    </div>
                    <div class="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">schedule</span>
                            {{ formatDateTime(delivery.createdAt) }}
                        </span>
                        <span v-if="delivery.responseCode" class="flex items-center gap-1 font-bold" :class="delivery.responseCode >= 200 && delivery.responseCode < 300 ? 'text-blue-600' : 'text-red-500'">
                            <span class="material-symbols-outlined text-[14px]">http</span>
                            {{ delivery.responseCode }}
                        </span>
                        <span v-if="delivery.attempts > 0" class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">replay</span>
                            {{ delivery.attempts }}x
                        </span>
                    </div>
                  </div>
                  <button
                    v-if="delivery.status === 'FAILED'"
                    @click="replayDelivery(delivery.id)"
                    :disabled="replaying"
                    class="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition shadow-sm"
                    title="Replay Pengiriman"
                  >
                    <span class="material-symbols-outlined text-[18px]">replay_circle_filled</span>
                  </button>
                </div>

                <!-- Payload Preview -->
                <details class="group/details mb-2">
                  <summary class="text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 flex items-center gap-1 select-none">
                    <span class="material-symbols-outlined text-[14px] transition-transform group-open/details:rotate-90">chevron_right</span>
                    Lihat Payload
                  </summary>
                  <div class="mt-2 bg-slate-900 rounded-lg p-3 overflow-hidden">
                    <pre class="text-xs font-mono text-blue-400 overflow-x-auto custom-scrollbar">{{ JSON.stringify(delivery.payload, null, 2) }}</pre>
                  </div>
                </details>

                <!-- Response Preview -->
                <details v-if="delivery.responseBody" class="group/details">
                  <summary class="text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 flex items-center gap-1 select-none">
                    <span class="material-symbols-outlined text-[14px] transition-transform group-open/details:rotate-90">chevron_right</span>
                    Lihat Respons
                  </summary>
                  <div class="mt-2 bg-slate-900 rounded-lg p-3 overflow-hidden">
                    <pre class="text-xs font-mono text-amber-400 overflow-x-auto custom-scrollbar">{{ delivery.responseBody }}</pre>
                  </div>
                </details>
              </div>

              <div v-if="deliveries.length === 0" class="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <span class="material-symbols-outlined text-slate-300 text-4xl mb-3">inbox</span>
                <p class="text-slate-500 font-medium text-sm">Belum ada riwayat pengiriman untuk filter ini.</p>
              </div>
            </div>

            <!-- Pagination -->
            <div
              v-if="deliveryPagination.totalPages > 1"
              class="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4"
            >
              <div class="text-sm font-bold text-slate-500">
                Hal {{ deliveryPagination.page }} dari {{ deliveryPagination.totalPages }}
              </div>
              <div class="flex gap-2">
                <button
                  @click="loadDeliveries(deliveryPagination.page - 1)"
                  :disabled="deliveryPagination.page === 1"
                  class="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition"
                >
                  <span class="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  @click="loadDeliveries(deliveryPagination.page + 1)"
                  :disabled="deliveryPagination.page === deliveryPagination.totalPages"
                  class="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition"
                >
                  <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api';
import { formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';

const route = useRoute();

const { success: showSuccess, error: showError } = useNotification();

const webhooks = ref<any[]>([]);
const selectedWebhookId = ref('');
const selectedWebhook = ref<any>(null);
const deliveries = ref<any[]>([]);
const loadingDeliveries = ref(false);
const testing = ref(false);
const replaying = ref(false);

const testForm = ref({
  event: 'test.event',
  payload: '',
});

const deliveryFilter = ref({
  status: '',
});

const deliveryPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

const previewPayload = computed(() => {
  try {
    const payload = testForm.value.payload
      ? JSON.parse(testForm.value.payload)
      : {
          test: true,
          message: 'Ini adalah payload uji coba',
          timestamp: new Date().toISOString(),
          webhookId: selectedWebhookId.value,
        };

    return JSON.stringify(
      {
        event: testForm.value.event,
        payload,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  } catch {
    return 'Invalid JSON';
  }
});

const loadWebhooks = async () => {
  try {
    const response = await api.get('/webhooks?includeInactive=true');
    webhooks.value = response.data.webhooks || [];
  } catch (error: any) {
    console.error('Error loading webhooks:', error);
    await showError('Gagal memuat daftar webhook');
  }
};

const loadWebhookDetails = async () => {
  if (!selectedWebhookId.value) {
    selectedWebhook.value = null;
    deliveries.value = [];
    return;
  }

  selectedWebhook.value = webhooks.value.find((w) => w.id === selectedWebhookId.value);
  await loadDeliveries();
};

const loadDeliveries = async (page = 1) => {
  if (!selectedWebhookId.value) return;

  loadingDeliveries.value = true;
  try {
    const params: any = {
      page,
      limit: deliveryPagination.value.limit,
    };

    if (deliveryFilter.value.status) {
      params.status = deliveryFilter.value.status;
    }

    const response = await api.get(`/webhooks/${selectedWebhookId.value}/deliveries`, { params });
    deliveries.value = response.data.data || [];
    deliveryPagination.value = response.data.pagination || deliveryPagination.value;
    deliveryPagination.value.page = page;
  } catch (error: any) {
    console.error('Error loading deliveries:', error);
    await showError('Gagal memuat riwayat pengiriman');
  } finally {
    loadingDeliveries.value = false;
  }
};

const testWebhook = async () => {
  if (!selectedWebhookId.value) {
    await showError('Pilih webhook terlebih dahulu');
    return;
  }

  testing.value = true;
  try {
    const payload: any = {
      event: testForm.value.event,
    };

    if (testForm.value.payload) {
      try {
        payload.payload = JSON.parse(testForm.value.payload);
      } catch {
        await showError('Format JSON tidak valid');
        testing.value = false;
        return;
      }
    }

    await api.post(`/webhooks/${selectedWebhookId.value}/test`, payload);
    await showSuccess('Webhook uji coba berhasil dikirim!');
    await loadDeliveries(deliveryPagination.value.page);
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    await showError(error.response?.data?.message || 'Gagal mengirim webhook uji coba');
  } finally {
    testing.value = false;
  }
};

const replayDelivery = async (deliveryId: string) => {
  if (!selectedWebhookId.value) return;

  replaying.value = true;
  try {
    await api.post(`/webhooks/${selectedWebhookId.value}/replay/${deliveryId}`);
    await showSuccess('Pengiriman ulang webhook berhasil!');
    await loadDeliveries(deliveryPagination.value.page);
  } catch (error: any) {
    console.error('Error replaying delivery:', error);
    await showError(error.response?.data?.message || 'Gagal mengirim ulang webhook');
  } finally {
    replaying.value = false;
  }
};

const copyPayload = async () => {
  try {
    await navigator.clipboard.writeText(previewPayload.value);
    await showSuccess('Payload berhasil disalin!');
  } catch {
    await showError('Gagal menyalin payload');
  }
};

watch(selectedWebhookId, () => {
  loadWebhookDetails();
});

onMounted(async () => {
  await loadWebhooks();
  
  // If webhookId is provided in query, select it
  const webhookId = route.query.webhookId as string;
  if (webhookId) {
    selectedWebhookId.value = webhookId;
    await loadWebhookDetails();
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
