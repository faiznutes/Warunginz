<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Manajemen Retensi</h2>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Kelola kebijakan retensi dan penghapusan otomatis data lama.</p>
      </div>
      <button
        @click="loadStats"
        class="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
      >
        <span class="material-symbols-outlined text-[18px]">refresh</span>
        Segarkan Data
      </button>
    </div>

    <div v-if="loading && stats.ordersToDelete === 0" class="flex flex-col items-center justify-center py-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-slate-500 font-medium text-sm">Menghitung data retensi...</div>
    </div>

    <div v-else class="space-y-6">
      <!-- Retention Statistics -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
           <div class="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl shadow-sm">
              <span class="material-symbols-outlined text-[24px]">delete_sweep</span>
           </div>
           <div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Data yang Akan Dihapus</h3>
              <p class="text-sm font-medium text-slate-500">Estimasi data yang akan dihapus berdasarkan kebijakan saat ini</p>
           </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center hover:border-blue-200 transition-colors">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pesanan</div>
            <div class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.ordersToDelete || 0 }}</div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center hover:border-blue-200 transition-colors">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Transaksi</div>
            <div class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.transactionsToDelete || 0 }}</div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center hover:border-blue-200 transition-colors">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Laporan</div>
            <div class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.reportsToDelete || 0 }}</div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center hover:border-blue-200 transition-colors">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Logs</div>
            <div class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.auditLogsToDelete || 0 }}</div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center hover:border-blue-200 transition-colors">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Kontak</div>
            <div class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.contactSubmissionsToDelete || 0 }}</div>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 text-center hover:border-blue-200 transition-colors">
            <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Demo Req</div>
            <div class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.demoRequestsToDelete || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- Retention Policy Configuration -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
           <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-sm">
              <span class="material-symbols-outlined text-[24px]">tune</span>
           </div>
           <div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Kebijakan Retensi (Hari)</h3>
              <p class="text-sm font-medium text-slate-500">Konfigurasi periode penyimpanan data sebelum dihapus permanen</p>
           </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pesanan (Standar: 730)</label>
            <div class="relative">
                <input
                v-model.number="retentionPolicy.orders"
                type="number"
                min="30"
                max="730"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
                <div class="absolute right-3 top-3 text-xs font-bold text-slate-400">Hari</div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transaksi (Standar: 730)</label>
            <div class="relative">
                <input
                v-model.number="retentionPolicy.transactions"
                type="number"
                min="30"
                max="730"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
                <div class="absolute right-3 top-3 text-xs font-bold text-slate-400">Hari</div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Laporan (Standar: 730)</label>
            <div class="relative">
                <input
                v-model.number="retentionPolicy.reports"
                type="number"
                min="30"
                max="730"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
                <div class="absolute right-3 top-3 text-xs font-bold text-slate-400">Hari</div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Audit Logs (Standar: 730)</label>
            <div class="relative">
                <input
                v-model.number="retentionPolicy.auditLogs"
                type="number"
                min="30"
                max="730"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
                <div class="absolute right-3 top-3 text-xs font-bold text-slate-400">Hari</div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kontak (Standar: 730)</label>
            <div class="relative">
                <input
                v-model.number="retentionPolicy.contactSubmissions"
                type="number"
                min="30"
                max="730"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
                 <div class="absolute right-3 top-3 text-xs font-bold text-slate-400">Hari</div>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Demo Request (Standar: 730)</label>
            <div class="relative">
                <input
                v-model.number="retentionPolicy.demoRequests"
                type="number"
                min="30"
                max="730"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                />
                 <div class="absolute right-3 top-3 text-xs font-bold text-slate-400">Hari</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Apply Retention Actions -->
      <div class="space-y-4">
        <h3 class="font-bold text-slate-900 dark:text-white px-1 text-lg">Tindakan Pembersihan</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           <!-- Action Buttons -->
           <button @click="showApplyOrdersModal = true" class="p-5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all group text-left backdrop-blur-sm">
              <div class="flex items-center justify-between mb-3">
                 <span class="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">Bersihkan Pesanan</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500 transition-colors">shopping_cart</span>
              </div>
              <p class="text-xs font-medium text-slate-500">Hapus pesanan yang sudah usang</p>
           </button>

           <button @click="showApplyTransactionsModal = true" class="p-5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all group text-left backdrop-blur-sm">
              <div class="flex items-center justify-between mb-3">
                 <span class="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">Bersihkan Transaksi</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500 transition-colors">payments</span>
              </div>
              <p class="text-xs font-medium text-slate-500">Hapus transaksi yang sudah usang</p>
           </button>

           <button @click="showApplyReportsModal = true" class="p-5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all group text-left backdrop-blur-sm">
              <div class="flex items-center justify-between mb-3">
                 <span class="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">Bersihkan Laporan</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500 transition-colors">description</span>
              </div>
              <p class="text-xs font-medium text-slate-500">Hapus laporan yang sudah usang</p>
           </button>
           
           <button @click="showApplyAuditLogsModal = true" class="p-5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all group text-left backdrop-blur-sm">
              <div class="flex items-center justify-between mb-3">
                 <span class="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">Bersihkan Logs</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500 transition-colors">history</span>
              </div>
              <p class="text-xs font-medium text-slate-500">Hapus audit logs yang sudah usang</p>
           </button>

           <button @click="showApplyContactSubmissionsModal = true" class="p-5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all group text-left backdrop-blur-sm">
              <div class="flex items-center justify-between mb-3">
                 <span class="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">Bersihkan Kontak</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500 transition-colors">contact_mail</span>
              </div>
              <p class="text-xs font-medium text-slate-500">Hapus data kontak yang sudah usang</p>
           </button>
           
           <button @click="showApplyDemoRequestsModal = true" class="p-5 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-red-300 dark:hover:border-red-800 hover:shadow-md transition-all group text-left backdrop-blur-sm">
              <div class="flex items-center justify-between mb-3">
                 <span class="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">Bersihkan Demo Req</span>
                 <span class="material-symbols-outlined text-slate-300 group-hover:text-red-500 transition-colors">co_present</span>
              </div>
              <p class="text-xs font-medium text-slate-500">Hapus request demo yang sudah usang</p>
           </button>

           <!-- Apply All -->
           <button @click="showApplyAllModal = true" class="p-5 bg-red-50/80 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:shadow-md transition-all group text-left lg:col-span-2 xl:col-span-2 backdrop-blur-md">
              <div class="flex items-center gap-4">
                 <div class="bg-white/50 dark:bg-red-900/50 text-red-600 p-3 rounded-2xl shadow-sm">
                    <span class="material-symbols-outlined text-[28px]">delete_forever</span>
                 </div>
                 <div>
                    <h4 class="text-lg font-black text-red-700 dark:text-red-200 group-hover:text-red-800 dark:group-hover:text-red-100 transition-colors">Terapkan Semua Kebijakan</h4>
                    <p class="text-xs font-bold text-red-600/70 dark:text-red-300/70 mt-0.5">Jalankan SEMUA pembersihan sekaligus</p>
                 </div>
              </div>
           </button>
        </div>
      </div>
    </div>

    <!-- Reusable Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showApplyOrdersModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyOrdersModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-white/20">
          <div class="flex items-start gap-4 mb-6">
             <div class="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl text-red-600 shrink-0">
                <span class="material-symbols-outlined text-3xl">warning</span>
             </div>
             <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Konfirmasi Penghapusan</h3>
                <p class="text-sm font-medium text-slate-500 mt-1">Tindakan ini akan menghapus <strong class="text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 rounded">{{ stats.ordersToDelete || 0 }} pesanan</strong> secara PERMANEN.</p>
             </div>
          </div>
          
          <div class="mb-6">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
            <input
              v-model.number="applyOrdersDays"
              type="number"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div class="flex gap-3">
            <button @click="showApplyOrdersModal = false" class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">Batal</button>
            <button 
              @click="applyOrdersRetention" 
              :disabled="applying"
              class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <div v-if="applying" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ applying ? 'Menghapus...' : 'Hapus Permanen' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Generic Modal template - reusing structure for others... -->
    <!-- Transactions Modal -->
    <Teleport to="body">
      <div v-if="showApplyTransactionsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyTransactionsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-white/20">
          <div class="flex items-start gap-4 mb-6">
             <div class="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl text-red-600 shrink-0">
                <span class="material-symbols-outlined text-3xl">warning</span>
             </div>
             <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Hapus Transaksi</h3>
                <p class="text-sm font-medium text-slate-500 mt-1">Hapus <strong class="text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 rounded">{{ stats.transactionsToDelete || 0 }} transaksi</strong> permanen.</p>
             </div>
          </div>
          <div class="mb-6">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
            <input v-model.number="applyTransactionsDays" type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
          <div class="flex gap-3">
            <button @click="showApplyTransactionsModal = false" class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">Batal</button>
            <button @click="applyTransactionsRetention" :disabled="applying" class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition disabled:opacity-70">{{ applying ? '...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reports Modal -->
    <Teleport to="body">
      <div v-if="showApplyReportsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyReportsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-white/20">
          <div class="flex items-start gap-4 mb-6">
             <div class="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl text-red-600 shrink-0">
                <span class="material-symbols-outlined text-3xl">warning</span>
             </div>
             <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Hapus Laporan</h3>
                <p class="text-sm font-medium text-slate-500 mt-1">Hapus <strong class="text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 rounded">{{ stats.reportsToDelete || 0 }} laporan</strong> permanen.</p>
             </div>
          </div>
          <div class="mb-6">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
            <input v-model.number="applyReportsDays" type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
          <div class="flex gap-3">
            <button @click="showApplyReportsModal = false" class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">Batal</button>
            <button @click="applyReportsRetention" :disabled="applying" class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition disabled:opacity-70">{{ applying ? '...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Audit Logs Modal -->
    <Teleport to="body">
      <div v-if="showApplyAuditLogsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyAuditLogsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-white/20">
          <div class="flex items-start gap-4 mb-6">
             <div class="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl text-red-600 shrink-0">
                <span class="material-symbols-outlined text-3xl">warning</span>
             </div>
             <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Hapus Audit Logs</h3>
                <p class="text-sm font-medium text-slate-500 mt-1">Hapus <strong class="text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 rounded">{{ stats.auditLogsToDelete || 0 }} logs</strong> permanen.</p>
             </div>
          </div>
          <div class="mb-6">
             <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
            <input v-model.number="applyAuditLogsDays" type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
          <div class="flex gap-3">
            <button @click="showApplyAuditLogsModal = false" class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">Batal</button>
            <button @click="applyAuditLogsRetention" :disabled="applying" class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition disabled:opacity-70">{{ applying ? '...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Contact Submissions Modal -->
    <Teleport to="body">
      <div v-if="showApplyContactSubmissionsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyContactSubmissionsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-white/20">
           <div class="flex items-start gap-4 mb-6">
             <div class="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl text-red-600 shrink-0">
                <span class="material-symbols-outlined text-3xl">warning</span>
             </div>
             <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Hapus Data Kontak</h3>
                <p class="text-sm font-medium text-slate-500 mt-1">Hapus <strong class="text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 rounded">{{ stats.contactSubmissionsToDelete || 0 }} kontak</strong> permanen.</p>
             </div>
          </div>
          <div class="mb-6">
             <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
            <input v-model.number="applyContactSubmissionsDays" type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
          <div class="flex gap-3">
            <button @click="showApplyContactSubmissionsModal = false" class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">Batal</button>
            <button @click="applyContactSubmissionsRetention" :disabled="applying" class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition disabled:opacity-70">{{ applying ? '...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Demo Requests Modal -->
    <Teleport to="body">
      <div v-if="showApplyDemoRequestsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyDemoRequestsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-white/20">
           <div class="flex items-start gap-4 mb-6">
             <div class="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl text-red-600 shrink-0">
                <span class="material-symbols-outlined text-3xl">warning</span>
             </div>
             <div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Hapus Demo Requests</h3>
                <p class="text-sm font-medium text-slate-500 mt-1">Hapus <strong class="text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 rounded">{{ stats.demoRequestsToDelete || 0 }} demo requests</strong> permanen.</p>
             </div>
          </div>
          <div class="mb-6">
             <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
            <input v-model.number="applyDemoRequestsDays" type="number" class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
          <div class="flex gap-3">
            <button @click="showApplyDemoRequestsModal = false" class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">Batal</button>
            <button @click="applyDemoRequestsRetention" :disabled="applying" class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition disabled:opacity-70">{{ applying ? '...' : 'Hapus' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Apply All Modal -->
    <Teleport to="body">
      <div v-if="showApplyAllModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showApplyAllModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-scale-in border border-white/20">
           <div class="flex items-start gap-4 mb-6">
              <div class="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl text-red-600 shrink-0">
                 <span class="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <div>
                 <h3 class="text-2xl font-black text-slate-900 dark:text-white">Pembersihan Total</h3>
                 <p class="text-sm font-medium text-slate-500 mt-1">
                   Tindakan ini akan menghapus <strong>SEMUA</strong> data lama yang melewati batas waktu retensi. Data yang dihapus TIDAK DAPAT DIKEMBALIKAN.
                 </p>
              </div>
           </div>

           <div class="mb-8 p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl">
             <p class="text-xs font-bold text-red-800 dark:text-red-200 uppercase tracking-wider mb-3">Ringkasan yang Akan Dihapus</p>
             <ul class="grid grid-cols-2 gap-3 text-sm font-bold text-red-700 dark:text-red-300">
               <li class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>{{ stats.ordersToDelete || 0 }} Pesanan</li>
               <li class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>{{ stats.transactionsToDelete || 0 }} Transaksi</li>
               <li class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>{{ stats.reportsToDelete || 0 }} Laporan</li>
               <li class="flex items-center gap-2"><div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>{{ stats.auditLogsToDelete || 0 }} Logs</li>
             </ul>
           </div>
           
           <div class="flex gap-3">
              <button @click="showApplyAllModal = false" class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">Batalkan</button>
              <button 
                @click="applyAllRetention" 
                :disabled="applying"
                class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <div v-if="applying" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ applying ? 'Memproses...' : 'Ya, Hapus Semua' }}
              </button>
           </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError } = useNotification();

