<template>
  <div class="flex flex-col h-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-[#0d141b] dark:text-white leading-tight">Tenant Support</h2>
        <p class="text-sm text-[#4c739a] dark:text-slate-400 mt-1">Kelola dan bantu operasional tenant Anda.</p>
      </div>
    </div>

    <!-- Tenant & Store Selection Area -->
    <div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
       <!-- Tenant Selector (only for SUPER_ADMIN) -->
      <div v-if="authStore.isSuperAdmin">
        <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">
          Pilih Tenant <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <select
            v-model="selectedTenantId"
            @change="handleTenantChange"
            class="w-full pl-4 pr-10 py-2.5 bg-[#f6f7f8] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 text-[#0d141b] dark:text-white appearance-none cursor-pointer"
            :class="{ 'border-red-300': !selectedTenantId && showError }"
          >
            <option value="">-- Pilih Tenant --</option>
            <option 
              v-for="tenant in tenants" 
              :key="tenant.id" 
              :value="tenant.id"
            >
              {{ tenant.name }} {{ tenant.isActive === false ? '(Tidak Aktif)' : '' }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#4c739a]">
            <span class="material-symbols-outlined">expand_more</span>
          </div>
        </div>
        <p v-if="!selectedTenantId && showError" class="mt-2 text-xs text-red-500 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">error</span>
          Silakan pilih tenant terlebih dahulu
        </p>

        <!-- Selected Tenant Info Badge -->
        <div v-if="selectedTenant" class="mt-3 flex items-center gap-2">
          <div class="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 flex items-center gap-2">
             <span class="material-symbols-outlined text-blue-500 text-[18px]">verified</span>
             <span class="text-sm text-[#0d141b] dark:text-white font-medium">{{ selectedTenant.name }}</span>
             <span class="w-px h-3 bg-slate-300 dark:bg-slate-600 mx-1"></span>
             <span class="text-xs font-bold uppercase tracking-wider" :class="selectedTenant.isActive === false ? 'text-red-600' : 'text-blue-600'">
                {{ selectedTenant.isActive === false ? 'Tidak Aktif' : 'Aktif' }}
             </span>
          </div>
        </div>
      </div>
      
      <!-- Tenant Info for ADMIN_TENANT (auto-selected from user) -->
      <div v-else-if="authStore.user?.role === 'ADMIN_TENANT' && authStore.user?.tenantId">
        <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Tenant Anda</label>
        <div class="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <span class="material-symbols-outlined text-blue-500">store</span>
          <span class="text-sm font-bold text-[#0d141b] dark:text-white">{{ authStore.user.tenantName || 'Tenant Anda' }}</span>
        </div>
      </div>
      
      <!-- Store Selector (only show when tenant is selected) -->
      <div v-if="selectedTenantId" class="pt-4 border-t border-slate-100 dark:border-slate-700">
         <label class="block text-xs font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-2">Pilih Outlet / Cabang</label>
         <StoreSelector @store-changed="handleStoreChange" />
      </div>
    </div>

    <!-- Tabs & Content -->
    <div v-if="selectedTenantId" class="flex-1 flex flex-col min-h-0">
      <!-- Tab Navigation -->
      <div class="flex items-center border-b border-slate-200 dark:border-slate-700 overflow-x-auto mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap"
          :class="activeTab === tab.id 
            ? 'border-[#10b981] text-[#10b981]' 
            : 'border-transparent text-[#4c739a] hover:text-[#0d141b] dark:hover:text-white'"
        >
          <component :is="tab.icon" class="w-5 h-5" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab Content (Scrollable Container) -->
      <div class="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
         <div class="absolute inset-0 overflow-auto p-6 animate-fade-in">
            <!-- Dashboard Tab -->
            <TenantDashboard v-if="activeTab === 'dashboard'" :tenant-id="selectedTenantId" />

            <!-- Products Tab -->
            <TenantProducts v-if="activeTab === 'products'" :tenant-id="selectedTenantId" />

            <!-- Orders Tab -->
            <TenantOrders v-if="activeTab === 'orders'" :tenant-id="selectedTenantId" />

            <!-- Reports Tab -->
            <TenantReports v-if="activeTab === 'reports'" :tenant-id="selectedTenantId" />

            <!-- POS Tab -->
            <TenantPOS v-if="activeTab === 'pos'" :tenant-id="selectedTenantId" />

            <!-- Kitchen Tab -->
            <TenantKitchen v-if="activeTab === 'kitchen'" :tenant-id="selectedTenantId" />
         </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-10 animate-fade-in">
      <div class="text-center max-w-md">
        <div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-full inline-block mb-4">
           <span class="material-symbols-outlined text-5xl text-slate-300">storefront</span>
        </div>
        <h3 class="text-xl font-bold text-[#0d141b] dark:text-white mb-2">Pilih Tenant</h3>
        <p class="text-[#4c739a] dark:text-slate-400 text-sm">Silakan pilih tenant dari dropdown di atas untuk mulai mengelola operasional, produk, dan laporan mereka.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../api';
import TenantDashboard from './components/TenantDashboard.vue';
import TenantProducts from './components/TenantProducts.vue';
import TenantOrders from './components/TenantOrders.vue';
import TenantReports from './components/TenantReports.vue';
import TenantPOS from './components/TenantPOS.vue';
import TenantKitchen from './components/TenantKitchen.vue';
import StoreSelector from '../../components/StoreSelector.vue';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const { error: showErrorNotification } = useNotification();

const tenants = ref<any[]>([]);
const selectedTenantId = ref<string>('');
const activeTab = ref<string>('dashboard');
const showError = ref(false);
const loading = ref(false);

// Helper to create icon components
const createIcon = (name: string) => {
  return () => h('span', { class: 'material-symbols-outlined text-[20px]' }, name);
};

// Filter tabs based on role - ADMIN_TENANT doesn't need Kitchen tab
const allTabs = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: createIcon('dashboard')
  },
  { 
    id: 'products', 
    label: 'Produk', 
    icon: createIcon('inventory_2')
  },
  { 
    id: 'orders', 
    label: 'Pesanan', 
    icon: createIcon('receipt_long')
  },
  { 
    id: 'reports', 
    label: 'Laporan', 
    icon: createIcon('bar_chart')
  },
  { 
    id: 'pos', 
    label: 'POS', 
    icon: createIcon('point_of_sale')
  },
  { 
    id: 'kitchen', 
    label: 'Kitchen', 
    icon: createIcon('soup_kitchen'),
    roles: ['SUPER_ADMIN'] // Only show for SUPER_ADMIN
  },
];

