<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    :class="{ 'pointer-events-auto': !required, 'pointer-events-none': required }"
  >
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8" :class="{ 'pointer-events-auto': true }">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Pilih Toko</h2>
        <p class="text-gray-600 text-sm">
          {{ required ? 'Silakan pilih toko untuk melanjutkan' : isSupervisor ? 'Pilih toko yang ingin Anda kelola' : 'Pilih toko untuk melanjutkan' }}
        </p>
        <p v-if="stores.length === 0" class="text-red-600 text-sm mt-2 font-medium">
          Tidak ada toko tersedia
        </p>
      </div>

      <!-- Store List -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="stores.length === 0" class="text-center py-8">
        <p class="text-gray-500">Tidak ada toko tersedia</p>
      </div>

      <div v-else class="space-y-3 mb-6 max-h-64 overflow-y-auto">
        <button
          v-for="store in stores"
          :key="store.id"
          @click="handleSelect(store.id)"
          :disabled="selecting"
          class="w-full p-4 text-left border-2 rounded-xl transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="
            selectedStoreId === store.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-primary-300 bg-white'
          "
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 mb-1">{{ store.name }}</h3>
              <p v-if="store.address" class="text-sm text-gray-500">{{ store.address }}</p>
              <p v-else class="text-sm text-gray-400">Tidak ada alamat</p>
            </div>
            <div v-if="selectedStoreId === store.id" class="ml-4">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          v-if="!isSupervisor && !required"
          @click="handleCancel"
          class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-medium"
        >
          {{ stores.length === 0 ? 'Tutup' : 'Batal' }}
        </button>
        <button
          v-if="stores.length > 0"
          @click="handleConfirm"
          :disabled="!selectedStoreId || selecting"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span v-if="!selecting">Lanjutkan</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12c0-4.418 3.582-8 8-8v4a4 4 0 00-4 4c0 1.104.896 2 2 2h2z"></path>
            </svg>
            Memproses...
          </span>
        </button>
        <button
          v-else-if="!required"
          @click="handleCancel"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import api from '../api';
import { safeSome, safeFilter } from '../utils/array-helpers';

interface Props {
  show: boolean;
  required?: boolean; // If true, user must select a store
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', storeId: string): void;
}>();

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const selecting = ref(false);
const stores = ref<any[]>([]);
const selectedStoreId = ref<string | null>(null);

const isSupervisor = computed(() => {
  return authStore.user?.role === 'SUPERVISOR';
});

const loadStores = async () => {
  loading.value = true;
  try {
    if (isSupervisor.value) {
      // For supervisor, get stores from permissions
      const permissions = (authStore.user as any)?.permissions;
      const allowedStoreIds = permissions?.allowedStoreIds || [];
      
      if (allowedStoreIds.length > 0) {
        // Fetch stores by IDs
        const response = await api.get('/outlets');
        const allStores = response.data.data || [];
        stores.value = allStores.filter((store: any) => 
          allowedStoreIds.includes(store.id) && store.isActive
        );
      } else {
        stores.value = [];
      }
    } else {
      // For admin, get all stores
      const response = await api.get('/outlets');
      stores.value = safeFilter(response.data.data || [], (store: any) => store?.isActive);
    }
    
    // Auto-select if only one store
    if (stores.value.length === 1) {
      selectedStoreId.value = stores.value[0].id;
    } else if (Array.isArray(stores.value) && stores.value.length > 1) {
      // Check if there's a previously selected store
      const savedStoreId = localStorage.getItem('selectedStoreId');
      if (savedStoreId && safeSome(stores.value, (s: any) => s && s.id === savedStoreId)) {
        selectedStoreId.value = savedStoreId;
      }
    }
  } catch (error: any) {
    console.error('Error loading stores:', error);
    stores.value = [];
  } finally {
    loading.value = false;
  }
};

const handleSelect = (storeId: string) => {
  selectedStoreId.value = storeId;
};

const handleConfirm = async () => {
  if (!selectedStoreId.value) return;
  
  selecting.value = true;
  try {
    // Set selected store
    authStore.setSelectedStore(selectedStoreId.value);
    localStorage.setItem('selectedStoreId', selectedStoreId.value);
    
    emit('select', selectedStoreId.value);
    emit('close');
    
    // Redirect to appropriate dashboard (router guard will handle)
    router.push('/app');
  } catch (error: any) {
    console.error('Error selecting store:', error);
  } finally {
    selecting.value = false;
  }
};

const handleCancel = () => {
  if (props.required) {
    // If required and no stores, allow cancel to redirect
    if (stores.value.length === 0) {
      emit('close');
      router.push('/app');
      return;
    }
    // If required and has stores, can't cancel - just return
    return;
  }
  
  emit('close');
  // Redirect to appropriate dashboard (router guard will handle)
  router.push('/app');
};

watch(() => props.show, (newValue) => {
  if (newValue) {
    loadStores();
  }
});

onMounted(() => {
  if (props.show) {
    loadStores();
  }
});
</script>
