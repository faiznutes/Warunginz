<template>
  <thead class="bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors">
    <tr>
      <th
        v-for="(column, index) in columns"
        :key="index"
        scope="col"
        :class="[
          'px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap transition-colors duration-200',
          column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left',
          column.width ? column.width : '',
          column.sortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 select-none group' : ''
        ]"
        @click="column.sortable && handleSort(column.key)"
      >
        <div class="flex items-center gap-1.5" :class="column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : 'justify-start'">
          <slot :name="`head-${column.key}`" :column="column">
            {{ column.label }}
          </slot>
          
          <!-- Sort Icon -->
          <span v-if="column.sortable" class="inline-flex flex-col h-3 w-3 relative ml-0.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <svg
              class="w-2 h-2 absolute -top-0.5"
              :class="sortKey === column.key && sortOrder === 'asc' ? 'text-blue-600' : 'text-slate-400'"
              fill="currentColor" viewBox="0 0 24 24"
            >
              <path d="M7 14l5-5 5 5H7z" />
            </svg>
            <svg
              class="w-2 h-2 absolute -bottom-0.5"
               :class="sortKey === column.key && sortOrder === 'desc' ? 'text-blue-600' : 'text-slate-400'"
              fill="currentColor" viewBox="0 0 24 24"
            >
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </span>
        </div>
      </th>
      <th v-if="actions" class="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right sticky right-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm border-l border-slate-100 dark:border-slate-800 z-20">
        Aksi
      </th>
    </tr>
  </thead>
</template>

<script setup lang="ts">

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

defineProps<{
  columns: Column[];
  actions?: boolean;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc' | '';
}>();

const emit = defineEmits(['sort']);

const handleSort = (key: string) => {
  emit('sort', key);
};
</script>
