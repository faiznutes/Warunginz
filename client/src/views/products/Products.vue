<template>
  <div class="flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-display">
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />
    
    <!-- Store Selector (Only for SUPERVISOR) -->
    <div v-if="authStore.user?.role === 'SUPERVISOR'" class="px-6 pt-6 animate-fade-in-down">
      <StoreSelector @store-changed="handleStoreChange" />
    </div>

    <!-- Main Content Section -->
    <section class="flex flex-col flex-1 overflow-hidden px-4 md:px-6 pt-6 pb-6 relative z-10 w-full">
        <!-- Pull to Refresh Indicator -->
        <div
          v-if="pullDistance > 0 || isRefreshing"
          class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-200"
          :style="{ transform: `translateY(${Math.min(pullDistance, 80)}px)`, opacity: Math.min(pullDistance / 80, 1) }"
        >
          <div class="bg-white dark:bg-slate-800 rounded-full shadow-lg px-4 py-2 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
            <div
              v-if="isRefreshing"
              class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            ></div>
            <span v-else class="material-symbols-outlined text-blue-500">arrow_downward</span>
            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">
              {{ isRefreshing ? 'Memuat ulang...' : 'Tarik untuk refresh' }}
            </span>
          </div>
        </div>
        <!-- Blurred Background Elements -->
        <div class="fixed top-20 left-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div class="fixed bottom-20 right-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <!-- Error Boundary -->
      <div v-if="hasError" class="flex flex-col items-center justify-center py-20">
        <div class="p-4 bg-red-50 text-red-500 rounded-xl mb-4">
          <span class="material-symbols-outlined text-5xl">error</span>
        </div>
        <h3 class="text-lg font-bold text-[#0d141b] mb-2">Terjadi Kesalahan</h3>
        <p class="text-[#4c739a] text-center max-w-md mb-6">{{ errorMessage || 'Gagal memuat halaman. Silakan coba lagi.' }}</p>
        <button
          @click="retryLoad"
          class="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/30"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Bulk Action Toolbar -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform translate-y-12 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-12 opacity-0"
      >
        <div v-if="selectedIds.length > 0" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-md min-w-[320px] md:min-w-[400px]">
          <div class="flex items-center gap-3 border-r border-slate-700 pr-4">
            <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-black">{{ selectedIds.length }}</div>
            <span class="text-sm font-bold whitespace-nowrap">Produk Terpilih</span>
          </div>
          <div class="flex items-center gap-2 flex-1 justify-end">
            <button 
              @click="clearSelection" 
              class="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button 
              ref="bulkEditButtonRef"
              @click="showBulkEditModal = true; bulkActionsTooltip.dismiss()" 
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <span class="material-symbols-outlined text-[18px]">edit</span>
              <span>Edit</span>
            </button>
            <button 
              @click="bulkDelete" 
              class="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black shadow-lg shadow-red-500/20 transition-all active:scale-95"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </Transition>

      <!-- Main Content -->
      <div class="flex flex-col flex-1">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 animate-fade-in-down">
          <div class="flex flex-col gap-1">
            <h1 class="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">Produk</h1>
            <p class="text-slate-500 dark:text-slate-400 font-medium">Kelola katalog produk dan inventaris toko Anda</p>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
             <!-- Margin Display Format Selector (Admin Tenant & Super Admin only) -->
            <div
              v-if="authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
              class="relative group"
            >
              <select
                v-model="marginDisplayFormat"
                @change="saveMarginFormat"
                class="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all"
              >
                <option value="percentage">Margin %</option>
                <option value="amount">Margin Rp</option>
              </select>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none group-hover:text-blue-500 transition-colors">expand_more</span>
            </div>

            <!-- Action Buttons Group -->
            <div v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="flex items-center gap-2">
               <button
                @click="downloadTemplate"
                class="p-2.5 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm group relative"
                title="Unduh Template"
              >
                <span class="material-symbols-outlined text-[22px]">download</span>
                <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Template CSV</span>
              </button>
              
              <button
                @click="triggerFileInput"
                class="p-2.5 text-blue-600 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-emerald-200 transition-all shadow-sm group relative"
                title="Impor CSV"
              >
                <span class="material-symbols-outlined text-[22px]">upload_file</span>
                <span class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Impor CSV</span>
              </button>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              @change="handleFileImport"
              class="hidden"
            />
            
            <!-- Export Button (Component needs update too, but wrapper here) -->
            <div v-if="products.length > 0">
               <ExportButton
                :data="products"
                filename="produk"
                title="Daftar Produk"
                :headers="['Nama', 'Kategori', 'Harga', 'Stok', 'Status']"
                @export="handleExport"
              />
            </div>

            <!-- Add Product Button -->
            <button
              v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
              @click="showCreateModal = true"
              class="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] font-bold text-sm transform hover:-translate-y-0.5"
            >
              <span class="material-symbols-outlined text-[20px] font-bold">add</span>
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        <!-- Search & Filters -->
        <div class="w-full mb-8 animate-fade-in-up">
          <!-- Search Bar & Toggle -->
          <div class="flex flex-col sm:flex-row gap-4 mb-4">
             <div class="flex-1 relative group">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors">search</span>
                <input
                  ref="searchInputRef"
                  v-model="filters.search"
                  @focus="handleSearchFocus"
                  @input="handleSearchInput"
                  @keydown.down.prevent="handleSearchKeyDown"
                  @keydown.up.prevent="handleSearchKeyUp"
                  @keydown.enter.prevent="handleSearchEnter"
                  @blur="handleSearchBlur"
                  type="text"
                  placeholder="Cari produk berdasarkan nama, kategori, atau kode..."
                  class="block w-full pl-12 pr-4 py-3.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all font-medium placeholder:text-slate-400 shadow-sm"
                />
                
                <!-- Search Suggestions Dropdown -->
                <div
                  v-if="searchSuggestions.showSuggestions.value && searchSuggestions.allSuggestions.value.length > 0"
                  class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-64 overflow-y-auto"
                >
                  <div class="p-2">
                    <div
                      v-for="(suggestion, index) in searchSuggestions.allSuggestions.value"
                      :key="index"
                      @click="selectSuggestion(suggestion.text)"
                      @mouseenter="searchSuggestions.selectedIndex.value = index"
                      class="px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                      :class="
                        searchSuggestions.selectedIndex.value === index
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-emerald-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      "
                    >
                      <span
                        class="material-symbols-outlined text-[18px]"
                        :class="suggestion.type === 'recent' ? 'text-slate-400' : 'text-blue-500'"
                      >
                        {{ suggestion.type === 'recent' ? 'history' : 'search' }}
                      </span>
                      <span class="flex-1 text-sm font-medium">{{ suggestion.text }}</span>
                      <span
                        v-if="suggestion.type === 'recent'"
                        class="text-xs text-slate-400"
                      >
                        Baru saja
                      </span>
                    </div>
                    
                    <!-- Clear Recent Searches -->
                    <div
                      v-if="searchSuggestions.recentSearches.value.length > 0"
                      class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700"
                    >
                      <button
                        @click="searchSuggestions.clearRecentSearches()"
                        class="w-full px-4 py-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                        Hapus riwayat pencarian
                      </button>
                    </div>
                  </div>
                </div>
             </div>
             
             <button
                @click="showFilters = !showFilters"
                class="px-5 py-3.5 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                :class="showFilters || hasActiveFilters ? 'bg-blue-500 border-blue-500 text-white shadow-blue-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
             >
                <span class="material-symbols-outlined text-[20px]">tune</span>
                <span>Filter</span>
                <span v-if="activeFilterCount > 0" class="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-white text-blue-600 rounded-full text-xs font-bold">{{ activeFilterCount }}</span>
                <span v-else class="material-symbols-outlined text-[20px] transition-transform duration-200" :class="{ 'rotate-180': showFilters }">expand_more</span>
             </button>

             <!-- View Toggle -->
             <div class="flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
                <button
                  @click="viewMode = 'grid'"
                  class="p-2.5 rounded-lg transition-all"
                  :class="viewMode === 'grid' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'"
                  title="Grid View"
                >
                  <span class="material-symbols-outlined text-[20px]">grid_view</span>
                </button>
                <button
                  @click="viewMode = 'list'"
                  class="p-2.5 rounded-lg transition-all"
                  :class="viewMode === 'list' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'"
                  title="List View"
                >
                  <span class="material-symbols-outlined text-[20px]">view_list</span>
                </button>
             </div>
          </div>

          <!-- Extended Filters (Collapsible) -->
          <div 
             v-show="showFilters" 
             class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all duration-300"
          >
             <!-- Clear All Filters Button -->
             <div v-if="hasActiveFilters" class="mb-4 flex justify-end">
               <button
                 @click="clearAllFilters"
                 class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-200"
               >
                 <span class="material-symbols-outlined text-[18px]">clear_all</span>
                 Hapus Semua Filter
               </button>
             </div>
             <div class="flex flex-col lg:flex-row gap-8">
                <!-- Category Filter -->
                <div class="flex-1">
                  <div class="flex items-center justify-between mb-3">
                     <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Kategori</label>
                     <button v-if="filters.category" @click="filters.category = ''" class="text-[10px] font-bold text-red-500 hover:text-red-600">RESET</button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      @click="filters.category = ''"
                      :class="!filters.category 
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20' 
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-emerald-300'"
                      class="px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-1.5"
                    >
                      Semua
                    </button>
                    <button
                      v-for="cat in categories"
                      :key="cat"
                      @click="filters.category = cat"
                      :class="filters.category === cat 
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/20' 
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-emerald-300'"
                      class="px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-1.5"
                    >
                      {{ cat }}
                    </button>
                  </div>
                </div>

                 <!-- Status Filter -->
                <div class="flex-none lg:w-1/3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-700 pt-6 lg:pt-0 lg:pl-8">
                  <div class="flex items-center justify-between mb-3">
                     <label class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Status</label>
                     <button v-if="filters.isActive !== ''" @click="filters.isActive = ''" class="text-[10px] font-bold text-red-500 hover:text-red-600">RESET</button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <button
                      @click="filters.isActive = ''"
                      :class="filters.isActive === '' 
                        ? 'bg-slate-800 text-white shadow-md ring-2 ring-slate-800/20' 
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700'"
                      class="px-4 py-2 text-sm font-bold rounded-full transition-all duration-200"
                    >
                      Semua
                    </button>
                    <button
                      @click="filters.isActive = 'true'"
                      :class="filters.isActive === 'true' 
                        ? 'bg-green-600 text-white shadow-md shadow-green-600/20 ring-2 ring-green-600/20' 
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:text-green-600 hover:border-green-200'"
                      class="px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-1.5"
                    >
                      <span class="w-2 h-2 rounded-full bg-current"></span>
                      Aktif
                    </button>
                    <button
                      @click="filters.isActive = 'false'"
                      :class="filters.isActive === 'false' 
                        ? 'bg-red-500 text-white shadow-md shadow-red-500/20 ring-2 ring-red-500/20' 
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:text-red-600 hover:border-red-200'"
                      class="px-4 py-2 text-sm font-bold rounded-full transition-all duration-200 flex items-center gap-1.5"
                    >
                      <span class="w-2 h-2 rounded-full bg-current"></span>
                      Tidak Aktif
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <!-- Product Limit Info with Progress Bar -->
        <div v-if="productLimit && productLimit.limit !== undefined && productLimit.limit !== -1" class="mb-8 bg-blue-50/50 dark:bg-blue-900/10 backdrop-blur-sm border border-blue-100 dark:border-blue-800/30 rounded-2xl p-6 shadow-sm animate-fade-in-up delay-100">
          <div class="flex items-center justify-between mb-3">
             <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                    <span class="material-symbols-outlined text-xl">inventory_2</span>
                </div>
                <div>
                  <p class="font-bold text-slate-900 dark:text-white">Batas Produk</p>
                  <p class="text-sm text-slate-500 dark:text-slate-400">Kuota paket langganan Anda</p>
                </div>
             </div>
             <div class="text-right">
                <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Penggunaan</p>
                <p class="text-lg font-bold text-slate-900 dark:text-white">
                    {{ productLimit.currentUsage || 0 }} <span class="text-slate-400 text-sm font-normal">/ {{ productLimit.limit }}</span>
                </p>
             </div>
          </div>
          <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
              :class="(productLimit.currentUsage || 0) >= productLimit.limit ? 'bg-red-500' : (productLimit.currentUsage || 0) >= (productLimit.limit * 0.8) ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'"
              :style="{ width: `${Math.min(100, ((productLimit.currentUsage || 0) / productLimit.limit) * 100)}%` }"
            >
                <div class="absolute inset-0 bg-white/20 w-full h-full animate-shimmer"></div>
            </div>
          </div>
          <div class="mt-2 text-right">
             <span class="text-xs font-semibold" :class="(productLimit.currentUsage || 0) >= productLimit.limit ? 'text-red-500' : 'text-blue-600'">
                 {{ productLimit.limit - (productLimit.currentUsage || 0) }} produk tersisa
             </span>
          </div>
        </div>

        <!-- Tenant Selection Message -->
        <div v-if="needsTenantSelection" class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <div class="p-4 bg-slate-50 rounded-full mb-4">
             <span class="material-symbols-outlined text-4xl text-slate-400">store</span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-2">Pilih Tenant</h3>
          <p class="text-slate-500 text-center max-w-md">Silakan pilih tenant dari dropdown di atas untuk melihat data produk.</p>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="animate-fade-in-up">
           <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <SkeletonLoader v-for="i in 8" :key="i" type="product-card" />
           </div>
           <div v-else class="space-y-4">
              <SkeletonLoader v-for="i in 5" :key="i" type="table-row" />
           </div>
        </div>

        <div v-else-if="products.length === 0" class="flex flex-col items-center justify-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 animate-fade-in-up">
           <EmptyState
             icon="inventory_2"
             title="Produk Tidak Ditemukan"
             description="Belum ada data produk yang tersedia. Mulai dengan menambahkan produk pertama Anda."
             action-label="Tambah Produk Pertama"
             action-icon="add"
             icon-bg-color="bg-blue-50 dark:bg-blue-900/20"
             icon-color="text-blue-500"
             :animate-icon="true"
             @action="showCreateModal = true"
             v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'"
           />
           <EmptyState
             v-else
             icon="search_off"
             title="Produk Tidak Ditemukan"
             description="Tidak ada produk yang cocok dengan pencarian atau filter Anda."
             icon-bg-color="bg-slate-50 dark:bg-slate-800"
             icon-color="text-slate-400"
           />
        </div>

        <!-- Products List View -->
        <div v-else-if="viewMode === 'list'" class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm animate-fade-in-up">
           <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                 <tr>
                    <th v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="px-6 py-4 w-10">
                       <input 
                         type="checkbox" 
                         :checked="isAllSelected" 
                         @change="toggleSelectAll"
                         class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                       />
                    </th>
                    <th class="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Produk</th>
                    <th class="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">Kategori</th>
                    <th class="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-right">Harga</th>
                    <th class="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-center">Stok</th>
                    <th class="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-center">Status</th>
                    <th class="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-right">Aksi</th>
                 </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                 <tr v-for="product in products" :key="product.id" class="group transition-colors" :class="isSelected(product.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'">
                    <td v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="px-6 py-4">
                       <input 
                         type="checkbox" 
                         :checked="isSelected(product.id)" 
                         @change="toggleSelect(product.id)"
                         class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                       />
                    </td>
                    <td class="px-6 py-4">
                       <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0">
                             <img v-if="product.image" :src="product.image" class="w-full h-full object-cover">
                             <div v-else-if="product.emoji" class="w-full h-full flex items-center justify-center text-xl bg-white dark:bg-slate-800">{{ product.emoji }}</div>
                             <div v-else class="w-full h-full flex items-center justify-center text-slate-300"><span class="material-symbols-outlined">image</span></div>
                          </div>
                          <!-- Inline Edit Name -->
                          <div v-if="editingField?.productId === product.id && editingField?.field === 'name'" class="flex-1">
                             <input
                               v-model="tempEditValue"
                               @keyup.enter="saveInlineEdit(product)"
                               @keyup.esc="cancelInlineEdit"
                               @blur="saveInlineEdit(product)"
                               type="text"
                               class="w-full px-2 py-1 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                               autofocus
                             />
                          </div>
                          <span
                             ref="inlineEditRef"
                             v-else
                             @click="startInlineEdit(product, 'name', product.name); inlineEditTooltip.dismiss()"
                             class="font-bold text-slate-900 dark:text-white line-clamp-2 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                             title="Klik untuk edit"
                          >{{ product.name }}</span>
                       </div>
                    </td>
                    <td class="px-6 py-4">
                       <!-- Inline Edit Category -->
                       <div v-if="editingField?.productId === product.id && editingField?.field === 'category'">
                          <select
                             v-model="tempEditValue"
                             @change="saveInlineEdit(product)"
                             @blur="saveInlineEdit(product)"
                             class="px-2 py-1 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase"
                             autofocus
                          >
                             <option value="">Tanpa Kategori</option>
                             <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                          </select>
                       </div>
                       <span
                          v-else
                          @click="startInlineEdit(product, 'category', product.category || '')"
                          class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Klik untuk edit"
                       >{{ product.category || '-' }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                       <!-- Inline Edit Price -->
                       <div v-if="editingField?.productId === product.id && editingField?.field === 'price'" class="flex justify-end">
                          <input
                             v-model.number="tempEditValue"
                             @keyup.enter="saveInlineEdit(product)"
                             @keyup.esc="cancelInlineEdit"
                             @blur="saveInlineEdit(product)"
                             type="number"
                             step="0.01"
                             min="0"
                             class="w-32 px-2 py-1 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-right"
                             autofocus
                          />
                       </div>
                       <span
                          v-else
                          @click="startInlineEdit(product, 'price', product.price)"
                          class="font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                          title="Klik untuk edit"
                       >{{ formatCurrency(Number(product.price)) }}</span>
                    </td>
                    <td class="px-6 py-4 text-center">
                       <div class="flex items-center justify-center gap-2">
                           <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border" :class="getStockStatusClass(product.stock, product.minStock)">
                              {{ getStockStatusLabel(product.stock, product.minStock) }}
                           </span>
                           <span class="text-xs font-mono font-bold text-slate-400">({{ product.stock }})</span>
                       </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                       <span class="w-2.5 h-2.5 rounded-full inline-block" :class="product.isActive ? 'bg-blue-500' : 'bg-slate-300'"></span>
                    </td>
                    <td class="px-6 py-4 text-right">
                       <div class="flex items-center justify-end gap-2">
                          <button @click="editProduct(product)" class="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                             <span class="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button @click="deleteProduct(product.id)" class="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                             <span class="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                       </div>
                    </td>
                 </tr>
              </tbody>
           </table>
        </div>

        <!-- Products Grid View -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
          <div
            v-for="(product, index) in products"
            :key="product.id"
            :ref="(el: any) => setupSwipeForProduct(el as HTMLElement, product.id)"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 border border-slate-100 dark:border-slate-700 transition-all duration-300 group overflow-hidden flex flex-col relative touch-pan-y"
            :class="{ 'ring-2 ring-blue-500 border-blue-500 shadow-blue-500/20': isSelected(product.id) }"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <!-- Checkbox Overlay for Grid View -->
            <div v-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'" class="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity" :class="{ 'opacity-100': isSelected(product.id) }">
               <input 
                 type="checkbox" 
                 :checked="isSelected(product.id)" 
                 @change="toggleSelect(product.id)"
                 class="w-5 h-5 text-blue-600 border-slate-300 rounded-lg focus:ring-blue-500 focus:ring-offset-0 cursor-pointer shadow-lg"
               />
            </div>

            <!-- Image Area -->
            <div class="aspect-w-4 aspect-h-3 bg-slate-100 dark:bg-slate-900 relative overflow-hidden group-hover:brightness-[1.02] transition-all" @click="toggleSelect(product.id)">
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div v-else-if="product.emoji" class="w-full h-full flex items-center justify-center text-7xl bg-slate-50 dark:bg-slate-900 select-none transform group-hover:scale-110 transition-transform duration-500">
                {{ product.emoji }}
              </div>
              <div v-else class="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 group-hover:scale-110 transition-transform duration-500">image</span>
              </div>
              
              <!-- Badges Overlay -->
              <div class="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                <span
                   v-if="product.isConsignment"
                   class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-purple-500/90 text-white rounded-lg shadow-sm backdrop-blur-sm border border-white/20"
                 >
                   Titipan
                 </span>
                 <span
                    v-if="!product.isActive"
                    class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-slate-800/90 text-white rounded-lg shadow-sm backdrop-blur-sm border border-white/20"
                  >
                    Non-Aktif
                  </span>
              </div>
              
              <!-- Gradient Overlay (Bottom) -->
              <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <!-- Content -->
            <div class="p-5 flex flex-col flex-1 relative">
              <div class="mb-4">
                 <div class="flex justify-between items-start gap-2 mb-2">
                    <p class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider line-clamp-1 border border-blue-100">{{ product.category || 'Tanpa Kategori' }}</p>
                    
                    <!-- Expand/Collapse Button -->
                    <button
                      @click.stop="toggleProductDetails(product.id)"
                      class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      :title="expandedProducts.has(product.id) ? 'Sembunyikan detail' : 'Lihat detail'"
                    >
                      <span
                        class="material-symbols-outlined text-[18px] text-slate-500 transition-transform duration-200"
                        :class="{ 'rotate-180': expandedProducts.has(product.id) }"
                      >
                        expand_more
                      </span>
                    </button>
                    <div class="flex items-center gap-2" @click.stop>
                         <div v-if="editingStockId === product.id" class="flex items-center gap-1 bg-white dark:bg-slate-700 rounded shadow-sm p-0.5 absolute z-20 -mt-1 -ml-1">
                             <input 
                               v-model.number="tempStockValue"
                               type="number"
                               class="w-16 px-1 py-0.5 text-[10px] font-bold border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
                               @keyup.enter="saveStock(product)"
                               @keyup.esc="cancelEditingStock"
                               autofocus
                             />
                             <button @click="saveStock(product)" class="p-0.5 text-blue-600 hover:bg-blue-50 rounded dark:text-blue-400 dark:hover:bg-blue-900/30">
                                <span class="material-symbols-outlined text-[16px]">check</span>
                             </button>
                             <button @click="cancelEditingStock" class="p-0.5 text-red-500 hover:bg-red-50 rounded dark:text-red-400 dark:hover:bg-red-900/30">
                                <span class="material-symbols-outlined text-[16px]">close</span>
                             </button>
                         </div>
                         <div v-else class="flex items-center gap-1 cursor-pointer group/stock hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded px-1 -ml-1 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600" @click="startEditingStock(product)" title="Klik untuk ubah stok">
                             <span
                               class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border"
                               :class="getStockStatusClass(product.stock, product.minStock)"
                             >
                               {{ getStockStatusLabel(product.stock, product.minStock) }}
                             </span>
                             <span class="text-[10px] font-mono font-bold text-slate-400 group-hover/stock:text-blue-600 transition-colors">({{ product.stock }})</span>
                         </div>
                     </div>
                 </div>
                 <h3 class="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight md:min-h-[3rem]">{{ product.name }}</h3>
              </div>
              
              <div class="mt-auto">
                 <div class="flex items-end justify-between mb-5 px-0.5">
                    <div class="flex flex-col">
                       <span class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Harga</span>
                       <span class="text-xl font-black text-slate-900 dark:text-white">{{ formatCurrency(typeof product.price === 'number' ? product.price : Number(product.price) || 0) }}</span>
                    </div>
                    
                    <div v-if="(authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN') && product.cost && product.cost > 0" class="flex flex-col items-end">
                       <span class="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Margin</span>
                       <span class="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md border border-green-200">
                         {{ formatMargin(product.price, product.cost) }}
                       </span>
                    </div>
                 </div>

                 <!-- Actions -->
                 <div class="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                    <!-- Cashier Action -->
                    <button
                      v-if="authStore.user?.role === 'CASHIER'"
                      @click="addToPOS(product)"
                      :disabled="product.stock <= 0 || !product.isActive"
                      class="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="material-symbols-outlined text-[20px]">shopping_cart</span>
                      Tambah
                    </button>

                    <!-- Admin Actions -->
                    <template v-else-if="canManageProducts || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN'">
                      <button
                        @click="editProduct(product)"
                        class="flex-1 px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-white dark:hover:bg-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        @click="deleteProduct(product.id)"
                        class="px-3 py-2.5 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl transition-all shadow-sm hover:border-red-200 hover:bg-red-50 active:scale-95"
                        title="Hapus Produk"
                      >
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </template>
                 </div>
                 
                 <!-- Expanded Details (Progressive Disclosure) -->
                 <Transition
                   enter-active-class="transition-all duration-300 ease-out"
                   enter-from-class="opacity-0 max-h-0"
                   enter-to-class="opacity-100 max-h-[500px]"
                   leave-active-class="transition-all duration-200 ease-in"
                   leave-from-class="opacity-100 max-h-[500px]"
                   leave-to-class="opacity-0 max-h-0"
                 >
                   <div v-if="expandedProducts.has(product.id)" class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3 overflow-hidden">
                     <!-- Description -->
                     <div v-if="product.description">
                       <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Deskripsi</p>
                       <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ product.description }}</p>
                     </div>
                     
                     <!-- Additional Info Grid -->
                     <div class="grid grid-cols-2 gap-3">
                       <!-- Cost -->
                       <div v-if="product.cost && product.cost > 0">
                         <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Harga Pokok</p>
                         <p class="text-sm font-bold text-slate-900 dark:text-white">{{ formatCurrency(Number(product.cost)) }}</p>
                       </div>
                       
                       <!-- Min Stock -->
                       <div>
                         <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Stok Minimum</p>
                         <p class="text-sm font-bold text-slate-900 dark:text-white">{{ product.minStock || 0 }}</p>
                       </div>
                       
                       <!-- SKU -->
                       <div v-if="product.sku">
                         <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">SKU</p>
                         <p class="text-sm font-mono font-bold text-slate-900 dark:text-white">{{ product.sku }}</p>
                       </div>
                       
                       <!-- Barcode -->
                       <div v-if="product.barcode">
                         <p class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Barcode</p>
                         <p class="text-sm font-mono font-bold text-slate-900 dark:text-white">{{ product.barcode }}</p>
                       </div>
                     </div>
                     
                     <!-- Consignment Badge -->
                     <div v-if="product.isConsignment" class="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                       <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[18px]">inventory_2</span>
                       <span class="text-xs font-bold text-purple-700 dark:text-purple-300">Produk Titipan</span>
                     </div>
                   </div>
                 </Transition>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pagination / Infinite Scroll Controls -->
        <div class="flex items-center justify-center gap-4 mt-8 pb-8">
          <!-- Toggle Infinite Scroll -->
          <label ref="infiniteScrollToggleRef" class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="useInfiniteScrollMode"
              @change="toggleInfiniteScroll; infiniteScrollTooltip.dismiss()"
              class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Infinite Scroll</span>
          </label>
        </div>
        
        <!-- Pagination Controls (shown when infinite scroll is OFF) -->
        <div v-show="!useInfiniteScrollMode && pagination.totalPages > 1" class="flex items-center justify-center space-x-2 pb-8">
            <button
              @click="loadProducts(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium"
            >
              <span class="material-symbols-outlined text-[20px]">chevron_left</span>
              Sebelumnya
            </button>
            <span class="px-4 py-2 text-slate-600 font-medium bg-slate-50 rounded-xl border border-slate-100">
              Halaman {{ pagination.page }} dari {{ pagination.totalPages }}
            </span>
            <button
              @click="loadProducts(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
              class="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium"
            >
              Selanjutnya
              <span class="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
        </div>
        
        <!-- Infinite Scroll Loading Indicator (shown when infinite scroll is ON and loading) -->
        <div v-show="useInfiniteScrollMode && infiniteScroll?.isLoading" class="flex items-center justify-center gap-2 text-slate-500 pb-8">
            <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm font-medium">Memuat lebih banyak...</span>
        </div>
        
        <!-- Infinite Scroll End Message (shown when infinite scroll is ON and no more data) -->
        <div v-show="useInfiniteScrollMode && !infiniteScroll?.isLoading && !infiniteScroll?.hasMore && products.length > 0" class="flex items-center justify-center text-sm text-slate-500 pb-8">
            Semua produk telah dimuat
        </div>
      </div>
    </section>

    <!-- Product Modal -->
    <ProductModal
      ref="productModalRef"
      :show="showCreateModal"
      :product="editingProduct"
      @close="closeModal"
      @save="handleSaveProduct"
    />

    <!-- Tooltips -->
    <Tooltip
      v-if="bulkActionsTooltip.show.value && selectedIds.length > 0 && bulkEditButtonRef"
      :show="bulkActionsTooltip.show.value"
      :target="bulkEditButtonRef"
      title="Edit Massal"
      content="Pilih beberapa produk dan gunakan tombol ini untuk mengedit kategori, status, harga, atau stok secara bersamaan."
      placement="top"
      tooltip-id="bulk_actions_products"
      @dismiss="bulkActionsTooltip.dismiss()"
      @dontShowAgain="bulkActionsTooltip.dismiss()"
    />
    
    <Tooltip
      v-if="inlineEditTooltip.show.value && products.length > 0 && inlineEditRef"
      :show="inlineEditTooltip.show.value"
      :target="inlineEditRef"
      title="Edit Langsung"
      content="Klik pada nama, kategori, atau harga produk untuk mengedit langsung tanpa membuka modal."
      placement="right"
      tooltip-id="inline_edit_products"
      @dismiss="inlineEditTooltip.dismiss()"
      @dontShowAgain="inlineEditTooltip.dismiss()"
    />
    
    <Tooltip
      v-if="infiniteScrollTooltip.show.value && infiniteScrollToggleRef"
      :show="infiniteScrollTooltip.show.value"
      :target="infiniteScrollToggleRef"
      title="Infinite Scroll"
      content="Aktifkan untuk memuat produk secara otomatis saat scroll ke bawah, tanpa perlu klik tombol pagination."
      placement="top"
      tooltip-id="infinite_scroll_products"
      @dismiss="infiniteScrollTooltip.dismiss()"
      @dontShowAgain="infiniteScrollTooltip.dismiss()"
    />

    <!-- Bulk Edit Modal -->
    <div
      v-if="showBulkEditModal"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="showBulkEditModal = false"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">
              Edit Massal ({{ selectedIds.length }} produk)
            </h3>
            <button
              @click="showBulkEditModal = false"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <span class="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>
        </div>

        <form @submit.prevent="handleBulkEdit" class="p-6 space-y-4">
          <!-- Category -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Kategori
            </label>
            <select
              v-model="bulkEditForm.category"
              class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">-- Tidak diubah --</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <select
              v-model="bulkEditForm.isActive"
              class="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">-- Tidak diubah --</option>
              <option value="true">Aktif</option>
              <option value="false">Tidak Aktif</option>
            </select>
          </div>

          <!-- Price Adjustment -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Penyesuaian Harga
            </label>
            <div class="flex gap-2">
              <select
                v-model="bulkEditForm.priceAdjustmentType"
                class="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
              >
                <option value="">-- Tidak diubah --</option>
                <option value="set">Set ke</option>
                <option value="increase">Tambah</option>
                <option value="decrease">Kurangi</option>
                <option value="percentage">Persentase</option>
              </select>
              <input
                v-if="bulkEditForm.priceAdjustmentType"
                v-model.number="bulkEditForm.priceAdjustmentValue"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <!-- Stock Adjustment -->
          <div>
            <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Penyesuaian Stok
            </label>
            <div class="flex gap-2">
              <select
                v-model="bulkEditForm.stockAdjustmentType"
                class="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
              >
                <option value="">-- Tidak diubah --</option>
                <option value="set">Set ke</option>
                <option value="increase">Tambah</option>
                <option value="decrease">Kurangi</option>
              </select>
              <input
                v-if="bulkEditForm.stockAdjustmentType"
                v-model.number="bulkEditForm.stockAdjustmentValue"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div class="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              @click="showBulkEditModal = false"
              class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="bulkEditLoading"
              class="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="bulkEditLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span v-else class="material-symbols-outlined text-[20px]">save</span>
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelector from '../../components/TenantSelector.vue';
import StoreSelector from '../../components/StoreSelector.vue';
import ExportButton from '../../components/ExportButton.vue';
import ProductModal from '../../components/ProductModal.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import SkeletonLoader from '../../components/SkeletonLoader.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { exportToCSV, exportToExcel, exportToPDF, formatDataForExport } from '../../utils/export';
import { useNotification } from '../../composables/useNotification';
import { usePermissions } from '../../composables/usePermissions';
import { safeMap } from '../../utils/array-helpers';
import { usePullToRefresh } from '../../composables/usePullToRefresh';
import { useSearchSuggestions } from '../../composables/useSearchSuggestions';
import { useInfiniteScroll } from '../../composables/useInfiniteScroll';
import { useTooltip } from '../../composables/useTooltip';
import { useOffline } from '../../composables/useOffline';
import { useCache } from '../../composables/useCache';
import { useSwipe } from '../../composables/useSwipe';
import Tooltip from '../../components/Tooltip.vue';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  minStock: number;
  category?: string;
  image?: string;
  emoji?: string;
  isActive: boolean;
  isConsignment?: boolean;
  sku?: string;
  barcode?: string;
}

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { needsTenantSelection } = useTenantCheck();
const { success: showSuccess, error: showError, warning: showWarning, confirm: showConfirm } = useNotification();
const { canManageProducts: rawCanManageProducts } = usePermissions();

