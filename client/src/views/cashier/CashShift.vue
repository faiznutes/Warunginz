<template>
  <div class="flex flex-col h-full gap-6 p-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Cash & Physical Recap</h1>
      <p class="text-[#4c739a] dark:text-slate-400">Manage cashier shifts and physical cash recap</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="requiresRecoveryClose" class="max-w-2xl mx-auto w-full animate-fade-in-up">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-amber-200 dark:border-amber-800 p-8 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-500 to-red-500"></div>
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span class="material-symbols-outlined text-[40px] text-amber-600 dark:text-amber-400">warning</span>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Shift Kasir Perlu Dipulihkan</h2>
          <p class="text-slate-500 dark:text-slate-400">
            Shift kasir masih aktif, tetapi shift toko sudah tidak valid. Tutup shift kasir ini terlebih dahulu sebelum membuka shift baru.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Modal Awal</p>
            <p class="text-lg font-bold text-slate-900 dark:text-white">{{ formatCurrency(currentShift?.modalAwal || 0) }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Penjualan</p>
            <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(currentShift?.totalPenjualan || 0) }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Dibuka</p>
            <p class="text-sm font-bold text-slate-900 dark:text-white">{{ formatDateTime(currentShift?.shiftStart) }}</p>
          </div>
        </div>

        <button
          @click="showCloseModal = true"
          class="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/30 transition-all font-bold flex items-center justify-center gap-2"
        >
          <span class="material-symbols-outlined">lock</span>
          Tutup Shift Kasir
        </button>
      </div>
    </div>

    <!-- No Active Store Shift - Show Open Store Shift Form -->
    <div v-else-if="!currentStoreShift" class="max-w-2xl mx-auto w-full animate-fade-in-up">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 p-8 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <span class="material-symbols-outlined text-[40px] text-blue-600 dark:text-blue-400">storefront</span>
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Buka Shift Toko</h2>
          <p class="text-slate-500 dark:text-slate-400">Mulai operasional toko dengan membuka shift baru</p>
        </div>

        <form @submit.prevent="handleOpenStoreShift" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-[#0d141b] dark:text-white">
              Shift Type <span class="text-red-500">*</span>
            </label>
            <select
              v-model="openStoreShiftForm.shiftType"
              required
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-white font-medium transition-all appearance-none"
            >
              <option value="" disabled>Pilih Shift</option>
              <option value="pagi">Pagi (06:00 - 12:00)</option>
              <option value="siang">Siang (12:00 - 18:00)</option>
              <option value="sore">Sore (18:00 - 24:00)</option>
              <option value="malam">Malam (00:00 - 06:00)</option>
            </select>
            <p class="text-xs text-[#4c739a]">Select the shift to open for this store</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-bold text-[#0d141b] dark:text-white">
              Initial Cash (Optional)
            </label>
            <div class="relative group">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-600 transition-colors">Rp</span>
              <input
                v-model.number="openStoreShiftForm.modalAwal"
                type="number"
                step="0.01"
                min="0"
                class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-white font-bold transition-all placeholder:font-normal"
                placeholder="0"
              />
            </div>
            <p class="text-xs text-[#4c739a] mt-1">Initial cash for the shift (optional, can be filled when opening cashier cash shift)</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#0d141b] mb-2">
              Notes (Optional)
            </label>
            <textarea
              v-model="openStoreShiftForm.catatan"
              rows="3"
              class="w-full px-4 py-2 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="openingStoreShift || !openStoreShiftForm.shiftType"
            class="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            <svg v-if="openingStoreShift" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ openingStoreShift ? 'Membuka Shift...' : 'Buka Shift Toko' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Active Store Shift - Show Store Shift Info and Cash Shift Form -->
    <div v-else-if="currentStoreShift && !currentShift" class="space-y-6 max-w-2xl mx-auto w-full">
      <!-- Store Shift Info Card -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl p-6 border border-blue-100 dark:border-blue-800 shadow-sm relative overflow-hidden">
        <div class="absolute right-0 top-0 p-4 opacity-10">
            <span class="material-symbols-outlined text-[100px] text-blue-600">store</span>
        </div>
        <div class="flex items-center justify-between relative z-10">
          <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Shift Toko Aktif</h2>
            <div class="space-y-1">
              <p class="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-blue-500">schedule</span>
                Shift: <span class="font-bold capitalize text-slate-900 dark:text-white bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">{{ currentStoreShift.shiftType }}</span>
              </p>
              <p class="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px] text-blue-500">access_time</span>
                Dibuka: <span class="font-medium">{{ formatDateTime(currentStoreShift.openedAt) }}</span>
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2" v-if="currentStoreShift.opener">
                <span class="material-symbols-outlined text-[16px]">person</span>
                Dibuka oleh: <span class="font-medium">{{ currentStoreShift.opener.name }}</span>
              </p>
            </div>
          </div>
          <div class="hidden sm:block px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur text-blue-700 dark:text-blue-300 rounded-xl text-sm font-bold capitalize shadow-sm border border-blue-100 dark:border-blue-700">
            {{ currentStoreShift.shiftType }}
          </div>
        </div>
      </div>

      <!-- Cash Shift Form -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-dashed border-slate-300 dark:border-slate-700 p-8 relative overflow-hidden">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-800/50 shadow-inner">
            <span class="material-symbols-outlined text-[32px] text-blue-600 dark:text-blue-500">payments</span>
          </div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Buka Shift Kasir</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm">Silakan buka shift kasir untuk memulai transaksi penjualan</p>
        </div>

        <form @submit.prevent="handleOpenShift" class="space-y-6">
          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-900 dark:text-white ml-1">
              Modal Awal <span class="text-red-500">*</span>
            </label>
            <div class="relative group">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-600 transition-colors">Rp</span>
              <input
                v-model.number="openShiftForm.modalAwal"
                type="number"
                step="0.01"
                min="0.01"
                required
                class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white font-bold transition-all text-lg"
                placeholder="0"
              />
            </div>
            <p class="text-xs text-slate-500 ml-1">Masukkan jumlah uang tunai yang tersedia di kasir</p>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-bold text-slate-900 dark:text-white ml-1">
              Catatan (Opsional)
            </label>
            <textarea
              v-model="openShiftForm.catatan"
              rows="3"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white text-sm transition-all resize-none"
              placeholder="Tambahkan catatan jika perlu..."
            ></textarea>
          </div>

          <button
            type="submit"
            :disabled="openingShift || !openShiftForm.modalAwal || openShiftForm.modalAwal <= 0"
            class="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            <div v-if="openingShift" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>{{ openingShift ? 'Membuka Shift...' : 'Buka Shift Kasir' }}</span>
          </button>
        </form>
      </div>
    </div>

    <!-- Active Shift - Show Current Shift Info with Tabs -->
    <div v-else class="space-y-6">
      <!-- Tabs Navigation -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="border-b border-slate-100 dark:border-slate-700/50">
          <nav class="flex">
            <button
              @click="activeTab = 'today'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-bold border-b-2 transition-all relative overflow-hidden',
                activeTab === 'today'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              Shift Hari Ini
            </button>
            <button
              @click="activeTab = 'history'"
              :class="[
                'flex-1 px-6 py-4 text-sm font-bold border-b-2 transition-all',
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              ]"
            >
              Riwayat Shift
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab Content: Shift Hari Ini -->
      <div v-if="activeTab === 'today'" class="space-y-6">
        <!-- Store Shift Info Card -->
        <div v-if="currentStoreShift" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 sm:p-8 border-2 border-blue-200">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-[#0d141b] mb-1">Active Store Shift</h3>
              <p class="text-sm text-[#4c739a]">
                Shift: <span class="font-semibold capitalize">{{ currentStoreShift.shiftType }}</span> | 
                Opened: {{ formatDateTime(currentStoreShift.openedAt) }}
              </p>
              <p class="text-xs text-[#4c739a] mt-1" v-if="currentStoreShift.opener">
                Opened by: {{ currentStoreShift.opener.name }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="viewShiftDetails(currentStoreShift.id)"
                class="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-semibold"
              >
                View Details
              </button>
              <span class="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold capitalize">
                {{ currentStoreShift.shiftType }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="currentShift" class="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-2xl shadow-sm p-6 sm:p-8 border border-blue-100 dark:border-blue-800 relative overflow-hidden group">
          <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span class="material-symbols-outlined text-[120px] text-blue-600">point_of_sale</span>
          </div>

          <div class="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Shift Kasir Aktif</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">history</span>
                Dibuka: {{ formatDateTime(currentShift.shiftStart) }}
              </p>
            </div>
            <span class="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 uppercase tracking-widest">
              OPEN
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
            <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-5 border border-blue-100 dark:border-blue-800 shadow-sm">
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Modal Awal</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ formatCurrency(currentShift.modalAwal) }}</p>
            </div>
            <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-5 border border-blue-100 dark:border-blue-800 shadow-sm">
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Total Penjualan</p>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(currentShift.totalPenjualan || 0) }}</p>
            </div>
            <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-5 border border-blue-100 dark:border-blue-800 shadow-sm">
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Total Cash (System)</p>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ formatCurrency((currentShift.modalAwal || 0) + (currentShift.totalPenjualan || 0)) }}
              </p>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 relative z-10">
            <button
              @click="goToPOS"
              class="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              <span class="material-symbols-outlined">point_of_sale</span>
              Masuk ke POS
            </button>
            <button
              @click="showCloseModal = true"
              class="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.98]"
            >
              <span class="material-symbols-outlined">lock</span>
              Tutup Shift
            </button>
            <button
              @click="activeTab = 'history'"
              class="px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all font-semibold shadow-sm flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined">history</span>
              Riwayat Shift
            </button>
          </div>
        </div>

        <!-- Today's Shifts List -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">today</span>
            Shift Hari Ini
          </h3>
          <div v-if="todayShiftsLoading" class="text-center py-12">
            <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <div v-else-if="todayShifts.length === 0" class="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p>Belum ada shift hari ini</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="shift in todayShifts"
              :key="shift.id"
              class="group border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer relative overflow-hidden"
              @click="viewShiftDetails(shift.id)"
            >
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div class="flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <span class="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                      {{ shift.shiftType }}
                    </span>
                    <span
                      :class="[
                        'px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border',
                        shift.status === 'open' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-emerald-300 border-emerald-200 dark:border-blue-800' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      ]"
                    >
                      {{ shift.status === 'open' ? 'Open' : 'Closed' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px]">login</span>
                      {{ formatDateTime(shift.openedAt) }}
                    </span>
                    <span v-if="shift.closedAt" class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px]">logout</span>
                      {{ formatDateTime(shift.closedAt) }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-1.5 flex items-center gap-1" v-if="shift.opener">
                    <span class="material-symbols-outlined text-[14px]">person</span>
                    {{ shift.opener.name }}
                  </p>
                </div>
                <button
                  @click.stop="viewShiftDetails(shift.id)"
                  class="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all text-sm font-semibold shadow-sm"
                >
                  Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Riwayat Shift -->
      <div v-if="activeTab === 'history'" class="space-y-6">
        <!-- Current Cash Shift Card (if active) -->
        <div v-if="currentShift" class="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30 rounded-2xl shadow-sm p-6 sm:p-8 border border-blue-100 dark:border-blue-800 relative overflow-hidden group">
          <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <span class="material-symbols-outlined text-[120px] text-blue-600">point_of_sale</span>
          </div>
          
          <div class="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Shift Kasir Aktif</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">history</span>
                Dibuka: {{ formatDateTime(currentShift.shiftStart) }}
              </p>
            </div>
            <span class="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 uppercase tracking-widest">
              OPEN
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
            <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-5 border border-blue-100 dark:border-blue-800 shadow-sm">
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Modal Awal</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ formatCurrency(currentShift.modalAwal) }}</p>
            </div>
            <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-5 border border-blue-100 dark:border-blue-800 shadow-sm">
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Total Penjualan</p>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ formatCurrency(currentShift.totalPenjualan || 0) }}</p>
            </div>
            <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-5 border border-blue-100 dark:border-blue-800 shadow-sm">
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-semibold">Total Cash (System)</p>
              <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ formatCurrency((currentShift.modalAwal || 0) + (currentShift.totalPenjualan || 0)) }}
              </p>
            </div>
          </div>

          <div class="flex gap-3 relative z-10">
            <button
              @click="showCloseModal = true"
              class="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.98]"
            >
              <span class="material-symbols-outlined">lock</span>
              Tutup Shift
            </button>
            <button
              @click="loadCurrentShift"
              class="px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all font-semibold shadow-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        <!-- Store Shift History -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-slate-500">history</span>
            Riwayat Shift Toko
          </h3>
          <div v-if="storeShiftHistoryLoading" class="text-center py-12">
            <div class="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
          <div v-else-if="storeShiftHistory.length === 0" class="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <p>Belum ada riwayat shift</p>
          </div>
          <div v-else class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead class="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Shift</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dibuka</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ditutup</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Oleh</th>
                  <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                <tr
                  v-for="shift in storeShiftHistory"
                  :key="shift.id"
                  class="hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-bold capitalize">
                      {{ shift.shiftType }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {{ formatDateTime(shift.openedAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {{ shift.closedAt ? formatDateTime(shift.closedAt) : '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    <div class="flex items-center gap-2">
                       <span class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                         {{ shift.opener?.name?.charAt(0) || '?' }}
                       </span>
                       {{ shift.opener?.name || '-' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      :class="[
                        'px-2.5 py-0.5 text-xs font-bold rounded-full border',
                        shift.status === 'open' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-emerald-300 border-emerald-200 dark:border-blue-800' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      ]"
                    >
                      {{ shift.status === 'open' ? 'Open' : 'Closed' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      @click="viewShiftDetails(shift.id)"
                      class="text-blue-600 hover:text-blue-700 font-semibold text-sm hover:underline"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="storeShiftHistoryPagination.totalPages > 1" class="mt-4 flex items-center justify-between">
            <div class="text-sm text-[#0d141b]">
              Page {{ storeShiftHistoryPagination.page }} of {{ storeShiftHistoryPagination.totalPages }}
            </div>
            <div class="flex gap-2">
              <button
                @click="changeStoreShiftHistoryPage(storeShiftHistoryPagination.page - 1)"
                :disabled="storeShiftHistoryPagination.page === 1"
                class="px-4 py-2 border border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                @click="changeStoreShiftHistoryPage(storeShiftHistoryPagination.page + 1)"
                :disabled="storeShiftHistoryPagination.page === storeShiftHistoryPagination.totalPages"
                class="px-4 py-2 border border-slate-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <!-- Cash Shift History -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-green-600">payments</span>
              Riwayat Shift Kasir
            </h3>

            <!-- Period Filter Buttons -->
            <div class="flex flex-wrap gap-2">
              <button
                v-for="p in [{ key: 'today', label: 'Hari Ini' }, { key: 'week', label: 'Minggu Ini' }, { key: 'month', label: 'Bulan Ini' }, { key: 'custom', label: 'Custom' }]"
                :key="p.key"
                @click="changeCashShiftPeriod(p.key as any)"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                  cashShiftPeriod === p.key
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600'
                ]"
              >
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Custom Date Range -->
          <div v-if="cashShiftPeriod === 'custom'" class="flex flex-wrap items-end gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div class="flex-1 min-w-[140px]">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Dari Tanggal</label>
              <input
                v-model="cashShiftCustomStart"
                type="date"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div class="flex-1 min-w-[140px]">
              <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Sampai Tanggal</label>
              <input
                v-model="cashShiftCustomEnd"
                type="date"
                class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <button
              @click="loadCashShiftHistory()"
              :disabled="!cashShiftCustomStart && !cashShiftCustomEnd"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              <span class="material-symbols-outlined text-[16px]">search</span>
              Cari
            </button>
          </div>

          <!-- Loading -->
          <div v-if="cashShiftHistoryLoading" class="text-center py-12">
            <div class="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>

          <!-- Empty -->
          <div v-else-if="cashShiftHistory.length === 0" class="text-center py-12 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <span class="material-symbols-outlined text-[40px] text-slate-300 dark:text-slate-600 mb-2">payments</span>
            <p>Belum ada riwayat shift kasir untuk periode ini</p>
          </div>

          <!-- Table -->
          <div v-else class="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead class="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kasir</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dibuka</th>
                  <th class="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ditutup</th>
                  <th class="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Modal Awal</th>
                  <th class="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Penjualan</th>
                  <th class="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Selisih</th>
                  <th class="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                <tr
                  v-for="cs in cashShiftHistory"
                  :key="cs.id"
                  class="hover:bg-green-50/50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <div class="flex items-center gap-2">
                      <span class="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-300">
                        {{ cs.kasir?.name?.charAt(0) || '?' }}
                      </span>
                      <span class="font-medium text-slate-900 dark:text-white">{{ cs.kasir?.name || '-' }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                    {{ formatDateTime(cs.shiftStart) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {{ cs.shiftEnd ? formatDateTime(cs.shiftEnd) : '-' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-slate-900 dark:text-white">
                    {{ formatCurrency(cs.modalAwal || 0) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-bold text-green-600 dark:text-green-400">
                    {{ formatCurrency(cs.totalPenjualan || 0) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-right font-bold"
                    :class="[
                      (cs.selisih || 0) > 0 ? 'text-green-600' : (cs.selisih || 0) < 0 ? 'text-red-600' : 'text-slate-500'
                    ]">
                    {{ cs.selisih != null ? formatCurrency(cs.selisih) : '-' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-center">
                    <span
                      :class="[
                        'px-2.5 py-0.5 text-xs font-bold rounded-full border',
                        cs.status === 'open'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      ]"
                    >
                      {{ cs.status === 'open' ? 'Open' : 'Closed' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cash Shift Pagination -->
          <div v-if="cashShiftHistoryPagination.totalPages > 1" class="mt-4 flex items-center justify-between">
            <div class="text-sm text-slate-600 dark:text-slate-400">
              Hal {{ cashShiftHistoryPagination.page }} dari {{ cashShiftHistoryPagination.totalPages }}
              <span class="text-slate-400">({{ cashShiftHistoryPagination.total }} total)</span>
            </div>
            <div class="flex gap-2">
              <button
                @click="changeCashShiftHistoryPage(cashShiftHistoryPagination.page - 1)"
                :disabled="cashShiftHistoryPagination.page === 1"
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
              >
                Sebelumnya
              </button>
              <button
                @click="changeCashShiftHistoryPage(cashShiftHistoryPagination.page + 1)"
                :disabled="cashShiftHistoryPagination.page === cashShiftHistoryPagination.totalPages"
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Shift Detail Modal -->
    <div
      v-if="showShiftDetailModal"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto transition-all duration-300"
      @click.self="showShiftDetailModal = false"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-6xl w-full p-6 sm:p-8 my-8 animate-scale-in border border-slate-200 dark:border-slate-700 relative">
        <button
          @click="showShiftDetailModal = false"
          class="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <span class="material-symbols-outlined">close</span>
        </button>

        <div class="mb-8">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <span class="material-symbols-outlined text-blue-600">assignment</span>
            Detail Shift
          </h3>
          <p class="text-slate-500 dark:text-slate-400 mt-1">Informasi lengkap transaksi dan pergerakan stok selama shift.</p>
        </div>

        <!-- Shift Info -->
        <div v-if="shiftDetail" class="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50 shadow-sm">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p class="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1.5">Tipe Shift</p>
              <p class="text-base font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                <span class="material-symbols-outlined text-[18px]">schedule</span>
                {{ shiftDetail.shift.shiftType }}
              </p>
            </div>
            <div>
              <p class="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1.5">Dibuka</p>
              <p class="text-base font-bold text-slate-900 dark:text-white">{{ formatDateTime(shiftDetail.shift.openedAt) }}</p>
            </div>
            <div>
              <p class="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1.5">Ditutup</p>
              <p class="text-base font-bold text-slate-900 dark:text-white">{{ shiftDetail.shift.closedAt ? formatDateTime(shiftDetail.shift.closedAt) : 'Masih Berjalan' }}</p>
            </div>
            <div>
              <p class="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1.5">Oleh</p>
              <p class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center text-[10px] text-blue-800 dark:text-blue-100">
                    {{ shiftDetail.shift.opener?.name?.charAt(0) || '?' }}
                </span>
                {{ shiftDetail.shift.opener?.name || '-' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="mb-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-4">
          <p class="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">filter_list</span>
            Tampilkan Data:
          </p>
          <div class="flex flex-wrap gap-3">
            <label class="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors select-none">
              <input
                type="checkbox"
                v-model="shiftDetailFilters.includeOrders"
                @change="loadShiftDetails(selectedShiftId)"
                class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Penjualan</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors select-none">
              <input
                type="checkbox"
                v-model="shiftDetailFilters.includeStockTransfers"
                @change="loadShiftDetails(selectedShiftId)"
                class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Transfer Stok</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors select-none">
              <input
                type="checkbox"
                v-model="shiftDetailFilters.includeProductAdjustments"
                @change="loadShiftDetails(selectedShiftId)"
                class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Penyesuaian Stok</span>
            </label>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="shiftDetail" class="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">Total Pendapatan</p>
            <p class="text-xl font-bold text-green-600 dark:text-green-400">{{ formatCurrency(shiftDetail.summary.totalRevenue) }}</p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">Total Transaksi</p>
            <p class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ shiftDetail.summary.totalOrders }}</p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">Item Transfer</p>
            <p class="text-xl font-bold text-purple-600 dark:text-purple-400">{{ shiftDetail.summary.totalStockTransfers }}</p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700/50">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">Item Penyesuaian</p>
            <p class="text-xl font-bold text-orange-600 dark:text-orange-400">{{ shiftDetail.summary.totalProductAdjustments }}</p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="shiftDetailLoading" class="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-500 font-medium">Memuat detail shift...</p>
        </div>

        <!-- Orders -->
        <div v-else-if="shiftDetail && shiftDetailFilters.includeOrders && shiftDetail.orders.length > 0" class="mb-8 animate-fade-in-up">
          <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-green-600">receipt_long</span>
            Penjualan ({{ shiftDetail.orders.length }})
          </h4>
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead class="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pelanggan</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kasir</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waktu</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                <tr v-for="order in shiftDetail.orders" :key="order.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td class="px-6 py-3 text-sm text-slate-900 dark:text-white font-mono">{{ order.orderNumber }}</td>
                  <td class="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{{ order.customer?.name || 'Walk-in Customer' }}</td>
                  <td class="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{{ order.user?.name || '-' }}</td>
                  <td class="px-6 py-3 text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(order.total) }}</td>
                  <td class="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">{{ formatDateTime(order.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Stock Transfers -->
        <div v-if="shiftDetail && shiftDetailFilters.includeStockTransfers && shiftDetail.stockTransfers.length > 0" class="mb-8 animate-fade-in-up">
          <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-purple-600">move_up</span>
            Transfer Stok ({{ shiftDetail.stockTransfers.length }})
          </h4>
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead class="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">No. Transfer</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dari</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ke</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waktu</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                <tr v-for="transfer in shiftDetail.stockTransfers" :key="transfer.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td class="px-6 py-3 text-sm text-slate-900 dark:text-white font-mono">{{ transfer.transferNumber }}</td>
                  <td class="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{{ transfer.fromOutletId }}</td>
                  <td class="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{{ transfer.toOutletId }}</td>
                  <td class="px-6 py-3 text-sm">
                    <span :class="[
                      'px-2.5 py-0.5 text-xs font-bold rounded-full border',
                      transfer.status === 'COMPLETED' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
                    ]">
                      {{ transfer.status }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">{{ formatDateTime(transfer.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Product Adjustments -->
        <div v-if="shiftDetail && shiftDetailFilters.includeProductAdjustments && shiftDetail.productAdjustments.length > 0" class="mb-8 animate-fade-in-up">
          <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-orange-600">inventory_2</span>
            Penyesuaian Stok ({{ shiftDetail.productAdjustments.length }})
          </h4>
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead class="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Produk</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipe</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jml</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sebelum</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sesudah</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Oleh</th>
                  <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waktu</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                <tr v-for="adjustment in shiftDetail.productAdjustments" :key="adjustment.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td class="px-6 py-3 text-sm text-slate-900 dark:text-white font-medium">{{ adjustment.product?.name || '-' }}</td>
                  <td class="px-6 py-3 text-sm">
                    <span :class="[
                      'px-2.5 py-0.5 text-xs font-bold rounded-full border',
                      adjustment.type === 'INCREASE' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                    ]">
                      {{ adjustment.type === 'INCREASE' ? 'Tambah' : 'Kurang' }}
                    </span>
                  </td>
                  <td class="px-6 py-3 text-sm text-slate-900 dark:text-white font-bold">{{ adjustment.quantity }}</td>
                  <td class="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">{{ adjustment.stockBefore }}</td>
                  <td class="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">{{ adjustment.stockAfter }}</td>
                  <td class="px-6 py-3 text-sm text-slate-700 dark:text-slate-300">{{ adjustment.user?.name || '-' }}</td>
                  <td class="px-6 py-3 text-sm text-slate-500 dark:text-slate-400">{{ formatDateTime(adjustment.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="shiftDetail && !shiftDetailLoading && 
          (!shiftDetailFilters.includeOrders || shiftDetail.orders.length === 0) &&
          (!shiftDetailFilters.includeStockTransfers || shiftDetail.stockTransfers.length === 0) &&
          (!shiftDetailFilters.includeProductAdjustments || shiftDetail.productAdjustments.length === 0)"
          class="text-center py-20 text-slate-400 dark:text-slate-500"
        >
          <span class="material-symbols-outlined text-[48px] mb-4 text-slate-300">inbox</span>
          <p>Tidak ada data untuk filter yang dipilih</p>
        </div>
      </div>
    </div>

    <!-- Close Shift Modal -->
    <div
      v-if="showCloseModal"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300"
      @click.self="showCloseModal = false"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up border border-slate-200 dark:border-slate-700">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Tutup Shift Kasir</h3>
        
        <div class="mb-4 space-y-2">
          <div class="bg-blue-50 rounded-xl p-3">
            <p class="text-sm text-[#4c739a]">Initial Cash</p>
            <p class="text-lg font-bold text-[#0d141b]">{{ formatCurrency(currentShift?.modalAwal || 0) }}</p>
          </div>
          <div class="bg-green-50 rounded-xl p-3">
            <p class="text-sm text-[#4c739a]">Total Sales</p>
            <p class="text-lg font-bold text-green-600">{{ formatCurrency(currentShift?.totalPenjualan || 0) }}</p>
          </div>
          <div class="bg-purple-50 rounded-xl p-3">
            <p class="text-sm text-[#4c739a]">Expected Balance</p>
            <p class="text-lg font-bold text-purple-600">
              {{ formatCurrency((currentShift?.modalAwal || 0) + (currentShift?.totalPenjualan || 0)) }}
            </p>
          </div>
        </div>

        <form @submit.prevent="handleCloseShift" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#0d141b] mb-2">
              Physical Cash at Register <span class="text-red-500">*</span>
            </label>
            <div class="relative group">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-600 transition-colors">Rp</span>
              <input
                v-model.number="closeShiftForm.uangFisikTutup"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white font-bold transition-all text-lg"
                placeholder="0"
              />
            </div>
            <p class="text-xs text-[#4c739a] mt-1">Enter the physical cash amount currently in the register</p>
          </div>

          <div v-if="closeShiftForm.uangFisikTutup && currentShift">
            <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <p class="text-sm text-[#4c739a] mb-1">Difference</p>
              <p
                class="text-lg font-bold"
                :class="getSelisihClass(calculateSelisih())"
              >
                {{ formatCurrency(calculateSelisih()) }}
              </p>
              <p class="text-xs text-[#4c739a] mt-1">
                {{ calculateSelisih() > 0 ? 'Over' : calculateSelisih() < 0 ? 'Short' : 'Exact' }}
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-[#0d141b] mb-2">
              Notes (Optional)
            </label>
            <textarea
              v-model="closeShiftForm.catatan"
              rows="3"
              class="w-full px-4 py-2 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="showCloseModal = false"
              class="flex-1 px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="closingShift || !closeShiftForm.uangFisikTutup"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ closingShift ? 'Closing...' : 'Close Shift' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Shift Closed Success Modal -->
    <div v-if="showShiftClosedModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-bounce-in flex flex-col relative">
             <div class="p-8 flex flex-col items-center justify-center text-center">
                <div class="size-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 shadow-inner ring-8 ring-red-50 dark:ring-red-900/10">
                    <span class="material-symbols-outlined text-6xl text-red-500 animate-pulse">lock</span>
                </div>
                <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Shift Ditutup</h3>
                <p class="text-slate-500 mb-8">Shift kasir telah berhasil ditutup.</p>

                <!-- Summary Info -->
                <div class="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 mb-8 space-y-2">
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-500">Saldo Akhir</span>
                        <span class="font-bold text-slate-900 dark:text-white">{{ formatCurrency(lastClosedShiftData?.physicalCash) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-slate-500">Selisih</span>
                         <span :class="getSelisihClass(lastClosedShiftData?.selisih)" class="font-bold">
                            {{ formatCurrency(lastClosedShiftData?.selisih) }}
                         </span>
                    </div>
                </div>
                
                <div class="flex flex-col gap-3 w-full">
                    <button @click="generateShiftReport(lastClosedShiftData)" class="w-full py-3.5 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">print</span>
                        Lihat Laporan
                    </button>
                    <button @click="finishCloseShift" class="w-full py-3.5 bg-red-50 text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-100 transition-all">
                        Kembali ke Dashboard
                    </button>
                </div>
             </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import {
  buildShiftContext,
  getAssignedStoreIdFromUser,
  normalizeOpenCashShift,
  normalizeOpenStoreShift,
  unwrapApiPayload,
} from '../../utils/shift-state';

const { success: showSuccess, error: showError } = useNotification();
const authStore = useAuthStore();
const router = useRouter();

const loading = ref(true);
const currentShift = ref<any>(null);
const currentStoreShift = ref<any>(null);
const openingShift = ref(false);
const openingStoreShift = ref(false);
const closingShift = ref(false);
const showCloseModal = ref(false);
const showShiftClosedModal = ref(false);
const lastClosedShiftData = ref<any>(null);
const activeTab = ref<'today' | 'history'>('today');
const todayShifts = ref<any[]>([]);
const todayShiftsLoading = ref(false);
const storeShiftHistory = ref<any[]>([]);
const storeShiftHistoryLoading = ref(false);
const storeShiftHistoryPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});
const showShiftDetailModal = ref(false);
const shiftDetail = ref<any>(null);
const shiftDetailLoading = ref(false);
const selectedShiftId = ref<string>('');
const shiftDetailFilters = ref({
  includeOrders: true,
  includeStockTransfers: true,
  includeProductAdjustments: true,
});

// Cash Shift History
const cashShiftHistory = ref<any[]>([]);
const cashShiftHistoryLoading = ref(false);
const cashShiftHistoryPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});
const cashShiftPeriod = ref<'today' | 'week' | 'month' | 'custom'>('today');
const cashShiftCustomStart = ref('');
const cashShiftCustomEnd = ref('');

const pollingInterval = ref<any>(null);

const openShiftForm = ref({
  modalAwal: 0,
  catatan: '',
});

const openStoreShiftForm = ref({
  shiftType: '',
  modalAwal: 0,
  catatan: '',
});

const closeShiftForm = ref({
  uangFisikTutup: 0,
  catatan: '',
});

const shiftHistory = ref<any[]>([]);
const historyLoading = ref(false);
const historyPagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const resolvedStoreId = computed(() => {
  return (
    authStore.selectedStoreId ||
    localStorage.getItem('selectedStoreId') ||
    getAssignedStoreIdFromUser(authStore.user) ||
    null
  );
});

const shiftContext = computed(() =>
  buildShiftContext({
    storeId: resolvedStoreId.value,
    cashShift: currentShift.value,
    storeShift: currentStoreShift.value,
  }),
);

const requiresRecoveryClose = computed(() => shiftContext.value.requiresRecoveryClose);

const extractCollectionResponse = <T>(
  payload: unknown,
  fallback: { page: number; limit: number; total: number; totalPages: number },
): { items: T[]; pagination: typeof fallback } => {
  const normalizedPayload = unwrapApiPayload<any>(payload) ?? payload;

  if (Array.isArray(normalizedPayload)) {
    return {
      items: normalizedPayload as T[],
      pagination: (normalizedPayload as any).__pagination || fallback,
    };
  }

  if (normalizedPayload && typeof normalizedPayload === 'object') {
    const record = normalizedPayload as Record<string, any>;
    return {
      items: Array.isArray(record.data) ? (record.data as T[]) : [],
      pagination: record.__pagination || record.pagination || fallback,
    };
  }

  return {
    items: [],
    pagination: fallback,
  };
};

const extractEntityResponse = <T>(payload: unknown): T | null => {
  const normalizedPayload = unwrapApiPayload<T>(payload);
  if (normalizedPayload !== null && normalizedPayload !== undefined) {
    return normalizedPayload;
  }

  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return ((payload as Record<string, unknown>).data as T) ?? null;
  }

  return (payload as T) ?? null;
};

const emptyShiftDetailSummary = {
  totalRevenue: 0,
  totalOrders: 0,
  totalStockTransfers: 0,
  totalProductAdjustments: 0,
};

const normalizeShiftDetail = (payload: unknown) => {
  const record = extractEntityResponse<any>(payload);
  if (!record || typeof record !== 'object') {
    return null;
  }

  return {
    ...record,
    shift: record.shift && typeof record.shift === 'object' ? record.shift : {},
    summary: {
      ...emptyShiftDetailSummary,
      ...(record.summary && typeof record.summary === 'object' ? record.summary : {}),
    },
    orders: Array.isArray(record.orders) ? record.orders : [],
    stockTransfers: Array.isArray(record.stockTransfers) ? record.stockTransfers : [],
    productAdjustments: Array.isArray(record.productAdjustments) ? record.productAdjustments : [],
  };
};

const loadCurrentStoreShift = async () => {
  try {
    if (!resolvedStoreId.value) {
      currentStoreShift.value = null;
      return;
    }
    const response = await api.get('/store-shift/current', {
      params: { outletId: resolvedStoreId.value },
    });
    currentStoreShift.value = normalizeOpenStoreShift(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      currentStoreShift.value = null;
    } else {
      console.error('Error loading current store shift:', error);
    }
  }
};

const loadCurrentShift = async () => {
  try {
    const response = await api.get('/cash-shift/current');
    currentShift.value = normalizeOpenCashShift(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      currentShift.value = null;
    } else {
      console.error('Error loading current shift:', error);
    }
  }
};

const loadShiftHistory = async () => {
  historyLoading.value = true;
  try {
    const response = await api.get('/cash-shift/history', {
      params: {
        page: historyPagination.value.page,
        limit: historyPagination.value.limit,
      },
    });
    const fallbackPagination = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    const { items, pagination } = extractCollectionResponse<any>(response.data, fallbackPagination);
    shiftHistory.value = items;
    historyPagination.value = pagination;
  } catch (error: any) {
    console.error('Error loading shift history:', error);
    shiftHistory.value = [];
  } finally {
    historyLoading.value = false;
  }
};

const handleOpenStoreShift = async () => {
  if (!openStoreShiftForm.value.shiftType) {
    await showError('Shift type wajib dipilih');
    return;
  }

  if (!resolvedStoreId.value) {
    await showError('Store belum dipilih');
    return;
  }

  openingStoreShift.value = true;
  try {
    await api.post('/store-shift/open', {
      outletId: resolvedStoreId.value,
      shiftType: openStoreShiftForm.value.shiftType,
      modalAwal: openStoreShiftForm.value.modalAwal || undefined,
      catatan: openStoreShiftForm.value.catatan || undefined,
    });

    await showSuccess(`Shift ${openStoreShiftForm.value.shiftType} berhasil dibuka`);
    openStoreShiftForm.value = { shiftType: '', modalAwal: 0, catatan: '' };
    authStore.invalidateShiftCache();
    await loadCurrentStoreShift();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal membuka shift toko';
    await showError(errorMessage);
  } finally {
    openingStoreShift.value = false;
  }
};

const handleOpenShift = async () => {
  if (!openShiftForm.value.modalAwal || openShiftForm.value.modalAwal <= 0) {
    await showError('Modal awal harus lebih besar dari 0');
    return;
  }

  openingShift.value = true;
  try {
    await api.post('/cash-shift/open', {
      modalAwal: openShiftForm.value.modalAwal,
      catatan: openShiftForm.value.catatan || undefined,
    });

    await showSuccess('Cash shift berhasil dibuka');
    openShiftForm.value = { modalAwal: 0, catatan: '' };
    authStore.invalidateShiftCache();
    await loadCurrentShift();
    await loadCurrentStoreShift();
    await loadShiftHistory();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal membuka cash shift';
    await showError(errorMessage);
  } finally {
    openingShift.value = false;
  }
};

const handleCloseShift = async () => {
  if (!closeShiftForm.value.uangFisikTutup && closeShiftForm.value.uangFisikTutup !== 0) {
    await showError('Uang fisik tutup wajib diisi');
    return;
  }

  closingShift.value = true;
  try {
    const response = await api.post('/cash-shift/close', {
      uangFisikTutup: closeShiftForm.value.uangFisikTutup,
      catatan: closeShiftForm.value.catatan || undefined,
    });

    await showSuccess('Shift berhasil ditutup');
    
    // Capture data for Success Modal
    const saldoSeharusnya = (currentShift.value.modalAwal || 0) + (currentShift.value.totalPenjualan || 0);
    const selisih = closeShiftForm.value.uangFisikTutup - saldoSeharusnya;
    const closedShift = unwrapApiPayload<any>(response.data) || response.data;

    lastClosedShiftData.value = {
        ...currentShift.value,
        ...closedShift,
        physicalCash: closeShiftForm.value.uangFisikTutup,
        selisih: selisih
    };
    
    showCloseModal.value = false;
    showShiftClosedModal.value = true;

    closeShiftForm.value = { uangFisikTutup: 0, catatan: '' };
    authStore.invalidateShiftCache();
    await loadCurrentShift();
    await loadCurrentStoreShift();
    await loadShiftHistory();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Gagal menutup shift';
    await showError(errorMessage);
  } finally {
    closingShift.value = false;
  }
};

const finishCloseShift = () => {
    showShiftClosedModal.value = false;
    router.push('/open-shift');
};

const goToPOS = () => {
  router.push('/pos');
};

const generateShiftReport = (shiftData: any) => {
  const modalAwal = shiftData?.modalAwal || currentShift.value?.modalAwal || 0;
  const totalSales = shiftData?.totalPenjualan || currentShift.value?.totalPenjualan || 0;
  // Use passed data if available, otherwise form
  const physicalCash = shiftData?.physicalCash ?? closeShiftForm.value.uangFisikTutup;
  const expectedBalance = modalAwal + totalSales;
  const difference = physicalCash - expectedBalance;
  const now = new Date();
  const storeName = authStore.user?.tenantName || 'Store';
  const cashierName = authStore.user?.name || 'Cashier';
  
  const reportHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Shift Report - ${now.toLocaleDateString('id-ID')}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; background: #f8f9fa; }
        .report { max-width: 400px; margin: 0 auto; background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px dashed #e0e0e0; padding-bottom: 16px; margin-bottom: 16px; }
        .header h1 { font-size: 20px; font-weight: bold; color: #1a1a1a; }
        .header p { font-size: 12px; color: #666; margin-top: 4px; }
        .section { margin-bottom: 16px; }
        .section-title { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
        .row:last-child { border-bottom: none; }
        .row .label { color: #555; font-size: 13px; }
        .row .value { font-weight: 600; color: #1a1a1a; font-size: 13px; }
        .total-row { background: #f8f9fa; margin: 0 -24px; padding: 12px 24px; border-top: 2px solid #e0e0e0; }
        .total-row .value { font-size: 18px; color: #10b981; }
        .difference { padding: 12px; border-radius: 8px; text-align: center; margin-top: 16px; }
        .difference.positive { background: #d1fae5; color: #065f46; }
        .difference.negative { background: #fee2e2; color: #991b1b; }
        .difference.zero { background: #f3f4f6; color: #374151; }
        .footer { text-align: center; margin-top: 20px; padding-top: 16px; border-top: 2px dashed #e0e0e0; }
        .footer p { font-size: 11px; color: #888; }
        .print-btn { display: block; width: 100%; padding: 12px; margin-top: 20px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .print-btn:hover { background: #059669; }
        @media print { .print-btn { display: none; } body { background: white; } .report { box-shadow: none; } }
      </style>
    </head>
    <body>
      <div class="report">
        <div class="header">
          <h1>LAPORAN TUTUP SHIFT</h1>
          <p>${storeName}</p>
          <p>${now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>${now.toLocaleTimeString('id-ID')}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Informasi Kasir</div>
          <div class="row">
            <span class="label">Nama Kasir</span>
            <span class="value">${cashierName}</span>
          </div>
          <div class="row">
            <span class="label">Waktu Buka</span>
            <span class="value">${shiftData?.shiftStart ? new Date(shiftData.shiftStart).toLocaleTimeString('id-ID') : '-'}</span>
          </div>
          <div class="row">
            <span class="label">Waktu Tutup</span>
            <span class="value">${now.toLocaleTimeString('id-ID')}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Ringkasan Kas</div>
          <div class="row">
            <span class="label">Modal Awal</span>
            <span class="value">Rp ${modalAwal.toLocaleString('id-ID')}</span>
          </div>
          <div class="row">
            <span class="label">Total Penjualan</span>
            <span class="value">Rp ${totalSales.toLocaleString('id-ID')}</span>
          </div>
          <div class="row total-row">
            <span class="label">Saldo Seharusnya</span>
            <span class="value">Rp ${expectedBalance.toLocaleString('id-ID')}</span>
          </div>
          <div class="row">
            <span class="label">Uang Fisik</span>
            <span class="value">Rp ${physicalCash.toLocaleString('id-ID')}</span>
          </div>
        </div>
        
        <div class="difference ${difference > 0 ? 'positive' : difference < 0 ? 'negative' : 'zero'}">
          <strong>Selisih: Rp ${Math.abs(difference).toLocaleString('id-ID')} ${difference > 0 ? '(Lebih)' : difference < 0 ? '(Kurang)' : '(Pas)'}</strong>
        </div>
        
        <div class="footer">
          <p>Laporan ini dicetak secara otomatis</p>
          <p>Warungin POS System</p>
        </div>
        
        <button class="print-btn" onclick="window.print()">Cetak Laporan</button>
      </div>
    </body>
    </html>
  `;
  
  // Open in new window for printing
  const printWindow = window.open('', '_blank', 'width=500,height=700');
  if (printWindow) {
    printWindow.document.write(reportHtml);
    printWindow.document.close();
  }
};

const calculateSelisih = (): number => {
  if (!currentShift.value || !closeShiftForm.value.uangFisikTutup) return 0;
  const saldoSeharusnya = (currentShift.value.modalAwal || 0) + (currentShift.value.totalPenjualan || 0);
  return closeShiftForm.value.uangFisikTutup - saldoSeharusnya;
};

const getSelisihClass = (selisih: number | null): string => {
  if (selisih === null) return 'text-[#4c739a]';
  if (selisih > 0) return 'text-green-600';
  if (selisih < 0) return 'text-red-600';
  return 'text-[#4c739a]';
};

const formatDateTime = (date: string | Date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const loadTodayShifts = async () => {
  todayShiftsLoading.value = true;
  try {
    const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
    if (!selectedStoreId) {
      todayShifts.value = [];
      return;
    }
    const response = await api.get('/store-shift/today', {
      params: { outletId: selectedStoreId },
    });
    const { items } = extractCollectionResponse<any>(response.data, {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0,
    });
    todayShifts.value = items;
  } catch (error: any) {
    console.error('Error loading today shifts:', error);
    todayShifts.value = [];
  } finally {
    todayShiftsLoading.value = false;
  }
};

const loadStoreShiftHistory = async () => {
  storeShiftHistoryLoading.value = true;
  try {
    const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
    if (!selectedStoreId) {
      storeShiftHistory.value = [];
      return;
    }
    const response = await api.get('/store-shift/history', {
      params: {
        outletId: selectedStoreId,
        page: storeShiftHistoryPagination.value.page,
        limit: storeShiftHistoryPagination.value.limit,
      },
    });
    const fallbackPagination = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    };
    const { items, pagination } = extractCollectionResponse<any>(response.data, fallbackPagination);
    storeShiftHistory.value = items;
    storeShiftHistoryPagination.value = pagination;
  } catch (error: any) {
    console.error('Error loading store shift history:', error);
    storeShiftHistory.value = [];
  } finally {
    storeShiftHistoryLoading.value = false;
  }
};

const changeStoreShiftHistoryPage = (page: number) => {
  storeShiftHistoryPagination.value.page = page;
  loadStoreShiftHistory();
};

// === Cash Shift History ===
const getCashShiftDateRange = () => {
  const now = new Date();
  let startDate: string | undefined;
  let endDate: string | undefined;

  switch (cashShiftPeriod.value) {
    case 'today': {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate = today.toISOString();
      endDate = now.toISOString();
      break;
    }
    case 'week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const weekStart = new Date(now.getFullYear(), now.getMonth(), diff);
      startDate = weekStart.toISOString();
      endDate = now.toISOString();
      break;
    }
    case 'month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = monthStart.toISOString();
      endDate = now.toISOString();
      break;
    }
    case 'custom': {
      if (cashShiftCustomStart.value) startDate = new Date(cashShiftCustomStart.value).toISOString();
      if (cashShiftCustomEnd.value) endDate = new Date(cashShiftCustomEnd.value).toISOString();
      break;
    }
  }
  return { startDate, endDate };
};

const loadCashShiftHistory = async () => {
  cashShiftHistoryLoading.value = true;
  try {
    const { startDate, endDate } = getCashShiftDateRange();
    const response = await api.get('/cash-shift/history', {
      params: {
        page: cashShiftHistoryPagination.value.page,
        limit: cashShiftHistoryPagination.value.limit,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      },
    });
    const fallbackPagination = {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    };
    const { items, pagination } = extractCollectionResponse<any>(response.data, fallbackPagination);
    cashShiftHistory.value = items;
    cashShiftHistoryPagination.value = pagination;
  } catch (error: any) {
    console.error('Error loading cash shift history:', error);
    cashShiftHistory.value = [];
  } finally {
    cashShiftHistoryLoading.value = false;
  }
};

const changeCashShiftPeriod = (period: 'today' | 'week' | 'month' | 'custom') => {
  cashShiftPeriod.value = period;
  cashShiftHistoryPagination.value.page = 1;
  if (period !== 'custom') loadCashShiftHistory();
};

const changeCashShiftHistoryPage = (page: number) => {
  cashShiftHistoryPagination.value.page = page;
  loadCashShiftHistory();
};

const viewShiftDetails = async (shiftId: string) => {
  selectedShiftId.value = shiftId;
  showShiftDetailModal.value = true;
  await loadShiftDetails(shiftId);
};

const loadShiftDetails = async (shiftId: string) => {
  shiftDetailLoading.value = true;
  try {
    const response = await api.get(`/store-shift/${shiftId}/details`, {
      params: {
        includeOrders: shiftDetailFilters.value.includeOrders,
        includeStockTransfers: shiftDetailFilters.value.includeStockTransfers,
        includeProductAdjustments: shiftDetailFilters.value.includeProductAdjustments,
      },
    });
    shiftDetail.value = normalizeShiftDetail(response.data);
  } catch (error: any) {
    console.error('Error loading shift details:', error);
    await showError('Gagal memuat detail shift');
  } finally {
    shiftDetailLoading.value = false;
  }
};

// Watch activeTab to load data when tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'today') {
    loadTodayShifts();
  } else if (newTab === 'history') {
    loadStoreShiftHistory();
    loadCashShiftHistory();
  }
});

onMounted(async () => {
  loading.value = true;
  
  // Step 1: Load ONLY essential shift state (fast - 2 calls)
  await Promise.all([
    loadCurrentStoreShift(),
    loadCurrentShift(),
  ]);
  loading.value = false;

  // Step 2: Lazy-load supplementary data AFTER page renders (non-blocking)
  // This ensures the page appears instantly with shift status
  loadShiftHistory().then(() => {
    // Smart Default: Pre-fill Modal Awal from last shift
    if (!currentShift.value && shiftHistory.value.length > 0) {
      const lastShift = shiftHistory.value[0];
      if (lastShift && lastShift.uangFisikTutup) {
        openShiftForm.value.modalAwal = lastShift.uangFisikTutup;
      }
    }
  });
  
  // Load tab-specific data based on active tab
  if (activeTab.value === 'today') {
    loadTodayShifts();
  } else if (activeTab.value === 'history') {
    loadStoreShiftHistory();
    loadCashShiftHistory();
  }

  // Auto-refresh current shift data every 30 seconds
  pollingInterval.value = setInterval(() => {
    if (currentShift.value) {
      loadCurrentShift();
    }
  }, 30000);
});

onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
});
</script>
