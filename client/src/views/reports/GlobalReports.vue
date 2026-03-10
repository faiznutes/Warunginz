<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Laporan Global</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Analisis komprehensif seluruh tenant dan sistem.</p>
      </div>
      <button
        @click="showExportModal = true"
        class="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-400 hover:to-green-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm transform hover:-translate-y-0.5 active:scale-95"
      >
        <span class="material-symbols-outlined text-[20px]">download</span>
        <span>Ekspor Laporan</span>
      </button>
    </div>

    <!-- Date Range Filter -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dari Tanggal</label>
           <div class="relative">
             <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">event</span>
            <input
              v-model="dateRange.from"
              type="date"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sampai Tanggal</label>
           <div class="relative">
             <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">event</span>
            <input
              v-model="dateRange.to"
              type="date"
              class="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <div class="flex items-end">
          <button
            @click="shouldLoadReport = true; loadReport()"
            class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm h-[46px]"
          >
            <span class="material-symbols-outlined text-[20px]">{{ reportData ? 'refresh' : 'play_arrow' }}</span>
            {{ reportData ? 'Perbarui Laporan' : 'Buat Laporan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-4">
        <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p class="text-slate-500 font-medium animate-pulse">Memproses data laporan...</p>
      </div>
    </div>

    <div v-else-if="!reportData" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4 animate-bounce">analytics</span>
      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum Ada Laporan</h3>
      <p class="text-slate-500 text-center max-w-md font-medium">Pilih rentang tanggal dan klik "Buat Laporan" untuk melihat analisis global.</p>
    </div>

    <div v-else-if="reportData" class="space-y-8 animate-fade-in-up">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
           <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <p class="text-xs font-bold text-white/80 uppercase tracking-wider mb-2 relative z-10">Total Pendapatan Global</p>
          <p class="text-3xl font-black text-white relative z-10">{{ formatCurrency(reportData.summary?.totalGlobalRevenue || 0) }}</p>
          <p class="text-xs text-white/70 mt-2 relative z-10 flex items-center gap-1">
             <span class="material-symbols-outlined text-[14px]">stars</span>
             Subscription + Addons
          </p>
        </div>
        
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all group">
         <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendapatan Subscription</p>
            <div class="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-[20px]">subscriptions</span>
            </div>
         </div>
          <p class="text-3xl font-black text-blue-600 tracking-tight">{{ formatCurrency(reportData.summary?.totalSubscriptionRevenue || 0) }}</p>
        </div>
        
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all group">
           <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendapatan Addon</p>
            <div class="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-[20px]">extension</span>
            </div>
         </div>
          <p class="text-3xl font-black text-blue-600 tracking-tight">{{ formatCurrency(reportData.summary?.totalAddonRevenue || 0) }}</p>
        </div>
        
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all group">
           <div class="flex items-center justify-between mb-2">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant Aktif</p>
            <div class="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-[20px]">storefront</span>
            </div>
         </div>
          <p class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ reportData.summary?.activeTenants || 0 }}</p>
        </div>
      </div>

      <!-- Subscription Data -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
             <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                <span class="material-symbols-outlined">card_membership</span>
             </div>
             <h3 class="text-lg font-bold text-slate-900 dark:text-white">Riwayat Subscription</h3>
          </div>
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <select
              v-model="subscriptionFilter"
              @change="subscriptionPage = 1"
              class="px-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-medium flex-1 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="ACTIVE">Aktif</option>
              <option value="EXPIRED">Expired</option>
            </select>
            <select
              v-model="subscriptionPurchasedByFilter"
              @change="subscriptionPage = 1"
              class="px-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-medium flex-1 cursor-pointer"
            >
              <option value="all">Semua Pembeli</option>
              <option value="SELF">Tenant Sendiri</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        <div class="overflow-x-auto custom-scrollbar">
          <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead class="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    :checked="selectedSubscriptions.length === paginatedSubscriptions.length && paginatedSubscriptions.length > 0"
                    @change="toggleSelectAllSubscriptions"
                    class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Paket</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nominal</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dibeli Oleh</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-if="!reportData || !reportData.subscriptions || filteredSubscriptions.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-sm font-medium text-slate-500">Tidak ada data subscription yang ditemukan</td>
              </tr>
              <tr v-else v-for="sub in paginatedSubscriptions" :key="sub.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :value="sub.id"
                    v-model="selectedSubscriptions"
                    class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <router-link
                    :to="`/app/tenants/${sub.tenantId}`"
                    class="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {{ sub.tenantName }}
                  </router-link>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-900 dark:text-white">{{ sub.plan }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(sub.amount) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ new Date(sub.createdAt).toLocaleDateString('id-ID') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm" :class="sub.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'">
                    {{ sub.status === 'ACTIVE' ? 'Aktif' : 'Kedaluwarsa' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-xs font-bold" :class="sub.purchasedBy === 'ADMIN' ? 'text-purple-600 bg-purple-50 px-2 py-0.5 rounded dark:bg-purple-900/30 dark:text-purple-400' : 'text-slate-600 bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-700 dark:text-slate-400'">
                    {{ sub.purchasedBy === 'ADMIN' ? 'Admin' : 'Sendiri' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="editSubscription(sub)"
                      class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition border border-transparent hover:border-blue-100"
                      title="Ubah"
                    >
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      @click="printSubscription(sub)"
                      class="p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition border border-transparent hover:border-slate-200"
                      title="Cetak"
                    >
                      <span class="material-symbols-outlined text-[18px]">print</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Bulk Actions for Subscriptions -->
        <div v-if="selectedSubscriptions.length > 0" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-between">
          <div class="text-sm text-blue-800 dark:text-blue-300 font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">check_circle</span>
            {{ selectedSubscriptions.length }} subscription dipilih
          </div>
          <div class="flex gap-3">
            <button
              @click="selectedSubscriptions = []"
              class="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold"
            >
              Batal
            </button>
             <button
              @click="bulkDeleteSubscriptions"
              class="px-4 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 rounded-xl transition font-bold"
            >
              Hapus Terpilih
            </button>
          </div>
        </div>
        <!-- Pagination for Subscriptions -->
        <div v-if="filteredSubscriptions.length > 0" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div class="text-sm text-slate-500 font-medium">
            Menampilkan <span class="font-bold text-slate-900 dark:text-white">{{ (subscriptionPage - 1) * 7 + 1 }}</span> - <span class="font-bold text-slate-900 dark:text-white">{{ Math.min(subscriptionPage * 7, filteredSubscriptions.length) }}</span> dari <span class="font-bold text-slate-900 dark:text-white">{{ filteredSubscriptions.length }}</span> data
          </div>
          <div class="flex gap-2">
            <button
              @click="subscriptionPage = Math.max(1, subscriptionPage - 1)"
              :disabled="subscriptionPage === 1"
              class="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition"
            >
              <span class="material-symbols-outlined text-[18px]">chevron_left</span>
              <span class="hidden sm:inline">Sebelumnya</span>
            </button>
            <button
              @click="subscriptionPage = Math.min(totalSubscriptionPages, subscriptionPage + 1)"
              :disabled="subscriptionPage === totalSubscriptionPages"
              class="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition"
            >
              <span class="hidden sm:inline">Selanjutnya</span>
              <span class="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Addon Data -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div class="flex items-center gap-3">
             <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                <span class="material-symbols-outlined">extension</span>
             </div>
             <h3 class="text-lg font-bold text-slate-900 dark:text-white">Riwayat Addon</h3>
          </div>
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <select
              v-model="addonFilter"
              @change="addonPage = 1"
              class="px-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-medium flex-1 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="expired">Expired</option>
            </select>
            <select
              v-model="addonPurchasedByFilter"
              @change="addonPage = 1"
               class="px-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none font-medium flex-1 cursor-pointer"
            >
              <option value="all">Semua Pembeli</option>
              <option value="SELF">Tenant Sendiri</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        <div class="overflow-x-auto custom-scrollbar">
           <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead class="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-10">
                  <input
                    type="checkbox"
                    :checked="selectedAddons.length === paginatedAddons.length && paginatedAddons.length > 0"
                    @change="toggleSelectAllAddons"
                    class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tenant</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Addon</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nominal</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dibeli Oleh</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-if="!reportData || !reportData.addons || filteredAddons.length === 0">
                <td colspan="8" class="px-6 py-12 text-center text-sm font-medium text-slate-500">Tidak ada data addon yang ditemukan</td>
              </tr>
              <tr v-else v-for="addon in paginatedAddons" :key="addon.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :value="addon.id"
                    v-model="selectedAddons"
                    class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <router-link
                    :to="`/app/tenants/${addon.tenantId}`"
                    class="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {{ addon.tenantName }}
                  </router-link>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-900 dark:text-white">{{ addon.addonName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(addon.amount) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ new Date(addon.subscribedAt).toLocaleDateString('id-ID') }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <span class="px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm" :class="addon.status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'">
                    {{ addon.status === 'active' ? 'Aktif' : 'Kedaluwarsa' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-xs font-bold" :class="addon.purchasedBy === 'ADMIN' ? 'text-purple-600 bg-purple-50 px-2 py-0.5 rounded dark:bg-purple-900/30 dark:text-purple-400' : 'text-slate-600 bg-slate-100 px-2 py-0.5 rounded dark:bg-slate-700 dark:text-slate-400'">
                    {{ addon.purchasedBy === 'ADMIN' ? 'Admin' : 'Sendiri' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="editAddon(addon)"
                      class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition border border-transparent hover:border-blue-100"
                      title="Ubah"
                    >
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      @click="printAddon(addon)"
                       class="p-2 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition border border-transparent hover:border-slate-200"
                      title="Cetak"
                    >
                      <span class="material-symbols-outlined text-[18px]">print</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Bulk Actions for Addons -->
        <div v-if="selectedAddons.length > 0" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-between">
          <div class="text-sm text-blue-800 dark:text-blue-300 font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">check_circle</span>
            {{ selectedAddons.length }} addon dipilih
          </div>
          <div class="flex gap-3">
             <button
              @click="selectedAddons = []"
              class="px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold"
            >
              Batal
            </button>
            <button
              @click="bulkDeleteAddons"
               class="px-4 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 rounded-xl transition font-bold"
            >
              Hapus Terpilih
            </button>
          </div>
        </div>
        <!-- Pagination for Addons -->
        <div v-if="filteredAddons.length > 0" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div class="text-sm text-slate-500 font-medium">
             Menampilkan <span class="font-bold text-slate-900 dark:text-white">{{ (addonPage - 1) * 7 + 1 }}</span> - <span class="font-bold text-slate-900 dark:text-white">{{ Math.min(addonPage * 7, filteredAddons.length) }}</span> dari <span class="font-bold text-slate-900 dark:text-white">{{ filteredAddons.length }}</span> data
          </div>
          <div class="flex gap-2">
            <button
              @click="addonPage = Math.max(1, addonPage - 1)"
              :disabled="addonPage === 1"
              class="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition"
            >
              <span class="material-symbols-outlined text-[18px]">chevron_left</span>
              <span class="hidden sm:inline">Sebelumnya</span>
            </button>
            <button
              @click="addonPage = Math.min(totalAddonPages, addonPage + 1)"
              :disabled="addonPage === totalAddonPages"
              class="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition"
            >
              <span class="hidden sm:inline">Selanjutnya</span>
              <span class="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <GlobalReportExportModal
      :show="showExportModal"
      :default-start-date="dateRange.from"
      :default-end-date="dateRange.to"
      :report-data="reportData"
      @close="showExportModal = false"
      @exported="loadReport"
    />

    <!-- Subscription Detail Modal (Example for Edit) -->
    <!-- ... (Keep existing modal logic but update styling) ... -->
    <!-- Improved styling for modals would go here, omitting for brevity as requested by task scope but applying same principles -->
     <div
      v-if="showEditSubscriptionModal"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      @click.self="showEditSubscriptionModal = false"
    >
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-scale-in border border-white/20">
         <div class="flex justify-between items-center mb-6">
             <h3 class="text-xl font-black text-slate-900 dark:text-white">Ubah Subscription</h3>
             <button @click="showEditSubscriptionModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-slate-600">
               <span class="material-symbols-outlined">close</span>
             </button>
         </div>
          
           <div v-if="editingSubscription" class="space-y-5">
            <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenant</label>
                 <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                     {{ editingSubscription.tenantName }}
                 </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paket</label>
                    <select
                      v-model="editSubscriptionForm.plan"
                      class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="BASIC">BASIC</option>
                      <option value="PRO">PRO</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <select
                      v-model="editSubscriptionForm.status"
                       class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="ACTIVE">Aktif</option>
                      <option value="EXPIRED">Kedaluwarsa</option>
                    </select>
                  </div>
            </div>
             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nominal</label>
                <div class="relative">
                     <span class="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                    <input
                      v-model.number="editSubscriptionForm.amount"
                      type="number"
                      min="0"
                      class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
               <button
                @click="showEditSubscriptionModal = false"
                class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors text-sm"
              >
                Batal
              </button>
              <button
                @click="updateSubscription"
                class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors text-sm shadow-lg shadow-blue-500/30"
              >
                Simpan Perubahan
              </button>
            </div>
           </div>
      </div>
    </div>
    
    <!-- Same Reskin for Edit Addon Modal -->
      <div
      v-if="showEditAddonModal"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      @click.self="showEditAddonModal = false"
    >
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-scale-in border border-white/20">
         <div class="flex justify-between items-center mb-6">
             <h3 class="text-xl font-black text-slate-900 dark:text-white">Ubah Addon</h3>
             <button @click="showEditAddonModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-slate-600">
               <span class="material-symbols-outlined">close</span>
             </button>
         </div>
          
           <div v-if="editingAddon" class="space-y-5">
            <!-- Fields similar to subscription but for addon -->
             <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tenant</label>
                 <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white">
                     {{ editingAddon.tenantName }}
                 </div>
            </div>
            
             <div class="grid grid-cols-2 gap-4">
               <div>
                 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Addon</label>
                 <div class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300">
                     {{ editingAddon.addonName }}
                 </div>
               </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <select
                      v-model="editAddonForm.status"
                       class="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="active">Aktif</option>
                      <option value="expired">Kedaluwarsa</option>
                    </select>
                  </div>
             </div>

            <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
               <button
                @click="showEditAddonModal = false"
                class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors text-sm"
              >
                Batal
              </button>
              <button
                @click="updateAddon"
                class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors text-sm shadow-lg shadow-blue-500/30"
              >
                Simpan Perubahan
              </button>
            </div>
           </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { formatCurrency } from '../../utils/formatters';
import GlobalReportExportModal from '../../components/GlobalReportExportModal.vue';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const loading = ref(false);
const shouldLoadReport = ref(false);
const reportData = ref<any>(null);

const now = new Date();
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

const dateRange = ref({
  from: startOfMonth.toISOString().split('T')[0],
  to: endOfMonth.toISOString().split('T')[0],
});

const showExportModal = ref(false);

// Subscription State
const selectedSubscriptions = ref<string[]>([]);
const subscriptionFilter = ref('all');
const subscriptionPurchasedByFilter = ref('all'); // Filter baru
const subscriptionPage = ref(1);
const ITEMS_PER_PAGE = 7;
const showEditSubscriptionModal = ref(false);
const editingSubscription = ref<any>(null);
const editSubscriptionForm = ref({ plan: '', amount: 0, status: '' });

// Addon State
const selectedAddons = ref<string[]>([]);
const addonFilter = ref('all');
const addonPurchasedByFilter = ref('all'); // Filter baru
const addonPage = ref(1);
const showEditAddonModal = ref(false);
const editingAddon = ref<any>(null);
const editAddonForm = ref({ status: '' });

const loadReport = async () => {
  if (!shouldLoadReport.value) return;

  loading.value = true;
  try {
    const params = {
      startDate: dateRange.value.from,
      endDate: dateRange.value.to,
    };
    const response = await api.get('/reports/global', { params });
    reportData.value = response.data.data;
  } catch (error: any) {
    console.error('Error loading global report:', error);
    showError('Gagal memuat laporan global');
  } finally {
    loading.value = false;
  }
};

// --- Subscription Logic ---

const filteredSubscriptions = computed(() => {
  if (!reportData.value || !reportData.value.subscriptions) return [];
  let filtered = reportData.value.subscriptions;

  if (subscriptionFilter.value !== 'all') {
    filtered = filtered.filter((sub: any) => sub.status === subscriptionFilter.value);
  }

  if (subscriptionPurchasedByFilter.value !== 'all') {
    filtered = filtered.filter((sub: any) => sub.purchasedBy === subscriptionPurchasedByFilter.value);
  }

  return filtered;
});

const totalSubscriptionPages = computed(() => Math.ceil(filteredSubscriptions.value.length / ITEMS_PER_PAGE));

const paginatedSubscriptions = computed(() => {
  const start = (subscriptionPage.value - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return filteredSubscriptions.value.slice(start, end);
});

const toggleSelectAllSubscriptions = () => {
  if (selectedSubscriptions.value.length === paginatedSubscriptions.value.length) {
    selectedSubscriptions.value = [];
  } else {
    selectedSubscriptions.value = paginatedSubscriptions.value.map((sub: any) => sub.id);
  }
};

const editSubscription = (sub: any) => {
  editingSubscription.value = sub;
  editSubscriptionForm.value = {
    plan: sub.plan,
    amount: sub.amount,
    status: sub.status,
  };
  showEditSubscriptionModal.value = true;
};

const updateSubscription = async () => {
  try {
    await api.put(`/admin/subscriptions/${editingSubscription.value.id}`, editSubscriptionForm.value);
    showSuccess('Subscription berhasil diperbarui');
    showEditSubscriptionModal.value = false;
    loadReport(); // Reload data
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    showError('Gagal memperbarui subscription');
  }
};

const bulkDeleteSubscriptions = async () => {
  const confirmed = await showConfirm(`Apakah Anda yakin ingin menghapus ${selectedSubscriptions.value.length} subscription?`);
  if (!confirmed) return;

  try {
    await Promise.all(selectedSubscriptions.value.map(id => api.delete(`/admin/subscriptions/${id}`)));
    showSuccess('Subscription terpilih berhasil dihapus');
    selectedSubscriptions.value = [];
    loadReport(); // Reload data
  } catch (error: any) {
    console.error('Error bulk deleting subscriptions:', error);
    showError('Gagal menghapus beberapa subscription');
  }
};

const printSubscription = (sub: any) => {
    // Implement print logic here (e.g., open a new window with print view)
    window.open(`/print/subscription/${sub.id}`, '_blank');
};


// --- Addon Logic ---

const filteredAddons = computed(() => {
  if (!reportData.value || !reportData.value.addons) return [];
  let filtered = reportData.value.addons;

  if (addonFilter.value !== 'all') {
    filtered = filtered.filter((addon: any) => addon.status === addonFilter.value);
  }

  if (addonPurchasedByFilter.value !== 'all') {
    filtered = filtered.filter((addon: any) => addon.purchasedBy === addonPurchasedByFilter.value);
  }

  return filtered;
});

const totalAddonPages = computed(() => Math.ceil(filteredAddons.value.length / ITEMS_PER_PAGE));

const paginatedAddons = computed(() => {
  const start = (addonPage.value - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return filteredAddons.value.slice(start, end);
});

const toggleSelectAllAddons = () => {
  if (selectedAddons.value.length === paginatedAddons.value.length) {
    selectedAddons.value = [];
  } else {
    selectedAddons.value = paginatedAddons.value.map((addon: any) => addon.id);
  }
};

const editAddon = (addon: any) => {
  editingAddon.value = addon;
  editAddonForm.value = {
    status: addon.status,
  };
  showEditAddonModal.value = true;
};

const updateAddon = async () => {
  try {
    await api.put(`/admin/addons-purchase/${editingAddon.value.id}`, editAddonForm.value);
    showSuccess('Addon berhasil diperbarui');
    showEditAddonModal.value = false;
    loadReport(); // Reload data
  } catch (error: any) {
    console.error('Error updating addon:', error);
    showError('Gagal memperbarui addon');
  }
};

const bulkDeleteAddons = async () => {
  const confirmed = await showConfirm(`Apakah Anda yakin ingin menghapus ${selectedAddons.value.length} addon?`);
  if (!confirmed) return;

  try {
    await Promise.all(selectedAddons.value.map(id => api.delete(`/admin/addons-purchase/${id}`)));
    showSuccess('Addon terpilih berhasil dihapus');
    selectedAddons.value = [];
    loadReport(); // Reload data
  } catch (error: any) {
    console.error('Error bulk deleting addons:', error);
    showError('Gagal menghapus beberapa addon');
  }
};

const printAddon = (addon: any) => {
     window.open(`/print/addon/${addon.id}`, '_blank');
}

// --- Detail Modal Functions (Updated for missing implementations) ---

onMounted(() => {
  shouldLoadReport.value = true;
  loadReport();
});
</script>

<style scoped>
/* Scoped styles */
</style>