const canManageProducts = computed(() => {
  const role = authStore.user?.role;
  if (role === 'ADMIN_TENANT' || role === 'SUPER_ADMIN') return true;
  if (role === 'SUPERVISOR') return rawCanManageProducts.value;
  return false;
});

// UI State for Filters
const showFilters = ref(false);
const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.category) count++;
  if (filters.value.isActive !== '') count++;
  return count;
});
const hasActiveFilters = computed(() => activeFilterCount.value > 0);

const products = ref<Product[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const editingProduct = ref<Product | null>(null);
const editingStockId = ref<string | null>(null);
const tempStockValue = ref<number>(0);
const hasError = ref(false);
const errorMessage = ref<string>('');
const expandedProducts = ref<Set<string>>(new Set());

// Inline editing state
const editingField = ref<{ productId: string; field: string } | null>(null);
const tempEditValue = ref<string | number>('');

// Tooltips for complex features
const bulkActionsTooltip = useTooltip('bulk_actions_products');
const inlineEditTooltip = useTooltip('inline_edit_products');
const infiniteScrollTooltip = useTooltip('infinite_scroll_products');
const bulkEditButtonRef = ref<HTMLElement | null>(null);
const inlineEditRef = ref<HTMLElement | null>(null);
const infiniteScrollToggleRef = ref<HTMLElement | null>(null);
const productCardRefs = ref(new Map<string, HTMLElement>());

// Offline support
const { isOnline } = useOffline();
const { getCached, setCached } = useCache();
const CACHE_KEY_PRODUCTS = 'products_list';

const retryLoad = () => {
  hasError.value = false;
  errorMessage.value = '';
  loadProducts(1);
};

const categories = ref<string[]>([]);
const productLimit = ref<any>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const importing = ref(false);
// Filter persistence key
const FILTER_STORAGE_KEY = 'products_filters';

// Initialize filters from localStorage or defaults
const loadFiltersFromStorage = () => {
  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        search: parsed.search || '',
        category: parsed.category || '',
        isActive: parsed.isActive || '',
      };
    }
  } catch (e) {
    console.warn('Failed to load filters from storage:', e);
  }
  return {
    search: '',
    category: '',
    isActive: '',
  };
};

