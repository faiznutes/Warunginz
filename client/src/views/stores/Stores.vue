<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-display">
    <!-- Decorative Background -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10 p-4 md:p-6 lg:p-8 flex flex-col gap-8 w-full">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="flex flex-col gap-2 animate-fade-in-down">
          <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            Manajemen Toko
          </h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium text-lg">
            Kelola toko dan outlet Anda dalam satu dashboard
          </p>
        </div>
        
        <button
          v-if="canManageStores"
          @click="openCreateModal"
          class="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-400 hover:to-green-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] font-bold text-sm tracking-wide flex items-center gap-2"
        >
          <span class="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform duration-300">add_business</span>
          <span>Tambah Toko</span>
        </button>
      </div>

      <!-- Outlet Limit Info with Progress Bar -->
      <div 
        v-if="outletLimit && outletLimit.limit !== undefined && outletLimit.limit !== -1" 
        class="relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm animate-fade-in-up"
      >
        <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        
        <div class="relative flex flex-col sm:flex-row items-center justify-between gap-6 mb-4">
          <div class="flex items-center gap-4 w-full">
            <div class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <span class="material-symbols-outlined text-2xl">storefront</span>
            </div>
            <div>
              <p class="font-bold text-slate-900 dark:text-white text-lg">Batas Outlet</p>
              <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Paket Anda saat ini mendukung hingga <span class="text-slate-900 dark:text-white font-bold">{{ outletLimit.limit }}</span> outlet
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-2 whitespace-nowrap bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
            <span class="text-sm font-bold text-slate-600 dark:text-slate-300">
              {{ outletLimit.currentUsage || 0 }} / {{ outletLimit.limit }}
            </span>
            <span 
              class="text-xs font-bold px-2 py-0.5 rounded-md"
              :class="(outletLimit.currentUsage || 0) >= outletLimit.limit ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'"
            >
              {{ outletLimit.limit - (outletLimit.currentUsage || 0) }} Tersedia
            </span>
          </div>
        </div>
        
        <div class="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            class="h-full rounded-full transition-all duration-1000 ease-out relative"
            :class="(outletLimit.currentUsage || 0) >= outletLimit.limit ? 'bg-gradient-to-r from-red-500 to-red-600' : (outletLimit.currentUsage || 0) >= (outletLimit.limit * 0.8) ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'"
            :style="{ width: `${Math.min(100, ((outletLimit.currentUsage || 0) / outletLimit.limit) * 100)}%` }"
          >
            <div class="absolute inset-0 bg-white/30 w-full h-full animate-shimmer" style="background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)"></div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="mt-4 text-slate-500 font-medium animate-pulse">Memuat toko...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="stores.length === 0" class="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 animate-scale-in">
        <div class="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <span class="material-symbols-outlined text-[48px] text-slate-400">store_off</span>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum Ada Toko</h3>
        <p class="text-slate-500 dark:text-slate-400 text-center max-w-md mb-8 leading-relaxed">
          Mulai operasional bisnis Anda dengan menambahkan toko pertama.
        </p>
        <button
          v-if="canManageStores"
          @click="openCreateModal"
          class="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-blue-500 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-bold flex items-center gap-2"
        >
          <span class="material-symbols-outlined">add_business</span>
          Tambah Toko Pertama
        </button>
      </div>

      <!-- Store Cards Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(store, index) in stores"
          :key="store.id"
          class="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 p-6 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 animate-scale-in flex flex-col"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1 min-w-0 pr-4">
              <router-link :to="`/app/stores/${store.id}`" class="block group/link">
                <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 truncate group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors">
                  {{ store.name }}
                </h3>
              </router-link>
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm"
                :class="store.isActive 
                  ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                  : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'"
              >
                <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="store.isActive ? 'bg-blue-500' : 'bg-red-500'"></span>
                {{ store.isActive ? 'Aktif' : 'Tidak Aktif' }}
              </span>
            </div>
            
            <div class="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <button
                v-if="canManageStores"
                @click="editStore(store)"
                class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                title="Ubah Toko"
              >
                <span class="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button
                v-if="canManageStores"
                @click="deleteStore(store)"
                class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                title="Hapus Toko"
              >
                <span class="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </div>
          </div>
          
          <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
            <div v-if="store.address" class="flex items-start gap-3 text-slate-500 dark:text-slate-400">
              <span class="material-symbols-outlined text-[18px] mt-0.5 text-slate-400">location_on</span>
              <span class="flex-1 text-sm font-medium line-clamp-2">{{ store.address }}</span>
            </div>
            <div v-if="store.phone" class="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <span class="material-symbols-outlined text-[18px] text-slate-400">call</span>
              <span class="text-sm font-medium">{{ store.phone }}</span>
            </div>
          </div>

          <div class="pt-4 mt-2">
            <router-link 
              :to="`/app/stores/${store.id}`"
              class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-white hover:shadow-md hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
            >
              <span>Lihat Detail</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Create/Edit Modal -->
      <Teleport to="body">
        <div
          v-if="showCreateModal || editingStore"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <!-- Backdrop -->
          <div 
            class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            @click="closeModal"
          ></div>

          <!-- Modal Content -->
          <div class="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl transform transition-all duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <!-- Header -->
            <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
              <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {{ editingStore ? 'Ubah Toko' : 'Tambah Toko Baru' }}
              </h3>
              <button
                @click="closeModal"
                class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
              >
                <span class="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <!-- Scrollable Body -->
            <div class="p-6 overflow-y-auto custom-scrollbar">
              <form @submit.prevent="handleSubmit" class="space-y-5">
                <!-- Name Input -->
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Nama Toko <span class="text-red-500">*</span>
                  </label>
                  <div class="relative group">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors material-symbols-outlined text-[20px]">store</span>
                    <input
                      v-model="storeForm.name"
                      required
                      placeholder="Contoh: Cabang Jakarta Pusat"
                      class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <!-- Address Input -->
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Alamat Lengkap
                  </label>
                  <div class="relative group">
                    <span class="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors material-symbols-outlined text-[20px]">location_on</span>
                    <textarea
                      v-model="storeForm.address"
                      rows="3"
                      placeholder="Masukan alamat lengkap toko..."
                      class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-none"
                    ></textarea>
                  </div>
                </div>

                <!-- Phone Input -->
                <div class="space-y-2">
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Nomor Telepon
                  </label>
                  <div class="relative group">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors material-symbols-outlined text-[20px]">call</span>
                    <input
                      v-model="storeForm.phone"
                      type="tel"
                      placeholder="081234567890"
                      class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div v-if="editingStore" class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-500/30 transition-colors cursor-pointer" @click="storeForm.isActive = !storeForm.isActive">
                  <div class="relative flex items-center">
                    <input
                      v-model="storeForm.isActive"
                      type="checkbox"
                      id="isActive"
                      class="peer sr-only"
                    />
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </div>
                  <label class="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    Status Toko Aktif
                  </label>
                </div>

                <!-- Shift Configuration -->
                <div class="space-y-3 pt-2">
                  <label class="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                    <span>Konfigurasi Shift</span>
                    <button @click="storeForm.shiftConfig.push({ name: '', startTime: '08:00', endTime: '16:00' })" type="button" class="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                      <span class="material-symbols-outlined text-[14px]">add</span> Tambah
                    </button>
                  </label>
                  
                  <div class="space-y-3">
                      <div v-for="(shift, index) in storeForm.shiftConfig" :key="index" class="flex gap-2 items-start bg-slate-50 dark:bg-slate-900/30 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                          <div class="flex-1 space-y-1">
                              <input v-model="shift.name" placeholder="Nama (e.g. Pagi)" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                          </div>
                          <div class="w-24 space-y-1">
                              <input v-model="shift.startTime" type="time" class="w-full px-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center" />
                          </div>
                          <div class="flex items-center justify-center pt-2 text-slate-400">-</div>
                          <div class="w-24 space-y-1">
                              <input v-model="shift.endTime" type="time" class="w-full px-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-center" />
                          </div>
                          <button @click="storeForm.shiftConfig.splice(index, 1)" type="button" class="mt-1 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                              <span class="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                      </div>
                      <div v-if="storeForm.shiftConfig.length === 0" class="text-center py-4 text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        Belum ada shift yang dikonfigurasi
                      </div>
                  </div>
                </div>
              </form>
            </div>

            <!-- Footer -->
            <div class="px-6 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm flex justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                @click="closeModal"
                class="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
              >
                Batal
              </button>
              <button
                @click="handleSubmit"
                :disabled="processing"
                class="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-400 hover:to-green-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                <span v-if="processing" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ processing ? 'Menyimpan...' : (editingStore ? 'Simpan Perubahan' : 'Tambah Toko') }}</span>
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { useAuthStore } from '../../stores/auth';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();
const authStore = useAuthStore();

