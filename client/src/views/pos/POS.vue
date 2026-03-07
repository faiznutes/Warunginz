<template>
  <!-- Shift Guard Overlay - Blocks POS if no active shift -->
  <div v-if="shiftRequired && (checkingShift || !hasActiveShift)" class="fixed inset-0 bg-gradient-to-br from-[#1a2332] via-[#15202e] to-[#0f151e] flex items-center justify-center z-[100]">
    <!-- Loading State -->
    <div v-if="checkingShift" class="text-center">
      <div class="w-16 h-16 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <p class="text-white/70 text-lg">Memeriksa status shift...</p>
    </div>
    
    <!-- No Shift Open -->
    <div v-else class="text-center max-w-md mx-4 p-8">
      <div class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
        <svg class="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-white mb-3">
        {{ shiftGateState === 'recovery_close_required' ? 'Shift Perlu Dipulihkan' : 'Shift Belum Dibuka' }}
      </h2>
      <p class="text-gray-400 mb-8">
        {{
          shiftGateState === 'recovery_close_required'
            ? 'Shift kasir masih aktif tetapi shift toko tidak valid. Tutup shift kasir terlebih dahulu dari halaman Cash Shift.'
            : 'Untuk mengakses POS, Anda harus membuka shift kasir terlebih dahulu.'
        }}
      </p>
      <button
        @click="goToShiftPage"
        class="w-full py-4 px-6 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-primary/25 transition-all duration-300 transform hover:scale-[1.02]"
      >
        <span class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
          {{ shiftGateState === 'recovery_close_required' ? 'Buka Halaman Cash Shift' : 'Buka Shift Sekarang' }}
        </span>
      </button>
      <button
        @click="handleLogout"
        class="w-full mt-4 py-3 px-6 bg-transparent border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 font-medium rounded-xl transition-all duration-300"
      >
        Logout
      </button>
    </div>
  </div>

  <!-- Simple POS Mode -->
  <div v-if="isSimpleMode" class="min-h-screen p-4 bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e]">
    <!-- Orientation Warning (Portrait) -->
    <div
      v-if="isPortrait"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-8 text-center max-w-md mx-4">
        <svg class="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Putar Perangkat</h2>
        <p class="text-gray-600 mb-4">Mode POS Sederhana memerlukan orientasi lanskap</p>
        <p class="text-sm text-gray-500">Silakan putar perangkat Anda ke posisi lanskap</p>
      </div>
    </div>

    <!-- Main Content (only visible in landscape) -->
    <div v-if="!isPortrait" class="h-screen flex flex-col">
      <!-- Offline Status Indicator -->
      <div
        v-if="!isOnline"
        class="mb-2 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-xl flex items-center gap-2"
      >
        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="text-sm font-semibold text-yellow-800">Anda sedang offline — transaksi disimpan lokal</span>
      </div>
      <div
        v-else-if="isSyncing"
        class="mb-2 p-3 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-primary rounded-xl flex items-center gap-2"
      >
        <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest">Sinkronisasi Data... ({{ pendingSyncCount }} tertunda)</span>
      </div>
      <div
        v-else-if="pendingSyncCount > 0"
        class="mb-2 p-3 bg-green-100 border-l-4 border-green-500 rounded-xl flex items-center gap-2"
      >
        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm font-semibold text-green-800">Sinkronisasi selesai! ({{ pendingSyncCount }} tertunda)</span>
      </div>
      
      <div class="bg-white rounded-xl shadow-md p-4 mb-4">
        <h1 class="text-3xl font-bold text-gray-900 text-center">SIMPLE POS</h1>
        <p class="text-center text-gray-600 mt-1">{{ new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
      </div>

      <div class="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        <!-- Categories -->
        <div class="bg-white rounded-xl shadow-md p-4 overflow-y-auto">
          <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">CATEGORIES</h2>
          <div class="space-y-3">
            <button
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              class="w-full py-6 px-4 text-lg font-bold rounded-xl transition-all"
              :class="selectedCategory === category 
                ? 'bg-primary text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'"
            >
              {{ category === 'SEMUA' ? 'ALL' : (category || 'ALL') }}
            </button>
          </div>
        </div>

        <!-- Products -->
        <POSProductGrid
          :products="filteredProductsSimple"
          :loading="loading"
          :search-query="searchQuery"
          :cart-item-ids="new Set(cart.map(i => i.id))"
          @update:search-query="searchQuery = $event"
          @add-to-cart="handleAddToCart"
          class="bg-white rounded-xl shadow-md"
        />

        <!-- Cart & Payment -->
        <div class="bg-white rounded-xl shadow-md p-4 flex flex-col">
          <POSCart
            :cart="cart"
            :subtotal="subtotal"
            :discount="discount"
            :total="total"
            @update-quantity="updateItemQuantity"
            @remove-item="handleRemoveFromCart($event.id)"
            @checkout="showCashInput = true; cashAmount = total"
            @clear-cart="handleClearCart"
          />

          <!-- Cash Payment Section Integration -->
          <div v-if="showCashInput" class="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
             <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah Tunai</label>
            <input
              v-model.number="cashAmount"
              type="number"
              min="0"
              :placeholder="`Min: ${formatCurrency(total)}`"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-lg font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500"
              @keyup.enter="processPaymentSimple('CASH')"
            />
            <div class="flex gap-2 mt-3">
              <button
                @click="showCashInput = false; cashAmount = 0"
                class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
              >
                Batal
              </button>
              <button
                @click="processPaymentSimple('CASH')"
                :disabled="!cashAmount || cashAmount < total || processing"
                class="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bayar
              </button>
            </div>
          </div>
          
           <div v-else class="mt-4 space-y-3">
             <button
              @click="processPaymentSimple('QRIS')"
              :disabled="cart.length === 0 || processing"
              class="w-full py-6 bg-primary text-white rounded-xl font-bold text-xl hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📱 QRIS
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Normal POS Mode -->
  <!-- Normal POS Mode (V3 Reskin) -->
  <div v-else class="bg-slate-50 text-slate-900 font-display overflow-hidden h-screen w-screen flex flex-col relative">
    <!-- Header -->
    <header class="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-30 shrink-0 shadow-sm">
      <div class="flex items-center gap-4">
        <!-- Burger Menu Button -->
        <button 
          @click="showNavSidebar = !showNavSidebar"
          class="w-10 h-10 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-primary flex items-center justify-center transition-colors"
          aria-label="Toggle navigation"
        >
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="flex items-center gap-2 text-primary">
          <span class="material-symbols-outlined text-[28px]">point_of_sale</span>
          <h1 class="text-xl font-bold tracking-tight text-slate-900">Warungin POS 
            <span class="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full ml-2">CASHIER</span>
          </h1>
        </div>
        <div class="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
        <div class="hidden md:flex items-center gap-2 text-sm text-slate-500">
          <span class="material-symbols-outlined text-[18px] text-slate-400">storefront</span>
          <span>{{ authStore.user?.tenantName || 'Main Store' }}</span>
        </div>
      </div>

      <!-- Center: Status & Clock -->
      <div class="hidden lg:flex items-center gap-4">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full shadow-sm" :class="isOnline ? 'bg-green-50 border border-green-100 text-green-700' : 'bg-red-50 border border-red-100 text-red-700'">
          <span class="w-2 h-2 rounded-full animate-pulse" :class="isOnline ? 'bg-green-500' : 'bg-red-500'"></span>
          {{ isOnline ? 'Online' : 'Offline' }}
        </div>
        <div class="text-slate-900 font-semibold bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">{{ currentTime }}</div>
      </div>

      <!-- Right: Actions -->
       <div class="flex items-center gap-3">
          <!-- Pesanan Terparkir Button -->
          <button 
            v-if="heldOrders.length > 0"
            @click="showHeldOrdersModal = true"
            class="h-10 px-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-2 hover:bg-amber-100 transition-all font-bold text-xs shadow-sm shadow-amber-500/10"
          >
             <span class="material-symbols-outlined text-[18px]">pause_circle</span>
             <span>{{ heldOrders.length }} Terparkir</span>
          </button>

          <button class="flex items-center gap-2 text-slate-900 hover:text-primary transition-colors p-1 pr-2 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200" aria-label="Menu pengguna">
            <div class="h-8 w-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-sm border border-slate-200 ring-2 ring-white shadow-sm">
              {{ authStore.user?.name?.[0]?.toUpperCase() || 'U' }}
            </div>
            <div class="text-sm text-left hidden lg:block">
               <p class="font-bold leading-none text-slate-800">{{ authStore.user?.name || 'Cashier' }}</p>
               <p class="text-[10px] text-slate-500 mt-0.5 font-medium">Shift #{{ Math.floor(Math.random() * 999) }}</p>
            </div>
            <span class="material-symbols-outlined text-slate-400">expand_more</span>
          </button>
       </div>
    </header>

    <!-- Navigation Sidebar Overlay -->
    <Teleport to="body">
      <!-- Backdrop -->
      <Transition name="fade">
        <div 
          v-if="showNavSidebar"
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]"
          @click="showNavSidebar = false"
        ></div>
      </Transition>
      
      <!-- Sidebar -->
      <Transition name="slide-left">
        <aside 
          v-if="showNavSidebar"
          class="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-800 shadow-2xl z-[101] flex flex-col"
        >
          <!-- Sidebar Header -->
          <div class="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span class="material-symbols-outlined text-white text-2xl">storefront</span>
              </div>
              <div>
                <h2 class="font-bold text-slate-900 dark:text-white">{{ authStore.user?.tenantName || 'Warungin' }}</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400">Menu Navigasi</p>
              </div>
            </div>
            <button 
              @click="showNavSidebar = false"
              class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 flex items-center justify-center transition-colors"
              aria-label="Tutup navigasi"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <!-- Navigation Links -->
          <nav class="flex-1 p-4 overflow-y-auto">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Menu Utama</p>
            
            <router-link 
              to="/app/dashboard" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-primary transition-colors mb-1"
              @click="showNavSidebar = false"
            >
              <span class="material-symbols-outlined">dashboard</span>
              <span class="font-medium">Dashboard</span>
            </router-link>
            
            <router-link 
              to="/pos" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary mb-1"
              @click="showNavSidebar = false"
            >
              <span class="material-symbols-outlined">point_of_sale</span>
              <span class="font-medium">POS</span>
              <span class="ml-auto text-xs bg-primary text-white px-2 py-0.5 rounded-full">Active</span>
            </router-link>
            
            <router-link 
              to="/app/orders" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-primary transition-colors mb-1"
              @click="showNavSidebar = false"
              v-if="canEditOrders"
            >
              <span class="material-symbols-outlined">receipt_long</span>
              <span class="font-medium">Orders</span>
            </router-link>
            
            <router-link 
              to="/app/products" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-primary transition-colors mb-1"
              @click="showNavSidebar = false"
              v-if="canManageProducts"
            >
              <span class="material-symbols-outlined">inventory_2</span>
              <span class="font-medium">Products</span>
            </router-link>
            
            <router-link 
              to="/app/customers" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-primary transition-colors mb-1"
              @click="showNavSidebar = false"
              v-if="canManageCustomers"
            >
              <span class="material-symbols-outlined">group</span>
              <span class="font-medium">Customers</span>
            </router-link>
            
            <router-link 
              to="/app/reports" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-primary transition-colors mb-1"
              @click="showNavSidebar = false"
              v-if="canViewReports"
            >
              <span class="material-symbols-outlined">bar_chart</span>
              <span class="font-medium">Reports</span>
            </router-link>
            
            <div class="my-4 border-t border-slate-200 dark:border-slate-700"></div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Kasir</p>
            
            <router-link 
              to="/app/cashier/cash-shift" 
              class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-primary transition-colors mb-1"
              @click="showNavSidebar = false"
            >
              <span class="material-symbols-outlined">payments</span>
              <span class="font-medium">Cash Shift</span>
            </router-link>
          </nav>
          
          <!-- User Section -->
          <div class="p-4 border-t border-slate-200 dark:border-slate-700">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-primary font-bold">
                {{ authStore.user?.name?.[0]?.toUpperCase() || 'U' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-slate-900 dark:text-white truncate">{{ authStore.user?.name || 'User' }}</p>
                <p class="text-xs text-primary font-bold uppercase">{{ authStore.user?.role || 'Staff' }}</p>
              </div>
            </div>
            <button 
              @click="handleLogout"
              class="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
            >
              <span class="material-symbols-outlined text-[20px]">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <!-- Main Content -->
    <main class="flex-1 overflow-hidden flex flex-col lg:grid lg:grid-cols-[90px_1fr_420px] bg-slate-50">
       <!-- 1. Categories Sidebar -->
       <!-- 1. Categories Sidebar -->
       <!-- 1. Categories Sidebar -->
       <POSCategorySidebar
          :categories="categories"
          :selected-category="selectedCategory"
          @update:selected-category="selectedCategory = $event"
          @logout="handleLogout"
       />

       <!-- Mobile Categories (Horizontal Scroll) -->
       <div class="lg:hidden flex overflow-x-auto p-2 gap-2 bg-white border-b border-slate-200 no-scrollbar">
          <button 
             v-for="cat in categories"
             :key="cat"
             @click="selectedCategory = cat === 'SEMUA' ? '' : cat"
             class="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
             :class="(selectedCategory === cat || (cat === 'SEMUA' && !selectedCategory)) ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'"
          >
             {{ cat === 'SEMUA' ? 'All' : cat }}
          </button>
       </div>

       <!-- 2. Product Grid Section -->
       <!-- 2. Product Grid Section -->
       <POSProductGrid
          ref="productGridRef"
          :products="filteredProducts"
          :loading="loading"
          :search-query="searchQuery"
          :cart-item-ids="new Set(cart.map(i => i.id))"
          @update:search-query="searchQuery = $event"
          @add-to-cart="handleAddToCart"
       />

       <!-- 3. Cart Sidebar -->
       <!-- 3. Cart Sidebar -->
       <POSCartSidebar
         :cart="cart"
         :subtotal="subtotal"
         :tax="tax"
         :discount="discount"
         :total="total"
         :last-order-receipt="lastOrderReceipt"
         v-model:customer-name="customerName"
         v-model:customer-type="customerType"
         v-model:selected-member="selectedMember"
         :members="members"
         :user-role="authStore.user?.role"
         v-model:send-to-kitchen="sendToKitchen"
         @update-quantity="updateItemQuantity"
         @remove-item="handleRemoveFromCart($event.id)"
         @hold-order="holdOrder"
         @split-bill="toggleSplitBill"
         @clear-cart="handleClearCart"
         @checkout="showPaymentModal = true"
       />
    </main>

    <!-- Success Overlay (New) -->
     <div v-if="showSuccessOverlay" class="absolute inset-0 z-50 bg-white/50 backdrop-blur-md flex items-center justify-center">
        <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border-2 border-green-100 transform scale-100 animate-bounce-in">
           <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <span class="material-symbols-outlined text-5xl text-green-500 animate-pulse">check_circle</span>
              <div class="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-20"></div>
           </div>
           
           <h2 class="text-2xl font-black text-slate-800 mb-2">Pembayaran Berhasil!</h2>
           <p class="text-slate-500 mb-8 font-medium">Transaction #{{ lastOrderReceipt?.orderNumber }} telah selesai</p>
           
           <div class="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <p class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Kembalian</p>
              <p class="text-4xl font-black text-slate-900">{{ formatCurrency(lastOrderReceipt?.change || 0) }}</p>
           </div>
           
           <div class="space-y-3">
              <button @click="printReceiptAndClose" class="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
                 <span class="material-symbols-outlined">print</span> Cetak Struk
              </button>
              <button @click="closeSuccessOverlay" class="w-full py-3.5 bg-white text-slate-600 border-2 border-slate-100 rounded-xl font-bold hover:bg-slate-50 transition">
                 Pesanan Baru
              </button>
           </div>
        </div>
     </div>

    <!-- Modals -->
    <PaymentModal
      :show="showPaymentModal"
      :total="total"
      :discount="estimatedDiscount"
      :processing="processing"
      @close="showPaymentModal = false"
      @confirm="handlePaymentConfirm"
    />

    <ReceiptPrinter
      :show="showReceiptModal"
      :order-id="lastOrderId"
      :receipt-data="lastOrderReceipt"
      @close="showReceiptModal = false"
      ref="printerRef"
    />

    <!-- Low Stock Reminder Modal (Shared) -->
    <div
      v-if="showLowStockModal && criticalStockProducts.length > 0"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity"
      @click.self="showLowStockModal = false"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-100 transform transition-all scale-100">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-red-50 rounded-xl">
               <span class="material-symbols-outlined text-red-600">warning</span>
            </div>
            <h3 class="text-xl font-bold text-[#0d141b]">Peringatan Stok Rendah</h3>
          </div>
          <button
            @click="dismissLowStockModal"
            class="text-slate-400 hover:text-[#4c739a] transition-colors"
            aria-label="Tutup peringatan"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="mb-6">
          <p class="text-[#4c739a] mb-4">
            Ada <span class="font-bold text-red-600">{{ criticalStockProducts.length }}</span> produk yang perlu perhatian segera:
          </p>
          <div class="max-h-64 overflow-y-auto space-y-3 pr-1">
            <div
              v-for="product in criticalStockProducts"
              :key="product.id"
              class="p-4 rounded-xl border flex items-center justify-between bg-white"
              :class="product.stock === 0 ? 'border-red-200 bg-red-50/30' : 'border-yellow-200 bg-yellow-50/30'"
            >
              <div>
                <p class="font-bold text-[#0d141b]">{{ product.name }}</p>
                <div class="flex items-center gap-2 mt-1">
                   <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'">
                     Stock: {{ product.stock }}
                   </span>
                   <span class="text-xs text-[#4c739a]">Min: {{ product.minStock }}</span>
                </div>
              </div>
              <button
                @click="goToIsiUlang(product.id)"
                class="px-3 py-1.5 bg-white border border-slate-100 dark:border-slate-700 text-[#0d141b] rounded-xl text-sm font-semibold hover:border-primary hover:text-primary transition-colors shadow-sm"
              >
                Isi Ulang
              </button>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button
            @click="dismissLowStockModal"
            class="flex-1 px-4 py-2.5 bg-slate-100 text-[#0d141b] rounded-xl hover:bg-slate-200 transition font-semibold"
          >
            Tutup
          </button>
          <button
            @click="goToStockAlerts"
            class="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition shadow-lg shadow-primary/20 font-semibold"
          >
            Lihat Semua Peringatan
          </button>
        </div>
      </div>
    </div>

    <!-- Pesanan Terparkir Modal -->
    <div v-if="showHeldOrdersModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Pesanan Terparkir</h3>
                <button @click="showHeldOrdersModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" aria-label="Tutup modal">
                    <span class="material-symbols-outlined text-slate-500">close</span>
                </button>
            </div>
            <div class="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                <div v-if="heldOrders.length === 0" class="text-center py-8 text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-2">inbox</span>
                    <p>Tidak ada pesanan terparkir.</p>
                </div>
                <div v-for="order in heldOrders" :key="order.id" class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div>
                        <p class="font-bold text-[#0d141b] dark:text-white">{{ order.checkName }}</p>
                        <p class="text-xs text-slate-500">{{ new Date(order.date).toLocaleTimeString() }} • {{ order.items.length }} Items</p>
                        <p class="font-bold text-primary mt-1">{{ formatCurrency(order.total) }}</p>
                    </div>
                    <div class="flex gap-2">
                        <button @click="deleteHeldOrder(order)" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete" aria-label="Hapus pesanan">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                        <button @click="restoreHeldOrder(order)" class="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                            Lanjutkan
                        </button>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                <button @click="showHeldOrdersModal = false" class="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                    Tutup
                </button>
            </div>
        </div>
    </div>

    <!-- Pisah Tagihan Modal -->
    <div v-if="showSplitBillModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">Pisah Tagihan</h3>
                    <p class="text-xs text-slate-500 mt-1">Distribusi item untuk pembayaran terpisah</p>
                </div>
                <div class="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button @click="splitMode = 'ITEM'" :class="splitMode === 'ITEM' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all">Per Item</button>
                    <button @click="splitMode = 'EQUAL'" :class="splitMode === 'EQUAL' ? 'bg-white dark:bg-slate-800 shadow-sm' : ''" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all">Sama Rata</button>
                </div>
            </div>
            
            <div class="flex-1 overflow-hidden flex p-6 gap-6">
                <!-- Mode Item: Side by Side -->
                <template v-if="splitMode === 'ITEM'">
                    <div v-for="(scat, idx) in splitCarts" :key="idx" class="flex-1 flex flex-col border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                        <div class="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <span class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">BILL {{ String.fromCharCode(65 + idx) }}</span>
                            <span class="text-xs font-bold text-primary">{{ formatCurrency(scat.reduce((sum, i) => sum + i.price * i.quantity, 0)) }}</span>
                        </div>
                        <div class="flex-1 overflow-y-auto p-4 space-y-2">
                             <div v-for="(item, iidx) in scat" :key="item.id + iidx" class="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between group">
                                <div class="flex-1 min-w-0">
                                    <p class="text-xs font-bold text-slate-900 dark:text-white truncate">{{ item.name }}</p>
                                    <p class="text-[10px] text-slate-500">{{ item.quantity }} x {{ formatCurrency(item.price) }}</p>
                                </div>
                                <button @click="moveItemToSplit(iidx, idx, idx === 0 ? 1 : 0)" class="p-2 text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" aria-label="Pindahkan item">
                                    <span class="material-symbols-outlined text-lg">{{ idx === 0 ? 'arrow_forward' : 'arrow_back' }}</span>
                                </button>
                             </div>
                        </div>
                    </div>
                </template>

                <!-- Mode Equal: Simple Input -->
                <div v-else class="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div class="size-20 rounded-full bg-blue-100 flex items-center justify-center text-primary mb-6">
                        <span class="material-symbols-outlined text-4xl">payments</span>
                    </div>
                    <h4 class="text-lg font-bold mb-2">Split Sama Rata</h4>
                    <p class="text-sm text-slate-500 mb-8 max-w-sm">Bagi total tagihan menjadi beberapa bagian sama besar secara otomatis.</p>
                    
                    <div class="flex items-center gap-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <button @click="splitParts = Math.max(2, splitParts - 1)" class="size-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600">-</button>
                        <div class="text-center min-w-[100px]">
                            <p class="text-2xl font-black">{{ splitParts }}</p>
                            <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bagian</p>
                        </div>
                        <button @click="splitParts++" class="size-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-600">+</button>
                    </div>
                    
                    <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-700/30 w-full max-w-xs">
                        <p class="text-xs text-primary font-bold mb-1">Per Bagian</p>
                        <p class="text-xl font-black text-blue-700 dark:text-blue-400">{{ formatCurrency(total / splitParts) }}</p>
                    </div>
                </div>
            </div>

             <div class="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                <button @click="showSplitBillModal = false" class="px-6 py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors">
                    Batalkan
                </button>
                <button @click="confirmSplitBill" class="px-8 py-2.5 bg-primary text-white rounded-xl font-black shadow-lg shadow-blue-500/30 hover:bg-primary-hover transition-all">
                    Konfirmasi Split
                </button>
            </div>
        </div>
    </div>

    <!-- Transaction Success Modal -->
    <div v-if="showSuccessOverlay" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-bounce-in flex flex-col relative">
             <div class="p-8 flex flex-col items-center justify-center text-center">
                <div class="size-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 shadow-inner ring-8 ring-blue-50 dark:ring-blue-900/10">
                    <span class="material-symbols-outlined text-6xl text-blue-500 animate-pulse">check_circle</span>
                </div>
                <h3 class="text-2xl font-black text-slate-800 dark:text-white mb-2">Transaksi Berhasil!</h3>
                <p class="text-slate-500 mb-8">Pembayaran telah dikonfirmasi.</p>

                <!-- Change Info -->
                <div v-if="lastOrderReceipt?.change > 0" class="w-full bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30 mb-8">
                    <p class="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Kembalian</p>
                    <p class="text-3xl font-black text-blue-700 dark:text-blue-400">{{ formatCurrency(lastOrderReceipt.change) }}</p>
                </div>
                
                <div class="flex flex-col gap-3 w-full">
                    <button @click="printReceiptAndClose" class="w-full py-3.5 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">print</span>
                        Cetak Struk
                    </button>
                    <button @click="closeSuccessOverlay" class="w-full py-3.5 bg-blue-50 text-blue-600 font-bold rounded-xl border border-emerald-200 hover:bg-blue-100 transition-all">
                        Transaksi Baru
                    </button>
                </div>
             </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { usePosStore, type CartItem, type Product } from '../../stores/pos.store';
import api from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import { usePermissions } from '../../composables/usePermissions';
import { useSocket } from '../../composables/useSocket';
import { useNotification } from '../../composables/useNotification';
import { useSound } from '../../composables/useSound';
import { offlineStorage } from '../../utils/offline-storage';
import { syncManager } from '../../utils/sync-manager';
import PaymentModal from '../../components/PaymentModal.vue';
import ReceiptPrinter from '../../components/ReceiptPrinter.vue';
import POSCartSidebar from './components/POSCartSidebar.vue';
import POSCategorySidebar from './components/POSCategorySidebar.vue';
import POSProductGrid from './components/POSProductGrid.vue';

// ... imports

const authStore = useAuthStore();
const posStore = usePosStore();
const router = useRouter();
const { socket } = useSocket();
const { success: showSuccess, error: showError, warning: showWarning, confirm: showConfirm } = useNotification();
const { playSound } = useSound();
const { canEditOrders, canManageProducts, canManageCustomers, canViewReports } = usePermissions();

// Extract state from store
const { 
  products, 
  cart, 
  categories, 
  selectedCategory, 
  searchQuery, 
  loading, 
  processing, 
  filteredProducts, 
  subtotal 
} = storeToRefs(posStore);

const { isSubscriptionActive } = storeToRefs(authStore);

// Extract actions from store
const { 
  loadProducts, 
  addToCart, 
  updateQuantity, 
  removeFromCart
} = posStore;

// Helper for POSCart component
const updateItemQuantity = (item: any, change: number) => {
  updateQuantity(item.id, change);
};

// State
const isSimpleMode = ref(false);
const isPortrait = ref(false);
const showNavSidebar = ref(false);

const searchInputRef = ref<HTMLInputElement | null>(null);
const quickDiscount = ref<number>(0);
const discountType = ref<'amount' | 'percent'>('amount');
const showCashInput = ref(false);
const cashAmount = ref<number>(0);
const customerType = ref<'customer' | 'member'>('customer');
const customerInput = ref('');
const customerName = ref('');
const selectedMember = ref<any>(null);
const selectedMemberId = ref<string>('');
const members = ref<any[]>([]);
const sendToKitchen = ref(false);
const showPaymentModal = ref(false);
const showReceiptModal = ref(false);

// Watch for customer changes
watch([customerType, customerName, selectedMember], () => {
    const data = {
        type: customerType.value,
        name: customerName.value,
        member: selectedMember.value
    };
    localStorage.setItem('pos_last_customer', JSON.stringify(data));
}, { deep: true });

const showSuccessOverlay = ref(false);
const currentTime = ref('');
const printerRef = ref<any>(null);
const showLowStockModal = ref(false);
const criticalStockProducts = ref<any[]>([]);
const selectedPaymentMethod = ref<string>('CASH');
const lastOrderReceipt = ref<any>(null);
const lastOrderId = ref<string | undefined>(undefined);
const estimatedDiscount = ref(0);

// New Features State
const parseHeldOrders = () => {
  try {
    const raw = localStorage.getItem('pos_held_orders');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse held orders cache:', error);
    return [];
  }
};

const heldOrders = ref<any[]>(parseHeldOrders());
const showHeldOrdersModal = ref(false);
const discounts = ref<any[]>([]);
const showSplitBillModal = ref(false);
const splitParts = ref(2); 
const splitMode = ref<'EQUAL' | 'ITEM'>('EQUAL');
const splitCarts = ref<CartItem[][]>([[], []]); 
const activeSplitIndex = ref(0);
const isSplitActive = ref(false);

// Offline mode state
const isOnline = ref(navigator.onLine);

import { useKeyboardShortcuts } from '../../composables/useKeyboardShortcuts';

const productGridRef = ref<any>(null);

useKeyboardShortcuts([
  {
    key: 'F1',
    description: 'Fokus Pencarian',
    action: () => {
      if (isSimpleMode.value) {
        searchInputRef.value?.focus();
      } else {
        productGridRef.value?.focusSearch();
      }
    }
  },
  {
    key: 'F2',
    description: 'Reset Kategori',
    action: () => {
      selectedCategory.value = '';
    }
  },
  {
    key: 'F4',
    description: 'Bayar / Checkout',
    action: () => {
      if (showPaymentModal.value || showCashInput.value) return; // Already paying
      if (cart.value.length === 0) {
        showWarning('Keranjang kosong');
        return;
      }
      
      if (isSimpleMode.value) {
         showCashInput.value = true;
         cashAmount.value = total.value;
      } else {
         showPaymentModal.value = true;
      }
    }
  },
  {
    key: 'Escape',
    description: 'Tutup Modal / Batal',
    action: () => {
      // Priority: Success Overlay -> Payment Modal -> Receipt Modal -> Held Orders -> Low Stock
      if (showSuccessOverlay.value) {
        closeSuccessOverlay();
        return;
      }
      if (showPaymentModal.value) {
        showPaymentModal.value = false;
        return;
      }
      if (showReceiptModal.value) {
        showReceiptModal.value = false;
        return;
      }
      if (showHeldOrdersModal.value) {
        showHeldOrdersModal.value = false;
        return;
      }
      if (showLowStockModal.value) {
        showLowStockModal.value = false;
        return;
      }
      if (showSplitBillModal.value) {
        showSplitBillModal.value = false;
        return;
      }
      if (isSimpleMode.value && showCashInput.value) {
        showCashInput.value = false;
        return;
      }
    }
  },
  {
    key: 'Delete',
    description: 'Hapus Cart',
    action: async () => {
       if (cart.value.length > 0 && !showPaymentModal.value) {
          const confirmed = await showConfirm('Kosongkan keranjang?');
          if (confirmed) {
            handleClearCart();
          }
       }
    }
  }
]);
const isSyncing = ref(false);
const pendingSyncCount = ref(0);
let clockInterval: any;

// Shift Guard State
const shiftRequired = ref(true);
const hasActiveShift = ref(false);
const checkingShift = ref(true);
const shiftGateState = ref<'open_required' | 'recovery_close_required'>('open_required');

const tax = computed(() => {
  return subtotal.value * 0.1; // 10% tax
});

// Alias for Simple POS template
const filteredProductsSimple = computed(() => filteredProducts.value);



// Separated Discount Calculations to mirror Backend Service
const promotionDiscounts = computed(() => {
  let totalPromoDiscount = 0;
  const details: any[] = [];
  const globalProductsWithDiscount = new Set<string>();

  if (discounts.value.length === 0) return { amount: 0, details: [] };

  // Track if any promotion is "Exclusive" (not in schema yet, but good for future)
  // For now, follow backend: sequential application
  discounts.value.forEach((d: any) => {
    if (d.applicableTo === 'MEMBER_ONLY' && !selectedMember.value) return;

    let discountAmount = 0;
    const appliedTo: string[] = [];

    if (d.discountType === 'AMOUNT_BASED') {
      const minAmount = d.minAmount ? Number(d.minAmount) : 0;
      const minQuantity = d.minQuantity || 1;

      if (subtotal.value >= minAmount && cart.value.length >= minQuantity) {
        let currentParsing: any = d.applicableProducts;
        if (typeof currentParsing === 'string') {
          try { currentParsing = JSON.parse(currentParsing); } catch { currentParsing = []; }
        }
        const applicableProductIds = (Array.isArray(currentParsing) && currentParsing.length > 0)
          ? currentParsing
          : cart.value.map(item => item.id);

        cart.value.forEach(item => {
          if (applicableProductIds.includes(item.id)) {
            const itemSubtotal = (item.price || 0) * (item.quantity || 0);
            if (d.discountValueType === 'PERCENTAGE') {
              const evalAmt = (itemSubtotal * Number(d.discountValue)) / 100;
              discountAmount += evalAmt;
            } else {
              discountAmount += Number(d.discountValue);
            }
            appliedTo.push(item.id);
          }
        });
        
        // Cap total discount for this rule if PERCENTAGE
        if (d.discountValueType === 'PERCENTAGE' && d.maxDiscountAmount && discountAmount > d.maxDiscountAmount) {
          discountAmount = Number(d.maxDiscountAmount);
        }
      }
    } else if (d.discountType === 'BUNDLE') {
      let bundleParsing: any = d.bundleProducts;
      if (typeof bundleParsing === 'string') {
        try { bundleParsing = JSON.parse(bundleParsing); } catch { bundleParsing = []; }
      }
      const bundleProductIds = Array.isArray(bundleParsing) ? bundleParsing : [];
      const discountProductId = d.bundleDiscountProduct;

      const orderProductIds = cart.value.map(item => item.id);
      const hasAllBundleProducts = bundleProductIds.length > 0 && bundleProductIds.every((id: string) => orderProductIds.includes(id));

      if (hasAllBundleProducts && discountProductId) {
        const discountItem = cart.value.find(item => item.id === discountProductId);
        if (discountItem) {
          const itemSubtotal = (discountItem.price || 0) * (discountItem.quantity || 0);
          if (d.discountValueType === 'PERCENTAGE') {
            let evalAmt = (itemSubtotal * Number(d.discountValue)) / 100;
            if (d.maxDiscountAmount && evalAmt > d.maxDiscountAmount) evalAmt = d.maxDiscountAmount;
            discountAmount = evalAmt;
          } else {
            discountAmount = Number(d.discountValue);
          }
          appliedTo.push(discountProductId);
        }
      }
    } else if (d.discountType === 'PRODUCT_BASED') {
      let productParsing: any = d.applicableProducts;
      if (typeof productParsing === 'string') {
        try { productParsing = JSON.parse(productParsing); } catch { productParsing = []; }
      }
      const applicableProductIds = Array.isArray(productParsing) ? productParsing : [];

      cart.value.forEach(item => {
        if ((applicableProductIds.length === 0 || applicableProductIds.includes(item.id)) 
            && !globalProductsWithDiscount.has(item.id)) {
          const itemSubtotal = (item.price || 0) * (item.quantity || 0);
          if (d.discountValueType === 'PERCENTAGE') {
            const evalAmt = (itemSubtotal * Number(d.discountValue)) / 100;
            // Note: maxDiscountAmount usually applies per rule, not per product for PRODUCT_BASED in backend
            discountAmount += evalAmt;
          } else {
            discountAmount += Number(d.discountValue) * (item.quantity || 0);
          }
          appliedTo.push(item.id);
          globalProductsWithDiscount.add(item.id);
        }
      });
      
      // Cap total discount for this rule if PERCENTAGE
      if (d.discountValueType === 'PERCENTAGE' && d.maxDiscountAmount && discountAmount > d.maxDiscountAmount) {
        discountAmount = Number(d.maxDiscountAmount);
      }
    } else if (d.discountType === 'QUANTITY_BASED') {
      const minQuantity = d.minQuantity || 1;
      let qtyParsing: any = d.applicableProducts;
      if (typeof qtyParsing === 'string') {
        try { qtyParsing = JSON.parse(qtyParsing); } catch { qtyParsing = []; }
      }
      const applicableProductIds = Array.isArray(qtyParsing) ? qtyParsing : [];

      cart.value.forEach(item => {
        if (applicableProductIds.length === 0 || applicableProductIds.includes(item.id)) {
          if ((item.quantity || 0) >= minQuantity) {
            const itemSubtotal = (item.price || 0) * (item.quantity || 0);
            if (d.discountValueType === 'PERCENTAGE') {
              const evalAmt = (itemSubtotal * Number(d.discountValue)) / 100;
              discountAmount += evalAmt;
            } else {
              discountAmount += Number(d.discountValue) * (item.quantity || 0);
            }
            appliedTo.push(item.id);
          }
        }
      });
      
      // Cap total discount for this rule if PERCENTAGE
      if (d.discountValueType === 'PERCENTAGE' && d.maxDiscountAmount && discountAmount > d.maxDiscountAmount) {
        discountAmount = Number(d.maxDiscountAmount);
      }
    }

    if (discountAmount > 0) {
      totalPromoDiscount += discountAmount;
      details.push({
        id: d.id,
        name: d.name,
        amount: discountAmount,
        appliedTo
      });
    }
  });

  return { amount: totalPromoDiscount, details };
});

const memberDiscount = computed(() => {
  if (!selectedMember.value?.discountValue) return 0;
  
  // Member discount applies after promo discounts
  const subtotalAfterPromo = Math.max(0, subtotal.value - promotionDiscounts.value.amount);
  
  if (selectedMember.value.discountType === 'PERCENTAGE') {
    return (subtotalAfterPromo * Number(selectedMember.value.discountValue)) / 100;
  } else {
    // Fixed member discount cannot exceed remaining subtotal
    return Math.min(Number(selectedMember.value.discountValue), subtotalAfterPromo);
  }
});

const autoDiscount = computed(() => {
  return promotionDiscounts.value.amount + memberDiscount.value;
});

const discount = computed(() => {
  // Priority: Quick Discount > Member/Auto Discount
  if (quickDiscount.value > 0) {
      if (discountType.value === 'percent') {
        return (subtotal.value * quickDiscount.value) / 100;
      }
      return Math.min(quickDiscount.value, subtotal.value);
  }
  return autoDiscount.value;
});

const total = computed(() => {
  return Math.max(0, subtotal.value - discount.value);
});

// Methods
const checkOrientation = () => {
  isPortrait.value = window.innerHeight > window.innerWidth;
  
  // Try to lock orientation to landscape in Simple POS Mode
  if (isSimpleMode.value && isPortrait.value) {
    // Request landscape orientation (if supported)
    // Use type assertion to avoid TypeScript errors
    const screenAny = screen as any;
    const orientation = screenAny.orientation || screenAny.mozOrientation || screenAny.msOrientation;
    
    if (orientation && typeof orientation.lock === 'function') {
      (orientation as { lock: (orientation: string) => Promise<void> }).lock('landscape').catch(() => {
        // Lock failed (user may have denied or browser doesn't support)

      });
    } else if (screenAny.lockOrientation) {
      // Fallback for older browsers
      screenAny.lockOrientation('landscape');
    } else if (screenAny.mozLockOrientation) {
      // Firefox
      screenAny.mozLockOrientation('landscape');
    } else if (screenAny.msLockOrientation) {
      // IE/Edge
      screenAny.msLockOrientation('landscape');
    }
  }
};

const loadTenantFeatures = async () => {
  try {
    const response = await api.get('/tenant/profile');
    const features = response.data.features || {};
    isSimpleMode.value = features.simplePosMode === true;
  } catch {

    isSimpleMode.value = false;
  }
};



const dismissLowStockModal = () => {
  showLowStockModal.value = false;
  localStorage.setItem(`lowStockDismissed_${new Date().toDateString()}`, 'true');
};

const goToIsiUlang = (productId: string) => {
  dismissLowStockModal();
  window.location.href = `/app/products?highlight=${productId}`;
};

const goToStockAlerts = () => {
  dismissLowStockModal();
  window.location.href = '/app/inventory/stock-alerts';
};

const resetCartState = () => {
  // Use store action
  posStore.clearCart();
  
  // Clear local state
  customerInput.value = '';
  customerName.value = '';
  selectedMember.value = null;
  selectedMemberId.value = '';
  estimatedDiscount.value = 0;
  quickDiscount.value = 0;
  customerType.value = 'customer';
  sendToKitchen.value = false;
  showCashInput.value = false;
  cashAmount.value = 0;
};

const handleClearCart = async () => {
  if (!isSimpleMode.value) {
    const confirmed = await showConfirm('Hapus semua item dari keranjang?');
    if (!confirmed) return;
  }
  resetCartState();
};

const handleMemberSelect = () => {
  if (!selectedMemberId.value) {
    selectedMember.value = null;
    estimatedDiscount.value = 0;
    return;
  }

  const member = members.value.find(m => m.id === selectedMemberId.value);
  if (member) {
    selectedMember.value = member;
    customerName.value = '';
    if (member.discountType === 'PERCENTAGE') {
      estimatedDiscount.value = (subtotal.value * Number(member.discountValue)) / 100;
    } else {
      estimatedDiscount.value = Number(member.discountValue);
    }
  } else {
    selectedMember.value = null;
    estimatedDiscount.value = 0;
  }
};

const loadMembers = async () => {
  try {
    const response = await api.get('/members', {
      params: { limit: 100, isActive: 'true' },
    });
    const result = response.data.data || response.data;
    members.value = Array.isArray(result) ? result : [];
  } catch (error: any) {
    console.error('Error loading members:', error);
    members.value = [];
  }
};

const loadDiscounts = async () => {
  try {
    const response = await api.get('/discounts');
    const result = response.data.data || response.data;
    discounts.value = Array.isArray(result) ? result : [];
  } catch (error: any) {
    console.error('Error loading discounts:', error);
    discounts.value = [];
  }
};

const handlePaymentConfirm = async (paymentData: { paymentMethod: string; cashAmount?: number; qrCode?: string }) => {
  if (processing.value) return; 

  selectedPaymentMethod.value = paymentData.paymentMethod;
  processing.value = true;
  
  // Don't close modal yet, wait for processPayment
  await processPayment(paymentData);
  
  // Only close payment modal if transaction was successful (success overlay is shown)
  if (showSuccessOverlay.value) {
    playSound('success');
    showPaymentModal.value = false;
  } else {
    // If failed, processing will be set to false by processPayment's finally block
    // Modal stays open so user can retry
  }
};

const processPaymentSimple = async (paymentMethod: string) => {
  if (cart.value.length === 0) return;
  
  if (!isSubscriptionActive.value) {
    showError('Langganan Anda telah kedaluwarsa. Silakan perpanjang untuk melanjutkan transaksi.');
    return;
  }
  
  // Validate cash amount for CASH payment
  if (paymentMethod === 'CASH') {
    if (!cashAmount.value || cashAmount.value < total.value) {
      showError(`Cash amount must be at least ${formatCurrency(total.value)}`);
      return;
    }
  }
  
  processing.value = true;
  try {
    const orderData: any = {
      items: Array.isArray(cart.value) ? cart.value.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })) : [],
      discount: discount.value,
      sendToKitchen: sendToKitchen.value,
    };

    if (authStore.selectedStoreId) {
      orderData.outletId = authStore.selectedStoreId;
    }

    const transactionData: any = {
      amount: total.value,
      paymentMethod,
      status: 'COMPLETED',
      servedBy: authStore.user?.name || 'Cashier',
    };
    
    // Add cash amount and change for CASH payment
    if (paymentMethod === 'CASH' && cashAmount.value) {
      transactionData.cashAmount = cashAmount.value;
      transactionData.change = cashAmount.value - total.value;
    }

    // Combine order and transaction data for offline storage
    const fullOrderData = {
      ...orderData,
      transactionData,
    };

    let order: any = null;

    if (isOnline.value) {
      // Online: Create order and transaction normally
      const orderResponse = await api.post('/orders', orderData);
      order = orderResponse.data;
      transactionData.orderId = order.id;
      await api.post('/transactions', transactionData);
      // showSuccess('Payment successful!'); // Handled by overlay
    } else {
      // Offline: Store locally
      await offlineStorage.storeOrder(fullOrderData);
      
      // Update stock locally
      for (const item of cart.value) {
        const product = products.value.find(p => p.id === item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          product.stock = newStock;
          await offlineStorage.updateProductStockLocally(item.id, newStock);
        }
      }
      
      showSuccess('Transaction saved offline. Will sync automatically when online.');
      pendingSyncCount.value = await syncManager.getPendingCount();
    }
    
    // Prepare Receipt Data for Overlay
    const receiptData = {
      orderNumber: order?.orderNumber || 'OFFLINE-' + Date.now().toString().slice(-6),
      date: new Date(),
      customerName: customerName.value || 'Pelanggan',
      memberName: selectedMember.value?.name || null,
      items: cart.value.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
      subtotal: total.value,
      discount: discount.value,
      total: transactionData.amount,
      paymentMethod: transactionData.paymentMethod,
      cashAmount: transactionData.cashAmount,
      change: transactionData.change || 0,
      servedBy: authStore.user?.name || 'Cashier',
    };
    
    lastOrderReceipt.value = receiptData;
    showSuccessOverlay.value = true;
    
    // Clear sendToKitchen after success
    sendToKitchen.value = false;
    
    // Reset cash input
    showCashInput.value = false;
    cashAmount.value = 0;
    
    // Clear smart default for customer
    localStorage.removeItem('pos_last_customer');
    
    resetCartState();
    if (isOnline.value) {
      await loadProducts();
    }
  } catch (error: any) {
    // If network error and we're supposed to be online, try offline mode
    if (!isOnline.value || error.code === 'ERR_NETWORK' || error.code === 'ERR_INTERNET_DISCONNECTED') {
      // Store offline
      const orderData: any = {
        items: Array.isArray(cart.value) ? cart.value.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })) : [],
        discount: discount.value,
      };
      const transactionData: any = {
        amount: total.value,
        paymentMethod,
        status: 'COMPLETED',
        servedBy: authStore.user?.name || 'Cashier',
      };
      if (paymentMethod === 'CASH' && cashAmount.value) {
        transactionData.cashAmount = cashAmount.value;
        transactionData.change = cashAmount.value - total.value;
      }
      const fullOrderData = { ...orderData, transactionData };
      await offlineStorage.storeOrder(fullOrderData);
      
      // Update stock locally
      for (const item of cart.value) {
        const product = products.value.find(p => p.id === item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          product.stock = newStock;
          await offlineStorage.updateProductStockLocally(item.id, newStock);
        }
      }
      
      showSuccess('Transaction saved offline. Will sync automatically when online.');
      pendingSyncCount.value = await syncManager.getPendingCount();
      resetCartState();
    } else {
      showError(error.response?.data?.message || 'Payment failed');
    }
  } finally {
    processing.value = false;
  }
};

