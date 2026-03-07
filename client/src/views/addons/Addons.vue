<template>
  <div class="flex flex-col gap-8">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">Manajemen Add-on</h2>
        <p class="text-[#4c739a] dark:text-slate-400 mt-1">Kelola add-on dan layanan tambahan untuk tenant.</p>
      </div>
    </div>

    <!-- Tenant Selection Message -->
    <div v-if="needsTenantSelection" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-full mb-4">
        <span class="material-symbols-outlined text-4xl text-slate-400">storefront</span>
      </div>
      <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-2">Pilih Tenant Terlebih Dahulu</h3>
      <p class="text-[#4c739a] text-sm text-center max-w-md">Silakan pilih tenant dari dropdown di atas untuk melihat dan mengelola add-on mereka.</p>
    </div>

    <div v-else-if="loading" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-[#4c739a] text-sm font-medium">Memuat data add-on...</p>
    </div>

    <div v-else class="flex flex-col gap-8">
      <!-- Active Addons -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-6">
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-blue-600">check_circle</span>
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Add-on Aktif</h3>
        </div>

        <div v-if="activeAddons.length === 0" class="text-center py-10 text-[#4c739a] text-sm bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          Belum ada add-on aktif untuk tenant ini.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="addon in activeAddons"
            :key="addon.id"
            class="group relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-blue-500/30 transition-all"
          >
            <div class="flex items-start justify-between mb-3">
              <h4 class="font-bold text-[#0d141b] dark:text-white">{{ addon.addonName }}</h4>
              <span class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100 rounded-xl">Aktif</span>
            </div>
            <p class="text-sm text-[#4c739a] mb-4 line-clamp-2">{{ getAddonDescription(addon) }}</p>
            
            <div v-if="addon.limit" class="space-y-2 mb-4">
              <div class="flex items-center justify-between text-xs font-medium">
                <span class="text-[#4c739a]">Penggunaan</span>
                <span :class="addon.isLimitReached ? 'text-red-500' : 'text-[#0d141b] dark:text-white'">
                  {{ addon.currentUsage }} / {{ addon.limit }}
                </span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="addon.isLimitReached ? 'bg-red-500' : 'bg-blue-500'"
                  :style="{ width: `${Math.min(100, ((addon.currentUsage || 0) / (addon.limit || 1)) * 100)}%` }"
                ></div>
              </div>
            </div>

            <button
              @click="unsubscribeAddon(addon.addonId)"
              class="w-full px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors mt-auto"
            >
              Nonaktifkan Layanan
            </button>
          </div>
        </div>
      </div>

      <!-- Available Addons -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-blue-600">shopping_bag</span>
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Katalog Addon</h3>
        </div>

        <div v-if="filteredAvailableAddons.length === 0" class="text-center py-10 text-[#4c739a]">
          Semua addon sudah aktif.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="addon in filteredAvailableAddons"
            :key="addon.id"
            class="flex flex-col bg-white dark:bg-slate-800 border rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-1"
            :class="addon.comingSoon ? 'border-dashed border-slate-200 bg-slate-50/50 opacity-80' : 'border-slate-200 dark:border-slate-700 hover:border-blue-500/30'"
          >
            <div class="flex items-start justify-between mb-2">
              <h4 class="font-bold text-[#0d141b] dark:text-white text-lg">{{ addon.name }}</h4>
              <span v-if="addon.comingSoon" class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-xl">
                Segera Hadir
              </span>
            </div>
            
            <p class="text-sm text-[#4c739a] mb-4 line-clamp-2 flex-1">{{ addon.description }}</p>
            
            <div class="flex items-end justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span class="text-xl font-bold text-blue-600">{{ formatCurrency(addon.price) }}</span>
                <span class="text-xs text-[#4c739a]">/bulan</span>
              </div>
              <div v-if="addon.defaultLimit" class="text-xs font-medium text-[#4c739a] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                Limit: {{ addon.defaultLimit }}
              </div>
            </div>

            <div class="flex gap-3">
              <button
                @click="showAddonDetail(addon)"
                class="flex-1 px-3 py-2 text-sm text-[#4c739a] hover:text-[#0d141b] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium transition-colors"
              >
                Detail
              </button>
              <button
                v-if="!addon.comingSoon"
                @click="subscribeAddon(addon)"
                class="flex-1 px-3 py-2 text-sm bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-blue-500/30 rounded-xl font-bold transition-all"
              >
                Beli
              </button>
              <button
                v-else
                disabled
                class="flex-1 px-3 py-2 text-sm bg-slate-200 text-slate-400 rounded-xl font-medium cursor-not-allowed"
              >
                Segera Hadir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div
      v-if="showDetailModal && selectedAddon"
      class="fixed inset-0 bg-[#0d141b]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
      @click.self="showDetailModal = false"
    >
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
           <div>
              <h3 class="text-2xl font-bold text-[#0d141b] dark:text-white">{{ selectedAddon.name }}</h3>
              <div class="flex items-center gap-2 mt-2">
                <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(selectedAddon.price) }}</span>
                <span class="text-[#4c739a]">/bulan</span>
                <span v-if="selectedAddon.comingSoon" class="ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-xl">Coming Soon</span>
              </div>
           </div>
          <button @click="showDetailModal = false" class="text-[#4c739a] hover:text-[#0d141b] transition-colors p-1 bg-slate-50 rounded-full">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="p-6 overflow-y-auto">
          <p class="text-[#4c739a] leading-relaxed mb-6">{{ selectedAddon.description }}</p>

          <div v-if="selectedAddon.details && selectedAddon.details.length > 0" class="mb-6 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700">
            <h4 class="text-sm font-bold text-[#0d141b] dark:text-white uppercase tracking-wider mb-4">Fitur yang Didapat</h4>
            <ul class="space-y-3">
              <li
                v-for="(detail, index) in selectedAddon.details"
                :key="index"
                class="flex items-start gap-3 text-sm text-[#4c739a] dark:text-slate-400"
              >
                <div class="mt-0.5 text-green-500 bg-green-50 p-0.5 rounded-full">
                  <span class="material-symbols-outlined text-[16px] block">check</span>
                </div>
                <span>{{ detail }}</span>
              </li>
            </ul>
          </div>

          <div v-if="selectedAddon.defaultLimit" class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-center gap-3">
            <span class="material-symbols-outlined text-blue-600">info</span>
            <p class="text-sm text-[#0d141b] dark:text-white">
              <span class="font-bold">Limit Tambahan:</span> {{ selectedAddon.defaultLimit }} 
              <span v-if="selectedAddon.type === 'ADD_OUTLETS'">outlet</span>
              <span v-else-if="selectedAddon.type === 'ADD_USERS'">pengguna</span>
              <span v-else-if="selectedAddon.type === 'ADD_PRODUCTS'">produk</span>
            </p>
          </div>
        </div>

        <div class="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3 bg-slate-50 dark:bg-slate-900/30">
          <button
            @click="showDetailModal = false"
            class="flex-1 px-4 py-3 bg-white border border-slate-200 text-[#0d141b] rounded-xl hover:bg-slate-50 font-bold transition-colors shadow-sm"
          >
            Tutup
          </button>
          <button
            v-if="!selectedAddon.comingSoon"
            @click="subscribeAddon(selectedAddon); showDetailModal = false"
            class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold transition-all shadow-lg shadow-blue-500/30"
          >
            Berlangganan Sekarang
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { safeFilter, safeFind } from '../../utils/array-helpers';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelector from '../../components/TenantSelector.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const { needsTenantSelection } = useTenantCheck();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const loading = ref(false);
const availableAddons = ref<any[]>([]);
const activeAddons = ref<any[]>([]);
const currentSubscription = ref<any>(null);
const showDetailModal = ref(false);
const selectedAddon = ref<any>(null);

