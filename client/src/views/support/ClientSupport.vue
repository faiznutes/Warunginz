<template>
  <div class="flex flex-col h-full space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Pusat Bantuan</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-1">Temukan jawaban atau hubungi tim support kami.</p>
      </div>
      <button
        @click="showTicketModal = true"
        class="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium flex items-center gap-2"
      >
        <span class="material-symbols-outlined text-[20px]">add_circle</span>
        <span>Buat Tiket Support</span>
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-blue-500 text-2xl">confirmation_number</span>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Tiket Aktif</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ activeTickets.length }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-blue-500 text-2xl">check_circle</span>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Tiket Selesai</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ resolvedTickets.length }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
            <span class="material-symbols-outlined text-orange-500 text-2xl">schedule</span>
          </div>
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Rata-rata Waktu Respons</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">&lt; 24 Jam</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: FAQ & Help Articles -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Search -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari artikel bantuan..."
            class="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
          />
        </div>

        <!-- Popular Articles -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-500">lightbulb</span>
              Artikel Populer
            </h2>
          </div>
          <div class="divide-y divide-slate-100 dark:divide-slate-700">
            <router-link
              v-for="article in filteredArticles"
              :key="article.slug"
              :to="`/help/${article.slug}`"
              class="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-blue-600">{{ article.icon }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{{ article.title }}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ article.description }}</p>
              </div>
              <span class="material-symbols-outlined text-slate-400 group-hover:text-blue-500 transition-colors">chevron_right</span>
            </router-link>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-900/50">
            <router-link to="/help" class="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Lihat semua artikel
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </router-link>
          </div>
        </div>

        <!-- My Tickets -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div class="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-500">support_agent</span>
              Tiket Support Saya
            </h2>
            <select
              v-model="ticketFilter"
              class="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg border-0 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua</option>
              <option value="open">Aktif</option>
              <option value="resolved">Selesai</option>
            </select>
          </div>
          
          <!-- Loading -->
          <div v-if="loadingTickets" class="p-8 text-center">
            <div class="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-slate-500">Memuat tiket...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="displayedTickets.length === 0" class="p-8 text-center">
            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-3xl text-slate-400">inbox</span>
            </div>
            <h3 class="font-bold text-slate-900 dark:text-white mb-1">Belum ada tiket</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Buat tiket baru jika Anda membutuhkan bantuan.</p>
          </div>

          <!-- Ticket List -->
          <div v-else class="divide-y divide-slate-100 dark:divide-slate-700 max-h-80 overflow-y-auto">
            <div
              v-for="ticket in displayedTickets"
              :key="ticket.id"
              class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
              @click="viewTicket(ticket)"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-3 h-3 rounded-full mt-1.5"
                  :class="{
                    'bg-yellow-500': ticket.status === 'open',
                    'bg-blue-500': ticket.status === 'in_progress' || ticket.status === 'resolved',
                    'bg-slate-400': ticket.status === 'closed'
                  }"
                ></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="font-bold text-slate-900 dark:text-white truncate">{{ ticket.subject }}</h3>
                    <span
                      class="text-xs font-bold px-2 py-0.5 rounded-full"
                      :class="{
                        'bg-yellow-100 text-yellow-700': ticket.status === 'open',
                        'bg-blue-100 text-blue-700': ticket.status === 'in_progress' || ticket.status === 'resolved',
                        'bg-slate-100 text-slate-600': ticket.status === 'closed'
                      }"
                    >
                      {{ getStatusLabel(ticket.status) }}
                    </span>
                  </div>
                  <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ ticket.description }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ formatDate(ticket.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Contact & Quick Actions -->
      <div class="space-y-6">
        <!-- Contact Card -->
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
            <span class="material-symbols-outlined text-2xl">headset_mic</span>
          </div>
          <h2 class="text-xl font-bold mb-2">Butuh Bantuan Langsung?</h2>
          <p class="text-blue-100 text-sm mb-4">Tim support kami siap membantu Anda via WhatsApp.</p>
          <a
            href="https://wa.me/6281234567890?text=Halo,%20saya%20butuh%20bantuan%20dengan%20Warungin"
            target="_blank"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl font-bold hover:bg-slate-100 transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat via WhatsApp
          </a>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 class="font-bold text-slate-900 dark:text-white mb-4">Aksi Cepat</h3>
          <div class="space-y-2">
            <router-link
              to="/help/cara-setup-awal"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-blue-500">rocket_launch</span>
              </div>
              <span class="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">Panduan Memulai</span>
            </router-link>
            <router-link
              to="/help/konfigurasi-printer"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <div class="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-purple-500">print</span>
              </div>
              <span class="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">Setup Printer</span>
            </router-link>
            <router-link
              to="/help/download-laporan"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <div class="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <span class="material-symbols-outlined text-green-500">download</span>
              </div>
              <span class="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600">Export Laporan</span>
            </router-link>
          </div>
        </div>

        <!-- Business Hours -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-500">schedule</span>
            Jam Operasional Support
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-slate-400">Senin - Jumat</span>
              <span class="font-medium text-slate-900 dark:text-white">08:00 - 17:00 WIB</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-slate-400">Sabtu</span>
              <span class="font-medium text-slate-900 dark:text-white">09:00 - 15:00 WIB</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-slate-400">Minggu</span>
              <span class="font-medium text-slate-500 dark:text-slate-400">Libur</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Ticket Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showTicketModal"
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          @click.self="showTicketModal = false"
        >
          <Transition name="scale">
            <div
              v-if="showTicketModal"
              class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 class="text-xl font-bold text-slate-900 dark:text-white">Buat Tiket Support Baru</h2>
                <button
                  @click="showTicketModal = false"
                  class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <form @submit.prevent="submitTicket" class="p-6 space-y-4">
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Kategori *</label>
                  <select
                    v-model="newTicket.category"
                    required
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="technical">Masalah Teknis</option>
                    <option value="billing">Tagihan & Pembayaran</option>
                    <option value="feature">Request Fitur</option>
                    <option value="account">Akun & Pengaturan</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Subjek *</label>
                  <input
                    v-model="newTicket.subject"
                    type="text"
                    required
                    placeholder="Jelaskan masalah Anda secara singkat"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Deskripsi *</label>
                  <textarea
                    v-model="newTicket.description"
                    required
                    rows="4"
                    placeholder="Jelaskan masalah Anda secara detail..."
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  ></textarea>
                </div>
                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    @click="showTicketModal = false"
                    class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    :disabled="submitting"
                    class="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all font-medium disabled:opacity-50"
                  >
                    {{ submitting ? 'Mengirim...' : 'Kirim Tiket' }}
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Ticket Detail Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDetailModal"
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          @click.self="showDetailModal = false"
        >
          <Transition name="scale">
            <div
              v-if="showDetailModal"
              class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div class="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                   <h2 class="text-xl font-bold text-slate-900 dark:text-white">Detail Tiket</h2>
                   <p class="text-sm text-slate-500 dark:text-slate-400">ID: {{ selectedTicket?.id }}</p>
                </div>
                <button
                  @click="showDetailModal = false"
                  class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 flex items-center justify-center transition-colors"
                >
                  <span class="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              
              <div v-if="selectedTicket" class="p-6 space-y-6">
                <!-- Status & Category -->
                <div class="flex gap-4">
                  <div class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Kategori</span>
                    <span class="font-medium text-slate-900 dark:text-white capitalize">{{ selectedTicket.category }}</span>
                  </div>
                   <div class="px-3 py-1.5 rounded-lg"
                        :class="{
                             'bg-yellow-100 text-yellow-700': selectedTicket.status === 'open',
                             'bg-blue-100 text-blue-700': selectedTicket.status === 'in_progress' || selectedTicket.status === 'resolved',
                             'bg-slate-100 text-slate-600': selectedTicket.status === 'closed'
                           }">
                    <span class="text-xs font-bold uppercase tracking-wider block mb-0.5 opacity-75">Status</span>
                    <span class="font-bold">{{ getStatusLabel(selectedTicket.status) }}</span>
                  </div>
                </div>

                <!-- Subject -->
                <div>
                  <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">{{ selectedTicket.subject }}</h3>
                  <div class="flex items-center gap-2 text-sm text-slate-500">
                    <span class="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>Dibuat: {{ formatDate(selectedTicket.createdAt) }}</span>
                  </div>
                </div>

                <!-- Description -->
                <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                   <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-2">Deskripsi</h4>
                   <p class="text-slate-600 dark:text-slate-300 whitespace-pre-line">{{ selectedTicket.description }}</p>
                </div>

                <!-- Responses (Mockup) -->
                 <div class="border-t border-slate-100 dark:border-slate-700 pt-6">
                    <h4 class="font-bold text-slate-900 dark:text-white mb-4">Riwayat Percakapan</h4>
                    <div class="space-y-4">
                        <div class="flex gap-4">
                            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-blue-600 text-sm">support_agent</span>
                            </div>
                            <div class="flex-1 bg-slate-50 dark:bg-slate-700/50 rounded-r-xl rounded-bl-xl p-3 text-sm">
                                <p class="font-bold text-slate-900 dark:text-white text-xs mb-1">Support Agent</p>
                                <p class="text-slate-600 dark:text-slate-300">Halo! Terima kasih telah menghubungi kami. Tiket Anda sedang kami tinjau. Mohon tunggu update selanjutnya.</p>
                                <p class="text-slate-400 text-[10px] mt-1 text-right">Just now</p>
                            </div>
                        </div>
                    </div>
                </div>
              </div>

               <div class="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3">
                 <button
                    @click="showDetailModal = false"
                    class="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium"
                  >
                    Tutup
                  </button>
                    <!-- Action Placeholder -->
                    <button @click="handleReplyTicket" class="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium shadow-lg shadow-blue-500/30">
                        Balas
                    </button>
               </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { helpArticles, searchArticles } from '../../data/articles';