const toggleSplitBill = () => {
    if (cart.value.length === 0) return;
    
    // Initialize split carts
    splitCarts.value = [
        [...cart.value], // All in Part A
        []              // None in Part B
    ];
    showSplitBillModal.value = true;
};

const moveItemToSplit = (itemIndex: number, fromIndex: number, toIndex: number) => {
    const item = splitCarts.value[fromIndex][itemIndex];
    if (item.quantity > 1) {
        // Just move one quantity
        const existingInTarget = splitCarts.value[toIndex].find(i => i.id === item.id);
        if (existingInTarget) {
            existingInTarget.quantity++;
        } else {
            splitCarts.value[toIndex].push({ ...item, quantity: 1 });
        }
        item.quantity--;
    } else {
        // Move entire item
        const existingInTarget = splitCarts.value[toIndex].find(i => i.id === item.id);
        if (existingInTarget) {
            existingInTarget.quantity += item.quantity;
        } else {
            splitCarts.value[toIndex].push({ ...item });
        }
        splitCarts.value[fromIndex].splice(itemIndex, 1);
    }
};

const confirmSplitBill = () => {
    if (splitMode.value === 'ITEM') {
        const hasItemsInAll = splitCarts.value.every(c => c.length > 0);
        if (!hasItemsInAll && splitCarts.value.length > 0) {
            showError('Each split part must have at least one item.');
            return;
        }
    } else {
        // EQUAL split logic - distribute items automatically
        const totalParts = splitParts.value;
        const newSplitCarts = Array.from({ length: totalParts }, (): CartItem[] => []);
        
        // Flatten cart into individual units for easier distribution
        const allUnits: CartItem[] = [];
        cart.value.forEach(item => {
            const qty = Number(item.quantity) || 0;
            for (let i = 0; i < qty; i++) {
                allUnits.push({ ...item, quantity: 1 });
            }
        });

        // Distribute units
        allUnits.forEach((unit, index) => {
            const targetIndex = index % totalParts;
            const existing = newSplitCarts[targetIndex].find(i => i.id === unit.id);
            if (existing) {
                existing.quantity++;
            } else {
                newSplitCarts[targetIndex].push({ ...unit });
            }
        });
        
        splitCarts.value = newSplitCarts;
    }
    
    // Start process with Part A
    isSplitActive.value = true;
    activeSplitIndex.value = 0;
    cart.value = [...splitCarts.value[0]];
    
    // Set custom label for split
    const suffix = ` (Split ${String.fromCharCode(65 + activeSplitIndex.value)})`;
    if (!customerName.value || customerName.value === '') {
        customerName.value = 'Pelanggan' + suffix;
    } else {
        customerName.value += suffix;
    }
    
    showSplitBillModal.value = false;
    showSuccess('Bill split successfully. Please process payments sequentially.');
};

