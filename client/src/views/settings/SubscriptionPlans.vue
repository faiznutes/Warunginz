<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h2 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Paket Berlangganan</h2>
      <p class="text-slate-500 dark:text-slate-400 font-medium">Pilih paket yang sesuai dengan kebutuhan bisnis Anda.</p>
    </div>

    <!-- Current Plan Banner -->
    <div
      v-if="currentPlan"
      class="p-6 rounded-2xl border-l-4 shadow-sm backdrop-blur-md"
      :class="getPlanBannerClass(currentPlan.plan)"
    >
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-lg mb-1 flex items-center gap-2">
             Paket Saat Ini: 
             <span class="uppercase tracking-wider px-2 py-0.5 rounded-lg text-xs font-black bg-white/50 border border-white/20">{{ getPlanName(currentPlan.plan) }}</span>
          </h3>
          <p class="text-sm font-medium opacity-80" v-if="currentPlan.daysRemaining > 0">
            Berlaku hingga <span class="font-bold">{{ formatDate(currentPlan.subscriptionEnd) }}</span> 
            ({{ currentPlan.daysRemaining }} hari tersisa)
          </p>
          <p class="text-sm text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg inline-block mt-1" v-else>
            Paket telah berakhir. Silakan perbarui atau upgrade.
          </p>
        </div>
        <div class="text-right">
          <p class="text-3xl font-black tracking-tight" :class="getPlanTextClass(currentPlan.plan)">
            {{ getPlanPrice(currentPlan.plan) }}
          </p>
          <p class="text-xs font-bold uppercase tracking-wider opacity-60">per bulan</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-slate-500 font-bold text-sm uppercase tracking-wider">Memuat paket...</p>
    </div>

    <!-- Plans Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- BASIC Plan -->
      <div
        class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border-2 p-6 flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
        :class="currentPlan?.plan === 'BASIC' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100 dark:border-slate-700'"
      >
        <div class="text-center mb-8 relative z-10">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
             🎟️
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-1">BASIC</h3>
          <p class="text-slate-500 text-sm font-medium mb-4">Usaha Kecil (UMKM)</p>
          <div class="py-4 border-t border-b border-slate-100 dark:border-slate-700">
            <span class="text-3xl font-black text-slate-900 dark:text-white">Rp 149rb</span>
            <span class="text-slate-400 text-xs font-bold uppercase">/bulan</span>
          </div>
        </div>
        <ul class="space-y-4 mb-8 flex-1 relative z-10">
          <li class="flex items-start gap-3">
            <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">1 toko (cabang)</span>
          </li>
          <li class="flex items-start gap-3">
            <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">4 pengguna (1 admin + 2 kasir + 1 dapur)</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Mode Kasir Simpel</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Offline-first (Bisa tanpa internet)</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Pengingat stok menipis</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Auto-backup ke email</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Saran Harga Cerdas</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">PWA + Auto landscape</span>
          </li>
        </ul>
        <button
          @click="handleUpgrade('BASIC')"
          :disabled="(currentPlan?.plan === 'BASIC' && (currentPlan?.daysRemaining > 7)) || upgrading"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition relative z-10"
          :class="(currentPlan?.plan === 'BASIC' && (currentPlan?.daysRemaining > 7))
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
            : 'bg-slate-800 text-white hover:bg-slate-900 shadow-lg shadow-slate-500/20'"
        >
          <span class="material-symbols-outlined text-[20px]" v-if="currentPlan?.plan === 'BASIC'">check_circle</span>
          {{ currentPlan?.plan === 'BASIC' ? (currentPlan?.daysRemaining <= 7 ? 'Perpanjang BASIC' : 'Paket Saat Ini') : 'Pilih BASIC' }}
        </button>
      </div>

      <!-- PRO Plan -->
      <div
        class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border-2 p-6 flex flex-col transition-all hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden transform scale-105 z-10"
        :class="currentPlan?.plan === 'PRO' ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-blue-500/30'"
      >
        <div class="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none"></div>
        <div
          v-if="currentPlan?.plan !== 'PRO'"
          class="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black tracking-widest uppercase shadow-md"
        >
          POPULER
        </div>
        <div class="text-center mb-8 relative z-10">
          <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
             ⚡
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-1">PRO</h3>
          <p class="text-blue-600 dark:text-blue-400 text-sm font-bold mb-4">Bisnis Menengah - Besar</p>
          <div class="py-4 border-t border-b border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl">
            <span class="text-4xl font-black text-blue-600 dark:text-blue-400">Rp 299rb</span>
            <span class="text-slate-400 text-xs font-bold uppercase">/bulan</span>
          </div>
        </div>
        <ul class="space-y-4 mb-8 flex-1 relative z-10">
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Maksimal 3 toko (cabang)</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">10 pengguna</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-bold text-slate-900 dark:text-white">Semua fitur BASIC</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Multi-store sederhana</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Transfer stok antar toko</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Laporan per toko + gabungan</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Saran Restock Otomatis</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Role Supervisor Cabang</span>
          </li>
        </ul>
        <button
          @click="handleUpgrade('PRO')"
          :disabled="(currentPlan?.plan === 'PRO' && (currentPlan?.daysRemaining > 7)) || upgrading"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition relative z-10"
          :class="(currentPlan?.plan === 'PRO' && (currentPlan?.daysRemaining > 7))
            ? 'bg-blue-50/50 text-blue-400 cursor-not-allowed border border-blue-100' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30'"
        >
          <span class="material-symbols-outlined text-[20px]" v-if="currentPlan?.plan !== 'PRO'">rocket_launch</span>
          <span class="material-symbols-outlined text-[20px]" v-else>check_circle</span>
          {{ currentPlan?.plan === 'PRO' ? (currentPlan?.daysRemaining <= 7 ? 'Perpanjang PRO' : 'Paket Saat Ini') : 'Pilih PRO' }}
        </button>
      </div>

      <!-- MAX Plan -->
      <div
        class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-sm border-2 p-6 flex flex-col transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
        :class="currentPlan?.plan === 'ENTERPRISE' ? 'border-purple-500 ring-4 ring-purple-500/10' : 'border-slate-100 dark:border-slate-700'"
      >
        <div class="text-center mb-8 relative z-10">
          <div class="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
             🔴
          </div>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-1">MAX</h3>
          <p class="text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">Enterprise</p>
          <div class="py-4 border-t border-b border-slate-100 dark:border-slate-700">
             <span class="text-3xl font-black text-slate-900 dark:text-white">Custom</span>
             <span class="text-slate-400 text-xs font-bold uppercase block mt-1">Hubungi Sales</span>
          </div>
        </div>
        <ul class="space-y-4 mb-8 flex-1 relative z-10">
          <li class="flex items-start gap-3">
             <div class="p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Unlimited toko</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Unlimited pengguna</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-bold text-slate-900 dark:text-white">Semua fitur PRO</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Fitur Kustom</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Support Prioritas</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Impor massal produk & stok</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Laporan kustom sederhana</span>
          </li>
          <li class="flex items-start gap-3">
             <div class="p-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full mt-0.5 shrink-0">
                <span class="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">API internal terbatas</span>
          </li>
        </ul>
        <button
          @click="handleUpgrade('ENTERPRISE')"
          :disabled="currentPlan?.plan === 'ENTERPRISE' || upgrading"
          class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition relative z-10"
          :class="currentPlan?.plan === 'ENTERPRISE' 
            ? 'bg-purple-50 text-purple-400 cursor-not-allowed border border-purple-100' 
            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/30'"
        >
          <span class="material-symbols-outlined text-[20px]">support_agent</span>
          {{ currentPlan?.plan === 'ENTERPRISE' ? 'Paket Saat Ini' : 'Hubungi Sales' }}
        </button>
      </div>
    </div>

    <!-- Limit Warning Banner -->
    <div
      v-if="limitWarning"
      class="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-6 rounded-2xl shadow-sm animate-fade-in-up"
    >
      <div class="flex items-start gap-4">
        <div class="bg-amber-100 dark:bg-amber-900/50 p-2.5 rounded-xl text-amber-600 shrink-0">
            <span class="material-symbols-outlined text-[24px]">warning</span>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-amber-800 dark:text-amber-200 mb-1">Limit Hampir Habis</h3>
          <p class="text-sm font-medium text-amber-700 dark:text-amber-300">{{ limitWarning }}</p>
          <button
            @click="handleUpgrade('PRO')"
            class="mt-3 text-sm text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg font-bold shadow-sm transition inline-flex items-center gap-2"
          >
            Upgrade Sekarang
            <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const loading = ref(true);
