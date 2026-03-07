<template>
  <div class="min-h-screen font-display bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e]">
    
    <!-- Hero Section -->
    <section class="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
      <!-- Decor -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden">
         <div class="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[100px]"></div>
         <div class="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- Left: Hero Text -->
          <div class="text-center lg:text-left">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider mb-8 shadow-sm">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Solusi UMKM Juara v3.0
            </div>
            
            <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold tracking-tight text-[#0d131b] dark:text-white mb-6 leading-[1.1]">
              Kelola Bisnis <br/>
              <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">Tanpa Batas</span>
            </h1>
            
            <p class="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Satu aplikasi untuk kasir, inventori, laporan keuangan, hingga absensi karyawan. Didesain untuk kemudahan operasional Anda.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
              <router-link
                to="/pricing"
                class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Coba Gratis 14 Hari
                <span class="material-symbols-outlined">arrow_forward</span>
              </router-link>
              <router-link
                to="/demo"
                class="px-8 py-4 bg-white dark:bg-slate-800 text-[#0d131b] dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg hover:border-blue-500 hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <span class="material-symbols-outlined text-blue-600 group-hover:scale-110 transition-transform">play_circle</span>
                Lihat Demo
              </router-link>
            </div>

            <div class="mt-10 flex items-center justify-center lg:justify-start gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
               <div class="flex items-center gap-2">
                 <span class="material-symbols-outlined text-green-500 filled">check_circle</span>
                 Setup Instan
               </div>
               <div class="flex items-center gap-2">
                 <span class="material-symbols-outlined text-green-500 filled">check_circle</span>
                 Cloud Sync
               </div>
               <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-green-500 filled">check_circle</span>
                  Support 24/7
               </div>
            </div>
          </div>

          <!-- Right: Visual -->
          <div class="hidden lg:block relative">
             <div class="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <!-- Mockup Content Simplified -->
                <div class="bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden aspect-[4/3] relative group">
                   <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-blue-900/20"></div>
                   <div class="absolute inset-0 flex items-center justify-center">
                      <div class="text-center p-8">
                         <span class="material-symbols-outlined text-6xl text-blue-500 mb-4 bg-white dark:bg-slate-800/80 p-4 rounded-2xl shadow-lg">storefront</span>
                         <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Pintar</h3>
                         <p class="text-slate-500">Pantau penjualan real-time dari mana saja.</p>
                      </div>
                   </div>
                   
                   <!-- Floating Cards -->
                   <div class="absolute bottom-6 right-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3 animate-bounce shadow-blue-500/10" style="animation-duration: 3s">
                      <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                         <span class="material-symbols-outlined">trending_up</span>
                      </div>
                      <div>
                         <div class="text-xs text-slate-500">Omzet Hari Ini</div>
                         <div class="font-bold text-blue-600">+ Rp 2.5 Juta</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Value Stats -->
    <section class="py-10 border-y border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div class="container mx-auto px-4">
         <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
               <div class="text-3xl font-bold text-[#0d131b] dark:text-white mb-1">10k+</div>
               <div class="text-sm text-slate-500 uppercase tracking-wide">Pengguna Aktif</div>
            </div>
            <div>
               <div class="text-3xl font-bold text-[#0d131b] dark:text-white mb-1">50M+</div>
               <div class="text-sm text-slate-500 uppercase tracking-wide">Transaksi/Bulan</div>
            </div>
            <div>
               <div class="text-3xl font-bold text-[#0d131b] dark:text-white mb-1">99.9%</div>
               <div class="text-sm text-slate-500 uppercase tracking-wide">Uptime Server</div>
            </div>
             <div>
               <div class="text-3xl font-bold text-[#0d131b] dark:text-white mb-1">24/7</div>
               <div class="text-sm text-slate-500 uppercase tracking-wide">Customer Support</div>
            </div>
         </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 relative overflow-hidden">
      <div class="container mx-auto px-4">
        <div class="text-center max-w-3xl mx-auto mb-20">
          <h2 class="text-3xl md:text-4xl font-bold text-[#0d131b] dark:text-white mb-6">Kenapa Memilih Warungin?</h2>
          <p class="text-lg text-slate-600 dark:text-slate-400">
            Kami mengerti kebutuhan bisnis kecil menengah. Fitur lengkap, harga terjangkau, dan mudah digunakan bahkan untuk pemula.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Feature Card 1 -->
          <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-blue-500 transition-all group hover:-translate-y-2 duration-300">
            <div class="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-blue-600 text-4xl">point_of_sale</span>
            </div>
            <h3 class="text-2xl font-bold text-[#0d131b] dark:text-white mb-4">Kasir Modern</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              Transaksi cepat, dukung barcode scanner, printer thermal, dan laci uang. Tampilan intuitif anti lemot.
            </p>
          </div>

          <!-- Feature Card 2 -->
          <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-purple-500 transition-all group hover:-translate-y-2 duration-300">
             <div class="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-purple-600 text-4xl">inventory</span>
            </div>
            <h3 class="text-2xl font-bold text-[#0d131b] dark:text-white mb-4">Stok Akurat</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              Kartu stok otomatis, notifikasi stok menipis, dan manajemen bahan baku (resep) yang presisi.
            </p>
          </div>

          <!-- Feature Card 3 -->
          <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 hover:border-orange-500 transition-all group hover:-translate-y-2 duration-300">
             <div class="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
               <span class="material-symbols-outlined text-orange-600 text-4xl">analytics</span>
            </div>
            <h3 class="text-2xl font-bold text-[#0d131b] dark:text-white mb-4">Laporan Bisnis</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
              Laporan laba rugi, penjualan harian, hingga performa karyawan tersedia real-time dalam satu klik.
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Featured Articles Section -->
    <section class="py-24 bg-white dark:bg-slate-900/50 relative border-t border-slate-100 dark:border-slate-800">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
           <div class="max-w-2xl">
              <span class="text-blue-600 font-bold uppercase tracking-wider text-sm mb-2 block">Pusat Pengetahuan</span>
              <h2 class="text-3xl md:text-4xl font-bold text-[#0d131b] dark:text-white">Tips & Panduan Bisnis</h2>
              <p class="text-slate-600 dark:text-slate-400 mt-4 text-lg">Pelajari cara memaksimalkan fitur Warungin untuk pertumbuhan bisnis Anda.</p>
           </div>
           <router-link to="/help" class="group flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700 transition">
              Lihat Semua Artikel
              <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
           </router-link>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <router-link 
              v-for="article in featuredArticles" 
              :key="article.slug"
              :to="`/help/${article.slug}`"
              class="group bg-[#f8f9fa] dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/50 transition-all duration-300 flex flex-col h-full"
            >
              <div class="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-4 w-14 h-14 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                 <span class="material-symbols-outlined text-2xl text-slate-700 dark:text-slate-200 group-hover:text-blue-600">{{ article.icon }}</span>
              </div>
              <div class="mb-4">
                 <span class="inline-block px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-3">{{ article.category.replace('-', ' ') }}</span>
                 <h3 class="text-xl font-bold text-[#0d131b] dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">{{ article.title }}</h3>
              </div>
              <p class="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
                 {{ article.description }}
              </p>
              <div class="mt-auto border-t border-slate-200 dark:border-slate-700 pt-4 flex items-center text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">
                 Baca Selengkapnya
              </div>
           </router-link>
        </div>
      </div>
    </section>

    <!-- Large CTA -->
    <section class="py-24 container mx-auto px-4">
      <div class="bg-gradient-to-r from-blue-600 to-blue-500 rounded-[2.5rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/30">
        <div class="relative z-10 max-w-3xl mx-auto">
          <h2 class="text-3xl md:text-5xl font-bold mb-8 leading-tight">Siap Kembangkan Bisnis Anda?</h2>
          <p class="text-blue-50 text-xl mb-10 leading-relaxed">
            Bergabunglah dengan ribuan pengusaha sukses yang telah mempercayakan operasional bisnisnya pada Warungin.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
             <router-link
              to="/contact"
              class="px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl hover:bg-slate-50 transition shadow-lg transform hover:-translate-y-1"
            >
              Hubungi Sales
            </router-link>
            <router-link
              to="/pricing"
              class="px-10 py-5 bg-blue-700/50 backdrop-blur-sm border border-blue-400/30 text-white rounded-2xl font-bold text-xl hover:bg-blue-700/70 transition"
            >
              Lihat Harga
            </router-link>
          </div>
        </div>
        
        <!-- Decoration -->
        <div class="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl mix-blend-overlay -translate-y-1/2 translate-x-1/2"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl mix-blend-overlay translate-y-1/2 -translate-x-1/2"></div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSEO } from '../../composables/useSEO';
import { helpArticles } from '../../data/articles';

useSEO({
  title: 'Warungin - Solusi Kasir Pintar UMKM',
  description: 'Aplikasi kasir (POS) lengkap dengan manajemen stok, laporan keuangan, dan toko online. Solusi terbaik untuk warung, toko, dan bisnis F&B.',
  keywords: 'kasir online, aplikasi pos, sistem kasir, manajemen stok, umkm indonesia',
});

const featuredArticles = computed(() => {
   // Select specific articles relevant for new users
   const featuredSlugs = ['cara-setup-awal', 'cara-menambah-produk', 'download-laporan', 'menggunakan-kasir-pos'];
   return helpArticles.filter(article => featuredSlugs.includes(article.slug)).slice(0, 3);
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>