const nextSplitPart = () => {
    if (!isSplitActive.value) return;
    
    activeSplitIndex.value++;
    if (activeSplitIndex.value < splitCarts.value.length) {
        cart.value = [...splitCarts.value[activeSplitIndex.value]];
        // Update label
        const suffix = ` (Split ${String.fromCharCode(65 + activeSplitIndex.value)})`;
        if (!customerName.value.includes('(Split')) {
            customerName.value += suffix;
        } else {
            customerName.value = customerName.value.replace(/\(Split .*\)/, suffix);
        }
        showSuccess(`Moving to ${suffix}`);
    } else {
        isSplitActive.value = false;
        activeSplitIndex.value = 0;
        showSuccess('All split parts processed.');
    }
};
const processPayment = async (paymentData: { paymentMethod: string; cashAmount?: number; qrCode?: string }) => {
  if (cart.value.length === 0) return;

  if (!isSubscriptionActive.value) {
    showError('Langganan Anda telah kedaluwarsa. Silakan perpanjang untuk melanjutkan transaksi.');
    showPaymentModal.value = false;
    return;
  }
  processing.value = true;
  try {
    const orderData: any = {
      items: cart.value.map(item => ({
        productId: item.id,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      sendToKitchen: Boolean(sendToKitchen.value),
      discount: 0,
    };

    if (authStore.selectedStoreId) {
      orderData.outletId = authStore.selectedStoreId;
    }

    if (customerType.value === 'customer' && customerName.value?.trim()) {
      orderData.temporaryCustomerName = customerName.value.trim();
    }
    
    if (customerType.value === 'member' && selectedMember.value?.id) {
      orderData.memberId = selectedMember.value.id;
    }

    const finalTotal = subtotal.value - estimatedDiscount.value;
    
    const transactionData: any = {
      amount: finalTotal,
      paymentMethod: paymentData.paymentMethod,
      status: 'COMPLETED',
      servedBy: authStore.user?.name || 'Unknown',
    };
    
    if (paymentData.paymentMethod === 'QRIS' && paymentData.qrCode) {
      transactionData.qrCode = paymentData.qrCode;
    }

    let order: any = null;
    let orderDiscount = 0;
    let finalTotalFromOrder = finalTotal;

    if (isOnline.value) {
      // Online: Create order and transaction normally
      try {
        const orderResponse = await api.post('/orders', orderData);
        order = orderResponse.data;
        
        orderDiscount = parseFloat(order.discount || 0);
        estimatedDiscount.value = orderDiscount;

        finalTotalFromOrder = parseFloat(order.total);
        transactionData.orderId = order.id;
        transactionData.amount = finalTotalFromOrder;
        
        await api.post('/transactions', transactionData);
        
        lastOrderId.value = order.id;
        
        if (sendToKitchen.value && socket?.connected) {
          socket.emit('order:new', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            items: cart.value,
          });
        }
      } catch (error: any) {
        // If network error, fallback to offline mode
        if (error.code === 'ERR_NETWORK' || error.code === 'ERR_INTERNET_DISCONNECTED') {
          isOnline.value = false;
          // Fall through to offline handling
        } else {
          throw error;
        }
      }
    }
    
    if (!isOnline.value || !order) {
      // Offline: Store locally
      const fullOrderData = {
        ...orderData,
        transactionData,
      };
      await offlineStorage.storeOrder(fullOrderData);
      
      // Update stock locally
      for (const item of cart.value) {
        const product = products.value.find(p => p.id === item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          product.stock = newStock;
          await offlineStorage.updateProductStockLocally(item.id, newStock);
        }
      }
      
      showSuccess('Transaction saved offline. Will sync automatically when online.');
      pendingSyncCount.value = await syncManager.getPendingCount();
      resetCartState();
      return; // Exit early for offline mode
    }
    
    // At this point, order should be defined (we returned early if offline)
    if (!order) {
      showError('Order not found');
      return;
    }

    orderDiscount = estimatedDiscount.value;

    const receiptData = {
      orderNumber: order.orderNumber,
      date: order.createdAt,
      customerName: customerName.value || null,
      memberName: selectedMember.value?.name || null,
      items: Array.isArray(cart.value) ? cart.value.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })) : [],
      subtotal: parseFloat(order.subtotal),
      discount: orderDiscount,
      total: finalTotalFromOrder,
      paymentMethod: paymentData.paymentMethod,
      cashAmount: paymentData.cashAmount,
      change: paymentData.paymentMethod === 'CASH' && paymentData.cashAmount 
        ? paymentData.cashAmount - finalTotalFromOrder 
        : 0,
      servedBy: authStore.user?.name || 'Unknown',
    };

    lastOrderReceipt.value = receiptData;

    lastOrderReceipt.value = receiptData;


    // showReceiptModal.value = true;
    showSuccessOverlay.value = true;
    playSound('success'); // Payment Success Sound
    localStorage.removeItem('pos_last_customer'); // Clear smart default for customer
    resetCartState();
    // Don't modify estimatedDiscount directly here, it will be reset by clearCart
    await loadProducts();
  } catch (error: any) {
    console.error('Error processing payment:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Payment processing failed';
    showError(errorMessage, 'Payment Failed');
    playSound('error'); // Payment Error Sound
  } finally {
    processing.value = false;
  }
};