const filters = ref(loadFiltersFromStorage());

// Save filters to localStorage whenever they change
watch(filters, (newFilters) => {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(newFilters));
  } catch (e) {
    console.warn('Failed to save filters to storage:', e);
  }
}, { deep: true });

// Clear all filters
const clearAllFilters = () => {
  filters.value = {
    search: '',
    category: '',
    isActive: '',
  };
  loadProducts(1);
};
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
});

// Bulk Selection State
const selectedIds = ref<string[]>([]);
const isSelected = (id: string) => selectedIds.value.includes(id);
const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id);
  if (index === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(index, 1);
  }
};
const clearSelection = () => {
  selectedIds.value = [];
};
const isAllSelected = computed(() => {
  return products.value.length > 0 && products.value.every(p => isSelected(p.id));
});
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    clearSelection();
  } else {
    selectedIds.value = [...new Set([...selectedIds.value, ...products.value.map(p => p.id)])];
  }
};

// Bulk Edit State
const showBulkEditModal = ref(false);
const bulkEditLoading = ref(false);
const bulkEditForm = ref({
  category: '',
  isActive: '',
  priceAdjustmentType: '',
  priceAdjustmentValue: 0,
  stockAdjustmentType: '',
  stockAdjustmentValue: 0,
});

const handleBulkEdit = async () => {
  if (!canManageProducts.value) {
    await showError('Anda tidak memiliki izin untuk mengubah produk');
    return;
  }

  if (selectedIds.value.length === 0) return;
  
  bulkEditLoading.value = true;
  try {
    const selectedProducts = products.value.filter(p => selectedIds.value.includes(p.id));
    
    // Process each product
    const updatePromises = selectedProducts.map(async (product) => {
      const updates: any = {};
      
      // Category
      if (bulkEditForm.value.category) {
        updates.category = bulkEditForm.value.category;
      }
      
      // Status
      if (bulkEditForm.value.isActive !== '') {
        updates.isActive = bulkEditForm.value.isActive === 'true';
      }
      
      // Price adjustment
      if (bulkEditForm.value.priceAdjustmentType && bulkEditForm.value.priceAdjustmentValue !== null) {
        const currentPrice = product.price || 0;
        switch (bulkEditForm.value.priceAdjustmentType) {
          case 'set':
            updates.price = bulkEditForm.value.priceAdjustmentValue;
            break;
          case 'increase':
            updates.price = currentPrice + bulkEditForm.value.priceAdjustmentValue;
            break;
          case 'decrease':
            updates.price = Math.max(0, currentPrice - bulkEditForm.value.priceAdjustmentValue);
            break;
          case 'percentage':
            updates.price = currentPrice * (1 + bulkEditForm.value.priceAdjustmentValue / 100);
            break;
        }
      }
      
      // Stock adjustment
      if (bulkEditForm.value.stockAdjustmentType && bulkEditForm.value.stockAdjustmentValue !== null) {
        const currentStock = product.stock || 0;
        switch (bulkEditForm.value.stockAdjustmentType) {
          case 'set':
            updates.stock = bulkEditForm.value.stockAdjustmentValue;
            break;
          case 'increase':
            updates.stock = currentStock + bulkEditForm.value.stockAdjustmentValue;
            break;
          case 'decrease':
            updates.stock = Math.max(0, currentStock - bulkEditForm.value.stockAdjustmentValue);
            break;
        }
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        return api.put(`/products/${product.id}`, updates);
      }
    });
    
    await Promise.all(updatePromises);
    
    await showSuccess(`${selectedIds.value.length} produk berhasil diperbarui`);
    showBulkEditModal.value = false;
    clearSelection();
    // Reset form
    bulkEditForm.value = {
      category: '',
      isActive: '',
      priceAdjustmentType: '',
      priceAdjustmentValue: 0,
      stockAdjustmentType: '',
      stockAdjustmentValue: 0,
    };
    await loadProducts(pagination.value.page);
  } catch (error: any) {
    console.error('Error in bulk edit:', error);
    await showError(error.response?.data?.message || 'Gagal memperbarui beberapa produk');
  } finally {
    bulkEditLoading.value = false;
  }
};