const loading = ref(true);
const applying = ref(false);
const stats = ref({
  ordersToDelete: 0,
  transactionsToDelete: 0,
  reportsToDelete: 0,
  auditLogsToDelete: 0,
  contactSubmissionsToDelete: 0,
  demoRequestsToDelete: 0,
});

const retentionPolicy = ref({
  orders: 730, // 2 years default
  transactions: 730, // 2 years default
  reports: 730, // 2 years default
  auditLogs: 730, // 2 years default
  contactSubmissions: 730, // 2 years default
  demoRequests: 730, // 2 years default
});

const showApplyOrdersModal = ref(false);
const showApplyTransactionsModal = ref(false);
const showApplyReportsModal = ref(false);
const showApplyAuditLogsModal = ref(false);
const showApplyContactSubmissionsModal = ref(false);
const showApplyDemoRequestsModal = ref(false);
const showApplyAllModal = ref(false);

const applyOrdersDays = ref(730); // 2 years default
const applyTransactionsDays = ref(730); // 2 years default
const applyReportsDays = ref(730); // 2 years default
const applyAuditLogsDays = ref(730); // 2 years default
const applyContactSubmissionsDays = ref(730); // 2 years default
const applyDemoRequestsDays = ref(730); // 2 years default

const loadStats = async () => {
  // SUPER_ADMIN can view stats for all tenants without selecting tenant
  try {
    const policy = {
      orders: retentionPolicy.value.orders,
      transactions: retentionPolicy.value.transactions,
      reports: retentionPolicy.value.reports,
      auditLogs: retentionPolicy.value.auditLogs,
      contactSubmissions: retentionPolicy.value.contactSubmissions,
      demoRequests: retentionPolicy.value.demoRequests,
    };
    const response = await api.get('/retention/stats', {
      params: { policy: JSON.stringify(policy) },
    });
    stats.value = response.data;
  } catch (error: any) {
    console.error('Error loading retention stats:', error);
    if (error.response?.status === 403) {
      showError('Anda tidak memiliki akses untuk melihat statistik retensi. Hanya Super Admin yang bisa mengakses.');
    } else {
      showError(error.response?.data?.message || 'Gagal memuat statistik retensi');
    }
  }
};

