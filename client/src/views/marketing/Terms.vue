<template>
  <div class="min-h-screen font-display bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e]">
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 px-2">
             Syarat & Ketentuan Layanan
          </h1>
          <p class="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 px-4">
            Terakhir diperbarui: Desember 2025
          </p>
        </div>
        
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-md transition p-8 sm:p-10 space-y-10 border border-slate-200 dark:border-slate-700">
          <section class="border-b border-slate-100 dark:border-slate-700 pb-8 last:border-0 last:pb-0">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                1
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Penerimaan Syarat & Ketentuan</h2>
            </div>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              Dengan mendaftar dan menggunakan layanan Warungin, Anda menyatakan setuju untuk terikat oleh syarat dan ketentuan ini. 
              Layanan ini ditujukan untuk penggunaan bisnis profesional.
            </p>
          </section>

          <section class="border-b border-slate-100 dark:border-slate-700 pb-8 last:border-0 last:pb-0">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                2
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Layanan Sistem Kasir</h2>
            </div>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-4">
              Warungin menyediakan platform Point of Sales (POS) berbasis cloud. Kami menjamin ketersediaan layanan (SLA) 99.9% 
              untuk mendukung operasional bisnis Anda.
            </p>
             <ul class="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-2 ml-2">
                <li>Backup data otomatis setiap hari</li>
                <li>Enkripsi data end-to-end</li>
                <li>Akses multi-device real-time</li>
             </ul>
          </section>

          <section class="border-b border-slate-100 dark:border-slate-700 pb-8 last:border-0 last:pb-0">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                3
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Berlangganan & Pembayaran</h2>
            </div>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-4">
              Tagihan dibayarkan di muka sesuai siklus yang dipilih (bulanan/tahunan). Harga dapat berubah dengan pemberitahuan 30 hari sebelumnya.
            </p>
            <div class="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
               <p class="text-slate-700 dark:text-slate-300 font-medium">
                  <strong>Kebijakan Refund:</strong> Kami menawarkan garansi uang kembali 7 hari pertama jika layanan tidak sesuai ekspektasi teknis.
               </p>
            </div>
          </section>

          <section class="border-b border-slate-100 dark:border-slate-700 pb-8 last:border-0 last:pb-0">
            <div class="flex items-center gap-4 mb-4">
               <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                4
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Privasi Data</h2>
            </div>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-lg mb-4">
              Data transaksi Anda adalah milik Anda sepenuhnya. Warungin tidak akan membagikan, menjual, atau menggunakan data transaksi spesifik Anda 
              tanpa izin, kecuali untuk keperluan agregasi statistik anonim atau kewajiban hukum.
            </p>
          </section>

          <section>
            <div class="flex items-center gap-4 mb-4">
               <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                5
              </div>
              <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Batasan Tanggung Jawab</h2>
            </div>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
              Warungin tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan layanan, 
              termasuk namun tidak terbatas pada kehilangan keuntungan atau data akibat kesalahan pengguna.
            </p>
          </section>
        </div>

        <div class="mt-12 text-center">
          <router-link
            to="/"
            class="inline-flex items-center px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition font-bold shadow-sm hover:shadow-md"
          >
            <span class="material-symbols-outlined mr-2">arrow_back</span>
            Kembali ke Beranda
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSEO } from '../../composables/useSEO';

useSEO({
  title: 'Syarat & Ketentuan Layanan',
  description: 'Ketentuan penggunaan dan kebijakan layanan sistem kasir Warungin.',
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>