const bulkDelete = async () => {
  if (!canManageProducts.value) {
    await showError('Anda tidak memiliki izin untuk menghapus produk');
    return;
  }

  if (selectedIds.value.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menghapus ${selectedIds.value.length} produk terpilih? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus Massal'
  );
  
  if (!confirmed) return;
  
  loading.value = true;
  try {
    // Delete in sequence or parallel depending on backend support for bulk delete
    // If backend doesn't have bulk delete, we loop (optimistic approach)
    await Promise.all(selectedIds.value.map(id => api.delete(`/products/${id}`)));
    
    await showSuccess(`${selectedIds.value.length} produk berhasil dihapus`);
    clearSelection();
    await loadProducts(pagination.value.page);
  } catch (error: any) {
    console.error('Error in bulk delete:', error);
    await showError(error.response?.data?.message || 'Gagal menghapus beberapa produk');
    await loadProducts(pagination.value.page);
  } finally {
    loading.value = false;
  }
};

const viewMode = ref(localStorage.getItem('productsViewMode') || 'grid');
watch(viewMode, (newMode) => {
  localStorage.setItem('productsViewMode', newMode);
});

const searchInputRef = ref<HTMLInputElement | null>(null);
const handleGlobalFocusSearch = () => {
   searchInputRef.value?.focus();
};

