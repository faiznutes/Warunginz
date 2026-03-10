<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Laporan Lanjutan</h1>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Laporan kustom, jadwal otomatis, dan kustomisasi dashboard.</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="showTemplateModal = true"
          class="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-400 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm transform hover:-translate-y-0.5 active:scale-95"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          <span>Buat Template</span>
        </button>
        <button
          @click="showScheduleModal = true"
          class="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition font-bold text-sm shadow-sm"
        >
          <span class="material-symbols-outlined text-[20px]">schedule</span>
          <span>Jadwalkan Laporan</span>
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-1.5">
      <nav class="flex gap-1">
        <button
          @click="activeTab = 'templates'"
          class="flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative overflow-hidden"
          :class="activeTab === 'templates' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-700/50'"
        >
           <span class="material-symbols-outlined text-[20px]" :class="activeTab === 'templates' ? 'fill-current' : ''">description</span>
          Template Laporan
        </button>
        <button
          @click="activeTab = 'scheduled'"
          class="flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative overflow-hidden"
          :class="activeTab === 'scheduled' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-700/50'"
        >
          <span class="material-symbols-outlined text-[20px]" :class="activeTab === 'scheduled' ? 'fill-current' : ''">schedule</span>
          Laporan Terjadwal
        </button>
        <button
          @click="activeTab = 'dashboard'"
          class="flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative overflow-hidden"
          :class="activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-700/50'"
        >
          <span class="material-symbols-outlined text-[20px]" :class="activeTab === 'dashboard' ? 'fill-current' : ''">dashboard_customize</span>
          Pengaturan Dashboard
        </button>
      </nav>
    </div>

    <!-- Templates Tab -->
    <div v-if="activeTab === 'templates'" class="space-y-6 animate-fade-in-up">
      <div v-if="templates.length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <div class="bg-purple-50 dark:bg-purple-900/20 w-24 h-24 rounded-full flex items-center justify-center mb-6">
             <span class="material-symbols-outlined text-[48px] text-purple-300">description</span>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum Ada Template</h3>
        <p class="text-slate-500 text-center max-w-md mb-6 font-medium">Buat template laporan pertama Anda untuk menyesuaikan kebutuhan data.</p>
        <button
          @click="showTemplateModal = true"
          class="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-purple-500/30 transition-all font-bold text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Buat Template
        </button>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="template in templates"
          :key="template.id"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all group"
        >
          <div class="flex justify-between items-start mb-4">
             <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              {{ template.type }}
            </span>
             <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button
                @click="editTemplate(template)"
                class="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-blue-600 transition"
                title="Edit"
              >
                <span class="material-symbols-outlined text-[18px]">edit</span>
              </button>
             </div>
          </div>
         
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1" :title="template.name">{{ template.name }}</h3>
          <p class="text-sm text-slate-500 mb-6 line-clamp-2 h-10">{{ template.description || 'Tidak ada deskripsi' }}</p>
          
          <button
            @click="generateReport(template)"
            class="w-full py-2.5 text-sm font-bold bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 transition flex items-center justify-center gap-2 group-hover:bg-purple-600 group-hover:text-white dark:group-hover:bg-purple-600 dark:group-hover:text-white"
          >
            <span class="material-symbols-outlined text-[18px]">play_arrow</span>
            Generate Laporan
          </button>
        </div>
      </div>
    </div>

    <!-- Scheduled Reports Tab -->
    <div v-if="activeTab === 'scheduled'" class="space-y-6 animate-fade-in-up">
      <div v-if="scheduledReports.length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <div class="bg-blue-50 dark:bg-blue-900/20 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <span class="material-symbols-outlined text-[48px] text-blue-300">schedule</span>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Belum Ada Jadwal</h3>
        <p class="text-slate-500 text-center max-w-md mb-6 font-medium">Atur pengiriman laporan otomatis ke email Anda.</p>
        <button
          @click="showScheduleModal = true"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Buat Jadwal
        </button>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="report in scheduledReports"
          :key="report.id"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all group relative overflow-hidden"
        >
            <div class="absolute inset-y-0 left-0 w-1.5" :class="getStatusColorClass(report.status)"></div>
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ report.templateName || 'Laporan Tanpa Nama' }}</h3>
                <span
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full border shadow-sm"
                  :class="getStatusBadgeClass(report.status)"
                >
                  {{ report.status === 'ACTIVE' ? 'Aktif' : (report.status === 'PAUSED' ? 'Dijeda' : 'Selesai') }}
                </span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mt-3">
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jadwal</p>
                  <p class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px] text-slate-400">event_repeat</span>
                      {{ formatScheduleType(report.schedule) }}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Format</p>
                  <p class="font-bold text-slate-700 dark:text-slate-300 badge bg-slate-100 dark:bg-slate-700 px-2 rounded">{{ report.format }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Eksekusi Berikutnya</p>
                  <p class="font-bold text-slate-700 dark:text-slate-300">{{ report.nextRunAt ? formatDate(report.nextRunAt) : '-' }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Penerima</p>
                  <p class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px] text-slate-400">group</span>
                      {{ report.recipients?.length || 0 }} email
                  </p>
                </div>
              </div>
            </div>
            <div class="flex sm:flex-col gap-2 md:border-l md:border-slate-100 md:dark:border-slate-700 md:pl-6">
              <button
                @click="editSchedule(report)"
                class="flex-1 px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-[16px]">edit</span>
                Ubah
              </button>
              <button
                @click="deleteSchedule(report)"
                class="flex-1 px-4 py-2 text-xs font-bold bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-2"
              >
                <span class="material-symbols-outlined text-[16px]">delete</span>
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Settings Tab -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6 animate-fade-in-up">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <div class="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
                 <span class="material-symbols-outlined text-[32px]">dashboard_customize</span>
            </div>
            <div>
                 <h3 class="text-xl font-bold text-slate-900 dark:text-white">Kustomisasi Dashboard</h3>
                <p class="text-slate-500 text-sm font-medium">Pilih widget yang ingin ditampilkan di halaman dashboard utama Anda.</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="widget in dashboardWidgets"
            :key="widget.id"
            class="group relative border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300"
            :class="selectedWidgets.includes(widget.id) ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            @click="toggleWidget(widget.id)"
          >
             <div class="flex justify-between items-start mb-2">
                 <div class="p-2 rounded-xl" :class="selectedWidgets.includes(widget.id) ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'">
                     <span class="material-symbols-outlined text-[20px]">{{ getWidgetIcon(widget.id) }}</span>
                 </div>
                 <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
                  :class="selectedWidgets.includes(widget.id) ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600'"
                 >
                     <span v-if="selectedWidgets.includes(widget.id)" class="material-symbols-outlined text-[14px] font-bold">check</span>
                 </div>
             </div>
            <h4 class="font-bold text-slate-900 dark:text-white mb-1">{{ widget.name }}</h4>
            <p class="text-xs text-slate-500 font-medium">{{ widget.description }}</p>
          </div>
        </div>

        <div class="mt-8 flex justify-end pt-6 border-t border-slate-100 dark:border-slate-700">
          <button
            @click="saveDashboardSettings"
            :disabled="saving"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all font-bold text-sm disabled:opacity-50 h-[48px]"
          >
            <div v-if="saving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span class="material-symbols-outlined text-[20px]" v-else>save</span>
            {{ saving ? 'Menyimpan...' : 'Simpan Tata Letak' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create Template Modal -->
    <div
      v-if="showTemplateModal"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      @click.self="closeTemplateModal"
    >
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in border border-white/20">
        <div class="p-8">
          <div class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-4">
                  <div class="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl">
                      <span class="material-symbols-outlined text-[28px]">post_add</span>
                  </div>
                   <div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                        {{ editingTemplate ? 'Ubah Template' : 'Buat Template Baru' }}
                        </h3>
                        <p class="text-sm text-slate-500 font-medium">Konfigurasikan struktur laporan kustom Anda.</p>
                   </div>
              </div>
            <button
              @click="closeTemplateModal"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-slate-600"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form @submit.prevent="saveTemplate" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Template <span class="text-red-500">*</span></label>
                    <input
                        v-model="templateForm.name"
                        type="text"
                        required
                        placeholder="Contoh: Laporan Penjualan Harian"
                        class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                </div>
                 <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipe Laporan <span class="text-red-500">*</span></label>
                    <select
                        v-model="templateForm.type"
                        required
                        class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer"
                    >
                        <option value="">Pilih Tipe</option>
                        <option value="SALES">Laporan Penjualan</option>
                        <option value="INVENTORY">Laporan Stok</option>
                        <option value="FINANCIAL">Laporan Keuangan</option>
                        <option value="CUSTOMER">Laporan Pelanggan</option>
                        <option value="CUSTOM">Custom</option>
                    </select>
                </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deskripsi</label>
              <textarea
                v-model="templateForm.description"
                rows="3"
                placeholder="Jelaskan tujuan laporan ini..."
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              ></textarea>
            </div>

            <div class="border-t border-slate-100 dark:border-slate-700 pt-6">
              <div class="flex items-center justify-between mb-4">
                   <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider">Kolom Data</label>
                   <button
                    type="button"
                    @click="addColumn"
                    class="px-3 py-1.5 text-xs font-bold bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40 rounded-lg transition flex items-center gap-1"
                    >
                    <span class="material-symbols-outlined text-[16px]">add</span>
                    Tambah Kolom
                    </button>
              </div>
              
              <div class="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div v-if="templateForm.config.columns.length === 0" class="text-center py-4 text-slate-400 text-sm italic">
                    Belum ada kolom yang ditambahkan.
                </div>
                <TransitionGroup name="list" tag="div" class="space-y-2">
                    <div
                    v-for="(column, index) in templateForm.config.columns"
                    :key="index"
                    class="flex items-center gap-3 animate-fade-in"
                    >
                        <div class="flex-none w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                            {{ index + 1 }}
                        </div>
                        <input
                            v-model="column.field"
                            type="text"
                            placeholder="Nama Field Database (ex: total_revenue)"
                            class="flex-1 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none"
                        />
                        <input
                            v-model="column.label"
                            type="text"
                            placeholder="Label Tampilan (ex: Total Pendapatan)"
                            class="flex-1 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 outline-none"
                        />
                        <button
                            type="button"
                            @click="removeColumn(index)"
                            class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                            <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    </div>
                </TransitionGroup>
              </div>
            </div>

            <div class="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                @click="closeTemplateModal"
                class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-bold text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition font-bold text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                <div v-if="saving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ saving ? 'Menyimpan...' : 'Simpan Template' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Create Schedule Modal -->
    <div
      v-if="showScheduleModal"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      @click.self="closeScheduleModal"
    >
      <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-scale-in border border-white/20">
         <div class="flex items-center justify-between mb-8">
             <div class="flex items-center gap-4">
                 <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
                     <span class="material-symbols-outlined text-[28px]">event_available</span>
                 </div>
                 <div>
                      <h3 class="text-2xl font-black text-slate-900 dark:text-white leading-tight">Jadwalkan Laporan</h3>
                      <p class="text-sm text-slate-500 font-medium">Otomatisasi pengiriman laporan berkala.</p>
                 </div>
             </div>
            <button
              @click="closeScheduleModal"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-400 hover:text-slate-600"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form @submit.prevent="saveSchedule" class="space-y-6">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Template <span class="text-red-500">*</span></label>
              <select
                v-model="scheduleForm.templateId"
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="">-- Pilih Template Laporan --</option>
                <option v-for="template in templates" :key="template.id" :value="template.id">
                  {{ template.name }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Frekuensi <span class="text-red-500">*</span></label>
                  <select
                    v-model="scheduleForm.schedule"
                    required
                    @change="updateScheduleConfig"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="DAILY">Harian</option>
                    <option value="WEEKLY">Mingguan</option>
                    <option value="MONTHLY">Bulanan</option>
                  </select>
                </div>
                 <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Format <span class="text-red-500">*</span></label>
                  <select
                    v-model="scheduleForm.format"
                    required
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="EXCEL">Microsoft Excel</option>
                    <option value="CSV">CSV Data</option>
                  </select>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                 <div v-if="scheduleForm.schedule === 'WEEKLY'">
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hari</label>
                  <select
                    v-model="scheduleForm.scheduleConfig.dayOfWeek"
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                  >
                    <option :value="1">Senin</option>
                    <option :value="2">Selasa</option>
                    <option :value="3">Rabu</option>
                    <option :value="4">Kamis</option>
                    <option :value="5">Jumat</option>
                    <option :value="6">Sabtu</option>
                    <option :value="0">Minggu</option>
                  </select>
                </div>

                <div v-if="scheduleForm.schedule === 'MONTHLY'">
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
                  <input
                    v-model.number="scheduleForm.scheduleConfig.dayOfMonth"
                    type="number"
                    min="1"
                    max="31"
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                  />
                </div>

                <div :class="scheduleForm.schedule === 'DAILY' ? 'col-span-2' : ''">
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Waktu Eksekusi</label>
                  <input
                    v-model="scheduleForm.scheduleConfig.time"
                    type="time"
                    class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium"
                  />
                </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Penerima Email <span class="text-red-500">*</span></label>
              <textarea
                v-model="scheduleForm.recipientsText"
                rows="3"
                placeholder="Masukkan alamat email, satu per baris..."
                required
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
              ></textarea>
               <p class="text-xs text-slate-400 mt-1 italic">Pisahkan dengan baris baru (Enter) untuk banyak penerima.</p>
            </div>

            <div class="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
              <button
                type="button"
                @click="closeScheduleModal"
                class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-bold text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition font-bold text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <div v-if="saving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ saving ? 'Menyimpan...' : 'Simpan Jadwal' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const activeTab = ref('templates');
const templates = ref<any[]>([]);
const scheduledReports = ref<any[]>([]);
const dashboardWidgets = ref([
  { id: 'sales-overview', name: 'Ringkasan Penjualan', description: 'Metrik penjualan & pendapatan utama' },
  { id: 'top-products', name: 'Produk Terlaris', description: 'Peringkat produk berdasarkan performa' },
  { id: 'recent-orders', name: 'Pesanan Terbaru', description: 'Daftar transaksi yang baru masuk' },
  { id: 'customer-stats', name: 'Statistik Pelanggan', description: 'Demografi dan retensi pelanggan' },
  { id: 'inventory-alerts', name: 'Peringatan Stok', description: 'Notifikasi stok menipis/habis' },
  { id: 'financial-summary', name: 'Ringkasan Keuangan', description: 'Laba rugi dan arus kas' },
]);
const selectedWidgets = ref<string[]>([]);
const showTemplateModal = ref(false);
const showScheduleModal = ref(false);
const editingTemplate = ref<any>(null);
const editingScheduleId = ref<string | null>(null);
const saving = ref(false);

const templateForm = ref({
  name: '',
  description: '',
  type: '',
  config: {
    columns: [{ field: '', label: '', type: 'string' }],
    filters: [],
  },
});

const scheduleForm = ref({
  templateId: '',
  schedule: 'DAILY',
  scheduleConfig: {
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
  },
  format: 'PDF',
  recipientsText: '',
});

const getWidgetIcon = (id: string) => {
    switch(id) {
        case 'sales-overview': return 'bar_chart';
        case 'top-products': return 'star';
        case 'recent-orders': return 'receipt_long';
        case 'customer-stats': return 'groups';
        case 'inventory-alerts': return 'inventory_2';
        case 'financial-summary': return 'payments';
        default: return 'widgets';
    }
}

const loadTemplates = async () => {
  try {
    const response = await api.get('/advanced-reporting/templates');
    templates.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading templates:', error);
    await showError('Gagal memuat template laporan');
  }
};

const loadScheduledReports = async () => {
  try {
    const response = await api.get('/advanced-reporting/scheduled');
    scheduledReports.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading scheduled reports:', error);
  }
};

const loadDashboardSettings = async () => {
  try {
    const response = await api.get('/advanced-reporting/dashboard-settings');
    if (response.data.widgets) {
      selectedWidgets.value = response.data.widgets.map((w: any) => w.id);
    }
  } catch (error: any) {
    console.error('Error loading dashboard settings:', error);
  }
};

const saveTemplate = async () => {
  saving.value = true;
  try {
    if (editingTemplate.value) {
      await api.put(`/advanced-reporting/templates/${editingTemplate.value.id}`, templateForm.value);
      await showSuccess('Template berhasil diperbarui');
    } else {
      await api.post('/advanced-reporting/templates', templateForm.value);
      await showSuccess('Template berhasil dibuat');
    }
    closeTemplateModal();
    await loadTemplates();
  } catch (error: any) {
    console.error('Error saving template:', error);
    await showError('Gagal menyimpan template');
  } finally {
    saving.value = false;
  }
};

const saveSchedule = async () => {
  saving.value = true;
  try {
    const recipients = scheduleForm.value.recipientsText.split('\n').filter(e => e.trim());
    const data = {
      ...scheduleForm.value,
      recipients,
    };
    // remove recipientsText from payload if necessary, but backend might ignore it
    // Cast to any to avoid TS error if needed, or create proper type
    const payload: any = { ...data };
    delete payload.recipientsText;
    
    if (editingScheduleId.value) {
      await api.put(`/advanced-reporting/scheduled/${editingScheduleId.value}`, payload);
      await showSuccess('Jadwal laporan berhasil diperbarui');
    } else {
      await api.post('/advanced-reporting/scheduled', payload);
      await showSuccess('Jadwal laporan berhasil dibuat');
    }
    closeScheduleModal();
    await loadScheduledReports();
  } catch (error: any) {
    console.error('Error saving schedule:', error);
    await showError('Gagal menyimpan jadwal');
  } finally {
    saving.value = false;
  }
};

const saveDashboardSettings = async () => {
  saving.value = true;
  try {
    const settings = {
      widgets: selectedWidgets.value.map(id => ({
        id,
        position: { x: 0, y: 0 },
        size: { w: 4, h: 2 },
      })),
      layout: 'grid',
    };
    await api.put('/advanced-reporting/dashboard-settings', settings);
    await showSuccess('Pengaturan dashboard berhasil disimpan');
  } catch (error: any) {
    console.error('Error saving dashboard settings:', error);
    await showError('Gagal menyimpan pengaturan dashboard');
  } finally {
    saving.value = false;
  }
};

const generateReport = async (template: any) => {
  try {
    await api.post('/advanced-reporting/generate', {
      templateId: template.id,
    });
    await showSuccess('Laporan sedang digenerate. Silakan cek email Anda sebentar lagi.');
  } catch (error: any) {
    console.error('Error generating report:', error);
    await showError('Gagal meng-generate laporan');
  }
};

const editTemplate = (template: any) => {
  editingTemplate.value = template;
  templateForm.value = {
    name: template.name,
    description: template.description || '',
    type: template.type,
    config: template.config || { columns: [], filters: [] },
  };
  showTemplateModal.value = true;
};

const editSchedule = (report: any) => {
  editingScheduleId.value = report.id;
  scheduleForm.value = {
    templateId: report.templateId,
    schedule: report.schedule,
    scheduleConfig: { ...report.scheduleConfig },
    format: report.format,
    recipientsText: report.recipients ? report.recipients.join('\n') : '',
  };
  showScheduleModal.value = true;
};

const deleteSchedule = async (report: any) => {
  const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus jadwal laporan ini?');
  if (!confirmed) return;
  
  try {
    await api.delete(`/advanced-reporting/scheduled/${report.id}`);
    await showSuccess('Jadwal laporan berhasil dihapus');
    await loadScheduledReports();
  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    await showError(error.response?.data?.message || 'Gagal menghapus jadwal');
  }
};

const addColumn = () => {
  templateForm.value.config.columns.push({ field: '', label: '', type: 'string' });
};

const removeColumn = (index: number) => {
  templateForm.value.config.columns.splice(index, 1);
};

const toggleWidget = (widgetId: string) => {
  const index = selectedWidgets.value.indexOf(widgetId);
  if (index > -1) {
    selectedWidgets.value.splice(index, 1);
  } else {
    selectedWidgets.value.push(widgetId);
  }
};

const updateScheduleConfig = () => {
  // Reset config defaults based on schedule type
  if (scheduleForm.value.schedule === 'DAILY') {
    scheduleForm.value.scheduleConfig = { time: '09:00', dayOfWeek: 1, dayOfMonth: 1 };
  } else if (scheduleForm.value.schedule === 'WEEKLY') {
    scheduleForm.value.scheduleConfig = { dayOfWeek: 1, time: '09:00', dayOfMonth: 1 };
  } else if (scheduleForm.value.schedule === 'MONTHLY') {
    scheduleForm.value.scheduleConfig = { dayOfMonth: 1, time: '09:00', dayOfWeek: 1 };
  }
};

const closeTemplateModal = () => {
  showTemplateModal.value = false;
  editingTemplate.value = null;
  templateForm.value = {
    name: '',
    description: '',
    type: '',
    config: {
      columns: [{ field: '', label: '', type: 'string' }],
      filters: [],
    },
  };
};

const closeScheduleModal = () => {
  showScheduleModal.value = false;
  editingScheduleId.value = null;
  scheduleForm.value = {
    templateId: '',
    schedule: 'DAILY',
    scheduleConfig: {
      dayOfWeek: 1,
      dayOfMonth: 1,
      time: '09:00',
    },
    format: 'PDF',
    recipientsText: '',
  };
};

const getStatusColorClass = (status: string): string => {
    switch(status) {
        case 'ACTIVE': return 'bg-blue-500';
        case 'PAUSED': return 'bg-amber-500';
        case 'COMPLETED': return 'bg-blue-500';
        default: return 'bg-slate-300';
    }
}

const getStatusBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    ACTIVE: 'bg-blue-100 text-blue-700 border-emerald-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    PAUSED: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    COMPLETED: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
  };
  return classes[status] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600';
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatScheduleType = (type: string) => {
    switch(type) {
        case 'DAILY': return 'Harian';
        case 'WEEKLY': return 'Mingguan';
        case 'MONTHLY': return 'Bulanan';
        default: return type;
    }
}

onMounted(() => {
  loadTemplates();
  loadScheduledReports();
  loadDashboardSettings();
});
</script>

<style scoped>
/* Scoped styles */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
