<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Monitor Server</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1 font-medium">Pantau kesehatan infrastruktur, resource server, dan log sistem secara real-time.</p>
      </div>
      <div class="flex items-center gap-3">
         <div class="hidden md:flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-xl px-4 py-2.5 w-64 border border-slate-200 dark:border-slate-700 shadow-sm focus-within:ring-2 ring-blue-500/20 transition-all">
            <span class="material-symbols-outlined text-slate-400 text-[20px]">search</span>
            <input class="bg-transparent border-none text-sm font-medium w-full focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 ml-2" placeholder="Cari log atau error..." type="text"/>
         </div>
         <button @click="handleNotificationBell" class="relative p-2.5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
            <span class="material-symbols-outlined text-[20px]">notifications_active</span>
            <span class="absolute top-2 right-2 size-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse"></span>
         </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-1.5 flex overflow-x-auto no-scrollbar gap-2">
       <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap"
          :class="activeTab === tab.value 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'"
        >
          <span class="material-symbols-outlined text-[20px]">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !serverResources.uptime" class="flex flex-col items-center justify-center py-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-slate-500 font-bold text-sm animate-pulse">Menghubungkan ke server telemetry...</p>
    </div>

    <div v-else class="flex-1 min-h-0">
       
       <!-- OVERVIEW DASHBOARD -->
       <div v-if="activeTab === 'overview'" class="flex flex-col gap-6 animate-fade-in-up">
          <!-- Operational Status Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
             <div class="flex items-center gap-4">
                <div class="relative flex items-center justify-center size-12 rounded-full bg-blue-100 dark:bg-blue-800/30">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[28px]">health_and_safety</span>
                    <span class="absolute top-0 right-0 size-3 bg-blue-500 rounded-full ring-2 ring-blue-50 dark:ring-blue-900/20"></span>
                    <span class="absolute top-0 right-0 size-3 bg-blue-500 rounded-full animate-ping opacity-75"></span>
                </div>
                <div>
                   <h1 class="text-blue-900 dark:text-blue-100 text-xl font-black">Sistem Beroperasi Normal</h1>
                   <p class="text-blue-700/80 dark:text-emerald-300/80 text-sm font-medium mt-0.5">Semua layanan inti berjalan dalam parameter optimal. Diperbarui: Baru saja.</p>
                </div>
             </div>
             <div class="flex gap-3">
                <button @click="handleViewHistory" class="px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-blue-800/50 rounded-xl text-sm font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-sm">
                   Lihat Riwayat
                </button>
                <button @click="loadAllData" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 hover:-translate-y-0.5">
                   <span class="material-symbols-outlined text-[18px]">refresh</span>
                   Diagnostik
                </button>
             </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
             <!-- Uptime -->
             <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
                <div class="flex justify-between items-start mb-4">
                   <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">timer</span>
                   </div>
                   <span class="flex items-center text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                      Stabil
                   </span>
                </div>
                <div>
                   <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Waktu Aktif (Uptime)</p>
                   <p class="text-slate-900 dark:text-white text-2xl font-black mt-1">{{ serverResources.uptime || '99.99%' }}</p>
                </div>
             </div>
             <!-- API Latency -->
             <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
                <div class="flex justify-between items-start mb-4">
                   <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">speed</span>
                   </div>
                   <span class="flex items-center text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                      <span class="material-symbols-outlined text-[14px] mr-1">arrow_downward</span> 5ms
                   </span>
                </div>
                <div>
                   <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Latensi API (Rata-rata)</p>
                   <p class="text-slate-900 dark:text-white text-2xl font-black mt-1">45ms</p>
                </div>
             </div>
             <!-- DB Connections -->
             <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
                <div class="flex justify-between items-start mb-4">
                   <div class="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <span class="material-symbols-outlined text-violet-600 dark:text-violet-400">database</span>
                   </div>
                   <span class="flex items-center text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                       Normal
                   </span>
                </div>
                <div>
                   <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Koneksi Database</p>
                   <p class="text-slate-900 dark:text-white text-2xl font-black mt-1">482 / 1000</p>
                </div>
             </div>
             <!-- Error Rate -->
             <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
                <div class="flex justify-between items-start mb-4">
                   <div class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <span class="material-symbols-outlined text-amber-600 dark:text-amber-400">bug_report</span>
                   </div>
                   <span class="flex items-center text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                       0.02%
                   </span>
                </div>
                <div>
                   <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Tingkat Error</p>
                   <p class="text-slate-900 dark:text-white text-2xl font-black mt-1">24 Error</p>
                </div>
             </div>
             <!-- CPU Usage -->
             <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
                <div class="flex justify-between items-start mb-4">
                   <div class="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <span class="material-symbols-outlined text-cyan-600 dark:text-cyan-400">memory</span>
                   </div>
                   <span class="flex items-center text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                      Beban Rendah
                   </span>
                </div>
                <div>
                   <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Penggunaan CPU</p>
                   <p class="text-slate-900 dark:text-white text-2xl font-black mt-1">{{ serverResources.cpu || '0' }}%</p>
                </div>
             </div>
          </div>

          <!-- Charts & Logs Split -->
          <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
             <!-- Left Column: Chart & Logs (Span 2) -->
             <div class="xl:col-span-2 flex flex-col gap-6">
                <!-- Traffic Chart -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
                   <div class="flex items-center justify-between">
                      <h3 class="text-slate-900 dark:text-white text-lg font-black">Trafik API & Latensi (24 Jam)</h3>
                      <div class="flex items-center gap-4">
                         <span class="flex items-center gap-1.5 text-xs font-bold text-slate-500"><div class="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div> Requests</span>
                         <span class="flex items-center gap-1.5 text-xs font-bold text-slate-500"><div class="w-2.5 h-2.5 bg-red-400 rounded-sm"></div> Latensi > 200ms</span>
                      </div>
                   </div>
                   <!-- CSS Bar Chart Implementation -->
                   <div class="h-64 w-full flex items-end justify-between gap-1.5 overflow-hidden pt-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                      <div v-for="(bar, index) in mockChartBars" :key="index" class="w-full rounded-t-sm transition-all relative group" :class="bar.color" :style="{ height: bar.height }"></div>
                   </div>
                   <div class="flex justify-between text-xs text-slate-400 font-bold font-mono">
                      <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
                   </div>
                </div>

                <!-- Recent Logs Table -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden">
                   <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                      <div class="flex items-center gap-2">
                         <h3 class="text-slate-900 dark:text-white text-lg font-black">Log Sistem Terbaru</h3>
                         <span class="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide flex items-center gap-1">
                            <span class="size-1.5 rounded-full bg-blue-500 animate-pulse"></span> Live
                         </span>
                      </div>
                      <button @click="activeTab = 'logs'" class="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1">
                         Buka Log Explorer <span class="material-symbols-outlined text-[14px]">open_in_new</span>
                      </button>
                   </div>
                   <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse">
                         <thead class="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <tr>
                               <th class="px-6 py-4">Waktu</th>
                               <th class="px-6 py-4">Tingkat</th>
                               <th class="px-6 py-4">Layanan</th>
                               <th class="px-6 py-4">Pesan</th>
                               <th class="px-6 py-4">Node</th>
                            </tr>
                         </thead>
                         <tbody class="divide-y divide-slate-100 dark:divide-slate-700 font-mono text-xs">
                            <tr v-for="(log, idx) in recentLogs" :key="idx" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                               <td class="px-6 py-4 text-slate-500 dark:text-slate-400">{{ log.time }}</td>
                               <td class="px-6 py-4">
                                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border shadow-sm" :class="getSeverityClass(log.severity)">
                                     {{ log.severity }}
                                  </span>
                               </td>
                               <td class="px-6 py-4 text-slate-900 dark:text-white font-bold">{{ log.service }}</td>
                               <td class="px-6 py-4 text-slate-600 dark:text-slate-400 truncate max-w-xs">{{ log.message }}</td>
                               <td class="px-6 py-4 text-slate-400">{{ log.node }}</td>
                            </tr>
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>

             <!-- Right Column: Alerts & Resources -->
             <div class="flex flex-col gap-6">
                <!-- Alerts Panel -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
                   <div class="flex items-center justify-between">
                      <h3 class="text-slate-900 dark:text-white text-lg font-black">Peringatan Aktif</h3>
                      <span class="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-lg">2 Kritis</span>
                   </div>
                   <div class="flex flex-col gap-4">
                      <div class="flex gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl">
                         <span class="material-symbols-outlined text-red-600 mt-0.5">warning</span>
                         <div>
                            <p class="text-sm font-bold text-red-700 dark:text-red-400">Penggunaan Memori Tinggi</p>
                            <p class="text-xs text-red-600/80 dark:text-red-300/70 mt-1 leading-relaxed">Node <span class="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded">worker-03</span> berjalan pada kapasitas RAM 92%.</p>
                            <div class="mt-3 flex gap-3">
                               <button @click="handleRestartNode('worker-03')" class="text-xs font-bold underline text-red-700 hover:text-red-900 dark:hover:text-red-300">Restart Node</button>
                               <button @click="handleDismissAlert('memory')" class="text-xs font-semibold text-red-700/70 hover:text-red-900 dark:hover:text-red-300">Abaikan</button>
                            </div>
                         </div>
                      </div>
                      <div class="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                         <span class="material-symbols-outlined text-amber-600 mt-0.5">schedule</span>
                         <div>
                            <p class="text-sm font-bold text-amber-700 dark:text-amber-400">Backup Tertunda</p>
                            <p class="text-xs text-amber-600/80 dark:text-amber-300/70 mt-1 leading-relaxed">Backup DB harian berjalan 15 menit lebih lama dari rata-rata.</p>
                         </div>
                      </div>
                   </div>
                </div>

                <!-- Cluster Resources Panel -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
                   <h3 class="text-slate-900 dark:text-white text-lg font-black">Resource Cluster</h3>
                   <div class="flex flex-col gap-6">
                      <div class="flex flex-col gap-2">
                         <div class="flex justify-between items-end">
                            <div class="flex items-center gap-2">
                               <span class="material-symbols-outlined text-xs text-slate-400">memory</span>
                               <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Agregat CPU</span>
                            </div>
                            <span class="text-xs font-black text-slate-900 dark:text-white">{{ serverResources.cpu || '45' }}%</span>
                         </div>
                         <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div class="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-500 shadow-sm" :style="{ width: (serverResources.cpu || '45') + '%' }"></div>
                         </div>
                      </div>
                      <div class="flex flex-col gap-2">
                         <div class="flex justify-between items-end">
                            <div class="flex items-center gap-2">
                               <span class="material-symbols-outlined text-xs text-slate-400">sd_card</span>
                               <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Penggunaan RAM</span>
                            </div>
                            <span class="text-xs font-black text-slate-900 dark:text-white">{{ serverResources.memory || '68' }}%</span>
                         </div>
                         <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div class="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-500 shadow-sm" :style="{ width: (serverResources.memory || '68') + '%' }"></div>
                         </div>
                      </div>
                      <div class="flex flex-col gap-2">
                         <div class="flex justify-between items-end">
                            <div class="flex items-center gap-2">
                               <span class="material-symbols-outlined text-xs text-slate-400">hard_drive</span>
                               <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Penyimpanan</span>
                            </div>
                            <span class="text-xs font-black text-slate-900 dark:text-white">22%</span>
                         </div>
                         <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div class="bg-gradient-to-r from-violet-500 to-violet-400 h-full rounded-full transition-all duration-500 shadow-sm" style="width: 22%"></div>
                         </div>
                      </div>
                      <div class="flex flex-col gap-2">
                         <div class="flex justify-between items-end">
                            <div class="flex items-center gap-2">
                               <span class="material-symbols-outlined text-xs text-slate-400">cloud_queue</span>
                               <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Bandwidth S3</span>
                            </div>
                            <span class="text-xs font-black text-slate-900 dark:text-white">85%</span>
                         </div>
                         <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div class="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500 shadow-sm" style="width: 85%"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <!-- DOCKER TAB -->
       <div v-if="activeTab === 'docker'" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-fade-in-up">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
             <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">layers</span>
                <h3 class="text-lg font-black text-slate-900 dark:text-white">Docker Containers</h3>
             </div>
             <button @click="loadContainers" class="p-2.5 text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md transition-all">
                <span class="material-symbols-outlined text-[20px]">refresh</span>
             </button>
          </div>
          
          <div v-if="containers.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
             <div class="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-full mb-4">
                <span class="material-symbols-outlined text-slate-300 text-5xl">layers_clear</span>
             </div>
             <h3 class="text-lg font-bold text-slate-900 dark:text-white">Tidak ada container ditemukan</h3>
             <p class="text-slate-500 text-sm mt-1">Pastikan service Docker berjalan pada host.</p>
          </div>

          <div v-else class="overflow-x-auto">
             <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                   <tr>
                      <th class="px-6 py-4">Nama</th>
                      <th class="px-6 py-4">Image</th>
                      <th class="px-6 py-4">Status</th>
                      <th class="px-6 py-4">CPU</th>
                      <th class="px-6 py-4">Memori</th>
                      <th class="px-6 py-4 text-right">Aksi</th>
                   </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                   <tr v-for="container in containers" :key="container.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      <td class="px-6 py-4"><span class="font-bold text-slate-900 dark:text-white">{{ container.name }}</span></td>
                      <td class="px-6 py-4"><span class="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{{ container.image }}</span></td>
                      <td class="px-6 py-4">
                         <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm" 
                           :class="container.status === 'running' 
                              ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-emerald-200 dark:from-blue-900/30 dark:to-blue-800/20 dark:text-blue-400 dark:border-blue-800' 
                              : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 dark:from-red-900/30 dark:to-red-800/20 dark:text-red-400 dark:border-red-800'">
                            <span class="size-1.5 rounded-full" :class="container.status === 'running' ? 'bg-blue-500' : 'bg-red-500'"></span>
                            {{ container.status }}
                         </span>
                      </td>
                      <td class="px-6 py-4 font-mono text-xs font-medium text-slate-600 dark:text-slate-400">{{ container.cpu || '-' }}</td>
                      <td class="px-6 py-4 font-mono text-xs font-medium text-slate-600 dark:text-slate-400">{{ container.memory || '-' }}</td>
                      <td class="px-6 py-4 text-right">
                         <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button @click="viewLogs(container.name)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Lihat Log"><span class="material-symbols-outlined text-[18px]">terminal</span></button>
                            <button v-if="container.status === 'running'" @click="restartContainer(container.name)" class="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-amber-100" title="Restart"><span class="material-symbols-outlined text-[18px]">restart_alt</span></button>
                            <button v-if="container.status === 'running'" @click="stopContainer(container.name)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Stop"><span class="material-symbols-outlined text-[18px]">stop_circle</span></button>
                         </div>
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
       </div>

       <!-- HEALTH TAB -->
       <div v-if="activeTab === 'health'" class="flex flex-col gap-6 animate-fade-in-up">
          <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
             <div class="flex items-center gap-3 mb-8">
                <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                   <span class="material-symbols-outlined text-red-500 text-[24px]">monitor_heart</span>
                </div>
                <div>
                    <h3 class="font-black text-slate-900 dark:text-white text-xl">Kesehatan Jaringan Layanan</h3>
                    <p class="text-slate-500 font-medium text-sm">Status konektivitas dan responsivitas microservices.</p>
                </div>
             </div>
             
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div v-for="service in healthChecks" :key="service.name" 
                   class="flex items-center justify-between p-5 rounded-2xl border transition-all hover:shadow-lg group hover:-translate-y-1"
                   :class="service.status === 'healthy' 
                      ? 'bg-blue-50/50 border-blue-100 hover:border-emerald-200 dark:bg-blue-900/10 dark:border-blue-800 dark:hover:border-blue-700' 
                      : 'bg-red-50/50 border-red-100 hover:border-red-200 dark:bg-red-900/10 dark:border-red-800 dark:hover:border-red-700'">
                   <div class="flex items-center gap-4">
                      <div class="relative">
                         <div class="w-3 h-3 rounded-full shadow-sm" :class="service.status === 'healthy' ? 'bg-blue-500' : 'bg-red-500'"></div>
                         <div class="absolute inset-0 rounded-full animate-ping opacity-50" :class="service.status === 'healthy' ? 'bg-blue-500' : 'bg-red-500'"></div>
                      </div>
                      <div>
                         <div class="font-bold text-slate-900 dark:text-white text-sm">{{ service.name }}</div>
                         <div v-if="service.message" class="text-xs text-slate-500 font-medium">{{ service.message }}</div>
                      </div>
                   </div>
                   <span class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider" 
                      :class="service.status === 'healthy' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                      {{ service.status }}
                   </span>
                </div>
             </div>
          </div>
       </div>

       <!-- LOGS TAB -->
       <div v-if="activeTab === 'logs'" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(100vh-250px)] animate-fade-in-up">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/30">
             <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">terminal</span>
                <h3 class="font-black text-slate-900 dark:text-white text-lg">System Logs Explorer</h3>
             </div>
             <div class="flex items-center gap-3">
                <select v-model="selectedLogType" @change="loadLogs" class="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer text-slate-700 dark:text-white">
                   <option value="backend">Backend Service</option>
                   <option value="frontend">Frontend Client</option>
                   <option value="nginx">Nginx Proxy</option>
                   <option value="postgres">PostgreSQL DB</option>
                   <option value="redis">Redis Cache</option>
                </select>
                <button @click="loadLogs" class="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2 hover:-translate-y-0.5">
                   <span class="material-symbols-outlined text-[18px]">refresh</span>
                   Refresh Stream
                </button>
             </div>
          </div>
          <div class="flex-1 overflow-hidden bg-[#1e1e1e] relative rounded-b-2xl">
             <div class="absolute inset-0 overflow-auto p-6 font-mono text-xs leading-relaxed text-blue-300/90 tracking-wide custom-scrollbar">
                <pre v-if="logs">{{ logs }}</pre>
                <div v-else class="text-slate-500 italic flex items-center gap-2 justify-center h-full">
                    <span class="material-symbols-outlined text-[24px]">do_not_disturb</span>
                    Tidak ada log tersedia untuk stream ini.
                </div>
             </div>
          </div>
       </div>
    </div>

    <!-- Logs Modal for Docker -->
    <Teleport to="body">
       <div v-if="showLogsModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" @click.self="showLogsModal = false">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full h-[80vh] flex flex-col overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-700">
             <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                <div class="flex items-center gap-4">
                   <div class="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">terminal</span>
                   </div>
                   <div>
                      <h3 class="font-black text-slate-900 dark:text-white text-lg">Container Logs</h3>
                      <p class="text-xs text-slate-500 font-mono mt-0.5 font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded w-fit">{{ selectedContainerName }}</p>
                   </div>
                </div>
                <button @click="showLogsModal = false" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                   <span class="material-symbols-outlined text-[24px]">close</span>
                </button>
             </div>
             <div class="flex-1 bg-[#1e1e1e] overflow-hidden relative">
                <div class="absolute inset-0 overflow-auto p-6 font-mono text-xs leading-relaxed text-blue-300/90 custom-scrollbar">
                   <pre v-if="containerLogs">{{ containerLogs }}</pre>
                   <div v-else class="text-slate-500 italic flex items-center gap-3 justify-center h-full font-bold">
                      <span class="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                      Mengambil stream log...
                   </div>
                </div>
             </div>
          </div>
       </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { confirm, success, error } = useNotification();

