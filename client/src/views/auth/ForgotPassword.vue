<template>
  <div class="relative min-h-screen w-full flex flex-col overflow-hidden bg-white dark:bg-slate-900 font-display text-slate-900 dark:text-white antialiased selection:bg-blue-500/20 selection:text-blue-600">
    
    <!-- Background Gradient Decoration -->
    <div class="absolute inset-0 pointer-events-none z-0">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent"></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 lg:px-10 py-4">
      <router-link to="/" class="flex items-center gap-3">
        <div class="size-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
          <span class="material-symbols-outlined text-2xl">storefront</span>
        </div>
        <h2 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Warungin</h2>
      </router-link>
      <router-link to="/login" class="flex items-center justify-center overflow-hidden rounded-lg h-9 px-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
        <span class="truncate">Masuk</span>
      </router-link>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-grow flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-lg flex flex-col items-center">
        <!-- Success Card -->
        <div class="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 p-8 md:p-10 text-center animate-fade-in-up">
          
          <!-- Icon Animation Wrapper -->
          <div class="mx-auto w-20 h-20 mb-6 relative animate-float">
            <div class="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-20"></div>
            <div class="relative w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/20 dark:to-blue-500/10 rounded-full flex items-center justify-center shadow-glow">
              <span class="material-symbols-outlined text-4xl text-blue-600" style="font-variation-settings: 'FILL' 1, 'wght' 600;">lock_reset</span>
            </div>
          </div>

          <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Lupa Kata Sandi?
          </h1>
          
          <p class="text-slate-500 dark:text-slate-400 text-base leading-relaxed mb-8">
            Demi keamanan data bisnis Anda, pengaturan ulang kata sandi dilakukan secara manual melalui tim bantuan kami. Silakan hubungi kami untuk verifikasi identitas.
          </p>

          <div class="flex flex-col gap-3">
             <router-link to="/contact" class="flex items-center justify-center gap-2 w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                <span class="material-symbols-outlined text-[20px]">support_agent</span>
                Hubungi Bantuan
             </router-link>
             
             <router-link to="/login" class="flex items-center justify-center gap-2 w-full py-3.5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors">
                Kembali ke Halaman Masuk
             </router-link>
          </div>

          <!-- Trust Indicator -->
          <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            <span class="material-symbols-outlined text-[16px] text-blue-500">verified_user</span>
            <span>Proses aman & terenkripsi</span>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="w-full py-6 text-center relative z-10">
        <p class="text-sm font-normal text-slate-500 dark:text-slate-400">
            © 2024 Warungin. Hak Cipta Dilindungi.
        </p>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { useSEO } from '../../composables/useSEO';

useSEO({
  title: 'Lupa Password - Warungin',
  description: 'Panduan reset password akun Warungin.',
});
</script>

<style scoped>
/* Custom animations */
@keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
}
.animate-float {
    animation: float 6s ease-in-out infinite;
}

@keyframes fade-in-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out forwards;
}

.shadow-glow {
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
}
</style>
