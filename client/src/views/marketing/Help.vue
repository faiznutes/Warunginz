<template>
  <div class="min-h-screen font-display bg-gradient-to-br from-[#f8f9fa] via-[#eef2f6] to-[#dce5f2] dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e]">
    <!-- Hero Section -->
    <section class="container mx-auto px-4 py-16 relative">
      <!-- Background Gradients -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
         <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50"></div>
      </div>
      
      <div class="flex flex-col items-center justify-center text-center max-w-4xl mx-auto relative z-10">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 px-2">
           Pusat Bantuan <span class="text-blue-600">Warungin</span>
        </h1>
        <p class="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl px-4">
          Temukan jawaban, panduan, dan tips untuk memaksimalkan bisnis Anda.
        </p>
        <div class="w-full max-w-2xl">
          <div class="relative group z-50">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari artikel bantuan... (Contoh: 'Cara tambah produk')"
              class="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition text-lg shadow-sm group-hover:shadow-md"
              @input="handleSearch"
              @keyup.enter="goToFirstResult"
            />
            <span class="material-symbols-outlined absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition">search</span>
            
            <!-- Search Results Dropdown -->
            <div 
              v-if="searchQuery && searchResults.length > 0"
              class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[60]"
            >
              <router-link
                v-for="result in searchResults.slice(0, 5)"
                :key="result.slug"
                :to="`/help/${result.slug}`"
                class="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                @click="clearSearch"
              >
                <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-blue-600">{{ result.icon }}</span>
                </div>
                <div class="text-left">
                  <h4 class="font-bold text-slate-900 dark:text-white">{{ result.title }}</h4>
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ result.description }}</p>
                </div>
              </router-link>
              <div v-if="searchResults.length > 5" class="p-3 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-900">
                +{{ searchResults.length - 5 }} artikel lainnya
              </div>
            </div>
            
            <!-- No Results -->
            <div 
              v-if="searchQuery && searchResults.length === 0"
              class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 text-center z-[60]"
            >
              <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
              <p class="text-slate-500">Tidak ada artikel ditemukan untuk "{{ searchQuery }}"</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="container mx-auto px-4 py-12 pb-20">
      <div class="max-w-6xl mx-auto">
        <!-- Categories -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <router-link 
            v-for="category in categories"
            :key="category.id"
            :to="`/help/category/${category.id}`"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 hover:shadow-xl hover:border-blue-500/50 transition cursor-pointer group"
          >
            <div 
              class="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
              :class="category.bgColor"
            >
               <span class="material-symbols-outlined text-3xl transition-colors" :class="category.iconColor">{{ category.icon }}</span>
            </div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">{{ category.label }}</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm">{{ category.description }}</p>
            <div class="mt-4 text-xs text-blue-600 font-bold">{{ getArticleCountByCategory(category.id) }} artikel</div>
          </router-link>
        </div>

        <!-- Popular Articles -->
        <div class="mb-16">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
             <span class="material-symbols-outlined text-blue-600">trending_up</span>
             Panduan Populer
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <router-link 
              v-for="article in popularArticles"
              :key="article.slug"
              :to="`/help/${article.slug}`"
              class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition group"
            >
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-blue-600 text-xl">{{ article.icon }}</span>
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 transition">{{ article.title }}</h3>
                  <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">{{ article.description }}</p>
                  <span class="text-blue-600 text-sm font-bold flex items-center gap-1">
                    Baca Selengkapnya 
                    <span class="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </span>
                </div>
              </div>
            </router-link>
          </div>
        </div>



        <!-- Contact Support -->
        <div class="bg-blue-500 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
           <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 opacity-50"></div>
           <div class="relative z-10">
             <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <span class="material-symbols-outlined text-4xl">support_agent</span>
             </div>
             <h2 class="text-2xl sm:text-3xl font-bold mb-4">Masih Butuh Bantuan?</h2>
             <p class="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
               Tim support kami siap membantu Anda menyelesaikan masalah secepat mungkin.
             </p>
             <div class="flex flex-col sm:flex-row gap-4 justify-center">
               <router-link
                 to="/contact"
                 class="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-slate-100 transition font-bold shadow-lg"
               >
                 Hubungi Support
               </router-link>
               <a
                 href="mailto:support@warungin.com"
                 class="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition font-bold"
               >
                 Kirim Email
               </a>
             </div>
           </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSEO } from '../../composables/useSEO';
import { helpArticles, searchArticles, getArticlesByCategory, type HelpArticle } from '../../data/articles';

const router = useRouter();

useSEO({
  title: 'Pusat Bantuan Warungin',
  description: 'FAQ dan panduan penggunaan sistem kasir Warungin.',
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const searchQuery = ref('');

const categories = [
  { 
    id: 'getting-started', 
    label: 'Panduan Memulai', 
    description: 'Setup akun, outlet pertama, dan onboarding.',
    icon: 'rocket_launch',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-500',
    iconColor: 'text-blue-600 group-hover:text-white'
  },
  { 
    id: 'features', 
    label: 'Fitur Sistem', 
    description: 'Panduan lengkap manajemen produk, stok, dan kasir.',
    icon: 'featured_play_list',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30 group-hover:bg-purple-600',
    iconColor: 'text-purple-600 dark:text-purple-400 group-hover:text-white'
  },
  { 
    id: 'billing', 
    label: 'Tagihan & Paket', 
    description: 'Info paket langganan, upgrade, dan invoice.',
    icon: 'receipt_long',
    bgColor: 'bg-green-50 dark:bg-green-900/30 group-hover:bg-green-600',
    iconColor: 'text-green-600 dark:text-green-400 group-hover:text-white'
  },
  { 
    id: 'troubleshooting', 
    label: 'Troubleshooting', 
    description: 'Solusi kendala teknis dan cara mengatasinya.',
    icon: 'build',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30 group-hover:bg-orange-600',
    iconColor: 'text-orange-600 dark:text-orange-400 group-hover:text-white'
  },
  { 
    id: 'api', 
    label: 'API & Integrasi', 
    description: 'Dokumentasi teknis untuk developer.',
    icon: 'api',
    bgColor: 'bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-600',
    iconColor: 'text-slate-600 dark:text-slate-300 group-hover:text-white'
  },
  { 
    id: 'security', 
    label: 'Keamanan & Privasi', 
    description: 'Standar keamanan data dan kebijakan privasi.',
    icon: 'security',
    bgColor: 'bg-red-50 dark:bg-red-900/30 group-hover:bg-red-600',
    iconColor: 'text-red-600 dark:text-red-400 group-hover:text-white'
  },
];

const popularArticles = computed(() => {
  // Return first 4 articles as "popular"
  return helpArticles.slice(0, 4);
});

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return [];
  return searchArticles(searchQuery.value);
});

const handleSearch = () => {
  // Real-time search is handled by computed
};

const goToFirstResult = () => {
  if (searchResults.value.length > 0) {
    router.push(`/help/${searchResults.value[0].slug}`);
    clearSearch();
  }
};

const clearSearch = () => {
  searchQuery.value = '';
};

const getArticleCountByCategory = (categoryId: string) => {
  return getArticlesByCategory(categoryId as HelpArticle['category']).length;
};
</script>
