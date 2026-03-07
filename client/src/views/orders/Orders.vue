<template>
  <div class="flex flex-col gap-6 font-display p-6 lg:p-8 bg-slate-50 min-h-screen">
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
    <!-- Tenant Selector for Super Admin -->
    <TenantSelector @tenant-changed="handleTenantChange" />
    
    <!-- Store Selector (Only for SUPERVISOR) -->
    <div v-if="authStore.user?.role === 'SUPERVISOR'">
      <StoreSelector @store-changed="handleStoreChange" />
    </div>

    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight leading-tight">Orders & Transactions</h1>
        <p class="text-slate-500 font-medium">Manage and track all customer orders.</p>
      </div>
      <div class="flex gap-3">
        <button
          v-if="canDeleteOrders && deletableOrdersCount > 0"
          @click="deleteAllOrders"
          class="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-5 py-2.5 rounded-xl transition-all font-bold text-sm border border-red-200"
        >
          <span class="material-symbols-outlined text-[20px]">delete_sweep</span>
          <span>Clear Cancelled</span>
        </button>
        <ExportButton
          :data="orders"
          filename="orders-export"
          @export="handleExport"
        />
        
        <!-- Columns Toggle -->
        <div class="relative group">
           <button @click="showColumnMenu = !showColumnMenu" class="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition flex items-center gap-2 text-sm font-bold shadow-sm">
              <span class="material-symbols-outlined text-[18px]">view_column</span>
              Columns
           </button>
           <div v-if="showColumnMenu" class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div class="space-y-2">
                 <label class="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                    <input type="checkbox" :checked="isColumnVisible('orderInfo')" @change="toggleColumn('orderInfo')" class="rounded text-blue-500 focus:ring-blue-500">
                    <span class="text-sm font-medium text-slate-700">Order Info</span>
                 </label>
                 <label class="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                    <input type="checkbox" :checked="isColumnVisible('customer')" @change="toggleColumn('customer')" class="rounded text-blue-500 focus:ring-blue-500">
                    <span class="text-sm font-medium text-slate-700">Customer</span>
                 </label>
                 <label class="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                    <input type="checkbox" :checked="isColumnVisible('total')" @change="toggleColumn('total')" class="rounded text-blue-500 focus:ring-blue-500">
                    <span class="text-sm font-medium text-slate-700">Total</span>
                 </label>
                 <label class="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                    <input type="checkbox" :checked="isColumnVisible('status')" @change="toggleColumn('status')" class="rounded text-blue-500 focus:ring-blue-500">
                    <span class="text-sm font-medium text-slate-700">Status</span>
                 </label>
                 <label class="flex items-center gap-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                    <input type="checkbox" :checked="isColumnVisible('date')" @change="toggleColumn('date')" class="rounded text-blue-500 focus:ring-blue-500">
                    <span class="text-sm font-medium text-slate-700">Date</span>
                 </label>
              </div>
           </div>
           <!-- Backdrop for closing menu -->
           <div v-if="showColumnMenu" @click="showColumnMenu = false" class="fixed inset-0 z-40"></div>
        </div>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 flex flex-col xl:flex-row gap-2">
       <!-- Search -->
       <div class="relative flex-1">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            ref="searchInputRef"
            v-model="filters.search"
            @focus="handleSearchFocus"
            @input="handleSearchInput"
            type="text"
            placeholder="Search by Order #..."
            class="w-full pl-11 pr-4 py-3 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-500 hover:border-slate-200 rounded-xl transition-all outline-none font-medium placeholder:text-slate-400"
          />
       </div>

       <!-- Clear Filters Button -->
       <button
         v-if="hasActiveFilters"
         @click="clearAllFilters"
         class="flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all border border-red-200 whitespace-nowrap"
       >
         <span class="material-symbols-outlined text-[18px]">clear_all</span>
         Hapus Filter
       </button>

       <div class="w-px bg-slate-100 mx-2 hidden xl:block"></div>

       <!-- Status Filters -->
       <div class="flex gap-2 p-1 overflow-x-auto no-scrollbar">
          <button
            v-for="status in ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']"
            :key="status"
            @click="filters.status = status === 'ALL' ? '' : status"
            class="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2"
            :class="
              (filters.status === status || (status === 'ALL' && !filters.status))
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
              : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
            "
          >
             <span v-if="status === 'PENDING'" class="w-2 h-2 rounded-full bg-yellow-400"></span>
             <span v-if="status === 'PROCESSING'" class="w-2 h-2 rounded-full bg-indigo-500"></span>
             <span v-if="status === 'COMPLETED'" class="w-2 h-2 rounded-full bg-blue-500"></span>
             <span v-if="status === 'CANCELLED'" class="w-2 h-2 rounded-full bg-red-500"></span>
             {{ status === 'ALL' ? 'All Orders' : status.charAt(0) + status.slice(1).toLowerCase() }}
          </button>
       </div>

       <div class="w-px bg-slate-100 mx-2 hidden xl:block"></div>
       
       <!-- Month Picker -->
       <div class="w-48">
          <input
            v-model="filters.month"
            type="month"
            @change="handleMonthChange"
            class="w-full px-4 py-3 bg-slate-50 border-transparent hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-xl text-sm font-medium transition-all outline-none"
          />
       </div>
    </div>

    <!-- Orders Table -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-slate-500 font-medium animate-pulse">Loading orders...</p>
    </div>

    <div v-else-if="orders.length === 0" class="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 animate-scale-in">
      <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-[40px] text-slate-300">shopping_bag</span>
      </div>
      <h3 class="text-xl font-bold text-slate-900 mb-2">Belum Ada Pesanan</h3>
      <p class="text-slate-500 text-center max-w-md mb-6">Pesanan yang masuk atau transaksi baru akan muncul di sini.</p>
      
      <router-link to="/pos" class="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
         <span class="material-symbols-outlined">add_circle</span>
         Buat Pesanan Baru
      </router-link>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-6">
      <!-- Mobile Card View -->
      <div class="block lg:hidden space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden"
          :class="{ 'ring-2 ring-blue-500': isOrderSelected(order.id) }"
        >
          <!-- Selection Overlay -->
          <div 
            v-if="isOrderSelected(order.id)" 
            class="absolute top-0 right-0 p-2 bg-blue-500 rounded-bl-2xl z-10"
          >
            <span class="material-symbols-outlined text-white text-sm">check</span>
          </div>

          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div 
                  @click="toggleOrderSelection(order)"
                  class="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  :class="isOrderSelected(order.id) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'"
              >
                  <span class="material-symbols-outlined text-[20px]">{{ isOrderSelected(order.id) ? 'check_circle' : 'circle' }}</span>
              </div>
              <div>
                <h3 class="font-bold text-slate-900">{{ order.orderNumber }}</h3>
                <p class="text-xs text-slate-500">{{ formatDateTime(order.createdAt) }}</p>
              </div>
            </div>
            <div v-if="canEditOrders && (order.status === 'PENDING' || order.status === 'PROCESSING')" class="relative group/status" @click.stop>
                <select
                    :value="order.status"
                    @change="updateStatus(order.id, ($event.target as HTMLSelectElement).value)"
                    class="appearance-none pl-3 pr-6 py-1 text-xs font-bold rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all"
                    :class="getStatusClass(order.status)"
                >
                    <option value="PENDING" class="bg-white text-slate-900">Pending</option>
                    <option value="PROCESSING" class="bg-white text-slate-900">Processing</option>
                    <option value="COMPLETED" class="bg-white text-slate-900">Selesai</option>
                    <option value="CANCELLED" class="bg-white text-slate-900">Batalkan</option>
                </select>
                <span class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] opacity-50 group-hover/status:opacity-100 transition-opacity">▼</span>
            </div>
            <span
              v-else
              class="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider"
              :class="getStatusClass(order.status)"
            >
              {{ getStatusLabel(order.status) }}
            </span>
          </div>

          <div class="space-y-3 mb-4 bg-slate-50 rounded-xl p-4">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Customer</span>
              <span class="font-bold text-slate-900 truncate max-w-[150px]">
                {{ order.member?.name || order.customer?.name || order.temporaryCustomerName || 'Walk-in' }}
              </span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Total</span>
              <span class="font-bold text-blue-600">{{ formatCurrency(Number(order.total)) }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button @click="viewOrder(order)" class="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200 transition">Detail</button>
            <button @click="printReceipt(order)" class="py-2.5 px-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-100 transition">Print</button>
            
            <button 
              v-if="canEditOrders && (order.status === 'PENDING' || order.status === 'PROCESSING')"
              @click="updateStatus(order.id, 'COMPLETED')"
              class="col-span-2 py-2.5 px-4 rounded-xl bg-blue-500 text-white font-bold text-xs hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition"
            >
              Mark as Completed
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <div v-if="selectedOrders.length > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-200">
          <div class="flex items-center gap-3 pr-6 border-r border-slate-700">
             <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">{{ selectedOrders.length }}</div>
             <span class="font-medium text-sm">Selected</span>
          </div>
          <div class="flex items-center gap-2">
             <button 
               v-if="canDeleteOrders && canDeleteSelectedOrders"
               @click="bulkDelete"
               class="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-xs transition flex items-center gap-2"
             >
                <span class="material-symbols-outlined text-[18px]">delete</span>
                Delete
             </button>
             <button 
               v-if="canRefundOrders && canRefundSelectedOrders"
               @click="bulkRefund"
               class="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl font-bold text-xs transition flex items-center gap-2"
             >
                <span class="material-symbols-outlined text-[18px]">undo</span>
                Refund
             </button>
             <button @click="selectedOrders = []" class="px-4 py-2 hover:bg-slate-800 rounded-xl font-bold text-xs text-slate-400 transition">Cancel</button>
          </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 border-b border-slate-100 sticky top-0 z-10 shadow-sm">
            <tr>
              <th class="p-4 w-12">
                <input
                  type="checkbox"
                  :checked="selectedOrders.length === orders.length && orders.length > 0"
                  @change="toggleSelectAll"
                  class="w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th v-if="isColumnVisible('orderInfo')" class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Info</th>
              <th v-if="isColumnVisible('customer')" class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
              <th v-if="isColumnVisible('total')" class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
              <th v-if="isColumnVisible('status')" class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th v-if="isColumnVisible('date')" class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="order in orders" 
              :key="order.id" 
              class="hover:bg-slate-50 transition-colors group"
              :class="{ 'bg-blue-50/30': isOrderSelected(order.id) }"
            >
              <td class="p-4">
                <input
                  type="checkbox"
                  :checked="isOrderSelected(order.id)"
                  @change="toggleOrderSelection(order)"
                  class="w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
              </td>
              <td v-if="isColumnVisible('orderInfo')" class="p-4">
                <div class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{{ order.orderNumber }}</div>
                <div v-if="order.sendToKitchen" class="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 font-medium">
                   <span class="material-symbols-outlined text-[14px]">soup_kitchen</span>
                   Kitchen
                </div>
              </td>
              <td v-if="isColumnVisible('customer')" class="p-4">
                 <div class="font-medium text-slate-700">
                    {{ order.member?.name || order.customer?.name || order.temporaryCustomerName || 'Walk-in' }}
                 </div>
              </td>
              <td v-if="isColumnVisible('total')" class="p-4 font-bold text-slate-900">
                 {{ formatCurrency(Number(order.total)) }}
              </td>
              <td v-if="isColumnVisible('status')" class="p-4">
                 <div v-if="canEditOrders && (order.status === 'PENDING' || order.status === 'PROCESSING')" class="relative group/status w-max" @click.stop>
                    <select
                        :value="order.status"
                        @change="updateStatus(order.id, ($event.target as HTMLSelectElement).value)"
                        class="appearance-none pl-3 pr-6 py-1 text-xs font-bold rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all"
                        :class="getStatusClass(order.status)"
                    >
                        <option value="PENDING" class="bg-white text-slate-900">Pending</option>
                        <option value="PROCESSING" class="bg-white text-slate-900">Processing</option>
                        <option value="COMPLETED" class="bg-white text-slate-900">Selesai</option>
                        <option value="CANCELLED" class="bg-white text-slate-900">Batalkan</option>
                    </select>
                    <span class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] opacity-50 group-hover/status:opacity-100 transition-opacity">▼</span>
                 </div>
                 <span
                    v-else
                    class="px-3 py-1 text-xs font-bold rounded-full border"
                    :class="getStatusClass(order.status)"
                  >
                    {{ getStatusLabel(order.status) }}
                  </span>
              </td>
              <td v-if="isColumnVisible('date')" class="p-4 text-sm text-slate-500">
                 {{ formatDateTime(order.createdAt) }}
              </td>
              <td class="p-4 text-right">
                 <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="viewOrder(order)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition" title="View Details">
                       <span class="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                    <button @click="printReceipt(order)" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-500 hover:text-blue-600 transition" title="Print Receipt">
                       <span class="material-symbols-outlined text-[20px]">print</span>
                    </button>
                    <button 
                      v-if="canEditOrders && (order.status === 'PENDING' || order.status === 'PROCESSING')"
                      @click="editOrder(order)" 
                      class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600 transition" 
                      title="Edit"
                    >
                       <span class="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                    <button 
                      v-if="canDeleteOrders"
                      @click="deleteOrder(order.id)" 
                      class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition" 
                      title="Delete"
                    >
                       <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                 </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between pt-4">
         <p class="text-sm text-slate-500">Showing page <span class="font-bold text-slate-900">{{ pagination.page }}</span> of {{ pagination.totalPages }}</p>
         <div class="flex gap-2">
            <button
              @click="loadOrders(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              @click="loadOrders(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
              class="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
         </div>
      </div>
    </div>
  </div>

  <!-- Tenant Selector Modal -->
  <TenantSelectorModal
    :show="showTenantModal"
    @close="showTenantModal = false"
    @select="handleTenantSelected"
  />

  <!-- Order Edit Modal -->
  <OrderEditModal
    :show="showEditModal"
    :order="(editingOrder as Order | null)"
    @close="showEditModal = false; editingOrder = null"
    @saved="handleOrderSaved"
  />

  <!-- V3 Order Detail Modal -->
  <div
    v-if="selectedOrder"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all"
    @click.self="selectedOrder = null"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      <!-- Modal Header -->
      <div class="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div>
           <h3 class="text-xl font-bold text-slate-900">Order Details</h3>
           <p class="text-sm text-slate-500 font-medium">#{{ selectedOrder.orderNumber }}</p>
        </div>
        <button
          @click="selectedOrder = null"
          class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition shadow-sm"
        >
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto custom-scrollbar">
        <!-- Status & Meta -->
        <div class="flex flex-wrap gap-4 mb-8">
           <div class="flex-1 min-w-[140px] bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <div class="flex items-center gap-2">
                 <span class="px-3 py-1 rounded-full text-xs font-bold border" :class="getStatusClass(selectedOrder.status)">
                    {{ getStatusLabel(selectedOrder.status) }}
                 </span>
              </div>
           </div>
           <div class="flex-1 min-w-[140px] bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
              <p class="font-bold text-slate-700 text-sm">{{ formatDateTime(selectedOrder.createdAt) }}</p>
           </div>
           <div class="flex-1 min-w-[140px] bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
              <p class="font-bold text-slate-700 text-sm">{{ (selectedOrder as any).member?.name || (selectedOrder as any).customer?.name || 'Walk-in' }}</p>
           </div>
        </div>

        <!-- Items Table -->
        <div class="mb-8">
           <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-500">shopping_cart</span>
              Items Purchased
           </h4>
           <div class="border rounded-xl border-slate-200 overflow-hidden">
              <table class="w-full text-sm text-left">
                 <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                       <th class="p-3 font-bold text-slate-600">Product</th>
                       <th class="p-3 font-bold text-slate-600 text-center">Qty</th>
                       <th class="p-3 font-bold text-slate-600 text-right">Price</th>
                       <th class="p-3 font-bold text-slate-600 text-right">Total</th>
                    </tr>
                 </thead>
                 <tbody class="divide-y divide-slate-100">
                    <tr v-for="(item, index) in ((selectedOrder as any).items || [])" :key="index">
                       <td class="p-3 font-medium text-slate-900">{{ item.product?.name || item.name }}</td>
                       <td class="p-3 text-center text-slate-600">{{ item.quantity }}</td>
                       <td class="p-3 text-right text-slate-600">{{ formatCurrency(Number(item.price)) }}</td>
                       <td class="p-3 text-right font-bold text-slate-900">{{ formatCurrency(Number(item.subtotal)) }}</td>
                    </tr>
                 </tbody>
              </table>
           </div>
        </div>

        <!-- Totals -->
        <div class="flex flex-col items-end gap-2 border-t border-slate-100 pt-6">
           <div class="flex justify-between w-full max-w-xs text-sm">
              <span class="text-slate-500">Subtotal</span>
              <span class="font-bold text-slate-700">{{ formatCurrency(Number((selectedOrder as any).subtotal || selectedOrder.total)) }}</span>
           </div>
           <div v-if="(selectedOrder as any).discount > 0" class="flex justify-between w-full max-w-xs text-sm">
              <span class="text-slate-500">Discount</span>
              <span class="font-bold text-blue-600">-{{ formatCurrency(Number((selectedOrder as any).discount)) }}</span>
           </div>
           <div class="flex justify-between w-full max-w-xs text-lg pt-2 mt-2 border-t border-slate-100">
              <span class="font-bold text-slate-900">Total Amount</span>
              <span class="font-black text-blue-600">{{ formatCurrency(Number(selectedOrder.total)) }}</span>
           </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 sm:flex sm:justify-end gap-3">
         <button
            v-if="canDeleteOrders"
            @click="deleteOrder(selectedOrder.id)"
            class="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 hover:border-red-300 transition"
         >
            Delete
         </button>
         <button
            @click="printReceipt(selectedOrder)"
            class="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
         >
            <span class="material-symbols-outlined text-[18px]">print</span>
            Print Receipt
         </button>
      </div>
    </div>
  </div>

  <!-- Receipt Printer -->
  <ReceiptPrinter
    v-if="selectedOrderForReceipt"
    :show="showReceiptModal"
    :order-id="selectedOrderForReceipt.id"
    :receipt-data="(selectedOrderForReceipt as any).receiptData"
    @close="showReceiptModal = false; selectedOrderForReceipt = null"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { safeSome, safeFilter, safeMap, safeFindIndex } from '../../utils/array-helpers';
import api from '../../api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useAuthStore } from '../../stores/auth';
import TenantSelectorModal from '../../components/TenantSelectorModal.vue';
import TenantSelector from '../../components/TenantSelector.vue';
import StoreSelector from '../../components/StoreSelector.vue';
import ExportButton from '../../components/ExportButton.vue';
import { exportToCSV, exportToPDF } from '../../utils/exportUtils';
import ReceiptPrinter from '../../components/ReceiptPrinter.vue';
import OrderEditModal from '../../components/OrderEditModal.vue';
import { useTenantCheck } from '../../composables/useTenantCheck';
import { useNotification } from '../../composables/useNotification';
import { usePermissions } from '../../composables/usePermissions';
import { usePullToRefresh } from '../../composables/usePullToRefresh';

interface OrderItem {
  id?: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    price: number;
  };
  name?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  total: string | number;
  subtotal: string | number;
  discount: string | number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  customer?: {
    name: string;
    email?: string;
  };
  member?: {
    name: string;
    email?: string;
  };
  temporaryCustomerName?: string;
  sendToKitchen?: boolean;
  transaction?: {
    paymentMethod: string;
  };
  receiptData?: any;
}

