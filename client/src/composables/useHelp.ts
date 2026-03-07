import { computed } from 'vue';
import { useRoute } from 'vue-router';

// Help content mapping based on route
const helpContent: Record<string, { title: string; content: string; videoUrl?: string; videoUrls?: Array<{ title: string; url: string; duration?: string }> }> = {
  '/app/dashboard': {
    title: 'Dashboard',
    content: 'Dashboard menampilkan ringkasan penjualan, produk terlaris, dan statistik penting lainnya. Gunakan filter tanggal untuk melihat data periode tertentu.',
  videoUrl: 'https://example.com/videos/dashboard',
  },
  '/app/products': {
    title: 'Manajemen Produk',
    content: 'Kelola produk Anda di sini. Anda dapat menambah, mengedit, menghapus produk, mengatur stok, dan melakukan edit massal. Gunakan filter untuk mencari produk tertentu.',
    videoUrls: [
      { title: 'Cara Menambah Produk', url: 'https://example.com/videos/products/add', duration: '3:45' },
      { title: 'Edit Massal Produk', url: 'https://example.com/videos/products/bulk-edit', duration: '5:20' },
      { title: 'Manajemen Stok', url: 'https://example.com/videos/products/stock', duration: '4:10' },
    ],
  },
  '/app/products/adjustments': {
    title: 'Penyesuaian Stok',
    content: 'Lakukan penyesuaian stok produk dengan mudah. Tambahkan atau kurangi stok, dan catat alasan penyesuaian untuk audit trail.',
  },
  '/app/orders': {
    title: 'Pesanan & Transaksi',
    content: 'Lihat dan kelola semua pesanan di sini. Filter berdasarkan status, tanggal, atau cari berdasarkan nomor pesanan. Gunakan bulk actions untuk mengelola beberapa pesanan sekaligus.',
    videoUrls: [
      { title: 'Mengelola Pesanan', url: 'https://example.com/videos/orders/manage', duration: '4:30' },
      { title: 'Filter & Pencarian', url: 'https://example.com/videos/orders/filter', duration: '2:15' },
    ],
  },
  '/app/customers': {
    title: 'Manajemen Pelanggan',
    content: 'Kelola data pelanggan, lihat riwayat transaksi, dan catatan penting. Gunakan search untuk menemukan pelanggan dengan cepat.',
  },
  '/app/reports': {
    title: 'Laporan',
    content: 'Generate laporan penjualan, keuangan, dan analitik. Pilih periode dan jenis laporan, lalu ekspor dalam format PDF atau CSV. Gunakan Advanced Options untuk opsi lanjutan.',
    videoUrls: [
      { title: 'Membuat Laporan', url: 'https://example.com/videos/reports/create', duration: '6:00' },
      { title: 'Ekspor & Berbagi', url: 'https://example.com/videos/reports/export', duration: '3:20' },
    ],
  },
  '/app/reports/global': {
    title: 'Laporan Global',
    content: 'Laporan global memberikan overview semua tenant. Hanya tersedia untuk Super Admin.',
  },
  '/app/reports/advanced': {
    title: 'Laporan Lanjutan',
    content: 'Laporan dengan analitik mendalam, prediksi, dan insights bisnis. Cocok untuk analisis strategis.',
  },
  '/app/users': {
    title: 'Manajemen Pengguna',
    content: 'Kelola pengguna dan izin akses. Tambahkan pengguna baru, edit role, atau nonaktifkan akun.',
  },
  '/app/settings/preferences': {
    title: 'Preferensi',
    content: 'Sesuaikan pengaturan aplikasi sesuai kebutuhan Anda. Atur bahasa, notifikasi, dan widget dashboard.',
  },
  '/app/settings/system': {
    title: 'Pengaturan Sistem',
    content: 'Konfigurasi sistem, email, webhook, dan pengaturan teknis lainnya.',
  },
  '/app/pos': {
    title: 'Point of Sale',
    content: 'Gunakan POS untuk melakukan transaksi penjualan. Cari produk, tambahkan ke keranjang, dan proses pembayaran. Gunakan keyboard shortcuts untuk navigasi cepat.',
    videoUrl: 'https://example.com/videos/pos',
  },
};

export function useHelp() {
  const route = useRoute();
  
  const currentHelp = computed(() => {
    // Try exact match first
    if (helpContent[route.path]) {
      return helpContent[route.path];
    }
    
    // Try prefix match
    for (const [path, content] of Object.entries(helpContent)) {
      if (route.path.startsWith(path)) {
        return content;
      }
    }
    
    // Default help
    return {
      title: 'Bantuan',
      content: 'Gunakan fitur bantuan ini untuk mendapatkan informasi tentang halaman yang sedang Anda lihat. Konten bantuan akan disesuaikan berdasarkan halaman aktif.',
    };
  });
  
  return {
    currentHelp,
    hasHelp: computed(() => !!currentHelp.value),
  };
}

