<template>
  <div class="min-h-screen bg-gray-50 flex w-full">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-white shadow-xl fixed h-full z-50 transition-transform duration-300 ease-in-out print:hidden"
      :class="{ 
        '-translate-x-full lg:translate-x-0': !sidebarOpen && windowWidth < 1024,
        'translate-x-0': sidebarOpen || windowWidth >= 1024
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-6 border-b border-gray-200 flex-shrink-0">
          <router-link to="/app/dashboard" class="flex items-center hover:opacity-90 transition-opacity group">
            <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">Warungin</span>
          </router-link>
        </div>

        <!-- Menu Search -->
        <div class="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
            <input
              v-model="menuSearchQuery"
              type="text"
              placeholder="Cari menu..."
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto overscroll-contain">
          <!-- Search Results -->
          <div v-if="menuSearchQuery.trim()" class="space-y-1">
            <SidebarItem
              v-for="item in filteredMenuItems"
              :key="item.path"
              :to="item.path"
              :icon="getMenuIcon(item.path)"
              :label="item.label"
              @click="closeSidebarOnMobile(); menuSearchQuery = ''"
            />
            <div v-if="filteredMenuItems.length === 0" class="text-center py-8 text-slate-400">
              <span class="material-symbols-outlined text-[32px] mb-2 block">search_off</span>
              <p class="text-sm font-medium">Tidak ada menu ditemukan</p>
            </div>
          </div>

          <!-- Regular Menu -->
          <template v-else>
            <!-- Operasional Section -->
            <SidebarSection label="Operasional" :isOpen="expandedMenus.operasional" @toggle="toggleMenu('operasional')">
              <SidebarItem to="/app/dashboard" icon="dashboard" label="Dashboard" exact />
              
              <SidebarItem 
                v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || (userRole === 'SUPERVISOR' && canManageProducts) || (userRole === 'CASHIER' && canManageProducts)"
                to="/app/products" 
                icon="inventory_2" 
                label="Produk"
              >
                <template #suffix>
                  <span v-if="criticalStockCount > 0" class="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {{ criticalStockCount }}
                  </span>
                </template>
              </SidebarItem>

              <SidebarItem 
                v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || userRole === 'SUPERVISOR'"
                to="/app/products/adjustments" 
                icon="inventory" 
                label="Penyesuaian Stok" 
              />

              <SidebarItem 
                v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || (userRole === 'SUPERVISOR' && canEditOrders) || userRole === 'CASHIER'"
                to="/app/orders" 
                icon="receipt_long" 
                label="Pesanan & Transaksi"
              >
                <template #suffix>
                  <span v-if="pendingOrdersCount > 0" class="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {{ pendingOrdersCount }}
                  </span>
                </template>
              </SidebarItem>

              <SidebarItem 
                v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || (userRole === 'SUPERVISOR' && canManageCustomers) || (userRole === 'CASHIER' && canManageCustomers)"
                to="/app/customers" 
                icon="person" 
                label="Pelanggan" 
              />
            </SidebarSection>

            <!-- Laporan & Analitik Section -->
            <SidebarSection 
              v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || (userRole === 'SUPERVISOR' && canViewReports) || (userRole === 'CASHIER' && canViewReports)"
              label="Laporan & Analitik" 
              :isOpen="expandedMenus.laporan" 
              @toggle="toggleMenu('laporan')"
            >
              <SidebarItem to="/app/reports" icon="assessment" label="Laporan" />
              
              <template v-if="hasBusinessAnalytics">
                <SidebarItem to="/app/analytics" icon="analytics" label="Advanced Analytics" />
                <SidebarItem to="/app/finance" icon="account_balance_wallet" label="Keuangan" />
                <SidebarItem to="/app/profit-loss" icon="summarize" label="Laba Rugi" />
              </template>
            </SidebarSection>

            <!-- Manajemen Section -->
            <SidebarSection 
              v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN' || userRole === 'SUPERVISOR'"
              label="Manajemen" 
              :isOpen="expandedMenus.manajemen" 
              @toggle="toggleMenu('manajemen')"
            >
              <SidebarItem to="/app/users" icon="group" label="Pengguna" />
              <SidebarItem v-if="userRole === 'ADMIN_TENANT'" to="/app/stores" icon="store" label="Kelola Store" />
            </SidebarSection>

            <!-- Pengaturan Section -->
            <SidebarSection 
              v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN'"
              label="Pengaturan" 
              :isOpen="expandedMenus.pengaturan" 
              @toggle="toggleMenu('pengaturan')"
            >
              <SidebarItem to="/app/subscription" icon="loyalty" label="Berlangganan" />
              <SidebarItem v-if="userRole === 'ADMIN_TENANT'" to="/app/addons" icon="extension" label="Addon" />
              <SidebarItem to="/app/rewards" icon="redeem" label="Point Gratis" />
            </SidebarSection>
          </template>
        </nav>

        <!-- User Section -->
        <LayoutUserSection
          :name="userName"
          :initials="userInitials"
          :role="userRole"
          :subtext="userEmail"
          :isSuperAdmin="authStore.isSuperAdmin"
          @logout="handleLogout"
        />
      </div>
    </aside>

    <!-- Overlay -->
    <div
      v-if="sidebarOpen && windowWidth < 1024"
      class="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col lg:ml-64 w-full">
      <!-- Top Bar -->
      <header class="bg-white shadow-sm sticky top-0 z-30 print:hidden">
        <div class="flex items-center justify-between px-4 py-4">
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>
          
          <div class="flex items-center space-x-4 flex-1 lg:flex-none">
            <h1 class="text-xl font-semibold text-gray-900">
              {{ pageTitle }}
            </h1>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Global Search Trigger -->
            <button
               @click="openGlobalSearch"
               class="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
               title="Cari (Ctrl+K)"
            >
               <span class="material-symbols-outlined text-[20px]">search</span>
               <span class="hidden md:inline text-xs font-bold">Cari <span class="bg-slate-100 px-1 rounded ml-1 text-[9px]">Ctrl+K</span></span>
            </button>

            <!-- Help Button -->
            <button
              @click="showHelpModal = true"
              class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              title="Bantuan"
            >
              <span class="material-symbols-outlined text-[20px]">help</span>
            </button>

            <!-- Info Button -->
            <button
              v-if="userRole === 'ADMIN_TENANT'"
              @click="showInfoModal = true"
              class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              title="Informasi Penting"
            >
              <span class="material-symbols-outlined">notifications</span>
              <span v-if="hasUnreadInfo" class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <!-- Connection Indicator -->
            <ConnectionIndicator />
            
            <!-- Notification Dropdown -->
            <NotificationDropdown />
          </div>

          <!-- Tenant Selector for Super Admin -->
          <div v-if="authStore.isSuperAdmin && authStore.tenants.length > 0" class="hidden md:flex items-center px-2">
            <select
              v-model="selectedTenant"
              @change="handleTenantChange"
              class="px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Pilih Tenant</option>
              <option v-for="tenant in authStore.tenants" :key="tenant.id" :value="tenant.id">
                {{ tenant.name }}
              </option>
            </select>
          </div>

          <!-- Store Selector -->
          <div v-if="shouldShowStoreSelector" class="hidden md:flex items-center px-2">
            <select
              v-model="selectedStoreId"
              @change="handleStoreChange"
              class="px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Semua Store</option>
              <option v-for="store in stores" :key="store.id" :value="store.id">
                {{ store.name }}
              </option>
            </select>
          </div>
          
          <div v-if="!shouldShowStoreSelector && currentStoreName" class="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600">
             <span class="material-symbols-outlined text-[18px] text-blue-600">store</span>
             <span>{{ currentStoreName }}</span>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main id="main-content" ref="mainContentRef" class="flex-1 w-full overflow-x-hidden pb-24 lg:pb-6 focus:outline-none" tabindex="-1">
        <router-view />
      </main>

      <!-- Mobile Nav -->
      <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-around items-center z-50 text-[10px] font-medium print:hidden shadow-lg">
        <router-link to="/app/dashboard" active-class="text-blue-600" class="flex flex-col items-center gap-1 p-2 text-slate-400">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Home</span>
        </router-link>
        <router-link to="/app/orders" active-class="text-blue-600" class="flex flex-col items-center gap-1 p-2 text-slate-400">
          <span class="material-symbols-outlined">receipt_long</span>
          <span>Pesanan</span>
        </router-link>
        <router-link to="/app/pos" class="flex flex-col items-center -mt-8">
           <div class="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
              <span class="material-symbols-outlined text-2xl">point_of_sale</span>
           </div>
           <span class="text-blue-600 font-bold mt-1">POS</span>
        </router-link>
        <router-link to="/app/products" active-class="text-blue-600" class="flex flex-col items-center gap-1 p-2 text-slate-400">
          <span class="material-symbols-outlined">inventory_2</span>
          <span>Produk</span>
        </router-link>
        <button @click="sidebarOpen = true" class="flex flex-col items-center gap-1 p-2 text-slate-400">
           <span class="material-symbols-outlined">menu</span>
           <span>Menu</span>
        </button>
      </div>
    </div>
    
    <!-- Modals -->
    <ShellModals
      ref="shellModalsRef"
      :userRole="userRole"
      v-model:showInfoModal="showInfoModal"
      v-model:showShortcutsModal="showShortcutsModal"
      v-model:showHelpModal="showHelpModal"
      :helpContent="currentHelp"
      @dont-show-today="handleInfoModalClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePermissions } from '../composables/usePermissions';
