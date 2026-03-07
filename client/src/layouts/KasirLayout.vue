<template>
  <div class="h-screen bg-background-light dark:bg-background-dark font-display flex overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="w-72 bg-slate-50 dark:bg-[#1e293b] border-r border-[#e7edf3] dark:border-slate-700 flex flex-col h-full shrink-0 transition-transform duration-300 fixed lg:relative z-50"
      :class="{ 
        '-translate-x-full lg:translate-x-0': !sidebarOpen && windowWidth < 1024,
        'translate-x-0': sidebarOpen || windowWidth >= 1024,
        'shadow-xl lg:shadow-none': sidebarOpen && windowWidth < 1024
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-6 flex items-center gap-3 shrink-0">
          <div class="h-10 w-10 shrink-0 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <span class="material-symbols-outlined text-[24px]">point_of_sale</span>
          </div>
          <div class="flex flex-col min-w-0">
            <router-link to="/app/dashboard" class="text-sm font-bold text-[#0d141b] dark:text-white leading-tight hover:text-primary transition-colors truncate" :title="outletName">{{ outletName }}</router-link>
            <p class="text-xs font-bold text-[#4c739a] dark:text-slate-400 tracking-wide uppercase truncate" :title="branchName">{{ branchName }}</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 gap-1 flex flex-col overflow-y-auto custom-scrollbar">
          <router-link
            to="/app/dashboard"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
            active-class="bg-blue-50 text-blue-600 font-bold"
            :class="[$route.path === '/app/dashboard' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path === '/app/dashboard' }">dashboard</span>
            <span class="text-sm font-medium leading-normal">Dashboard</span>
          </router-link>

          <router-link
            v-if="canManageProducts"
            to="/app/products"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
            active-class="bg-blue-50 text-blue-600 font-bold"
            :class="[$route.path.startsWith('/app/products') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/products') }">inventory_2</span>
            <span class="text-sm font-medium leading-normal">Products</span>
          </router-link>

          <router-link
            to="/pos"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
            active-class="bg-blue-50 text-blue-600 font-bold"
            :class="[$route.path === '/pos' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path === '/pos' }">point_of_sale</span>
            <span class="text-sm font-medium leading-normal">POS</span>
          </router-link>

          <router-link
            v-if="canEditOrders"
            to="/app/orders"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
            active-class="bg-blue-50 text-blue-600 font-bold"
            :class="[$route.path.startsWith('/app/orders') && !$route.path.includes('kitchen') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/orders') }">receipt_long</span>
            <span class="text-sm font-medium leading-normal">Orders</span>
          </router-link>

          <router-link
            v-if="canManageCustomers"
            to="/app/customers"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
            active-class="bg-blue-50 text-blue-600 font-bold"
            :class="[$route.path.startsWith('/app/customers') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/customers') }">group</span>
            <span class="text-sm font-medium leading-normal">Customers</span>
          </router-link>

          <router-link
            v-if="authStore.user?.role === 'KITCHEN' || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPERVISOR'"
            to="/app/orders/kitchen"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
            active-class="bg-blue-50 text-blue-600 font-bold"
            :class="[$route.path === '/app/orders/kitchen' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path === '/app/orders/kitchen' }">restaurant_menu</span>
            <span class="text-sm font-medium leading-normal">Kitchen (KDS)</span>
          </router-link>

          <router-link
            v-if="canViewReports"
            to="/app/reports"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
            active-class="bg-blue-50 text-blue-600 font-bold"
            :class="[$route.path.startsWith('/app/reports') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/reports') }">bar_chart</span>
            <span class="text-sm font-medium leading-normal">Reports</span>
          </router-link>

          <div class="my-2 border-t border-[#e7edf3] dark:border-slate-700"></div>

          <router-link
            to="/app/cashier/cash-shift"
            class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
            active-class="bg-[#10b981]/10 text-[#10b981]"
            :class="[$route.path.startsWith('/app/cashier/cash-shift') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700']"
            @click="closeSidebarOnMobile"
          >
            <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/cashier/cash-shift') }">payments</span>
            <span class="text-sm font-medium leading-normal">Cash Shift</span>
          </router-link>
        </nav>

        <!-- User Section -->
        <div class="p-4 border-t border-[#e7edf3] dark:border-slate-700 shrink-0">
          <div class="flex items-center gap-3 mb-3">
            <div class="flex-shrink-0 size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-600 shadow-sm bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
               {{ userInitials }}
            </div>
            <div class="flex flex-col min-w-0">
              <p class="text-sm font-bold text-[#0d141b] dark:text-white truncate">{{ userName }}</p>
              <p class="text-xs text-[#4c739a] dark:text-slate-400 truncate">{{ tenantName }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-[#4c739a] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full border border-transparent hover:border-red-100"
          >
            <span class="material-symbols-outlined text-[18px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile/tablet -->
    <div
      v-if="sidebarOpen && windowWidth < 1024"
      class="fixed inset-0 bg-[#0d141b]/50 z-40 transition-opacity duration-300 backdrop-blur-sm"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 w-full bg-[#f6f7f8] dark:bg-[#101922]">
      <!-- Top Bar -->
      <header class="bg-slate-50 dark:bg-[#1e293b] border-b border-[#e7edf3] dark:border-slate-700 shadow-sm sticky top-0 z-30 shrink-0">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex items-center gap-4">
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="lg:hidden p-2 text-[#4c739a] hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              <span class="material-symbols-outlined">menu</span>
            </button>
            <div class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
              <router-link to="/app/dashboard" class="hover:text-[#10b981] transition-colors">Home</router-link>
              <span class="text-xs">/</span>
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

          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 w-full scroll-smooth custom-scrollbar">
         <div class="max-w-[1600px] mx-auto h-full flex flex-col">
           <router-view />
         </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePermissions } from '../composables/usePermissions';
import { useSystemStatus } from '../composables/useSystemStatus';

const route = useRoute();
const authStore = useAuthStore();
const { canManageProducts, canManageCustomers, canViewReports, canEditOrders } = usePermissions();
const { isOnline, currentTime, outletName, branchName } = useSystemStatus();

// Debug: Log permissions when they change
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    const permissions = (newUser as any).permissions || {};
    console.log('Kasir Layout - User permissions:', {
      role: newUser.role,
      permissions,
      canManageProducts: canManageProducts.value,
      canManageCustomers: canManageCustomers.value,
      canViewReports: canViewReports.value,
      canEditOrders: canEditOrders.value,
    });
  }
}, { deep: true, immediate: true });

const sidebarOpen = ref(false);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);

const userName = computed(() => authStore.user?.name || 'Kasir');
const tenantName = computed(() => authStore.user?.tenantName || 'Toko');
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
      '/app/products': 'Products',
      '/pos': 'Point of Sale',
      '/app/orders': 'Orders',
      '/app/customers': 'Customers',
      '/app/reports': 'Reports',
      '/app/cashier/cash-shift': 'Cash Shift',
  };
  return titles[route.path] || 'Dashboard';
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

onMounted(() => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = true;
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
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
