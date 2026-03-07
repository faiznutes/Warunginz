<template>
  <div class="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-900 font-display text-slate-900 dark:text-slate-100">
    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-full overflow-y-auto scroll-smooth relative">
      <!-- Mobile Header -->
      <div class="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-500">store</span>
          <span class="font-bold text-lg">Detail Toko</span>
        </div>
      </div>

      <!-- Content Container -->
      <div class="flex-1 w-full p-4 md:p-8 flex flex-col gap-8 animate-fade-in" v-if="store">
        <!-- Breadcrumbs -->
        <nav class="flex text-sm font-medium text-slate-500 dark:text-slate-400 items-center gap-2">
          <router-link to="/app/dashboard" class="hover:text-blue-500 transition-colors">Beranda</router-link>
          <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          <router-link to="/app/stores" class="hover:text-blue-500 transition-colors">Semua Toko</router-link>
          <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          <span class="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{{ store.name }}</span>
        </nav>

        <!-- Page Header & Actions -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div class="flex items-start gap-5">
            <!-- Store Logo Placeholder -->
            <div class="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 border border-white/50 dark:border-white/10 shadow-lg flex items-center justify-center flex-shrink-0 animate-scale-in">
               <span class="material-symbols-outlined text-5xl text-blue-600 dark:text-blue-400">storefront</span>
            </div>
            <div class="flex flex-col gap-2 pt-1">
              <h1 class="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{{ store.name }}</h1>
              <div class="flex flex-wrap items-center gap-3 text-sm">
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-xs border border-slate-200 dark:border-slate-700">ID: {{ store.id.substring(0, 8) }}...</span>
                <span 
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm"
                  :class="store.isActive 
                    ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' 
                    : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'"
                >
                  <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="store.isActive ? 'bg-blue-500' : 'bg-red-500'"></span>
                  {{ store.isActive ? 'Operasional' : 'Tidak Aktif' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
             <button @click="handleModePengguna" class="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px]">visibility</span>
              <span class="hidden sm:inline">Mode Pengguna</span>
            </button>
            <router-link :to="`/app/stores/${store.id}/edit`" class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-400 hover:to-green-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 transform hover:-translate-y-0.5 active:scale-95">
              <span class="material-symbols-outlined text-[20px]">edit_square</span>
              <span>Ubah Profil</span>
            </router-link>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Shift</p>
              <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[20px]">schedule</span>
              </div>
            </div>
            <p class="text-3xl font-black text-slate-900 dark:text-white">{{ store.storeShifts?.length || 0 }}</p>
            <p class="text-xs text-slate-400 mt-1 font-medium">Shift terkonfigurasi</p>
          </div>
           <!-- Placeholder stats for visual balance -->
           <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group opacity-60">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Transaksi</p>
              <div class="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
            </div>
            <p class="text-3xl font-black text-slate-900 dark:text-white">-</p>
            <p class="text-xs text-slate-400 mt-1 font-medium">Bulan ini</p>
          </div>
          <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group opacity-60">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pendapatan</p>
              <div class="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[20px]">payments</span>
              </div>
            </div>
            <p class="text-3xl font-black text-slate-900 dark:text-white">-</p>
            <p class="text-xs text-slate-400 mt-1 font-medium">Bulan ini</p>
          </div>
          <div class="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group opacity-60">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rating</p>
              <div class="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-[20px]">star</span>
              </div>
            </div>
            <p class="text-3xl font-black text-slate-900 dark:text-white">-</p>
            <p class="text-xs text-slate-400 mt-1 font-medium">Rata-rata ulasan</p>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Details -->
          <div class="lg:col-span-2 flex flex-col gap-8">
            <!-- General Info Card -->
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-500">info</span>
                  <h3 class="font-bold text-slate-900 dark:text-white text-lg">Informasi Umum</h3>
                </div>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal Berdiri</label>
                    <p class="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span class="material-symbols-outlined text-slate-400 text-[18px]">calendar_today</span>
                      {{ formatDate(store.createdAt) }}
                    </p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Alamat</label>
                    <p class="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{{ store.address || '-' }}</p>
                  </div>
                   <div class="space-y-1">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Telepon</label>
                    <p class="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span class="material-symbols-outlined text-slate-400 text-[18px]">call</span>
                      {{ store.phone || '-' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

             <!-- Konfigurasi Shift Card -->
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-500">work_history</span>
                  <h3 class="font-bold text-slate-900 dark:text-white text-lg">Konfigurasi Shift</h3>
                </div>
              </div>
              <div class="p-6">
                  <div v-if="store.shiftConfig && store.shiftConfig.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div v-for="(shift, index) in store.shiftConfig" :key="index" class="flex flex-col p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                          <span class="font-bold text-slate-900 dark:text-white text-lg mb-1">{{ shift.name }}</span>
                          <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit border border-slate-200 dark:border-slate-700">
                             <span class="material-symbols-outlined text-[16px]">schedule</span>
                             {{ shift.startTime }} - {{ shift.endTime }}
                          </div>
                      </div>
                  </div>
                  <div v-else class="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-900/30 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <span class="material-symbols-outlined text-slate-300 text-4xl mb-2">event_busy</span>
                    <p class="text-slate-500 dark:text-slate-400 font-medium">Tidak ada shift khusus dikonfigurasi.</p>
                  </div>
              </div>
            </div>

          </div>

          <!-- Right Column: Operations -->
          <div class="flex flex-col gap-6">
            <!-- Jam Operasional -->
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-purple-500">schedule</span>
                  <h3 class="font-bold text-slate-900 dark:text-white text-lg">Jam Operasional</h3>
                </div>
              </div>
              <div class="p-4">
                <ul class="flex flex-col gap-1" v-if="store.operatingHours">
                  <li v-for="(hours, day) in store.operatingHours" :key="day" class="flex justify-between items-center text-sm py-3 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors border-b last:border-0 border-slate-50 dark:border-slate-700/50">
                    <span class="text-slate-500 dark:text-slate-400 font-medium capitalize flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full" :class="hours.isOpen ? 'bg-blue-400' : 'bg-slate-300'"></span>
                      {{ day }}
                    </span>
                    <span class="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md text-xs" v-if="hours.isOpen">{{ hours.open }} - {{ hours.close }}</span>
                    <span class="font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md text-xs" v-else>Tutup</span>
                  </li>
                </ul>
                 <div v-else class="flex flex-col items-center justify-center py-8 text-center">
                    <span class="material-symbols-outlined text-slate-300 text-4xl mb-2">calendar_clock</span>
                    <p class="text-slate-500 dark:text-slate-400 font-medium">Jam operasional belum diatur.</p>
                 </div>
              </div>
            </div>
            
            <!-- Quick Actions -->
             <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <h3 class="font-bold text-lg mb-2 relative z-10">Butuh Bantuan?</h3>
                <p class="text-white/80 text-sm mb-4 relative z-10">Hubungi tim support jika Anda mengalami kendala dengan toko ini.</p>
                <button @click="handleHubungiSupport" class="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-bold transition-all border border-white/20 relative z-10">
                  Hubungi Support
                </button>
             </div>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-else class="flex flex-col items-center justify-center h-full gap-4">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p class="text-slate-500 font-medium animate-pulse">Memuat detail toko...</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const route = useRoute();
const router = useRouter();
useNotification();
const store = ref<any>(null);

const fetchStore = async () => {
    try {
        const response = await api.get(`/outlets/${route.params.id}`);
        store.value = response.data.data;
    } catch (error) {
        console.error('Failed to fetch store details', error);
    }
};

const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
}

const handleModePengguna = () => {
    router.push('/app/pos');
};

const handleHubungiSupport = () => {
    router.push('/app/support');
};

onMounted(() => {
    fetchStore();
});
</script>

<style scoped>
/* Scoped styles if needed */
</style>