import api from '../api';
import { useStockAlerts } from '../composables/useStockAlerts';
import { useHelp } from '../composables/useHelp';
import { useRecentItems } from '../composables/useRecentItems';
import { useLayoutBase } from '../composables/useLayoutBase';
import { useLayoutUser } from '../composables/useLayoutUser';
import { useActiveAddons } from '../composables/useActiveAddons';
import { usePendingOrders } from '../composables/usePendingOrders';

// Components
import SidebarItem from '../components/layout/SidebarItem.vue';
import SidebarSection from '../components/layout/SidebarSection.vue';
import LayoutUserSection from '../components/layout/LayoutUserSection.vue';
import ShellModals from '../components/layout/ShellModals.vue';
import NotificationDropdown from '../components/NotificationDropdown.vue';
import ConnectionIndicator from '../components/ui/ConnectionIndicator.vue';

const route = useRoute();
const authStore = useAuthStore();

// Composables
const { sidebarOpen, windowWidth, closeSidebarOnMobile } = useLayoutBase();
const { userName, userEmail, userRole, userInitials, handleLogout } = useLayoutUser();
const { loadAddons, hasBusinessAnalytics } = useActiveAddons();
const { pendingOrdersCount, startPolling, stopPolling } = usePendingOrders();
const { addRecentItem } = useRecentItems();
const { canManageProducts, canViewReports, canEditOrders, canManageCustomers } = usePermissions();
const { criticalStockCount, fetchCriticalStock } = useStockAlerts();
const { currentHelp } = useHelp();

