<template>
  <aside class="hidden lg:flex flex-col items-center py-6 nav-emerald-tint border-r border-blue-100/60 gap-4 overflow-y-auto no-scrollbar z-20">
    <button 
      v-for="cat in safeCategories" 
      :key="cat"
      @click="$emit('update:selectedCategory', cat === 'SEMUA' ? '' : cat)"
      class="group flex flex-col items-center gap-1 w-[70px] py-3 rounded-xl transition-all relative transform duration-200"
      :class="(selectedCategory === cat || (cat === 'SEMUA' && !selectedCategory)) ? 'category-active bg-white shadow-md shadow-blue-500/10 text-primary scale-105' : 'hover:bg-white hover:shadow-sm hover:text-primary text-slate-400 hover:scale-105'"
    >
      <span class="material-symbols-outlined text-2xl relative z-10 transition-transform group-hover:scale-110">
        {{ getCategoryIcon(cat) }}
      </span>
      <span 
        class="text-[10px] font-medium text-center w-full truncate px-1 transition-colors group-hover:font-bold"
        :class="(selectedCategory === cat || (cat === 'SEMUA' && !selectedCategory)) ? 'font-bold' : ''"
      >
        {{ cat === 'SEMUA' ? 'All' : cat }}
      </span>
    </button>
    
    <div class="mt-auto flex flex-col items-center gap-4 w-full px-2">
      <div class="h-px w-10 bg-emerald-200/50"></div>
      <button 
        @click="$emit('logout')"
        class="group flex flex-col items-center gap-1 w-full py-2 hover:bg-red-50 rounded-xl transition-all"
      >
          <span class="material-symbols-outlined text-red-400 group-hover:text-red-500">logout</span>
          <span class="text-[10px] font-medium text-red-400 group-hover:text-red-500">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  categories: string[];
  selectedCategory: string;
}>(), {
  categories: () => [],
  selectedCategory: '',
});

defineEmits<{
  (e: 'update:selectedCategory', category: string): void;
  (e: 'logout'): void;
}>();

const safeCategories = computed(() => (Array.isArray(props.categories) ? props.categories : []));

const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    'MAKANAN': 'restaurant',
    'MINUMAN': 'local_bar',
    'SNACK': 'cookie',
    'SEMUA': 'grid_view',
    'ALL': 'grid_view',
    'DESSERT': 'icecream',
    'KOPI': 'coffee',
    'NON-KOPI': 'local_drink',
    'PAKET': 'lunch_dining'
  };
  return icons[category.toUpperCase()] || 'category';
};
</script>