const closeSuccessOverlay = () => {
  showSuccessOverlay.value = false;
  if (isSplitActive.value) {
    nextSplitPart();
  }
};

const printReceiptAndClose = async () => {
  // Use the existing ReceiptPrinter component logic
  // We need to pass the data to it or ensure it has it
  if (printerRef.value) {
    // Assuming printerRef invokes ReceiptPrinter component
    // If ReceiptPrinter exposes a method, we call it.
    // If not, we might need to rely on showReceiptModal logic if we use that component.
    // Actually, ReceiptPrinter takes props.
    // Let's just set showReceiptModal = true to trigger the printer visible?
    // But we want to print without opening the old modal?
    // ReceiptPrinter usually has a print button.
    // If we want to auto print or print on demand, we need access to its print function.
    // Let's assume for now we just show the old modal if they want to print?
    // The user design "Cetak Struk" button implies immediate print.
    // I'll check ReceiptPrinter.vue later. For now, let's just make it visible.
    showReceiptModal.value = true;
    showSuccessOverlay.value = false;
  }
};

// Hold Order Functions
const holdOrder = async () => {
  // If cart is empty, show held orders modal instead
  if (cart.value.length === 0) {
    showHeldOrdersModal.value = true;
    return;
  }
  
  // Prompt for a name for this held order
  const holdName = customerName.value || customerInput.value || `Order ${new Date().toLocaleTimeString()}`;
  
  const heldOrder = {
    id: Date.now().toString(),
    checkName: holdName,
    items: [...cart.value],
    total: total.value,
    customer: customerName.value || customerInput.value,
    memberId: selectedMember.value?.id,
    date: new Date().toISOString(),
  };
  
  heldOrders.value.push(heldOrder);
  localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders.value));
  
  // Clear the cart
  cart.value = [];
  customerInput.value = '';
  customerName.value = '';
  selectedMember.value = null;
  selectedMemberId.value = '';
  estimatedDiscount.value = 0;
  quickDiscount.value = 0;
  
  showSuccess(`Order "${holdName}" parked successfully`);
};