const canManageStores = computed(() => {
  return authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN';
});

interface Store {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  shiftConfig?: { name: string; startTime: string; endTime: string }[];
  createdAt: string;
  updatedAt: string;
}

const stores = ref<Store[]>([]);
const loading = ref(false);
const processing = ref(false);
const showCreateModal = ref(false);
const editingStore = ref<Store | null>(null);
const outletLimit = ref<any>(null);

const storeForm = ref({
  name: '',
  address: '',
  phone: '',
  isActive: true,
  shiftConfig: [] as { name: string; startTime: string; endTime: string }[],
});

const loadStores = async () => {
  // For non-super-admin, ensure tenantId is available
  if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
    console.error('Tenant ID not available for non-super-admin user');
    await showError('Tenant ID not available. Please login again.');
    return;
  }
  
  loading.value = true;
  try {
    const params: any = {};
    
    // Ensure tenantId is set in params for SUPER_ADMIN
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/outlets', { params });
    stores.value = response.data.data || [];
    
    // Check limit
    if (canManageStores.value) {
      try {
        const limitResponse = await api.get('/addons/check-limit/ADD_OUTLETS');
        outletLimit.value = limitResponse.data;
      } catch (err) {
        console.error('Failed to check outlet limit', err);
      }
    } else {
      outletLimit.value = null;
    }
  } catch (error) {
    console.error('Failed to load stores:', error);
    showError('Gagal memuat daftar toko');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = async () => {
  if (!canManageStores.value) {
    await showError('Anda tidak memiliki izin untuk menambah toko');
    return;
  }
  showCreateModal.value = true;
};

const handleSubmit = async () => {
  if (!canManageStores.value) {
    showError('Anda tidak memiliki izin untuk mengelola toko');
    return;
  }

  if (!storeForm.value.name) {
    showError('Nama toko wajib diisi');
    return;
  }
  
  processing.value = true;
  try {
    const payload = {
      ...storeForm.value,
      // Ensure tenantId is included for SUPER_ADMIN
      ...(authStore.isSuperAdmin && authStore.selectedTenantId ? { tenantId: authStore.selectedTenantId } : {})
    };
    
    if (editingStore.value) {
      await api.put(`/outlets/${editingStore.value.id}`, payload);
      showSuccess('Toko berhasil diperbarui');
    } else {
      await api.post('/outlets', payload);
      showSuccess('Toko berhasil ditambahkan');
    }
    
    closeModal();
    loadStores();
  } catch (error: any) {
    console.error('Failed to save store:', error);
    showError(error.response?.data?.message || 'Gagal menyimpan toko');
  } finally {
    processing.value = false;
  }
};

const editStore = (store: Store) => { // Kept for compatibility if needed, though mostly using router link
  if (!canManageStores.value) {
    showError('Anda tidak memiliki izin untuk mengubah toko');
    return;
  }

  editingStore.value = store;
  storeForm.value = {
    name: store.name,
    address: store.address || '',
    phone: store.phone || '',
    isActive: store.isActive,
    shiftConfig: store.shiftConfig ? [...store.shiftConfig] : [],
  };
  showCreateModal.value = true;
};

const deleteStore = async (store: Store) => {
  if (!canManageStores.value) {
    await showError('Anda tidak memiliki izin untuk menghapus toko');
    return;
  }

  const confirmed = await showConfirm(`Apakah Anda yakin ingin menghapus toko "${store.name}"? Data yang dihapus tidak dapat dikembalikan.`);
  if (!confirmed) return;
  
  try {
    await api.delete(`/outlets/${store.id}`);
    showSuccess('Toko berhasil dihapus');
    loadStores();
  } catch (error: any) {
    console.error('Failed to delete store:', error);
    showError(error.response?.data?.message || 'Gagal menghapus toko');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingStore.value = null;
  storeForm.value = {
    name: '',
    address: '',
    phone: '',
    isActive: true,
    shiftConfig: [],
  };
};

onMounted(() => {
  loadStores();
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
