<template>
  <div class="flex flex-col gap-6 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Webhooks</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Kelola webhook untuk integrasi eksternal.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Buat Webhook Baru</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Webhooks List -->
    <div v-else class="space-y-4">
      <!-- Empty State -->
      <div v-if="webhooks.length === 0" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
        <div class="bg-slate-100 dark:bg-slate-700 p-4 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <span class="material-symbols-outlined text-[48px] text-slate-400">webhook</span>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum ada Webhook</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Anda belum membuat webhook apa pun. Buat webhook pertama Anda untuk mulai mengintegrasikan sistem dengan layanan eksternal.</p>
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Buat Webhook Pertama
        </button>
      </div>

      <!-- Webhook Cards -->
      <div
        v-for="webhook in webhooks"
        :key="webhook.id"
        class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition group"
      >
        <div class="flex flex-col md:flex-row items-start justify-between gap-4">
          <div class="flex-1 w-full">
            <div class="flex items-start gap-4 mb-4">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shrink-0">
                <span class="material-symbols-outlined text-[24px]">webhook</span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3 flex-wrap">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white break-all">{{ webhook.url }}</h3>
                    <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border"
                    :class="webhook.isActive 
                        ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' 
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'"
                    >
                    <span class="w-1.5 h-1.5 rounded-full" :class="webhook.isActive ? 'bg-blue-500' : 'bg-slate-400'"></span>
                    {{ webhook.isActive ? 'Aktif' : 'Tidak Aktif' }}
                    </span>
                </div>
                
                <div class="mt-4">
                    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Events Berlangganan</p>
                    <div class="flex flex-wrap gap-2">
                    <span
                        v-for="event in webhook.events"
                        :key="event"
                        class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600"
                    >
                        {{ event }}
                    </span>
                    </div>
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-6 text-slate-500 text-sm pl-[60px]">
              <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                <span class="material-symbols-outlined text-[16px] text-slate-400">replay</span>
                <span class="font-medium">Retries: <span class="text-slate-900 dark:text-white font-bold">{{ webhook.retryCount || 3 }}</span></span>
              </div>
              <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                <span class="material-symbols-outlined text-[16px] text-slate-400">timer</span>
                <span class="font-medium">Timeout: <span class="text-slate-900 dark:text-white font-bold">{{ webhook.timeout || 5000 }}ms</span></span>
              </div>
              <div v-if="webhook.lastDeliveryAt" class="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                 <span class="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                 <span class="font-medium">Dikirim: <span class="text-slate-900 dark:text-white font-bold">{{ formatDate(webhook.lastDeliveryAt) }}</span></span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 ml-auto pl-[60px] md:pl-0 w-full md:w-auto">
            <router-link
              :to="`/app/settings/webhooks/tester?webhookId=${webhook.id}`"
              class="flex-1 md:flex-none px-4 py-2 bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition text-sm font-bold flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">science</span>
              Uji
            </router-link>
            <button
              @click="testWebhook(webhook.id)"
              class="flex-1 md:flex-none px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition text-sm font-bold flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">send</span>
              Kirim
            </button>
            <button
              @click="editWebhook(webhook)"
              class="flex-1 md:flex-none px-4 py-2 bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition text-sm font-bold flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">edit</span>
              Edit
            </button>
            <button
              @click="deleteWebhook(webhook.id)"
              class="flex-1 md:flex-none px-4 py-2 bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition text-sm font-bold flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal || editingWebhook"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 animate-scale-in">
          <div class="p-6 sm:p-8">
            <div class="flex items-center gap-4 mb-8">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-sm">
                <span class="material-symbols-outlined text-2xl">webhook</span>
              </div>
              <div>
                 <h3 class="text-xl font-black text-slate-900 dark:text-white">
                    {{ editingWebhook ? 'Edit Webhook' : 'Buat Webhook Baru' }}
                 </h3>
                 <p class="text-sm font-medium text-slate-500">Konfigurasi endpoint dan events untuk webhook ini.</p>
              </div>
            </div>

            <form @submit.prevent="saveWebhook" class="space-y-6">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">URL Endpoint *</label>
                <input
                  v-model="webhookForm.url"
                  type="url"
                  required
                  placeholder="https://example.com/webhook"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div>
                <div class="flex items-center justify-between mb-2">
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Events Berlangganan *</label>
                    <span class="text-xs font-medium text-slate-400">{{ webhookForm.events.length }} dipilih</span>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto custom-scrollbar">
                  <label
                    v-for="event in availableEvents"
                    :key="event"
                    class="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition group"
                    :class="{'ring-2 ring-blue-500/20 border-blue-500 dark:border-blue-500': webhookForm.events.includes(event)}"
                  >
                    <div class="relative flex items-center">
                        <input
                        type="checkbox"
                        :value="event"
                        v-model="webhookForm.events"
                        class="peer sr-only"
                        />
                        <div class="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded transition-colors peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center">
                            <span class="material-symbols-outlined text-[14px] text-white opacity-0 peer-checked:opacity-100">check</span>
                        </div>
                    </div>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ event }}</span>
                  </label>
                </div>
                <p v-if="webhookForm.events.length === 0" class="text-xs font-bold text-red-500 mt-2 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">error</span>
                  Pilih minimal 1 event
                </p>
              </div>

              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jumlah Retry</label>
                  <input
                    v-model.number="webhookForm.retryCount"
                    type="number"
                    min="1"
                    max="10"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Timeout (ms)</label>
                  <input
                    v-model.number="webhookForm.timeout"
                    type="number"
                    min="1000"
                    max="30000"
                    step="1000"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div class="relative flex items-center">
                    <input
                    type="checkbox"
                    v-model="webhookForm.isActive"
                    id="isActive"
                    class="peer sr-only"
                    />
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </div>
                <label for="isActive" class="text-sm font-bold text-slate-900 dark:text-white cursor-pointer select-none">Status Aktif</label>
              </div>

              <div class="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  :disabled="saving || webhookForm.events.length === 0"
                  class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                >
                  <div v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {{ saving ? 'Menyimpan...' : 'Simpan Webhook' }}
                </button>
              </div>
            </form>
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