const upgrading = ref(false);
const currentPlan = ref<any>(null);
const limitWarning = ref<string>('');

const getPlanName = (plan: string) => {
  const names: Record<string, string> = {
    BASIC: 'BASIC',
    PRO: 'PRO',
    ENTERPRISE: 'MAX',
  };
  return names[plan] || plan;
};

const getPlanPrice = (plan: string) => {
  const prices: Record<string, string> = {
    BASIC: 'Rp 149rb',
    PRO: 'Rp 299rb',
    ENTERPRISE: 'Rp 499rb',
  };
  return prices[plan] || '-';
};

const getPlanBannerClass = (plan: string) => {
  const classes: Record<string, string> = {
    BASIC: 'bg-slate-50 border-slate-400 text-slate-700 dark:bg-slate-800 dark:border-slate-500 dark:text-slate-200',
    PRO: 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-100',
    ENTERPRISE: 'bg-purple-50 border-purple-500 text-purple-900 dark:bg-purple-900/30 dark:border-purple-500 dark:text-purple-100',
  };
  return classes[plan] || 'bg-slate-50 border-slate-400';
};

const getPlanTextClass = (plan: string) => {
  const classes: Record<string, string> = {
    BASIC: 'text-slate-900 dark:text-white',
    PRO: 'text-blue-600 dark:text-blue-400',
    ENTERPRISE: 'text-purple-600 dark:text-purple-400',
  };
  return classes[plan] || 'text-slate-900';
};

