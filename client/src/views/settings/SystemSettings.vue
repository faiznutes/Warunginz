<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pengaturan Sistem</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Konfigurasi preferensi sistem global dan keamanan.</p>
      </div>
      <button
        @click="saveSettings"
        :disabled="saving"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <div v-if="saving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        <span class="material-symbols-outlined text-[20px]" v-else>save</span>
        <span>{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Forms -->
      <div class="lg:col-span-2 space-y-8">
        <!-- General Settings -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-8">
             <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-sm">
                <span class="material-symbols-outlined text-[24px]">tune</span>
             </div>
             <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Pengaturan Umum</h3>
                <p class="text-sm font-medium text-slate-500">Informasi dasar aplikasi sistem</p>
             </div>
          </div>
          
          <div class="space-y-6">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Sistem</label>
              <input
                v-model="settings.systemName"
                type="text"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                placeholder="Masukkan nama sistem"
              />
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Dukungan</label>
                 <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                    <input
                      v-model="settings.supportEmail"
                      type="email"
                      class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                      placeholder="support@example.com"
                    />
                 </div>
               </div>
               <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Zona Waktu</label>
                 <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">schedule</span>
                    <select
                      v-model="settings.timezone"
                      class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                       <span class="material-symbols-outlined">expand_more</span>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
          <div class="flex items-center gap-4 mb-8">
             <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-sm">
                <span class="material-symbols-outlined text-[24px]">security</span>
             </div>
             <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Keamanan</h3>
                <p class="text-sm font-medium text-slate-500">Kebijakan kata sandi dan otentikasi</p>
             </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div class="flex items-center gap-4">
                 <div class="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400">
                    <span class="material-symbols-outlined">lock_clock</span>
                 </div>
                 <div>
                    <label class="block text-sm font-bold text-slate-900 dark:text-white">Wajibkan Kata Sandi Kuat</label>
                    <p class="text-xs text-slate-500 mt-0.5">Wajibkan kombinasi huruf, angka, dan simbol</p>
                 </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="settings.requireStrongPassword" class="sr-only peer">
                <div class="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 dark:peer-focus:ring-blue-800/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div class="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <div class="flex items-center gap-4">
                 <div class="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400">
                    <span class="material-symbols-outlined">phonelink_lock</span>
                 </div>
                 <div>
                    <label class="block text-sm font-bold text-slate-900 dark:text-white">Otentikasi Dua Faktor (2FA)</label>
                    <p class="text-xs text-slate-500 mt-0.5">Aktifkan 2FA global untuk Super Admin</p>
                 </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="settings.enable2FA" class="sr-only peer">
                <div class="w-12 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/30 dark:peer-focus:ring-blue-800/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        <!-- Subscription Receipt Template -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
           <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                 <div class="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl shadow-sm">
                    <span class="material-symbols-outlined text-[24px]">receipt_long</span>
                 </div>
                 <div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white">Template Resi Langganan</h3>
                    <p class="text-sm font-medium text-slate-500">Kelola desain dan tata letak resi pembayaran.</p>
                 </div>
              </div>
              <button
                @click="showTemplateManager = true"
                class="flex items-center gap-2 bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 px-5 py-2.5 rounded-xl transition-all font-bold text-sm border border-purple-200 dark:border-purple-800"
              >
                <span class="material-symbols-outlined text-[20px]">settings</span>
                <span>Kelola Template</span>
              </button>
           </div>
           
           <div class="mt-6 flex flex-wrap gap-4 pl-0 sm:pl-[72px]">
              <div class="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span class="material-symbols-outlined text-[16px] text-blue-500">check_circle</span>
                  A4 & Thermal (58mm/80mm)
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span class="material-symbols-outlined text-[16px] text-blue-500">check_circle</span>
                  Kustomisasi Header & Footer
              </div>
           </div>
        </div>
      </div>

      <!-- Right Column: Quick Links -->
      <div class="space-y-6">
         <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            <h3 class="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 text-lg">
               <span class="material-symbols-outlined text-slate-400">link</span>
               Aksi Cepat
            </h3>
            
            <div class="space-y-3">
               <router-link
                 to="/app/settings/2fa"
                 class="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
               >
                 <div class="bg-violet-50 dark:bg-violet-900/30 text-violet-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <span class="material-symbols-outlined">verified_user</span>
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">2FA Saya</h4>
                    <p class="text-xs text-slate-500 font-medium">Kelola otentikasi 2 faktor Anda</p>
                 </div>
               </router-link>

               <router-link
                 to="/app/settings/webhooks"
                 class="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
               >
                 <div class="bg-amber-50 dark:bg-amber-900/30 text-amber-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <span class="material-symbols-outlined">webhook</span>
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Webhooks</h4>
                    <p class="text-xs text-slate-500 font-medium">Integrasi pihak ketiga</p>
                 </div>
               </router-link>

               <router-link
                 to="/app/settings/sessions"
                 class="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
               >
                 <div class="bg-pink-50 dark:bg-pink-900/30 text-pink-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <span class="material-symbols-outlined">devices</span>
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Sesi Aktif</h4>
                    <p class="text-xs text-slate-500 font-medium">Monitor login aktif</p>
                 </div>
               </router-link>

               <router-link
                 to="/app/settings/password"
                 class="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
               >
                 <div class="bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <span class="material-symbols-outlined">password</span>
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Ubah Kata Sandi</h4>
                    <p class="text-xs text-slate-500 font-medium">Update kata sandi akun</p>
                 </div>
               </router-link>
               
               <router-link
                 to="/app/settings/gdpr"
                 class="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
               >
                 <div class="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <span class="material-symbols-outlined">policy</span>
                 </div>
                 <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">GDPR / Data</h4>
                    <p class="text-xs text-slate-500 font-medium">Ekspor dan privasi data</p>
                 </div>
               </router-link>
            </div>
         </div>
      </div>
    </div>

    <!-- Subscription Receipt Template Manager -->
    <SubscriptionReceiptTemplateManager
      :show="showTemplateManager"
      @close="showTemplateManager = false"
      @updated="() => {}"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import SubscriptionReceiptTemplateManager from '../../components/SubscriptionReceiptTemplateManager.vue';

const { success: showSuccess, error: showError } = useNotification();

const settings = ref({
  systemName: 'Warungin',
  supportEmail: 'support@warungin.com',
  timezone: 'Asia/Jakarta',
  requireStrongPassword: true,
  enable2FA: false,
});

const showTemplateManager = ref(false);
const saving = ref(false);

const loadSettings = async () => {
  try {
    const response = await api.get('/settings/system');
    const data = response.data;
    // Map backend field names to frontend field names
    settings.value = {
      systemName: data.appName || data.systemName || 'Warungin',
      supportEmail: data.supportEmail || 'support@warungin.com',
      timezone: data.timezone || 'Asia/Jakarta',
      requireStrongPassword: data.requireStrongPassword ?? true,
      enable2FA: data.enable2FA ?? false,
    };
  } catch (error: any) {
    console.error('Error loading settings:', error);
  }
};

const saveSettings = async () => {
    saving.value = true;
  try {
    await api.put('/settings/system', settings.value);
    await showSuccess('Pengaturan berhasil disimpan');
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menyimpan pengaturan');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadSettings();
});
</script>

<style scoped>
/* Scoped styles */
</style>
