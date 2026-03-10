<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    @click.self="close"
  >
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
      <!-- Header -->
      <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl z-10">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold mb-1 flex items-center gap-2">
              <span class="material-symbols-outlined">menu_book</span>
              Knowledge Base
            </h2>
            <p class="text-blue-100 text-sm">Pelajari tentang fitur, langganan, dan cara penggunaan sistem</p>
          </div>
          <button
            @click="close"
            class="text-white hover:bg-white/20 rounded-full p-2 transition-colors focus:outline-none"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4 bg-white dark:bg-slate-800 min-h-[400px]">
        <!-- Card 0: Tutorial Penggunaan -->
        <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-blue-50/50 dark:bg-slate-700/30">
          <button
            @click="toggleCard('tutorial')"
            class="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex-1 text-left"
            :class="expandedCard === 'tutorial' ? 'bg-slate-100 dark:bg-slate-700' : ''"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <span class="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div>
                <h3 class="font-bold text-[#0d141b] dark:text-white text-lg">Tutorial Penggunaan</h3>
                <p class="text-sm text-[#4c739a] dark:text-slate-400">Panduan lengkap untuk memulai dan menggunakan sistem</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[#4c739a] transition-transform duration-300" :class="{ 'rotate-180': expandedCard === 'tutorial' }">expand_more</span>
          </button>
          
          <div
            v-if="expandedCard === 'tutorial'"
            class="p-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700"
          >
            <div class="space-y-6 text-sm text-[#0d141b] dark:text-slate-300">
              <!-- Setup Awal Toko -->
              <div class="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                <h4 class="font-bold text-blue-900 dark:text-blue-100 mb-4 text-base flex items-center gap-2">
                  <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">store</span>
                  Langkah 1: Setup Awal Toko
                </h4>
                <ol class="list-decimal list-inside space-y-3 ml-2 text-[#0d141b] dark:text-slate-300">
                  <li><strong class="text-blue-800 dark:text-emerald-200">Lengkapi Profil Toko:</strong> Klik menu <strong>Pengaturan Toko</strong> → Isi nama toko, alamat, nomor telepon, dan informasi penting lainnya</li>
                  <li><strong class="text-blue-800 dark:text-emerald-200">Atur Outlet/Store:</strong> Jika memiliki beberapa cabang, tambahkan outlet di menu <strong>Store</strong> → Klik tombol <strong>Tambah Store</strong></li>
                  <li><strong class="text-blue-800 dark:text-emerald-200">Konfigurasi Struk:</strong> Di halaman <strong>Pengaturan Toko</strong>, scroll ke bagian <strong>Template Struk</strong> → Pilih template yang sesuai atau kustomisasi sesuai kebutuhan</li>
                  <li><strong class="text-blue-800 dark:text-emerald-200">Setup Metode Pembayaran:</strong> Pastikan metode pembayaran yang digunakan sudah dikonfigurasi (Cash, QRIS, Transfer Bank, dll)</li>
                </ol>
              </div>

              <!-- Atur User -->
              <div class="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-xl border border-purple-100 dark:border-purple-800">
                <h4 class="font-bold text-purple-900 dark:text-purple-100 mb-4 text-base flex items-center gap-2">
                   <span class="material-symbols-outlined text-purple-600 dark:text-purple-400">group</span>
                  Langkah 2: Atur User & Tim
                </h4>
                <ol class="list-decimal list-inside space-y-3 ml-2 text-[#0d141b] dark:text-slate-300">
                  <li><strong class="text-purple-800 dark:text-purple-200">Buka Menu User:</strong> Klik menu <strong>User</strong> di sidebar untuk melihat daftar user yang sudah ada</li>
                  <li><strong class="text-purple-800 dark:text-purple-200">Tambah User Baru:</strong> Klik tombol <strong>Tambah User</strong> → Isi nama, email, pilih role (Kasir, Dapur, atau SPV) → Sistem akan generate password default</li>
                  <li><strong class="text-purple-800 dark:text-purple-200">Atur Permission:</strong> Untuk user dengan role Supervisor atau Kasir, Anda bisa atur permission khusus di menu edit user (misalnya: izin edit order, hapus order, dll)</li>
                  <li><strong class="text-purple-800 dark:text-purple-200">Distribusikan Akses:</strong> Berikan email dan password default ke masing-masing user → Minta mereka login dan ganti password di menu <strong>Pengaturan</strong> → <strong>Password</strong></li>
                  <li><strong class="text-purple-800 dark:text-purple-200">Aktifkan/Nonaktifkan User:</strong> Gunakan toggle <strong>Status</strong> untuk mengaktifkan atau menonaktifkan akses user tanpa menghapus data mereka</li>
                </ol>
              </div>

              <!-- Menu Admin Tenant -->
              <div class="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                <h4 class="font-bold text-blue-900 dark:text-blue-100 mb-4 text-base flex items-center gap-2">
                   <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">admin_panel_settings</span>
                  Menu Admin Tenant - Kontrol Penuh Sistem
                </h4>
                <div class="space-y-4 ml-2">
                   <div v-for="(item, index) in [
                     { title: 'Dashboard', desc: 'Lihat ringkasan penjualan hari ini, produk terlaris, grafik penjualan, dan statistik penting lainnya. Quick Insight menampilkan analisis cepat untuk pengambilan keputusan.', icon: 'dashboard' },
                     { title: 'Produk', desc: 'Kelola semua produk toko Anda. Tambah produk baru dengan foto, kategori, harga, stok, dan barcode. Edit atau hapus produk yang sudah tidak dijual.', icon: 'inventory_2' },
                    { title: 'POS (Point of Sale)', desc: 'Sistem kasir untuk transaksi langsung. Dukungan penuh untuk Hold Order (Parkir Pesanan) dan Split Bill (Pisah Tagihan).', icon: 'point_of_sale' },
                    { title: 'Pesanan', desc: 'Lihat semua pesanan yang masuk, filter berdasarkan status (Pending, Processing, Completed, Cancelled). Lakukan Refund khusus untuk pesanan Completed.', icon: 'receipt_long' },
                     { title: 'Pelanggan', desc: 'Kelola data pelanggan dan member. Tambah pelanggan baru, lihat riwayat pembelian, dan kelola member dengan diskon khusus.', icon: 'group' },
                     { title: 'Laporan', desc: 'Akses berbagai laporan penjualan dan keuangan. Filter berdasarkan tanggal, export ke Excel/PDF, dan analisis performa bisnis.', icon: 'analytics' }
                   ]" :key="index">
                     <strong class="text-blue-800 dark:text-emerald-300 flex items-center gap-2">
                       <span class="material-symbols-outlined text-[18px]">{{ item.icon }}</span>
                       {{ item.title }}:
                     </strong>
                     <p class="text-[#4c739a] dark:text-slate-400 mt-1 ml-7">{{ item.desc }}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 1: Paket Langganan -->
        <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-blue-50/50 dark:bg-slate-700/30">
          <button
            @click="toggleCard('subscription')"
            class="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex-1 text-left"
            :class="expandedCard === 'subscription' ? 'bg-slate-100 dark:bg-slate-700' : ''"
          >
            <div class="flex items-center space-x-4">
               <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <span class="material-symbols-outlined text-[24px]">card_membership</span>
              </div>
              <div>
                <h3 class="font-bold text-[#0d141b] dark:text-white text-lg">Paket Langganan</h3>
                <p class="text-sm text-[#4c739a] dark:text-slate-400">Pelajari tentang paket yang tersedia</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[#4c739a] transition-transform duration-300" :class="{ 'rotate-180': expandedCard === 'subscription' }">expand_more</span>
          </button>
          
          <div
            v-if="expandedCard === 'subscription'"
            class="p-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700"
          >
            <div class="space-y-4 text-sm text-[#0d141b] dark:text-slate-300">
              <div class="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <h4 class="font-bold text-[#0d141b] dark:text-white mb-3">Paket yang Tersedia:</h4>
                <ul class="space-y-2">
                  <li class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-slate-400"></span> <strong>BASIC</strong> - Rp 99.000/bulan: Fitur dasar untuk UMKM kecil</li>
                  <li class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-blue-500"></span> <strong>PRO</strong> - Rp 249.000/bulan: Fitur lengkap untuk bisnis menengah</li>
                  <li class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-blue-500"></span> <strong>ENTERPRISE</strong> - Rp 599.000/bulan: Fitur premium untuk bisnis besar</li>
                </ul>
              </div>
              <div>
                <h4 class="font-bold text-[#0d141b] dark:text-white mb-2">Cara Berlangganan:</h4>
                <ol class="list-decimal list-inside space-y-2 ml-2 text-[#4c739a] dark:text-slate-400">
                  <li>Kunjungi halaman <strong>Berlangganan</strong> di menu sidebar</li>
                  <li>Pilih paket yang sesuai dengan kebutuhan bisnis Anda</li>
                  <li>Pilih durasi langganan (30, 60, atau 90 hari)</li>
                  <li>Lakukan pembayaran melalui Midtrans</li>
                  <li>Setelah pembayaran berhasil, paket akan aktif otomatis</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 2: Addons -->
        <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-blue-50/50 dark:bg-slate-700/30">
          <button
            @click="toggleCard('addons')"
            class="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex-1 text-left"
            :class="expandedCard === 'addons' ? 'bg-slate-100 dark:bg-slate-700' : ''"
          >
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <span class="material-symbols-outlined text-[24px]">extension</span>
              </div>
              <div>
                <h3 class="font-bold text-[#0d141b] dark:text-white text-lg">Addons</h3>
                <p class="text-sm text-[#4c739a] dark:text-slate-400">Fitur tambahan untuk meningkatkan produktivitas</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-[#4c739a] transition-transform duration-300" :class="{ 'rotate-180': expandedCard === 'addons' }">expand_more</span>
          </button>
          
          <div
            v-if="expandedCard === 'addons'"
            class="p-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700"
          >
            <div class="space-y-4 text-sm text-[#0d141b] dark:text-slate-300">
              <div>
                <h4 class="font-bold text-[#0d141b] dark:text-white mb-3">Addons yang Tersedia:</h4>
                <div v-if="loadingAddons" class="text-center py-4">
                  <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <ul v-else-if="availableAddons.length > 0" class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  <li v-for="addon in availableAddons" :key="addon.id" class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div class="flex justify-between items-start">
                      <span class="font-bold">{{ addon.name }}</span>
                      <span class="font-bold text-blue-600 dark:text-blue-400">Rp {{ formatAddonPrice(addon.price) }}rb/bln</span>
                    </div>
                    <p class="text-xs text-[#4c739a] dark:text-slate-400 mt-1">{{ addon.description }}</p>
                    <div class="flex gap-2 mt-2">
                       <span v-if="addon.defaultLimit" class="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">Limit: {{ addon.defaultLimit }}</span>
                       <span v-if="addon.comingSoon" class="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded border border-amber-100">Coming Soon</span>
                    </div>
                  </li>
                </ul>
                <p v-else class="text-[#4c739a] italic">Memuat daftar addon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-slate-50 dark:bg-slate-800/90 backdrop-blur p-4 border-t border-slate-200 dark:border-slate-700 rounded-b-xl z-20">
        <div class="flex items-center justify-between">
          <label class="flex items-center space-x-2 text-sm text-[#4c739a] dark:text-slate-400 cursor-pointer hover:text-[#0d141b] dark:hover:text-white transition">
            <input
              type="checkbox"
              v-model="dontShowToday"
              class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Jangan tampilkan lagi hari ini</span>
          </label>
          <button
            @click="close"
            class="px-6 py-2.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-slate-900 dark:hover:bg-slate-200 transition font-bold shadow-lg shadow-slate-500/10"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
  dontShowToday: [];
}>();

const expandedCard = ref<string | null>(null);
const dontShowToday = ref(false);
const availableAddons = ref<any[]>([]);
const loadingAddons = ref(false);

const formatAddonPrice = (price: number) => {
  return (price / 1000).toFixed(0);
};

const loadAddons = async () => {
  loadingAddons.value = true;
  try {
    const response = await api.get('/addons/available');
    const addons = Array.isArray(response.data) ? response.data : [];
    // Remove duplicates based on id
    availableAddons.value = addons.filter((addon, index, self) => 
      index === self.findIndex(a => a && addon && a.id === addon.id)
    );
  } catch (error) {
    console.error('Error loading addons:', error);
    availableAddons.value = [];
  } finally {
    loadingAddons.value = false;
  }
};

const toggleCard = (card: string) => {
  if (expandedCard.value === card) {
    expandedCard.value = null;
  } else {
    expandedCard.value = card;
    // Load addons when Addons card is expanded
    if (card === 'addons' && availableAddons.value.length === 0) {
      loadAddons();
    }
  }
};

const close = () => {
  if (dontShowToday.value) {
    emit('dontShowToday');
  }
  emit('close');
};

onMounted(() => {
  // Preload addons when modal is shown
  if (props.show) {
    loadAddons();
  }
});
</script>