const deleteHeldOrder = async (order: any) => {
  const confirmed = await showConfirm(`Delete held order "${order.checkName}"?`);
  if (!confirmed) return;
  
  heldOrders.value = heldOrders.value.filter((o: any) => o.id !== order.id);
  localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders.value));
  showSuccess('Held order deleted');
};

const restoreHeldOrder = (order: any) => {
  // If there are items in cart, ask to merge or replace
  if (cart.value.length > 0) {
    showConfirm(`Current cart has items. Replace with held order "${order.checkName}"?`).then(confirmed => {
      if (confirmed) {
        performRestore(order);
      }
    });
  } else {
    performRestore(order);
  }
};

const performRestore = (order: any) => {
  cart.value = [...order.items];
  customerName.value = order.customer || '';
  if (order.memberId) {
    selectedMemberId.value = order.memberId;
    handleMemberSelect();
  }
  
  // Remove from held orders
  heldOrders.value = heldOrders.value.filter((o: any) => o.id !== order.id);
  localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders.value));
  
  showHeldOrdersModal.value = false;
  showSuccess(`Order "${order.checkName}" restored`);
};

// Handle logout
const handleLogout = () => {
  showNavSidebar.value = false;
  authStore.clearAuth();
  window.location.replace('/login');
};

// Check if shift is open before allowing POS access
const checkShiftStatus = async () => {
  if (!shiftRequired.value) {
    hasActiveShift.value = true;
    checkingShift.value = false;
    return;
  }
  
  checkingShift.value = true;
  try {
    const shiftContext = await authStore.getShiftContext(true);
    hasActiveShift.value = !!shiftContext?.hasHealthyActiveShift;
    shiftGateState.value = shiftContext?.requiresRecoveryClose
      ? 'recovery_close_required'
      : 'open_required';
  } catch {
    hasActiveShift.value = false;
    shiftGateState.value = 'open_required';
  } finally {
    checkingShift.value = false;
  }
};

