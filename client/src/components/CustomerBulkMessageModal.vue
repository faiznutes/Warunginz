<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="close"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <span class="material-symbols-outlined text-[24px]">send</span>
              </div>
              <div>
                <h3 class="text-xl font-black text-slate-900 dark:text-white">Kirim Pesan Massal</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ selectedCount }} pelanggan terpilih
                </p>
              </div>
            </div>
            <button
              @click="close"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Message Type -->
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Tipe Pesan <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="type in messageTypes"
                  :key="type.value"
                  @click="messageType = type.value"
                  class="p-4 rounded-xl border-2 transition-all text-left"
                  :class="messageType === type.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'"
                >
                  <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-[24px]" :class="messageType === type.value ? 'text-blue-600' : 'text-slate-400'">
                      {{ type.icon }}
                    </span>
                    <div>
                      <div class="font-bold text-slate-900 dark:text-white">{{ type.label }}</div>
                      <div class="text-xs text-slate-500 dark:text-slate-400">{{ type.description }}</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Message Content -->
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Isi Pesan <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="message"
                rows="6"
                class="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none transition-all"
                placeholder="Tulis pesan yang ingin dikirim ke pelanggan..."
                :maxlength="messageType === 'SMS' ? 160 : 1000"
              ></textarea>
              <div class="flex items-center justify-between mt-2">
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  <span v-if="messageType === 'SMS'">
                    {{ message.length }}/160 karakter
                    <span v-if="message.length > 160" class="text-amber-500">(akan terpotong menjadi beberapa SMS)</span>
                  </span>
                  <span v-else>
                    {{ message.length }}/1000 karakter
                  </span>
                </p>
                <button
                  @click="insertTemplate"
                  class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Gunakan Template
                </button>
              </div>
            </div>

            <!-- Preview -->
            <div v-if="message" class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Preview</p>
              <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <p class="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ message }}</p>
              </div>
            </div>

            <!-- Warning -->
            <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div class="flex items-start gap-3">
                <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px]">info</span>
                <div class="flex-1">
                  <p class="text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">Peringatan</p>
                  <p class="text-xs text-amber-800 dark:text-amber-300">
                    Pesan akan dikirim ke {{ selectedCount }} pelanggan. Pastikan pesan sudah benar sebelum mengirim.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <button
              @click="close"
              class="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              @click="sendMessages"
              :disabled="!message || !message.trim() || sending"
              class="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <div v-if="sending" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span v-else class="material-symbols-outlined text-[20px]">send</span>
              {{ sending ? 'Mengirim...' : 'Kirim Pesan' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  show: boolean;
  selectedCount: number;
}

interface Emits {
  (e: 'close'): void;
  (e: 'send', data: { message: string; type: 'SMS' | 'EMAIL' | 'WHATSAPP' }): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const messageType = ref<'SMS' | 'EMAIL' | 'WHATSAPP'>('SMS');
const message = ref('');
const sending = ref(false);

const messageTypes = [
  {
    value: 'SMS' as const,
    label: 'SMS',
    description: 'Pesan teks singkat',
    icon: 'sms',
  },
  {
    value: 'EMAIL' as const,
    label: 'Email',
    description: 'Pesan via email',
    icon: 'mail',
  },
  {
    value: 'WHATSAPP' as const,
    label: 'WhatsApp',
    description: 'Pesan via WhatsApp',
    icon: 'chat',
  },
];

const insertTemplate = () => {
  const templates = [
    'Halo {{nama}}, terima kasih telah berbelanja di toko kami!',
    'Halo {{nama}}, ada promo spesial untuk Anda hari ini!',
    'Halo {{nama}}, pesanan Anda sudah siap diambil.',
  ];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  message.value = randomTemplate;
};

const sendMessages = () => {
  if (!message.value.trim()) return;
  
  emit('send', {
    message: message.value.trim(),
    type: messageType.value,
  });
};

const close = () => {
  if (sending.value) return;
  message.value = '';
  messageType.value = 'SMS';
  emit('close');
};

defineExpose({
  close,
});
</script>