const authStore = useAuthStore();
const { needsTenantSelection, showTenantModal, handleTenantSelected } = useTenantCheck();
const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();
const {
  canEditOrders: rawCanEditOrders,
  canDeleteOrders: rawCanDeleteOrders,
  canRefundOrders: rawCanRefundOrders,
} = usePermissions();
const currentRole = computed(() => authStore.user?.role || '');
const canEditOrders = computed(() => {
  if (currentRole.value === 'SUPER_ADMIN' || currentRole.value === 'ADMIN_TENANT') return true;
  if (currentRole.value === 'SUPERVISOR' || currentRole.value === 'CASHIER' || currentRole.value === 'KITCHEN') {
    return rawCanEditOrders.value;
  }
  return false;
});
const canDeleteOrders = computed(() => {
  if (currentRole.value === 'SUPER_ADMIN' || currentRole.value === 'ADMIN_TENANT') return true;
  if (currentRole.value === 'SUPERVISOR') return rawCanDeleteOrders.value;
  return false;
});
const canRefundOrders = computed(() => {
  if (currentRole.value === 'SUPER_ADMIN' || currentRole.value === 'ADMIN_TENANT') return true;
  if (currentRole.value === 'SUPERVISOR') return rawCanRefundOrders.value;
  return false;
});
const selectedOrder = ref<Order | null>(null);
const showEditModal = ref(false);
const editingOrder = ref<Order | null>(null);

