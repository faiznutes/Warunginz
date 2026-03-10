<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
          @click="$emit('close')"
        ></div>

        <!-- Modal Content -->
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl transform transition-all duration-300 overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
            <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">Detail Pelanggan</h3>
            <button
              @click="$emit('close')"
              class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
            >
              <span class="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          <div v-if="customer" class="p-6 md:p-8 overflow-y-auto custom-scrollbar">
            <!-- Profile Section -->
            <div class="flex flex-col items-center text-center mb-8">
              <div class="w-24 h-24 mb-4 rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-4xl shadow-inner border border-white/50 dark:border-white/10">
                {{ customer.name.charAt(0).toUpperCase() }}
              </div>
              <h4 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">{{ customer.name }}</h4>
              <div class="flex flex-col items-center gap-1">
                <p v-if="customer.email" class="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">mail</span>
                  {{ customer.email }}
                </p>
                <p v-if="customer.phone" class="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px]">call</span>
                  {{ customer.phone }}
                </p>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 gap-4 mb-8">
              <div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 text-center">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Pesanan</span>
                <span class="text-2xl font-black text-slate-800 dark:text-white">{{ customer.totalOrders || 0 }}</span>
              </div>
              <div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 text-center">
                <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Belanja</span>
                <span class="text-2xl font-black text-blue-600 dark:text-blue-400">{{ formatCurrency(customer.totalSpent || 0) }}</span>
              </div>
            </div>

            <!-- Address Section -->
            <div v-if="customer.address" class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
              <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">location_on</span>
                Alamat
              </h5>
              <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{{ customer.address }}</p>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-6 py-5 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm flex gap-3 rounded-b-3xl">
             <button
              @click="$emit('edit', customer!)"
              class="flex-1 px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-400 hover:to-green-500 shadow-lg shadow-blue-500/20 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-[20px]">edit_square</span>
              Edit Profil
            </button>
            <button
              @click="$emit('close')"
              class="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { formatCurrency } from '../utils/formatters';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
}

interface Props {
  show: boolean;
  customer: Customer | null;
}

defineProps<Props>();

defineEmits<{
  close: [];
  edit: [customer: Customer];
}>();
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .transform,
.modal-leave-active .transform {
  transition: all 0.3s ease-out;
}

.modal-enter-from .transform,
.modal-leave-to .transform {
  opacity: 0;
  transform: scale(0.95);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
