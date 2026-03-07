<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="relative p-2 text-[#4c739a] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors focus:outline-none"
      title="Notifikasi"
    >
      <span class="material-symbols-outlined">notifications</span>
      <span
        v-if="unreadCount > 0"
        class="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-[#1e293b]"
      ></span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
    >
      <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h3 class="font-bold text-[#0d141b] dark:text-white">Notifikasi</h3>
        <button
          @click="markAllRead"
          class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          v-if="unreadCount > 0"
        >
          Tandai sudah dibaca
        </button>
      </div>

      <div class="max-h-96 overflow-y-auto custom-scrollbar">
        <div v-if="loading" class="p-4 text-center text-slate-500 text-sm">
          Memuat...
        </div>
        
        <div v-else-if="notifications.length === 0" class="p-8 text-center text-slate-500 dark:text-slate-400">
          <span class="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600">notifications_off</span>
          <p class="text-sm">Tidak ada notifikasi baru</p>
        </div>

        <ul v-else class="divide-y divide-slate-100 dark:divide-slate-700">
          <li
            v-for="(notif, index) in notifications"
            :key="index"
            class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-default"
            :class="{ 'bg-blue-50/50 dark:bg-blue-900/10': !notif.read }"
          >
            <div class="flex gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                :class="getIconClass(notif.type)"
              >
                <span class="material-symbols-outlined text-[20px]">{{ getIcon(notif.type) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-[#0d141b] dark:text-white">{{ notif.title }}</p>
                <p class="text-xs text-[#4c739a] dark:text-slate-400 mt-1">{{ notif.message }}</p>
                <p class="text-[10px] text-slate-400 mt-2">{{ formatDate(notif.date) }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Backdrop to close -->
    <div v-if="isOpen" class="fixed inset-0 z-40 bg-transparent" @click="isOpen = false"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../api';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const isOpen = ref(false);
const loading = ref(false);
const rawNotifications = ref<any[]>([]);

// Notification types: 'LOW_STOCK', 'SUBSCRIPTION', 'SYSTEM'
interface Notification {
  id: string;
  type: 'LOW_STOCK' | 'SUBSCRIPTION' | 'SYSTEM';
  title: string;
  message: string;
  date: Date;
  read: boolean;
}

const notifications = computed(() => {
  const sorted = [...rawNotifications.value];
  sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
  return sorted;
});
const unreadCount = computed(() => rawNotifications.value.filter(n => !n.read).length);
const currentRole = computed(() => authStore.user?.role || '');
const canSeeNotificationCenter = computed(() =>
  ['SUPER_ADMIN', 'ADMIN_TENANT', 'SUPERVISOR'].includes(currentRole.value),
);
const canSeeStockAlerts = computed(() =>
  ['ADMIN_TENANT', 'SUPERVISOR'].includes(currentRole.value),
);
const canSeeSubscriptionAlerts = computed(() => currentRole.value === 'ADMIN_TENANT');

const toggleDropdown = () => {
  if (!canSeeNotificationCenter.value) {
    return;
  }
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    refreshNotifications();
  }
};

const getIcon = (type: string) => {
  switch (type) {
    case 'LOW_STOCK': return 'inventory_2';
    case 'SUBSCRIPTION': return 'card_membership';
    case 'SYSTEM': return 'info';
    default: return 'notifications';
  }
};

const getIconClass = (type: string) => {
  switch (type) {
    case 'LOW_STOCK': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    case 'SUBSCRIPTION': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'SYSTEM': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const markAllRead = () => {
  rawNotifications.value.forEach(n => n.read = true);
  // Persist read state if possible? 
  // For now, we rely on local state or maybe session storage
};

const refreshNotifications = async () => {
  if (!canSeeNotificationCenter.value) {
    rawNotifications.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  const newNotifications: Notification[] = [];

  try {
    // 1. Check Low Stock (Admin Tenant / Supervisor only)
    if (canSeeStockAlerts.value) {
      try {
        const stockRes = await api.get('/stock-alerts/low-stock');
        const lowStockItems = Array.isArray(stockRes.data) ? stockRes.data : [];
        if (lowStockItems.length > 0) {
           // Group into one or few notifications
           const count = lowStockItems.length;
           newNotifications.push({
             id: 'stock-alert',
             type: 'LOW_STOCK',
             title: 'Stok Menipis',
             message: `${count} produk memiliki stok di bawah batas minimum.`,
             date: new Date(),
             read: false
           });
        }
      } catch (e) {
        console.error('Failed to fetch stock alerts', e);
      }
    }

    // 2. Check Subscription (Admin Tenant only)
    if (canSeeSubscriptionAlerts.value) {
      try {
        const subRes = await api.get('/subscriptions/current');
        const sub = subRes.data;
        if (sub) {
           // Calculate days remaining
           const endDate = new Date(sub.subscription?.endDate || sub.endDate); // Handle nested or flat
           const now = new Date();
           const diffTime = endDate.getTime() - now.getTime();
           const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
           
           if (daysRemaining <= 3 && daysRemaining >= 0) {
             newNotifications.push({
               id: 'sub-expiry',
               type: 'SUBSCRIPTION',
               title: 'Langganan Segera Berakhir',
               message: `Paket langganan Anda akan berakhir dalam ${daysRemaining} hari.`,
               date: new Date(),
               read: false
             });
           } else if (daysRemaining < 0) {
              newNotifications.push({
               id: 'sub-expired',
               type: 'SUBSCRIPTION',
               title: 'Langganan Berakhir',
               message: `Paket langganan Anda telah berakhir.`,
               date: new Date(),
               read: false
             });
           }
        }
      } catch (e) {
         console.error('Failed to fetch subscription', e);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    // Merge with existing logic if we had read status tracking
    // For now simple replace
    rawNotifications.value = newNotifications;
    loading.value = false;
  }
};

onMounted(() => {
  if (canSeeNotificationCenter.value) {
    refreshNotifications();
  }
});
</script>
