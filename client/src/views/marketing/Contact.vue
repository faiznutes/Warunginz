<template>
  <div class="w-full bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e] flex justify-center py-12 px-4 md:px-8">
    <div class="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
      
      <!-- Left Column: Context & Direct Support -->
      <div class="lg:col-span-5 flex flex-col gap-8 pt-4">
        <!-- Text Content -->
        <div class="space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <span class="material-symbols-outlined text-base">support_agent</span>
            Bantuan Masuk
          </div>
          <h1 class="text-[#0d131b] dark:text-white tracking-tight text-4xl lg:text-[40px] font-bold leading-[1.1]">
            Kami di Sini untuk <span class="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Membantu</span>
          </h1>
          <p class="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Sepertinya Anda mengalami masalah saat masuk. Silakan hubungi kami untuk mereset kata sandi Anda secara manual atau gunakan kontak di bawah.
          </p>
        </div>

        <!-- Direct Support Cards -->
        <div class="flex flex-col gap-4 mt-2">
          <p class="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Kontak Langsung</p>
          
          <!-- WhatsApp -->
          <a class="group bg-white dark:bg-slate-800/80 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 hover:shadow-md transition-all flex items-center gap-4" href="#">
            <div class="size-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined">chat</span>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-[#0d131b] dark:text-white">WhatsApp Support</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">Respon cepat (5-10 menit)</p>
            </div>
            <span class="material-symbols-outlined text-slate-400 group-hover:text-blue-600">arrow_forward</span>
          </a>

          <!-- Phone -->
          <a class="group bg-white dark:bg-slate-800/80 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all flex items-center gap-4" href="#">
            <div class="size-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <span class="material-symbols-outlined">call</span>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-[#0d131b] dark:text-white">Call Center</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">08:00 - 20:00 WIB</p>
            </div>
            <span class="material-symbols-outlined text-slate-400 group-hover:text-blue-600">arrow_forward</span>
          </a>
        </div>

        <!-- Abstract Visual -->
        <div class="hidden lg:block mt-auto relative rounded-2xl overflow-hidden h-48 bg-gradient-to-br from-primary/10 to-blue-600/5 border border-blue-500/10">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-primary/5"></div>
          <div class="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-white/90 via-transparent dark:from-slate-900/90">
            <div class="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              <span class="material-symbols-outlined text-blue-600 text-[20px] filled">verified_user</span>
              Data Anda aman bersama kami.
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Form -->
      <div class="lg:col-span-7">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-200 dark:border-slate-700 p-6 md:p-8 lg:p-10">
          <div class="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div class="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600">
              <span class="material-symbols-outlined">mail</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-[#0d131b] dark:text-white">Formulir Bantuan</h2>
              <p class="text-sm text-slate-500 dark:text-slate-400">Isi detail akun Anda untuk verifikasi manual</p>
            </div>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Full Name -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-[#0d131b] dark:text-slate-200">Nama Lengkap</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">person</span>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all font-display"
                  placeholder="Masukkan nama lengkap sesuai KTP"
                />
              </div>
            </div>

            <!-- Contact Info -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-[#0d131b] dark:text-slate-200">Email / Nomor HP Terdaftar</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">contact_mail</span>
                <input
                  v-model="form.email"
                  type="text"
                  required
                  class="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all font-display"
                  placeholder="contoh@email.com atau 0812..."
                />
              </div>
            </div>

            <!-- Outlet ID (Optional) -->
            <div class="space-y-2">
              <div class="flex justify-between">
                <label class="block text-sm font-semibold text-[#0d131b] dark:text-slate-200">Outlet ID</label>
                <span class="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">Opsional</span>
              </div>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">store</span>
                <input
                  v-model="form.outletId"
                  type="text"
                  class="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all font-display"
                  placeholder="Contoh: WRG-00123"
                />
              </div>
            </div>

            <!-- Message -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-[#0d131b] dark:text-slate-200">Detail Masalah</label>
              <textarea
                v-model="form.message"
                required
                class="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder:text-slate-400 resize-none transition-all font-display"
                placeholder="Jelaskan kendala yang Anda alami..."
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="pt-2 flex flex-col gap-4">
              <button
                type="submit"
                :disabled="loading"
                class="w-full h-12 bg-blue-500 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span v-else class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[20px]">send</span>
                    Kirim Permintaan
                </span>
              </button>
              <p class="text-center text-xs text-slate-500 dark:text-slate-400">
                Dengan mengirimkan formulir ini, Anda setuju dengan <a class="text-blue-600 hover:underline" href="#">Kebijakan Privasi</a> kami.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';
import { useSEO } from '../../composables/useSEO';

const router = useRouter();

useSEO({
  title: 'Hubungi Bantuan - Warungin Support',
  description: 'Punya pertanyaan atau kendala? Hubungi tim support Warungin untuk reset password, kendala login, atau pertanyaan lainnya.',
  keywords: 'kontak warungin, support warungin, help center, lupa password, customer service',
});

const { error: showError } = useNotification();

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const form = ref({
  name: '',
  email: '', // combined field for email/phone
  outletId: '',
  message: '',
});

const loading = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  try {
    // Basic formatting for API
    const isEmail = form.value.email.includes('@');
    const payload = {
        name: form.value.name,
        email: isEmail ? form.value.email : 'contact-form@user.com', // Fallback or handle backend side
        phone: isEmail ? '' : form.value.email,
        subject: 'Bantuan Login / Masalah Teknis (Form V3)',
        message: `${form.value.message}\n\n[User Input Data]\nContact: ${form.value.email}\nOutlet ID: ${form.value.outletId || 'N/A'}`
    };

    await api.post('/contact', payload);
    
    // Redirect to success page as per design flow
    router.push({ name: 'contact-success' });
    
  } catch (error: any) {
    console.error('Error submitting contact form:', error);
    await showError(error.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.');
  } finally {
    loading.value = false;
  }
};
</script>
