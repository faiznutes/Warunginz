<template>
  <div class="flex flex-col gap-6 animate-fade-in font-display">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />
    
    <!-- Store Selector (Only for SUPERVISOR) -->
    <div v-if="authStore.user?.role === 'SUPERVISOR'">
      <StoreSelector @store-changed="handleStoreChange" />
    </div>

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Laporan</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Analisis penjualan dan performa toko Anda.</p>
      </div>
      <button
        v-if="canExportReports || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN' || authStore.user?.role === 'SUPERVISOR'"
        @click="showExportModal = true"
        class="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-400 hover:to-green-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm transform hover:-translate-y-0.5 active:scale-95"
      >
        <span class="material-symbols-outlined text-[20px]">download</span>
        <span>Ekspor Laporan</span>
      </button>
    </div>

    <!-- Report Type & Period Filter -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
      <!-- Simple View: Basic Filters -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Jenis Laporan</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">description</span>
            <select
                v-model="reportType"
                @change="handleReportTypeChange"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
            >
                <option value="sales">Laporan Penjualan</option>
                <option value="financial">Laporan Keuangan</option>
            </select>
            <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">expand_more</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Periode</label>
           <div class="relative">
             <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">calendar_month</span>
            <select
                v-model="period"
                @change="setPeriod(period)"
                class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
            >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="all">Semua Waktu</option>
            </select>
             <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>

      <!-- Advanced Options Toggle -->
      <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
        <button
          @click="showAdvancedOptions = !showAdvancedOptions"
          class="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
        >
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-slate-400 group-hover:text-blue-600 transition-colors text-[20px]">tune</span>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Opsi Lanjutan</span>
            <span class="text-xs text-slate-400 font-medium">(Opsional)</span>
          </div>
          <span
            class="material-symbols-outlined text-slate-400 transition-transform duration-200"
            :class="{ 'rotate-180': showAdvancedOptions }"
          >
            expand_more
          </span>
        </button>

        <!-- Advanced Options Content -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-[500px]"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[500px]"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-show="showAdvancedOptions" class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tampilan Data</label>
                <div class="relative">
                   <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">view_column</span>
                  <select
                      v-model="reportViewType"
                      @change="handleReportViewTypeChange"
                      class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                  >
                      <option value="full">Lengkap (Pendapatan + Modal)</option>
                      <option value="revenue">Hanya Pendapatan</option>
                      <option value="profit">Hanya Keuntungan</option>
                  </select>
                   <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">expand_more</span>
                </div>
              </div>

              <div v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Format Margin</label>
                 <div class="relative">
                   <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">percent</span>
                  <select
                      v-model="marginDisplayFormat"
                      @change="saveMarginFormat"
                      class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                  >
                      <option value="percentage">Persentase (%)</option>
                      <option value="amount">Nominal (Rp)</option>
                  </select>
                   <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">expand_more</span>
                </div>
              </div>

              <div v-if="period !== 'all'">
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rentang Tanggal</label>
                <div class="flex gap-2">
                  <input
                    v-model="dateRange.from"
                    type="date"
                    @change="handleDateRangeChange"
                    class="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <input
                    v-model="dateRange.to"
                    type="date"
                    @change="handleDateRangeChange"
                    class="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Analytics Section (Advanced) -->
    <div v-if="analyticsData && !loading && showAdvancedOptions" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span class="material-symbols-outlined text-blue-600">insights</span>
          Analitik Cerdas
        </h3>
        <button
          @click="loadAnalytics"
          class="text-sm text-blue-600 hover:text-blue-700 font-bold transition flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800"
        >
          <span class="material-symbols-outlined text-[18px]">refresh</span>
          Segarkan
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 group hover:-translate-y-1 transition-transform cursor-default">
           <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <p class="text-xs font-bold text-blue-100 uppercase tracking-wider mb-2 relative z-10">Prediksi Bulan Depan</p>
          <p class="text-3xl font-black text-white relative z-10 tracking-tight">
            {{ formatCurrency(analyticsData.predictions?.nextMonth || 0) }}
          </p>
          <p class="text-xs text-blue-100 mt-2 flex items-center gap-1 relative z-10">
             <span class="material-symbols-outlined text-[16px]">auto_graph</span>
             Berdasarkan tren historis
          </p>
        </div>

        <div class="relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm group hover:-translate-y-1 transition-transform cursor-default">
          <div class="flex items-center gap-3 mb-2">
              <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <span class="material-symbols-outlined">trending_up</span>
              </div>
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tren Penjualan</p>
          </div>
          <p 
            class="text-3xl font-black tracking-tight"
            :class="(analyticsData.predictions?.trend || 0) >= 0 ? 'text-blue-600' : 'text-red-500'"
          >
            {{ (analyticsData.predictions?.trend || 0) >= 0 ? '+' : '' }}{{ (analyticsData.predictions?.trend || 0).toFixed(2) }}%
          </p>
            <p class="text-xs text-slate-400 mt-2 font-medium">Dibandingkan periode sebelumnya</p>
        </div>

        <div class="relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm group hover:-translate-y-1 transition-transform cursor-default">
             <div class="flex items-center gap-3 mb-2">
              <div class="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <span class="material-symbols-outlined">verified</span>
              </div>
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Akurasi Prediksi</p>
          </div>
          <p class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {{ analyticsData.predictions?.accuracy || 0 }}%
          </p>
          <p class="text-xs text-slate-400 mt-2 font-medium">Tingkat kepercayaan model</p>
        </div>
      </div>
      
      <div v-if="analyticsData.topProducts && analyticsData.topProducts.length > 0" class="mt-8">
        <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Produk Terlaris
        </h4>
        <div class="space-y-3">
          <div
            v-for="(product, index) in analyticsData.topProducts.slice(0, 5)"
            :key="product.id"
            class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-blue-800 transition-colors group"
          >
            <div class="flex items-center gap-4">
              <span 
                class="w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg transition-colors group-hover:scale-110"
                :class="index < 3 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
              >
                #{{ index + 1 }}
              </span>
              <span class="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ product.name }}</span>
            </div>
            <span class="text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-3 py-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">{{ product.sales || 0 }} terjual</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-4">
         <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        <p class="text-slate-500 font-medium animate-pulse">Memuat laporan...</p>
      </div>
    </div>

    <!-- Report Content -->
    <div v-else-if="reportData" class="space-y-8 animate-fade-in-up">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="(stat, index) in summaryStats"
          :key="index"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all group"
        >
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ stat.label }}</p>
            <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-2xl group-hover:scale-110 transition-transform duration-300">
               {{ stat.icon }}
            </div>
          </div>
          <p :class="['text-3xl font-black tracking-tight', stat.color || 'text-slate-900 dark:text-white']">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Report Details Table -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Detail Laporan</h3>
              <p class="text-sm text-slate-500 mt-1 font-medium">
                Periode: {{ getPeriodLabel(period) }} 
                <span v-if="period !== 'all'">
                  ({{ formatDate(dateRange.from) }} - {{ formatDate(dateRange.to) }})
                </span>
              </p>
            </div>
            <button
              v-if="reportType === 'sales' && (authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN')"
              @click="showProductDetails = !showProductDetails"
              class="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition font-bold shadow-sm"
            >
              <span class="material-symbols-outlined text-[18px]">{{ showProductDetails ? 'visibility_off' : 'visibility' }}</span>
              {{ showProductDetails ? 'Sembunyikan Detail Produk' : 'Tampilkan Detail Produk' }}
            </button>
        </div>
        <div class="overflow-x-auto custom-scrollbar">
          <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900/50">
                <th
                  v-for="header in reportHeaders"
                  :key="header"
                  class="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
              <template v-for="(row, index) in reportRows" :key="index">
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <td
                    v-for="(cell, cellIndex) in row"
                    :key="cellIndex"
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {{ cell }}
                  </td>
                </tr>
                <!-- Shift Info Row -->
                <tr
                  v-if="reportType === 'sales' && byDate[index]?.orders && byDate[index].orders.length > 0 && byDate[index].orders[0]?.storeShift"
                  class="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30"
                >
                  <td :colspan="reportHeaders.length" class="px-6 py-3">
                    <div class="flex flex-wrap items-center gap-6 text-sm">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-blue-600 text-[18px]">schedule</span>
                        <span class="text-slate-500 font-medium">Shift:</span>
                        <span class="font-bold text-slate-900 dark:text-white capitalize badge bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{{ byDate[index].orders[0].storeShift.shiftType || 'N/A' }}</span>
                      </div>
                      <div v-if="byDate[index].orders[0].storeShift.opener" class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-blue-600 text-[18px]">person</span>
                        <span class="text-slate-500 font-medium">Dibuka oleh:</span>
                        <span class="font-bold text-slate-900 dark:text-white">{{ byDate[index].orders[0].storeShift.opener.name || 'N/A' }}</span>
                      </div>
                      <div v-if="byDate[index].orders[0].storeShift.openedAt" class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-blue-600 text-[18px]">calendar_today</span>
                        <span class="text-slate-500 font-medium">Waktu Buka:</span>
                        <span class="font-bold text-slate-900 dark:text-white">{{ formatDateTime(byDate[index].orders[0].storeShift.openedAt) }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <!-- Product Details Row -->
                <tr
                  v-if="showProductDetails && reportType === 'sales' && (authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN') && productDetails[index]"
                  class="bg-slate-50/80 dark:bg-slate-900/80 animate-fade-in"
                >
                  <td :colspan="reportHeaders.length" class="px-6 py-6 ring-1 ring-inset ring-slate-100 dark:ring-slate-700">
                    <div class="space-y-4">
                      <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-blue-500 text-[18px]">inventory_2</span>
                        Detail Produk Terjual:
                      </h4>
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <div
                          v-for="product in productDetails[index]"
                          :key="product.id"
                          class="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1"
                          @click="showProductDetailModal(product)"
                        >
                          <div class="flex justify-between items-start mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                            <span class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1" :title="product.name">{{ product.name }}</span>
                            <span class="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg">x{{ product.quantity }}</span>
                          </div>
                          <div class="space-y-1.5 text-xs font-medium">
                            <div class="flex justify-between">
                              <span class="text-slate-500">Harga Jual:</span>
                              <span class="font-bold text-slate-900 dark:text-white">{{ formatCurrency(product.sellingPrice) }}</span>
                            </div>
                            <div v-if="product.cost && product.cost > 0" class="flex justify-between">
                              <span class="text-slate-500">Modal:</span>
                              <span class="font-bold text-red-500">{{ formatCurrency(product.cost) }}</span>
                            </div>
                            <div v-if="product.cost && product.cost > 0" class="flex justify-between">
                              <span class="text-slate-500">Untung:</span>
                              <span class="font-bold text-blue-600">{{ formatCurrency(product.profit) }}</span>
                            </div>
                            <div v-if="product.cost && product.cost > 0" class="flex justify-between pt-2 mt-1 border-t border-slate-100 dark:border-slate-700/50">
                              <span class="text-slate-500">Margin:</span>
                              <span class="font-black text-blue-600">{{ formatProductMargin(product.sellingPrice, product.cost, product.profit) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Product Detail Modal -->
      <div
        v-if="selectedProductDetail"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        @click.self="selectedProductDetail = null"
      >
        <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-scale-in border border-white/20">
          <div class="flex justify-between items-start mb-6">
             <div class="flex items-center gap-3">
                 <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                    <span class="material-symbols-outlined text-[24px]">shopping_bag</span>
                  </div>
                <div>
                   <h3 class="text-lg font-black text-slate-900 dark:text-white leading-tight">{{ selectedProductDetail.name }}</h3>
                   <span class="text-xs text-slate-500 font-medium">Detail Transaksi Produk</span>
                </div>
            </div>
            <button
              @click="selectedProductDetail = null"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-slate-600"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jumlah Terjual</p>
                <p class="text-xl font-black text-slate-900 dark:text-white">{{ selectedProductDetail.quantity }} unit</p>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                 <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Harga Satuan</p>
                 <p class="text-xl font-black text-blue-600">{{ formatCurrency(selectedProductDetail.sellingPrice / selectedProductDetail.quantity) }}</p>
              </div>
            </div>

            <div class="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Pendapatan</p>
              <p class="text-3xl font-black text-slate-900 dark:text-white">{{ formatCurrency(selectedProductDetail.sellingPrice) }}</p>
            </div>

            <div
              v-if="selectedProductDetail.cost && selectedProductDetail.cost > 0"
              class="border-t-2 border-dashed border-slate-200 dark:border-slate-700 pt-4 space-y-3"
            >
              <div class="grid grid-cols-2 gap-3">
                  <div class="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                    <p class="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Total Modal</p>
                    <p class="text-lg font-bold text-red-600">{{ formatCurrency(selectedProductDetail.cost) }}</p>
                  </div>
                  <div class="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <p class="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Total Untung</p>
                    <p class="text-lg font-bold text-blue-600">{{ formatCurrency(selectedProductDetail.profit) }}</p>
                  </div>
              </div>
              
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                <span class="text-sm font-bold text-blue-700 dark:text-blue-400">Margin Keuntungan</span>
                <span class="text-2xl font-black text-blue-600">
                  {{ formatProductMargin(
                    selectedProductDetail.sellingPrice,
                    selectedProductDetail.cost,
                    selectedProductDetail.profit
                  ) }}
                </span>
              </div>
            </div>
            
            <div
              v-else
              class="border-t border-slate-200 dark:border-slate-700 pt-4"
            >
              <div class="flex flex-col items-center justify-center p-4 text-center bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                 <span class="material-symbols-outlined text-slate-300 mb-1">money_off</span>
                 <p class="text-xs text-slate-500 italic">Data modal tidak tersedia untuk produk ini</p>
              </div>
            </div>
            
             <button
              @click="selectedProductDetail = null"
              class="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-bold transition-colors text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Reports Permission Check -->
    <div v-else-if="canViewReports || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4 animate-bounce">bar_chart</span>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white">Menyiapkan Laporan</h3>
      <p class="text-slate-500 font-medium mt-1">Silakan pilih parameter laporan di atas...</p>
    </div>

    <!-- Access Denied -->
    <div v-else class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
        <span class="material-symbols-outlined text-[48px] text-red-500">lock</span>
      </div>
      <p class="text-xl font-black text-slate-900 dark:text-white">Akses Ditolak</p>
      <p class="text-slate-500 text-sm mt-2 font-medium">Anda tidak memiliki izin untuk melihat laporan ini.</p>
    </div>

    <!-- Export Modal -->
    <ReportExportModal
      :show="showExportModal"
      :report-type="reportType"
      :default-period="period"
      :report-data="reportData"
      :analytics-data="analyticsData"
      @close="showExportModal = false"
      @exported="loadReport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelector from '../../components/TenantSelector.vue';
import StoreSelector from '../../components/StoreSelector.vue';
import ReportExportModal from '../../components/ReportExportModal.vue';
import { getPeriodLabel } from '../../utils/export';
import { useNotification } from '../../composables/useNotification';
import { usePermissions } from '../../composables/usePermissions';
import { safeMap } from '../../utils/array-helpers';

const authStore = useAuthStore();
const { error: showError } = useNotification();
const { canViewReports, canExportReports } = usePermissions();

const needsTenantSelection = computed(() => {
  return authStore.isSuperAdmin && !authStore.selectedTenantId;
});

const byDate = computed(() => {
  if (!reportData.value || !Array.isArray(reportData.value.byDate)) {
    return [];
  }
  return reportData.value.byDate;
});

const loading = ref(false);
const reportData = ref<any>(null);
const analyticsData = ref<any>(null);
const reportType = ref('sales');
const period = ref('monthly');
const showExportModal = ref(false);
const reportViewType = ref('full');
const showProductDetails = ref(false);
const selectedProductDetail = ref<any>(null);
const productDetails = ref<Record<number, any[]>>({});
const isLoadingReport = ref(false);
const showAdvancedOptions = ref(false);

const marginDisplayFormat = ref<'percentage' | 'amount'>(
  (localStorage.getItem('marginDisplayFormat') as 'percentage' | 'amount') || 'percentage'
);

const now = new Date();
const twoWeeksBack = new Date(now);
twoWeeksBack.setDate(now.getDate() - 14);
const twoWeeksForward = new Date(now);
twoWeeksForward.setDate(now.getDate() + 14);

const dateRange = ref({
  from: twoWeeksBack.toISOString().split('T')[0],
  to: twoWeeksForward.toISOString().split('T')[0],
});

const setPeriod = (p: string) => {
  period.value = p;
  handlePeriodChange();
};

let loadReportTimeout: ReturnType<typeof setTimeout> | null = null;
let loadAnalyticsTimeout: ReturnType<typeof setTimeout> | null = null;

const handleReportTypeChange = () => {
  if (loadReportTimeout) clearTimeout(loadReportTimeout);
  loadReport(); // Immediate load for faster UX
};

const handleReportViewTypeChange = () => {
  if (loadReportTimeout) clearTimeout(loadReportTimeout);
  loadReport();
};

const handlePeriodChange = () => {
  if (loadReportTimeout) clearTimeout(loadReportTimeout);
  loadReport();
};

const handleDateRangeChange = () => {
  if (loadReportTimeout) clearTimeout(loadReportTimeout);
  loadReport();
};

const summaryStats = computed(() => {
  if (!reportData.value) return [];
  
  switch (reportType.value) {
    case 'sales':
      return [
        { label: 'Total Pendapatan', value: formatCurrency(reportData.value.summary?.totalRevenue || 0), icon: '💰', color: 'text-blue-600' },
        { label: 'Total Pesanan', value: reportData.value.summary?.totalOrders || 0, icon: '📦', color: 'text-blue-600' },
        { label: 'Rata-rata / Pesanan', value: formatCurrency(reportData.value.summary?.averageOrderValue || 0), icon: '📊', color: 'text-purple-600' },
        { label: 'Item Terjual', value: reportData.value.summary?.totalItems || 0, icon: '🛒', color: 'text-orange-600' },
      ];
    case 'financial':
      return [
        { label: 'Pendapatan', value: formatCurrency(reportData.value.revenue || 0), icon: '💵', color: 'text-blue-600' },
        { label: 'Total Modal', value: formatCurrency(reportData.value.costOfGoods || 0), icon: '💸', color: 'text-red-600' },
        { label: 'Keuntungan Kotor', value: formatCurrency(reportData.value.grossProfit || 0), icon: '📈', color: 'text-blue-600' },
        { label: 'Margin Keuntungan', value: `${reportData.value.profitMargin?.toFixed(2) || 0}%`, icon: '📊', color: 'text-purple-600' },
      ];
    default:
      return [];
  }
});

const reportHeaders = computed(() => {
  switch (reportType.value) {
    case 'sales':
      return ['Tanggal', 'Total Pendapatan', 'Transaksi', 'Rata-rata Transaksi'];
    case 'financial':
      return ['Tanggal', 'Pendapatan', 'Total Modal', 'Keuntungan Kotor', 'Margin Keuntungan'];
    default:
      return [];
  }
});

const reportRows = computed(() => {
  if (!reportData.value) return [];
  
  const byDateData = Array.isArray(reportData.value?.byDate) 
    ? reportData.value.byDate 
    : [];
  
  switch (reportType.value) {
    case 'sales':
      return safeMap(byDateData, (item: any, index: number) => {
        let revenue = item?.revenue || 0;
        let costOfGoods = 0;
        
        if (item?.products && Array.isArray(item.products)) {
          costOfGoods = item.products.reduce((sum: number, p: any) => sum + (p?.cost || 0), 0);
        } else if (item?.costOfGoods) {
          costOfGoods = item.costOfGoods;
        }
        
        if (reportViewType.value === 'revenue') {
          revenue = item?.revenue || 0;
        } else if (reportViewType.value === 'profit') {
          revenue = (item?.revenue || 0) - costOfGoods;
        } else {
          revenue = item?.revenue || 0;
        }
        
        if (item?.products && Array.isArray(item.products)) {
          productDetails.value[index] = item.products;
        }
        
        return [
          formatDate(item?.date),
          formatCurrency(revenue),
          item?.count || 0,
          formatCurrency(revenue / (item?.count || 1)),
        ];
      });
    case 'financial':
      if (byDateData && byDateData.length > 0) {
        return safeMap(byDateData, (item: any) => {
          let revenue = item?.revenue || reportData.value?.revenue || 0;
          let costOfGoods = item?.costOfGoods || reportData.value?.costOfGoods || 0;
          let grossProfit = item?.grossProfit || reportData.value?.grossProfit || 0;
          
          if (reportViewType.value === 'revenue') {
            costOfGoods = 0;
            grossProfit = revenue;
          } else if (reportViewType.value === 'profit') {
            revenue = grossProfit;
            costOfGoods = 0;
          }
          
          return [
            formatDate(item?.date),
            formatCurrency(revenue),
            formatCurrency(costOfGoods),
            formatCurrency(grossProfit),
            `${(item?.profitMargin || reportData.value?.profitMargin || 0).toFixed(2)}%`,
          ];
        });
      } else {
        let revenue = reportData.value.revenue || 0;
        let costOfGoods = reportData.value.costOfGoods || 0;
        let grossProfit = reportData.value.grossProfit || 0;
        
        if (reportViewType.value === 'revenue') {
          costOfGoods = 0;
          grossProfit = revenue;
        } else if (reportViewType.value === 'profit') {
          revenue = grossProfit;
          costOfGoods = 0;
        }
        
        return [[
          'Total',
          formatCurrency(revenue),
          formatCurrency(costOfGoods),
          formatCurrency(grossProfit),
          `${(reportData.value.profitMargin || 0).toFixed(2)}%`,
        ]];
      }
    default:
      return [];
  }
});

const formatProductMargin = (sellingPrice: number, cost: number, profit: number): string => {
  if (marginDisplayFormat.value === 'amount') {
    return formatCurrency(profit);
  } else {
    const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(2) : '0.00';
    return `${margin}%`;
  }
};

const saveMarginFormat = () => {
  localStorage.setItem('marginDisplayFormat', marginDisplayFormat.value);
};

const showProductDetailModal = (product: any) => {
  selectedProductDetail.value = product;
};

const loadReport = async () => {
  if (needsTenantSelection.value) return;
  
  if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
    console.error('Tenant ID not available');
    await showError('Tenant ID tidak tersedia. Silakan login kembali.');
    return;
  }
  
  loading.value = true;
  productDetails.value = {};
  try {
    const params: any = {
      reportType: reportType.value,
      period: period.value,
      includeProducts: (authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN') ? 'true' : 'false',
    };
    
    if (period.value !== 'all') {
      params.startDate = dateRange.value.from;
      params.endDate = dateRange.value.to;
    }
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }

    const reportResponse = await api.get('/reports/tenant', { params }).catch(() => ({ data: null }));
    reportData.value = reportResponse.data;
    
    if (reportData.value?.byDate && Array.isArray(reportData.value.byDate)) {
      reportData.value.byDate.forEach((item: any) => {
        if (item.orders && Array.isArray(item.orders)) {
          const productsList: any[] = [];
          item.orders.forEach((order: any) => {
            if (order.storeShift && !item.storeShift) {
              item.storeShift = order.storeShift;
            }
            
            if (order.items && Array.isArray(order.items)) {
              order.items.forEach((orderItem: any) => {
                const productId = orderItem.productId || orderItem.product?.id;
                const productName = orderItem.product?.name || 'Unknown';
                const price = Number(orderItem.price || 0);
                const quantity = Number(orderItem.quantity || 0);
                const cost = Number(orderItem.cost || orderItem.product?.cost || 0);
                
                const sellingPrice = price * quantity;
                const totalCost = cost * quantity;
                const profit = sellingPrice - totalCost;
                const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(2) : '0.00';
                
                productsList.push({
                  id: `${productId}-${order.id}-${orderItem.id || Date.now()}`,
                  productId,
                  name: productName,
                  quantity,
                  sellingPrice,
                  cost: totalCost,
                  profit,
                  margin,
                  orderId: order.id,
                });
              });
            }
          });
          item.products = productsList;
        }
      });
    }
    
    if (!reportData.value?.byDate && reportData.value?.orders && Array.isArray(reportData.value.orders)) {
      const ordersByDate: Record<string, any> = {};
      reportData.value.orders.forEach((order: any) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (!ordersByDate[orderDate]) {
          ordersByDate[orderDate] = {
            date: orderDate,
            revenue: 0,
            count: 0,
            orders: [],
          };
        }
        ordersByDate[orderDate].revenue += Number(order.total || 0);
        ordersByDate[orderDate].count += 1;
        ordersByDate[orderDate].orders.push(order);
      });
      
      reportData.value.byDate = Object.values(ordersByDate).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
  } catch (error: any) {
    console.error('Error loading report:', error);
    if (error.response?.status !== 401 && error.response?.status !== 403) {
      await showError('Gagal memuat laporan');
    }
  } finally {
    loading.value = false;
    isLoadingReport.value = false;
  }
};

const loadAnalytics = async () => {
  if (needsTenantSelection.value) return;
  
  try {
    const params: any = { limit: 10 };
    
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const [predictionsRes, topProductsRes] = await Promise.all([
      api.get('/analytics/predictions', { params: authStore.isSuperAdmin && authStore.selectedTenantId ? { tenantId: authStore.selectedTenantId } : {} }).catch(() => ({ data: null })),
      api.get('/analytics/top-products', { params }).catch(() => ({ data: [] })),
    ]);
    
    analyticsData.value = {
      predictions: predictionsRes.data,
      topProducts: topProductsRes.data || [],
    };
  } catch (error: any) {
    console.error('Error loading analytics:', error);
    analyticsData.value = null;
  }
};

const handleTenantChange = (tenantId: string | null) => {
  if (tenantId) {
    if (loadReportTimeout) clearTimeout(loadReportTimeout);
    if (loadAnalyticsTimeout) clearTimeout(loadAnalyticsTimeout);
    
    loadReportTimeout = setTimeout(() => {
      loadReport();
    }, 300);
    
    loadAnalyticsTimeout = setTimeout(() => {
      loadAnalytics();
    }, 500);
  }
};

const handleStoreChange = () => {
  if (loadReportTimeout) clearTimeout(loadReportTimeout);
  if (loadAnalyticsTimeout) clearTimeout(loadAnalyticsTimeout);
  
  loadReportTimeout = setTimeout(() => {
    loadReport();
  }, 300);
  
  loadAnalyticsTimeout = setTimeout(() => {
    loadAnalytics();
  }, 500);
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  if (!isLoadingReport.value && !needsTenantSelection.value) {
    loadReport();
    loadAnalytics();
  }
});
</script>

<style scoped>
/* Scoped styles if necessary */
</style>