const { pullDistance, isRefreshing } = usePullToRefresh({
  onRefresh: async () => {
    await loadOrders(1);
  },
});

const orders = ref<Order[]>([]);
const loading = ref(false);
const showReceiptModal = ref(false);
const selectedOrderForReceipt = ref<Order | null>(null);
const selectedOrders = ref<Order[]>([]);

// Filter persistence key
const FILTER_STORAGE_KEY = 'orders_filters';

// Initialize filters from localStorage or defaults
const loadFiltersFromStorage = () => {
  try {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        search: parsed.search || '',
        status: parsed.status || '',
        month: parsed.month || '',
        startDate: parsed.startDate || '',
        endDate: parsed.endDate || '',
      };
    }
  } catch (e) {
    console.warn('Failed to load filters from storage:', e);
  }
  return {
    search: '',
    status: '',
    month: '',
    startDate: '',
    endDate: '',
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

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(filters.value.search || filters.value.status || filters.value.month || filters.value.startDate || filters.value.endDate);
});

// Clear all filters
const clearAllFilters = () => {
  filters.value = {
    search: '',
    status: '',
    month: '',
    startDate: '',
    endDate: '',
  };
  loadOrders(1);
};
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const searchInputRef = ref<HTMLInputElement | null>(null);
const handleGlobalFocusSearch = () => {
    searchInputRef.value?.focus();
};