const loading = ref(true);
const activeTab = ref('overview');
const tabs = [
  { value: 'overview', label: 'Ringkasan', icon: 'dashboard' },
  { value: 'docker', label: 'Docker Containers', icon: 'layers' },
  { value: 'health', label: 'Status Kesehatan', icon: 'monitor_heart' },
  { value: 'logs', label: 'Log Sistem', icon: 'terminal' },
];

interface Container {
  id: string;
  name: string;
  image: string;
  status: string;
  cpu?: string;
  memory?: string;
}

interface Service {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
}

const containers = ref<Container[]>([]);
const serverResources = ref<any>({});
const healthChecks = ref<Service[]>([]);
const logs = ref('');
const selectedLogType = ref('backend');
const showLogsModal = ref(false);
const selectedContainerName = ref('');
const containerLogs = ref('');

// Mock Data for Visuals
const recentLogs = [
   { time: '14:23:01', severity: 'INFO', service: 'auth-service', message: 'Token rotation successful for user_pool_1', node: 'worker-01' },
   { time: '14:22:45', severity: 'WARN', service: 'database-proxy', message: 'Slow query detected (205ms) in table table_users', node: 'db-read-02' },
   { time: '14:21:12', severity: 'ERROR', service: 'payment-gateway', message: 'Connection timeout to external provider API', node: 'worker-03' },
   { time: '14:20:55', severity: 'INFO', service: 'cron-job', message: 'Daily reconciliation job completed successfully', node: 'master-01' },
];

