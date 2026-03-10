<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0d141b] dark:text-white text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Suppliers</h1>
        <p class="text-[#4c739a] dark:text-slate-400">Manage suppliers for purchase orders.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Add Supplier</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search suppliers..."
            @input="loadSuppliers"
          />
        </div>
        <select
          v-model="isActiveFilter"
          @change="loadSuppliers"
          class="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="suppliers.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">local_shipping</span>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">No Suppliers Yet</h3>
      <p class="text-slate-500 text-center max-w-md mb-4">Add your first supplier to start creating purchase orders.</p>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        Add First Supplier
      </button>
    </div>

    <!-- Suppliers Table -->
    <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-100 dark:border-slate-700/50 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-900/50">
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Address</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="supplier in suppliers" :key="supplier.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <span class="material-symbols-outlined text-blue-600 text-[20px]">local_shipping</span>
                  </div>
                  <div>
                    <div class="text-sm font-medium text-slate-900 dark:text-white">{{ supplier.name }}</div>
                    <div v-if="supplier.contactPerson" class="text-xs text-slate-500">{{ supplier.contactPerson }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="supplier.email" class="text-sm text-slate-900 dark:text-white flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                  {{ supplier.email }}
                </div>
                <div v-if="supplier.phone" class="text-sm text-slate-500 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px] text-slate-400">phone</span>
                  {{ supplier.phone }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-slate-900 dark:text-white max-w-[200px] truncate">{{ supplier.address || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                  :class="supplier.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="supplier.isActive ? 'bg-green-500' : 'bg-slate-400'"></span>
                  {{ supplier.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editSupplier(supplier)"
                    class="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                    Edit
                  </button>
                  <button
                    @click="deleteSupplier(supplier)"
                    class="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-slate-500">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} results
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium text-sm"
          >
            <span class="material-symbols-outlined text-[18px]">chevron_left</span>
            Previous
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 font-medium text-sm"
          >
            Next
            <span class="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal || editingSupplier"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <span class="material-symbols-outlined">local_shipping</span>
                </div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">
                  {{ editingSupplier ? 'Edit Supplier' : 'Add Supplier' }}
                </h3>
              </div>
              <button
                @click="closeModal"
                class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>

            <form @submit.prevent="saveSupplier" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name *</label>
                <input
                  v-model="supplierForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                  <input
                    v-model="supplierForm.email"
                    type="email"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                  <input
                    v-model="supplierForm.phone"
                    type="text"
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Person</label>
                <input
                  v-model="supplierForm.contactPerson"
                  type="text"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                <textarea
                  v-model="supplierForm.address"
                  rows="3"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
                <textarea
                  v-model="supplierForm.notes"
                  rows="3"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div v-if="editingSupplier" class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <input
                  v-model="supplierForm.isActive"
                  type="checkbox"
                  id="isActive"
                  class="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="isActive" class="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
              </div>

              <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  @click="closeModal"
                  class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition font-medium shadow-lg shadow-blue-500/30"
                >
                  {{ saving ? 'Saving...' : editingSupplier ? 'Update' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
  isActive: boolean;
}

const suppliers = ref<Supplier[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const isActiveFilter = ref('');
const showCreateModal = ref(false);
const editingSupplier = ref<Supplier | null>(null);
const saving = ref(false);
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const supplierForm = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
  notes: '',
  isActive: true,
});

const loadSuppliers = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    };
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    if (isActiveFilter.value) {
      params.isActive = isActiveFilter.value === 'true';
    }
    const response = await api.get('/suppliers', { params });
    suppliers.value = response.data.data;
    pagination.value = response.data.pagination;
  } catch (error: any) {
    console.error('Error loading suppliers:', error);
    await showError('Failed to load suppliers');
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  pagination.value.page = page;
  loadSuppliers();
};

const saveSupplier = async () => {
  saving.value = true;
  try {
    if (editingSupplier.value) {
      await api.put(`/suppliers/${editingSupplier.value.id}`, supplierForm.value);
      await showSuccess('Supplier updated successfully');
    } else {
      await api.post('/suppliers', supplierForm.value);
      await showSuccess('Supplier created successfully');
    }
    closeModal();
    await loadSuppliers();
  } catch (error: any) {
    console.error('Error saving supplier:', error);
    await showError('Failed to save supplier');
  } finally {
    saving.value = false;
  }
};

const editSupplier = (supplier: Supplier) => {
  editingSupplier.value = supplier;
  supplierForm.value = {
    name: supplier.name,
    email: supplier.email || '',
    phone: supplier.phone || '',
    address: supplier.address || '',
    contactPerson: supplier.contactPerson || '',
    notes: supplier.notes || '',
    isActive: supplier.isActive,
  };
  showCreateModal.value = true;
};

const deleteSupplier = async (supplier: Supplier) => {
  const confirmed = await showConfirm(
    'Delete Supplier',
    `Are you sure you want to delete supplier "${supplier.name}"?`
  );
  if (!confirmed) return;

  try {
    await api.delete(`/suppliers/${supplier.id}`);
    await showSuccess('Supplier deleted successfully');
    await loadSuppliers();
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    await showError(error.response?.data?.message || 'Failed to delete supplier');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingSupplier.value = null;
  supplierForm.value = {
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    notes: '',
    isActive: true,
  };
};

onMounted(() => {
  loadSuppliers();
});
</script>
