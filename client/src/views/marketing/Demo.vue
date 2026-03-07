<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-display">
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-6xl mx-auto">
        <!-- Hero Section -->
        <div class="text-center mb-12">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-2 text-slate-900 dark:text-white">
            Request Demo Sistem Kasir <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Warungin</span>
          </h1>
          <p class="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-2 px-4">
            Lihat langsung bagaimana Warungin dapat membantu mengembangkan bisnis UMKM Anda
          </p>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-sm font-bold mt-4">
             <span class="material-symbols-outlined text-[18px]">timer</span>
             Gratis 30 Menit • Tanpa Komitmen
          </div>
        </div>

        <!-- Demo Form -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Form -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition p-8 border border-slate-200 dark:border-slate-700">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-blue-600 text-2xl">edit_document</span>
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Formulir Request Demo</h2>
            </div>
            
            <form @submit.prevent="handleSubmit" class="space-y-5">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama Lengkap</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900 dark:text-white"
                  placeholder="Nama Lengkap Anda"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Bisnis</label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900 dark:text-white"
                  placeholder="email@bisnis.com"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nama Bisnis / Usaha</label>
                <input
                  v-model="form.businessName"
                  type="text"
                  required
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900 dark:text-white"
                  placeholder="Contoh: Kopi Kenangan Mantan"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nomor WhatsApp</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900 dark:text-white"
                  placeholder="0812-3456-7890"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Jadwal Demo (Opsional)</label>
                <input
                  v-model="form.dateTime"
                  type="datetime-local"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Pesan / Fokus Demo</label>
                <textarea
                  v-model="form.message"
                  rows="3"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900 dark:text-white"
                  placeholder="Fitur apa yang ingin Anda lihat spesifik?"
                ></textarea>
              </div>
              
              <button
                type="submit"
                :disabled="loading"
                class="w-full px-6 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-500 transition disabled:opacity-50 font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <span v-if="loading" class="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                {{ loading ? 'Mengirim...' : 'Request Demo Gratis' }}
              </button>
            </form>
          </div>

          <!-- Info Section -->
          <div class="space-y-6">
            <div class="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                  <span class="material-symbols-outlined text-blue-600 text-2xl">featured_play_list</span>
                </div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white">Apa yang Anda dapatkan?</h2>
              </div>
              <ul class="space-y-4">
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-blue-600 mt-0.5">check_circle</span>
                  <span class="text-slate-600 dark:text-slate-300">Tour lengkap dashboard & fitur POS</span>
                </li>
                <li class="flex items-start gap-3">
                  <span class="material-symbols-outlined text-blue-600 mt-0.5">check_circle</span>
                  <span class="text-slate-600 dark:text-slate-300">Konsultasi kebutuhan bisnis spesifik Anda</span>
                </li>
                <li class="flex items-start gap-3">
                   <span class="material-symbols-outlined text-blue-600 mt-0.5">check_circle</span>
                  <span class="text-slate-600 dark:text-slate-300">Simulasi manajemen stok & laporan</span>
                </li>
                <li class="flex items-start gap-3">
                   <span class="material-symbols-outlined text-blue-600 mt-0.5">check_circle</span>
                  <span class="text-slate-600 dark:text-slate-300">Tanya jawab langsung dengan tim produk</span>
                </li>
              </ul>
            </div>

            <div class="bg-blue-500 dark:bg-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
               <div class="absolute top-0 right-0 p-4 opacity-10">
                  <span class="material-symbols-outlined text-9xl">rocket_launch</span>
               </div>
              <div class="flex items-center space-x-3 mb-4 relative z-10">
                <span class="material-symbols-outlined text-3xl">rocket_launch</span>
                <h2 class="text-xl font-bold">Kenapa Warungin?</h2>
              </div>
              <p class="text-blue-50 leading-relaxed mb-6 font-medium relative z-10">
                Kami tidak sekadar menjual software, tapi menjadi partner teknologi untuk pertumbuhan bisnis Anda.
              </p>
              
              <div class="grid grid-cols-2 gap-4 relative z-10">
                 <div class="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <p class="text-xs text-blue-200 uppercase font-bold">Durasi</p>
                    <p class="font-bold text-lg">30-45 Mins</p>
                 </div>
                 <div class="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                    <p class="text-xs text-blue-200 uppercase font-bold">Biaya</p>
                    <p class="font-bold text-lg">Gratis</p>
                 </div>
              </div>
            </div>

            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Butuh Bantuan Cepat?</h2>
              <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">
                Hubungi kami langsung jika ada pertanyaan mendesak.
              </p>
              <div class="space-y-3">
                <a href="mailto:support@warungin.com" class="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg">
                  <span class="material-symbols-outlined text-slate-400">mail</span>
                  <span class="font-medium">support@warungin.com</span>
                </a>
                <a href="tel:+6281234567890" class="flex items-center space-x-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg">
                  <span class="material-symbols-outlined text-slate-400">call</span>
                  <span class="font-medium">+62 812-3456-7890</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { useSEO } from '../../composables/useSEO';

useSEO({
  title: 'Request Demo Warungin',
  description: 'Lihat langsung demo sistem kasir Warungin secara gratis.',
});

const { success: showSuccess, error: showError } = useNotification();

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const form = ref({
  name: '',
  email: '',
  businessName: '',
  phone: '',
  dateTime: '',
  message: '',
});

const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  try {
    await api.post('/contact/demo', form.value);
    await showSuccess('Permintaan demo terkirim! Tim kami akan menghubungi Anda.');
    form.value = { name: '', email: '', businessName: '', phone: '', dateTime: '', message: '' };
  } catch (error: any) {
    console.error('Error submitting demo request:', error);
    await showError(error.response?.data?.message || 'Gagal mengirim permintaan demo.');
  } finally {
    loading.value = false;
  }
};
</script>
