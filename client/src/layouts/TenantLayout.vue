<template>
  <div class="flex h-screen bg-background-light dark:bg-background-dark font-display overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="w-64 bg-slate-50 dark:bg-[#1e293b] border-r border-[#e7edf3] dark:border-slate-700 flex flex-col h-full shrink-0 transition-all duration-300 fixed lg:relative z-50"
      :class="{ 
        '-translate-x-full lg:translate-x-0': !sidebarOpen && windowWidth < 1024,
        'translate-x-0': sidebarOpen || windowWidth >= 1024,
        'shadow-xl lg:shadow-none': sidebarOpen && windowWidth < 1024
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-6 pb-2 shrink-0">
          <router-link to="/app/dashboard" class="flex flex-col gap-1 group">
            <h1 class="text-primary text-xl font-bold leading-normal flex items-center gap-2">
               <span class="material-symbols-outlined icon-filled">storefront</span>
               {{ outletName }}
            </h1>
            <div class="flex items-center gap-2 pl-8">
               <span class="text-[#4c739a] dark:text-slate-400 text-xs font-bold leading-normal truncate max-w-[150px]" :title="branchName">{{ branchName }}</span>
               <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 uppercase">Tenant</span>
            </div>
          </router-link>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto overscroll-contain flex flex-col gap-1">
          <!-- Operasional Section -->
          <SidebarSection label="Operasional" :isOpen="expandedMenus.operasional" @toggle="toggleMenu('operasional')">
            <SidebarItem to="/app/dashboard" icon="grid_view" label="Dashboard" exact />
            
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
              v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPERVISOR'"
              to="/app/products/adjustments"
              icon="tune"
              label="Penyesuaian"
            />

            <SidebarItem
              v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPERVISOR' || (userRole === 'SUPERVISOR' && canEditOrders) || userRole === 'CASHIER'"
              to="/app/orders"
              icon="shopping_cart"
              label="Pesanan"
            >
              <template #suffix>
                <span v-if="pendingOrdersCount > 0" class="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {{ pendingOrdersCount }}
                </span>
              </template>
            </SidebarItem>

            <SidebarItem
              v-if="userRole === 'ADMIN_TENANT' || (userRole === 'SUPERVISOR' && canManageCustomers) || (userRole === 'CASHIER' && canManageCustomers)"
              to="/app/customers"
              icon="group"
              label="Pelanggan"
            />

            <SidebarItem
              v-if="userRole === 'SUPERVISOR' || userRole === 'KITCHEN'"
              to="/app/orders/kitchen"
              icon="restaurant_menu"
              label="Dapur (KDS)"
            />

            <SidebarItem
              v-if="userRole === 'CASHIER' || userRole === 'SUPERVISOR' || userRole === 'ADMIN_TENANT'"
              to="/pos"
              icon="point_of_sale"
              label="Buka POS"
              target="_blank"
            />
          </SidebarSection>

          <!-- Laporan & Analitik Section -->
          <SidebarSection
            v-if="userRole === 'ADMIN_TENANT' || (userRole === 'SUPERVISOR' && canViewReports) || (userRole === 'CASHIER' && canViewReports)"
            label="Laporan & Analitik"
            :isOpen="expandedMenus.laporan"
            @toggle="toggleMenu('laporan')"
          >
            <SidebarItem to="/app/reports" icon="summarize" label="Laporan" />
            
            <template v-if="hasBusinessAnalytics">
              <SidebarItem to="/app/analytics" icon="analytics" label="Advanced Analytics" />
              <SidebarItem to="/app/finance" icon="payments" label="Keuangan" />
              <SidebarItem to="/app/profit-loss" icon="trending_up" label="Laba Rugi" />
              <SidebarItem to="/app/reports/advanced" icon="bar_chart" label="Advanced Reporting" />
              <SidebarItem to="/app/finance/management" icon="account_balance_wallet" label="Financial Mgmt" />
            </template>
          </SidebarSection>

          <!-- Marketing & Delivery Section -->
          <SidebarSection
            v-if="(userRole === 'ADMIN_TENANT' || userRole === 'SUPERVISOR') && hasDeliveryMarketing"
            label="Marketing & Delivery"
            :isOpen="expandedMenus.marketing"
            @toggle="toggleMenu('marketing')"
          >
            <SidebarItem to="/app/marketing" icon="campaign" label="Campaigns" />
            <SidebarItem to="/app/marketing/email-templates" icon="mail" label="Email Templates" />
            <SidebarItem to="/app/marketing/email-analytics" icon="insights" label="Email Analytics" />
            <SidebarItem to="/app/marketing/email-scheduler" icon="schedule_send" label="Email Scheduler" />
            <SidebarItem to="/app/marketing/customer-engagement" icon="loyalty" label="Engagement" />
            <SidebarItem to="/app/delivery" icon="local_shipping" label="Delivery Orders" />
          </SidebarSection>

          <!-- Inventory Management Section -->
          <SidebarSection
            v-if="(userRole === 'ADMIN_TENANT' || userRole === 'SUPERVISOR') && hasInventoryAccess"
            label="Inventory"
            :isOpen="expandedMenus.inventory"
            @toggle="toggleMenu('inventory')"
          >
            <SidebarItem to="/app/inventory/suppliers" icon="factory" label="Suppliers" />
            <SidebarItem to="/app/inventory/purchase-orders" icon="shopping_bag" label="Purchase Orders" />
            <SidebarItem to="/app/inventory/stock-transfers" icon="move_down" label="Stock Transfers" />
            <SidebarItem to="/app/inventory/stock-alerts" icon="notification_important" label="Stock Alerts" />
          </SidebarSection>

          <!-- Manajemen Section -->
          <SidebarSection
            v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPERVISOR'"
            label="Manajemen"
            :isOpen="expandedMenus.manajemen"
            @toggle="toggleMenu('manajemen')"
          >
            <SidebarItem to="/app/users" icon="badge" label="Pengguna" />
            <SidebarItem v-if="userRole === 'ADMIN_TENANT'" to="/app/stores" icon="store" label="Kelola Store" />
            <SidebarItem v-if="userRole === 'ADMIN_TENANT'" to="/app/discounts" icon="percent" label="Diskon" />
          </SidebarSection>

          <!-- Pengaturan Section -->
          <SidebarSection
            v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPERVISOR'"
            label="Pengaturan"
            :isOpen="expandedMenus.pengaturan"
            @toggle="toggleMenu('pengaturan')"
          >
            <SidebarItem v-if="userRole === 'ADMIN_TENANT'" to="/app/subscription" icon="card_membership" label="Berlangganan" />
            <SidebarItem v-if="userRole === 'ADMIN_TENANT'" to="/app/addons" icon="extension" label="Addon" />
            <SidebarItem to="/app/support" icon="support_agent" label="Bantuan" />
            <SidebarItem to="/app/rewards" icon="stars" label="Point Gratis" />
            <SidebarItem v-if="userRole === 'ADMIN_TENANT'" to="/app/settings/store" icon="storefront" label="Pengaturan Toko" />
            <SidebarItem v-if="hasSimpleNotaEditor" to="/app/receipts/templates" icon="receipt" label="Template Struk" />
            <SidebarItem v-if="authStore.isSuperAdmin" to="/app/settings/archive" icon="archive" label="Archive Management" />
            <SidebarItem v-if="authStore.isSuperAdmin" to="/app/settings/retention" icon="auto_delete" label="Retention Management" />
          </SidebarSection>

          <!-- Support Section -->
          <div class="mb-1 mt-4 border-t border-slate-100 dark:border-slate-700 pt-2">
            <SidebarItem
              :to="authStore.isSuperAdmin ? '/app/superadmin/contact-messages' : '/app/support'"
              icon="help_center"
              label="Bantuan & Support"
            />
          </div>
        </nav>

        <!-- User Section -->
        <LayoutUserSection
          :name="userName"
          :initials="userInitials"
          :role="userRole"
          :subtext="tenantName"
          :isSuperAdmin="authStore.isSuperAdmin"
          @logout="handleLogout"
        />
      </div>
    </aside>

    <!-- Overlay -->
    <div
      v-if="sidebarOpen && windowWidth < 1024"
      class="fixed inset-0 bg-[#0d141b]/50 z-40 transition-opacity duration-300 backdrop-blur-sm"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 w-full bg-background-light dark:bg-background-dark">
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
              <div>
                <nav class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
                  <span class="hover:text-primary transition-colors cursor-pointer">App</span>
                  <span class="text-xs">/</span>
                  <span class="text-[#0d141b] dark:text-white font-medium">{{ pageTitle }}</span>
                </nav>
                <h1 class="text-lg font-bold text-[#0d141b] dark:text-white leading-tight">{{ pageTitle }}</h1>
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

             <!-- Global Search Trigger -->
             <button
                @click="openGlobalSearch"
                class="flex items-center gap-2 px-3 py-2 text-[#4c739a] hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all group"
                title="Cari (Ctrl+K)"
             >
                <span class="material-symbols-outlined text-[20px]">search</span>
                <span class="hidden md:inline text-xs font-bold">Cari <span class="bg-slate-100 dark:bg-slate-800 px-1 rounded ml-1 text-[9px]">Ctrl+K</span></span>
             </button>

             <!-- Notification Dropdown -->
             <NotificationDropdown />
            
             <!-- Info Button for Admin Tenant -->
             <button
               v-if="userRole === 'ADMIN_TENANT'"
               @click="showInfoModal = true"
               class="relative p-2 text-[#4c739a] hover:text-[#10b981] hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
               title="Informasi / Knowledge Base"
             >
               <span class="material-symbols-outlined">menu_book</span>
               <span v-if="hasUnreadInfo" class="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white dark:border-[#1e293b]"></span>
             </button>

             <!-- Help Button -->
             <button
               @click="showHelpModal = true"
               class="p-2 text-[#4c739a] hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
               title="Bantuan"
             >
               <span class="material-symbols-outlined text-[20px]">help</span>
             </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-6 md:p-8 w-full scroll-smooth">
         <div class="max-w-[1600px] mx-auto h-full flex flex-col">
            <router-view />
            <!-- Spacing footer -->
            <div class="h-8 shrink-0"></div>
         </div>
      </main>
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

import { useSystemStatus } from '../composables/useSystemStatus';

const route = useRoute();
const authStore = useAuthStore();

// Composables
const { sidebarOpen, windowWidth } = useLayoutBase();
const { userName, userRole, userInitials, handleLogout } = useLayoutUser();
const { activeAddons, loadAddons, hasBusinessAnalytics } = useActiveAddons();
const { pendingOrdersCount, startPolling, stopPolling } = usePendingOrders();
const { canManageProducts, canViewReports, canEditOrders, canManageCustomers } = usePermissions();
const { criticalStockCount, fetchCriticalStock } = useStockAlerts();
const { currentHelp } = useHelp();
const { isOnline, currentTime, outletName, branchName } = useSystemStatus();

const tenantName = computed(() => authStore.user?.tenantName || 'Toko');

const currentSubscription = ref<any>(null);
const showInfoModal = ref(false);
const showShortcutsModal = ref(false);
const showHelpModal = ref(false);
const hasUnreadInfo = ref(false);

const shellModalsRef = ref<any>(null);
const openGlobalSearch = () => shellModalsRef.value?.openGlobalSearch();

const handleInfoModalClose = () => {
   showInfoModal.value = false;
   hasUnreadInfo.value = false;
   localStorage.setItem('admin_info_last_seen', new Date().toISOString());
};

const hasDeliveryMarketing = computed(() => {
  return activeAddons.value.some(
    (addon: any) => addon && (
      (addon.addonType === 'DELIVERY_MARKETING' && addon.status === 'active') ||
      (addon.addonType === 'MARKETING_TOOLS' && addon.status === 'active')
    )
  );
});

const hasInventoryAccess = computed(() => {
  if (!authStore.user || !['ADMIN_TENANT', 'SUPERVISOR'].includes(authStore.user.role)) return false;
  const plan = currentSubscription.value?.plan || 'BASIC';
  if (plan === 'PRO' || plan === 'ENTERPRISE') return true;
  return activeAddons.value.some(
    (addon: any) => addon && addon.addonType === 'INVENTORY_MANAGEMENT' && addon.status === 'active'
  );
});

const hasSimpleNotaEditor = computed(() => {
  return activeAddons.value.some(
    (addon: any) => addon && (addon.addonType === 'SIMPLE_NOTA_EDITOR' || addon.addonType === 'RECEIPT_CUSTOMIZER') && addon.status === 'active'
  );
});

const expandedMenus = ref({
  operasional: true,
  laporan: false,
  marketing: false,
  inventory: false,
  manajemen: false,
  pengaturan: false,
});

const toggleMenu = (menuKey: keyof typeof expandedMenus.value) => {
  expandedMenus.value[menuKey] = !expandedMenus.value[menuKey];
};

const autoExpandMenu = () => {
  const path = route.path;
  if (path.includes('/dashboard') || path.includes('/products') || path.includes('/orders') || path.includes('/customers') || path.includes('/orders/kitchen')) {
    expandedMenus.value.operasional = true;
  } else if (path.includes('/reports') || path.includes('/analytics') || path.includes('/finance') || path.includes('/profit-loss')) {
    expandedMenus.value.laporan = true;
  } else if (path.includes('/marketing') || path.includes('/delivery')) {
    expandedMenus.value.marketing = true;
  } else if (path.includes('/inventory')) {
    expandedMenus.value.inventory = true;
  } else if (path.includes('/users') || path.includes('/stores') || path.includes('/discounts')) {
    expandedMenus.value.manajemen = true;
  } else if (path.includes('/subscription') || path.includes('/addons') || path.includes('/settings') || path.includes('/rewards')) {
    expandedMenus.value.pengaturan = true;
  }
};

const loadSubscription = async () => {
  if (userRole.value === 'ADMIN_TENANT') {
    try {
      const response = await api.get('/subscriptions/current');
      if (response.data) {
        currentSubscription.value = response.data;
        const plan = response.data.plan || response.data.subscription?.plan || response.data.subscriptionPlan || (authStore.user as any).tenantSubscriptionPlan || 'BASIC';
        currentSubscription.value.plan = plan;
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      currentSubscription.value = { plan: 'BASIC' };
    }
  }
};

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
  
  await loadSubscription();
  await loadAddons();
  if (canManageProducts.value) fetchCriticalStock();
  
  startPolling();
  autoExpandMenu();

  // Check if we should show info modal
  if (userRole.value === 'ADMIN_TENANT') {
    const lastSeen = localStorage.getItem('admin_info_last_seen');
    if (!lastSeen) {
        showInfoModal.value = true;
        hasUnreadInfo.value = true;
    } else {
        const lastSeenDate = new Date(lastSeen);
        const today = new Date();
        if (lastSeenDate.toDateString() !== today.toDateString()) {
            hasUnreadInfo.value = true;
        }
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  stopPolling();
});

watch(() => route.path, () => {
  autoExpandMenu();
});

const pageTitle = computed(() => {
  return (route.meta.title as string) || 'Dashboard';
});
</script>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.icon-filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
