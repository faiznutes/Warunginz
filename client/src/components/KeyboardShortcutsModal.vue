<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in" @click.self="$emit('close')">
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-scale-in border border-slate-100 dark:border-slate-700">
      <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
           <span class="material-symbols-outlined text-blue-500">keyboard</span>
           Keyboard Shortcuts
        </h3>
        <button @click="$emit('close')" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="p-6 max-h-[70vh] overflow-y-auto space-y-6">
        <!-- General Shortcuts -->
        <div class="space-y-3">
           <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">settings</span>
              General
           </h4>
           <div class="flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
              <span class="text-slate-700 dark:text-slate-300 font-medium">Show Shortcuts</span>
              <div class="flex gap-1">
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[28px] text-center shadow-sm">?</kbd>
              </div>
           </div>
           <div class="flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
              <span class="text-slate-700 dark:text-slate-300 font-medium">Global Search</span>
              <div class="flex gap-1 items-center">
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[32px] text-center shadow-sm">Ctrl</kbd>
                 <span class="text-slate-400 text-xs">+</span>
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[28px] text-center shadow-sm">K</kbd>
              </div>
           </div>
           <div class="flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
              <span class="text-slate-700 dark:text-slate-300 font-medium">Close Modal / Cancel</span>
              <div class="flex gap-1">
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[40px] text-center shadow-sm">Esc</kbd>
              </div>
           </div>
        </div>

        <!-- Navigation Shortcuts -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
           <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">navigation</span>
              Navigation
           </h4>
           <div class="flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
              <span class="text-slate-700 dark:text-slate-300 font-medium">Search Suggestions: Navigate</span>
              <div class="flex gap-1 items-center">
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[28px] text-center shadow-sm">↑</kbd>
                 <span class="text-slate-400 text-xs">/</span>
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[28px] text-center shadow-sm">↓</kbd>
              </div>
           </div>
           <div class="flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
              <span class="text-slate-700 dark:text-slate-300 font-medium">Select Suggestion</span>
              <div class="flex gap-1">
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[50px] text-center shadow-sm">Enter</kbd>
              </div>
           </div>
        </div>

        <!-- POS Shortcuts -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
           <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">point_of_sale</span>
              POS / Actions
           </h4>
           <div class="flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
              <span class="text-slate-700 dark:text-slate-300 font-medium">Confirm / Pay</span>
              <div class="flex gap-1">
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[50px] text-center shadow-sm">Enter</kbd>
              </div>
           </div>
           <div class="flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
              <span class="text-slate-700 dark:text-slate-300 font-medium">Focus Search (POS)</span>
              <div class="flex gap-1">
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[28px] text-center shadow-sm">F2</kbd>
              </div>
           </div>
           <div class="flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
              <span class="text-slate-700 dark:text-slate-300 font-medium">Clear Selection</span>
              <div class="flex gap-1">
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[40px] text-center shadow-sm">Esc</kbd>
              </div>
           </div>
        </div>

        <!-- Editing Shortcuts -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
           <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">edit</span>
              Editing
           </h4>
           <div class="flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
              <span class="text-slate-700 dark:text-slate-300 font-medium">Save Inline Edit</span>
              <div class="flex gap-1">
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[50px] text-center shadow-sm">Enter</kbd>
              </div>
           </div>
           <div class="flex justify-between items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
              <span class="text-slate-700 dark:text-slate-300 font-medium">Cancel Inline Edit</span>
              <div class="flex gap-1">
                 <kbd class="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 min-w-[40px] text-center shadow-sm">Esc</kbd>
              </div>
           </div>
        </div>
      </div>
      
      <div class="p-4 bg-slate-50 dark:bg-slate-900/50 text-center text-xs text-slate-400">
         Press <kbd class="font-bold">Esc</kbd> to close this window
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
}>();

defineEmits(['close']);
</script>