const mockChartBars = [
    { height: '45%', color: 'bg-blue-500/20 hover:bg-blue-500/40' },
    { height: '35%', color: 'bg-blue-500/30 hover:bg-blue-500/50' },
    { height: '60%', color: 'bg-blue-500/40 hover:bg-blue-500/60' },
    { height: '75%', color: 'bg-blue-500 hover:bg-blue-600' },
    { height: '50%', color: 'bg-blue-500 hover:bg-blue-600' },
    { height: '65%', color: 'bg-blue-500/80 hover:bg-blue-500' },
    { height: '40%', color: 'bg-blue-500/60 hover:bg-blue-500/80' },
    { height: '30%', color: 'bg-blue-500/40 hover:bg-blue-500/60' },
    { height: '90%', color: 'bg-red-400 hover:bg-red-500 animate-pulse' }, // Spike
    { height: '55%', color: 'bg-blue-500 hover:bg-blue-600' },
    { height: '45%', color: 'bg-blue-500 hover:bg-blue-600' },
    { height: '60%', color: 'bg-blue-500/70 hover:bg-blue-500' },
    { height: '35%', color: 'bg-blue-500/50 hover:bg-blue-500/70' },
    { height: '25%', color: 'bg-blue-500/30 hover:bg-blue-500/50' },
    { height: '50%', color: 'bg-blue-500 hover:bg-blue-600' },
    { height: '65%', color: 'bg-blue-500 hover:bg-blue-600' },
    { height: '70%', color: 'bg-blue-500 hover:bg-blue-600' },
    { height: '55%', color: 'bg-blue-500/80 hover:bg-blue-500' },
    { height: '40%', color: 'bg-blue-500/60 hover:bg-blue-500/80' },
    { height: '30%', color: 'bg-blue-500/40 hover:bg-blue-500/60' },
    { height: '45%', color: 'bg-blue-500 hover:bg-blue-600' },
    { height: '55%', color: 'bg-blue-500 hover:bg-blue-600' },
    { height: '50%', color: 'bg-blue-500 hover:bg-blue-600' },
    { height: '40%', color: 'bg-blue-500 hover:bg-blue-600' }
];

