<template>
  <aside data-testid="pos-cart-sidebar" class="glass-effect flex flex-col border-l border-slate-200 h-[40vh] lg:h-full relative shadow-2xl lg:shadow-none z-30">
    <!-- Cart Header -->
    <div class="p-5 border-b border-slate-100 bg-white/60 sticky top-0 z-10 space-y-3">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-extrabold text-slate-900">Pesanan Saat Ini</h2>
        <span class="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded">
          #{{ lastOrderReceipt?.orderNumber || 'NEW' }}
        </span>
      </div>
      
      <!-- Customer Selector (Compact) -->
      <div class="flex gap-2 relative">
        <button 
          @click="showLocalCustomerModal = !showLocalCustomerModal" 
          class="flex-1 flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-blue-400 hover:shadow-sm transition-all text-left group"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-slate-400 group-hover:text-primary text-[20px]">person</span>
            <span class="font-medium truncate">{{ isMember ? (selectedMember?.name || 'Pilih Member') : (customerName || 'Pelanggan Umum') }}</span>
          </div>
          <span class="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
        </button>
        <!-- Simple toggle or add -->
        <button @click="toggleCustomerType" class="w-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-primary hover:bg-blue-50 hover:border-emerald-200 transition-colors shadow-sm" title="Switch Type" aria-label="Ganti tipe pelanggan">
          <span class="material-symbols-outlined text-[20px]">{{ isMember ? 'person_off' : 'person_add' }}</span>
        </button>

        <!-- Customer Input Expansion -->
        <div v-if="showLocalCustomerModal" class="absolute top-full left-0 right-0 mt-2 p-4 bg-white shadow-xl border border-slate-200 rounded-xl z-20">
          <div class="flex gap-2 mb-2">
            <button @click="setCustomerType('customer')" :class="!isMember ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'" class="flex-1 py-2 rounded-lg text-xs font-bold transition-colors">Pelanggan</button>
            <button @click="setCustomerType('member')" :class="isMember ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'" class="flex-1 py-2 rounded-lg text-xs font-bold transition-colors">Member</button>
          </div>
          
          <div v-if="!isMember">
            <input 
              :value="customerName"
              @input="$emit('update:customerName', ($event.target as HTMLInputElement).value)"
              placeholder="Nama Pelanggan" 
              class="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
            />
          </div>
          <div v-else>
            <select 
              :value="selectedMember?.id || ''" 
              @change="handleMemberSelectChange" 
              class="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="">Pilih Member</option>
              <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <button @click="showLocalCustomerModal = false" class="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">Selesai</button>
        </div>
      </div>
    </div>

    <!-- Cart Items -->
    <div class="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
      <div v-if="safeCart.length === 0" class="flex flex-col items-center justify-center h-full text-slate-500 opacity-60">
        <span class="material-symbols-outlined text-6xl mb-2">shopping_bag</span>
        <p class="font-medium">Keranjang kosong</p>
        <p class="text-xs">Pindai barcode atau pilih item</p>
      </div>
      
      <TransitionGroup name="list" tag="div" class="space-y-5">
      <div 
        v-for="item in safeCart" 
        :key="item.id"
        class="flex gap-3 group relative transition-all duration-300"
      >
        <!-- Item Image -->
        <div class="w-16 h-16 rounded-xl bg-slate-100 shrink-0 border border-slate-100 shadow-sm overflow-hidden">
          <img v-if="item.image" :src="item.image" class="w-full h-full object-cover">
          <div v-else class="w-full h-full flex items-center justify-center text-xl">{{ item.emoji || '📦' }}</div>
        </div>
        
        <!-- Details -->
        <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div class="flex justify-between items-start">
            <h4 class="text-slate-800 text-sm font-bold truncate pr-2">{{ item.name }}</h4>
            <p class="text-slate-900 font-bold text-sm">{{ formatCurrency(item.price * item.quantity) }}</p>
          </div>
          
          <div class="flex justify-between items-end mt-1">
            <p class="text-slate-500 text-xs truncate bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 max-w-[120px]">
              {{ formatCurrency(item.price) }}/unit
            </p>
            
            <!-- Qty Controls -->
            <div class="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 h-8 shadow-sm">
              <button @click="updateQuantity(item, -1)" class="text-slate-400 hover:text-red-500 flex items-center justify-center w-6 h-full transition-colors" aria-label="Kurangi jumlah">
                <span class="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span class="text-slate-800 text-sm font-bold w-4 text-center">{{ item.quantity }}</span>
              <button @click="updateQuantity(item, 1)" class="text-primary hover:text-blue-700 flex items-center justify-center w-6 h-full transition-colors" aria-label="Tambah jumlah">
                <span class="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </TransitionGroup>
    </div>

    <!-- Total & Actions -->
    <div class="px-5 py-3 grid grid-cols-4 gap-2 border-t border-slate-100 bg-slate-50/50 backdrop-blur-sm">
      <button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-blue-50 hover:text-primary text-slate-500 transition-all shadow-sm" @click="$emit('hold-order')">
        <span class="material-symbols-outlined text-[20px]">pause_circle</span>
        <span class="text-[10px] font-bold">Tahan</span>
      </button>
      <button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-blue-50 hover:text-primary text-slate-500 transition-all shadow-sm">
        <span class="material-symbols-outlined text-[20px]">percent</span>
        <span class="text-[10px] font-bold">Diskon</span>
      </button>
      <button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary hover:bg-blue-50 hover:text-primary text-slate-500 transition-all shadow-sm" @click="$emit('split-bill')">
        <span class="material-symbols-outlined text-[20px]">call_split</span>
        <span class="text-[10px] font-bold">Pisah</span>
      </button>
      <button class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500 transition-all shadow-sm" @click="$emit('clear-cart')">
        <span class="material-symbols-outlined text-[20px]">delete</span>
        <span class="text-[10px] font-bold">Hapus</span>
      </button>
    </div>
    
    <div class="bg-white border-t border-slate-200 p-5 pb-6 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] relative z-10">
      <div class="space-y-3 mb-5">
        <div class="flex justify-between text-slate-500 text-sm font-medium">
          <span>Subtotal</span>
          <span class="text-slate-800">{{ formatCurrency(subtotal) }}</span>
        </div>
        <div class="flex justify-between text-slate-500 text-sm font-medium">
          <span>Tax (10%)</span>
          <span class="text-slate-800">{{ formatCurrency(tax || 0) }}</span>
        </div>
        <div class="flex justify-between text-sm text-primary font-medium" v-if="discount > 0">
          <span>Diskon</span>
          <span>-{{ formatCurrency(discount) }}</span>
        </div>
        <div class="h-px w-full bg-slate-100 my-2"></div>
        <div class="flex justify-between items-center">
          <span class="text-slate-900 font-bold text-lg">Total</span>
          <span class="text-3xl font-extrabold text-primary-dark">{{ formatCurrency(total) }}</span>
        </div>
      </div>
      
      <!-- Kitchen Toggle (F&B Feature) -->
      <div class="flex items-center justify-between gap-2 mb-4 px-1 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm" v-if="normalizedUserRole !== 'CASHIER' && normalizedUserRole !== 'KITCHEN'">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
            <span class="material-symbols-outlined text-xl">restaurant</span>
          </div>
          <span class="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Kirim ke Dapur?</span>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            :checked="sendToKitchen" 
            @change="$emit('update:sendToKitchen', ($event.target as HTMLInputElement).checked)"
            class="sr-only peer"
          >
          <div class="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
        </label>
      </div>

      <button 
        @click="playSound('click'); $emit('checkout')" 
        :disabled="safeCart.length === 0"
        class="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary-hover hover:to-blue-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transform active:scale-[0.98] transition-all flex justify-between items-center px-6 ring-4 ring-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>BAYAR</span>
        <span class="bg-black/10 px-3 py-1 rounded-lg text-base font-bold">{{ formatCurrency(total) }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSound } from '@/composables/useSound';

