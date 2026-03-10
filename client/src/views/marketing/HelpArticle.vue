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
        <span v-if="article" class="text-slate-900 dark:text-white font-medium">{{ article.title }}</span>
      </nav>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-slate-500">Memuat artikel...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="!article" class="container mx-auto px-4 py-20 text-center">
      <div class="bg-slate-100 dark:bg-slate-800 p-8 rounded-2xl inline-block mb-6">
        <span class="material-symbols-outlined text-6xl text-slate-400">article</span>
      </div>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Artikel Tidak Ditemukan</h1>
      <p class="text-slate-500 mb-8">Maaf, artikel yang Anda cari tidak tersedia.</p>
      <router-link 
        to="/help" 
        class="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition"
      >
        <span class="material-symbols-outlined">arrow_back</span>
        Kembali ke Pusat Bantuan
      </router-link>
    </div>

    <!-- Article Content -->
    <article v-else class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Article Header -->
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-600 text-2xl">{{ article.icon }}</span>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              :class="getCategoryColor(article.category)"
            >
              {{ getCategoryLabel(article.category) }}
            </span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {{ article.title }}
          </h1>
          <p class="text-lg text-slate-600 dark:text-slate-400">
            {{ article.description }}
          </p>
        </div>

        <!-- Article Body -->
        <div class="prose prose-slate dark:prose-invert prose-lg max-w-none mb-16" v-html="renderedContent"></div>

        <!-- Tags -->
        <div class="mb-12">
          <h3 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Tags</h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="tag in article.tags" 
              :key="tag"
              class="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-sm font-medium"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Related Articles -->
        <div v-if="relatedArticles.length > 0" class="border-t border-slate-200 dark:border-slate-700 pt-12">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">link</span>
            Artikel Terkait
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <router-link
              v-for="related in relatedArticles"
              :key="related.slug"
              :to="`/help/${related.slug}`"
              class="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition group"
            >
              <h4 class="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition mb-2">
                {{ related.title }}
              </h4>
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ related.description }}</p>
            </router-link>
          </div>
        </div>

        <!-- Back Button -->
        <div class="mt-12 text-center">
          <router-link 
            to="/help" 
            class="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition"
          >
            <span class="material-symbols-outlined">arrow_back</span>
            Kembali ke Pusat Bantuan
          </router-link>
        </div>
      </div>
    </article>

    <!-- Need More Help -->
    <section class="container mx-auto px-4 pb-20">
      <div class="max-w-4xl mx-auto bg-blue-500 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { marked } from 'marked';
import { getArticleBySlug, getRelatedArticles, type HelpArticle } from '../../data/articles';
import { useSEO } from '../../composables/useSEO';

const route = useRoute();
const loading = ref(true);
const article = ref<HelpArticle | undefined>(undefined);

const relatedArticles = computed(() => {
  if (!article.value) return [];
  return getRelatedArticles(article.value.slug);
});

const renderedContent = computed(() => {
  if (!article.value) return '';
  return marked(article.value.content);
});

const loadArticle = () => {
  loading.value = true;
  const slug = route.params.slug as string;
  article.value = getArticleBySlug(slug);
  loading.value = false;

  if (article.value) {
    useSEO({
      title: article.value.title,
      description: article.value.description,
    });
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'getting-started': 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    'features': 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    'billing': 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    'troubleshooting': 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    'api': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    'security': 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[category] || colors['features'];
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'getting-started': 'Panduan Memulai',
    'features': 'Fitur Sistem',
    'billing': 'Tagihan & Paket',
    'troubleshooting': 'Troubleshooting',
    'api': 'API & Integrasi',
    'security': 'Keamanan',
  };
  return labels[category] || category;
};

watch(() => route.params.slug, () => {
  loadArticle();
});

onMounted(() => {
  loadArticle();
});
</script>

<style scoped>
/* Prose styling for markdown content */
:deep(.prose) {
  --tw-prose-body: theme('colors.slate.600');
  --tw-prose-headings: theme('colors.slate.900');
  --tw-prose-links: theme('colors.emerald.600');
  --tw-prose-code: theme('colors.slate.800');
}

:deep(.prose h2) {
  @apply text-2xl font-bold mt-10 mb-4 text-slate-900 dark:text-white;
}

:deep(.prose h3) {
  @apply text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white;
}

:deep(.prose h4) {
  @apply text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-white;
}

:deep(.prose p) {
  @apply mb-4 leading-relaxed;
}

:deep(.prose ul) {
  @apply list-disc pl-6 mb-4 space-y-2;
}

:deep(.prose ol) {
  @apply list-decimal pl-6 mb-4 space-y-2;
}

:deep(.prose li) {
  @apply leading-relaxed;
}

:deep(.prose a) {
  @apply text-blue-600 hover:text-blue-700 underline transition;
}

:deep(.prose code) {
  @apply bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono;
}

:deep(.prose pre) {
  @apply bg-slate-900 dark:bg-slate-950 p-4 rounded-xl overflow-x-auto mb-4;
}

:deep(.prose pre code) {
  @apply bg-transparent p-0 text-slate-100;
}

:deep(.prose blockquote) {
  @apply border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-xl my-6 italic;
}

:deep(.prose table) {
  @apply w-full border-collapse mb-6;
}

:deep(.prose th) {
  @apply bg-slate-100 dark:bg-slate-800 text-left p-3 font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700;
}

:deep(.prose td) {
  @apply p-3 border border-slate-200 dark:border-slate-700;
}

:deep(.prose hr) {
  @apply my-8 border-slate-200 dark:border-slate-700;
}

:deep(.prose strong) {
  @apply font-bold text-slate-900 dark:text-white;
}
</style>
