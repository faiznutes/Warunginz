<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
  >
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
      @click="$emit('close')"
    ></div>

    <!-- Modal Content -->
    <div 
      class="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-2xl transform transition-all duration-300 animate-scale-in overflow-hidden flex flex-col max-h-[90vh]"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
        <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {{ editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru' }}
        </h3>
        <button
          @click="$emit('close')"
          class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
        >
          <span class="material-symbols-outlined text-[24px]">close</span>
        </button>
      </div>

      <!-- Scrollable Body -->
      <div class="p-6 md:p-8 overflow-y-auto custom-scrollbar">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Name Input -->
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Nama Lengkap <span class="text-red-500">*</span>
            </label>
            <div class="relative group">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors material-symbols-outlined text-[20px]">person</span>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                placeholder="Contoh: Budi Santoso"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Email Input -->
            <div class="space-y-2">
              <label class="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div class="relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors material-symbols-outlined text-[20px]">mail</span>
                <input
                  v-model="form.email"
                  type="email"
                  class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="budi@example.com"
                />
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
                  v-model="form.phone"
                  type="tel"
                  class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="08123456789"
                />
              </div>
            </div>
          </div>

          <!-- Address Input -->
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300">
              Alamat
            </label>
            <div class="relative group">
              <span class="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors material-symbols-outlined text-[20px]">location_on</span>
              <textarea
                v-model="form.address"
                rows="3"
                class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 resize-none"
                placeholder="Masukkan alamat lengkap pelanggan..."
              ></textarea>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="px-6 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm flex justify-end gap-3 rounded-b-3xl">
        <button
          type="button"
          @click="$emit('close')"
          class="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
        >
          Batal
        </button>
        <button
          @click="handleSubmit"
          :disabled="saving"
          class="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-400 hover:to-green-500 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
        >
          <span v-if="saving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ saving ? 'Menyimpan...' : (editingCustomer ? 'Simpan Perubahan' : 'Tambah Pelanggan') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface Customer {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Props {
  show: boolean;
  customer?: Customer | null;
}

const props = withDefaults(defineProps<Props>(), {
  customer: null,
});

const emit = defineEmits<{
  close: [];
  save: [customer: Partial<Customer>];
}>();

const form = ref<Partial<Customer>>({
  name: '',
  email: '',
  phone: '',
  address: '',
});

const saving = ref(false);
const editingCustomer = computed(() => !!props.customer);

watch(() => props.customer, (newCustomer) => {
  if (newCustomer) {
    form.value = {
      name: newCustomer.name || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      address: newCustomer.address || '',
    };
  } else {
    form.value = {
      name: '',
      email: '',
      phone: '',
      address: '',
    };
  }
}, { immediate: true });

watch(() => props.show, (newShow) => {
  if (!newShow) {
    form.value = {
      name: '',
      email: '',
      phone: '',
      address: '',
    };
  }
});

const handleSubmit = () => {
  if (!form.value.name) return; // Simple validation
  saving.value = true;
  emit('save', { ...form.value });
  setTimeout(() => {
    saving.value = false;
  }, 500);
};
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

