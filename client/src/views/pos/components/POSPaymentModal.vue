<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" aria-hidden="true" @click="$emit('close')"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <!-- Modal Panel -->
        <div ref="modalContainer" class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100">
            <div class="sm:flex sm:items-start justify-between">
              <h3 class="text-xl leading-6 font-bold text-slate-900" id="modal-title">
                Pembayaran
              </h3>
              <button @click="$emit('close')" class="bg-slate-100 rounded-lg p-1 text-slate-400 hover:text-slate-500 hover:bg-slate-200 transition-colors">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 flex-1 overflow-y-auto">
            <!-- Total Display -->
            <div class="bg-primary/5 rounded-2xl p-6 text-center mb-6 border border-primary/10">
               <p class="text-sm text-primary font-bold uppercase tracking-wider mb-1">Total Tagihan</p>
               <h2 class="text-4xl font-black text-primary">{{ formatCurrency(total) }}</h2>
               <p v-if="discount > 0" class="text-sm text-green-600 font-bold mt-2 flex items-center justify-center gap-1">
                 <span class="material-symbols-outlined text-[16px]">verified</span>
                 Hemat {{ formatCurrency(discount) }}
               </p>
            </div>

            <!-- Payment Methods -->
            <div class="mb-6">
              <label class="block text-sm font-bold text-slate-700 mb-3">Metode Pembayaran</label>
              <div class="grid grid-cols-3 gap-3">
                <button 
                  v-for="method in methods" 
                  :key="method.id"
                  @click="selectedMethod = method.id"
                  class="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200"
                  :class="selectedMethod === method.id ? 'border-primary bg-blue-50 text-primary' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50'"
                >
                  <span class="material-symbols-outlined text-2xl">{{ method.icon }}</span>
                  <span class="text-xs font-bold">{{ method.label }}</span>
                </button>
              </div>
            </div>

            <!-- Cash Input (only for CASH) -->
            <div v-if="selectedMethod === 'CASH'" class="mb-6 animate-fade-in">
              <label class="block text-sm font-bold text-slate-700 mb-2">Uang Diterima</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                <input 
                  type="number" 
                  v-model.number="cashAmount"
                  ref="cashInput"
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-300"
                  placeholder="0"
                >
              </div>
              
              <!-- Quick Amounts -->
              <div class="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                <button 
                  v-for="amount in quickAmounts" 
                  :key="amount"
                  @click="cashAmount = amount"
                  class="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-slate-200 transition-colors"
                >
                  {{ formatCurrency(amount) }}
                </button>
              </div>

              <!-- Change Display -->
              <div class="mt-4 flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span class="text-sm font-bold text-slate-500">Kembalian</span>
                <span class="text-lg font-black" :class="change >= 0 ? 'text-green-600' : 'text-red-500'">
                  {{ formatCurrency(Math.max(0, change)) }}
                </span>
              </div>
            </div>
            
            <!-- Notes -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Catatan (Optional)</label>
              <textarea 
                v-model="notes"
                rows="2" 
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                placeholder="Tambah catatan untuk pesanan ini..."
              ></textarea>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-100 gap-2">
            <BaseButton
              @click="handleConfirm"
              :loading="processing"
              :disabled="!canPay || processing"
              variant="primary"
              size="lg"
              class="w-full sm:w-auto sm:ml-3 shadow-none hover:shadow-lg transition-all"
            >
              {{ processing ? 'Memproses...' : 'Konfirmasi Bayar' }}
            </BaseButton>
            
            <BaseButton
              @click="$emit('close')"
              :disabled="processing"
              variant="white"
              size="lg"
              class="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto text-slate-700 hover:bg-slate-50 border-slate-200 shadow-none"
            >
              Batal
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  total: number;
  discount: number;
  processing: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', payload: { method: string; cashAmount: number; change: number; notes: string }): void;
}>();

const selectedMethod = ref('CASH');
const cashAmount = ref(0);
const notes = ref('');
const cashInput = ref<HTMLInputElement | null>(null);
const modalContainer = ref<HTMLElement | null>(null);

import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';
import { useFocusTrap } from '@/composables/useFocusTrap';
import BaseButton from '@/components/ui/BaseButton.vue';

useFocusTrap(modalContainer, computed(() => props.show));

useKeyboardShortcuts([
  {
    key: 'F4',
    action: () => {
      if (props.show && !props.processing && canPay.value) {
        handleConfirm();
      }
    }
  },
  {
    key: 'Escape',
    action: () => {
      if (props.show && !props.processing) {
        emit('close');
      }
    }
  }
]);

// Auto focus cash input when cash is selected
watch(() => selectedMethod.value, (newVal) => {
  if (newVal === 'CASH') {
    setTimeout(() => cashInput.value?.focus(), 100);
  }
});

const methods = [
  { id: 'CASH', label: 'Tunai', icon: 'payments' },
  { id: 'QRIS', label: 'QRIS', icon: 'qr_code_scanner' },
  { id: 'TRANSFER', label: 'Transfer', icon: 'account_balance' },
];

const change = computed(() => {
  return cashAmount.value - props.total;
});

const canPay = computed(() => {
  if (selectedMethod.value === 'CASH') {
    return cashAmount.value >= props.total;
  }
  return true;
});

const quickAmounts = computed(() => {
  const t = props.total;
  if (t === 0) return [];
  
  // Create logical quick amounts based on total
  const amounts = [t];
  
  // Round up to nearest 5000, 10000, 20000, 50000, 100000
  const next5k = Math.ceil(t / 5000) * 5000;
  if (next5k > t && !amounts.includes(next5k)) amounts.push(next5k);
  
  const next10k = Math.ceil(t / 10000) * 10000;
  if (next10k > t && !amounts.includes(next10k)) amounts.push(next10k);
  
  const next50k = Math.ceil(t / 50000) * 50000;
  if (next50k > t && !amounts.includes(next50k)) amounts.push(next50k);
  
  const next100k = Math.ceil(t / 100000) * 100000;
  if (next100k > t && !amounts.includes(next100k)) amounts.push(next100k);
  
  return amounts.slice(0, 4); // Limit to 4 options
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const handleConfirm = () => {
  if (!canPay.value) return;
  
  emit('confirm', {
    method: selectedMethod.value,
    cashAmount: selectedMethod.value === 'CASH' ? cashAmount.value : props.total,
    change: selectedMethod.value === 'CASH' ? Math.max(0, change.value) : 0,
    notes: notes.value
  });
};

// Reset state when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    cashAmount.value = 0;
    notes.value = '';
    selectedMethod.value = 'CASH';
  }
});
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
