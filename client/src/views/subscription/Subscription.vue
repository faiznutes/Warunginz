<template>
  <div class="flex flex-col gap-8">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">Langganan</h2>
        <p class="text-[#4c739a] dark:text-[#94a3b8] mt-1">Kelola paket langganan dan status akun Anda.</p>
      </div>
      <router-link
        to="/pricing"
        class="group flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e293b] border border-[#e2e8f0] dark:border-[#334155] text-[#4c739a] hover:text-blue-600 hover:border-blue-500 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-sm"
      >
        <span>Lihat Detail Paket</span>
        <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </router-link>
    </div>

    <!-- Tenant Selection Message -->
    <div v-if="needsTenantSelection" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <div class="bg-slate-50 dark:bg-slate-900 p-4 rounded-full mb-4">
        <span class="material-symbols-outlined text-4xl text-slate-400">storefront</span>
      </div>
      <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-2">Pilih Tenant Terlebih Dahulu</h3>
      <p class="text-[#4c739a] text-sm text-center max-w-md">Silakan pilih tenant dari dropdown di atas untuk melihat informasi langganan.</p>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-[#4c739a] font-medium text-sm">Memuat data langganan...</div>
    </div>

    <div v-else class="flex flex-col gap-8">
      <!-- Current Subscription Card -->
      <div class="bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-xl shadow-primary/20 text-white overflow-hidden relative">
        <div class="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 p-24 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div class="relative p-6 sm:p-8">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-4">
                <span class="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/30">
                  <span class="material-symbols-outlined text-[16px]">verified</span>
                  Paket Saat Ini
                </span>
                <span
                  class="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl"
                  :class="subscription?.isExpired ? 'bg-red-500 text-white' : 'bg-green-500 text-white'"
                >
                  {{ subscription?.isExpired ? 'Kedaluwarsa' : 'Aktif' }}
                </span>
              </div>
              
              <div class="mb-6">
                <h3 class="text-4xl font-bold mb-2">{{ getPlanName(subscription?.plan || 'BASIC') }}</h3>
                <div class="flex items-center gap-4 text-white/80 text-sm">
                  <span class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">calendar_today</span>
                    Mulai: {{ formatDate(subscription?.subscription?.startDate) }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[18px]">event_busy</span>
                    Berakhir: {{ formatDate(subscription?.subscription?.endDate) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Timer / Countdown -->
            <div v-if="userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN'" class="flex flex-col items-center md:items-end bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div class="font-mono text-4xl font-bold tracking-tight mb-1">
                {{ formatRemainingTime(
                  subscription?.daysRemaining || 0,
                  subscription?.hoursRemaining,
                  subscription?.minutesRemaining,
                  subscription?.secondsRemaining
                ) }}
              </div>
              <div class="text-xs font-medium text-white/70 uppercase tracking-widest mb-3">
                {{ (subscription?.daysRemaining || 0) > 1 ? 'Sisa Waktu Aktif' : 'Sisa Waktu' }}
              </div>
              <div class="w-48 bg-black/20 rounded-full h-1.5 overflow-hidden">
                <div
                  class="bg-white h-full rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min(100, (subscription?.daysRemaining || 0) / 30 * 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upgrade/Extend Section -->
      <div v-if="(userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN') && !subscription?.isExpired" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">upgrade</span>
            Upgrade & Perpanjang
          </h3>
          <button
            @click="showExtendSection = !showExtendSection"
            class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-white border border-blue-600 hover:bg-blue-600 rounded-xl transition-all"
          >
            {{ showExtendSection ? 'Sembunyikan' : 'Perpanjang Paket Ini' }}
          </button>
        </div>
        
        <div class="p-6">
          <!-- Extend Section -->
          <div v-if="showExtendSection" class="mb-8 pb-8 border-b border-dashed border-slate-200 dark:border-slate-700">
            <h4 class="text-sm font-bold text-[#4c739a] uppercase tracking-wider mb-4">Opsi Perpanjangan Paket Saat Ini</h4>
            
            <!-- Plan Selection for Extend -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div
                v-for="plan in subscriptionPlans"
                :key="plan.id"
                @click="extendPlan = plan.id"
                class="relative border-2 rounded-xl p-5 cursor-pointer transition-all group"
                :class="extendPlan === plan.id 
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                  : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'"
              >
                <div v-if="extendPlan === plan.id" class="absolute top-3 right-3 text-blue-600">
                  <span class="material-symbols-outlined">check_circle</span>
                </div>
                
                <h4 class="font-bold text-[#0d141b] dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{{ plan.name }}</h4>
                <div class="text-lg font-bold text-blue-600 mb-2">
                  <div v-if="plan.originalPrice && plan.discount" class="flex flex-col">
                    <span class="text-xs font-normal text-slate-400 line-through">{{ formatCurrency(plan.originalPrice) }}</span>
                    <span>
                      {{ formatCurrency(plan.price) }}
                      <span class="text-[10px] font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-1">Hemat {{ plan.discount }}%</span>
                    </span>
                  </div>
                  <template v-else>
                    {{ formatCurrency(plan.price) }}
                  </template>
                  <span class="text-xs text-[#4c739a] font-normal">/bulan</span>
                </div>
                <p class="text-xs text-[#4c739a] line-clamp-2 leading-relaxed">{{ plan.description }}</p>
              </div>
            </div>

            <!-- Duration Selection for Extend -->
            <div class="mb-6">
              <label class="block text-sm font-bold text-[#0d141b] dark:text-white mb-3">Pilih Durasi Perpanjangan</label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  v-for="duration in durationOptions"
                  :key="duration.value"
                  @click="extendDuration = duration.value"
                  class="px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all relative overflow-hidden"
                  :class="extendDuration === duration.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                    : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 text-[#4c739a]'"
                >
                  <span class="relative z-10">{{ duration.label }}</span>
                  <div v-if="duration.discount" class="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg z-10">
                    -{{ duration.discount }}%
                  </div>
                </button>
              </div>
            </div>

            <!-- Summary for Extend -->
            <div v-if="extendPlan && extendDuration" class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 mb-6 border border-slate-100 dark:border-slate-700">
              <div class="flex justify-between items-center mb-3 text-sm">
                <span class="text-[#4c739a]">Paket</span>
                <span class="font-bold text-[#0d141b] dark:text-white">{{ getPlanName(extendPlan) }}</span>
              </div>
              <div class="flex justify-between items-center mb-3 text-sm">
                <span class="text-[#4c739a]">Durasi</span>
                <span class="font-bold text-[#0d141b] dark:text-white">{{ extendDuration }} hari</span>
              </div>
              <div v-if="getExtendDiscount() > 0" class="flex justify-between items-center mb-3 text-sm">
                <span class="text-[#4c739a]">Diskon Durasi</span>
                <span class="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">-{{ getExtendDiscount() }}%</span>
              </div>
              <div class="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                <span class="text-base font-bold text-[#0d141b] dark:text-white">Total Pembayaran</span>
                <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(calculateExtendTotal()) }}</span>
              </div>
            </div>

            <button
              v-if="extendPlan && extendDuration"
              @click="handleExtend"
              :disabled="processing"
              class="w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-600/30 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="processing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ processing ? 'Memproses...' : 'Konfirmasi & Bayar Perpanjangan' }}
            </button>
          </div>
          
          <h4 class="text-sm font-bold text-[#4c739a] uppercase tracking-wider mb-4">Upgrade ke Paket Lebih Tinggi</h4>
          
          <!-- Plan Selection for Upgrade -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              v-for="plan in availablePlans"
              :key="plan.id"
              @click="selectedPlan = plan.id"
              class="relative border-2 rounded-xl p-5 cursor-pointer transition-all group"
              :class="selectedPlan === plan.id 
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'"
            >
              <div v-if="selectedPlan === plan.id" class="absolute top-3 right-3 text-blue-600">
                <span class="material-symbols-outlined">check_circle</span>
              </div>
              <h4 class="font-bold text-[#0d141b] dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{{ plan.name }}</h4>
              
              <div class="text-lg font-bold text-blue-600 mb-2">
                <div v-if="plan.originalPrice && plan.discount" class="flex flex-col">
                  <span class="text-xs font-normal text-slate-400 line-through">{{ formatCurrency(plan.originalPrice) }}</span>
                  <span>
                    {{ formatCurrency(plan.price) }}
                    <span class="text-[10px] font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-1">Hemat {{ plan.discount }}%</span>
                  </span>
                </div>
                <template v-else>
                  {{ formatCurrency(plan.price) }}
                </template>
                <span class="text-xs text-[#4c739a] font-normal">/bulan</span>
              </div>
              <p class="text-xs text-[#4c739a] line-clamp-2 leading-relaxed">{{ plan.description }}</p>
            </div>
          </div>

          <!-- Upgrade Type Selection -->
          <div v-if="selectedPlan && selectedPlan !== currentPlan" class="mb-6 animate-fade-in">
            <label class="block text-sm font-bold text-[#0d141b] dark:text-white mb-3">Pilih Metode Upgrade</label>
            <div class="space-y-3">
              <!-- Temporary -->
              <label class="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                :class="upgradeType === 'temporary' 
                  ? 'border-blue-500 bg-blue-50/30' 
                  : 'border-slate-100 dark:border-slate-700'"
              >
                <div class="flex h-5 items-center">
                  <input type="radio" v-model="upgradeType" value="temporary" class="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                </div>
                <div class="ml-3 text-sm flex-1">
                  <span class="font-bold text-[#0d141b] dark:text-white block">1 Bulan (Coba Dulu)</span>
                  <span class="text-[#4c739a] block text-xs mt-1">Upgrade selama 30 hari, lalu kembali ke paket {{ getPlanName(currentPlan) }} otomatis.</span>
                  <span class="font-bold text-blue-600 mt-2 block">Bayar: {{ formatCurrency(calculateUpgradeAmount('temporary')) }}</span>
                </div>
              </label>

              <!-- Until End -->
              <label class="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                :class="upgradeType === 'until_end' 
                  ? 'border-blue-500 bg-blue-50/30' 
                  : 'border-slate-100 dark:border-slate-700'"
              >
                <div class="flex h-5 items-center">
                  <input type="radio" v-model="upgradeType" value="until_end" class="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                </div>
                <div class="ml-3 text-sm flex-1">
                  <span class="font-bold text-[#0d141b] dark:text-white block">Sisa Masa Aktif ({{ subscription?.daysRemaining || 0 }} hari)</span>
                  <span class="text-[#4c739a] block text-xs mt-1">Upgrade permanen sampai masa berlangganan saat ini habis.</span>
                  <span class="font-bold text-blue-600 mt-2 block">Bayar: {{ formatCurrency(calculateUpgradeAmount('until_end')) }}</span>
                </div>
              </label>

              <!-- Custom -->
              <label class="flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
                :class="upgradeType === 'custom' 
                  ? 'border-blue-500 bg-blue-50/30' 
                  : 'border-slate-100 dark:border-slate-700'"
              >
                <div class="flex h-5 items-center">
                  <input type="radio" v-model="upgradeType" value="custom" class="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
                </div>
                <div class="ml-3 text-sm flex-1">
                  <span class="font-bold text-[#0d141b] dark:text-white block mb-2">Durasi Custom (Long Term)</span>
                  
                  <div v-if="upgradeType === 'custom'" class="grid grid-cols-3 gap-2 mb-2 animate-fade-in-down">
                    <button
                      v-for="duration in customDurationOptions"
                      :key="duration.value"
                      @click.stop="selectedCustomDuration = duration.value"
                      type="button"
                      class="px-2 py-2 border rounded-xl text-xs font-medium transition-all"
                      :class="selectedCustomDuration === duration.value
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-slate-200 text-slate-600 hover:border-blue-500'"
                    >
                      {{ duration.label }}
                      <span v-if="duration.discount" class="block text-[9px] mt-0.5" :class="selectedCustomDuration === duration.value ? 'text-white/80' : 'text-green-600'">-{{ duration.discount }}%</span>
                    </button>
                  </div>
                    <button
                      v-if="upgradeType === 'custom' && selectedCustomDuration" 
                      class="font-bold text-blue-600 mt-2"
                    >
                      Bayar: {{ formatCurrency(calculateUpgradeAmount('custom')) }}
                    </button>
                </div>
              </label>
            </div>
          </div>

          <!-- Summary for Upgrade -->
          <div v-if="selectedPlan && selectedPlan !== currentPlan && upgradeType" class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 mb-6 border border-slate-100 dark:border-slate-700 animate-fade-in">
             <div class="flex justify-between items-center mb-3 text-sm">
                <span class="text-[#4c739a]">Upgrade ke</span>
                <span class="font-bold text-[#0d141b] dark:text-white">{{ getPlanName(selectedPlan) }}</span>
              </div>
              <div class="flex justify-between items-center mb-3 text-sm">
                <span class="text-[#4c739a]">Durasi Baru</span>
                <span class="font-bold text-[#0d141b] dark:text-white">{{ getUpgradeDurationLabel() }}</span>
              </div>
              <div v-if="getDiscount() > 0" class="flex justify-between items-center mb-3 text-sm">
                <span class="text-[#4c739a]">Diskon</span>
                <span class="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">-{{ getDiscount() }}%</span>
              </div>
              <div class="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                <span class="text-base font-bold text-[#0d141b] dark:text-white">Total Tagihan</span>
                <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(calculateUpgradeAmount(upgradeType)) }}</span>
              </div>
          </div>

          <!-- Action Button for Upgrade -->
          <button
            v-if="selectedPlan && selectedPlan !== currentPlan && upgradeType && (upgradeType !== 'custom' || selectedCustomDuration)"
            @click="handleUpgrade"
            :disabled="processing"
            class="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             <span v-if="processing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
             {{ processing ? 'Memproses...' : 'Lanjut Pembayaran Upgrade' }}
          </button>
        </div>
      </div>

      <!-- Expired/New Subscription Section -->
      <div v-if="(userRole === 'ADMIN_TENANT' || userRole === 'SUPER_ADMIN') && (subscription?.isExpired || !subscription?.subscription?.endDate)" class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 class="text-lg font-bold text-[#0d141b] dark:text-white">Perpanjang Berlangganan</h3>
          <p class="text-sm text-[#4c739a] mt-1">Layanan Anda saat ini tidak aktif. Pilih paket untuk mengaktifkan kembali.</p>
        </div>
        
        <div class="p-6">
          <!-- Plan Selection -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              v-for="plan in subscriptionPlans"
              :key="plan.id"
              @click="extendPlan = plan.id"
              class="relative border-2 rounded-xl p-5 cursor-pointer transition-all group"
              :class="extendPlan === plan.id 
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
                : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'"
            >
              <div v-if="extendPlan === plan.id" class="absolute top-3 right-3 text-blue-600">
                <span class="material-symbols-outlined">check_circle</span>
              </div>
              <h4 class="font-bold text-[#0d141b] dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{{ plan.name }}</h4>
              <div class="text-lg font-bold text-blue-600 mb-2">
                <div v-if="plan.originalPrice && plan.discount" class="flex flex-col">
                  <span class="text-xs font-normal text-slate-400 line-through">{{ formatCurrency(plan.originalPrice) }}</span>
                  <span>
                    {{ formatCurrency(plan.price) }}
                    <span class="text-[10px] font-normal text-green-600 bg-green-50 px-1.5 py-0.5 rounded ml-1">Hemat {{ plan.discount }}%</span>
                  </span>
                </div>
                <template v-else>
                  {{ formatCurrency(plan.price) }}
                </template>
                <span class="text-xs text-[#4c739a] font-normal">/bulan</span>
              </div>
              <p class="text-xs text-[#4c739a] line-clamp-2 leading-relaxed">{{ plan.description }}</p>
            </div>
          </div>

          <!-- Duration Selection -->
          <div class="mb-6">
            <label class="block text-sm font-bold text-[#0d141b] dark:text-white mb-3">Durasi Berlangganan</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                v-for="duration in durationOptions"
                :key="duration.value"
                @click="extendDuration = duration.value"
                class="px-4 py-3 border-2 rounded-xl text-sm font-medium transition-all relative overflow-hidden"
                :class="extendDuration === duration.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  : 'border-slate-100 dark:border-slate-700 hover:border-slate-300 text-[#4c739a]'"
              >
                <span class="relative z-10">{{ duration.label }}</span>
                <div v-if="duration.discount" class="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg z-10">
                   -{{ duration.discount }}%
                </div>
              </button>
            </div>
          </div>

          <!-- Summary -->
          <div v-if="extendPlan && extendDuration" class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 mb-6 border border-slate-100 dark:border-slate-700">
              <div class="flex justify-between items-center mb-3 text-sm">
                <span class="text-[#4c739a]">Paket</span>
                <span class="font-bold text-[#0d141b] dark:text-white">{{ getPlanName(extendPlan) }}</span>
              </div>
              <div class="flex justify-between items-center mb-3 text-sm">
                <span class="text-[#4c739a]">Durasi</span>
                <span class="font-bold text-[#0d141b] dark:text-white">{{ extendDuration }} hari</span>
              </div>
              <div v-if="getExtendDiscount() > 0" class="flex justify-between items-center mb-3 text-sm">
                <span class="text-[#4c739a]">Diskon Durasi</span>
                <span class="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">-{{ getExtendDiscount() }}%</span>
              </div>
              <div class="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                <span class="text-base font-bold text-[#0d141b] dark:text-white">Total Tagihan</span>
                <span class="text-2xl font-bold text-blue-600">{{ formatCurrency(calculateExtendTotal()) }}</span>
              </div>
          </div>

          <!-- Action Button -->
          <button
            @click="handleExtend"
            :disabled="!extendPlan || !extendDuration || processing"
            class="w-full px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
             <span v-if="processing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
             {{ processing ? 'Memproses...' : 'Lanjut ke Pembayaran' }}
          </button>
        </div>
      </div>

      <!-- Info Banner -->
      <div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex items-start gap-4">
        <div class="bg-blue-100 dark:bg-slate-700 text-blue-600 p-2 rounded-xl flex-shrink-0">
          <span class="material-symbols-outlined">info</span>
        </div>
        <div>
          <h4 class="font-bold text-[#0d141b] dark:text-white text-sm mb-1">Butuh bantuan memilih paket?</h4>
          <p class="text-xs text-[#4c739a] leading-relaxed mb-3">Pelajari lebih lanjut tentang fitur setiap paket dan addon yang tersedia di halaman pricing kami.</p>
          <router-link
            to="/pricing"
            class="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            Buka Halaman Pricing
            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
import api from '../../api';
import { formatDate, formatCurrency, formatRemainingTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelector from '../../components/TenantSelector.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';

const authStore = useAuthStore();
const userRole = computed(() => authStore.user?.role || '');
const { needsTenantSelection } = useTenantCheck();
const { error: showError, warning: showWarning } = useNotification();

const loading = ref(false);
const isReloading = ref(false); // Flag to prevent multiple reloads
const processing = ref(false);
const subscription = ref<any>(null);
const currentTime = ref(new Date());
let countdownInterval: NodeJS.Timeout | null = null;
const selectedPlan = ref<string>('');
const upgradeType = ref<'temporary' | 'until_end' | 'custom' | ''>('');
const selectedCustomDuration = ref<number>(0);
const extendPlan = ref<string>('');
const extendDuration = ref<number>(0);
const showExtendSection = ref(false);

const subscriptionPlans: Array<{
  id: string;
  name: string;
  price: number;
  description: string;
  originalPrice?: number;
  discount?: number;
}> = [
  {
    id: 'BASIC',
    name: 'Warungin Starter',
    price: 149000, // Rp 149.000
    description: '1 Outlet, 3-4 User, Limit produk 30, POS dasar, Laporan dasar, Dashboard real-time, Support email',
  },
  {
    id: 'PRO',
    name: 'Warungin Boost',
    price: 299000, // Rp 299.000
    description: '2 Outlet, 10 User, Limit produk 200, Sistem lengkap, E-menu, Member & diskon, Analitik standar, Support prioritas',
  },
  {
    id: 'ENTERPRISE',
    name: 'Warungin Pro',
    price: 499000, // Rp 499.000
    description: '3 Outlet, 20 User, Produk 1000, Analitik lengkap, Import massal, Auto-backup, Multi-store tools, API dasar',
  },
];

const durationOptions = [
  { label: '1 Bulan', value: 30, discount: 0 },
  { label: '3 Bulan', value: 90, discount: 5 },
  { label: '6 Bulan', value: 180, discount: 10 },
  { label: '1 Tahun', value: 365, discount: 15 },
];

const customDurationOptions = [
  { label: '3 Bulan', value: 90, discount: 5 },
  { label: '6 Bulan', value: 180, discount: 10 },
  { label: '1 Tahun', value: 365, discount: 15 },
];

const currentPlan = computed(() => subscription.value?.plan || 'BASIC');

const availablePlans = computed(() => {
  // Filter out current plan
  if (!Array.isArray(subscriptionPlans)) return [];
  return subscriptionPlans.filter(p => p && p.id !== currentPlan.value);
});

const getPlanName = (planId: string) => {
  if (!Array.isArray(subscriptionPlans)) return planId;
  const plan = subscriptionPlans.find(p => p && p.id === planId);
  return plan?.name || planId;
};

const getDiscount = () => {
  if (upgradeType.value === 'custom' && selectedCustomDuration.value) {
    const duration = customDurationOptions.find(d => d.value === selectedCustomDuration.value);
    return duration?.discount || 0;
  }
  return 0;
};

const getExtendDiscount = () => {
  if (extendDuration.value) {
    const duration = durationOptions.find(d => d.value === extendDuration.value);
    return duration?.discount || 0;
  }
  return 0;
};

const calculateUpgradeAmount = (type: 'temporary' | 'until_end' | 'custom') => {
  if (!selectedPlan.value || selectedPlan.value === currentPlan.value) return 0;
  
  const currentPlanPrice = subscriptionPlans.find(p => p.id === currentPlan.value)?.price || 0;
  const newPlanPrice = subscriptionPlans.find(p => p.id === selectedPlan.value)?.price || 0;
  const priceDifferencePerDay = (newPlanPrice - currentPlanPrice) / 30;
  
  let duration = 0;
  if (type === 'temporary') {
    duration = 30;
  } else if (type === 'until_end') {
    duration = subscription.value?.daysRemaining || 0;
  } else if (type === 'custom') {
    duration = selectedCustomDuration.value || 0;
  }
  
  const baseAmount = priceDifferencePerDay * duration;
  const discount = getDiscount() / 100;
  return Math.max(0, baseAmount * (1 - discount));
};

const calculateExtendTotal = () => {
  if (!extendPlan.value || !extendDuration.value) return 0;
  const plan = subscriptionPlans.find(p => p.id === extendPlan.value);
  if (!plan) return 0;
  
  const baseAmount = (plan.price * extendDuration.value) / 30;
  const discount = getExtendDiscount() / 100;
  return baseAmount * (1 - discount);
};

const getUpgradeDurationLabel = () => {
  if (upgradeType.value === 'temporary') {
    return '1 Bulan';
  } else if (upgradeType.value === 'until_end') {
    return `${subscription.value?.daysRemaining || 0} hari (sampai masa aktif selesai)`;
  } else if (upgradeType.value === 'custom' && selectedCustomDuration.value) {
    const duration = customDurationOptions.find(d => d.value === selectedCustomDuration.value);
    return duration?.label || `${selectedCustomDuration.value} hari`;
  }
  return '';
};

const loadSubscription = async () => {
  if (needsTenantSelection.value) {
    return;
  }
  
  loading.value = true;
  try {
    const response = await api.get('/subscriptions/current');
    subscription.value = response.data;
    
    // IMPORTANT: Use isExpired from backend response directly
    // Don't recalculate isExpired based on subscriptionEnd to avoid flash to expired
    // Backend already calculated isExpired correctly after revert
    if (response.data.isExpired !== undefined) {
      // Use isExpired from backend
      subscription.value.isExpired = response.data.isExpired;
    }
    
    // Set default selected plan to next plan (for upgrade)
    if (subscription.value?.plan) {
      const currentIndex = subscriptionPlans.findIndex(p => p.id === subscription.value.plan);
      if (currentIndex < subscriptionPlans.length - 1) {
        selectedPlan.value = subscriptionPlans[currentIndex + 1].id;
      }
    }
    
    // Start countdown after subscription is loaded
    // Always start countdown if subscription exists and has endDate
    // The countdown will handle expired state internally
    if (subscription.value && subscription.value.subscription?.endDate) {
      // Initialize countdown values from backend response
      if (subscription.value.daysRemaining !== undefined) {
        // Backend already calculated, use those values
        startCountdown();
      } else {
        // Calculate from endDate if backend didn't provide
        const endDate = new Date(subscription.value.subscription.endDate);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        
        if (diffTime > 0) {
          const totalSeconds = Math.floor(diffTime / 1000);
          const totalMinutes = Math.floor(totalSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          const days = Math.floor(totalHours / 24);
          
          subscription.value.daysRemaining = days;
          subscription.value.hoursRemaining = totalHours % 24;
          subscription.value.minutesRemaining = totalMinutes % 60;
          subscription.value.secondsRemaining = totalSeconds % 60;
          // Don't set isExpired here - use from backend
        } else {
          // Only set isExpired if backend didn't provide it
          if (subscription.value.isExpired === undefined) {
            subscription.value.isExpired = true;
          }
          subscription.value.daysRemaining = 0;
          subscription.value.hoursRemaining = 0;
          subscription.value.minutesRemaining = 0;
          subscription.value.secondsRemaining = 0;
        }
        
        startCountdown();
      }
    }
  } catch (error: any) {
    console.error('Error loading subscription:', error);
  } finally {
    loading.value = false;
  }
};

// Countdown real-time
const startCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  countdownInterval = setInterval(() => {
    currentTime.value = new Date();
    
    // Update subscription remaining time if subscription exists
    if (subscription.value && subscription.value.subscription?.endDate) {
      const endDate = new Date(subscription.value.subscription.endDate);
      const diffTime = endDate.getTime() - currentTime.value.getTime();
      
      // Only update if there's still time remaining (diffTime > 0)
      // If diffTime <= 0, mark as expired but don't stop countdown immediately
      // This allows the UI to show "0 hari" or "Kadaluwarsa" properly
      if (diffTime > 0) {
        const totalSeconds = Math.floor(diffTime / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const days = Math.floor(totalHours / 24);
        
        subscription.value.daysRemaining = days;
        subscription.value.hoursRemaining = totalHours % 24;
        subscription.value.minutesRemaining = totalMinutes % 60;
        subscription.value.secondsRemaining = totalSeconds % 60;
        subscription.value.isExpired = false;
      } else {
        // Time has expired
        subscription.value.isExpired = true;
        subscription.value.daysRemaining = 0;
        subscription.value.hoursRemaining = 0;
        subscription.value.minutesRemaining = 0;
        subscription.value.secondsRemaining = 0;
        
        // Stop countdown
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        
        // IMPORTANT: Only auto refresh if current plan is BOOST (PRO/ENTERPRISE) and expired
        // If current plan is BASIC and expired, don't auto refresh (just show expired state)
        // This prevents unnecessary page refresh for BASIC plan
        const currentPlan = subscription.value?.plan || 'BASIC';
        const subscriptionEnd = subscription.value?.subscription?.endDate;
        
        // Only reload if:
        // 1. Current plan is PRO or ENTERPRISE (boost) and expired
        // 2. SubscriptionEnd is not null (might be temporary upgrade that needs revert)
        // 3. Not already reloading
        if ((currentPlan === 'PRO' || currentPlan === 'ENTERPRISE') && subscriptionEnd && !isReloading.value) {
          // Boost plan expired - reload to get reverted BASIC plan with remaining time
          isReloading.value = true;
          loadSubscription().finally(() => {
            isReloading.value = false;
          });
        } else if (currentPlan === 'BASIC' || !subscriptionEnd) {
          // BASIC plan expired or subscriptionEnd is null - don't reload to prevent page refresh
          // Just stop countdown and show expired state
        }
      }
    }
  }, 1000); // Update every second
};

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

const handleUpgrade = async () => {
  if (needsTenantSelection.value || !selectedPlan.value || !upgradeType.value) {
    return;
  }
  
  if (upgradeType.value === 'custom' && !selectedCustomDuration.value) {
    await showWarning('Pilih durasi custom terlebih dahulu');
    return;
  }
  
  processing.value = true;
  try {
    // Calculate upgrade amount
    const amount = calculateUpgradeAmount(upgradeType.value);
    
    // Create itemId with upgrade info
    // Format: upgrade-{newPlan}-{upgradeType}-{customDuration?}
    const itemId = `upgrade-${selectedPlan.value}-${upgradeType.value}${upgradeType.value === 'custom' ? `-${selectedCustomDuration.value}` : ''}`;
    const plan = subscriptionPlans.find(p => p.id === selectedPlan.value);
    
    const response = await api.post('/payment/addon', {
      itemName: `Upgrade ke ${plan?.name} - ${getUpgradeDurationLabel()}`,
      amount: amount,
      itemId: itemId,
      itemType: 'subscription',
    });

    if (response.data.success && response.data.paymentUrl) {
      window.location.href = response.data.paymentUrl;
    } else {
      await showError(response.data.message || 'Gagal membuat pembayaran');
    }
  } catch (error: any) {
    console.error('Error creating payment:', error);
    await showError(error.response?.data?.message || 'Gagal membuat pembayaran');
  } finally {
    processing.value = false;
  }
};

const handleExtend = async () => {
  if (needsTenantSelection.value || !extendPlan.value || !extendDuration.value) {
    return;
  }
  
  processing.value = true;
  try {
    const plan = subscriptionPlans.find(p => p.id === extendPlan.value);
    if (!plan) {
      await showError('Paket tidak ditemukan');
      return;
    }

    const total = calculateExtendTotal();
    const itemId = `${extendPlan.value}-${extendDuration.value}`;

    const response = await api.post('/payment/addon', {
      itemName: `${plan.name} - ${extendDuration.value} hari`,
      amount: total,
      itemId: itemId,
      itemType: 'subscription',
    });

    if (response.data.success && response.data.paymentUrl) {
      window.location.href = response.data.paymentUrl;
    } else {
      await showError(response.data.message || 'Gagal membuat pembayaran');
    }
  } catch (error: any) {
    console.error('Error creating payment:', error);
    await showError(error.response?.data?.message || 'Gagal membuat pembayaran');
  } finally {
    processing.value = false;
  }
};

const handleTenantChange = (tenantId: string | null) => {
  if (tenantId && !needsTenantSelection.value) {
    loadSubscription();
  }
};

watch(() => authStore.currentTenantId, (newTenantId, oldTenantId) => {
  if (newTenantId && newTenantId !== oldTenantId && !needsTenantSelection.value) {
    loadSubscription();
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
    loadSubscription();
  }
});

onUnmounted(() => {
  stopCountdown();
});
</script>