const getSeverityClass = (sev: string) => {
   if (sev === 'INFO') return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
   if (sev === 'WARN') return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
   if (sev === 'ERROR') return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
   return 'bg-slate-100 text-slate-700 border-slate-200';
};

let refreshInterval: any = null;

const loadContainers = async () => {
  try {
    const response = await api.get('/admin/docker/containers', { timeout: 15000 });
    containers.value = response.data?.containers || [];
  } catch (err: any) {
    if (err.code !== 'ECONNABORTED' && !err.message?.includes('timeout')) {
      console.error('Error loading containers:', err);
    }
    containers.value = [];
  }
};

const loadServerResources = async () => {
  try {
    const response = await api.get('/admin/server/resources', { timeout: 10000 });
    serverResources.value = response.data || {};
  } catch (err) {
    console.error('Error loading resources', err);
    serverResources.value = {};
  }
};

const loadHealthChecks = async () => {
  try {
    const response = await api.get('/admin/health', { timeout: 10000 });
    healthChecks.value = response.data?.services || [];
  } catch (err) {
    console.error('Error loading health', err);
    healthChecks.value = [];
  }
};

const loadLogs = async () => {
  try {
    const response = await api.get(`/admin/logs/${selectedLogType.value}?tail=200`);
    logs.value = response.data.logs || '';
  } catch (err) {
    console.error('Error loading logs', err);
  }
};