const selectedTenant = ref<string>('');
const menuSearchQuery = ref('');
const mainContentRef = ref<HTMLElement | null>(null);

// Menu items structure for search
const menuItems = computed(() => {
  const items: Array<{ path: string; label: string; section: string }> = [];
  
  items.push({ path: '/app/dashboard', label: 'Dashboard', section: 'operasional' });
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || (userRole.value === 'SUPERVISOR' && canManageProducts.value) || (userRole.value === 'CASHIER' && canManageProducts.value)) {
    items.push({ path: '/app/products', label: 'Produk', section: 'operasional' });
  }
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || userRole.value === 'SUPERVISOR') {
    items.push({ path: '/app/products/adjustments', label: 'Penyesuaian Stok', section: 'operasional' });
  }
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || (userRole.value === 'SUPERVISOR' && canEditOrders.value) || userRole.value === 'CASHIER') {
    items.push({ path: '/app/orders', label: 'Pesanan & Transaksi', section: 'operasional' });
  }
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || (userRole.value === 'SUPERVISOR' && canManageCustomers.value) || (userRole.value === 'CASHIER' && canManageCustomers.value)) {
    items.push({ path: '/app/customers', label: 'Pelanggan', section: 'operasional' });
  }
  
  if (['ADMIN_TENANT', 'SUPER_ADMIN'].includes(userRole.value) || ((userRole.value === 'SUPERVISOR' || userRole.value === 'CASHIER') && canViewReports.value)) {
    items.push({ path: '/app/reports', label: 'Laporan', section: 'laporan' });
  }
  
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN' || userRole.value === 'SUPERVISOR') {
    items.push({ path: '/app/users', label: 'Pengguna', section: 'manajemen' });
  }
  if (userRole.value === 'ADMIN_TENANT') {
    items.push({ path: '/app/stores', label: 'Kelola Store', section: 'manajemen' });
  }
  
  if (userRole.value === 'ADMIN_TENANT' || userRole.value === 'SUPER_ADMIN') {
    items.push({ path: '/app/subscription', label: 'Berlangganan', section: 'pengaturan' });
    items.push({ path: '/app/addons', label: 'Addon', section: 'pengaturan' });
    items.push({ path: '/app/rewards', label: 'Point Gratis', section: 'pengaturan' });
  }
  
  return items;
});