const loadAddons = async () => {
  if (needsTenantSelection.value) {
    return; // Don't load if tenant not selected
  }
  
  loading.value = true;
  try {
    const [availableRes, activeRes, subscriptionRes] = await Promise.all([
      api.get('/addons/available'),
      api.get('/addons'),
      api.get('/subscriptions/current').catch(() => ({ data: null })), // Optional, don't fail if no subscription
    ]);
    
    // LOGGING: Log response structure untuk debugging
    console.log('[Addons] API Response - availableRes:', {
      type: typeof availableRes.data,
      isArray: Array.isArray(availableRes.data),
      data: availableRes.data
    });
    console.log('[Addons] API Response - activeRes:', {
      type: typeof activeRes.data,
      isArray: Array.isArray(activeRes.data),
      hasData: activeRes.data?.data ? 'yes' : 'no',
      data: activeRes.data
    });
    
    // NORMALISASI: Pastikan availableAddons selalu array
    if (Array.isArray(availableRes.data)) {
      availableAddons.value = availableRes.data;
    } else {
      console.warn('[Addons] availableRes.data is not array, setting to empty array');
      availableAddons.value = [];
    }
    
    // NORMALISASI: Pastikan activeAddons selalu array dengan multiple fallbacks
    let addonsData: any = null;
    if (activeRes?.data) {
      if (Array.isArray(activeRes.data)) {
        addonsData = activeRes.data;
      } else if (activeRes.data.data && Array.isArray(activeRes.data.data)) {
        addonsData = activeRes.data.data;
      } else if (activeRes.data.addons && Array.isArray(activeRes.data.addons)) {
        addonsData = activeRes.data.addons;
      }
    }
    
    // FALLBACK: Jika tidak valid, set ke array kosong
    activeAddons.value = Array.isArray(addonsData) ? addonsData : [];
    console.log('[Addons] Normalized activeAddons, length:', activeAddons.value.length);
    
    currentSubscription.value = subscriptionRes.data;
  } catch (error: any) {
    console.error('[Addons] Error loading addons:', error);
    // FALLBACK: Set ke array kosong jika error
    activeAddons.value = [];
    availableAddons.value = [];
  } finally {
    loading.value = false;
    // GUARD CLAUSE: Final safety check
    if (!Array.isArray(activeAddons.value)) {
      console.warn('[Addons] activeAddons is not array in finally, fixing...');
      activeAddons.value = [];
    }
    if (!Array.isArray(availableAddons.value)) {
      console.warn('[Addons] availableAddons is not array in finally, fixing...');
      availableAddons.value = [];
    }
  }
};



