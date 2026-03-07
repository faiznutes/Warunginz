<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="close"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-700 sm:mx-0 sm:h-10 sm:w-10">
                <span class="material-symbols-outlined text-slate-600 dark:text-slate-300">settings</span>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-slate-900 dark:text-white" id="modal-title">
                  Kitchen Settings
                </h3>
                <div class="mt-4 space-y-4">
                  <!-- Store Selector (Only for Admin/SPV) -->
                  <div v-if="canSwitchStore">
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Select Store
                    </label>
                    <StoreSelector @store-changed="handleStoreChange" />
                  </div>
                  
                  <!-- Other settings can go here -->
                  <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                     <span class="text-sm text-slate-700 dark:text-slate-300">Sound Notifications</span>
                     <div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" checked/>
                        <label for="toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-blue-500 cursor-pointer"></label>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-slate-700/30 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              @click="close"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import StoreSelector from '../StoreSelector.vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'store-changed']);
const authStore = useAuthStore();

const canSwitchStore = computed(() => {
  return ['ADMIN_TENANT', 'SUPER_ADMIN', 'SUPERVISOR'].includes(authStore.user?.role || '');
});

const close = () => {
  emit('close');
};

const handleStoreChange = () => {
  emit('store-changed');
};
</script>

<style scoped>
.toggle-checkbox:checked {
  right: 0;
  border-color: #10b981;
}
.toggle-checkbox:checked + .toggle-label {
  background-color: #10b981;
}
.toggle-checkbox {
  right: 0;
  z-index: 1;
  border-color: #e5e7eb;
  transition: all 0.3s;
}
.toggle-label {
  width: 100%;
  background-color: #e5e7eb;
}
</style>