// Debounce to prevent rate limiting
let loadOrdersTimeout: ReturnType<typeof setTimeout> | null = null;

const loadOrders = async (page = 1) => {
  // Check if tenant selection is needed (modal as fallback)
  if (needsTenantSelection.value) {
    if (page === 1) {
      showTenantModal.value = true;
    }
    return;
  }
  
  // Clear existing timeout
  if (loadOrdersTimeout) clearTimeout(loadOrdersTimeout);
  
  // Debounce API call
  loadOrdersTimeout = setTimeout(async () => {
    // For non-super-admin, ensure tenantId is available
    if (!authStore.isSuperAdmin && !authStore.user?.tenantId) {
      console.error('Tenant ID not available for non-super-admin user');
      await showError('Tenant ID tidak tersedia. Silakan login ulang.');
      return;
    }
    
    loading.value = true;
    try {
      const params: any = {
        page,
        limit: pagination.value.limit,
        ...(filters.value.status && { status: filters.value.status }),
        ...(filters.value.startDate && { startDate: filters.value.startDate }),
        ...(filters.value.endDate && {
          // Set endDate to end of day (23:59:59)
          endDate: (() => {
            const dateTo = new Date(filters.value.endDate);
            dateTo.setHours(23, 59, 59, 999);
            return dateTo.toISOString();
          })(),
        }),
      };
      
      // Ensure tenantId is set in params for SUPER_ADMIN
      if (authStore.isSuperAdmin && authStore.selectedTenantId) {
        params.tenantId = authStore.selectedTenantId;
      }
      
      const response = await api.get('/orders', { params });
      orders.value = response.data.data;
      pagination.value = response.data.pagination;
    } catch (error: any) {
      console.error('Error loading orders:', error);
      if (error.response?.status !== 429) { // Don't show error for rate limiting
        await showError(error.response?.data?.message || 'Gagal memuat pesanan');
      }
    } finally {
      loading.value = false;
    }
  }, page === 1 ? 100 : 0); // Only debounce on first load
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    REFUNDED: 'Refund',
  };
  return labels[status] || status;
};

