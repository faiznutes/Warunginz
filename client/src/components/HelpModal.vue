<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
    @click.self="$emit('close')"
  >
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-scale-in border border-slate-200 dark:border-slate-700">
      <div class="p-6 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <span class="material-symbols-outlined text-[24px]">help</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ helpContent.title }}</h3>
              <p class="text-sm text-slate-500">Bantuan Konteks</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-400"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
      
      <div class="p-6 space-y-4">
        <div class="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {{ helpContent.content }}
          </p>
        </div>
        
        <!-- Video Tutorials Section -->
        <div v-if="helpContent.videoUrl || (helpContent.videoUrls && helpContent.videoUrls.length > 0)" class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-emerald-200 dark:border-blue-800">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-symbols-outlined text-blue-600 text-[24px]">play_circle</span>
            <h4 class="font-bold text-slate-900 dark:text-white">Video Tutorial</h4>
          </div>
          
          <!-- Single Video (legacy support) -->
          <a
            v-if="helpContent.videoUrl && !helpContent.videoUrls"
            :href="helpContent.videoUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-emerald-200 dark:border-blue-800 hover:border-emerald-300 dark:hover:border-blue-700 transition-all group"
          >
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-blue-600 text-[20px]">play_arrow</span>
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900 dark:text-white">Tonton Video Tutorial</p>
                <p class="text-xs text-slate-500">Pelajari lebih lanjut tentang fitur ini</p>
              </div>
            </div>
            <span class="material-symbols-outlined text-blue-600 text-[20px] group-hover:translate-x-1 transition-transform">open_in_new</span>
          </a>
          
          <!-- Multiple Videos -->
          <div v-if="helpContent.videoUrls && helpContent.videoUrls.length > 0" class="space-y-2">
            <a
              v-for="(video, index) in helpContent.videoUrls"
              :key="index"
              :href="video.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-emerald-200 dark:border-blue-800 hover:border-emerald-300 dark:hover:border-blue-700 transition-all group"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <span class="material-symbols-outlined text-blue-600 text-[20px]">play_arrow</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ video.title }}</p>
                  <p v-if="video.duration" class="text-xs text-slate-500">{{ video.duration }}</p>
                </div>
              </div>
              <span class="material-symbols-outlined text-blue-600 text-[20px] group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2">open_in_new</span>
            </a>
          </div>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-blue-600 text-[20px] flex-shrink-0">lightbulb</span>
            <div>
              <h4 class="font-bold text-slate-900 dark:text-white mb-1">Tips</h4>
              <ul class="text-sm text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                <li>Gunakan keyboard shortcuts (tekan <kbd class="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 text-xs font-bold">?</kbd>) untuk melihat semua shortcuts</li>
                <li>Gunakan <kbd class="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 text-xs font-bold">Ctrl+K</kbd> untuk global search</li>
                <li>Klik pada field untuk edit langsung (inline editing)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div class="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
        <button
          @click="$emit('close')"
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors"
        >
          Mengerti
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
  helpContent: {
    title: string;
    content: string;
    videoUrl?: string;
    videoUrls?: Array<{ title: string; url: string; duration?: string }>;
  };
}

defineProps<Props>();
defineEmits<{
  close: [];
}>();
</script>