// Check if addon has defaultLimit (Tambah Outlet, Pengguna, Produk - bisa beli berapapun = Unlimited)
const hasDefaultLimit = (addon: any) => {
  return addon.defaultLimit !== null && addon.defaultLimit !== undefined;
};

// Filter and sort available addons
const filteredAvailableAddons = computed(() => {
  // Remove duplicates based on id first
  const uniqueAddons = availableAddons.value.filter((addon, index, self) => 
    index === self.findIndex(a => a && addon && a.id === addon.id)
  );
  
  // All addons are shown (can be purchased multiple times)
  const filtered: any[] = safeFilter(uniqueAddons, (_addon: any) => {
    // Semua addon selalu ditampilkan (bisa dibeli berkali-kali)
    return true;
  });
  
  // Sort: 
  // 1. Unlimited (defaultLimit !== null - Tambah Outlet, Pengguna, Produk) di atas
  // 2. Limited (defaultLimit === null - Business Analytics, dll) di tengah
  // 3. Coming soon (comingSoon === true) di bawah
  return filtered.sort((a, b) => {
    const aIsComingSoon = a?.comingSoon === true || a?.requiresApi === true;
    const bIsComingSoon = b?.comingSoon === true || b?.requiresApi === true;
    const aHasDefaultLimit = hasDefaultLimit(a);
    const bHasDefaultLimit = hasDefaultLimit(b);
    
    // Coming soon selalu di bawah
    if (aIsComingSoon && !bIsComingSoon) return 1;
    if (!aIsComingSoon && bIsComingSoon) return -1;
    
    // Jika keduanya coming soon, urutkan seperti biasa
    if (aIsComingSoon && bIsComingSoon) return 0;
    
    // Unlimited (dengan defaultLimit) di atas, Limited (tanpa defaultLimit) di bawah
    if (aHasDefaultLimit && !bHasDefaultLimit) return -1;
    if (!aHasDefaultLimit && bHasDefaultLimit) return 1;
    
    return 0;
  });
});

const getAddonDescription = (activeAddon: any) => {
  // Find matching addon from available addons by addonId or addonType
  const matchedAddon = safeFind(availableAddons.value, (a: any) => 
    a && (a.id === activeAddon?.addonId || a.type === activeAddon?.addonType)
  );
  return matchedAddon?.description || activeAddon?.addonType || 'Tidak ada deskripsi';
};

const showAddonDetail = (addon: any) => {
  selectedAddon.value = addon;
  showDetailModal.value = true;
};

const subscribeAddon = async (addon: any) => {
  if (needsTenantSelection.value) {
    return; // Don't proceed if tenant not selected
  }
  
  if (addon.comingSoon) {
    await showError('Addon ini belum tersedia. Coming soon!');
    return;
  }
  
  try {
    const response = await api.post('/payment/addon', {
      itemName: addon.name,
      amount: addon.price,
      itemId: addon.id,
      itemType: 'addon',
    });

    if (response.data.success && response.data.paymentUrl) {
      // Redirect to Midtrans payment page
      window.location.href = response.data.paymentUrl;
    } else {
      await showError(response.data.message || 'Gagal membuat pembayaran');
    }
  } catch (error: any) {
    console.error('Error creating payment:', error);
    await showError(error.response?.data?.message || 'Gagal membuat pembayaran');
  }
};

const unsubscribeAddon = async (addonId: string) => {
  const confirmed = await showConfirm('Nonaktifkan addon ini?');
  if (!confirmed) return;
  
  try {
    await api.post(`/addons/unsubscribe/${addonId}`);
    await showSuccess('Addon berhasil dinonaktifkan!');
    await loadAddons();
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menonaktifkan addon');
  }
};

const handleTenantChange = (tenantId: string | null) => {
  // Auto-refetch addons when tenant changes
  if (tenantId && !needsTenantSelection.value) {
    loadAddons();
  }
};

// Watch for tenant changes and auto-refetch
watch(() => authStore.currentTenantId, (newTenantId, oldTenantId) => {
  if (newTenantId && newTenantId !== oldTenantId && !needsTenantSelection.value) {
    loadAddons();
  }
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // For super admin, ensure selectedTenantId is synced with localStorage
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  if (!needsTenantSelection.value) {
    loadAddons();
  }
});
</script>
