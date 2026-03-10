// Help articles data with dummy content for popular guides
export interface HelpArticle {
    slug: string;
    title: string;
    description: string;
    category: 'getting-started' | 'features' | 'billing' | 'troubleshooting' | 'api' | 'security';
    icon: string;
    content: string;
    relatedArticles: string[];
    tags: string[];
}

export const helpArticles: HelpArticle[] = [
    // Getting Started
    {
        slug: 'cara-setup-awal',
        title: 'Cara Setup Awal Warungin',
        description: 'Langkah demi langkah menyiapkan outlet pertama Anda, dari registrasi hingga siap jualan.',
        category: 'getting-started',
        icon: 'rocket_launch',
        tags: ['setup', 'outlet', 'awal', 'mulai', 'registrasi', 'daftar', 'akun'],
        relatedArticles: ['cara-menambah-produk', 'konfigurasi-printer'],
        content: `
## Selamat Datang di Warungin!

Panduan ini akan membantu Anda menyiapkan outlet pertama dan mulai menggunakan sistem kasir Warungin.

### Langkah 1: Registrasi Akun

Untuk menjaga keamanan dan validitas data bisnis, pendaftaran akun dilakukan oleh tim Warungin.

1. Kunjungi halaman [Kontak](/contact) atau klik tombol WhatsApp di pojok kanan bawah.
2. Sampaikan data bisnis Anda (Nama, Alamat, Email) kepada tim sales.
3. Anda akan menerima email aktivasi dan password sementara.
4. Login menggunakan kredensial yang diberikan.

### Langkah 2: Setup Profil Bisnis

Setelah login, Anda sebaiknya segera mengganti password sementara:
- Masuk ke **Pengaturan > Password**
- Ubah password sesuai keinginan Anda

### Langkah 3: Tambah Outlet Pertama

1. Masuk ke menu **Pengaturan > Stores**
2. Klik tombol **Add Store**
3. Isi detail outlet:
   - Nama Outlet
   - Alamat
   - Nomor Telepon
4. Klik **Save**

### Langkah 4: Tambah Produk

Setelah outlet siap, Anda bisa mulai menambah produk:
1. Masuk ke menu **Produk**
2. Klik **Tambah Produk**
3. Isi detail produk (nama, harga, kategori)
4. Simpan

### Langkah 5: Mulai Berjualan!

Anda sudah siap menggunakan POS:
1. Buka menu **POS**
2. Pilih produk yang dibeli pelanggan
3. Proses pembayaran
4. Cetak struk

> **Tips**: Pastikan printer sudah dikonfigurasi sebelum mulai berjualan. Lihat panduan [Konfigurasi Printer](/help/konfigurasi-printer).

---

### FAQ Setup Awal

**Q: Apakah saya bisa memiliki lebih dari satu outlet?**
A: Ya! Dengan paket PRO atau ENTERPRISE, Anda bisa menambah multiple outlet.

**Q: Bagaimana cara menambah kasir?**
A: Masuk ke menu **Manajemen > Users** dan tambah user baru dengan role Kasir.

**Q: Apakah data saya aman?**
A: Ya, semua data terenkripsi dan disimpan di server yang aman.
    `
    },
    {
        slug: 'cara-menambah-produk',
        title: 'Cara Menambah Produk & Stok',
        description: 'Panduan lengkap input produk, varian, harga modal, dan manajemen stok awal.',
        category: 'features',
        icon: 'inventory_2',
        tags: ['produk', 'stok', 'varian', 'kategori', 'harga', 'barang', 'tambah', 'inventory'],
        relatedArticles: ['cara-setup-awal', 'stock-opname', 'menggunakan-kasir-pos'],
        content: `
## Menambah dan Mengelola Produk

Panduan lengkap untuk menambah produk, mengatur varian, dan mengelola stok inventaris.

### Menambah Produk Baru

1. Buka menu **Produk** dari sidebar
2. Klik tombol **+ Tambah Produk**
3. Isi informasi produk:

| Field | Keterangan |
|-------|------------|
| Nama Produk | Nama yang akan muncul di struk |
| SKU | Kode unik produk (opsional) |
| Kategori | Kelompok produk |
| Harga Jual | Harga untuk pelanggan |
| Harga Modal | Untuk kalkulasi profit |
| Stok Awal | Jumlah stok saat ini |

4. Upload foto produk (opsional tapi direkomendasikan)
5. Klik **Simpan**

### Mengatur Varian Produk

Untuk produk dengan variasi (ukuran, warna, dll):

1. Aktifkan toggle **Ada Varian**
2. Tambah nama varian (contoh: "Ukuran")
3. Tambah opsi varian (contoh: "Kecil", "Sedang", "Besar")
4. Atur harga dan stok per varian

**Contoh:**
\`\`\`
Produk: Es Kopi Susu
├── Varian: Ukuran
│   ├── Regular - Rp 18.000 (Stok: 50)
│   ├── Medium - Rp 22.000 (Stok: 45)
│   └── Large - Rp 28.000 (Stok: 30)
\`\`\`

### Manajemen Stok

#### Update Stok Manual
1. Buka detail produk
2. Klik **Edit Stok**
3. Masukkan jumlah baru
4. Pilih alasan perubahan

#### Stock Opname
Untuk penyesuaian stok massal:
1. Buka menu **Produk > Adjustments**
2. Klik **New Adjustment**
3. Pilih alasan "Stock Opname"
4. Pilih produk dan masukkan jumlah penyesuaian
5. Simpan

### Import Produk Massal

Untuk menambah banyak produk sekaligus:
1. Download template Excel dari menu Import
2. Isi data produk
3. Upload file
4. Review dan konfirmasi

---

### Tips Mengelola Produk

> **Pro Tip**: Gunakan SKU yang konsisten untuk memudahkan pencarian. Contoh: KPI-001 (Kopi 001), MKN-001 (Makanan 001).

- Selalu update stok setelah menerima barang
- Set alert stok minimum untuk produk populer
- Arsipkan produk yang sudah tidak dijual daripada menghapusnya
    `
    },
    {
        slug: 'menggunakan-kasir-pos',
        title: 'Cara Menggunakan Kasir (POS)',
        description: 'Panduan melakukan transaksi, diskon, hold order, dan cetak struk.',
        category: 'features',
        icon: 'point_of_sale',
        tags: ['kasir', 'pos', 'transaksi', 'jualan', 'bayar', 'struk', 'diskon', 'hold', 'bill'],
        relatedArticles: ['cara-menambah-produk', 'konfigurasi-printer'],
        content: `
## Menggunakan Kasir (POS)

Panduan cara memproses transaksi penjualan sehari-hari.

### Memproses Penjualan

1. Buka menu **POS**
2. Pilih Outlet (jika punya banyak cabang)
3. Pilih produk yang dipesan pelanggan (klik gambar/nama produk)
4. Jika produk memiliki varian, pilih varian yang sesuai
5. Produk akan masuk ke keranjang belanja di sebelah kanan

### Diskon & Custom Order

- **Diskon**: Klik item di keranjang > Pilih **Diskon** > Masukkan nominal atau persen
- **Catatan**: Klik item > Masukkan catatan (cth: "Jangan pedas")
- **Custom Price**: Jika perlu ubah harga manual, klik item > Edit harga (Hanya untuk Admin/Supervisor)

### Pembayaran

1. Klik tombol **Bayar** / **Charge**
2. Masukkan nominal uang yang diterima pelanggan
3. Pilih metode pembayaran (Tunai, QRIS, Transfer, dll)
4. Klik **Selesaikan Transaksi**

### Cetak Struk / Kirim Struk Digital

Setelah transaksi berhasil, Anda bisa:
- Klik **Print** untuk mencetak ke printer thermal
- Masukkan Email/WhatsApp pelanggan untuk kirim struk digital (Membutuhkan Addon Delivery & Marketing)

### Fitur Lainnya

- **Hold Order**: Simpan pesanan sementara (misal pelanggan mau tambah menu)
- **Refund**: Batalkan transaksi yang sudah terjadi (Menu > Riwayat Transaksi > Refund)
- **Buka Laci**: Buka cash drawer tanpa transaksi
    `
    },
    {
        slug: 'konfigurasi-printer',
        title: 'Konfigurasi Printer Struk',
        description: 'Cara menghubungkan printer thermal bluetooth/USB dan setting template struk.',
        category: 'features',
        icon: 'print',
        tags: ['printer', 'thermal', 'bluetooth', 'usb', 'struk', 'receipt', 'cetak', 'koneksi'],
        relatedArticles: ['cara-setup-awal', 'download-laporan'],
        content: `
## Konfigurasi Printer Struk

Panduan lengkap untuk menghubungkan printer thermal ke sistem Warungin.

### Setup Printer Bluetooth

#### Android
1. Nyalakan printer dan aktifkan Bluetooth
2. Buka **Settings > Bluetooth** di HP
3. Pair dengan printer (biasanya nama seperti "BT-Printer" atau "Thermal-58")
4. Di Warungin, buka **Pengaturan > Printer**
5. Pilih printer yang sudah di-pair
6. Test print untuk memastikan

#### iOS
1. Pastikan printer Anda mendukung iOS (MFi certified)
2. Buka **Settings > Bluetooth**
3. Connect ke printer
4. Di Warungin, pilih printer dari daftar

### Setup Printer USB

1. Hubungkan printer ke komputer dengan kabel USB
2. Install driver printer (biasanya otomatis di Windows 10/11)
3. Di Warungin web, buka **Pengaturan > Printer**
4. Pilih printer dari daftar
5. Test print

### Troubleshooting Dasar

**Printer tidak ditemukan?**
- Pastikan printer menyala dan dalam mode pairing
- Restart Bluetooth di device Anda
- Pastikan jarak tidak lebih dari 10 meter

**Print buram?**
- Bersihkan head printer
- Ganti kertas

### Template Struk

Anda bisa mengkustomisasi struk di **Pengaturan > Receipt Templates**:
- Logo bisnis
- Informasi kontak
- Pesan promosi
- QR code untuk feedback
    `
    },
    {
        slug: 'download-laporan',
        title: 'Download Laporan Bulanan',
        description: 'Export laporan penjualan, produk terlaris, dan keuangan ke Excel/PDF.',
        category: 'features',
        icon: 'download',
        tags: ['laporan', 'report', 'excel', 'pdf', 'export', 'penjualan', 'keuangan', 'bulanan', 'analisis'],
        relatedArticles: ['cara-setup-awal', 'analitik-penjualan'],
        content: `
## Export Laporan Penjualan

Panduan lengkap untuk mengunduh laporan penjualan dalam format Excel atau PDF.

### Jenis Laporan

| Laporan | Keterangan |
|---------|------------|
| Laporan Penjualan | Ringkasan transaksi harian/mingguan/bulanan |
| Laporan Produk | Produk terlaris, stok, dll |

### Cara Download Laporan

#### Dari Menu Reports

1. Buka menu **Laporan** dari sidebar
2. Pilih jenis laporan yang diinginkan
3. Set filter tanggal (hari ini, minggu ini, bulan ini, atau custom)
4. Pilih outlet (jika multi-outlet)
5. Klik tombol **Export**
6. Pilih format: **Excel** atau **PDF**
7. File akan terdownload otomatis

#### Quick Export dari Dashboard

1. Di Dashboard, scroll ke bagian laporan
2. Klik ikon download di pojok kanan atas chart
3. File langsung terdownload

### Format File

**Excel (.xlsx)**
- Bisa diedit dan dimodifikasi
- Cocok untuk analisis lanjutan
- Bisa diimport ke software akuntansi

**PDF**
- Format fixed, tidak bisa diedit
- Cocok untuk arsip dan sharing
- Print-ready

### Tips

> **Pro Tip**: Untuk analisis mendalam, export ke Excel lalu gunakan Pivot Table untuk memfilter data sesuai kebutuhan.

- Download laporan bulanan di awal bulan untuk arsip
- Bandingkan laporan antar periode untuk melihat trend
    `
    },
    // Troubleshooting Articles
    {
        slug: 'stock-opname',
        title: 'Cara Stock Opname',
        description: 'Panduan lengkap melakukan stock opname dan penyesuaian stok fisik.',
        category: 'troubleshooting',
        icon: 'inventory',
        tags: ['stock', 'opname', 'inventaris', 'adjustment', 'stok', 'fisik', 'barang', 'hilang'],
        relatedArticles: ['cara-menambah-produk'],
        content: `
## Stock Opname

Panduan lengkap melakukan stock opname / stocktaking untuk menyesuaikan stok fisik dengan sistem.

### Apa itu Stock Opname?

Stock opname adalah proses menghitung stok fisik barang dan mencocokkannya dengan data di sistem. Ini penting untuk:
- Memastikan akurasi data stok
- Mendeteksi kehilangan atau kerusakan barang
- Audit inventory

### Kapan Harus Stock Opname?

- **Harian**: Untuk produk fast-moving
- **Mingguan**: Untuk produk medium-moving
- **Bulanan**: Untuk seluruh inventaris
- **Sebelum tutup buku**: Akhir bulan/tahun

### Cara Melakukan Stock Opname

#### Langkah 1: Persiapan
1. Download **Stock List** dari menu Produk
2. Cetak atau buka di tablet
3. Siapkan alat hitung

#### Langkah 2: Hitung Stok Fisik
1. Hitung setiap produk secara fisik
2. Catat jumlah aktual di list
3. Tandai produk yang berbeda dengan sistem

#### Langkah 3: Input ke Sistem
1. Buka **Produk > Adjustments**
2. Klik **New Adjustment**
3. Pilih alasan **Stock Opname / Stocktaking**
4. Pilih produk yang perlu disesuaikan
5. Masukkan selisih (positif jika lebih, negatif jika kurang)
6. Klik **Save Adjustment**

### Contoh Penyesuaian

| Produk | Stok Sistem | Stok Fisik | Selisih | Tipe |
|--------|-------------|------------|---------|------|
| Kopi | 50 | 48 | -2 | DECREASE |
| Gula | 30 | 35 | +5 | INCREASE |
| Susu | 25 | 25 | 0 | - |

### Tips Stock Opname

> **Pro Tip**: Lakukan stock opname saat jam sepi atau setelah tutup untuk menghindari perubahan stok saat proses berlangsung.

- Libatkan minimal 2 orang untuk double-check
- Foto bukti jika ada produk rusak/expired
- Simpan laporan stock opname untuk audit
    `
    },
    {
        slug: 'lupa-password',
        title: 'Cara Reset Password',
        description: 'Panduan jika Anda lupa password akun Warungin.',
        category: 'troubleshooting',
        icon: 'lock_reset',
        tags: ['password', 'lupa', 'reset', 'login', 'ganti', 'akun'],
        relatedArticles: ['cara-setup-awal'],
        content: `
## Reset Password

Cara mengatasi lupa password akun Warungin.

### Reset via Email

1. Buka halaman [Login](/login)
2. Klik **Lupa Password?**
3. Masukkan email yang terdaftar
4. Cek inbox email (dan folder spam)
5. Klik link reset password
6. Buat password baru

### Tidak Menerima Email?

- Pastikan email yang dimasukkan benar
- Cek folder Spam/Junk
- Tunggu 5-10 menit
- Coba request ulang setelah 30 menit

### Hubungi Support

Jika masih tidak bisa:
- Email: support@warungin.com
- WhatsApp: Customer Service kami
    `
    },
    // Billing Articles
    {
        slug: 'upgrade-paket',
        title: 'Upgrade Paket & Langganan',
        description: 'Cara upgrade dari Starter ke PRO atau Enterprise untuk fitur lebih lengkap.',
        category: 'billing',
        icon: 'upgrade',
        tags: ['upgrade', 'paket', 'langganan', 'subscription', 'billing', 'bayar', 'pro', 'enterprise'],
        relatedArticles: ['download-laporan'],
        content: `
## Upgrade Paket Langganan

Panduan lengkap untuk upgrade paket Warungin.

### Perbandingan Paket

| Fitur | Starter | PRO | Enterprise |
|-------|---------|-----|------------|
| Produk | 100 | 500 | Unlimited |
| User | 3 | 10 | Unlimited |
| Outlet | 1 | 5 | Unlimited |
| Laporan | Basic | Advanced | Custom |
| Support | Email | Priority | Dedicated |

### Cara Upgrade

1. Buka **Pengaturan > Subscription**
2. Klik **Upgrade Plan**
3. Pilih paket yang diinginkan
4. Pilih durasi (Bulanan / Tahunan)
5. Lakukan pembayaran
6. Fitur aktif otomatis

### Metode Pembayaran

- Bank Transfer (BCA, Mandiri, BNI, BRI)
- E-Wallet (GoPay, OVO, DANA)
- QRIS
- Credit Card

### Prorate Billing

Jika upgrade di tengah periode:
- Sisa hari di paket lama akan dihitung
- Anda hanya bayar selisihnya
- Contoh: Starter ke PRO di hari ke-15, bayar 50% selisih
    `
    }
];

// Helper function to get article by slug
export const getArticleBySlug = (slug: string): HelpArticle | undefined => {
    return helpArticles.find(article => article.slug === slug);
};

// Helper function to search articles
export const searchArticles = (query: string): HelpArticle[] => {
    const lowerQuery = query.toLowerCase();
    return helpArticles.filter(article =>
        article.title.toLowerCase().includes(lowerQuery) ||
        article.description.toLowerCase().includes(lowerQuery) ||
        article.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
};

// Helper function to get articles by category
export const getArticlesByCategory = (category: HelpArticle['category']): HelpArticle[] => {
    return helpArticles.filter(article => article.category === category);
};

// Helper function to get related articles
export const getRelatedArticles = (slug: string): HelpArticle[] => {
    const article = getArticleBySlug(slug);
    if (!article) return [];
    return article.relatedArticles
        .map(relatedSlug => getArticleBySlug(relatedSlug))
        .filter((a): a is HelpArticle => a !== undefined);
};
