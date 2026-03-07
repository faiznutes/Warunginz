<template>
  <div class="min-h-screen flex items-center justify-center font-display bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e]">
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-2xl mx-auto text-center">
        <!-- 404 Icon -->
        <div class="mb-6">
          <div class="w-32 h-32 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
            <span class="material-symbols-outlined text-primary text-[64px]">search_off</span>
          </div>
        </div>

        <h1 class="text-6xl sm:text-8xl font-bold text-primary mb-4 drop-shadow-sm">404</h1>
        <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">Halaman Tidak Ditemukan</h2>
        <p class="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Halaman mungkin telah dipindahkan atau dihapus.
        </p>
        
        <!-- Internal Links Section -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 p-8 mb-8 border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-amber-500">star</span>
            Halaman Populer
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <router-link
              to="/"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 group"
            >
              <div class="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">home</span>
              </div>
              <div>
                <span class="block text-slate-900 dark:text-slate-200 font-semibold text-sm">Beranda</span>
                <span class="block text-slate-500 dark:text-slate-400 text-xs">Kembali ke halaman utama</span>
              </div>
            </router-link>
            
            <router-link
              to="/pricing"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 group"
            >
              <div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-[20px]">payments</span>
              </div>
              <div>
                <span class="block text-slate-900 dark:text-slate-200 font-semibold text-sm">Harga</span>
                <span class="block text-slate-500 dark:text-slate-400 text-xs">Lihat paket langganan</span>
              </div>
            </router-link>
            
            <router-link
              to="/demo"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 group"
            >
              <div class="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[20px]">play_circle</span>
              </div>
              <div>
                <span class="block text-slate-900 dark:text-slate-200 font-semibold text-sm">Demo</span>
                <span class="block text-slate-500 dark:text-slate-400 text-xs">Coba aplikasi gratis</span>
              </div>
            </router-link>
            
            <router-link
              to="/contact"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 group"
            >
              <div class="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-orange-600 dark:text-orange-400 text-[20px]">mail</span>
              </div>
              <div>
                <span class="block text-slate-900 dark:text-slate-200 font-semibold text-sm">Hubungi Kami</span>
                <span class="block text-slate-500 dark:text-slate-400 text-xs">Bantuan dan support</span>
              </div>
            </router-link>
            
            <router-link
              to="/help"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 group"
            >
              <div class="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-[20px]">help</span>
              </div>
              <div>
                <span class="block text-slate-900 dark:text-slate-200 font-semibold text-sm">Pusat Bantuan</span>
                <span class="block text-slate-500 dark:text-slate-400 text-xs">Panduan penggunaan</span>
              </div>
            </router-link>
            
            <router-link
              to="/terms"
              class="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-all duration-200 group"
            >
              <div class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-slate-600 dark:text-slate-400 text-[20px]">description</span>
              </div>
              <div>
                <span class="block text-slate-900 dark:text-slate-200 font-semibold text-sm">Syarat & Ketentuan</span>
                <span class="block text-slate-500 dark:text-slate-400 text-xs">Kebijakan layanan</span>
              </div>
            </router-link>
          </div>
        </div>
        
        <router-link
          to="/"
          class="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all duration-300 font-semibold text-lg shadow-lg shadow-primary/30 transform hover:-translate-y-1"
        >
          <span class="material-symbols-outlined text-[24px]">home</span>
          Kembali ke Beranda
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSEO } from '../composables/useSEO';

useSEO({
  title: '404 - Page Not Found | Warungin',
  description: 'The page you are looking for was not found. Return to home or explore popular Warungin pages.',
  keywords: '404, page not found, error page',
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>