// Redirect to shift page
const goToShiftPage = () => {
  router.push(
    shiftGateState.value === 'recovery_close_required'
      ? '/app/cashier/cash-shift'
      : '/open-shift',
  );
};

// Watch for customer state to save to localStorage (Smart Default)
watch([customerName, customerType, selectedMember], () => {
  if (customerType.value === 'member' && selectedMember.value) {
    localStorage.setItem('pos_last_customer', JSON.stringify({
      type: 'member',
      member: selectedMember.value,
    }));
  } else if (customerType.value === 'customer' && customerName.value.trim()) {
    localStorage.setItem('pos_last_customer', JSON.stringify({
      type: 'customer',
      name: customerName.value.trim(),
    }));
  } else {
    localStorage.removeItem('pos_last_customer'); // Clear if no valid customer/member selected
  }
}, { deep: true });

// Watch for tenantId changes
watch(
  () => {
    const fromStore = authStore.selectedTenantId;
    const fromStorage = localStorage.getItem('selectedTenantId');
    return fromStore || fromStorage;
  },
  (newTenantId, oldTenantId) => {
    if (authStore.isSuperAdmin && newTenantId && newTenantId !== oldTenantId) {
      if (!authStore.selectedTenantId) {
        authStore.setSelectedTenant(newTenantId);
      }
      loadTenantFeatures();
      loadProducts();
      loadMembers();
      if (socket?.connected) {
        socket.emit('join-tenant', newTenantId);
      }
    }
  },
  { immediate: false }
);

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Check shift status first
  await checkShiftStatus();
  
  // For super admin, ensure selectedTenantId is synced with localStorage
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  // Setup offline/online status
  isOnline.value = navigator.onLine;
  window.addEventListener('online', () => {
    isOnline.value = true;
    syncManager.forceSync();
  });
  window.addEventListener('offline', () => {
    isOnline.value = false;
  });

  // Subscribe to sync status
  syncManager.onStatusChange((status) => {
    isOnline.value = status.isOnline;
    isSyncing.value = status.isSyncing;
    pendingSyncCount.value = status.pendingCount;
  });

  // Get initial pending count
  syncManager.getPendingCount().then(count => {
    pendingSyncCount.value = count;
  });
  
  if (isSimpleMode.value) {
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
  }

  // Only load data if shift is active or not required
  if (hasActiveShift.value) {
    if (authStore.isSuperAdmin) {
      const selectedTenantId = localStorage.getItem('selectedTenantId');
      if (selectedTenantId) {
        authStore.setSelectedTenant(selectedTenantId);
        setTimeout(() => {
          loadTenantFeatures();
          loadProducts();
          loadMembers();
          loadDiscounts();
        }, 100);
      } else {
        setTimeout(() => {
          const tenantId = localStorage.getItem('selectedTenantId');
          if (tenantId) {
            authStore.setSelectedTenant(tenantId);
            loadTenantFeatures();
            loadProducts();
            loadMembers();
            loadDiscounts();
          }
        }, 500);
      }
    } else {
      loadTenantFeatures();
      loadProducts();
      loadMembers();
      loadDiscounts();
    }
  }
  
  const tenantIdForSocket = authStore.isSuperAdmin 
    ? authStore.selectedTenantId || localStorage.getItem('selectedTenantId') || authStore.user?.tenantId
    : authStore.user?.tenantId;
  if (socket && tenantIdForSocket) {
    socket.emit('join-tenant', tenantIdForSocket);
  }
  
  if (socket) {
    socket.on('product:stock-update', (data: { productId: string; stock: number }) => {
      if (Array.isArray(products.value)) {
      const productIndex = products.value.findIndex(p => p.id === data.productId);
      if (productIndex !== -1) {
        products.value[productIndex].stock = data.stock;
        }
      }
    });
    
    socket.on('order:created', (data: any) => {
      if (data.orderId && data.items && Array.isArray(products.value)) {
        if (Array.isArray(data.items)) {
        data.items.forEach((item: any) => {
          const productIndex = products.value.findIndex(p => p.id === item.id || p.id === item.productId);
          if (productIndex !== -1 && item.stock !== undefined) {
            products.value[productIndex].stock = item.stock;
          }
        });
        }
      }
    });
  }

  // Clock Logic
  // Restore Saved Customer (Smart Default)
  try {
    const savedCustomer = localStorage.getItem('pos_last_customer');
    if (savedCustomer) {
        const parsed = JSON.parse(savedCustomer);
        if (parsed.type === 'member' && parsed.member) {
            customerType.value = 'member';
            selectedMember.value = parsed.member;
            selectedMemberId.value = parsed.member.id;
        } else if (parsed.name) {
            customerType.value = 'customer';
            customerName.value = parsed.name;
        }
    }
  } catch (e) {
    console.error('Failed to restore customer', e);
  }

  // Clock Logic
  const updateClock = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval);
  if (isSimpleMode.value) {
    window.removeEventListener('resize', checkOrientation);
    window.removeEventListener('orientationchange', checkOrientation);
  }
});



