<template>
  <div class="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-900 group/design-root overflow-x-hidden font-sans text-slate-900 dark:text-slate-100">
      <!-- Header -->
      <header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-10 py-4 shadow-sm">
          <div class="flex items-center gap-4">
               <router-link :to="`/app/stores/${route.params.id}`" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                  <span class="material-symbols-outlined text-2xl">arrow_back</span>
               </router-link>
               <div class="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 text-white">
                  <span class="material-symbols-outlined text-xl">edit_square</span>
              </div>
               <div class="flex flex-col">
                  <h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight">Ubah Toko</h2>
                  <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">Manajemen Outlet</span>
              </div>
          </div>
          <div class="flex gap-3">
               <button @click="cancelEdit" class="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                  Hint: Batal
              </button>
              <button @click="saveChanges" :disabled="isSaving" class="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-400 hover:to-green-500 text-white text-sm font-bold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:scale-95">
                  <span v-if="isSaving" class="flex items-center gap-2">
                    <span class="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></span>
                    Menyimpan...
                  </span>
                  <span v-else class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px]">save</span>
                    Simpan Perubahan
                  </span>
              </button>
          </div>
      </header>
  
      <div class="layout-container flex h-full grow flex-col animate-fade-in" v-if="form">
          <div class="flex flex-1 justify-center py-8 px-4 sm:px-6 lg:px-8">
              <div class="layout-content-container flex flex-col w-full flex-1 gap-8">
                   <!-- Page Heading -->
                  <div class="flex flex-col gap-2 pb-6 border-b border-slate-200 dark:border-slate-700">
                      <h1 class="text-3xl md:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Edit Detail Toko</h1>
                      <p class="text-slate-500 dark:text-slate-400 text-base font-medium">Update profil toko, lokasi, jadwal operasional, dan konfigurasi shift outlet Anda.</p>
                  </div>
  
                  <!-- Main Form Grid -->
                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <!-- Left Column: Primary Info -->
                      <div class="lg:col-span-8 flex flex-col gap-8">
                          <!-- Card: Basic Information -->
                          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                               <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                  <span class="material-symbols-outlined text-blue-500">store</span>
                                  <h3 class="text-lg font-bold">Informasi Dasar</h3>
                              </div>
                              <div class="p-6 flex flex-col gap-6">
                                  <label class="flex flex-col gap-2 group">
                                      <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Nama Toko <span class="text-red-500">*</span></p>
                                      <div class="relative">
                                          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors material-symbols-outlined text-[20px]">storefront</span>
                                          <input v-model="form.name" class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400" placeholder="Contoh: Warung Berkah Jaya" />
                                      </div>
                                  </label>
                                  <label class="flex flex-col gap-2 group">
                                      <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Nomor Telepon</p>
                                      <div class="relative">
                                          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors material-symbols-outlined text-[20px]">call</span>
                                          <input v-model="form.phone" class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-slate-400" placeholder="08123456789" />
                                      </div>
                                  </label>
                              </div>
                          </div>
  
                           <!-- Card: Location -->
                          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                               <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                  <span class="material-symbols-outlined text-red-500">location_on</span>
                                  <h3 class="text-lg font-bold">Lokasi & Alamat</h3>
                              </div>
                              <div class="p-6 flex flex-col gap-6">
                                  <label class="flex flex-col gap-2 group">
                                      <p class="text-sm font-bold text-slate-700 dark:text-slate-300">Alamat Lengkap</p>
                                      <div class="relative">
                                          <span class="absolute left-4 top-4 text-slate-400 group-focus-within:text-red-500 transition-colors material-symbols-outlined text-[20px]">map</span>
                                          <textarea v-model="form.address" class="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white font-medium min-h-[120px] focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all outline-none placeholder:text-slate-400 resize-none" placeholder="Jl. Jenderal Sudirman No. 123..."></textarea>
                                      </div>
                                  </label>
                              </div>
                          </div>

                           <!-- Card: Shift Configuration -->
                           <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <span class="material-symbols-outlined text-amber-500">work_history</span>
                                        <h3 class="text-lg font-bold">Konfigurasi Shift</h3>
                                    </div>
                                    <button @click="addShift" type="button" class="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                                        <span class="material-symbols-outlined text-[16px]">add</span> Tambah Shift
                                    </button>
                                </div>
                                <div class="p-6 flex flex-col gap-4">
                                    <div v-if="form.shiftConfig && form.shiftConfig.length > 0" class="space-y-3">
                                        <div v-for="(shift, index) in form.shiftConfig" :key="index" class="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
                                            <div class="flex-1 w-full sm:w-auto">
                                                <label class="text-xs font-bold text-slate-400 block mb-1 ml-1">Nama Shift</label>
                                                <input v-model="shift.name" placeholder="Nama (e.g. Pagi)" class="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" />
                                            </div>
                                            <div class="flex items-center gap-2 w-full sm:w-auto">
                                                <div class="flex-1">
                                                    <label class="text-xs font-bold text-slate-400 block mb-1 ml-1">Mulai</label>
                                                    <input v-model="shift.startTime" type="time" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-center" />
                                                </div>
                                                <div class="flex items-center justify-center pt-5 text-slate-400">-</div>
                                                <div class="flex-1">
                                                    <label class="text-xs font-bold text-slate-400 block mb-1 ml-1">Selesai</label>
                                                    <input v-model="shift.endTime" type="time" class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-center" />
                                                </div>
                                            </div>
                                            <button @click="removeShift(index)" type="button" class="mt-0 sm:mt-5 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto sm:ml-0">
                                                <span class="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div v-else class="text-center py-8 text-slate-400 text-sm italic bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                        <span class="material-symbols-outlined text-3xl mb-2 text-slate-300">event_busy</span>
                                        <p>Belum ada shift yang dikonfigurasi</p>
                                    </div>
                                </div>
                          </div>
                      </div>
  
                      <!-- Right Column: Settings & Hours -->
                      <div class="lg:col-span-4 flex flex-col gap-8">
                           <!-- Card: Operating Hours -->
                          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1">
                               <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
                                  <span class="material-symbols-outlined text-purple-500">schedule</span>
                                  <h3 class="text-lg font-bold">Jam Operasional</h3>
                              </div>
                              <div class="p-4 flex flex-col gap-2">
                                  <div v-for="day in days" :key="day.key" class="group flex flex-col p-3 rounded-xl border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                                       <div class="flex items-center justify-between mb-2">
                                          <div class="flex items-center gap-3">
                                              <label class="relative inline-flex items-center cursor-pointer">
                                                  <input type="checkbox" v-model="form.operatingHours[day.key].isOpen" class="sr-only peer">
                                                  <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                                              </label>
                                              <span class="text-sm font-bold capitalize text-slate-700 dark:text-slate-300">{{ day.label }}</span>
                                          </div>
                                       </div>
                                       <div v-if="form.operatingHours[day.key].isOpen" class="flex items-center gap-2 pl-[52px] animate-fade-in-down">
                                          <input type="time" v-model="form.operatingHours[day.key].open" class="h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-xs font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none w-full text-center" />
                                          <span class="text-slate-400 font-bold">-</span>
                                          <input type="time" v-model="form.operatingHours[day.key].close" class="h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-xs font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none w-full text-center" />
                                       </div>
                                       <div v-else class="pl-[52px] text-xs text-slate-400 italic font-medium pt-1">Tutup / Libur</div>
                                  </div>
                              </div>
                          </div>
  
                           <!-- Status Store Toggle -->
                          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex items-center justify-between hover:border-blue-500/30 transition-colors">
                              <div class="flex flex-col gap-1">
                                  <span class="text-sm font-bold text-slate-900 dark:text-white">Status Toko</span>
                                  <span class="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-[150px]">Nonaktifkan sementara jika toko sedang libur panjang</span>
                              </div>
                               <label class="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" v-model="form.isActive" class="sr-only peer">
                                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                              </label>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div v-else class="flex items-center justify-center h-screen gap-4">
           <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p class="text-slate-500 font-medium animate-pulse">Memuat data toko...</p>
      </div>
  </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import api from '../../api';
  import { useNotification } from '../../composables/useNotification';
  
  const route = useRoute();
  const router = useRouter();
  const { success: showSuccess, error: showError } = useNotification();
  const isSaving = ref(false);
  const form = ref<any>(null);
  
  const days = [
      { key: 'monday', label: 'Senin' },
      { key: 'tuesday', label: 'Selasa' },
      { key: 'wednesday', label: 'Rabu' },
      { key: 'thursday', label: 'Kamis' },
      { key: 'friday', label: 'Jumat' },
      { key: 'saturday', label: 'Sabtu' },
      { key: 'sunday', label: 'Minggu' },
  ];

  const buildDefaultOperatingHours = () => {
      const defaultHours: Record<string, { open: string; close: string; isOpen: boolean }> = {};

      days.forEach((day) => {
          defaultHours[day.key] = { open: '08:00', close: '22:00', isOpen: true };
      });

      return defaultHours;
  };

  const normalizeOutletResponse = (payload: any) => {
      if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
          return payload.data;
      }

      return payload;
  };
  
  const fetchStore = async () => {
      try {
          const response = await api.get(`/outlets/${route.params.id}`);
          const data = normalizeOutletResponse(response.data);

          if (!data || typeof data !== 'object') {
              throw new Error('Invalid outlet payload');
          }

          const defaultHours = buildDefaultOperatingHours();
  
          form.value = {
              ...data,
              operatingHours: {
                  ...defaultHours,
                  ...(data.operatingHours || {})
              },
              shiftConfig: Array.isArray(data.shiftConfig) ? data.shiftConfig : []
          };
      } catch (error) {
          console.error('Failed to fetch store', error);
          showError('Gagal memuat data toko');
      }
  };
  
  const addShift = () => {
    if (!form.value.shiftConfig) form.value.shiftConfig = [];
    form.value.shiftConfig.push({ name: '', startTime: '08:00', endTime: '16:00' });
  };

  const removeShift = (index: number) => {
    form.value.shiftConfig.splice(index, 1);
  };

  const saveChanges = async () => {
      isSaving.value = true;
      try {
          await api.put(`/outlets/${route.params.id}`, {
              name: form.value.name,
              address: form.value.address,
              phone: form.value.phone,
              isActive: form.value.isActive,
              operatingHours: form.value.operatingHours,
              shiftConfig: form.value.shiftConfig
          });
          showSuccess('Toko berhasil diperbarui');
          router.push(`/app/stores/${route.params.id}`);
      } catch (error) {
          console.error('Failed to save store', error);
          showError('Gagal menyimpan perubahan');
      } finally {
          isSaving.value = false;
      }
  };
  
  const cancelEdit = () => {
      router.push(`/app/stores/${route.params.id}`);
  };
  
  onMounted(() => {
      fetchStore();
  });
  </script>
  
  <style scoped>
  .font-sans {
      font-family: 'Inter', sans-serif;
  }
  </style>



