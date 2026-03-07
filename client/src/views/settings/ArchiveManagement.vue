<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h2 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Manajemen Arsip</h2>
      <p class="text-slate-500 dark:text-slate-400 font-medium">Kelola arsip data lama untuk optimasi database.</p>
    </div>

    <div v-if="loading && stats.ordersCount === 0" class="flex flex-col items-center justify-center py-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div class="text-slate-500 font-medium text-sm">Memuat data arsip...</div>
    </div>

    <div v-else class="space-y-6">
      <!-- Archive Statistics -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 backdrop-blur-sm hover:border-blue-200 transition-colors">
           <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Pesanan Diarsipkan</div>
           <div class="flex items-end gap-2">
              <span class="text-3xl font-black text-blue-500">{{ stats.ordersCount || 0 }}</span>
              <span class="material-symbols-outlined text-slate-300 text-3xl ml-auto">shopping_cart</span>
           </div>
        </div>
        <div class="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 backdrop-blur-sm hover:border-blue-200 transition-colors">
           <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Transaksi Diarsipkan</div>
           <div class="flex items-end gap-2">
              <span class="text-3xl font-black text-blue-600">{{ stats.transactionsCount || 0 }}</span>
              <span class="material-symbols-outlined text-slate-300 text-3xl ml-auto">receipt_long</span>
           </div>
        </div>
        <div class="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 backdrop-blur-sm hover:border-blue-200 transition-colors">
           <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Laporan Diarsipkan</div>
           <div class="flex items-end gap-2">
              <span class="text-3xl font-black text-violet-500">{{ stats.reportsCount || 0 }}</span>
              <span class="material-symbols-outlined text-slate-300 text-3xl ml-auto">description</span>
           </div>
        </div>
        <div class="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 backdrop-blur-sm hover:border-blue-200 transition-colors">
           <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Ukuran</div>
           <div class="flex items-end gap-2">
              <span class="text-3xl font-black text-slate-900 dark:text-white">{{ formatFileSize(stats.totalSize || 0) }}</span>
              <span class="material-symbols-outlined text-slate-300 text-3xl ml-auto">hard_drive</span>
           </div>
        </div>
      </div>

      <!-- Archive Actions -->
      <div class="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 backdrop-blur-md">
        <div class="flex items-center gap-4 mb-6">
           <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-sm">
              <span class="material-symbols-outlined text-[24px]">inventory_2</span>
           </div>
           <div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Operasi Pengarsipan Data</h3>
              <p class="text-sm font-medium text-slate-500">Pindahkan data lama ke arsip JSON untuk mengurangi beban database</p>
           </div>
        </div>

        <!-- Archive Link Configuration -->
        <div class="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-6 mb-6">
          <div class="flex items-start gap-4">
             <div class="bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-200 p-2.5 rounded-xl shrink-0">
                <span class="material-symbols-outlined text-[24px]">link</span>
             </div>
             <div class="flex-1">
                <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-2">Link Google Drive / Penyimpanan Eksternal</h4>
                <p class="text-xs text-slate-500 mb-3 font-medium">
                  Tentukan lokasi penyimpanan eksternal untuk referensi cepat file arsip yang diunduh.
                </p>
                <div class="flex flex-col sm:flex-row gap-3">
                   <input
                     v-model="archiveLink"
                     type="url"
                     class="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal"
                     placeholder="https://drive.google.com/..."
                     @blur="saveArchiveLink"
                   />
                   <a
                     v-if="archiveLink"
                     :href="archiveLink"
                     target="_blank"
                     rel="noopener noreferrer"
                     class="px-5 py-2.5 bg-white dark:bg-slate-800 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-xl text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/50 transition flex items-center justify-center gap-2 shadow-sm"
                   >
                     <span class="material-symbols-outlined text-[18px]">open_in_new</span>
                     Buka
                   </a>
                </div>
             </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <!-- Archive Orders -->
          <button
            @click="showArchiveOrdersModal = true"
            class="flex items-center p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md hover:bg-blue-50/10 transition-all text-left bg-white/50 dark:bg-slate-800/50 group backdrop-blur-sm"
          >
             <div class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-sm">
                <span class="material-symbols-outlined">shopping_bag</span>
             </div>
             <div>
                <h4 class="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">Arsip Pesanan</h4>
                <p class="text-xs text-slate-500 font-medium">Selesai/Dibatalkan</p>
             </div>
          </button>

          <!-- Archive Transactions -->
          <button
            @click="showArchiveTransactionsModal = true"
            class="flex items-center p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md hover:bg-blue-50/10 transition-all text-left bg-white/50 dark:bg-slate-800/50 group backdrop-blur-sm"
          >
             <div class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-sm">
                <span class="material-symbols-outlined">payments</span>
             </div>
             <div>
                <h4 class="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">Arsip Transaksi</h4>
                <p class="text-xs text-slate-500 font-medium">Selesai/Gagal</p>
             </div>
          </button>

          <!-- Archive Reports -->
          <button
            @click="showArchiveReportsModal = true"
            class="flex items-center p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-violet-500 hover:shadow-md hover:bg-violet-50/10 transition-all text-left bg-white/50 dark:bg-slate-800/50 group backdrop-blur-sm"
          >
             <div class="bg-violet-100 dark:bg-violet-900/30 text-violet-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-sm">
                <span class="material-symbols-outlined">summarize</span>
             </div>
             <div>
                <h4 class="font-bold text-slate-900 dark:text-white text-sm group-hover:text-violet-600 transition-colors">Arsip Laporan</h4>
                <p class="text-xs text-slate-500 font-medium">Laporan Dibuat</p>
             </div>
          </button>

          <!-- Archive All -->
          <button
            @click="showArchiveAllModal = true"
            class="flex items-center p-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 hover:border-amber-500 hover:shadow-md hover:bg-amber-100/50 transition-all text-left group backdrop-blur-sm"
          >
             <div class="bg-amber-100 dark:bg-amber-800 text-amber-600 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform shadow-sm">
                <span class="material-symbols-outlined">folder_zip</span>
             </div>
             <div>
                <h4 class="font-bold text-amber-900 dark:text-amber-100 text-sm group-hover:text-amber-700 transition-colors">Arsip Semua</h4>
                <p class="text-xs text-amber-700/80 dark:text-amber-300/80 font-bold">Semua sekaligus</p>
             </div>
          </button>
        </div>
      </div>

      <!-- Archive Files List -->
      <div class="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-0 backdrop-blur-md">
        <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">File Arsip</h2>
          <button
            @click="loadArchiveFiles"
            class="p-2 text-slate-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition"
            title="Segarkan"
          >
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>

        <div v-if="archiveFiles.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
           <div class="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-3">
               <span class="material-symbols-outlined text-slate-300 text-4xl">folder_off</span>
           </div>
           <p class="text-slate-900 dark:text-white font-bold">Belum ada file arsip</p>
           <p class="text-slate-500 text-sm mt-1 font-medium">Jalankan proses arsip untuk melihat file di sini.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
            <thead class="bg-slate-50/50 dark:bg-slate-900/30">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nama File</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ukuran</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dibuat</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Tindakan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="file in archiveFiles" :key="file.path" class="hover:bg-blue-50/30 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                   <div class="flex items-center gap-3">
                      <div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400">
                        <span class="material-symbols-outlined text-[20px]">description</span>
                      </div>
                      <span class="text-sm font-bold text-slate-900 dark:text-white">{{ file.name }}</span>
                   </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border"
                    :class="[
                      file.type === 'orders' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      file.type === 'transactions' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      'bg-violet-50 text-violet-700 border-violet-100'
                    ]"
                  >
                    {{ file.type === 'orders' ? 'Pesanan' : file.type === 'transactions' ? 'Transaksi' : 'Laporan' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-slate-600 dark:text-slate-300">{{ formatFileSize(file.size) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">{{ formatDate(file.createdAt) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    @click="restoreArchive(file.path)"
                    class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-300 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl text-xs font-bold transition flex items-center gap-2 ml-auto shadow-sm"
                  >
                    <span class="material-symbols-outlined text-[16px]">history</span>
                    Pulihkan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Reusable Modal (Orders) -->
    <Teleport to="body">
      <div v-if="showArchiveOrdersModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showArchiveOrdersModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-white/20">
           <div class="text-center mb-6">
              <div class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                 <span class="material-symbols-outlined text-3xl">shopping_bag</span>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Arsip Pesanan</h3>
              <p class="text-sm text-slate-500 mt-1 font-medium">Pindahkan pesanan lama ke file arsip.</p>
           </div>
           
           <div class="space-y-4">
             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
                <div class="relative">
                    <input
                    v-model.number="archiveOrdersDays"
                    type="number"
                    min="30"
                    max="730"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center"
                    />
                </div>
                <p class="text-xs text-slate-500 mt-2 text-center font-medium">Rekomendasi: 730 hari (2 tahun)</p>
             </div>
             
             <div class="flex gap-3 pt-2">
                <button @click="showArchiveOrdersModal = false" class="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition">Batal</button>
                <button 
                  @click="archiveOrders" 
                  :disabled="archiving"
                  class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  <div v-if="archiving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {{ archiving ? 'Memproses...' : 'Mulai Arsip' }}
                </button>
             </div>
           </div>
        </div>
      </div>
    </Teleport>

    <!-- Reusable Modal (Transactions) -->
    <Teleport to="body">
      <div v-if="showArchiveTransactionsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showArchiveTransactionsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-white/20">
           <div class="text-center mb-6">
              <div class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                 <span class="material-symbols-outlined text-3xl">payments</span>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Arsip Transaksi</h3>
              <p class="text-sm text-slate-500 mt-1 font-medium">Pindahkan transaksi lama ke file arsip.</p>
           </div>
           
           <div class="space-y-4">
             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
                <input
                  v-model.number="archiveTransactionsDays"
                  type="number"
                  min="30"
                  max="730"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center"
                />
             </div>
             
             <div class="flex gap-3 pt-2">
                <button @click="showArchiveTransactionsModal = false" class="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition">Batal</button>
                <button 
                  @click="archiveTransactions" 
                  :disabled="archiving"
                  class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  <div v-if="archiving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {{ archiving ? 'Memproses...' : 'Mulai Arsip' }}
                </button>
             </div>
           </div>
        </div>
      </div>
    </Teleport>

    <!-- Reusable Modal (Reports) -->
    <Teleport to="body">
      <div v-if="showArchiveReportsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showArchiveReportsModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in border border-white/20">
           <div class="text-center mb-6">
              <div class="bg-violet-100 dark:bg-violet-900/30 text-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                 <span class="material-symbols-outlined text-3xl">summarize</span>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Arsip Laporan</h3>
              <p class="text-sm text-slate-500 mt-1 font-medium">Pindahkan laporan lama ke file arsip.</p>
           </div>
           
           <div class="space-y-4">
             <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lebih lama dari (hari)</label>
                <input
                  v-model.number="archiveReportsDays"
                  type="number"
                  min="30"
                  max="730"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-center"
                />
             </div>
             
             <div class="flex gap-3 pt-2">
                <button @click="showArchiveReportsModal = false" class="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition">Batal</button>
                <button 
                  @click="archiveReports" 
                  :disabled="archiving"
                  class="flex-1 px-4 py-3 bg-violet-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-500/30 hover:bg-violet-700 transition disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  <div v-if="archiving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {{ archiving ? 'Memproses...' : 'Mulai Arsip' }}
                </button>
             </div>
           </div>
        </div>
      </div>
    </Teleport>

    <!-- Archive All Modal -->
    <Teleport to="body">
      <div v-if="showArchiveAllModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showArchiveAllModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-scale-in border border-white/20">
           <div class="flex items-start gap-4 mb-6">
              <div class="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl text-amber-600 shrink-0">
                 <span class="material-symbols-outlined text-3xl">warning</span>
              </div>
              <div>
                 <h3 class="text-xl font-bold text-slate-900 dark:text-white">Arsip Semua Data</h3>
                 <p class="text-sm font-medium text-slate-500 mt-1">Tindakan ini akan mengarsipkan semua data lama sekaligus (Pesanan, Transaksi, Laporan). Proses ini mungkin memakan waktu.</p>
              </div>
           </div>

           <div class="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700">
             <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Pesanan (hari)</label>
                <input v-model.number="archiveAllConfig.ordersOlderThanDays" type="number" class="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-center text-sm font-bold">
             </div>
             <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Transaksi (hari)</label>
                <input v-model.number="archiveAllConfig.transactionsOlderThanDays" type="number" class="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-center text-sm font-bold">
             </div>
             <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Laporan (hari)</label>
                <input v-model.number="archiveAllConfig.reportsOlderThanDays" type="number" class="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl text-center text-sm font-bold">
             </div>
           </div>
           
           <div class="flex gap-3">
              <button @click="showArchiveAllModal = false" class="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition">Batal</button>
              <button 
                @click="archiveAll" 
                :disabled="archiving"
                class="flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                <div v-if="archiving" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ archiving ? 'Memproses...' : 'Konfirmasi Arsip Semua' }}
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
import { formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const loading = ref(true);
const archiving = ref(false);
const stats = ref({
  ordersCount: 0,
  transactionsCount: 0,
  reportsCount: 0,
  totalSize: 0,
});
const archiveFiles = ref<any[]>([]);
const archiveLink = ref<string>('');

const showArchiveOrdersModal = ref(false);
const showArchiveTransactionsModal = ref(false);
const showArchiveReportsModal = ref(false);
const showArchiveAllModal = ref(false);

const archiveOrdersDays = ref(730); // 2 years default
const archiveTransactionsDays = ref(730); // 2 years default
const archiveReportsDays = ref(730); // 2 years default
const archiveAllConfig = ref({
  ordersOlderThanDays: 730, // 2 years
  transactionsOlderThanDays: 730, // 2 years
  reportsOlderThanDays: 730, // 2 years
});

const loadStats = async () => {
  try {
    const response = await api.get('/archives/stats');
    stats.value = response.data;
  } catch (error: any) {
    console.error('Error loading archive stats:', error);
    if (error.response?.status === 403) {
      showError('Anda tidak memiliki akses untuk melihat statistik archive. Hanya Super Admin yang bisa mengakses.');
    } else {
      showError(error.response?.data?.message || 'Gagal memuat statistik archive');
    }
  }
};

const loadArchiveFiles = async () => {
  try {
    const response = await api.get('/archives/files');
    archiveFiles.value = response.data.files || [];
  } catch (error: any) {
    console.error('Error loading archive files:', error);
    if (error.response?.status === 403) {
      showError('Anda tidak memiliki akses untuk melihat file archive. Hanya Super Admin yang bisa mengakses.');
    } else {
      showError(error.response?.data?.message || 'Gagal memuat daftar file archive');
    }
  }
};

const archiveOrders = async () => {
  archiving.value = true;
  try {
    const response = await api.post('/archives/orders', {
      olderThanDays: archiveOrdersDays.value || 730,
    });
    showSuccess(`Berhasil meng-archive ${response.data.count} pesanan`);
    showArchiveOrdersModal.value = false;
    await Promise.all([loadStats(), loadArchiveFiles()]);
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal meng-archive pesanan');
  } finally {
    archiving.value = false;
  }
};

const archiveTransactions = async () => {
  archiving.value = true;
  try {
    const response = await api.post('/archives/transactions', {
      olderThanDays: archiveTransactionsDays.value || 730,
    });
    showSuccess(`Berhasil meng-archive ${response.data.count} transaksi`);
    showArchiveTransactionsModal.value = false;
    await Promise.all([loadStats(), loadArchiveFiles()]);
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal meng-archive transaksi');
  } finally {
    archiving.value = false;
  }
};

const archiveReports = async () => {
  archiving.value = true;
  try {
    const response = await api.post('/archives/reports', {
      olderThanDays: archiveReportsDays.value || 730,
    });
    showSuccess(`Berhasil meng-archive ${response.data.count} laporan`);
    showArchiveReportsModal.value = false;
    await Promise.all([loadStats(), loadArchiveFiles()]);
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal meng-archive laporan');
  } finally {
    archiving.value = false;
  }
};

const archiveAll = async () => {
  const confirmed = await showConfirm(
    'Arsip Semua Data',
    'Apakah Anda yakin ingin meng-archive semua data lama? Tindakan ini tidak dapat dibatalkan.',
    'Ya, Arsip',
    'Batal'
  );
  
  if (!confirmed) return;

  archiving.value = true;
  try {
    const response = await api.post('/archives/all', archiveAllConfig.value);
    showSuccess(
      `Berhasil meng-archive: ${response.data.orders} pesanan, ${response.data.transactions} transaksi, ${response.data.reports} laporan`
    );
    showArchiveAllModal.value = false;
    await Promise.all([loadStats(), loadArchiveFiles()]);
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal meng-archive data');
  } finally {
    archiving.value = false;
  }
};

const restoreArchive = async (archiveFile: string) => {
  const confirmed = await showConfirm(
    'Pulihkan Archive',
    'Apakah Anda yakin ingin memulihkan data dari archive ini?',
    'Ya, Pulihkan',
    'Batal'
  );
  
  if (!confirmed) return;

  try {
    await api.post('/archives/restore', { archiveFile });
    showSuccess('Berhasil memulihkan data dari archive');
    await Promise.all([loadStats(), loadArchiveFiles()]);
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal memulihkan archive');
  }
};

const formatDate = (date: string | Date) => {
  if (!date) return '-';
  return formatDateTime(date);
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const loadArchiveLink = () => {
  const savedLink = localStorage.getItem('archiveLink');
  if (savedLink) {
    archiveLink.value = savedLink;
  }
};

const saveArchiveLink = () => {
  if (archiveLink.value) {
    localStorage.setItem('archiveLink', archiveLink.value);
    showSuccess('Link archive berhasil disimpan');
  } else {
    localStorage.removeItem('archiveLink');
  }
};

onMounted(async () => {
  loading.value = true;
  loadArchiveLink();
  await Promise.all([loadStats(), loadArchiveFiles()]);
  loading.value = false;
});
</script>