const applyOrdersRetention = async () => {
  // Modal used instead of native confirm
  applying.value = true;
  try {
    const response = await api.post('/retention/orders', {
      days: applyOrdersDays.value || retentionPolicy.value.orders || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} pesanan`);
    showApplyOrdersModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus pesanan');
  } finally {
    applying.value = false;
  }
};

const applyTransactionsRetention = async () => {
  applying.value = true;
  try {
    const response = await api.post('/retention/transactions', {
      days: applyTransactionsDays.value || retentionPolicy.value.transactions || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} transaksi`);
    showApplyTransactionsModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus transaksi');
  } finally {
    applying.value = false;
  }
};

const applyReportsRetention = async () => {
  applying.value = true;
  try {
    const response = await api.post('/retention/reports', {
      days: applyReportsDays.value || retentionPolicy.value.reports || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} laporan`);
    showApplyReportsModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus laporan');
  } finally {
    applying.value = false;
  }
};

const applyAuditLogsRetention = async () => {
  applying.value = true;
  try {
    const response = await api.post('/retention/audit-logs', {
      days: applyAuditLogsDays.value || retentionPolicy.value.auditLogs || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} audit logs`);
    showApplyAuditLogsModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus audit logs');
  } finally {
    applying.value = false;
  }
};

