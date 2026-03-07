<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-all"
      @click.self="close"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 font-display">
        <!-- Header -->
        <div class="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 class="text-xl font-bold text-slate-900">Payment Method</h3>
            <p class="text-sm text-slate-500 font-medium">Select how to pay</p>
          </div>
          <button
            @click="close"
            class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition shadow-sm"
          >
            <span class="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto custom-scrollbar">
          <!-- Total Card -->
          <div class="mb-6 p-5 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
            <div class="flex justify-between items-center mb-2">
              <span class="text-slate-600 font-medium">Total Payment</span>
              <span class="text-2xl font-black text-blue-600">{{ formatCurrency(total) }}</span>
            </div>
            <div v-if="discount > 0" class="flex justify-between items-center text-sm font-medium pt-2 border-t border-emerald-200/50 mt-2">
              <span class="text-blue-700">Discount Applied</span>
              <span class="text-blue-700">-{{ formatCurrency(discount) }}</span>
            </div>
          </div>

          <!-- Payment Methods Selection -->
          <div class="mb-6">
            <label class="block text-sm font-bold text-slate-700 mb-2">
              Select Method
            </label>
            <div class="grid grid-cols-2 gap-3">
               <button
                 v-for="method in paymentMethods"
                 :key="method.value"
                 @click="selectedPayment = method.value; onPaymentMethodChange()"
                 class="p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all duration-200 group"
                 :class="selectedPayment === method.value ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-md shadow-blue-500/10' : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-white hover:border-emerald-200 hover:shadow-sm'"
               >
                 <span class="text-3xl filter drop-shadow-sm transition-transform group-hover:scale-110 duration-200">{{ method.icon }}</span>
                 <span class="font-bold text-sm">{{ method.label }}</span>
               </button>
            </div>
          </div>

          <!-- Cash Payment Input -->
          <div v-if="selectedPayment === 'CASH'" class="mb-6 animate-in slide-in-from-top-2 duration-200">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">
                  Cash Received
                </label>
                <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <span class="text-slate-400 font-bold">Rp</span>
                   </div>
                   <input
                    v-model.number="cashAmount"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent hover:bg-white focus:bg-white focus:border-blue-500 rounded-xl transition-all outline-none font-bold text-lg text-slate-900 placeholder:text-slate-400"
                    @input="calculateChange"
                  />
                </div>
                <!-- Quick Amount Buttons -->
                 <div class="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                    <button 
                      v-for="amount in quickAmounts" 
                      :key="amount"
                      @click="cashAmount = amount"
                      class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold whitespace-nowrap transition"
                    >
                      {{ formatCurrency(amount) }}
                    </button>
                 </div>
              </div>
              
              <div v-if="change >= 0" class="p-4 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95 duration-200">
                <div class="flex justify-between items-center">
                  <span class="text-blue-700 font-bold">Change Due</span>
                  <span class="text-2xl font-black text-blue-600">{{ formatCurrency(change) }}</span>
                </div>
              </div>
              <div v-else-if="cashAmount > 0" class="p-4 bg-red-50 rounded-xl border border-red-100 animate-in fade-in zoom-in-95 duration-200">
                <div class="flex justify-between items-center">
                  <span class="text-red-700 font-bold">Insufficent</span>
                  <span class="text-xl font-black text-red-600">{{ formatCurrency(Math.abs(change)) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- QRIS Payment Input -->
          <div v-if="selectedPayment === 'QRIS'" class="mb-6 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">
                QR Code Ref (Optional)
              </label>
              <input
                v-model="qrCode"
                type="text"
                placeholder="Direct scan or enter ref..."
                class="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium transition"
              />
            </div>
            <div class="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
              <span class="text-2xl">💡</span>
              <p class="text-sm text-blue-700 font-medium leading-relaxed">
                Scan QR Code using E-Wallet apps (DANA, OVO, ShopeePay, etc).
              </p>
            </div>
          </div>
        </div>

        <div class="p-6 bg-white border-t border-slate-100 flex gap-3 sticky bottom-0 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
          <button
            @click="close"
            class="flex-1 px-4 py-3 border-2 border-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-200 transition"
          >
            Cancel
          </button>
          <button
            @click="confirmPayment"
            :disabled="!canConfirm || processing"
            class="flex-[2] px-4 py-3 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            <span v-if="processing" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ processing ? 'Processing...' : `Pay ${formatCurrency(total)}` }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { formatCurrency } from '../utils/formatters';

interface Props {
  show: boolean;
  total: number;
  discount?: number;
  processing?: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'confirm', data: { paymentMethod: string; cashAmount?: number; qrCode?: string }): void;
}

const props = withDefaults(defineProps<Props>(), {
  discount: 0,
  processing: false,
});

const emit = defineEmits<Emits>();

const selectedPayment = ref<string>('');
const cashAmount = ref<number>(0);
const qrCode = ref<string>('');

const paymentMethods = [
  { value: 'CASH', label: 'Cash', icon: '💵' },
  { value: 'QRIS', label: 'QRIS', icon: '📲' },
  { value: 'BANK_TRANSFER', label: 'Bank', icon: '🏦' },
  { value: 'SHOPEEPAY', label: 'ShopeePay', icon: '🛒' },
  { value: 'DANA', label: 'DANA', icon: '💙' },
];

const finalTotal = computed(() => {
  return props.total; // Total passed in should already be discounted if needed, but let's respect prop
});

const change = computed(() => {
  if (selectedPayment.value !== 'CASH' || !cashAmount.value) return 0;
  return cashAmount.value - finalTotal.value;
});

const canConfirm = computed(() => {
  if (!selectedPayment.value) return false;
  if (selectedPayment.value === 'CASH') {
    return cashAmount.value >= finalTotal.value;
  }
  return true;
});

const quickAmounts = computed(() => {
  const total = finalTotal.value;
  if (total <= 0) return [];
  return [
    total,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total).slice(0, 4);
});

const calculateChange = () => {
  // Auto-calculate change
};

const close = () => {
  selectedPayment.value = '';
  cashAmount.value = 0;
  qrCode.value = '';
  emit('close');
};

const onPaymentMethodChange = () => {
  if (selectedPayment.value === 'CASH') {
    if (!cashAmount.value || cashAmount.value < finalTotal.value) {
      cashAmount.value = finalTotal.value;
    }
  }
};

const confirmPayment = () => {
  if (!canConfirm.value) return;
  
  const paymentData: { paymentMethod: string; cashAmount?: number; qrCode?: string } = {
    paymentMethod: selectedPayment.value,
  };
  
  if (selectedPayment.value === 'CASH') {
    paymentData.cashAmount = cashAmount.value;
  } else if (selectedPayment.value === 'QRIS') {
    paymentData.qrCode = qrCode.value || undefined;
  }
  
  emit('confirm', paymentData);
};

watch(() => props.total, (newTotal) => {
  if (selectedPayment.value === 'CASH') {
     // If cash was default (exact), update it
     if (Math.abs(cashAmount.value - (newTotal - (props.discount || 0))) < 100) {
        cashAmount.value = newTotal;
     }
  }
});

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    selectedPayment.value = ''; 
    cashAmount.value = 0;
    qrCode.value = '';
  }
});
</script>