const viewOrder = async (order: Order) => {
  try {
    // Load full order data
    const response = await api.get(`/orders/${order.id}`);
    const orderData = response.data;
    // Ensure required fields have default values
    selectedOrder.value = {
      ...orderData,
      subtotal: orderData.subtotal ?? orderData.total ?? 0,
      discount: orderData.discount ?? 0,
      items: orderData.items ?? [],
    };
  } catch (error: any) {
    console.error('Error loading order details:', error);
    await showError('Gagal memuat detail pesanan');
  }
};

const printReceipt = async (order: Order) => {
  try {
    // Load full order data for receipt
    const response = await api.get(`/orders/${order.id}`);
    const fullOrder = response.data;
    
    // Prepare receipt data
    const receiptData = {
      orderNumber: fullOrder.orderNumber,
      date: fullOrder.createdAt,
      customerName: fullOrder.member?.name || fullOrder.customer?.name || fullOrder.temporaryCustomerName || null,
      memberName: fullOrder.member?.name || null,
      items: safeMap(fullOrder.items || [], (item: any) => ({
        name: item.product?.name || item.name,
        quantity: item.quantity,
        price: Number(item.price),
        subtotal: Number(item.subtotal),
      })) || [],
      subtotal: Number(fullOrder.subtotal || fullOrder.total),
      discount: Number(fullOrder.discount || 0),
      total: Number(fullOrder.total),
      paymentMethod: fullOrder.transaction?.paymentMethod || 'CASH',
      servedBy: fullOrder.transaction?.servedBy || null, // Nama kasir/admin yang melayani
    };
    
    selectedOrderForReceipt.value = { ...order, receiptData } as any;
    showReceiptModal.value = true;
  } catch (error: any) {
    console.error('Error loading order for receipt:', error);
    await showError('Gagal memuat data order untuk receipt');
  }
};

