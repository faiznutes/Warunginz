<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Manajemen Tenant</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1 font-medium">Kelola semua tenant terdaftar dan status berlangganan mereka.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Tambah Tenant</span>
      </button>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1 relative group">
           <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors text-[20px]">search</span>
           <input
            v-model="filters.search"
            @focus="handleSearchFocus"
            type="text"
            placeholder="Cari tenant berdasarkan nama atau email..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
          />
        </div>
        <!-- Status Filter Buttons -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
           <button
            @click="filters.isActive = ''"
            class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
            :class="filters.isActive === '' 
              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            Semua
          </button>
          <button
            @click="filters.isActive = 'true'"
            class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
            :class="filters.isActive === 'true' 
              ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            Aktif
          </button>
          <button
            @click="filters.isActive = 'false'"
            class="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
            :class="filters.isActive === 'false' 
              ? 'bg-white dark:bg-slate-800 text-red-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
          >
            Nonaktif
          </button>
        </div>
      </div>
    </div>

    <!-- Tenants Table -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 overflow-hidden flex flex-col">
       <div v-if="loading" class="flex flex-col items-center justify-center py-20">
         <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
         <p class="text-slate-500 text-sm font-bold animate-pulse">Memuat data tenant...</p>
       </div>

       <div v-else-if="filteredTenants.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-full mb-4">
            <span class="material-symbols-outlined text-4xl text-slate-300">store_mall_directory</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Tidak ada tenant ditemukan</h3>
          <p class="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Coba ubah filter pencarian Anda atau tambahkan tenant baru.</p>
       </div>

       <div v-else class="overflow-x-auto flex-1">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Nama Tenant</th>
              <th class="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Kontak</th>
              <th class="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Paket</th>
              <th class="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Terdaftar</th>
              <th class="px-6 py-4 text-right text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="tenant in filteredTenants" :key="tenant.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <div class="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                    {{ tenant.name?.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <button @click="viewTenantDetail(tenant.id)" class="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left flex items-center gap-1">
                      {{ tenant.name }}
                      <span class="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">arrow_forward</span>
                    </button>
                    <p class="text-xs text-slate-500 dark:text-slate-500 line-clamp-1 font-medium">{{ tenant.address || 'Alamat tidak tersedia' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                 <div class="flex flex-col gap-0.5">
                   <span class="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                     <span class="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                     {{ tenant.email || '-' }}
                   </span>
                   <span class="text-xs text-slate-500 flex items-center gap-1.5">
                     <span class="material-symbols-outlined text-[14px] text-slate-400">call</span>
                     {{ tenant.phone || '-' }}
                   </span>
                 </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm"
                  :class="tenant.isActive !== false 
                    ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                    : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'"
                >
                  <span class="size-1.5 rounded-full" :class="tenant.isActive !== false ? 'bg-blue-500' : 'bg-red-500'"></span>
                  {{ tenant.isActive !== false ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <td class="px-6 py-4">
                 <span class="px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm"
                  :class="getPlanBadgeClass(tenant.subscriptionPlan || 'BASIC')"
                 >
                   {{ getPlanName(tenant.subscriptionPlan || 'BASIC') }}
                 </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{{ formatDate(tenant.createdAt) }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="editTenant(tenant)" class="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Edit Tenant">
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button @click="deleteTenant(tenant.id)" class="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Hapus Tenant">
                    <span class="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
       </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingTenant"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-scale-in border border-slate-200 dark:border-slate-700">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 class="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
             <span class="material-symbols-outlined text-primary" v-if="!editingTenant">add_business</span>
             <span class="material-symbols-outlined text-primary" v-else>edit_square</span>
            {{ editingTenant ? 'Edit Tenant' : 'Tambah Tenant Baru' }}
          </h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-white dark:bg-slate-700 rounded-full p-1 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-600">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto custom-scrollbar">
          <form @submit.prevent="saveTenant" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama Tenant <span class="text-red-500">*</span></label>
              <input
                v-model="tenantForm.name"
                type="text"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:font-normal"
                placeholder="Contoh: Warung Makan Bahari"
              />
              <p v-if="!editingTenant" class="text-xs text-slate-500 mt-2 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-700 dark:text-blue-300">
                <span class="material-symbols-outlined text-[16px]">info</span>
                Email & password admin akan digenerate otomatis
              </p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
               <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">No. Telepon</label>
                <input
                  v-model="tenantForm.phone"
                  type="tel"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:font-normal"
                  placeholder="0812..."
                />
               </div>
               <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Paket Langganan</label>
                  <div class="relative">
                    <select
                      v-model="tenantForm.subscriptionPlan"
                      class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="DEMO">Demo (Semua Fitur)</option>
                      <option value="BASIC">Starter (BASIC)</option>
                      <option value="PRO">Boost (PRO)</option>
                      <option value="ENTERPRISE">Max (ENTERPRISE)</option>
                    </select>
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 pointer-events-none text-[20px]">expand_more</span>
                  </div>
               </div>
            </div>

            <!-- Custom Duration for DEMO -->
            <div v-if="tenantForm.subscriptionPlan === 'DEMO'" class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div class="flex items-start gap-3 mb-3">
                <span class="material-symbols-outlined text-amber-600 text-[20px]">info</span>
                <div>
                  <p class="text-sm font-bold text-amber-800 dark:text-amber-200">Paket Demo</p>
                  <p class="text-xs text-amber-700 dark:text-amber-300">Buka semua fitur premium untuk periode custom. Gratis tanpa biaya.</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-amber-800 dark:text-amber-200 mb-2">Durasi (hari) *</label>
                <input
                  v-model.number="tenantForm.demoDuration"
                  type="number"
                  min="1"
                  max="365"
                  required
                  class="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  placeholder="Masukkan jumlah hari (misal: 30)"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Alamat Lengkap</label>
              <textarea
                v-model="tenantForm.address"
                rows="3"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:font-normal"
                placeholder="Jl. Contoh No. 123, Kota..."
              ></textarea>
            </div>

            <div v-if="editingTenant" class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="tenantForm.isActive" class="sr-only peer">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
              <div class="text-sm">
                <span class="block font-bold text-slate-900 dark:text-white">Status Aktif</span>
                <span class="text-slate-500 text-xs">Nonaktifkan untuk memblokir akses tenant ini</span>
              </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-2">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-all shadow-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {{ editingTenant ? 'Simpan Perubahan' : 'Buat Tenant' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
import { formatDate } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';

const router = useRouter();

const authStore = useAuthStore();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  subscriptionPlan?: string;
  createdAt?: string;
}

const tenants = ref<Tenant[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const editingTenant = ref<Tenant | null>(null);
const filters = ref({
  search: '',
  isActive: '',
});

const tenantForm = ref({
  name: '',
  phone: '',
  address: '',
  subscriptionPlan: 'BASIC',
  demoDuration: 30,
  isActive: true,
});

const filteredTenants = computed(() => {
  if (!Array.isArray(tenants.value)) return [];
  let result = tenants.value;

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase();
    result = result.filter(t =>
      t && (t.name?.toLowerCase().includes(search) ||
      (t.email && t.email.toLowerCase().includes(search)))
    );
  }

  if (filters.value.isActive !== '') {
    const isActive = filters.value.isActive === 'true';
    result = result.filter(t => t && (t.isActive !== false) === isActive);
  }

  return result;
});

const loadTenants = async () => {
  if (!authStore.isAuthenticated) return; 
  
  loading.value = true;
  try {
    const response = await api.get('/tenants');
    tenants.value = response.data.data || response.data;
  } catch (error: any) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return;
    }
    console.error('Error loading tenants:', error);
    if (authStore.isAuthenticated) {
      await showError('Gagal memuat tenant');
    }
  } finally {
    loading.value = false;
  }
};

const viewTenantDetail = (tenantId: string) => {
  if (authStore.isSuperAdmin) {
    authStore.setSelectedTenant(tenantId);
    localStorage.setItem('selectedTenantId', tenantId);
  }
  router.push(`/app/tenants/${tenantId}`);
};

const editTenant = (tenant: any) => {
  editingTenant.value = tenant;
  tenantForm.value = {
    name: tenant.name,
    phone: tenant.phone || '',
    address: tenant.address || '',
    subscriptionPlan: tenant.subscriptionPlan || 'BASIC',
    demoDuration: 30,
    isActive: tenant.isActive !== false,
  };
};

const deleteTenant = async (id: string) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus tenant ini?');
  if (!confirmed) return;
  try {
    await api.delete(`/tenants/${id}`);
    await loadTenants();
    await showSuccess('Tenant berhasil dihapus');
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menghapus tenant');
  }
};

const saveTenant = async () => {
  try {
    const data: any = {
      name: tenantForm.value.name,
      phone: tenantForm.value.phone,
      address: tenantForm.value.address,
      subscriptionPlan: tenantForm.value.subscriptionPlan,
    };

    // Add custom duration for DEMO plan
    if (tenantForm.value.subscriptionPlan === 'DEMO') {
      data.demoDuration = tenantForm.value.demoDuration || 30;
    }

    if (editingTenant.value) {
      data.isActive = tenantForm.value.isActive;
      await api.put(`/tenants/${editingTenant.value.id}`, data);
      await showSuccess('Tenant berhasil diupdate');
    } else {
      try {
        const response = await api.post('/tenants', data);
        const defaultPassword = response.data?.defaultPassword || response.data?.users?.[0]?.password;
        if (defaultPassword) {
          await showSuccess(`Tenant berhasil dibuat! Password default: ${defaultPassword}`);
        } else {
          await showSuccess('Tenant berhasil dibuat!');
        }
      } catch (error: any) {
        if (error.response?.status === 201 || error.response?.status === 200) {
          const defaultPassword = error.response?.data?.defaultPassword || error.response?.data?.users?.[0]?.password;
          if (defaultPassword) {
            await showSuccess(`Tenant berhasil dibuat! Password default: ${defaultPassword}`);
          } else {
            await showSuccess('Tenant berhasil dibuat!');
          }
        } else {
          throw error;
        }
      }
    }

    closeModal();
    await loadTenants();
  } catch (error: any) {
    const responseData = error.response?.data;
    if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      const errorMessages = responseData.errors.map((e: any) => `${e.path}: ${e.message}`).join('\n');
      await showError(errorMessages);
    } else {
      await showError(responseData?.message || 'Gagal menyimpan tenant');
    }
  }
};

const getPlanName = (plan: string) => {
  const planNames: Record<string, string> = {
    DEMO: 'DEMO',
    BASIC: 'BASIC',
    PRO: 'PRO',
    ENTERPRISE: 'MAX',
  };
  return planNames[plan] || plan;
};

const getPlanBadgeClass = (plan: string) => {
  const classes: Record<string, string> = {
    DEMO: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',
    BASIC: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    PRO: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30',
    ENTERPRISE: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-900/30',
  };
  return classes[plan] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
};

const closeModal = () => {
  showCreateModal.value = false;
  editingTenant.value = null;
  tenantForm.value = {
    name: '',
    phone: '',
    address: '',
    subscriptionPlan: 'BASIC',
    demoDuration: 30,
    isActive: true,
  };
};

const handleSearchFocus = () => {
  // No-op
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadTenants();
});
</script>
