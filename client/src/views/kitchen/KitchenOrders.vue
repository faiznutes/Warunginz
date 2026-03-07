<template>
  <div class="flex flex-col h-screen bg-slate-100/50 overflow-hidden font-display text-slate-900 mx-auto w-full">
    <!-- Header -->
    <header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 px-6 py-4 bg-white z-20 shrink-0 shadow-sm relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      <div class="flex items-center gap-4 text-slate-900">
        <div class="size-10 flex items-center justify-center bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 shadow-sm">
          <span class="material-symbols-outlined">skillet</span>
        </div>
        <div>
          <h2 class="text-slate-900 text-xl font-bold leading-tight tracking-tight">Warungin | Dapur</h2>
          <p class="text-slate-500 text-xs font-medium">KDS - {{ authStore.user?.role === 'KITCHEN' ? 'Kitchen Staff' : 'Supervisor Mode' }}</p>
        </div>
      </div>
      <div class="flex flex-1 justify-end gap-6 items-center">
        <div class="hidden md:flex flex-col items-end mr-4">
          <span class="text-2xl font-bold leading-none text-slate-700">{{ currentTime }}</span>
          <span class="text-xs text-slate-500 font-medium">{{ currentDate }}</span>
        </div>
        <div class="flex gap-3">
          <div class="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-green-600 text-white text-sm font-bold shadow-md">
            <span class="material-symbols-outlined text-[20px]">wifi</span>
            <span class="hidden sm:inline">{{ connected ? 'Online' : 'Offline' }}</span>
          </div>
          
          <button 
            @click="handleLogout"
            class="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors shadow-sm font-bold text-sm"
          >
            <span class="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>

          <!-- Mobile logout icon only -->
          <button 
            @click="handleLogout"
            class="md:hidden flex items-center justify-center rounded-lg h-10 w-10 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
          >
            <span class="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Filter Bar -->
    <div class="px-6 py-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shrink-0 bg-white/80 backdrop-blur border-b border-slate-200 z-10 sticky top-0">
      <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
        <button 
          @click="activeFilter = 'ALL'"
          class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 shadow-sm border transition-all duration-200"
          :class="activeFilter === 'ALL' ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/20' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-600/50 hover:bg-indigo-50 hover:text-indigo-600'"
        >
          <span class="text-sm font-bold">Semua ({{ orders.length }})</span>
        </button>
        <button 
          @click="activeFilter = 'DINE_IN'"
          class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 shadow-sm border transition-all duration-200"
           :class="activeFilter === 'DINE_IN' ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/20' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-600/50 hover:bg-indigo-50 hover:text-indigo-600'"
        >
          <span class="material-symbols-outlined text-[18px]">restaurant</span>
          <span class="text-sm font-medium">Dine In</span>
        </button>
        <button 
          @click="activeFilter = 'TAKE_AWAY'"
          class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 shadow-sm border transition-all duration-200"
           :class="activeFilter === 'TAKE_AWAY' ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-500/20' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-600/50 hover:bg-indigo-50 hover:text-indigo-600'"
        >
          <span class="material-symbols-outlined text-[18px]">takeout_dining</span>
          <span class="text-sm font-medium">Takeaway</span>
        </button>
      </div>
      <div class="flex items-center gap-3 ml-auto">
        <span class="text-slate-500 text-sm font-medium hidden sm:inline">Urutkan:</span>
        <button @click="handleSortToggle" class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white border border-slate-300 px-3 hover:bg-slate-50 text-slate-700 shadow-sm">
          <span class="material-symbols-outlined text-[20px] text-slate-500">schedule</span>
          <span class="text-sm font-medium">Waktu (Lama &gt; Baru)</span>
          <span class="material-symbols-outlined text-[20px] text-slate-400">arrow_drop_down</span>
        </button>
      </div>
    </div>

    <!-- Main Board -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="w-12 h-12 border-4 border-[#ec6d13] border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else-if="filteredOrders.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-400">
        <span class="material-symbols-outlined text-[64px] mb-4">skillet_off</span>
        <p class="text-lg font-medium">Tidak ada pesanan aktif</p>
        <p class="text-sm">Pesanan baru akan muncul di sini</p>
    </div>

    <div v-else class="flex-1 overflow-y-auto px-6 pb-6 pt-6">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        
        <!-- Order Card -->
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="flex flex-col rounded-xl border-l border-r border-b border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow h-full animate-fade-in"
          :class="{
            'border-t-4 border-t-red-500': getOrderType(order) === 'Dine In',
            'border-t-4 border-t-orange-500': getOrderType(order) === 'Takeaway',
            'border-t-4 border-t-blue-500': getOrderType(order) === 'Delivery'
          }"
        >
          <!-- Card Header -->
          <div 
            class="flex items-start justify-between p-4 border-b border-slate-100"
            :class="{
              'bg-red-50/30': getOrderType(order) === 'Dine In',
              'bg-orange-50/30': getOrderType(order) === 'Takeaway',
              'bg-blue-50/30': getOrderType(order) === 'Delivery'
            }"
          >
            <div class="flex flex-col">
              <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                {{ order.table ? `Meja ${order.table.number}` : getOrderType(order) }}
                <span 
                  class="px-2.5 py-1 rounded text-[11px] font-bold border uppercase tracking-wider"
                  :class="{
                    'bg-blue-100 text-blue-700 border-blue-200': getOrderType(order) === 'Dine In',
                    'bg-yellow-100 text-yellow-700 border-yellow-200': getOrderType(order) === 'Takeaway',
                    'bg-green-100 text-green-700 border-green-200': getOrderType(order) === 'Delivery'
                  }"
                >
                  {{ getOrderType(order) }}
                </span>
              </h3>
              <p class="text-slate-500 text-sm font-mono mt-1 font-medium">#{{ order.orderNumber }} • {{ order.customerName || 'Guest' }}</p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <div 
                class="px-3 py-1.5 rounded-lg border font-bold text-lg font-mono shadow-sm"
                :class="{
                  'bg-red-100 border-red-200 text-red-700 animate-pulse': isLate(order.createdAt),
                  'bg-slate-100 border-slate-200 text-slate-700': !isLate(order.createdAt)
                }"
              >
                {{ formatTime(order.createdAt) }}
              </div>
              <span class="text-[10px] font-bold text-slate-400">{{ getElapsedMinutes(order.createdAt) }} min ago</span>
            </div>
          </div>

          <!-- Items List -->
          <div class="p-4 flex-1 flex flex-col gap-4">
            <div v-for="item in order.items" :key="item.id">
               <label class="flex items-start gap-3 group cursor-pointer p-2 -mx-2 rounded hover:bg-slate-50 transition-colors select-none">
                <input 
                  type="checkbox" 
                  class="mt-1 w-5 h-5 rounded border-slate-300 text-[#ec6d13] focus:ring-[#ec6d13]/20 transition-all cursor-pointer"
                  :checked="checkedItems[item.id]"
                  @change="toggleItemCheck(item.id)"
                />
                <div class="flex flex-col" :class="{ 'opacity-50 line-through decoration-slate-400 decoration-2': checkedItems[item.id] }">
                  <span class="text-lg font-bold text-slate-800 leading-tight">
                    {{ item.quantity }}x {{ item.productName }}
                  </span>
                  <span v-if="item.notes" class="text-sm text-red-600 font-semibold italic mt-1 bg-red-50 px-2 py-0.5 rounded w-fit">
                    Note: {{ item.notes }}
                  </span>
                  <!-- Modifiers if any -->
                  <div v-if="item.modifiers && item.modifiers.length > 0" class="text-sm text-slate-500 mt-0.5">
                    <span v-for="mod in item.modifiers" :key="mod.id" class="block">+ {{ mod.name }}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-4 pt-0 mt-auto">
            <button 
              @click="markOrderServed(order)"
              class="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base tracking-wide transition-all shadow-md active:scale-[0.98] shadow-indigo-500/20"
            >
              <span class="material-symbols-outlined">check_circle</span>
              Sajikan Semua
            </button>
          </div>
        </div>

      </div>
    </div>
    
    <!-- Settings Modal -->
    <KitchenSettingsModal 
      :is-open="settingsModalOpen" 
      @close="settingsModalOpen = false"
      @store-changed="loadOrders"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useSocket } from '../../composables/useSocket';