const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

const loadCurrentPlan = async () => {
  loading.value = true;
  try {
    const response = await api.get('/subscriptions/current');
    currentPlan.value = response.data;
    
    // Check for limit warnings
    await checkLimits();
  } catch (error: any) {
    console.error('Error loading current plan:', error);
  } finally {
    loading.value = false;
  }
};

const checkLimits = async () => {
  try {
    // Use check-limit API to get actual limits (subscription + addons)
    const [outletsLimitRes, usersLimitRes] = await Promise.all([
      api.get('/addons/check-limit/ADD_OUTLETS').catch(() => ({ data: { limit: -1, currentUsage: 0 } })),
      api.get('/addons/check-limit/ADD_USERS').catch(() => ({ data: { limit: -1, currentUsage: 0 } })),
    ]);
    
    const outletsLimit = outletsLimitRes.data;
    const usersLimit = usersLimitRes.data;
    
    // Check if any limit is approaching (>= 80%)
    if (outletsLimit.limit !== undefined && outletsLimit.limit !== -1) {
      const usagePercent = (outletsLimit.currentUsage || 0) / outletsLimit.limit;
      if (usagePercent >= 0.8) {
        limitWarning.value = `Anda telah menggunakan ${outletsLimit.currentUsage || 0}/${outletsLimit.limit} toko. Pertimbangkan untuk upgrade ke paket yang lebih tinggi atau beli addon tambahan.`;
      }
    } else if (usersLimit.limit !== undefined && usersLimit.limit !== -1) {
      const usagePercent = (usersLimit.currentUsage || 0) / usersLimit.limit;
      if (usagePercent >= 0.8) {
        limitWarning.value = `Anda telah menggunakan ${usersLimit.currentUsage || 0}/${usersLimit.limit} pengguna. Pertimbangkan untuk upgrade ke paket yang lebih tinggi atau beli addon tambahan.`;
      }
    }
  } catch (error: any) {
    console.error('Error checking limits:', error);
  }
};

const handleUpgrade = async (newPlan: string) => {
  if (newPlan === 'ENTERPRISE') {
    showError('Untuk paket MAX, silakan hubungi tim sales kami');
    return;
  }

  const confirmed = await showConfirm(
    `Upgrade ke Paket ${getPlanName(newPlan)}?`,
    `Anda akan mengupgrade dari ${getPlanName(currentPlan.value?.plan || 'BASIC')} ke ${getPlanName(newPlan)}.`,
    'Ya, Upgrade',
    'Batal'
  );

  if (!confirmed) return;

  upgrading.value = true;
  try {
    await api.post('/subscriptions/upgrade', {
      newPlan,
      upgradeType: 'custom',
      customDuration: 30, // 30 days
    });
    showSuccess('Paket berhasil diupgrade!');
    await loadCurrentPlan();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal mengupgrade paket');
  } finally {
    upgrading.value = false;
  }
};

onMounted(() => {
  loadCurrentPlan();
});
</script>