const updateStatus = async (id: string, status: string) => {
  if (!canEditOrders.value) {
    await showError('Anda tidak memiliki izin untuk mengupdate status pesanan');
    return;
  }

  try {
    await api.put(`/orders/${id}/status`, { status });
    await loadOrders(pagination.value.page);
    await showSuccess('Status pesanan berhasil diupdate');
  } catch (error: any) {
    console.error('Error updating order status:', error);
    let errorMessage = 'Gagal mengupdate status';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 404) {
        errorMessage = 'Pesanan tidak ditemukan';
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk mengupdate status pesanan';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Status pesanan tidak valid';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

const editOrder = async (order: Order) => {
  if (!canEditOrders.value) {
    await showError('Anda tidak memiliki izin untuk mengubah pesanan');
    return;
  }

  try {
    // Load full order data
    const response = await api.get(`/orders/${order.id}`);
    const orderData = response.data;
    // Ensure required fields have default values
    editingOrder.value = {
      ...orderData,
      subtotal: orderData.subtotal ?? orderData.total ?? 0,
      discount: orderData.discount ?? 0,
      items: orderData.items ?? [],
    };
    showEditModal.value = true;
  } catch {
    await showError('Gagal memuat data pesanan untuk edit');
  }
};

const deleteOrder = async (id: string) => {
  if (!canDeleteOrders.value) {
    await showError('Anda tidak memiliki izin untuk menghapus pesanan');
    return;
  }

  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.', 'Hapus Pesanan');
  if (!confirmed) return;
  
  try {
    await api.delete(`/orders/${id}`);
    await loadOrders(pagination.value.page);
    if (selectedOrder.value?.id === id) {
      selectedOrder.value = null;
    }
    await showSuccess('Pesanan berhasil dihapus');
  } catch (error: any) {
    console.error('Error deleting order:', error);
    let errorMessage = 'Gagal menghapus pesanan';
    
    if (error.response) {
      // Backend returned an error response
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 404) {
        errorMessage = 'Pesanan tidak ditemukan';
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk menghapus pesanan ini';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Pesanan tidak dapat dihapus. Pastikan status pesanan adalah CANCELLED atau REFUNDED.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

const handleOrderSaved = async (order: Order) => {
  await loadOrders(pagination.value.page);
  if (selectedOrder.value?.id === order.id) {
    // Reload selected order
    await viewOrder(order);
  }
  await showSuccess('Pesanan berhasil diupdate');
  showEditModal.value = false;
  editingOrder.value = null;
};

// Bulk operations
const isOrderSelected = (orderId: string) => {
  return safeSome(selectedOrders.value, (o: any) => o && o.id === orderId);
};

const toggleOrderSelection = (order: Order) => {
  if (!Array.isArray(selectedOrders.value)) selectedOrders.value = [];
  // Use safeFindIndex with proper type checking
  const index = safeFindIndex<Order>(selectedOrders.value, (o: Order) => o && o.id === order.id);
  if (index > -1) {
    selectedOrders.value.splice(index, 1);
  } else {
    selectedOrders.value.push(order);
  }
};

const toggleSelectAll = () => {
  if (!Array.isArray(orders.value)) return;
  if (!Array.isArray(selectedOrders.value)) selectedOrders.value = [];
  if (selectedOrders.value.length === orders.value.length) {
    selectedOrders.value = [];
  } else {
    selectedOrders.value = [...orders.value];
  }
};

const canDeleteSelectedOrders = computed(() => {
  if (selectedOrders.value.length === 0) return false;
  return selectedOrders.value.every(o => o.status === 'CANCELLED' || o.status === 'REFUNDED');
});

const canRefundSelectedOrders = computed(() => {
  if (selectedOrders.value.length === 0) return false;
  return selectedOrders.value.every(o => o.status === 'COMPLETED');
});

const bulkDelete = async () => {
  if (!canDeleteOrders.value) {
    await showError('Anda tidak memiliki izin untuk menghapus pesanan');
    return;
  }

  if (!Array.isArray(selectedOrders.value) || selectedOrders.value.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menghapus ${selectedOrders.value.length} pesanan? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus Pesanan'
  );
  if (!confirmed) return;

  try {
    const orderIds = selectedOrders.value.map(o => o.id);
    const response = await api.post('/orders/bulk-delete', { orderIds });
    
    if (response.data.deleted > 0) {
      await showSuccess(`${response.data.deleted} pesanan berhasil dihapus`);
    }
    if (response.data.failed > 0) {
      const errorDetails = response.data.errors?.join(', ') || 'Beberapa pesanan gagal dihapus';
      await showError(`${response.data.failed} pesanan gagal dihapus. ${errorDetails}`);
    }
    
    selectedOrders.value = [];
    await loadOrders(pagination.value.page);
  } catch (error: any) {
    console.error('Error bulk deleting orders:', error);
    let errorMessage = 'Gagal menghapus pesanan';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk menghapus pesanan';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Beberapa pesanan tidak dapat dihapus. Pastikan status pesanan adalah CANCELLED atau REFUNDED.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

const bulkRefund = async () => {
  if (!canRefundOrders.value) {
    await showError('Anda tidak memiliki izin untuk melakukan refund');
    return;
  }

  if (!Array.isArray(selectedOrders.value) || selectedOrders.value.length === 0) return;
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin melakukan refund untuk ${selectedOrders.value.length} pesanan?`,
    'Refund Pesanan'
  );
  if (!confirmed) return;

  try {
    const orderIds = selectedOrders.value.map(o => o.id);
    const response = await api.post('/orders/bulk-refund', { orderIds });
    
    if (response.data.refunded > 0) {
      await showSuccess(`${response.data.refunded} pesanan berhasil direfund`);
    }
    if (response.data.failed > 0) {
      const errorDetails = response.data.errors?.join(', ') || 'Beberapa pesanan gagal direfund';
      await showError(`${response.data.failed} pesanan gagal direfund. ${errorDetails}`);
    }
    
    selectedOrders.value = [];
    await loadOrders(pagination.value.page);
  } catch (error: any) {
    console.error('Error bulk refunding orders:', error);
    let errorMessage = 'Gagal melakukan refund';
    
    if (error.response) {
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`;
      } else if (error.response.status === 403) {
        errorMessage = 'Anda tidak memiliki izin untuk melakukan refund';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Beberapa pesanan tidak dapat direfund. Pastikan status pesanan adalah COMPLETED.';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await showError(errorMessage);
  }
};

// Computed property untuk menghitung jumlah order yang bisa dihapus
const deletableOrdersCount = computed(() => {
  if (!Array.isArray(orders.value)) return 0;
  return safeFilter(orders.value, (o: any) => o && (o.status === 'CANCELLED' || o.status === 'REFUNDED')).length;
});

// Hapus semua order yang bisa dihapus
const deleteAllOrders = async () => {
  if (!canDeleteOrders.value) {
    await showError('Anda tidak memiliki izin untuk menghapus pesanan');
    return;
  }

  if (!Array.isArray(orders.value)) return;
  const deletableOrders = orders.value.filter(o => o.status === 'CANCELLED' || o.status === 'REFUNDED');
  
  if (deletableOrders.length === 0) {
    await showError('Tidak ada pesanan yang bisa dihapus. Hanya pesanan dengan status Dibatalkan atau Direfund yang bisa dihapus.');
    return;
  }
  
  const confirmed = await showConfirm(
    `Apakah Anda yakin ingin menghapus ${deletableOrders.length} pesanan? Tindakan ini tidak dapat dibatalkan.`,
    'Hapus Semua Pesanan'
  );
  if (!confirmed) return;

  try {
    const orderIds = safeMap(deletableOrders, (o: any) => o?.id);
    const response = await api.post('/orders/bulk-delete', { orderIds });
    
    if (response.data.deleted > 0) {
      await showSuccess(`${response.data.deleted} pesanan berhasil dihapus`);
    }
    if (response.data.failed > 0) {
      await showError(`${response.data.failed} pesanan gagal dihapus. ${response.data.errors.join(', ')}`);
    }
    
    selectedOrders.value = [];
    await loadOrders(pagination.value.page);
  } catch (error: any) {
    await showError(error.response?.data?.message || 'Gagal menghapus pesanan');
  }
};


const handleMonthChange = () => {
  if (filters.value.month) {
    // Parse month (format: YYYY-MM)
    const [year, month] = filters.value.month.split('-');
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    // Set startDate to first day of month (format: YYYY-MM-DD)
    const firstDay = `${year}-${month.padStart(2, '0')}-01`;
    filters.value.startDate = firstDay;
    
    // Calculate last day of month correctly
    // new Date(year, month, 0) gives the last day of the previous month
    // So new Date(year, monthNum, 0) gives last day of (monthNum - 1)
    // We need last day of monthNum, so use new Date(year, monthNum, 0)
    const lastDayDate = new Date(yearNum, monthNum, 0);
    const lastDay = lastDayDate.getDate();
    
    // Format endDate as YYYY-MM-DD
    const endDate = `${year}-${month.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    filters.value.endDate = endDate;
    
    // Load orders with new date range
    loadOrders(1);
  } else {
    // Clear date range if month is cleared
    filters.value.startDate = '';
    filters.value.endDate = '';
    loadOrders(1);
  }
};

watch([() => filters.value.status, () => filters.value.startDate, () => filters.value.endDate], () => {
  loadOrders(1);
});

const handleTenantChange = (tenantId: string | null) => {
  // Reload orders when tenant changes
  if (tenantId && !needsTenantSelection.value) {
    loadOrders();
  }
};

const handleStoreChange = (_storeId: string | null) => {
  // Reload orders when store changes
  if (!needsTenantSelection.value) {
    loadOrders(1);
  }
};

watch(() => authStore.selectedTenantId, (newTenantId, oldTenantId) => {
  // Only reload if tenantId actually changed
  if (newTenantId && newTenantId !== oldTenantId && !needsTenantSelection.value) {
    loadOrders();
  }
}, { immediate: false });

const handleSearchFocus = () => {
  // No-op, just for compatibility
};

const handleSearchInput = () => {
  loadOrders(1);
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // For super admin, ensure selectedTenantId is synced with localStorage
  if (authStore.isSuperAdmin) {
    const storedTenantId = localStorage.getItem('selectedTenantId');
    if (storedTenantId && storedTenantId !== authStore.selectedTenantId) {
      authStore.setSelectedTenant(storedTenantId);
    }
  }
  
  // Initialize month filter to current month
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  filters.value.month = `${year}-${month}`;
  
  // Set date range to current month (1st to last day)
  handleMonthChange();
  
  if (!needsTenantSelection.value) {
    loadOrders(1);
  }

  window.addEventListener('focus-search', handleGlobalFocusSearch);
});

onUnmounted(() => {
  window.removeEventListener('focus-search', handleGlobalFocusSearch);
});




const handleExport = (format: 'csv' | 'excel' | 'pdf' | 'email') => {
   const data = orders.value.map(o => ({
      OrderNumber: o.orderNumber,
      Customer: o.customer?.name || o.temporaryCustomerName || 'Walk-in',
      Total: o.total,
      Status: o.status,
      Date: new Date(o.createdAt).toLocaleDateString()
   }));
   
   if (format === 'csv') exportToCSV(data, 'orders-export');
   if (format === 'excel') exportToCSV(data, 'orders-export');
   if (format === 'pdf') exportToPDF(data, 'orders-export', 'Daftar Pesanan');
};

const showColumnMenu = ref(false);
const visibleColumns = ref<string[]>(JSON.parse(localStorage.getItem('ordersVisibleColumns') || '["orderInfo", "customer", "total", "status", "date"]'));

const isColumnVisible = (col: string) => visibleColumns.value.includes(col);

const toggleColumn = (col: string) => {
  if (visibleColumns.value.includes(col)) {
    if (visibleColumns.value.length > 1) { // Prevent hiding all columns
        visibleColumns.value = visibleColumns.value.filter(c => c !== col);
    }
  } else {
    visibleColumns.value.push(col);
  }
  localStorage.setItem('ordersVisibleColumns', JSON.stringify(visibleColumns.value));
};
</script>
