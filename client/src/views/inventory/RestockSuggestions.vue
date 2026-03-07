<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Auto Restock Suggestions</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Purchase recommendations based on sales patterns.</p>
      </div>
      <button
        @click="loadSuggestions"
        :disabled="loading"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm disabled:opacity-50"
      >
        <span v-if="loading" class="flex items-center gap-2">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Loading...
        </span>
        <span v-else class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">refresh</span>
          Refresh
        </span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="suggestions.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-green-500 mb-4">check_circle</span>
      <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-2">No Restock Suggestions</h3>
      <p class="text-[#4c739a] text-center max-w-md">All products have sufficient stock or no sales data available.</p>
    </div>

    <!-- Suggestions List -->
    <div v-else class="flex flex-col gap-6">
      <!-- Filter by Urgency -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="urgencyOption in urgencyOptions"
          :key="urgencyOption.value"
          @click="selectedUrgency = urgencyOption.value"
          :class="[
            'px-4 py-2 rounded-xl font-medium transition flex items-center gap-1.5',
            selectedUrgency === urgencyOption.value
              ? urgencyOption.class
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          ]"
        >
          <span class="material-symbols-outlined text-[18px]" v-if="urgencyOption.icon">{{ urgencyOption.icon }}</span>
          {{ urgencyOption.label }}
        </button>
      </div>

      <!-- Suggestions Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          v-for="suggestion in filteredSuggestions"
          :key="suggestion.productId"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border-2 p-6"
          :class="getUrgencyBorderClass(suggestion.urgency)"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ suggestion.productName }}</h3>
              <span
                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                :class="getUrgencyBadgeClass(suggestion.urgency)"
              >
                <span class="material-symbols-outlined text-[14px]">{{ getUrgencyIcon(suggestion.urgency) }}</span>
                {{ getUrgencyLabel(suggestion.urgency) }}
              </span>
            </div>
            <button
              @click="goToProduct(suggestion.productId)"
              class="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1 font-medium"
            >
              <span class="material-symbols-outlined text-[16px]">visibility</span>
              View Product
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Stock</p>
              <p class="text-xl font-bold" :class="suggestion.currentStock === 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'">
                {{ suggestion.currentStock }}
              </p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Min Stock</p>
              <p class="text-xl font-bold text-slate-900 dark:text-white">{{ suggestion.minStock }}</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Sales/Day</p>
              <p class="text-xl font-bold text-slate-900 dark:text-white">{{ suggestion.avgDailySales.toFixed(2) }}</p>
            </div>
            <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Days Until Empty</p>
              <p class="text-xl font-bold" :class="suggestion.daysLeft < 1 ? 'text-red-600' : 'text-yellow-600'">
                {{ formatDaysLeft(suggestion.daysLeft) }}
              </p>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider mb-1">Suggested Order</p>
                <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ suggestion.suggestedQuantity }} units</p>
                <p class="text-xs text-blue-500 dark:text-blue-400 mt-1">Enough for ~7 days + buffer</p>
              </div>
              <button
                @click="applySuggestion(suggestion)"
                class="px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

interface RestockSuggestion {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  avgDailySales: number;
  daysLeft: number;
  suggestedQuantity: number;
  urgency: 'critical' | 'warning' | 'normal';
}

const router = useRouter();
const { success: showSuccess, error: showError } = useNotification();

const suggestions = ref<RestockSuggestion[]>([]);
const loading = ref(false);
const selectedUrgency = ref<'all' | 'critical' | 'warning' | 'normal'>('all');

const urgencyOptions: Array<{ value: 'all' | 'critical' | 'warning' | 'normal', label: string, class?: string, icon: string }> = [
  { value: 'all', label: 'All', icon: 'filter_list' },
  { value: 'critical', label: 'Critical', class: 'bg-red-600 text-white', icon: 'error' },
  { value: 'warning', label: 'Warning', class: 'bg-yellow-600 text-white', icon: 'warning' },
  { value: 'normal', label: 'Normal', class: 'bg-blue-500 text-white', icon: 'info' },
];

const filteredSuggestions = computed(() => {
  if (selectedUrgency.value === 'all') {
    return suggestions.value;
  }
  return suggestions.value.filter(s => s.urgency === selectedUrgency.value);
});

const getUrgencyBadgeClass = (urgency: string) => {
  const classes: Record<string, string> = {
    critical: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
    normal: 'bg-blue-100 text-blue-600',
  };
  return classes[urgency] || 'bg-slate-100 text-slate-700';
};

const getUrgencyBorderClass = (urgency: string) => {
  const classes: Record<string, string> = {
    critical: 'border-red-300 dark:border-red-800',
    warning: 'border-yellow-300 dark:border-yellow-800',
    normal: 'border-blue-300 dark:border-blue-800',
  };
  return classes[urgency] || 'border-slate-200 dark:border-slate-700';
};

const getUrgencyLabel = (urgency: string) => {
  const labels: Record<string, string> = {
    critical: 'Critical',
    warning: 'Warning',
    normal: 'Normal',
  };
  return labels[urgency] || urgency;
};

const getUrgencyIcon = (urgency: string) => {
  const icons: Record<string, string> = {
    critical: 'error',
    warning: 'warning',
    normal: 'info',
  };
  return icons[urgency] || 'help';
};

const formatDaysLeft = (days: number): string => {
  if (days === Infinity || days > 365) {
    return '> 1 year';
  }
  if (days < 1) {
    return '< 1 day';
  }
  if (days < 7) {
    return `${Math.ceil(days)} days`;
  }
  if (days < 30) {
    return `${Math.ceil(days / 7)} weeks`;
  }
  return `${Math.ceil(days / 30)} months`;
};

const loadSuggestions = async () => {
  loading.value = true;
  try {
    const response = await api.get('/inventory/restock-suggestions');
    suggestions.value = response.data || [];
  } catch (error: any) {
    console.error('Error loading restock suggestions:', error);
    showError(error.response?.data?.message || 'Failed to load restock suggestions');
  } finally {
    loading.value = false;
  }
};

const goToProduct = (productId: string) => {
  router.push(`/app/products?highlight=${productId}`);
};

const applySuggestion = async (suggestion: RestockSuggestion) => {
  try {
    // Navigate to purchase order with pre-filled data
    router.push({
      path: '/app/inventory/purchase-orders',
      query: {
        productId: suggestion.productId,
        quantity: suggestion.suggestedQuantity.toString(),
      },
    });
    showSuccess('Redirecting to Purchase Order page');
  } catch {
    showError('Failed to apply suggestion');
  }
};

onMounted(() => {
  loadSuggestions();
});
</script>
