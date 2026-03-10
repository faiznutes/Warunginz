<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-display">
    <!-- Decorative Background -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 p-6 lg:p-8 flex flex-col gap-8 w-full">
      <!-- Tenant Selector for Super Admin -->
      <TenantSelector @tenant-changed="handleTenantChange" />

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex flex-col gap-2 animate-fade-in-down">
          <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Pelanggan
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Kelola data dan riwayat pembelian pelanggan Anda
          </p>
        </div>
        
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Action Buttons Group -->
          <div v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="flex items-center gap-2">
             <button
              @click="downloadTemplate"
              class="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group relative"
              title="Unduh Template"
            >
              <span class="material-symbols-outlined text-[20px]">download</span>
              <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Template CSV</span>
            </button>
            
            <button
              @click="triggerFileInput"
              class="p-2.5 text-blue-600 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-emerald-200 transition-all shadow-sm group relative"
              title="Impor CSV"
            >
              <span class="material-symbols-outlined text-[20px]">upload_file</span>
              <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Impor CSV</span>
            </button>
          </div>

          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            @change="handleFileImport"
            class="hidden"
          />

          <!-- Export Button -->
          <div v-if="customers.length > 0">
             <ExportButton
              :data="customers"
              filename="pelanggan"
              title="Daftar Pelanggan"
              :headers="['Nama', 'Email', 'Telepon', 'Alamat']"
              @export="handleExport"
            />
          </div>

          <button
            v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
            @click="showCreateModal = true"
            class="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-400 hover:to-green-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] font-bold text-sm tracking-wide flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform duration-300">person_add</span>
            <span>Tambah Pelanggan</span>
          </button>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-4 animate-fade-in-up" style="animation-delay: 100ms">
        <div class="relative group">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300 text-[22px]">search</span>
          <input
            v-model="filters.search"
            @focus="handleSearchFocus"
            @input="handleSearchInput"
            type="text"
            placeholder="Cari pelanggan berdasarkan nama, email, atau no. telepon..."
            class="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 font-medium"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="mt-4 text-slate-500 font-medium animate-pulse">Memuat data pelanggan...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="customers.length === 0" class="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 animate-scale-in">
        <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <span class="material-symbols-outlined text-[48px] text-slate-400">group_off</span>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum Ada Pelanggan</h3>
        <p class="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 leading-relaxed">
          Database pelanggan Anda masih kosong. Mulai tambahkan pelanggan untuk melacak riwayat pesanan mereka.
        </p>
        <button
          v-if="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
          @click="showCreateModal = true"
          class="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-bold flex items-center gap-2"
        >
          <span class="material-symbols-outlined">add_circle</span>
          Tambah Pelanggan Pertama
        </button>
      </div>


      <!-- Customer Cards Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="(customer, index) in customers"
          :key="customer.id"
          class="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 p-6 flex flex-col animate-scale-in relative overflow-hidden"
          :class="{ 'ring-2 ring-blue-500 border-blue-500 shadow-blue-500/20': isSelected(customer.id) }"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <!-- Checkbox Overlay -->
          <div v-if="canManageCustomers" class="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity" :class="{ 'opacity-100': isSelected(customer.id) }">
             <input 
               type="checkbox" 
               :checked="isSelected(customer.id)" 
               @change="toggleSelect(customer.id)"
               class="w-5 h-5 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-500 focus:ring-offset-0 cursor-pointer shadow-lg"
             />
          </div>
          <div class="flex items-start gap-4 mb-6">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-2xl shadow-inner border border-white/50 dark:border-white/10 group-hover:scale-110 transition-transform duration-300">
              {{ customer.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0 pt-1">
              <h3 class="font-bold text-lg text-slate-900 dark:text-white truncate mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {{ customer.name }}
              </h3>
              <div class="flex flex-col gap-0.5">
                <p v-if="customer.email" class="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[14px]">mail</span>
                  {{ customer.email }}
                </p>
                <p v-if="customer.phone" class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[14px]">call</span>
                  {{ customer.phone }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">shopping_bag</span>
                Pesanan
              </span>
              <span class="font-black text-slate-800 dark:text-white text-lg">{{ customer.totalOrders || 0 }}</span>
            </div>
            <div class="flex flex-col gap-1 text-right">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 justify-end">
                <span class="material-symbols-outlined text-[14px]">payments</span>
                Total
              </span>
              <span class="font-black text-blue-600 dark:text-blue-400 text-lg">{{ formatCurrency(customer.totalSpent || 0) }}</span>
            </div>
          </div>
          
          <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              v-show="canDeleteCustomers"
              @click="quickAddPoints(customer)"
              class="p-2.5 rounded-xl text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
              title="Tambah Poin"
            >
              <span class="material-symbols-outlined text-[20px]">stars</span>
            </button>
            <button
              v-show="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
              @click="editCustomer(customer)"
              class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">edit_square</span>
              Edit
            </button>
            <button
              @click="viewCustomer(customer)"
              class="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">visibility</span>
              Detail
            </button>
            <button
              v-show="canManageCustomers || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
              @click="deleteCustomer(customer.id)"
              class="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Hapus Pelanggan"
            >
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-3 mt-8 pb-8 animate-fade-in">
        <button
          @click="loadCustomers(pagination.page - 1)"
          :disabled="pagination.page === 1"
          class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow"
        >
          <span class="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        
        <span class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm">
          Hal. {{ pagination.page }} dari {{ pagination.totalPages }}
        </span>
        
        <button
          @click="loadCustomers(pagination.page + 1)"
          :disabled="pagination.page === pagination.totalPages"
          class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow"
        >
          <span class="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Bulk Action Toolbar -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-12 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-12 opacity-0"
  >
    <div v-if="selectedIds.length > 0" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-md min-w-[320px] md:min-w-[400px]">
      <div class="flex items-center gap-3 border-r border-slate-700 pr-4">
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-black">{{ selectedIds.length }}</div>
        <span class="text-sm font-bold whitespace-nowrap">Pelanggan Terpilih</span>
      </div>
      <div class="flex items-center gap-2 flex-1 justify-end">
        <button 
          @click="clearSelection" 
          class="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          Batal
        </button>
        <button 
          v-if="hasDeliveryMarketing"
          @click="showBulkMessageModal = true" 
          class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <span class="material-symbols-outlined text-[18px]">send</span>
          <span>Kirim Pesan</span>
        </button>
        <button 
          v-if="canDeleteCustomers"
          @click="bulkDelete" 
          class="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-500/20 transition-all active:scale-95"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
          <span>Hapus</span>
        </button>
      </div>
    </div>
  </Transition>

  <!-- Customer Modal -->
  <CustomerModal
    :show="showCreateModal"
    :customer="editingCustomer"
    @close="closeModal"
    @save="handleSaveCustomer"
  />

  <!-- Tenant Selector Modal -->
  <TenantSelectorModal
    :show="showTenantModal"
    @close="showTenantModal = false"
    @select="handleTenantSelected"
  />

  <!-- Customer Detail Modal -->
  <CustomerDetailModal
    :show="showDetailModal"
    :customer="viewingCustomer"
    @close="showDetailModal = false"
    @edit="handleEditFromDetail"
  />

  <!-- Bulk Message Modal -->
  <CustomerBulkMessageModal
    :show="showBulkMessageModal"
    :selected-count="selectedIds.length"
    @close="showBulkMessageModal = false"
    @send="handleBulkMessage"
  />

  <!-- Quick Add Points Modal -->
  <div
    v-if="showPointsModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    @click.self="showPointsModal = false"
  >
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-amber-500">stars</span>
          Tambah Poin
        </h3>
        <button
          @click="showPointsModal = false"
          class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <span class="material-symbols-outlined text-slate-400">close</span>
        </button>
      </div>
      
      <div class="mb-4">
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">
          Pelanggan: <span class="font-bold text-slate-900 dark:text-white">{{ pointsCustomer?.name }}</span>
        </p>
        <p class="text-xs text-slate-500 dark:text-slate-500">
          Poin saat ini: <span class="font-bold text-amber-600">{{ pointsCustomer?.loyaltyPoints || 0 }}</span>
        </p>
      </div>

      <div class="mb-6">
        <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Jumlah Poin <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="pointsToAdd"
          type="number"
          min="1"
          step="1"
          class="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white font-bold text-lg transition-all"
          placeholder="Masukkan jumlah poin"
          @keyup.enter="handleAddPoints"
        />
      </div>

      <div class="flex gap-3">
        <button
          @click="showPointsModal = false"
          class="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Batal
        </button>
        <button
          @click="handleAddPoints"
          :disabled="!pointsToAdd || pointsToAdd <= 0 || addingPoints"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <div v-if="addingPoints" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span v-else class="material-symbols-outlined text-[20px]">add</span>
          {{ addingPoints ? 'Menambahkan...' : 'Tambah Poin' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelectorModal from '../../components/TenantSelectorModal.vue';
import TenantSelector from '../../components/TenantSelector.vue';
import CustomerModal from '../../components/CustomerModal.vue';
import CustomerDetailModal from '../../components/CustomerDetailModal.vue';
import CustomerBulkMessageModal from '../../components/CustomerBulkMessageModal.vue';
import ExportButton from '../../components/ExportButton.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';
import { usePermissions } from '../../composables/usePermissions';
import { exportToCSV, exportToExcel, exportToPDF, formatDataForExport } from '../../utils/export';
import { safeArrayMethod } from '../../utils/array-helpers';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints?: number;
  totalOrders?: number;
  totalSpent?: number;
}

const authStore = useAuthStore();
const { needsTenantSelection, showTenantModal, handleTenantSelected } = useTenantCheck();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();
const { canManageCustomers } = usePermissions();

const canDeleteCustomers = computed(() => {
  const role = authStore.user?.role;
  return role === 'SUPER_ADMIN' || role === 'ADMIN_TENANT' || role === 'SUPERVISOR';
});

const canLoadAddons = computed(() => {
  const role = authStore.user?.role;
  return role === 'SUPER_ADMIN' || role === 'ADMIN_TENANT' || role === 'SUPERVISOR';
});

const customers = ref<Customer[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showDetailModal = ref(false);
const showPointsModal = ref(false);
const showBulkMessageModal = ref(false);
const editingCustomer = ref<Customer | null>(null);
const viewingCustomer = ref<Customer | null>(null);
const pointsCustomer = ref<Customer | null>(null);
const pointsToAdd = ref<number>(0);
const addingPoints = ref(false);
const activeAddons = ref<any[]>([]);
const filters = ref({
  search: '',
});
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
});

// Debounce to prevent rate limiting
const loadCustomersTimeout: ReturnType<typeof setTimeout> | null = null;

const loadCustomers = async (page = 1, forceRefresh = false) => {
  // Check if tenant selection is needed (modal as fallback)
  if (needsTenantSelection.value) {
    if (page === 1) {
      showTenantModal.value = true;
    }
    return;
  }
  
  // For non-super-admin, ensure tenantId is available
  if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
    console.error('Tenant ID not available for non-super-admin user');
    await showError('Tenant ID not available. Please login again.');
    return;
  }
  
  // Clear existing timeout
  if (loadCustomersTimeout) clearTimeout(loadCustomersTimeout);
  
  // Immediate load - no debounce for fast data display
  const doLoad = async () => {
    // For non-super-admin, ensure tenantId is available
    if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
      console.error('Tenant ID not available for non-super-admin user');
      await showError('Tenant ID not available. Please login again.');
      return;
    }
    
    loading.value = true;
    try {
      const params: any = {
        page,
        limit: pagination.value.limit,
        ...(filters.value.search && { search: filters.value.search }),
        ...(forceRefresh && { skipCache: '1' }), // Bypass cache after create/update
      };
      
      // Ensure tenantId is set in params for SUPER_ADMIN
      if (authStore.isSuperAdmin && authStore.selectedTenantId) {
        params.tenantId = authStore.selectedTenantId;
      }
      
      const response = await api.get('/customers', { params });
      const payload = response.data;
      const customerRows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      const paginationData = payload?.__pagination || payload?.pagination;

      customers.value = customerRows;
      pagination.value = paginationData || {
        page: 1,
        limit: pagination.value.limit,
        total: customerRows.length,
        totalPages: 1,
      };
    } catch (error: any) {
      console.error('Error loading customers:', error);
      if (error.response?.status !== 429) { // Don't show error for rate limiting
        await showError(error.response?.data?.message || 'Failed to load customers');
      }
    } finally {
      loading.value = false;
    }
  };
  
  doLoad();
};

const editCustomer = (customer: Customer) => {
  editingCustomer.value = customer;
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  editingCustomer.value = null;
};

const handleSaveCustomer = async (customerData: Partial<Customer>) => {
  try {
    if (editingCustomer.value) {
      // Update existing customer
      await api.put(`/customers/${editingCustomer.value.id}`, customerData);
      await showSuccess('Customer updated successfully');
    } else {
      // Create new customer
      await api.post('/customers', customerData);
      await showSuccess('Customer added successfully');
    }
    closeModal();
    await loadCustomers(pagination.value.page, true); // forceRefresh = true to bypass cache
  } catch (error: any) {
    console.error('Error saving customer:', error);
    await showError(error.response?.data?.message || 'Failed to save customer');
  }
};

const viewCustomer = (customer: Customer) => {
  viewingCustomer.value = customer;
  showDetailModal.value = true;
};

const handleEditFromDetail = (customer: Customer) => {
  showDetailModal.value = false;
  editingCustomer.value = customer;
  showCreateModal.value = true;
};

const deleteCustomer = async (id: string) => {
  if (!canDeleteCustomers.value) {
    await showError('Anda tidak memiliki izin untuk menghapus pelanggan');
    return;
  }

  const confirmed = await showConfirm('Are you sure you want to delete this customer?');
  if (!confirmed) return;
  try {
    await api.delete(`/customers/${id}`);
    await loadCustomers(pagination.value.page);
    await showSuccess('Customer deleted successfully');
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Failed to delete customer');
  }
};

const quickAddPoints = (customer: Customer) => {
  pointsCustomer.value = customer;
  pointsToAdd.value = 0;
  showPointsModal.value = true;
};

const handleAddPoints = async () => {
  if (!pointsCustomer.value || !pointsToAdd.value || pointsToAdd.value <= 0) return;
  
  try {
    addingPoints.value = true;
    const currentPoints = pointsCustomer.value.loyaltyPoints || 0;
    const newPoints = currentPoints + pointsToAdd.value;
    
    await api.put(`/customers/${pointsCustomer.value.id}`, {
      loyaltyPoints: newPoints,
    });
    
    await showSuccess(`Berhasil menambahkan ${pointsToAdd.value} poin ke ${pointsCustomer.value.name}`);
    showPointsModal.value = false;
    pointsToAdd.value = 0;
    await loadCustomers(pagination.value.page);
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menambahkan poin');
  } finally {
    addingPoints.value = false;
  }
};

watch(() => filters.value.search, () => {
  loadCustomers(1);
});

const handleTenantChange = (tenantId: string | null) => {
  // Reload customers when tenant changes
  if (tenantId && !needsTenantSelection.value) {
    loadCustomers();
  }
};

watch(() => authStore.selectedTenantId, () => {
  if (authStore.selectedTenantId && !needsTenantSelection.value) {
    loadCustomers();
  }
});

const handleSearchFocus = () => {
  // No-op, just for compatibility
};

const handleSearchInput = () => {
  loadCustomers(1);
};

// Bulk Selection Logic
const selectedIds = ref<string[]>([]);
const isSelected = (id: string) => selectedIds.value.includes(id);

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
};