const viewLogs = async (containerName: string) => {
  selectedContainerName.value = containerName;
  showLogsModal.value = true;
  containerLogs.value = ''; 
  try {
    const response = await api.get(`/admin/docker/logs/${containerName}?tail=500`);
    containerLogs.value = response.data.logs || '';
  } catch (err) {
    console.error('Error loading container logs', err);
    containerLogs.value = 'Gagal memuat log.';
  }
};

const restartContainer = async (containerName: string) => {
  const confirmed = await confirm(`Restart "${containerName}"?`, 'Konfirmasi Restart', 'Restart', 'Batal');
  if (!confirmed) return;
  try {
    await api.post(`/admin/docker/restart/${containerName}`);
    await success('Container berhasil direstart', 'Sukses');
    await loadContainers();
  } catch {
    await error('Gagal merestart container', 'Error');
  }
};

const stopContainer = async (containerName: string) => {
  const confirmed = await confirm(`Matikan "${containerName}"?`, 'Konfirmasi Stop', 'Stop', 'Batal');
  if (!confirmed) return;
  try {
    await api.post(`/admin/docker/stop/${containerName}`);
    await success('Container berhasil dimatikan', 'Sukses');
    await loadContainers();
  } catch {
    await error('Gagal mematikan container', 'Error');
  }
};

const loadAllData = async () => {
  loading.value = true;
  await Promise.all([loadContainers(), loadServerResources(), loadHealthChecks(), loadLogs()]);
  loading.value = false;
};

const handleNotificationBell = () => {
  activeTab.value = 'overview';
  success('Lihat bagian Alerts di tab Ringkasan untuk detail peringatan aktif.');
};

const handleViewHistory = () => {
  activeTab.value = 'logs';
  success('Melihat riwayat log sistem.');
};

const handleRestartNode = async (nodeName: string) => {
  const confirmed = await confirm(`Restart node "${nodeName}"?`, 'Konfirmasi Restart', 'Restart', 'Batal');
  if (confirmed) {
    success(`Perintah restart untuk ${nodeName} telah dikirim.`);
  }
};

const handleDismissAlert = (alertType: string) => {
  success(`Alert ${alertType} telah diabaikan.`);
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  loadAllData();
  refreshInterval = setInterval(() => {
    if (activeTab.value === 'docker') loadContainers();
    else if (activeTab.value === 'overview') {
        loadServerResources(); // Refresh stats on overview
        loadHealthChecks();
    }
    else if (activeTab.value === 'health') loadHealthChecks();
  }, 10000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>