// Filter tabs based on user role
const tabs = computed(() => {
  const userRole = authStore.user?.role;
  if (userRole === 'ADMIN_TENANT') {
    // ADMIN_TENANT: exclude Kitchen tab
    return allTabs.filter(tab => tab.id !== 'kitchen');
  }
  // SUPER_ADMIN: show all tabs
  return allTabs;
});

const selectedTenant = computed(() => {
  if (!selectedTenantId.value) return null;
  return tenants.value.find(t => t.id === selectedTenantId.value);
});

const loadTenants = async () => {
  loading.value = true;
  try {
    const response = await api.get('/tenants');
    const tenantList = response.data.data || response.data;
    // Filter out System tenant (double check, backend already filters)
    tenants.value = Array.isArray(tenantList) 
      ? tenantList.filter((tenant: any) => tenant.name !== 'System')
      : [];
  } catch (error: any) {
    console.error('Error loading tenants:', error);
    await showErrorNotification('Gagal memuat daftar tenant');
  } finally {
    loading.value = false;
  }
};

const handleTenantChange = () => {
  showError.value = false;
  if (selectedTenantId.value) {
    // Set selected tenant in auth store and localStorage
    // This ensures API interceptor can access it
    authStore.setSelectedTenant(selectedTenantId.value);
    localStorage.setItem('selectedTenantId', selectedTenantId.value);
  } else {
    authStore.setSelectedTenant(null);
    localStorage.removeItem('selectedTenantId');
  }
};

const handleStoreChange = (storeId: string | null) => {
  // Store selection is handled by StoreSelector component
  // This function is just for event handling if needed
  console.log('Store changed:', storeId);
};

// Watch for selectedTenantId changes
watch(selectedTenantId, (newId) => {
  if (newId) {
    authStore.setSelectedTenant(newId);
    localStorage.setItem('selectedTenantId', newId);
  } else {
    authStore.setSelectedTenant(null);
    localStorage.removeItem('selectedTenantId');
  }
});

onMounted(async () => {
  // For SUPER_ADMIN, load tenants list
  if (authStore.isSuperAdmin) {
    await loadTenants();
    // If there's a previously selected tenant, use it
    if (authStore.selectedTenantId) {
      selectedTenantId.value = authStore.selectedTenantId;
    }
  } else if (authStore.user?.role === 'ADMIN_TENANT' && authStore.user?.tenantId) {
    // For ADMIN_TENANT, auto-select their tenant
    selectedTenantId.value = authStore.user.tenantId;
    authStore.setSelectedTenant(authStore.user.tenantId);
    localStorage.setItem('selectedTenantId', authStore.user.tenantId);
  }
});
</script>