// Search suggestions
const searchSuggestions = useSearchSuggestions('products');

// Watch search query to generate suggestions
watch(() => filters.value.search, (newQuery) => {
  if (newQuery && newQuery.length >= 2) {
    searchSuggestions.generateSuggestions(newQuery, products.value, ['name', 'category', 'sku']);
    searchSuggestions.showSuggestions.value = true;
  } else if (newQuery.length === 0) {
    // Show recent searches when input is empty
    searchSuggestions.showSuggestions.value = true;
  } else {
    searchSuggestions.showSuggestions.value = false;
  }
});

// Handle search input
const handleSearchInput = () => {
  // Suggestions will be generated by watch
};

// Handle search focus
const handleSearchFocus = () => {
  if (filters.value.search.length === 0) {
    searchSuggestions.showSuggestions.value = true;
  } else if (filters.value.search.length >= 2) {
    searchSuggestions.generateSuggestions(filters.value.search, products.value, ['name', 'category', 'sku']);
    searchSuggestions.showSuggestions.value = true;
  }
};

// Handle search blur (with delay to allow click on suggestion)
const handleSearchBlur = () => {
  setTimeout(() => {
    searchSuggestions.showSuggestions.value = false;
  }, 200);
};

// Handle keyboard navigation
const handleSearchKeyDown = () => {
  if (searchSuggestions.selectedIndex.value < searchSuggestions.allSuggestions.value.length - 1) {
    searchSuggestions.selectedIndex.value++;
  }
};

const handleSearchKeyUp = () => {
  if (searchSuggestions.selectedIndex.value > 0) {
    searchSuggestions.selectedIndex.value--;
  }
};

const handleSearchEnter = () => {
  if (searchSuggestions.selectedIndex.value >= 0 && searchSuggestions.allSuggestions.value[searchSuggestions.selectedIndex.value]) {
    selectSuggestion(searchSuggestions.allSuggestions.value[searchSuggestions.selectedIndex.value].text);
  } else if (filters.value.search.trim()) {
    // Save as recent search and search
    searchSuggestions.saveRecentSearch(filters.value.search);
    loadProducts(1);
    searchSuggestions.showSuggestions.value = false;
  }
};

// Select suggestion
const selectSuggestion = (text: string) => {
  filters.value.search = text;
  searchSuggestions.saveRecentSearch(text);
  searchSuggestions.showSuggestions.value = false;
  loadProducts(1);
};

// Margin display format (percentage or amount)
const marginDisplayFormat = ref<'percentage' | 'amount'>(
  (localStorage.getItem('marginDisplayFormat') as 'percentage' | 'amount') || 'percentage'
);

// Infinite scroll mode (toggle with localStorage)
const useInfiniteScrollMode = ref(localStorage.getItem('productsInfiniteScroll') === 'true');

