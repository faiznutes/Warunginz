<template>
  <div class="flex flex-col gap-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-col">
        <h2 class="text-3xl font-bold text-[#0d141b] dark:text-white tracking-tight">Receipt Templates</h2>
        <p class="text-[#4c739a] dark:text-slate-400 mt-1">Manage receipt templates for various paper sizes.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium text-sm"
      >
        <span class="material-symbols-outlined text-[20px]">add</span>
        <span>Add Template</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-[#4c739a] font-medium">Loading templates...</p>
      </div>
    </div>

    <!-- Templates List -->
    <div v-else class="space-y-6">
      <div v-if="templates.length === 0" class="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <span class="material-symbols-outlined text-[64px] text-slate-300 mb-4">receipt_long</span>
        <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-2">No Templates Yet</h3>
        <p class="text-[#4c739a] text-center max-w-md mb-4">Create your first receipt template to customize how receipts look.</p>
        <button
          @click="showCreateModal = true"
          class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-medium text-sm"
        >
          <span class="material-symbols-outlined text-[20px]">add</span>
          Create First Template
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="template in templates"
          :key="template.id"
          class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 p-6 transition hover:shadow-lg"
          :class="template.isDefault ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-100 dark:border-slate-700 hover:border-primary/50'"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-bold text-[#0d141b] dark:text-white mb-1">{{ template.name }}</h3>
              <p class="text-sm text-[#4c739a] mb-2">{{ template.templateType }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full"
                  :class="template.paperSize === 'A4' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'"
                >
                  <span class="material-symbols-outlined text-[14px]">description</span>
                  {{ template.paperSize }}
                </span>
                <span
                  v-if="template.isDefault"
                  class="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold bg-primary text-white rounded-full"
                >
                  <span class="material-symbols-outlined text-[14px]">check_circle</span>
                  Default
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 mt-4">
            <button
              @click="previewTemplate(template)"
              class="flex-1 px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">visibility</span>
              Preview
            </button>
            <button
              @click="editTemplate(template)"
              class="flex-1 px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition flex items-center justify-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">edit</span>
              Edit
            </button>
            <button
              v-if="!template.isDefault"
              @click="setAsDefault(template.id)"
              class="px-3 py-2 text-sm bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition"
              title="Set as Default"
            >
              <span class="material-symbols-outlined text-[18px]">check</span>
            </button>
            <button
              v-if="!template.isDefault"
              @click="deleteTemplate(template.id)"
              class="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition"
              title="Delete"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || editingTemplate"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-[#0d141b] dark:text-white">
              {{ editingTemplate ? 'Edit Template' : 'Create New Template' }}
            </h3>
            <button
              @click="closeModal"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <span class="material-symbols-outlined text-[#4c739a]">close</span>
            </button>
          </div>

          <form @submit.prevent="saveTemplate" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Template Name *</label>
                <input
                  v-model="templateForm.name"
                  type="text"
                  required
                  placeholder="e.g. Thermal 58mm Receipt"
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Template Type *</label>
                <select
                  v-model="templateForm.templateType"
                  required
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="DEFAULT">Default</option>
                  <option value="MODERN">Modern</option>
                  <option value="MINIMAL">Minimal</option>
                  <option value="DETAILED">Detailed</option>
                  <option value="COMPACT">Compact</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-[#4c739a] uppercase tracking-wider mb-2">Paper Size *</label>
                <select
                  v-model="templateForm.paperSize"
                  required
                  class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="A4">A4</option>
                  <option value="THERMAL_58">Thermal 58mm</option>
                  <option value="THERMAL_80">Thermal 80mm</option>
                </select>
              </div>
            </div>

            <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 class="font-bold text-[#0d141b] dark:text-white mb-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">format_align_center</span>
                Header Settings
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="templateForm.header.showName"
                    class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Show Store Name</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="templateForm.header.showAddress"
                    class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Show Address</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="templateForm.header.showPhone"
                    class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Show Phone</span>
                </label>
              </div>
            </div>

            <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 class="font-bold text-[#0d141b] dark:text-white mb-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">list</span>
                Field Settings
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.fields.showOrderNumber" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Order Number</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.fields.showDate" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Date</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.fields.showTime" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Time</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.fields.showCustomer" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Customer</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.fields.showItems" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Items</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.fields.showSubtotal" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Subtotal</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.fields.showDiscount" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Discount</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.fields.showTotal" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Total</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.fields.showPaymentMethod" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Payment Method</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.fields.showChange" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Change</span>
                </label>
              </div>
            </div>

            <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
              <h4 class="font-bold text-[#0d141b] dark:text-white mb-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">format_align_justify</span>
                Footer Settings
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.footer.showThankYou" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Thank You Message</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" v-model="templateForm.footer.showContact" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span class="text-sm text-[#0d141b] dark:text-slate-300">Contact Info</span>
                </label>
              </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-[#0d141b] dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <div v-if="saving" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ saving ? 'Saving...' : 'Save Template' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="previewingTemplate"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="previewingTemplate = null"
    >
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-[#0d141b] dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">visibility</span>
              Preview: {{ previewingTemplate.name }}
            </h3>
            <button
              @click="previewingTemplate = null"
              class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <span class="material-symbols-outlined text-[#4c739a]">close</span>
            </button>
          </div>
          <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
            <div class="bg-white dark:bg-slate-800 rounded-xl p-4 max-w-md mx-auto border-2 border-dashed border-slate-300 dark:border-slate-600">
              <div class="flex flex-col items-center gap-2 text-center">
                <span class="material-symbols-outlined text-[48px] text-slate-300">receipt_long</span>
                <p class="text-[#4c739a] text-sm">Preview will be displayed here</p>
                <p class="text-slate-400 text-xs">Template: {{ previewingTemplate.templateType }} - {{ previewingTemplate.paperSize }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError, confirm: showConfirm } = useNotification();

const loading = ref(true);
const saving = ref(false);
const templates = ref<any[]>([]);
const showCreateModal = ref(false);
const editingTemplate = ref<any>(null);
const previewingTemplate = ref<any>(null);

const templateForm = ref({
  name: '',
  templateType: 'DEFAULT',
  paperSize: 'A4',
  header: {
    showName: true,
    showAddress: true,
    showPhone: false,
  },
  footer: {
    showThankYou: true,
    showContact: true,
  },
  fields: {
    showOrderNumber: true,
    showDate: true,
    showTime: false,
    showCustomer: false,
    showItems: true,
    showSubtotal: true,
    showDiscount: true,
    showTotal: true,
    showPaymentMethod: true,
    showChange: true,
  },
});

const loadTemplates = async () => {
  loading.value = true;
  try {
    const response = await api.get('/receipts/templates');
    templates.value = response.data;
  } catch (error: any) {
    console.error('Error loading templates:', error);
    await showError('Failed to load templates');
  } finally {
    loading.value = false;
  }
};

const saveTemplate = async () => {
  saving.value = true;
  try {
    if (editingTemplate.value) {
      await api.put(`/receipts/templates/${editingTemplate.value.id}`, templateForm.value);
      await showSuccess('Template updated successfully');
    } else {
      await api.post('/receipts/templates', templateForm.value);
      await showSuccess('Template added successfully');
    }
    closeModal();
    await loadTemplates();
  } catch (error: any) {
    console.error('Error saving template:', error);
    await showError(error.response?.data?.message || 'Failed to save template');
  } finally {
    saving.value = false;
  }
};

const editTemplate = (template: any) => {
  editingTemplate.value = template;
  templateForm.value = {
    name: template.name,
    templateType: template.templateType,
    paperSize: template.paperSize,
    header: template.header || {
      showName: true,
      showAddress: true,
      showPhone: false,
    },
    footer: template.footer || {
      showThankYou: true,
      showContact: true,
    },
    fields: template.fields || {
      showOrderNumber: true,
      showDate: true,
      showTime: false,
      showCustomer: false,
      showItems: true,
      showSubtotal: true,
      showDiscount: true,
      showTotal: true,
      showPaymentMethod: true,
      showChange: true,
    },
  };
  showCreateModal.value = true;
};

const previewTemplate = (template: any) => {
  previewingTemplate.value = template;
};

const setAsDefault = async (id: string) => {
  try {
    await api.post(`/receipts/templates/${id}/set-default`);
    await loadTemplates();
    await showSuccess('Template set as default');
  } catch (error: any) {
    console.error('Error setting default:', error);
    await showError('Failed to set default template');
  }
};

const deleteTemplate = async (id: string) => {
  const confirmed = await showConfirm('Are you sure you want to delete this template?');
  if (!confirmed) return;

  try {
    await api.delete(`/receipts/templates/${id}`);
    await loadTemplates();
    await showSuccess('Template deleted successfully');
  } catch (error: any) {
    console.error('Error deleting template:', error);
    await showError(error.response?.data?.message || 'Failed to delete template');
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingTemplate.value = null;
  templateForm.value = {
    name: '',
    templateType: 'DEFAULT',
    paperSize: 'A4',
    header: {
      showName: true,
      showAddress: true,
      showPhone: false,
    },
    footer: {
      showThankYou: true,
      showContact: true,
    },
    fields: {
      showOrderNumber: true,
      showDate: true,
      showTime: false,
      showCustomer: false,
      showItems: true,
      showSubtotal: true,
      showDiscount: true,
      showTotal: true,
      showPaymentMethod: true,
      showChange: true,
    },
  };
};

onMounted(() => {
  loadTemplates();
});
</script>