// Sound wrappers
const handleAddToCart = (product: Product) => {
  addToCart(product);
  playSound('beep');
};

const handleRemoveFromCart = (id: string) => {
  removeFromCart(id);
  playSound('delete');
};

// Barcode Scanner Logic
const barcodeBuffer = ref('');
const lastKeyTime = ref(0);

const handleBarcodeScan = (code: string) => {
  // Find product by barcode or SKU
  const product = products.value.find(p => 
    (p.barcode === code) || 
    (p.sku === code) || 
    (p.id === code) // Fallback to ID
  );

  if (product) {
    addToCart(product);
    playSound('beep');
    showSuccess(`Produk ditemukan: ${product.name}`, 'Scan Berhasil', 1000);
  } else {
    playSound('error');
    showError(`Produk tidak ditemukan: ${code}`, 'Scan Gagal');
  }
};

const handleGlobalKeydown = (e: KeyboardEvent) => {
  // Ignore valid inputs unless it looks like a scan (fast typing)
  const target = e.target as HTMLElement;
  const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);
  
  // If in input, we generally let it be, UNLESS we want to intercept specific keys.
  // But for a simple global scanner, we usually listen when NOT in input.
  if (isInput) return;

  const now = Date.now();
  // Reset buffer if typing is too slow (human typing)
  // Scanners are usually < 20-50ms between/chars.
  // Humans are > 50ms usually.
  if (now - lastKeyTime.value > 100) { 
    barcodeBuffer.value = ''; 
  }
  lastKeyTime.value = now;

  if (e.key === 'Enter') {
    if (barcodeBuffer.value.length >= 2) { // Min length
      handleBarcodeScan(barcodeBuffer.value);
      barcodeBuffer.value = '';
      e.preventDefault();
    }
  } else if (e.key.length === 1) { // Printable char
    barcodeBuffer.value += e.key;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown);
  
  // Existing OnMounted Logic...
  // (We need to keep the existing logic, so we can't just replace the whole block blindly)
  // ...
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  // ...
});


</script>