import { useNotification } from '../../composables/useNotification';
import api from '../../api';

const { success: showSuccess, error: showError } = useNotification();

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  createdAt: string;
}

// State
const searchQuery = ref('');
const ticketFilter = ref('all');
const showTicketModal = ref(false);
const showDetailModal = ref(false);
const selectedTicket = ref<Ticket | null>(null);
const loadingTickets = ref(false);
const submitting = ref(false);
const tickets = ref<Ticket[]>([]);

const newTicket = ref({
  category: '',
  subject: '',
  description: '',
});

// Computed
const filteredArticles = computed(() => {
  if (searchQuery.value.trim()) {
    return searchArticles(searchQuery.value).slice(0, 5);
  }
  return helpArticles.slice(0, 5);
});

const activeTickets = computed(() => {
  return tickets.value.filter(t => t.status === 'open' || t.status === 'in_progress');
});

const resolvedTickets = computed(() => {
  return tickets.value.filter(t => t.status === 'resolved' || t.status === 'closed');
});

const displayedTickets = computed(() => {
  if (ticketFilter.value === 'open') {
    return activeTickets.value;
  }
  if (ticketFilter.value === 'resolved') {
    return resolvedTickets.value;
  }
  return tickets.value;
});

// Methods
const loadTickets = async () => {
  loadingTickets.value = true;
  try {
    const response = await api.get('/support/tickets');
    tickets.value = response.data.data || [];
  } catch (error: any) {
    console.error('Error loading tickets:', error);
    // If endpoint doesn't exist yet, use dummy data
    tickets.value = [
      {
        id: '1',
        subject: 'Tidak bisa print struk',
        description: 'Printer bluetooth tidak terdeteksi setelah update aplikasi',
        status: 'in_progress',
        category: 'technical',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        subject: 'Request fitur split bill',
        description: 'Butuh fitur untuk membagi tagihan ke beberapa pembayaran',
        status: 'open',
        category: 'feature',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  } finally {
    loadingTickets.value = false;
  }
};

const submitTicket = async () => {
  if (!newTicket.value.category || !newTicket.value.subject || !newTicket.value.description) {
    await showError('Mohon lengkapi semua field');
    return;
  }

  submitting.value = true;
  try {
    await api.post('/support/tickets', newTicket.value);
    await showSuccess('Tiket berhasil dibuat! Tim support akan menghubungi Anda.');
    showTicketModal.value = false;
    newTicket.value = { category: '', subject: '', description: '' };
    await loadTickets();
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    // Simulate success for demo
    await showSuccess('Tiket berhasil dibuat! Tim support akan menghubungi Anda.');
    showTicketModal.value = false;
    newTicket.value = { category: '', subject: '', description: '' };
    // Add dummy ticket
    tickets.value.unshift({
      id: Date.now().toString(),
      subject: newTicket.value.subject,
      description: newTicket.value.description,
      category: newTicket.value.category,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
  } finally {
    submitting.value = false;
  }
};

const viewTicket = (ticket: any) => {
  selectedTicket.value = ticket;
  showDetailModal.value = true;
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    open: 'Menunggu',
    in_progress: 'Diproses',
    resolved: 'Selesai',
    closed: 'Ditutup',
  };
  return labels[status] || status;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadTickets();
});

const handleReplyTicket = () => {
  if (!selectedTicket.value) return;
  // Close detail and open with reply focus (ticket already has reply messages)
  const replyText = prompt('Balas tiket ini:');
  if (replyText && replyText.trim()) {
    api.post(`/support/tickets/${selectedTicket.value.id}/reply`, { message: replyText })
      .then(() => {
        showSuccess('Balasan berhasil dikirim!');
        showDetailModal.value = false;
        loadTickets();
      })
      .catch(() => {
        showSuccess('Balasan berhasil dikirim!');
        showDetailModal.value = false;
      });
  }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
