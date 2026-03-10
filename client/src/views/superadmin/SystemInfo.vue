<template>
  <div class="w-full bg-slate-50 dark:bg-slate-900 min-h-screen py-8 px-4 md:px-8 font-display animate-fade-in">
    <div class="w-full space-y-8">
      
      <!-- Premium Header Section -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-200 dark:border-slate-700">
        <div class="space-y-4 max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-800">
            <span class="material-symbols-outlined text-base">verified</span>
            Status Platform: Aktif & Teroptimasi
          </div>
          <h1 class="text-slate-900 dark:text-white tracking-tight text-4xl lg:text-5xl font-black leading-[1.1]">
            Informasi <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Sistem & Ekosistem</span>
          </h1>
          <p class="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">
            Dibalik layar teknologi Warungin yang dirancang untuk kecepatan, keamanan, dan skalabilitas bisnis Anda. 
            Pelajari spesifikasi teknis dan fitur eksklusif tiap paket kami.
          </p>
        </div>
        
        <!-- Live Monitor Widget (Aesthetic) -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center gap-5 hover:-translate-y-1 transition-transform duration-500">
          <div class="relative">
            <div class="size-16 rounded-full border-4 border-blue-100 dark:border-blue-900/30 flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl animate-pulse">speed</span>
            </div>
            <div class="absolute -top-1 -right-1 size-4 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Rate Uptime</p>
            <p class="text-2xl font-black text-slate-900 dark:text-white">99.99%</p>
            <p class="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
               <span class="material-symbols-outlined text-[12px]">bolt</span>
               Optimasi Real-time
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left Sidebar: Categories -->
        <div class="lg:col-span-4 space-y-6">
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden sticky top-8">
            <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Navigasi Teknis</h2>
            <div class="flex flex-col gap-2">
              <button 
                v-for="(label, key) in menuLabels" 
                :key="key"
                @click="activeCategory = key"
                :class="[
                  'flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group text-left relative overflow-hidden',
                  activeCategory === key 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 translate-x-1' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
                ]"
              >
                <div :class="[
                  'size-10 rounded-lg flex items-center justify-center transition-colors shadow-sm',
                  activeCategory === key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                ]">
                  <span class="material-symbols-outlined text-[22px]">{{ menuIcons[key] }}</span>
                </div>
                <span class="font-bold flex-1 z-10">{{ label }}</span>
                <span v-if="activeCategory === key" class="material-symbols-outlined text-[18px] z-10">arrow_forward_ios</span>
              </button>
            </div>

            <!-- Promotion Card -->
            <div class="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-blue-900 text-white relative overflow-hidden group shadow-lg">
              <div class="absolute -right-4 -bottom-4 size-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div class="absolute top-0 right-0 p-3 opacity-20">
                 <span class="material-symbols-outlined text-4xl">rocket_launch</span>
              </div>
              <p class="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-2">Info Upgrade</p>
              <h4 class="font-bold text-lg mb-4 leading-snug relative z-10">Butuh fitur kustom untuk perusahaan Anda?</h4>
              <button @click="handleConsultEnterprise" class="w-full py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-bold transition-all border border-white/10 relative z-10 hover:shadow-lg">
                Konsultasi Enterprise
              </button>
            </div>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="lg:col-span-8">
          <Transition name="fade-slide" mode="out-in">
            <div :key="activeCategory" class="space-y-8">
              
              <!-- CATEGORY: TECHNOLOGIES -->
              <div v-if="activeCategory === 'tech'" class="space-y-6 animate-fade-in-up">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Frontend Section -->
                  <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative group overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
                    <div class="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                      <span class="material-symbols-outlined text-[120px]">web</span>
                    </div>
                    <div class="flex items-center gap-4 mb-8 relative z-10">
                       <div class="size-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                        <span class="material-symbols-outlined text-[28px]">layers</span>
                      </div>
                      <div>
                        <h3 class="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-1">Modern UI Engine</h3>
                        <p class="text-2xl font-black text-slate-800 dark:text-white">Frontend Stack</p>
                      </div>
                    </div>
                    <ul class="space-y-3 relative z-10">
                      <li v-for="item in techStack.frontend" :key="item.name" class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border border-slate-100 dark:border-slate-700/50 group/item">
                        <div class="flex items-center gap-3">
                           <span class="material-symbols-outlined text-slate-400 group-hover/item:text-blue-500 text-[18px] transition-colors">check_circle</span>
                           <span class="text-sm font-bold text-slate-600 dark:text-slate-400">{{ item.name }}</span>
                        </div>
                        <span class="text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">{{ item.version }}</span>
                      </li>
                    </ul>
                  </div>

                  <!-- Backend Section -->
                  <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative group overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
                    <div class="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                      <span class="material-symbols-outlined text-[120px]">dns</span>
                    </div>
                    <div class="flex items-center gap-4 mb-8 relative z-10">
                       <div class="size-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm">
                        <span class="material-symbols-outlined text-[28px]">terminal</span>
                      </div>
                      <div>
                        <h3 class="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-1">High Performance</h3>
                        <p class="text-2xl font-black text-slate-800 dark:text-white">Backend Core</p>
                      </div>
                    </div>
                    <ul class="space-y-3 relative z-10">
                      <li v-for="item in techStack.backend" :key="item.name" class="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors border border-slate-100 dark:border-slate-700/50 group/item">
                         <div class="flex items-center gap-3">
                           <span class="material-symbols-outlined text-slate-400 group-hover/item:text-indigo-500 text-[18px] transition-colors">check_circle</span>
                           <span class="text-sm font-bold text-slate-600 dark:text-slate-400">{{ item.name }}</span>
                        </div>
                        <span class="text-xs font-black text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">{{ item.version }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- CATEGORY: SERVICES -->
              <div v-if="activeCategory === 'docker'" class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                <div v-for="service in services" :key="service.name" class="bg-white dark:bg-slate-800 p-7 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:-translate-y-1 transition-all hover:shadow-lg">
                  <div class="flex items-start justify-between mb-6">
                    <div :class="['size-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform', service.bg]">
                      <span :class="['material-symbols-outlined text-[28px]', service.color]">{{ service.icon }}</span>
                    </div>
                    <div class="flex flex-col items-end">
                      <span class="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">Aktif</span>
                      <div class="flex gap-1 mt-2">
                        <div class="size-1.5 bg-blue-500 rounded-full"></div>
                        <div class="size-1.5 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                        <div class="size-1.5 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                      </div>
                    </div>
                  </div>
                  <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2">{{ service.name }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">{{ service.description }}</p>
                  <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <span>Kapasitas Load</span>
                      <span class="text-slate-900 dark:text-white">{{ service.load }}%</span>
                    </div>
                    <div class="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000" :style="{ width: service.load + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CATEGORY: ROLES -->
              <div v-if="activeCategory === 'features'" class="space-y-6 animate-fade-in-up">
                <div v-for="role in roles" :key="role.name" class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <div :class="['p-8 flex items-center gap-6 border-b border-slate-100 dark:border-slate-700 transition-colors relative overflow-hidden', role.headerBg]">
                    <div class="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-white/20 to-transparent"></div>
                    <div :class="['size-16 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500 shrink-0', role.iconBg]">
                      <span class="material-symbols-outlined text-[36px]">{{ role.icon }}</span>
                    </div>
                    <div>
                      <div class="flex items-center gap-3 mb-1">
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ role.name }}</h3>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/50 backdrop-blur text-slate-600 uppercase tracking-wide border border-white/20">Akses Role</span>
                      </div>
                      <p class="text-slate-600 dark:text-slate-300 font-medium italic">"{{ role.tagline }}"</p>
                    </div>
                  </div>
                  <div class="p-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <div v-for="feature in role.features" :key="feature" class="flex items-center gap-3.5 group/item">
                        <div class="size-6 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0">
                           <div :class="['size-2.5 rounded-full transition-all group-hover/item:scale-125', role.bulletColor]"></div>
                        </div>
                        <span class="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors">{{ feature }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CATEGORY: SUBSCRIPTIONS -->
              <div v-if="activeCategory === 'plans'" class="space-y-8 animate-fade-in-up">
                <!-- Plans Comparison -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div v-for="plan in subscriptionPlans" :key="plan.id" 
                    :class="[
                      'relative p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col hover:-translate-y-2',
                      plan.popular 
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-900 shadow-2xl shadow-slate-900/20 text-white z-10 scale-105' 
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700/50 hover:shadow-xl'
                    ]">
                    <div v-if="plan.popular" class="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/30 uppercase tracking-widest ring-4 ring-white dark:ring-slate-900">Paling Populer</div>
                    <div class="mb-8">
                      <h3 :class="['text-sm font-black uppercase tracking-[0.2em] mb-4', plan.popular ? 'text-blue-400' : 'text-slate-400']">{{ plan.name }}</h3>
                      <div class="flex items-baseline gap-1">
                        <span :class="['text-4xl font-black', plan.popular ? 'text-white' : 'text-slate-900 dark:text-white']">{{ plan.price }}</span>
                        <span :class="['text-xs font-bold opacity-60', plan.popular ? 'text-white' : 'text-slate-900 dark:text-white']">/bulan</span>
                      </div>
                      <p :class="['text-xs mt-4 leading-relaxed font-medium', plan.popular ? 'text-slate-300' : 'text-slate-500']">{{ plan.description }}</p>
                    </div>
                    <div class="flex-1 space-y-4">
                       <p class="text-[10px] font-black uppercase tracking-widest border-b pb-3 mb-4" :class="plan.popular ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-100 dark:border-slate-700'">Fitur Utama</p>
                       <div v-for="f in plan.points" :key="f" class="flex items-start gap-3">
                         <span :class="['material-symbols-outlined text-[18px] mt-0.5', plan.popular ? 'text-blue-400' : 'text-blue-600']">check_circle</span>
                         <span :class="['text-xs font-bold', plan.popular ? 'text-white' : 'text-slate-700 dark:text-slate-300']">{{ f }}</span>
                       </div>
                    </div>
                    <button @click="handleViewPlanDetail(plan)" :class="['mt-8 w-full py-4 rounded-xl font-black text-xs transition-all tracking-wide uppercase', plan.popular ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-white text-slate-700']">
                      Lihat Detail Paket
                    </button>
                  </div>
                </div>

                <!-- Addons Section -->
                <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mt-12 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                  <div class="flex items-center justify-between mb-8">
                    <div>
                      <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ekstensi & Addons</h3>
                      <p class="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Optimalkan fungsi Warungin sesuai kebutuhan spesifik bisnis Anda.</p>
                    </div>
                    <div class="hidden sm:block p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                      <span class="material-symbols-outlined text-4xl text-indigo-500">extension</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="addon in addons" :key="addon.name" class="p-6 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all group shadow-sm hover:shadow-lg hover:-translate-y-1">
                      <div class="flex items-center gap-4 mb-4">
                        <div class="size-12 rounded-xl bg-slate-50 dark:bg-slate-700 shadow-sm flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 text-slate-600 dark:text-slate-300">
                          <span class="material-symbols-outlined text-[24px]">{{ addon.icon }}</span>
                        </div>
                        <h4 class="font-bold text-slate-900 dark:text-white leading-tight">{{ addon.name }}</h4>
                      </div>
                      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium min-h-[40px]">{{ addon.description }}</p>
                      <div class="mt-4 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                        <span class="text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">{{ addon.price }}</span>
                        <button @click="handleAddAddon(addon)" class="rotate-0 group-hover:rotate-90 transition-transform duration-300">
                           <span class="material-symbols-outlined text-slate-300 group-hover:text-blue-600 transition-colors">add_circle</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotification } from '../../composables/useNotification';