const filteredMenuItems = computed(() => {
  if (!menuSearchQuery.value.trim()) return [];
  const query = menuSearchQuery.value.toLowerCase().trim();
  return menuItems.value.filter(item => 
    item.label.toLowerCase().includes(query) || 
    item.path.toLowerCase().includes(query)
  );
});

const expandedMenus = ref({
  operasional: true,
  laporan: false,
  manajemen: false,
  pengaturan: false,
});

const toggleMenu = (menuKey: keyof typeof expandedMenus.value) => {
  expandedMenus.value[menuKey] = !expandedMenus.value[menuKey];
};

const autoExpandMenu = () => {
  const path = route.path;
  if (path.includes('/dashboard') || path.includes('/products') || path.includes('/orders') || path.includes('/customers')) {
    expandedMenus.value.operasional = true;
  } else if (path.includes('/reports') || path.includes('/analytics') || path.includes('/finance')) {
    expandedMenus.value.laporan = true;
  } else if (path.includes('/users') || path.includes('/stores')) {
    expandedMenus.value.manajemen = true;
  } else if (path.includes('/subscription') || path.includes('/addons') || path.includes('/rewards') || path.includes('/settings')) {
    expandedMenus.value.pengaturan = true;
  }
};

const showInfoModal = ref(false);
const showShortcutsModal = ref(false);
const showHelpModal = ref(false);
const hasUnreadInfo = ref(false);

const shellModalsRef = ref<any>(null);
const openGlobalSearch = () => shellModalsRef.value?.openGlobalSearch();

const getMenuIcon = (path: string) => {
  const icons: Record<string, string> = {
    '/app/dashboard': 'dashboard',
    '/app/products': 'inventory_2',
    '/app/products/adjustments': 'inventory',
    '/app/orders': 'receipt_long',
    '/app/customers': 'person',
    '/app/reports': 'assessment',
    '/app/users': 'group',
    '/app/stores': 'store',
    '/app/subscription': 'loyalty',
    '/app/addons': 'extension',
    '/app/rewards': 'redeem',
  };
  return icons[path] || 'link';
};

