<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-all"
    @click.self="handleCancel"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 font-display">
      <div class="flex items-center justify-between mb-6">
        <div>
           <h2 class="text-2xl font-bold text-slate-900">Select Tenant</h2>
           <p class="text-sm text-slate-500 font-medium mt-1">Choose a tenant to manage</p>
        </div>
        <button
          @click="handleCancel"
          class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-10">
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p class="text-slate-500 font-medium">Loading tenants...</p>
      </div>

      <div v-else-if="tenants.length === 0" class="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <span class="material-symbols-outlined text-[48px] text-slate-300 mb-2">store</span>
        <p class="text-slate-500 font-medium">No tenants available.</p>
      </div>

      <div v-else class="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar px-1">
        <button
          v-for="tenant in tenants"
          :key="tenant.id"
          @click="handleSelect(tenant.id)"
          class="w-full text-left p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-md transition-all duration-200 group"
        >
          <div class="flex items-center justify-between">
             <div class="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{{ tenant.name }}</div>
             <span class="material-symbols-outlined text-slate-300 group-hover:text-blue-500 transition-colors">arrow_forward</span>
          </div>
          <div class="text-sm text-slate-500 mt-1 font-medium group-hover:text-blue-600/70">{{ tenant.email || tenant.slug }}</div>
        </button>
      </div>

      <div class="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
        <button
          @click="handleCancel"
          class="w-full py-3 text-slate-700 font-bold bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

interface Props {
  show: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', tenantId: string): void;
}>();

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(false);
const tenants = ref<any[]>([]);

const loadTenants = async () => {
  loading.value = true;
  try {
    // Use tenants from store if available, otherwise fetch
    if (authStore.tenants.length === 0) {
      await authStore.fetchTenants();
    }
    tenants.value = authStore.tenants;
  } catch (error) {
    console.error('Error loading tenants:', error);
  } finally {
    loading.value = false;
  }
};

const handleSelect = (tenantId: string) => {
  authStore.setSelectedTenant(tenantId);
  emit('select', tenantId);
  emit('close');
};

const handleCancel = () => {
  emit('close');
  // Redirect to appropriate dashboard if no tenant selected (router guard will handle)
  if (!authStore.selectedTenantId) {
    router.push('/app');
  }
};

watch(() => props.show, (newValue) => {
  if (newValue && tenants.value.length === 0) {
    loadTenants();
  }
});

onMounted(() => {
  if (props.show) {
    loadTenants();
  }
});
</script>
