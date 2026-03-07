<template>
  <div v-if="shouldShow" class="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
    <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
      <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
        <span class="material-symbols-outlined">storefront</span>
      </div>
      
      <div class="flex-1 min-w-0">
        <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Pilih Store</p>
        <div class="relative">
          <select
            id="store-select"
            :value="selectedStoreId || ''"
            @change="handleStoreChange"
            :disabled="loading"
            class="w-full pl-0 pr-8 py-0 bg-transparent border-none text-slate-900 dark:text-white font-bold focus:ring-0 appearance-none cursor-pointer disabled:opacity-50 text-sm"
          >
            <option value="" class="dark:bg-slate-800">Semua Store (Grup)</option>
            <option 
              v-for="store in stores" 
              :key="store.id" 
              :value="store.id"
              class="dark:bg-slate-800"
            >
              {{ store.name }}
            </option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center pointer-events-none text-slate-400">
            <span class="material-symbols-outlined text-sm">expand_more</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2 pl-4 border-l border-slate-100 dark:border-slate-700">
        <button
          @click="loadStores"
          type="button"
          :disabled="loading"
          class="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
          title="Refresh Stores"
        >
          <span class="material-symbols-outlined text-[20px]" :class="{ 'animate-spin': loading }">refresh</span>
        </button>
        
        <button
          v-if="selectedStoreId && !loading"
          @click="clearSelection"
          type="button"
          class="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          title="Clear Selection"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
    
    <!-- Status indicator -->
    <div v-if="selectedStoreId && selectedStoreName" class="px-4 mt-2 flex items-center gap-2 text-[11px] font-medium text-blue-600 dark:text-blue-400 transition-all animate-in fade-in duration-300">
       <span class="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
       <span>Aktif: {{ selectedStoreName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api';

interface Props {
  placeholder?: string;
  showInfo?: boolean;
  autoLoad?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih Store',
  showInfo: true,
  autoLoad: true,
});

const emit = defineEmits<{
  'store-changed': [storeId: string | null];
}>();

const authStore = useAuthStore();
const stores = ref<any[]>([]);
const loading = ref(false);
const selectedStoreId = ref<string | null>(
  localStorage.getItem('selectedStoreId')
);

const shouldShow = computed(() => {
  // Hanya tampilkan untuk SUPERVISOR (bisa switch store)
  // Kasir dan Dapur tidak perlu store selector, langsung pakai assignedStoreId
  if (authStore.isSuperAdmin) {
    return !!authStore.selectedTenantId;
  }
  // Hanya SUPERVISOR yang bisa switch store
  return authStore.user?.role === 'SUPERVISOR';
});

const selectedStoreName = computed(() => {
  if (!selectedStoreId.value) return '';
  if (!Array.isArray(stores.value)) return '';
  const store = stores.value.find(s => s && s.id === selectedStoreId.value);
  return store?.name || '';
});

const loadStores = async () => {
  if (!shouldShow.value) return;
  
  loading.value = true;
  try {
    const response = await api.get('/outlets');
    const allStores = response.data.data || [];
    
    // Filter stores berdasarkan role dan permissions
    if (authStore.user?.role === 'SUPERVISOR') {
      // SUPERVISOR: hanya tampilkan stores yang diizinkan
      const permissions = (authStore.user as any)?.permissions;
      const allowedStoreIds = Array.isArray(permissions?.allowedStoreIds) 
        ? permissions.allowedStoreIds 
        : [];
      
      if (allowedStoreIds.length > 0) {
        stores.value = allStores.filter((s: any) => 
          allowedStoreIds.includes(s.id) && s.isActive !== false
        );
      } else {
        stores.value = [];
      }
    } else if (authStore.user?.role === 'CASHIER' || authStore.user?.role === 'KITCHEN') {
      // CASHIER/KITCHEN: hanya tampilkan assigned store
      const permissions = (authStore.user as any)?.permissions;
      const assignedStoreId = permissions?.assignedStoreId;
      
      if (assignedStoreId) {
        stores.value = allStores.filter((s: any) => 
          s.id === assignedStoreId && s.isActive !== false
        );
      } else {
        stores.value = [];
      }
    } else {
      // ADMIN_TENANT atau lainnya: tampilkan semua stores
      stores.value = allStores.filter((s: any) => s.isActive !== false);
    }
    
    // Auto-select store jika belum dipilih
    if (!selectedStoreId.value && stores.value.length > 0) {
      // Untuk SUPERVISOR dengan multiple stores, pilih yang pertama atau yang tersimpan
      if (authStore.user?.role === 'SUPERVISOR' && stores.value.length > 1) {
        const savedStoreId = localStorage.getItem('selectedStoreId');
        const savedStore = stores.value.find((s: any) => s.id === savedStoreId);
        const storeId = savedStore ? savedStoreId : stores.value[0].id;
        handleStoreChange({ target: { value: storeId } } as any);
      } else if (stores.value.length === 1) {
        // Auto-select jika hanya 1 store
      handleStoreChange({ target: { value: stores.value[0].id } } as any);
      }
    }
  } catch (error: any) {
    console.error('Error loading stores:', error);
    stores.value = [];
  } finally {
    loading.value = false;
  }
};

const handleStoreChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const storeId = target.value || null;
  selectedStoreId.value = storeId;
  
  if (storeId) {
    localStorage.setItem('selectedStoreId', storeId);
    authStore.setSelectedStore(storeId);
  } else {
    localStorage.removeItem('selectedStoreId');
    authStore.setSelectedStore(null);
  }
  
  emit('store-changed', storeId);
};

const clearSelection = () => {
  selectedStoreId.value = null;
  localStorage.removeItem('selectedStoreId');
  authStore.setSelectedStore(null);
  emit('store-changed', null);
};

watch(() => authStore.selectedTenantId, (newTenantId) => {
  if (newTenantId && authStore.isSuperAdmin) {
    // Clear store selection when tenant changes
    clearSelection();
    loadStores();
  }
});

watch(() => shouldShow.value, (show) => {
  if (show && props.autoLoad) {
    loadStores();
  }
}, { immediate: true });

onMounted(() => {
  if (props.autoLoad && shouldShow.value) {
    loadStores();
  }
});
</script>

