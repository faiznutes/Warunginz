<template>
  <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    <slot></slot>
    
    <template v-if="!$slots.default">
      <button
        v-if="view"
        @click="$emit('view', $event)"
        class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-blue-100 dark:hover:border-slate-600"
        title="Lihat Detail"
      >
        <span class="material-symbols-outlined text-[18px]">visibility</span>
      </button>
      
      <button
        v-if="edit"
        @click="$emit('edit', $event)"
        class="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-orange-100 dark:hover:border-slate-600"
        title="Edit Data"
      >
        <span class="material-symbols-outlined text-[18px]">edit</span>
      </button>
      
      <button
        v-if="del"
        @click="$emit('delete', $event)"
        class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-slate-600"
        title="Hapus Data"
      >
        <span class="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  view?: boolean;
  edit?: boolean;
  del?: boolean;
}>();

defineEmits(['view', 'edit', 'delete']);
</script>