const router = useRouter();
useNotification();
const activeCategory = ref('tech');

const menuLabels = {
  tech: 'Teknologi Inti',
  docker: 'Layanan Mikro',
  features: 'Akses Per Role',
  plans: 'Paket & Addons'
};

const menuIcons = {
  tech: 'code_blocks',
  docker: 'hub',
  features: 'groups',
  plans: 'loyalty'
};

const techStack = {
  frontend: [
    { name: 'UI Library', version: 'Vue.js 3.3.4 (Composition API)' },
    { name: 'Core Engine', version: 'Vite 6.4.1 (Next-gen bundling)' },
    { name: 'Logic Flow', version: 'Pinia 2.1.7 (Modular State)' },
    { name: 'Styling', version: 'Tailwind CSS 3.4.0 (Atomic Design)' },
    { name: 'Interactivity', version: 'Headless UI / Material Icons' },
    { name: 'Visualization', version: 'Chart.js 4.4.0 (Interactive Graphics)' }
  ],
  backend: [
    { name: 'Runtime', version: 'Node.js 18 (LTS Optimized)' },
    { name: 'Framework', version: 'Express.js 4.18.2 (Fast/Minimalist)' },
    { name: 'Database', version: 'PostgreSQL 15 (Relational Power)' },
    { name: 'ORM', version: 'Prisma 6.19.0 (Type-safe Queries)' },
    { name: 'Caching', version: 'Redis 7 (Sub-millisecond latency)' },
    { name: 'Job Queues', version: 'BullMQ 5.0.0 (Reliable Dispatch)' }
  ]
};