const clearSelection = () => {
  selectedIds.value = [];
};

const bulkDelete = async () => {
  if (!canDeleteCustomers.value) {
    await showError('Anda tidak memiliki izin untuk menghapus pelanggan');
    return;
  }

  if (selectedIds.value.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menghapus ${selectedIds.value.length} pelanggan terpilih? Tindakan ini tidak dapat dibatalkan.`
  );
  
  if (!confirmed) return;
  
  try {
    loading.value = true;
    await Promise.all(selectedIds.value.map(id => api.delete(`/customers/${id}`)));
    await showSuccess('Pelanggan terpilih berhasil dihapus');
    clearSelection();
    await loadCustomers(pagination.value.page);
  } catch (err: any) {
    console.error('Bulk delete error:', err);
    await showError('Gagal menghapus beberapa pelanggan. Silakan coba lagi.');
  } finally {
    loading.value = false;
  }
};

// Check if DELIVERY_MARKETING addon is active
const hasDeliveryMarketing = computed(() => {
  try {
    const addonsToCheck = activeAddons.value;
    if (!addonsToCheck || !Array.isArray(addonsToCheck)) {
      return false;
    }
    
    return safeArrayMethod(
      addonsToCheck,
      (addons) => {
        try {
          if (!Array.isArray(addons)) return false;
          return addons.some(
            (addon) => addon && addon.addonType === 'DELIVERY_MARKETING' && addon.status === 'active'
          );
        } catch (error) {
          console.error('Error in hasDeliveryMarketing .some():', error);
          return false;
        }
      },
      false
    );
  } catch (error) {
    console.error('[Customers hasDeliveryMarketing] Outer error:', error);
    return false;
  }
});

// Load active addons
const loadAddons = async () => {
  if (!canLoadAddons.value) {
    activeAddons.value = [];
    return;
  }

  try {
    const response = await api.get('/addons');
    const addonsData = response.data?.data || response.data || [];
    activeAddons.value = Array.isArray(addonsData) ? addonsData : [];
  } catch (error: any) {
    console.error('Error loading addons:', error);
    activeAddons.value = [];
  }
};

// Handle bulk message
const handleBulkMessage = async (data: { message: string; type: 'SMS' | 'EMAIL' | 'WHATSAPP' }) => {
  if (selectedIds.value.length === 0) return;
  
  try {
    loading.value = true;
    
    // Get selected customers with their contact info
    const selectedCustomers = customers.value.filter(c => selectedIds.value.includes(c.id));
    
    // Filter customers that have the required contact info
    const customersWithContact = selectedCustomers.filter(c => {
      if (data.type === 'SMS' || data.type === 'WHATSAPP') {
        return c.phone;
      } else if (data.type === 'EMAIL') {
        return c.email;
      }
      return false;
    });
    
    if (customersWithContact.length === 0) {
      await showError(`Tidak ada pelanggan terpilih yang memiliki ${data.type === 'EMAIL' ? 'email' : 'nomor telepon'}`);
      return;
    }
    
    // Send messages based on type
    if (data.type === 'SMS' || data.type === 'WHATSAPP') {
      // Use marketing service for SMS/WhatsApp campaigns
      await api.post('/marketing/campaigns/send-sms', {
        name: `Bulk Message - ${new Date().toLocaleDateString()}`,
        content: data.message,
        type: data.type,
        target: {
          customerIds: customersWithContact.map(c => c.id),
        },
      });
      
      await showSuccess(`Pesan ${data.type} berhasil dikirim ke ${customersWithContact.length} pelanggan`);
    } else if (data.type === 'EMAIL') {
      // Use marketing service for email campaigns
      await api.post('/marketing/campaigns/send-email', {
        name: `Bulk Message - ${new Date().toLocaleDateString()}`,
        subject: 'Pesan dari Toko',
        content: data.message,
        target: {
          customerIds: customersWithContact.map(c => c.id),
        },
      });
      
      await showSuccess(`Pesan email berhasil dikirim ke ${customersWithContact.length} pelanggan`);
    }
    
    showBulkMessageModal.value = false;
    clearSelection();
  } catch (error: any) {
    console.error('Bulk message error:', error);
    await showError(error.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.');
  } finally {
    loading.value = false;
  }
};

// Export/Import Logic
const handleExport = (format: 'csv' | 'excel' | 'pdf' | 'email') => {
  const exportData = formatDataForExport(customers.value, {
    name: 'Nama',
    email: 'Email',
    phone: 'Telepon',
    address: 'Alamat',
    totalOrders: 'Total Pesanan',
    totalSpent: 'Total Belanja'
  });

  if (format === 'email') {
    handleEmailReport('Daftar Pelanggan');
    return;
  }

  if (format === 'csv') {
    exportToCSV(exportData, 'daftar_pelanggan', ['Nama', 'Email', 'Telepon', 'Alamat', 'Total Pesanan', 'Total Belanja']);
  } else if (format === 'excel') {
    exportToExcel(exportData, 'daftar_pelanggan', ['Nama', 'Email', 'Telepon', 'Alamat', 'Total Pesanan', 'Total Belanja']);
  } else if (format === 'pdf') {
    exportToPDF(exportData, 'daftar_pelanggan', 'Daftar Pelanggan', ['Nama', 'Email', 'Telepon', 'Alamat', 'Total Pesanan', 'Total Belanja']);
  }
};

const handleEmailReport = async (title: string) => {
  const email = window.prompt('Masukkan alamat email penerima:');
  if (!email) return;
  
  if (!email.includes('@')) {
    await showError('Alamat email tidak valid');
    return;
  }
  
  try {
    await showSuccess(`Laporan "${title}" telah dijadwalkan untuk dikirim ke ${email}`);
  } catch {
    await showError('Gagal menjadwalkan pengiriman email');
  }
};

const fileInput = ref<HTMLInputElement | null>(null);
const triggerFileInput = () => fileInput.value?.click();

const downloadTemplate = () => {
  const headers = 'Nama,Email,Telepon,Alamat\n';
  const sample = 'John Doe,john@example.com,08123456789,Jl. Sample No. 123\n';
  const blob = new Blob(['\uFEFF' + headers + sample], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'template_pelanggan.csv');
  link.click();
};

const handleFileImport = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    const text = e.target?.result as string;
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length <= 1) return;

    const customersToImport: any[] = [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const cust: any = {};
      
      headers.forEach((h, idx) => {
        if (h.includes('nama')) cust.name = values[idx];
        else if (h.includes('email')) cust.email = values[idx];
        else if (h.includes('telepon') || h.includes('phone')) cust.phone = values[idx];
        else if (h.includes('alamat')) cust.address = values[idx];
      });
      
      if (cust.name) customersToImport.push(cust);
    }

    if (customersToImport.length > 0) {
      const confirmed = await showConfirm(`Impor ${customersToImport.length} pelanggan?`);
      if (confirmed) {
        try {
          loading.value = true;
          await Promise.all(customersToImport.map(c => api.post('/customers', c)));
          await showSuccess(`Berhasil mengimpor ${customersToImport.length} pelanggan`);
          await loadCustomers(1);
        } catch {
          await showError('Gagal mengimpor pelanggan');
        } finally {
          loading.value = false;
        }
      }
    }
    input.value = '';
  };
  reader.readAsText(file);
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  // Load addons to check if bulk message feature is available
  loadAddons();
  
  if (!needsTenantSelection.value) {
    loadCustomers();
  }
});
</script>