import { useNotification } from '../../composables/useNotification';
import { useSystemStatus } from '../../composables/useSystemStatus';
import api from '../../api';
import KitchenSettingsModal from '../../components/kitchen/KitchenSettingsModal.vue';

// Init
const authStore = useAuthStore();
const { socket, connected } = useSocket();
const { success, error, confirm: confirmDialog } = useNotification();
const { currentTime } = useSystemStatus();

// State
const orders = ref<any[]>([]);
const loading = ref(true);
const activeFilter = ref('ALL');
const settingsModalOpen = ref(false);
const currentDate = ref('');
const checkedItems = ref<Record<string, boolean>>({});

// Computed
const filteredOrders = computed(() => {
  if (activeFilter.value === 'ALL') return orders.value;
  
  return orders.value.filter(order => {
    const type = getOrderType(order);
    if (activeFilter.value === 'DINE_IN' && type === 'Dine In') return true;
    if (activeFilter.value === 'TAKE_AWAY' && type === 'Takeaway') return true;
    return false;
  });
});

// Helpers
const getOrderType = (order: any) => {
  if (order.table) return 'Dine In';
  if (order.isDelivery) return 'Delivery';
  return 'Takeaway';
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const isLate = (dateStr: string) => {
  const diffInMinutes = getElapsedMinutes(dateStr);
  return diffInMinutes > 15; // 15 mins threshhold
};

const getElapsedMinutes = (dateStr: string) => {
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now.getTime() - created.getTime();
  return Math.floor(diffMs / 60000);
};

// Logic
const toggleItemCheck = (itemId: string) => {
  checkedItems.value[itemId] = !checkedItems.value[itemId];
};

const handleLogout = () => {
  authStore.clearAuth();
  window.location.replace('/login');
};

const handleSortToggle = () => {
  // Orders are already sorted by time (oldest first) - inform user
  success('Pesanan diurutkan dari yang paling lama. Pesanan terlama muncul di atas.', 'Urutan Aktif');
};

const loadOrders = async () => {
  loading.value = true;
  try {
    const response = await api.get('/orders', {
      params: {
        sendToKitchen: true,
        kitchenStatus: ['PENDING', 'COOKING', 'READY'],
      },
    });
    // Sort by oldest first
    const newOrders = response.data.data || response.data;
    orders.value = newOrders.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    // Restore checks if possible (optional enhancement, currently simple local state)
  } catch (err) {
    console.error('Failed to load orders', err);
  } finally {
    loading.value = false;
  }
};

const markOrderServed = async (order: any) => {
  const confirmed = await confirmDialog(
    `Selesaikan pesanan #${order.orderNumber}?`,
    'Konfirmasi Penyajian',
    'Ya, Sajikan',
    'Batal'
  );

  if (!confirmed) return;

  try {
    await api.put(`/orders/${order.id}/kitchen-status`, { status: 'SERVED' });
    
    // Optimistic update
    orders.value = orders.value.filter(o => o.id !== order.id);
    
    if (socket?.connected) {
      socket.emit('order:update', { orderId: order.id, status: 'SERVED' });
    }
    
    success('Pesanan disajikan!', 'Berhasil');
  } catch (err: any) {
    error(err.response?.data?.message || 'Gagal update status', 'Error');
  }
};

// Lifecycle
let dateInterval: any;
let refreshInterval: any;

onMounted(() => {
  loadOrders();
  
  // Date clock
  const updateDate = () => {
    currentDate.value = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
  };
  updateDate();
  dateInterval = setInterval(updateDate, 60000);
  
  // Auto refresh elapsed time
  refreshInterval = setInterval(() => {
    // Just force update
    orders.value = [...orders.value]; 
  }, 60000);

  if (socket) {
    socket.on('order:new', loadOrders);
    socket.on('order:update', (data: any) => {
      // If status became SERVED, remove it, else reload/update
      if (data.status === 'SERVED') {
        orders.value = orders.value.filter(o => o.id !== data.orderId);
      } else {
        loadOrders(); // Simpler to reload to get full structure
      }
    });
  }
  
  // Super admin sync check (if applicable)
  if (authStore.isSuperAdmin) {
     const storedTenantId = localStorage.getItem('selectedTenantId');
     if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
        authStore.setSelectedTenant(storedTenantId);
        loadOrders();
     }
  }
});

onUnmounted(() => {
  clearInterval(dateInterval);
  clearInterval(refreshInterval);
  if (socket) {
    socket.off('order:new');
    socket.off('order:update');
  }
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
