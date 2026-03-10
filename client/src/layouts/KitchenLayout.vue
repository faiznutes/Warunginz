<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark font-display flex w-full">
    <!-- Sidebar - Clean White/Slate theme matching Design Contract -->
    <aside
      class="w-72 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col h-full fixed z-50 shadow-sm transition-transform duration-300 ease-in-out"
      :class="{ 
        '-translate-x-full lg:translate-x-0': !sidebarOpen && windowWidth < 1024,
        'translate-x-0': sidebarOpen || windowWidth >= 1024
      }"
    >
      <div class="flex flex-col h-full">
        <div class="p-6 shrink-0">
          <router-link to="/app/dashboard" class="flex flex-col gap-1 group">
            <h1 class="text-blue-600 text-xl font-bold leading-normal flex items-center gap-2">
               <span class="material-symbols-outlined icon-filled">restaurant</span>
               {{ outletName }}
            </h1>
            <div class="flex items-center gap-2 pl-8">
               <span class="text-[#4c739a] dark:text-slate-400 text-xs font-bold leading-normal truncate max-w-[150px]">{{ branchName }}</span>
               <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">Kitchen</span>
            </div>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 gap-2 flex flex-col overflow-y-auto">
          <router-link
            to="/app/dashboard"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
            :class="[$route.path === '/app/dashboard' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'filled': $route.path === '/app/dashboard' }">dashboard</span>
            <span>Dashboard</span>
          </router-link>

          <router-link
            to="/app/orders/kitchen"
            class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
            :class="[$route.path === '/app/orders/kitchen' ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'filled': $route.path === '/app/orders/kitchen' }">restaurant_menu</span>
            <span>Incoming Orders</span>
            <span v-if="pendingOrdersCount > 0" class="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {{ pendingOrdersCount }}
            </span>
          </router-link>
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <div class="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
              {{ userInitials }}
            </div>
            <div class="flex flex-col overflow-hidden flex-1">
              <p class="text-sm font-semibold text-[#0d141b] dark:text-white truncate">{{ userName }}</p>
              <p class="text-xs text-[#4c739a] dark:text-slate-400 truncate">{{ outletName }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="w-full mt-2 px-4 py-2.5 text-sm text-[#4c739a] dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile/tablet -->
    <div
      v-if="sidebarOpen && windowWidth < 1024"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:ml-72 w-full">
      <!-- Top Bar -->
      <header class="h-20 shrink-0 px-8 flex items-center justify-between z-10 bg-surface-light dark:bg-surface-dark border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <span class="material-symbols-outlined text-[#4c739a] dark:text-slate-400">menu</span>
          </button>
          <div class="flex items-center gap-2 text-sm">
            <router-link to="/app/dashboard" class="text-slate-500 hover:text-blue-600 transition-colors">Home</router-link>
            <span class="text-slate-400">/</span>
            <span class="text-[#0d141b] dark:text-white font-medium">{{ pageTitle }}</span>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <!-- System Status -->
           <div class="hidden lg:flex items-center gap-4 mr-2">
             <div class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <div class="w-2 h-2 rounded-full transition-colors duration-300" :class="isOnline ? 'bg-blue-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'"></div>
               <span class="text-xs font-bold text-[#4c739a] dark:text-slate-400 capitalize">{{ isOnline ? 'Online' : 'Offline' }}</span>
             </div>
             <div class="px-3 py-1.5 bg-[#0d141b] dark:bg-white text-white dark:text-[#0d141b] rounded-xl shadow-md font-mono text-sm font-bold tracking-wider border border-[#2a3036] dark:border-slate-200">
               {{ currentTime }}
             </div>
           </div>

          <button class="relative p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-500 hover:text-blue-600 transition-colors border border-slate-100 dark:border-slate-700">
            <span class="material-symbols-outlined">notifications</span>
            <span v-if="pendingOrdersCount > 0" class="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto px-8 pb-8 pt-6">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useSocket } from '../composables/useSocket';
import { useSystemStatus } from '../composables/useSystemStatus';
import api from '../api';

const route = useRoute();
const authStore = useAuthStore();
const { socket } = useSocket();
const { isOnline, currentTime, outletName, branchName } = useSystemStatus();

const sidebarOpen = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const pendingOrdersCount = ref(0);

const userName = computed(() => authStore.user?.name || 'Kitchen');
const userInitials = computed(() => {
  const name = userName.value;
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/app/dashboard': 'Dashboard',
    '/app/orders/kitchen': 'Incoming Orders',
  };
  return titles[route.path] || 'Kitchen Display';
});

const closeSidebarOnMobile = () => {
  if (windowWidth.value < 1024) {
    sidebarOpen.value = false;
  }
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = true;
  } else {
    sidebarOpen.value = false;
  }
};

const handleLogout = () => {
  // Clear auth synchronously to prevent any flash
  authStore.clearAuth();
  // Use replace instead of href to avoid history entry and flash
  window.location.replace('/login');
};

const fetchPendingOrdersCount = async () => {
  if (!authStore.isAuthenticated) return;
  try {
    const response = await api.get('/orders', {
      params: {
        sendToKitchen: true,
        kitchenStatus: ['PENDING', 'COOKING', 'READY'],
        limit: 1 // We only need the total count
      }
    });
    // Assuming backend returns result with total count
    pendingOrdersCount.value = response.data.total || response.data.data?.length || 0;
  } catch (err) {
    console.error('Failed to fetch pending orders count:', err);
  }
};

// Polling fallback
let pollInterval: number | null = null;

onMounted(() => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = true;
  }
  window.addEventListener('resize', handleResize);
  
  fetchPendingOrdersCount();
  
  // Setup socket listeners
  if (socket) {
    socket.on('order:new', () => {
      fetchPendingOrdersCount();
    });
    socket.on('order:update', () => {
      fetchPendingOrdersCount();
    });
  }
  
  // Fallback polling every 60 seconds
  pollInterval = window.setInterval(fetchPendingOrdersCount, 60000);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (pollInterval) clearInterval(pollInterval);
  if (socket) {
    socket.off('order:new');
    socket.off('order:update');
  }
});
</script>

<style scoped>
nav {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
