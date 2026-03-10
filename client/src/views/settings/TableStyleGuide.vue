<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 md:px-8 font-display animate-fade-in">
    <div class="w-full space-y-12">
      <!-- Header -->
      <div class="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-700 pb-8">
        <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Table System</h1>
        <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">Standardized Data Tables & Lists (Reskin V3)</p>
      </div>

      <!-- Basic Table Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-blue-600">table_chart</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Basic Data Table</h2>
        </div>
        
        <BaseCard title="Users List" subtitle="Example of a standard data table with actions" :padding="'none'">
          <template #actions>
             <BaseButton size="sm" icon="add">Add User</BaseButton>
          </template>
          
          <BaseTable :loading="loading" :is-empty="users.length === 0">
            <template #toolbar>
               <div class="flex gap-4">
                  <BaseInput placeholder="Search users..." icon="search" class="w-64" />
                  <BaseSelect placeholder="Filter Role" :options="['Admin', 'User', 'Guest']" class="w-40" />
               </div>
            </template>

            <BaseTableHead 
              :columns="columns" 
              :actions="true" 
              :sort-key="sortKey" 
              :sort-order="sortOrder"
              @sort="handleSort" 
            />
            <tbody>
              <BaseTableRow v-for="user in users" :key="user.id" hover stripe>
                <BaseTableCell>
                   <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                         {{ user.name.charAt(0) }}
                      </div>
                      <div class="flex flex-col">
                         <span class="font-bold text-slate-900 dark:text-white">{{ user.name }}</span>
                         <span class="text-xs text-slate-500">{{ user.email }}</span>
                      </div>
                   </div>
                </BaseTableCell>
                <BaseTableCell>{{ user.role }}</BaseTableCell>
                <BaseTableCell>
                   <BaseBadge :variant="user.status === 'Active' ? 'success' : 'neutral'" dot>{{ user.status }}</BaseBadge>
                </BaseTableCell>
                <BaseTableCell>{{ user.lastLogin }}</BaseTableCell>
                 <BaseTableCell>
                   <BaseTableActions 
                      view edit del 
                      @view="log('View', user)"
                      @edit="log('Edit', user)"
                      @delete="log('Delete', user)"
                   />
                </BaseTableCell>
              </BaseTableRow>
            </tbody>
            
            <template #footer>
               <BasePagination 
                 :total="100" 
                 :limit="10" 
                 :current-page="currentPage" 
                 @page-change="currentPage = $event" 
               />
            </template>
          </BaseTable>
        </BaseCard>
      </section>

      <!-- Empty State Example -->
      <section class="space-y-6">
        <BaseCard title="Empty State" subtitle="Table visualization when no data is available">
          <BaseTable :is-empty="true">
             <template #empty-action>
                <BaseButton icon="add">Create New Item</BaseButton>
             </template>
          </BaseTable>
        </BaseCard>
      </section>
      
       <!-- Loading State Example -->
      <section class="space-y-6">
        <BaseCard title="Loading State" subtitle="Table visualization during data fetch">
          <div class="h-64 relative">
             <BaseTable :loading="true">
                <BaseTableHead :columns="columns" />
                <tbody>
                   <BaseTableRow><BaseTableCell colspan="4">Data row</BaseTableCell></BaseTableRow>
                   <BaseTableRow><BaseTableCell colspan="4">Data row</BaseTableCell></BaseTableRow>
                   <BaseTableRow><BaseTableCell colspan="4">Data row</BaseTableCell></BaseTableRow>
                </tbody>
             </BaseTable>
          </div>
        </BaseCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseSelect from '../../components/ui/BaseSelect.vue';
import BaseBadge from '../../components/ui/BaseBadge.vue';
// Table Components
import BaseTable from '../../components/ui/table/BaseTable.vue';
import BaseTableHead from '../../components/ui/table/BaseTableHead.vue';
import BaseTableRow from '../../components/ui/table/BaseTableRow.vue';
import BaseTableCell from '../../components/ui/table/BaseTableCell.vue';
import BasePagination from '../../components/ui/table/BasePagination.vue';
import BaseTableActions from '../../components/ui/table/BaseTableActions.vue';

const loading = ref(false);
const currentPage = ref(1);
const sortKey = ref('name');
const sortOrder = ref<'asc'|'desc'>('asc');

const columns = [
  { key: 'name', label: 'User', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'lastLogin', label: 'Last Login', sortable: true },
];

const users = ref([
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2 mins ago' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', lastLogin: '1 hour ago' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2 days ago' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Admin', status: 'Active', lastLogin: 'Just now' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '1 week ago' },
]);

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const log = (action: string, item: any) => {
  console.log(action, item);
};
</script>