const { confirm, success, error } = useNotification();

const loading = ref(true);
const webhooks = ref<any[]>([]);

const showCreateModal = ref(false);
const editingWebhook = ref<any>(null);
const saving = ref(false);

const availableEvents = [
  'order.created',
  'order.updated',
  'order.completed',
  'order.cancelled',
  'payment.completed',
  'payment.failed',
  'product.created',
  'product.updated',
  'product.deleted',
  'customer.created',
  'customer.updated',
  'subscription.created',
  'subscription.updated',
  'subscription.expired',
];

const webhookForm = ref({
  url: '',
  events: [] as string[],
  isActive: true,
  retryCount: 3,
  timeout: 5000,
});

const loadWebhooks = async () => {
  try {
    const response = await api.get('/webhooks?includeInactive=true');
    webhooks.value = response.data.webhooks || [];
  } catch (error: any) {
    console.error('Error loading webhooks:', error);
  } finally {
    loading.value = false;
  }
};

const saveWebhook = async () => {
  if (webhookForm.value.events.length === 0) {
    return;
  }

  saving.value = true;

  try {
    if (editingWebhook.value) {
      await api.put(`/webhooks/${editingWebhook.value.id}`, webhookForm.value);
    } else {
      await api.post('/webhooks', webhookForm.value);
    }

    await loadWebhooks();
    closeModal();
    await success('Webhook berhasil disimpan', 'Berhasil');
  } catch (err: any) {
    console.error('Error saving webhook:', err);
    await error(err.response?.data?.message || 'Gagal menyimpan webhook', 'Error');
  } finally {
    saving.value = false;
  }
};

const editWebhook = (webhook: any) => {
  editingWebhook.value = webhook;
  webhookForm.value = {
    url: webhook.url,
    events: [...webhook.events],
    isActive: webhook.isActive,
    retryCount: webhook.retryCount || 3,
    timeout: webhook.timeout || 5000,
  };
  showCreateModal.value = true;
};

const deleteWebhook = async (id: string) => {
  const confirmed = await confirm(
    'Hapus Webhook?',
    'Apakah Anda yakin ingin menghapus webhook ini? Tindakan ini tidak dapat dibatalkan.',
    'Ya, Hapus',
    'Batal'
  );
  
  if (!confirmed) return;

  try {
    await api.delete(`/webhooks/${id}`);
    await loadWebhooks();
    await success('Webhook berhasil dihapus', 'Berhasil');
  } catch (err: any) {
    console.error('Error deleting webhook:', err);
    await error(err.response?.data?.message || 'Gagal menghapus webhook', 'Error');
  }
};

const testWebhook = async (id: string) => {
  try {
    await api.post(`/webhooks/${id}/test`);
    await success('Webhook uji coba berhasil dikirim!', 'Berhasil');
  } catch (err: any) {
    console.error('Error testing webhook:', err);
    await error(err.response?.data?.message || 'Gagal mengirim webhook uji coba', 'Error');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingWebhook.value = null;
  webhookForm.value = {
    url: '',
    events: [],
    isActive: true,
    retryCount: 3,
    timeout: 5000,
  };
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadWebhooks();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
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