// Store Selection Logic
const stores = ref<any[]>([]);
const selectedStoreId = ref<string>(localStorage.getItem('selectedStoreId') || '');

const shouldShowStoreSelector = computed(() => {
  if (userRole.value === 'ADMIN_TENANT') return true;
  if (userRole.value === 'SUPERVISOR') return true;
  if (userRole.value === 'SUPER_ADMIN' && selectedTenant.value) return true;
  return false;
});

const currentStoreName = computed(() => {
   if (selectedStoreId.value) {
      const s = stores.value.find(st => st.id === selectedStoreId.value);
      if (s) return s.name;
   }
   const perms = (authStore.user as any)?.permissions;
   if (perms?.assignedStoreId && stores.value.length > 0) {
      const s = stores.value.find(st => st.id === perms.assignedStoreId);
      if (s) return s.name;
   }
   return '';
});

const loadStores = async () => {
  try {
    const response = await api.get('/outlets'); 
    const allStores = response.data.data || [];
    stores.value = allStores.filter((s: any) => s.isActive !== false);

    if (userRole.value === 'SUPERVISOR') {
       const permissions = authStore.user?.permissions as any;
       const allowedStoreIds = permissions?.allowedStoreIds || [];
       if (allowedStoreIds.length > 0) {
          stores.value = stores.value.filter(s => allowedStoreIds.includes(s.id));
       }
    }
  } catch (error) {
    console.error('Error loading stores:', error);
  }
};

const handleStoreChange = () => {
  if (selectedStoreId.value) {
    localStorage.setItem('selectedStoreId', selectedStoreId.value);
  } else {
    localStorage.removeItem('selectedStoreId');
  }
  window.location.reload(); 
};

const handleTenantChange = () => {
  authStore.setSelectedTenant(selectedTenant.value || null);
  window.location.reload();
};

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/app/dashboard': 'Dashboard',
    '/app/products': 'Produk',
    '/app/orders': 'Pesanan & Transaksi',
    '/app/customers': 'Pelanggan',
    '/app/reports': 'Laporan',
    '/app/subscription': 'Berlangganan',
    '/app/addons': 'Addon',
    '/app/users': 'Pengguna',
    '/app/analytics': 'Advanced Analytics',
    '/app/finance': 'Keuangan',
    '/app/profit-loss': 'Laporan Laba Rugi',
  };
  return titles[route.path] || 'Warungin';
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target instanceof HTMLInputElement)) {
    e.preventDefault();
    showShortcutsModal.value = !showShortcutsModal.value;
  }
  if (e.key === 'Escape') {
    showShortcutsModal.value = false;
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openGlobalSearch();
  }
};

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);
  
  if (authStore.isSuperAdmin) {
    await authStore.fetchTenants();
    selectedTenant.value = authStore.selectedTenantId || '';
  }
  
  await loadStores();
  if (canManageProducts.value) fetchCriticalStock();
  
  startPolling();
  loadAddons();
  autoExpandMenu();

  if (userRole.value === 'ADMIN_TENANT') {
    const lastShown = localStorage.getItem('adminInfoLastShown');
    const today = new Date().toDateString();
    if (lastShown !== today) {
      showInfoModal.value = true;
      hasUnreadInfo.value = true;
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  stopPolling();
});

watch(() => route.path, (newPath) => {
  if (newPath && !newPath.includes('/login')) addRecentItem(newPath);
  autoExpandMenu();
});

const handleInfoModalClose = () => {
  localStorage.setItem('adminInfoLastShown', new Date().toDateString());
  hasUnreadInfo.value = false;
  showInfoModal.value = false;
};
</script>

<style scoped>
/* Touch-friendly for mobile */
.touch-manipulation {
  touch-action: manipulation;
}

/* Smooth scrolling for nav */
nav {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

nav::-webkit-scrollbar {
  width: 6px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}

nav::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>
