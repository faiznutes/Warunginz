<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pesan Masuk</h2>
        <p class="text-slate-500 dark:text-slate-400 mt-1 font-medium">Kelola pertanyaan, masukan, dan pesan dari pengguna ekosistem.</p>
      </div>
      <div class="flex items-center gap-3">
         <div class="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total: <span class="text-slate-900 dark:text-white">{{ activeTab === 'contact' ? contactPagination.total : ticketPagination.total }}</span></span>
         </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm w-fit">
      <button
        @click="activeTab = 'contact'; loadMessages()"
        :class="[
          'px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2',
          activeTab === 'contact'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        ]"
      >
        <span class="material-symbols-outlined text-[18px]">mail</span>
        Pesan Kontak
      </button>
      <button
        @click="activeTab = 'support'; loadTickets()"
        :class="[
          'px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2',
          activeTab === 'support'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        ]"
      >
        <span class="material-symbols-outlined text-[18px]">support_agent</span>
        Tiket Support
      </button>
    </div>

    <!-- ==================== CONTACT MESSAGES TAB ==================== -->
    <template v-if="activeTab === 'contact'">
      <!-- Filters & Search -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div class="relative w-full sm:w-96 group">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors text-[20px]">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari pengirim, subjek, atau isi pesan..."
            class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-sm hover:bg-white dark:hover:bg-slate-800"
            @input="loadMessages"
          />
        </div>
        <div class="w-full sm:w-auto relative group">
           <select
             v-model="filterRead"
             @change="loadMessages"
             class="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white appearance-none cursor-pointer shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors"
           >
             <option value="">Semua Status</option>
             <option value="false">Belum Dibaca</option>
             <option value="true">Sudah Dibaca</option>
           </select>
           <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
              <span class="material-symbols-outlined">expand_more</span>
           </div>
        </div>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm backdrop-blur-sm">
         <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
         <div class="text-slate-500 font-bold text-sm animate-pulse">Menyingkronkan kotak masuk...</div>
      </div>

      <div v-else-if="messages.length === 0" class="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 backdrop-blur-sm">
         <div class="bg-slate-100 dark:bg-slate-700/50 p-6 rounded-full mb-4">
            <span class="material-symbols-outlined text-slate-400 text-4xl">inbox</span>
         </div>
         <p class="text-slate-900 dark:text-white font-black text-lg">Kotak Masuk Kosong</p>
         <p class="text-slate-500 text-sm font-medium mt-1">Belum ada pesan masuk yang ditemukan.</p>
      </div>

      <div v-else class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-0 animate-fade-in-up">
        <!-- Bulk Actions Bar -->
        <div v-if="selectedMessages.length > 0" class="px-6 py-4 bg-blue-50/80 dark:bg-blue-900/40 border-b border-blue-100 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
          <div class="flex items-center gap-2 text-sm font-black text-blue-700 dark:text-blue-400">
            <span class="material-symbols-outlined text-[20px]">check_circle</span>
            {{ selectedMessages.length }} pesan dipilih
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              @click="bulkMarkAsRead"
              class="px-4 py-2 bg-blue-100 hover:bg-emerald-200 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <span class="material-symbols-outlined text-[18px]">mark_email_read</span>
              Tandai Dibaca
            </button>
            <button
              @click="bulkMarkAsUnread"
              class="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
             <span class="material-symbols-outlined text-[18px]">mark_email_unread</span>
              Tandai Belum Dibaca
            </button>
            <button
              @click="bulkDelete"
              class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
              Hapus Permanen
            </button>
            <button
              @click="selectedMessages = []"
              class="px-4 py-2 border border-slate-300 hover:bg-white text-slate-500 rounded-xl text-xs font-bold transition-all"
            >
              Batal
            </button>
          </div>
        </div>

        <!-- Messages Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-4 w-10">
                  <div class="flex items-center justify-center">
                    <input
                      type="checkbox"
                      :checked="selectedMessages.length === messages.length && messages.length > 0"
                      @change="toggleSelectAll"
                      class="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer size-4"
                    />
                  </div>
                </th>
                <th class="px-6 py-4">Pengirim</th>
                <th class="px-6 py-4">Subjek & Cuplikan</th>
                <th class="px-6 py-4">Waktu</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700 mix-blend-multiply dark:mix-blend-normal">
              <tr
                v-for="message in messages"
                :key="message.id"
                class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
                :class="{ 'bg-blue-50/60 dark:bg-blue-900/20': !message.isRead }"
                @click.stop="viewMessage(message)"
              >
                <td class="px-6 py-4" @click.stop>
                  <div class="flex items-center justify-center">
                    <input
                      type="checkbox"
                      :value="message.id"
                      v-model="selectedMessages"
                      class="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer size-4"
                    />
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                     <div :class="['text-sm text-slate-900 dark:text-white mb-0.5', !message.isRead ? 'font-black' : 'font-bold']">{{ message.name }}</div>
                     <div class="text-xs text-slate-500 font-medium">{{ message.email }}</div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div :class="['text-sm text-slate-800 dark:text-slate-200 max-w-sm truncate mb-0.5', !message.isRead ? 'font-bold' : 'font-medium']">
                     {{ message.subject }}
                  </div>
                   <p class="text-xs text-slate-500 truncate max-w-xs">{{ message.message }}</p>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-xs font-bold text-slate-500 flex items-center gap-1">
                     {{ formatDate(message.createdAt) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm"
                    :class="message.isRead 
                      ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' 
                      : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'"
                  >
                    <span class="size-1.5 rounded-full" :class="message.isRead ? 'bg-slate-400' : 'bg-blue-500 animate-pulse'"></span>
                    {{ message.isRead ? 'Dibaca' : 'Baru' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right" @click.stop>
                  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      @click="viewMessage(message)"
                      class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                      title="Baca Pesan"
                    >
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button
                      @click="toggleReadStatus(message)"
                      class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                      :title="message.isRead ? 'Tandai Belum Dibaca' : 'Tandai Dibaca'"
                    >
                      <span class="material-symbols-outlined text-[18px]">{{ message.isRead ? 'mark_email_unread' : 'mark_email_read' }}</span>
                    </button>
                    <button
                      @click="deleteMessage(message)"
                      class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      title="Hapus Pesan"
                    >
                      <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="contactPagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div class="text-xs font-bold text-slate-500">
            Menampilkan <span class="text-slate-900 dark:text-white">{{ (contactPagination.page - 1) * contactPagination.limit + 1 }}</span> - <span class="text-slate-900 dark:text-white">{{ Math.min(contactPagination.page * contactPagination.limit, contactPagination.total) }}</span> dari <span class="text-slate-900 dark:text-white">{{ contactPagination.total }}</span> entries
          </div>
          <div class="flex gap-2">
            <button
              @click="changeContactPage(contactPagination.page - 1)"
              :disabled="contactPagination.page === 1"
              class="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-300 shadow-sm"
            >
              Sebelumnya
            </button>
            <button
              @click="changeContactPage(contactPagination.page + 1)"
              :disabled="contactPagination.page === contactPagination.totalPages"
              class="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-300 shadow-sm"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== SUPPORT TICKETS TAB ==================== -->
    <template v-if="activeTab === 'support'">
      <!-- Filter Bar -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-5 items-center justify-between">
        <div class="flex flex-col md:flex-row gap-3 w-full flex-1">
          <div class="relative w-full md:w-80 group">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-blue-500 transition-colors text-[20px]">search</span>
            <input
              v-model="ticketSearchQuery"
              @input="debouncedTicketSearch"
              type="text"
              placeholder="Cari Ticket ID, Subjek..."
              class="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-sm hover:bg-white dark:hover:bg-slate-800"
            />
          </div>
          <div class="flex gap-3 w-full md:w-auto">
            <div class="relative group">
              <select v-model="ticketStatusFilter" @change="loadTickets" class="pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white appearance-none cursor-pointer shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors min-w-[140px]">
                <option value="">Semua Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <span class="material-symbols-outlined">expand_more</span>
              </div>
            </div>
            <div class="relative group">
              <select v-model="ticketPriorityFilter" @change="loadTickets" class="pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white appearance-none cursor-pointer shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors min-w-[140px]">
                <option value="">Semua Prioritas</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <span class="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>
        </div>
        <button @click="showCreateTicketModal = true" class="w-full sm:w-auto px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
          <span class="material-symbols-outlined text-[20px]">add_circle</span>
          Buat Tiket Baru
        </button>
      </div>

      <!-- Stats Row -->
      <div class="flex gap-3 flex-wrap">
        <div class="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">High Priority</span>
            <span class="text-sm font-black text-slate-900 dark:text-white">{{ highPriorityCount }} Aktif</span>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <span class="flex h-2 w-2 rounded-full bg-blue-500"></span>
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Open Tickets</span>
            <span class="text-sm font-black text-slate-900 dark:text-white">{{ openTicketCount }} Total</span>
          </div>
        </div>
      </div>

      <div v-if="ticketLoading" class="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm backdrop-blur-sm">
         <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
         <div class="text-slate-500 font-bold text-sm animate-pulse">Memuat tiket support...</div>
      </div>

      <div v-else class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col min-h-0 animate-fade-in-up">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-4 w-[140px]">Ticket ID</th>
                <th class="px-6 py-4">Subjek</th>
                <th class="px-6 py-4 w-[120px]">Prioritas</th>
                <th class="px-6 py-4 w-[140px]">Status</th>
                <th class="px-6 py-4 w-[160px]">Ditugaskan</th>
                <th class="px-6 py-4 w-[180px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="ticket in tickets" :key="ticket.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer" @click="viewTicket(ticket)">
                <td class="px-6 py-4">
                  <span class="text-sm font-mono font-bold text-blue-600">#{{ ticket.id.substring(0, 8) }}</span>
                  <div class="text-[10px] text-slate-400 mt-0.5 font-medium">{{ formatTimeAgo(ticket.createdAt) }}</div>
                </td>
                <td class="px-6 py-4">
                  <p class="text-sm font-bold text-slate-900 dark:text-white">{{ ticket.subject }}</p>
                  <p class="text-xs text-slate-500 truncate max-w-[300px]">{{ ticket.description }}</p>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold"
                    :class="getTicketPriorityClass(ticket.priority)"
                  >
                    <span class="material-symbols-outlined text-[14px]">{{ getTicketPriorityIcon(ticket.priority) }}</span>
                    {{ ticket.priority }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border"
                    :class="getTicketStatusClass(ticket.status)"
                  >
                    <span class="size-1.5 rounded-full" :class="getTicketStatusDotClass(ticket.status)"></span>
                    {{ getTicketStatusLabel(ticket.status) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div v-if="ticket.assignedTo" class="flex items-center gap-2">
                    <div class="size-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-black">
                      {{ ticket.assignedTo.name?.charAt(0) || 'A' }}
                    </div>
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ ticket.assignedTo.name || 'Agent' }}</span>
                  </div>
                  <span v-else class="text-xs text-slate-400 italic font-medium">Belum ditugaskan</span>
                </td>
                <td class="px-6 py-4" @click.stop>
                  <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="viewTicket(ticket)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Lihat Detail">
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button @click="assignTicket(ticket)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Tugaskan Agent">
                      <span class="material-symbols-outlined text-[18px]">person_add</span>
                    </button>
                    <button @click="addNote(ticket)" class="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-green-100" title="Tambah Catatan">
                      <span class="material-symbols-outlined text-[18px]">add_comment</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="tickets.length === 0">
                <td colspan="6" class="px-6 py-24 text-center">
                  <div class="flex flex-col items-center gap-2">
                    <div class="bg-slate-100 dark:bg-slate-700/50 p-6 rounded-full mb-2">
                      <span class="material-symbols-outlined text-slate-400 text-4xl">confirmation_number</span>
                    </div>
                    <p class="text-slate-900 dark:text-white font-black text-lg">Tidak ada tiket</p>
                    <p class="text-slate-500 text-sm font-medium">Tidak ada tiket support yang ditemukan.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Ticket Pagination -->
        <div v-if="ticketPagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
          <div class="text-xs font-bold text-slate-500">
            Halaman <span class="text-slate-900 dark:text-white">{{ ticketPagination.page }}</span> dari <span class="text-slate-900 dark:text-white">{{ ticketPagination.totalPages }}</span>
          </div>
          <div class="flex gap-2">
            <button @click="changeTicketPage(ticketPagination.page - 1)" :disabled="ticketPagination.page <= 1" class="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-300 shadow-sm">Sebelumnya</button>
            <button @click="changeTicketPage(ticketPagination.page + 1)" :disabled="ticketPagination.page >= ticketPagination.totalPages" class="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition text-slate-600 dark:text-slate-300 shadow-sm">Selanjutnya</button>
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== CONTACT MESSAGE DETAIL MODAL ==================== -->
    <Teleport to="body">
      <div
        v-if="showDetailModal"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        @click.self="showDetailModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col animate-scale-in border border-slate-200 dark:border-slate-700">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <div class="flex items-center gap-3">
               <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                  <span class="material-symbols-outlined">mail</span>
               </div>
               <h3 class="text-lg font-black text-slate-900 dark:text-white">Detail Pesan</h3>
            </div>
            <button
              @click="showDetailModal = false"
              class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              <span class="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
          
          <div v-if="selectedMessage" class="p-8 overflow-y-auto space-y-6 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/20">
            <div class="flex items-start justify-between gap-4">
               <div class="flex items-center gap-4">
                  <div class="size-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-black uppercase shadow-md">
                     {{ selectedMessage.name.charAt(0) }}
                  </div>
                  <div>
                     <h4 class="font-bold text-slate-900 dark:text-white text-lg">{{ selectedMessage.name }}</h4>
                     <p class="text-sm text-slate-500 font-medium">{{ selectedMessage.email }}</p>
                  </div>
               </div>
               <div class="text-right">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Diterima pada</p>
                  <p class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ formatDate(selectedMessage.createdAt) }}</p>
               </div>
            </div>

            <div class="space-y-2">
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Subjek Pesan</label>
               <div class="text-lg font-bold text-slate-900 dark:text-white leading-normal">{{ selectedMessage.subject }}</div>
            </div>

            <div class="space-y-2">
               <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Isi Pesan</label>
               <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed shadow-sm font-medium">
                  {{ selectedMessage.message }}
               </div>
            </div>

            <div class="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">No. Telepon</label>
                  <p class="text-sm font-bold text-slate-900 dark:text-white mt-1 font-mono">{{ selectedMessage.phone || '-' }}</p>
               </div>
               <div>
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status Pesan</label>
                  <div class="mt-1">
                     <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm"
                        :class="selectedMessage.isRead 
                           ? 'bg-blue-50 text-blue-700 border-emerald-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' 
                           : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'"
                     >
                        <span class="size-1.5 rounded-full" :class="selectedMessage.isRead ? 'bg-blue-500' : 'bg-blue-500'"></span>
                        {{ selectedMessage.isRead ? 'Sudah Dibaca' : 'Belum Dibaca' }}
                     </span>
                  </div>
               </div>
            </div>
          </div>
          
          <div class="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900">
            <button
              @click="toggleReadStatus(selectedMessage)"
              class="px-4 py-2.5 border border-slate-200 hover:bg-white text-slate-500 hover:text-blue-600 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">{{ selectedMessage.isRead ? 'mark_email_unread' : 'mark_email_read' }}</span>
              <span>{{ selectedMessage.isRead ? 'Tandai Belum' : 'Tandai Dibaca' }}</span>
            </button>
            <button
              @click="deleteMessage(selectedMessage)"
              class="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-100 rounded-xl text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
              <span>Hapus Pesan</span>
            </button>
            <button
              @click="showDetailModal = false"
              class="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== TICKET DETAIL MODAL ==================== -->
    <Teleport to="body">
      <div v-if="showTicketDetailModal && selectedTicket" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showTicketDetailModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <div>
              <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ selectedTicket.subject }}</h3>
              <p class="text-sm text-slate-500 font-mono font-bold">#{{ selectedTicket.id?.substring(0, 8) }}</p>
            </div>
            <button @click="showTicketDetailModal = false" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6 space-y-6 overflow-y-auto">
            <div class="grid grid-cols-2 gap-4">
              <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Status</p>
                <span :class="getTicketStatusClass(selectedTicket.status)" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border">{{ getTicketStatusLabel(selectedTicket.status) }}</span>
              </div>
              <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Prioritas</p>
                <span :class="getTicketPriorityClass(selectedTicket.priority)" class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold">{{ selectedTicket.priority }}</span>
              </div>
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Deskripsi</label>
              <div class="mt-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-medium">{{ selectedTicket.description }}</div>
            </div>
          </div>
          <div class="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end bg-slate-50 dark:bg-slate-900">
            <button @click="showTicketDetailModal = false" class="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg transition-all">Tutup</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== CREATE TICKET MODAL ==================== -->
    <Teleport to="body">
      <div v-if="showCreateTicketModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showCreateTicketModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <h3 class="text-lg font-black text-slate-900 dark:text-white">Buat Tiket Baru</h3>
            <button @click="showCreateTicketModal = false" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <form @submit.prevent="submitTicket" class="p-6 space-y-4">
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Subjek *</label>
              <input v-model="newTicket.subject" required class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Deskripsi singkat masalah" />
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Deskripsi *</label>
              <textarea v-model="newTicket.description" required rows="4" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Deskripsi detail..."></textarea>
            </div>
            <div>
              <label class="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Prioritas</label>
              <div class="relative">
                <select v-model="newTicket.priority" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <span class="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>
            <div class="flex gap-3 pt-4">
              <button type="button" @click="showCreateTicketModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
              <button type="submit" :disabled="submittingTicket" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all">
                {{ submittingTicket ? 'Membuat...' : 'Buat Tiket' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- ==================== ASSIGN AGENT MODAL ==================== -->
    <Teleport to="body">
      <div v-if="showAssignModal && selectedTicket" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showAssignModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <h3 class="text-lg font-black text-slate-900 dark:text-white">Tugaskan Agent</h3>
            <button @click="showAssignModal = false" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <p class="text-sm text-slate-500 font-medium">Tugaskan agent untuk tiket #{{ selectedTicket.id?.substring(0, 8) }}</p>
            <div class="relative">
              <select v-model="assigneeId" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white appearance-none cursor-pointer">
                <option value="">Pilih Agent</option>
                <option v-for="agent in agents" :key="agent.id" :value="agent.id">{{ agent.name }}</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <span class="material-symbols-outlined">expand_more</span>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="showAssignModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
              <button @click="confirmAssign" :disabled="!assigneeId || assigning" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all">
                {{ assigning ? 'Menugaskan...' : 'Tugaskan' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ==================== ADD NOTE MODAL ==================== -->
    <Teleport to="body">
      <div v-if="showNoteModal && selectedTicket" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showNoteModal = false">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700">
          <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            <h3 class="text-lg font-black text-slate-900 dark:text-white">Tambah Catatan</h3>
            <button @click="showNoteModal = false" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <textarea v-model="noteContent" rows="4" class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Tambahkan catatan..."></textarea>
            <div class="flex gap-3">
              <button @click="showNoteModal = false" class="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Batal</button>
              <button @click="confirmAddNote" :disabled="!noteContent || addingNote" class="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/30 transition-all">
                {{ addingNote ? 'Menambahkan...' : 'Tambah Catatan' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const activeTab = ref('contact');

// ==================== CONTACT MESSAGES STATE ====================
const loading = ref(false);
const messages = ref<any[]>([]);
const selectedMessages = ref<string[]>([]);
const selectedMessage = ref<any>(null);
const showDetailModal = ref(false);
const searchQuery = ref('');
const filterRead = ref('');
const contactPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

// ==================== SUPPORT TICKETS STATE ====================
const ticketLoading = ref(false);
const submittingTicket = ref(false);
const assigning = ref(false);
const addingNote = ref(false);
const ticketSearchQuery = ref('');
const ticketStatusFilter = ref('');
const ticketPriorityFilter = ref('');
const tickets = ref<any[]>([]);
const agents = ref<any[]>([]);
const selectedTicket = ref<any>(null);
const assigneeId = ref('');
const noteContent = ref('');
const showTicketDetailModal = ref(false);
const showCreateTicketModal = ref(false);
const showAssignModal = ref(false);
const showNoteModal = ref(false);
const newTicket = ref({ subject: '', description: '', priority: 'medium' });
const ticketPagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
});

let ticketSearchTimeout: any = null;

const highPriorityCount = computed(() => tickets.value.filter(t => t.priority === 'high' && t.status !== 'resolved' && t.status !== 'closed').length);
const openTicketCount = computed(() => tickets.value.filter(t => t.status === 'open' || t.status === 'in_progress').length);

// ==================== CONTACT MESSAGES METHODS ====================
const loadMessages = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: contactPagination.value.page,
      limit: contactPagination.value.limit,
    };
    if (searchQuery.value) params.search = searchQuery.value;
    if (filterRead.value !== '') params.isRead = filterRead.value;

    const response = await api.get('/contact', { params });
    if (response.data && response.data.data) {
      messages.value = response.data.data;
      contactPagination.value = response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };
      previousUnreadCount.value = messages.value.filter((m: any) => !m.isRead).length;
    } else {
      messages.value = [];
      contactPagination.value = { page: 1, limit: 20, total: 0, totalPages: 0 };
      previousUnreadCount.value = 0;
    }
  } catch (error: any) {
    console.error('Error loading messages:', error);
    await showError('Gagal memuat pesan kontak');
  } finally {
    loading.value = false;
  }
};

const toggleSelectAll = () => {
  if (selectedMessages.value.length === messages.value.length) {
    selectedMessages.value = [];
  } else {
    selectedMessages.value = messages.value.map(m => m.id);
  }
};

const viewMessage = (message: any) => {
  selectedMessage.value = message;
  showDetailModal.value = true;
  if (!message.isRead) toggleReadStatus(message);
};

const toggleReadStatus = async (message: any) => {
  try {
    await api.put(`/contact/${message.id}/read`, {
      isRead: !message.isRead,
    });
    message.isRead = !message.isRead;
    message.readAt = message.isRead ? new Date() : null;
    await showSuccess(message.isRead ? 'Pesan ditandai sudah dibaca' : 'Pesan ditandai belum dibaca');
  } catch (error: any) {
    console.error('Error updating read status:', error);
    await showError('Gagal memperbarui status pesan');
  }
};

const deleteMessage = async (message: any) => {
  const confirmed = await showConfirm(
    'Hapus Pesan?',
    'Apakah Anda yakin ingin menghapus pesan ini secara permanen?',
    'Hapus',
    'Batal'
  );
  
  if (!confirmed) return;

  try {
    await api.delete(`/contact/${message.id}`);
    await showSuccess('Pesan berhasil dihapus');
    if (showDetailModal.value && selectedMessage.value?.id === message.id) {
      showDetailModal.value = false;
    }
    await loadMessages();
  } catch (error: any) {
    console.error('Error deleting message:', error);
    await showError('Gagal menghapus pesan');
  }
};

const bulkMarkAsRead = async () => {
  if (selectedMessages.value.length === 0) return;
  try {
    await api.post('/contact/bulk', { action: 'mark-read', ids: selectedMessages.value });
    await showSuccess(`${selectedMessages.value.length} pesan ditandai sudah dibaca`);
    selectedMessages.value = [];
    await loadMessages();
  } catch {
    await showError('Gagal menandai pesan');
  }
};

const bulkMarkAsUnread = async () => {
  if (selectedMessages.value.length === 0) return;
  try {
    await api.post('/contact/bulk', { action: 'mark-unread', ids: selectedMessages.value });
    await showSuccess(`${selectedMessages.value.length} pesan ditandai belum dibaca`);
    selectedMessages.value = [];
    await loadMessages();
  } catch {
    await showError('Gagal menandai pesan');
  }
};

const bulkDelete = async () => {
  if (selectedMessages.value.length === 0) return;
  const confirmed = await showConfirm(`Hapus ${selectedMessages.value.length} pesan?`, 'Konfirmasi Hapus Massal', 'Hapus', 'Batal');
  if (!confirmed) return;

  try {
    await api.post('/contact/bulk', { action: 'delete', ids: selectedMessages.value });
    await showSuccess(`${selectedMessages.value.length} pesan berhasil dihapus`);
    selectedMessages.value = [];
    await loadMessages();
  } catch {
    await showError('Gagal menghapus pesan');
  }
};

const changeContactPage = (page: number) => {
  contactPagination.value.page = page;
  loadMessages();
};

// ==================== SUPPORT TICKETS METHODS ====================
const loadTickets = async () => {
  ticketLoading.value = true;
  try {
    const params: any = { page: ticketPagination.value.page, limit: ticketPagination.value.limit };
    if (ticketSearchQuery.value) params.search = ticketSearchQuery.value;
    if (ticketStatusFilter.value) params.status = ticketStatusFilter.value;
    if (ticketPriorityFilter.value) params.priority = ticketPriorityFilter.value;

    const response = await api.get('/support/tickets', { params });
    const data = response.data;
    tickets.value = data.data || [];
    ticketPagination.value = {
      page: data.page || 1,
      limit: data.limit || 20,
      total: data.total || 0,
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error('Error loading tickets:', error);
  } finally {
    ticketLoading.value = false;
  }
};

const loadAgents = async () => {
  try {
    const response = await api.get('/users', { params: { role: 'support' } });
    agents.value = response.data.data || response.data || [];
  } catch {
    agents.value = [
      { id: '1', name: 'Support Agent 1' },
      { id: '2', name: 'Support Agent 2' },
    ];
  }
};

const debouncedTicketSearch = () => {
  if (ticketSearchTimeout) clearTimeout(ticketSearchTimeout);
  ticketSearchTimeout = setTimeout(() => {
    ticketPagination.value.page = 1;
    loadTickets();
  }, 500);
};

const changeTicketPage = (page: number) => {
  ticketPagination.value.page = page;
  loadTickets();
};

const viewTicket = (ticket: any) => {
  selectedTicket.value = ticket;
  showTicketDetailModal.value = true;
};

const assignTicket = (ticket: any) => {
  selectedTicket.value = ticket;
  assigneeId.value = ticket.assignedTo?.id || '';
  showAssignModal.value = true;
};

const addNote = (ticket: any) => {
  selectedTicket.value = ticket;
  noteContent.value = '';
  showNoteModal.value = true;
};

const submitTicket = async () => {
  submittingTicket.value = true;
  try {
    await api.post('/support/tickets', newTicket.value);
    showSuccess('Tiket berhasil dibuat!');
    showCreateTicketModal.value = false;
    newTicket.value = { subject: '', description: '', priority: 'medium' };
    loadTickets();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal membuat tiket');
  } finally {
    submittingTicket.value = false;
  }
};

const confirmAssign = async () => {
  if (!assigneeId.value || !selectedTicket.value) return;
  assigning.value = true;
  try {
    await api.put(`/support/tickets/${selectedTicket.value.id}/assign`, { agentId: assigneeId.value });
    showSuccess('Agent berhasil ditugaskan!');
    showAssignModal.value = false;
    loadTickets();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menugaskan agent');
  } finally {
    assigning.value = false;
  }
};

const confirmAddNote = async () => {
  if (!noteContent.value || !selectedTicket.value) return;
  addingNote.value = true;
  try {
    await api.post(`/support/tickets/${selectedTicket.value.id}/notes`, { content: noteContent.value });
    showSuccess('Catatan berhasil ditambahkan!');
    showNoteModal.value = false;
    loadTickets();
  } catch (error: any) {
    showError(error.response?.data?.message || 'Gagal menambah catatan');
  } finally {
    addingNote.value = false;
  }
};

// ==================== TICKET HELPER METHODS ====================
const getTicketPriorityClass = (priority: string) => {
  const classes: Record<string, string> = {
    high: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  return classes[priority?.toLowerCase()] || classes.medium;
};

const getTicketPriorityIcon = (priority: string) => {
  const icons: Record<string, string> = { high: 'priority_high', medium: 'remove', low: 'keyboard_arrow_down' };
  return icons[priority?.toLowerCase()] || 'remove';
};

const getTicketStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    open: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    resolved: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    closed: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  };
  return classes[status] || classes.open;
};

const getTicketStatusDotClass = (status: string) => {
  const classes: Record<string, string> = {
    open: 'bg-blue-500',
    in_progress: 'bg-amber-500 animate-pulse',
    resolved: 'bg-green-500',
    closed: 'bg-slate-400',
  };
  return classes[status] || 'bg-blue-500';
};

const getTicketStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };
  return labels[status] || status;
};

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari lalu`;
};

// ==================== SHARED METHODS ====================
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

let refreshInterval: any = null;
const previousUnreadCount = ref(0);

const checkForNewMessages = async () => {
  try {
    const response = await api.get('/contact', {
      params: { page: 1, limit: 1, isRead: 'false' },
    });
    
    const currentUnreadCount = response.data?.pagination?.total || 0;
    
    if (currentUnreadCount > previousUnreadCount.value) {
      await loadMessages();
      if (currentUnreadCount > previousUnreadCount.value && previousUnreadCount.value > 0) {
        await showSuccess(`Ada ${currentUnreadCount - previousUnreadCount.value} pesan baru!`);
      }
    }
    previousUnreadCount.value = currentUnreadCount;
  } catch {
    // Silent fail
  }
};

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    checkForNewMessages();
  }, 10000);
};

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

onMounted(async () => {
  await loadMessages();
  loadAgents();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>