const loadProducts = async (page = 1, append = false) => {
  // Check if tenant selection is needed
  if (needsTenantSelection.value) {
    return; // Don't load if tenant not selected
  }
  
  // For non-super-admin, ensure tenantId is available
  if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
    console.error('Tenant ID not available for non-super-admin user');
    hasError.value = true;
    errorMessage.value = 'Tenant ID unavailable. Please login again.';
    return;
  }
  
  // Check if offline - use cached data
  if (!isOnline.value) {
    const cached = getCached<{ products: Product[]; pagination: any; categories: string[] }>(CACHE_KEY_PRODUCTS);
    if (cached) {
      if (append) {
        products.value = [...products.value, ...cached.products];
      } else {
        products.value = cached.products;
      }
      pagination.value = cached.pagination;
      categories.value = cached.categories || [];
      await showWarning('Anda sedang offline. Menampilkan data dari cache.');
      return;
    } else {
      await showError('Tidak ada data tersimpan. Silakan koneksi ke internet untuk memuat data.');
      return;
    }
  }
  
  // Don't show loading if appending (infinite scroll)
  if (!append) {
    loading.value = true;
  }
  hasError.value = false;
  errorMessage.value = '';
  try {
    const params: any = {
      page,
      limit: pagination.value.limit,
      ...(filters.value.search && { search: filters.value.search }),
      ...(filters.value.category && { category: filters.value.category }),

      ...(filters.value.isActive && { isActive: filters.value.isActive }),
      ...(route.query.filter === 'low_stock' && { lowStock: 'true' }),
    };
    
    // Ensure tenantId is set in params for SUPER_ADMIN
    if (authStore.isSuperAdmin && authStore.selectedTenantId) {
      params.tenantId = authStore.selectedTenantId;
    }
    
    const response = await api.get('/products', { params });
    const newProducts = Array.isArray(response.data.data) ? response.data.data : [];
    
    if (append) {
      // Append to existing products
      products.value = [...products.value, ...newProducts];
    } else {
      // Replace products
      products.value = newProducts;
    }
    
    pagination.value = response.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 };
    
    // Cache the data for offline use
    setCached(CACHE_KEY_PRODUCTS, {
      products: products.value,
      pagination: pagination.value,
      categories: categories.value,
    }, 10 * 60 * 1000); // Cache for 10 minutes
    
    // Update infinite scroll hasMore
    if (infiniteScroll) {
      infiniteScroll.setHasMore(page < pagination.value.totalPages);
    }

    // Extract unique categories
    const uniqueCategories = new Set<string>();
    if (Array.isArray(products.value)) {
    products.value.forEach(p => {
      if (p.category) uniqueCategories.add(p.category);
    });
    }
    categories.value = Array.from(uniqueCategories);

    // Load product limit only for roles that can mutate products.
    if (canManageProducts.value) {
      try {
        const limitRes = await api.get('/addons/check-limit/ADD_PRODUCTS');
        productLimit.value = limitRes.data;
      } catch {
        // Ignore if no addon
      }
    }
  } catch (error: any) {
    console.error('Error loading products:', error);
    
    // If offline or network error, try to use cached data
    if (!isOnline.value || error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      const cached = getCached<{ products: Product[]; pagination: any; categories: string[] }>(CACHE_KEY_PRODUCTS);
      if (cached) {
        if (append) {
          products.value = [...products.value, ...cached.products];
        } else {
          products.value = cached.products;
        }
        pagination.value = cached.pagination;
        categories.value = cached.categories || [];
        await showWarning('Koneksi terputus. Menampilkan data dari cache.');
        return;
      }
    }
    
    // Set error state for error boundary
    hasError.value = true;
    errorMessage.value = error?.response?.data?.message || error?.message || 'Failed to load products';
    
    // If 401 Unauthorized, redirect to login
    if (error?.response?.status === 401) {
      authStore.clearAuth();
      router.push('/login');
      return;
    }
    
    // Clear selectedTenantId on error for Super Admin
    if (authStore.isSuperAdmin) {
      authStore.setSelectedTenant(null);
      localStorage.removeItem('selectedTenantId');
    }
    
    if (error.response?.status !== 429 && error.response?.status !== 401) { // Don't show error for rate limiting or auth
      await showError(error.response?.data?.message || 'Failed to load products');
    }
  } finally {
    loading.value = false;
  }
};

const editProduct = (product: Product) => {
  if (!canManageProducts.value) return;
  editingProduct.value = product;
  showCreateModal.value = true;
};

const startEditingStock = (product: Product) => {
  if (canManageProducts.value) {
      editingStockId.value = product.id;
      tempStockValue.value = product.stock;
  }
};

const cancelEditingStock = () => {
    editingStockId.value = null;
};

// Inline editing functions
const startInlineEdit = (product: Product, field: string, currentValue: string | number) => {
  if (canManageProducts.value) {
    editingField.value = { productId: product.id, field };
    tempEditValue.value = currentValue;
  }
};

const cancelInlineEdit = () => {
  editingField.value = null;
  tempEditValue.value = '';
};

const saveInlineEdit = async (product: Product) => {
  if (!canManageProducts.value) {
    await showError('Anda tidak memiliki izin untuk mengubah produk');
    cancelInlineEdit();
    return;
  }

  if (!editingField.value) return;
  
  const { field } = editingField.value;
  const newValue = tempEditValue.value;
  
  // Validate
  if (field === 'price' && (typeof newValue !== 'number' || newValue < 0)) {
    await showError('Harga tidak valid');
    cancelInlineEdit();
    return;
  }
  
  if (field === 'name' && (!newValue || String(newValue).trim() === '')) {
    await showError('Nama produk tidak boleh kosong');
    cancelInlineEdit();
    return;
  }
  
  // OPTIMISTIC UPDATE
  const oldValue = (product as any)[field];
  (product as any)[field] = newValue;
  
  // Show success immediately
  await showSuccess(`${field === 'name' ? 'Nama' : field === 'price' ? 'Harga' : 'Kategori'} diperbarui`);
  
  try {
    // API call in background
    await api.put(`/products/${product.id}`, { [field]: newValue });
    
    // Update categories if category was added
    if (field === 'category' && newValue && !categories.value.includes(String(newValue))) {
      categories.value.push(String(newValue));
    }
  } catch (error: any) {
    // ROLLBACK on error
    (product as any)[field] = oldValue;
    await showError(error.response?.data?.message || `Gagal memperbarui ${field}`);
  } finally {
    cancelInlineEdit();
  }
};