// Types
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  [key: string]: any;
}

interface Member {
  id: string;
  name: string;
  [key: string]: any;
}

const props = withDefaults(defineProps<{
  cart: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  lastOrderReceipt?: any;
  customerName?: string;
  customerType: 'customer' | 'member';
  selectedMember?: Member | null;
  members: Member[];
  userRole?: string;
  sendToKitchen: boolean;
}>(), {
  cart: () => [],
  subtotal: 0,
  tax: 0,
  discount: 0,
  total: 0,
  customerName: '',
  customerType: 'customer',
  selectedMember: null,
  members: () => [],
  userRole: '',
  sendToKitchen: false,
});

const emit = defineEmits<{
  (e: 'update:customerName', name: string): void;
  (e: 'update:customerType', type: 'customer' | 'member'): void;
  (e: 'update:selectedMember', member: Member | null): void;
  (e: 'update:sendToKitchen', value: boolean): void;
  (e: 'update-quantity', item: CartItem, change: number): void;
  (e: 'remove-item', item: CartItem): void;
  (e: 'hold-order'): void;
  (e: 'split-bill'): void;
  (e: 'clear-cart'): void;
  (e: 'checkout'): void;
}>();

const showLocalCustomerModal = ref(false);

const isMember = computed(() => props.customerType === 'member');
const safeCart = computed(() => (Array.isArray(props.cart) ? props.cart : []));
const normalizedUserRole = computed(() => String(props.userRole || '').toUpperCase());

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const { playSound } = useSound();

const updateQuantity = (item: CartItem, change: number) => {
  if (change > 0) playSound('click');
  else if (item.quantity === 1) playSound('delete');
  else playSound('click');
  
  emit('update-quantity', item, change);
};

const setCustomerType = (type: 'customer' | 'member') => {
  playSound('click');
  emit('update:customerType', type);
};

const toggleCustomerType = () => {
  playSound('click');
  setCustomerType(isMember.value ? 'customer' : 'member');
};


const handleMemberSelectChange = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  const memberId = select.value;
  if (!memberId) {
    emit('update:selectedMember', null);
    return;
  }
  const member = (Array.isArray(props.members) ? props.members : []).find(m => m.id === memberId);
  if (member) {
    emit('update:selectedMember', member);
  }
};
</script>

<style scoped>
.glass-effect {
  backdrop-filter: blur(8px); /* Optional: add blur */
}

/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
