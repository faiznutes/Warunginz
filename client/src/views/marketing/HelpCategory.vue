<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-display">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-8">
      <nav class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <router-link to="/help" class="hover:text-blue-600 transition flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">help_center</span>
          Pusat Bantuan
        </router-link>
        <span class="material-symbols-outlined text-[14px]">chevron_right</span>
        <span v-if="category" class="text-slate-900 dark:text-white font-medium">{{ category.label }}</span>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-slate-500">Memuat kategori...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="!category" class="container mx-auto px-4 py-20 text-center">
      <div class="bg-slate-100 dark:bg-slate-800 p-8 rounded-2xl inline-block mb-6">
        <span class="material-symbols-outlined text-6xl text-slate-400">folder_off</span>
      </div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Kategori Tidak Ditemukan</h1>
      <p class="text-slate-500 mb-8">Maaf, kategori yang Anda cari tidak tersedia.</p>
      <router-link 
        to="/help" 
        class="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition"
      >
        <span class="material-symbols-outlined">arrow_back</span>
        Kembali ke Pusat Bantuan
      </router-link>
    </div>

    <!-- Category Content -->
    <div v-else class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <div 
            class="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            :class="category.bgColor"
          >
            <span class="material-symbols-outlined text-4xl" :class="category.iconColor">{{ category.icon }}</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {{ category.label }}
          </h1>
          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {{ category.description }}
          </p>
        </div>

        <!-- Article List -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <router-link 
            v-for="article in articles"
            :key="article.slug"
            :to="`/help/${article.slug}`"
            class="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-lg transition flex items-start gap-4"
          >
            <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition">
              <span class="material-symbols-outlined text-blue-600 text-xl">{{ article.icon }}</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition">{{ article.title }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{{ article.description }}</p>
              <span class="text-blue-600 text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                Baca Selengkapnya 
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </router-link>
        </div>
        
        <div v-if="articles.length === 0" class="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
           <p class="text-slate-500">Belum ada artikel di kategori ini.</p>
        </div>

        <!-- Need More Help -->
        <div class="bg-blue-500 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-50"></div>
           <div class="relative z-10">
             <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <span class="material-symbols-outlined text-4xl">support_agent</span>
             </div>
             <h2 class="text-2xl sm:text-3xl font-bold mb-4">Masih Butuh Bantuan?</h2>
             <p class="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
               Tim support kami siap membantu Anda menyelesaikan masalah.
             </p>
             <router-link
               to="/contact"
               class="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-slate-100 transition font-bold shadow-lg"
             >
               Hubungi Support
             </router-link>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getArticlesByCategory, type HelpArticle } from '../../data/articles';
import { useSEO } from '../../composables/useSEO';

const route = useRoute();
const loading = ref(true);
const category = ref<any>(null);
const articles = ref<HelpArticle[]>([]);

const categories = [
  { 
    id: 'getting-started', 
    label: 'Panduan Memulai', 
    description: 'Setup akun, outlet pertama, dan onboarding.',
    icon: 'rocket_launch',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600' // Unified color
  },
  { 
    id: 'features', 
    label: 'Fitur Sistem', 
    description: 'Panduan lengkap manajemen produk, stok, dan kasir.',
    icon: 'featured_play_list',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  },
  { 
    id: 'billing', 
    label: 'Tagihan & Paket', 
    description: 'Info paket langganan, upgrade, dan invoice.',
    icon: 'receipt_long',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  { 
    id: 'troubleshooting', 
    label: 'Troubleshooting', 
    description: 'Solusi kendala teknis dan cara mengatasinya.',
    icon: 'build',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  { 
    id: 'api', 
    label: 'API & Integrasi', 
    description: 'Dokumentasi teknis untuk developer.',
    icon: 'api',
    bgColor: 'bg-slate-100 dark:bg-slate-700',
    iconColor: 'text-slate-600 dark:text-slate-300'
  },
  { 
    id: 'security', 
    label: 'Keamanan & Privasi', 
    description: 'Standar keamanan data dan kebijakan privasi.',
    icon: 'security',
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400'
  },
];

const loadCategory = () => {
  loading.value = true;
  const categoryId = route.params.categoryId as string;
  category.value = categories.find(c => c.id === categoryId);
  
  if (category.value) {
    articles.value = getArticlesByCategory(categoryId as any);
    useSEO({
      title: `${category.value.label} - Pusat Bantuan`,
      description: category.value.description,
    });
  }
  
  loading.value = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

watch(() => route.params.categoryId, () => {
  loadCategory();
});

onMounted(() => {
  loadCategory();
});
</script>