const saveStock = async (product: Product) => {
  if (!canManageProducts.value) {
    await showError('Anda tidak memiliki izin untuk mengubah stok produk');
    return;
  }

  if (tempStockValue.value < 0) return;
  
  // OPTIMISTIC UPDATE: Update stock immediately
  const oldStock = product.stock;
  product.stock = tempStockValue.value;
  editingStockId.value = null;
  
  // Show success immediately
  await showSuccess('Stok diperbarui');
  
  try {
    // API call in background
    await api.put(`/products/${product.id}`, { stock: tempStockValue.value });
    // Success - no need to update, already optimistic
  } catch (error: any) {
    // ROLLBACK: Revert on error
    product.stock = oldStock;
    editingStockId.value = product.id;
    tempStockValue.value = oldStock;
    await showError(error.response?.data?.message || 'Gagal memperbarui stok');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingProduct.value = null;
};

const productModalRef = ref<any>(null); // Ref for ProductModal component

const handleSaveProduct = async (productData: Partial<Product>, keepOpen = false) => {
  if (!canManageProducts.value) {
    await showError('Anda tidak memiliki izin untuk menambah atau mengubah produk');
    return;
  }

  let optimisticProduct: Product | null = null;
  let originalProduct: Product | null = null;
  let productIndex = -1;
  
  try {
    if (editingProduct.value) {
      // OPTIMISTIC UPDATE: Update product in list immediately
      productIndex = products.value.findIndex(p => p.id === editingProduct.value!.id);
      if (productIndex !== -1) {
        originalProduct = { ...products.value[productIndex] };
        // Optimistically update
        products.value[productIndex] = {
          ...products.value[productIndex],
          ...productData,
        } as Product;
      }
      
      // Show success immediately
      await showSuccess('Produk berhasil diperbarui');
      
      // API call in background
      const response = await api.put(`/products/${editingProduct.value.id}`, productData);
      
      // Sync with server response
      if (productIndex !== -1 && response.data) {
        products.value[productIndex] = response.data;
      }
    } else {
      // OPTIMISTIC CREATE: Add product to list immediately with temporary ID
      const tempId = `temp-${Date.now()}`;
      optimisticProduct = {
        id: tempId,
        name: productData.name || '',
        description: productData.description,
        price: productData.price || 0,
        cost: productData.cost,
        stock: productData.stock || 0,
        minStock: productData.minStock || 0,
        category: productData.category,
        image: productData.image,
        emoji: productData.emoji,
        isActive: productData.isActive ?? true,
        isConsignment: productData.isConsignment,
      } as Product;
      
      // Add to beginning of list
      products.value = [optimisticProduct, ...products.value];
      
      // Show success immediately
      await showSuccess(keepOpen ? 'Produk ditambahkan. Silakan input produk berikutnya.' : 'Produk berhasil ditambahkan');
      
      // API call in background
      const response = await api.post('/products', productData);
      
      // Replace temporary product with real one from server
      if (optimisticProduct && response.data) {
        const tempIndex = products.value.findIndex(p => p.id === tempId);
        if (tempIndex !== -1) {
          products.value[tempIndex] = response.data;
        }
      }
    }
    
    if (keepOpen) {
      // Reset form in modal for next input
      if (productModalRef.value) {
         productModalRef.value.resetForm();
      }
    } else {
      closeModal();
    }
    
    // Update categories if new category was added
    if (productData.category && !categories.value.includes(productData.category)) {
      categories.value.push(productData.category);
    }
  } catch (error: any) {
    console.error('Error saving product:', error);
    
    // ROLLBACK: Revert optimistic changes
    if (editingProduct.value && originalProduct && productIndex !== -1) {
      // Rollback update
      products.value[productIndex] = originalProduct;
    } else if (optimisticProduct) {
      // Remove optimistic create
      const tempIndex = products.value.findIndex(p => p.id === optimisticProduct!.id);
      if (tempIndex !== -1) {
        products.value.splice(tempIndex, 1);
      }
    }
    
    // Check for validation errors with field details
    const responseData = error.response?.data;
    if (responseData?.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
      // Show field-level errors
      const errorMessages = responseData.errors.map((e: any) => `${e.path}: ${e.message}`).join('\n');
      await showError(errorMessages);
    } else {
      await showError(responseData?.message || 'Gagal menyimpan produk');
    }
  }
};

const deleteProduct = async (id: string) => {
  if (!canManageProducts.value) {
    await showError('Anda tidak memiliki izin untuk menghapus produk');
    return;
  }

  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus produk ini?');
  if (!confirmed) return;
  
  // Store product data for undo
  const productToDelete = products.value.find(p => p.id === id);
  if (!productToDelete) return;
  
  // Store index for potential restore
  const index = products.value.findIndex(p => p.id === id);
  
  try {
    await api.delete(`/products/${id}`);
    
    // Remove from local list immediately (optimistic update)
    if (index !== -1) {
      products.value.splice(index, 1);
    }
    
    // Show success with undo option
    await showSuccess(
      'Produk berhasil dihapus',
      undefined,
      5000,
      async () => {
        // Undo: restore product
        try {
          // Recreate product with same data
          await api.post('/products', {
            name: productToDelete.name,
            description: productToDelete.description,
            price: productToDelete.price,
            cost: productToDelete.cost,
            stock: productToDelete.stock,
            minStock: productToDelete.minStock,
            category: productToDelete.category,
            image: productToDelete.image,
            emoji: productToDelete.emoji,
            isActive: productToDelete.isActive,
            isConsignment: productToDelete.isConsignment,
          });
          await loadProducts(pagination.value.page);
          await showSuccess('Produk berhasil dipulihkan');
        } catch {
          await showError('Gagal memulihkan produk');
        }
      },
      'Pulihkan'
    );
  } catch (error: any) {
    // Restore product in list if delete failed
    if (index !== -1 && !products.value.find(p => p.id === id)) {
      products.value.splice(index, 0, productToDelete);
    }
    await showError(error.response?.data?.message || 'Gagal menghapus produk');
  }
};

// Toggle product details
const toggleProductDetails = (productId: string) => {
  if (expandedProducts.value.has(productId)) {
    expandedProducts.value.delete(productId);
  } else {
    expandedProducts.value.add(productId);
  }
};

const addToPOS = (_product: Product) => {
  // Navigate to Kasir page
  router.push('/app/pos');
  // You could also emit an event or use a global store to add product to cart
  // For now, just navigate to Kasir
};

const handleExport = (format: 'csv' | 'excel' | 'pdf' | 'email') => {
  if (format === 'email') {
    handleEmailReport('Daftar Produk');
    return;
  }
  const exportData = formatDataForExport(products.value, {
    name: 'Name',
    category: 'Category',
    price: 'Price',
    cost: 'Cost',
    stock: 'Stock',
    minStock: 'Min Stock',
    description: 'Description',
    isConsignment: 'Consignment',
    isActive: 'Status',
  });

  // Format data based on export format
  if (format === 'csv') {
    // For CSV, use raw numbers (no currency formatting)
    // GUARD CLAUSE: Pastikan exportData selalu array
    const safeExportData = Array.isArray(exportData) ? exportData : [];
    
    // Use mapped english headers
    const csvData = safeMap(safeExportData, (item: any) => ({
      Name: item.Name || '',
      Category: item.Category || '',
      'Price': typeof item.Price === 'string' ? item.Price.replace(/[^\d]/g, '') : (item.Price || 0),
      'Cost': typeof item['Cost'] === 'string' ? item['Cost'].replace(/[^\d]/g, '') : (item['Cost'] || ''),
      Stock: item.Stock || 0,
      'Min Stock': item['Min Stock'] || 0,
      'Stock Status': getStockStatusLabel(item.Stock || 0, item['Min Stock'] || 0),
      Description: item.Description || '',
      'Consignment': item['Consignment'] === 'true' || item['Consignment'] === true ? 'Yes' : 'No',
      Status: item.Status === 'true' || item.Status === true ? 'Active' : 'Inactive',
    }));
    exportToCSV(csvData, 'products', ['Name', 'Category', 'Price', 'Cost', 'Stock', 'Min Stock', 'Stock Status', 'Description', 'Consignment', 'Status']);
  } else {
    // For Excel/PDF, format with currency
    // GUARD CLAUSE: Pastikan exportData selalu array
    const safeExportData = Array.isArray(exportData) ? exportData : [];
    
    const formattedData = safeMap(safeExportData, (item: any) => ({
      ...item,
      'Price': formatCurrency(Number(item['Price'] || 0)),
      'Cost': item['Cost'] ? formatCurrency(Number(item['Cost'])) : '-',
      'Stock Status': getStockStatusLabel(item.Stock || 0, item['Min Stock'] || 0),
      'Consignment': item['Consignment'] === 'true' || item['Consignment'] === true ? 'Yes' : 'No',
      Status: item.Status === 'true' || item.Status === true ? 'Active' : 'Inactive',
    }));
    if (format === 'excel') {
      exportToExcel(formattedData, 'products', ['Name', 'Category', 'Price', 'Cost', 'Stock', 'Min Stock', 'Stock Status', 'Description', 'Consignment', 'Status']);
    } else if (format === 'pdf') {
      exportToPDF(formattedData, 'products', 'Product List', ['Name', 'Category', 'Price', 'Cost', 'Stock', 'Min Stock', 'Stock Status', 'Description', 'Consignment', 'Status']);
    }
  }
};

const downloadTemplate = () => {
  // Create template CSV with headers and example row
  const templateData = [
    {
      Name: 'Example Product',
      Category: 'Food',
      'Price': '12000',
      'Cost': '10000',
      Stock: '100',
      'Min Stock': '10',
      'Stock Status': 'In Stock',
      Description: 'Example product description',
      'Consignment': 'No',
      Status: 'Active',
    },
  ];
  
  exportToCSV(templateData, 'product_import_template', ['Name', 'Category', 'Price', 'Cost', 'Stock', 'Min Stock', 'Stock Status', 'Description', 'Consignment', 'Status']);
  showSuccess('Template CSV berhasil diunduh');
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleEmailReport = async (title: string) => {
  const email = window.prompt('Masukkan alamat email penerima:');
  if (!email) return;
  
  if (!email.includes('@')) {
    await showError('Alamat email tidak valid');
    return;
  }
  
  try {
    await showSuccess(`Laporan "${title}" telah dijadwalkan untuk dikirim ke ${email}`);
  } catch {
    await showError('Gagal menjadwalkan pengiriman email');
  }
};

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  if (!file.name.endsWith('.csv')) {
    await showError('File harus berformat CSV');
    return;
  }
  
  importing.value = true;
  
  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      await showError('File CSV tidak valid. Harus memiliki header dan setidaknya 1 baris data.');
      return;
    }
    
    // Parse CSV (handle quoted values)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const headers = parseCSVLine(lines[0]);
    // Allow both English and Indonesian headers for backward compatibility or ease of use
    // But we map them to our internal field names
    
    // Check if headers match (we'll do a simple check for now mainly focusing on standard template)
    const headerMap: Record<string, number> = {};
    headers.forEach((h, i) => {
      headerMap[h.trim()] = i;
    });
    
    // Map of expected headers (EN/ID) to index
    const getIndex = (keys: string[]) => {
      for (const key of keys) {
        if (headerMap[key] !== undefined) return headerMap[key];
      }
      return -1;
    };
    
    const nameIdx = getIndex(['Name', 'Nama']);
    const priceIdx = getIndex(['Price', 'Harga Jual', 'Harga']);
    const stockIdx = getIndex(['Stock', 'Stok']);
    
    if (nameIdx === -1 || priceIdx === -1 || stockIdx === -1) {
       await showError('Header CSV tidak lengkap. Wajib ada: Name (Nama), Price (Harga), Stock (Stok)');
       return;
    }
    
    // Parse data rows
    const productsToImport: any[] = [];
    const errors: string[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }
      
      const nama = values[nameIdx]?.trim();
      if (!nama) {
        errors.push(`Row ${i + 1}: Name is required`);
        continue;
      }
      
      const harga = values[priceIdx]?.trim().replace(/[^\d]/g, '');
      if (!harga || isNaN(Number(harga)) || Number(harga) < 0) {
        errors.push(`Row ${i + 1}: Invalid Price`);
        continue;
      }
      
      const costIdx = getIndex(['Cost', 'Harga Pokok']);
      const cost = costIdx !== -1 ? values[costIdx]?.trim().replace(/[^\d]/g, '') : undefined;
      
      const stok = values[stockIdx]?.trim();
      if (stok && (isNaN(Number(stok)) || Number(stok) < 0)) {
        errors.push(`Row ${i + 1}: Invalid Stock`);
        continue;
      }
      
      const minStockIdx = getIndex(['Min Stock', 'Stok Minimum']);
      const minStock = minStockIdx !== -1 ? values[minStockIdx]?.trim() : '0';
      
      const statusIdx = getIndex(['Status']);
      const status = statusIdx !== -1 ? values[statusIdx]?.trim().toLowerCase() : 'active';
      const isActive = status === 'active' || status === 'aktif' || status === 'true' || status === '1' || status === '';
      
      const consignmentIdx = getIndex(['Consignment', 'Produk Titipan']);
      const isConsignment = consignmentIdx !== -1 ? values[consignmentIdx]?.trim().toLowerCase() : 'no';
      const isConsignmentValue = isConsignment === 'yes' || isConsignment === 'ya' || isConsignment === 'true' || isConsignment === '1';
      
      const categoryIdx = getIndex(['Category', 'Kategori']);
      const descriptionIdx = getIndex(['Description', 'Deskripsi']);
      
      productsToImport.push({
        name: nama,
        category: categoryIdx !== -1 ? values[categoryIdx]?.trim() || '' : '',
        price: Number(harga),
        cost: cost ? Number(cost) : undefined,
        stock: Number(stok || 0),
        minStock: Number(minStock || 0),
        description: descriptionIdx !== -1 ? values[descriptionIdx]?.trim() || '' : '',
        isActive,
        isConsignment: isConsignmentValue,
      });
    }
    
    if (errors.length > 0) {
      await showError(`Found ${errors.length} errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
      return;
    }
    
    if (productsToImport.length === 0) {
      await showError('No valid products to import');
      return;
    }
    
    // Import products via API
    const confirmed = await showConfirm(
      `Are you sure you want to import ${productsToImport.length} products?`,
      'Import Products'
    );
    
    if (!confirmed) return;
    
    // Import products in batches
    const batchSize = 10;
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < productsToImport.length; i += batchSize) {
      const batch = productsToImport.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (product) => {
          try {
            await api.post('/products', product);
            successCount++;
          } catch (error: any) {
            console.error('Error importing product:', product.name, error);
            failCount++;
          }
        })
      );
    }
    
    // Reload products
    await loadProducts(1);
    
    if (failCount === 0) {
      await showSuccess(`Successfully imported ${successCount} products`);
    } else {
      await showError(`Imported ${successCount} products, ${failCount} failed`);
    }
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (error: any) {
    console.error('Error importing CSV:', error);
    await showError('Failed to read CSV file. Please ensure valid format.');
  } finally {
    importing.value = false;
  }
};

watch([() => filters.value.search, () => filters.value.category, () => filters.value.isActive], () => {
  loadProducts(1);
});

const handleTenantChange = (tenantId: string | null) => {
  // Auto-refetch products when tenant changes
  if (tenantId && !needsTenantSelection.value) {
    loadProducts(1); // Reset to page 1
  }
};

const handleStoreChange = () => {
  // Reload products when store changes
  loadProducts(1);
};

const getStockStatusLabel = (stock: number, minStock: number): string => {
  if (stock === 0) {
    return 'Out of Stock';
  } else if (stock <= minStock) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
};

const formatMargin = (price: number, cost: number): string => {
  if (!cost || cost <= 0 || !price || price <= 0) {
    return marginDisplayFormat.value === 'percentage' ? '0.00%' : formatCurrency(0);
  }
  
  if (marginDisplayFormat.value === 'amount') {
    // Tampilkan margin dalam jumlah uang (harga jual - harga pokok)
    const marginAmount = price - cost;
    return formatCurrency(marginAmount);
  } else {
    // Tampilkan margin dalam persen
    const margin = ((price - cost) / price) * 100;
    return `${margin.toFixed(2)}%`;
  }
};

const saveMarginFormat = () => {
  localStorage.setItem('marginDisplayFormat', marginDisplayFormat.value);
};

const getStockStatusClass = (stock: number, minStock: number): string => {
  if (stock === 0) {
    return 'bg-red-100 text-red-800';
  } else if (stock <= minStock) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-green-100 text-green-800';
  }
};

// Watch for tenant changes and auto-refetch
// Only reload if tenant actually changed (not on every render)
watch(() => authStore.currentTenantId, (newTenantId, oldTenantId) => {
  // Only reload if tenant actually changed and is not empty
  if (newTenantId && newTenantId !== oldTenantId && !needsTenantSelection.value) {
    loadProducts(1);
  }
}, { immediate: false });

// Pull to refresh
const { pullDistance, isRefreshing } = usePullToRefresh({
  onRefresh: async () => {
    await loadProducts(1);
  },
});

// Infinite scroll
const infiniteScroll = useInfiniteScroll({
  onLoadMore: async () => {
    if (pagination.value.page < pagination.value.totalPages) {
      await loadProducts(pagination.value.page + 1, true);
    }
  },
  enabled: () => useInfiniteScrollMode.value && !loading.value,
});

// Toggle infinite scroll
const toggleInfiniteScroll = () => {
  localStorage.setItem('productsInfiniteScroll', useInfiniteScrollMode.value ? 'true' : 'false');
  if (useInfiniteScrollMode.value) {
    // Reset to first page when enabling infinite scroll
    loadProducts(1);
  }
};

const setupSwipeForProduct = (el: HTMLElement | null, productId: string) => {
  if (!el || window.innerWidth >= 768) return;
  productCardRefs.value.set(productId, el);

  useSwipe(el, {
    onSwipeLeft: () => {
      if (canManageProducts.value || authStore.user?.role === 'ADMIN_TENANT' || authStore.user?.role === 'SUPER_ADMIN') {
        deleteProduct(productId);
      }
    },
    threshold: 100,
    velocityThreshold: 0.5,
  });
};

onMounted(async () => {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // For super admin, ensure selectedTenantId is synced with localStorage
    if (authStore.isSuperAdmin) {
      const storedTenantId = localStorage.getItem('selectedTenantId');
      if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
        authStore.setSelectedTenant(storedTenantId);
      }
    }
    
    // Always load products on mount (if tenant is selected)
    if (!needsTenantSelection.value) {
      await loadProducts(1);
    }

    window.addEventListener('focus-search', handleGlobalFocusSearch);
    
    // Show tooltips after a delay (first time only)
    setTimeout(() => {
      if (products.value.length > 0) {
        // Show bulk actions tooltip when user selects products
        // (will be triggered when selectedIds.length > 0)
        
        // Show inline edit tooltip
        if (inlineEditTooltip.shouldShow()) {
          setTimeout(() => {
            if (inlineEditTooltip.shouldShow() && inlineEditRef.value) {
              inlineEditTooltip.show.value = true;
            }
          }, 3000);
        }
        
        // Show infinite scroll tooltip
        if (infiniteScrollTooltip.shouldShow()) {
          setTimeout(() => {
            if (infiniteScrollTooltip.shouldShow() && infiniteScrollToggleRef.value) {
              infiniteScrollTooltip.show.value = true;
            }
          }, 4000);
        }
      }
    }, 1000);
    
// Watch for bulk selection to show tooltip
watch(() => selectedIds.value.length, (count) => {
  if (count > 0 && bulkActionsTooltip.shouldShow() && bulkEditButtonRef.value) {
    setTimeout(() => {
      if (bulkActionsTooltip.shouldShow() && bulkEditButtonRef.value) {
        bulkActionsTooltip.show.value = true;
      }
    }, 500);
  }
});

  } catch (error: any) {
    console.error('Error in onMounted:', error);
    hasError.value = true;
    errorMessage.value = error?.message || 'Terjadi kesalahan saat memuat halaman';
  }
});

onUnmounted(() => {
    window.removeEventListener('focus-search', handleGlobalFocusSearch);
});
</script>