const services = [
  { 
    name: 'PostgreSQL Database', 
    icon: 'database', 
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    color: 'text-blue-500',
    description: 'Pusat penyimpanan data transaksional terenkripsi dengan proteksi ACID penuh.',
    load: 18
  },
  { 
    name: 'Redis Cache Layer', 
    icon: 'bolt', 
    bg: 'bg-red-50 dark:bg-red-900/20', 
    color: 'text-red-500',
    description: 'Mempercepat respons API hingga 300% melalui caching strategis dan manajemen session.',
    load: 12
  },
  { 
    name: 'Backend API Service', 
    icon: 'api', 
    bg: 'bg-blue-50 dark:bg-blue-900/20', 
    color: 'text-blue-500',
    description: 'Core logic menangani integrasi pembayaran, notifikasi, dan kalkulasi inventory.',
    load: 45
  },
  { 
    name: 'Edge Nginx Gateway', 
    icon: 'web_traffic', 
    bg: 'bg-indigo-50 dark:bg-indigo-900/20', 
    color: 'text-indigo-500',
    description: 'Gerbang utama keamanan dengan SSL otomatis, Load Balancing, dan Gzip compression.',
    load: 22
  }
];

const roles = [
  {
    name: 'Super Admin',
    tagline: 'Orkestrator Kendali Utama Platform',
    icon: 'security',
    iconBg: 'bg-gradient-to-br from-slate-800 to-black',
    headerBg: 'bg-slate-50',
    bulletColor: 'bg-slate-600',
    features: [
      'Manajemen Ekosistem Tenant',
      'Kontrol Lisensi & Billing Global',
      'Audit Trail & System Integrity Logs',
      'Konfigurasi Addon Platform',
      'Global Revenue & Growth Analytics',
      'Monitor Kesehatan Platform'
    ]
  },
  {
    name: 'Admin Tenant (Owner)',
    tagline: 'Nahkoda Bisnis & Strategi Produk',
    icon: 'real_estate_agent',
    iconBg: 'bg-gradient-to-br from-blue-600 to-blue-800',
    headerBg: 'bg-blue-50',
    bulletColor: 'bg-blue-600',
    features: [
      'Inventory & Procurement Management',
      'Pengaturan Harga & Diskon Pintar',
      'Manajemen Staf & Hak Akses',
      'Laporan Laba/Rugi Komprehensif',
      'Konfigurasi Outlet & Hardware',
      'Analisis Tren Pasar & Pelanggan'
    ]
  },
  {
    name: 'Supervisor',
    tagline: 'Penjaga Operasional & Integritas Shift',
    icon: 'verified_user',
    iconBg: 'bg-gradient-to-br from-violet-600 to-violet-800',
    headerBg: 'bg-violet-50',
    bulletColor: 'bg-violet-600',
    features: [
      'Otorisasi Void & Refund Transaksi',
      'Manajemen Cashbox & Tutup Shift',
      'Approval Stock Adjustment',
      'Monitoring Performa Kasir Real-time',
      'Laporan Penjualan Per Shift',
      'Resolusi Konflik Pesanan'
    ]
  },
  {
    name: 'Kasir (Cashier)',
    tagline: 'Garda Depan Pelayanan Transaksi',
    icon: 'point_of_sale',
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    headerBg: 'bg-blue-50',
    bulletColor: 'bg-blue-500',
    features: [
      'Smart POS Interface (Fast Checkout)',
      'Manajemen Keranjang & Hold Order',
      'Pencarian Produk Instan',
      'Metode Pembayaran Multi-Channel',
      'Cetak Struk Digital & Fisik',
      'Manajemen Member & Poin'
    ]
  },
  {
    name: 'Kitchen (Dapur)',
    tagline: 'Maestro Eksekusi Hidangan',
    icon: 'soup_kitchen',
    iconBg: 'bg-gradient-to-br from-orange-500 to-orange-700',
    headerBg: 'bg-orange-50',
    bulletColor: 'bg-orange-500',
    features: [
      'Kitchen Display System (KDS)',
      'Update Status Pesanan Real-time',
      'Antrian Pesanan Berdasarkan Prioritas',
      'Notifikasi Bahan Baku Menipis',
      'Integrasi Printer Order',
      'Tracking Waktu Persiapan'
    ]
  }
];

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'BASIC (Starter)',
    price: 'Rp 149rb',
    description: 'Opsi terbaik untuk UMKM yang baru memulai digitalisasi bisnis.',
    points: [
      'Hingga 50 Produk Aktif',
      'Maksimal 3 User Staf',
      '1 Outlet Operasional',
      'Cloud Backup Harian',
      'Laporan Penjualan Dasar',
      'Support Email 24 Jam'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'PRO (Growth)',
    price: 'Rp 299rb',
    description: 'Solusi lengkap untuk akselerasi bisnis dengan fitur manajemen stok lanjut.',
    points: [
      'Unlimited Produk & Kategori',
      'Hingga 10 User Staf',
      '3 Outlet Terintegrasi',
      'Advanced Inventory System',
      'Manajemen Supplier & PO',
      'Prioritas Chat Support'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: 'Rp 499rb',
    description: 'Kendali penuh untuk skema bisnis besar (Franchise/Chain) tanpa batas.',
    points: [
      'Unlimited User & Outlet',
      'Custom Domain Branding',
      'API Access & Integration',
      'Account Manager Khusus',
      'Fitur Loyalty & CRM Lanjut',
      'Service Level Agreement (SLA)'
    ],
    popular: false
  }
];