const applyContactSubmissionsRetention = async () => {
  applying.value = true;
  try {
    const response = await api.post('/retention/contact-submissions', {
      days: applyContactSubmissionsDays.value || retentionPolicy.value.contactSubmissions || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} data kontak`);
    showApplyContactSubmissionsModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus data kontak');
  } finally {
    applying.value = false;
  }
};

const applyDemoRequestsRetention = async () => {
  applying.value = true;
  try {
    const response = await api.post('/retention/demo-requests', {
      days: applyDemoRequestsDays.value || retentionPolicy.value.demoRequests || 730,
    });
    showSuccess(`Berhasil menghapus ${response.data.deletedCount} permintaan demo`);
    showApplyDemoRequestsModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menghapus permintaan demo');
  } finally {
    applying.value = false;
  }
};

const applyAllRetention = async () => {
  // Modal used instead
  applying.value = true;
  try {
    const response = await api.post('/retention/apply-all', {
      policy: retentionPolicy.value
    });
    
    let message = 'Penghapusan selesai: ';
    const results = response.data.results || {};
    message += `${results.orders || 0} pesanan, ${results.transactions || 0} transaksi, ${results.reports || 0} laporan`;
    
    showSuccess(message);
    showApplyAllModal.value = false;
    await loadStats();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menerapkan kebijakan retensi');
  } finally {
    applying.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  await loadStats();
  loading.value = false;
});
</script>