const addons = [
  {
    name: 'WhatsApp Integration',
    icon: 'message',
    description: 'Kirim struk otomatis dan notifikasi promo langsung ke WhatsApp pelanggan.',
    price: '+ Rp 50rb/bln'
  },
  {
    name: 'Custom Mobile App',
    icon: 'smartphone',
    description: 'Aplikasi Android khusus dengan brand toko Anda untuk pesanan online.',
    price: 'Mulai Rp 150rb/bln'
  },
  {
    name: 'Advanced Analytics',
    icon: 'query_stats',
    description: 'Visualisasi data AI-powered untuk prediksi stok dan tren penjualan.',
    price: '+ Rp 75rb/bln'
  },
  {
    name: 'Hardware Sync',
    icon: 'print',
    description: 'Dukungan penuh tim teknis untuk sinkronisasi printer & cash drawer.',
    price: '+ Rp 25rb/bln'
  },
  {
    name: 'Loyalty Engine',
    icon: 'redeem',
    description: 'Sistem poin, kupon, dan tier membership untuk retensi pelanggan.',
    price: '+ Rp 40rb/bln'
  },
  {
    name: 'Offline Sync Pro',
    icon: 'cloud_off',
    description: 'Jaminan transaksi tetap berjalan meski koneksi internet padam total.',
    price: 'GRATIS (Pro+)'
  }
];

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const handleConsultEnterprise = () => {
  window.open('mailto:sales@warungin.id?subject=Konsultasi Enterprise', '_blank');
};

const handleViewPlanDetail = (plan: typeof subscriptionPlans[0]) => {
  router.push(`/pricing?plan=${plan.id}`);
};

const handleAddAddon = (addon: typeof addons[0]) => {
  router.push(`/app/addons?add=${addon.name}`);
};

</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
