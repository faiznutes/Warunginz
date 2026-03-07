<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pengaturan Kata Sandi</h1>
      <p class="text-slate-500 dark:text-slate-400 font-medium">Ubah kata sandi dan kelola kebijakan keamanan akun Anda.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Change Password Card -->
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-8">
          <div class="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl shadow-sm">
            <span class="material-symbols-outlined text-[24px]">lock</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Ubah Kata Sandi</h3>
            <p class="text-sm font-medium text-slate-500">Perbarui kata sandi keamanan Anda</p>
          </div>
        </div>

        <form @submit.prevent="updatePassword" class="space-y-6">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kata Sandi Saat Ini <span class="text-red-500">*</span></label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              required
              placeholder="Masukkan kata sandi saat ini"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kata Sandi Baru <span class="text-red-500">*</span></label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              required
              placeholder="Masukkan kata sandi baru"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            />
            <p class="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[14px]">info</span>
              Min 8 karakter, huruf besar, kecil, angka, dan simbol
            </p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Konfirmasi Kata Sandi Baru <span class="text-red-500">*</span></label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              placeholder="Ulangi kata sandi baru"
              class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            />
            <p v-if="passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword" class="text-xs text-red-600 font-bold mt-2 flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[14px]">cancel</span>
              Kata sandi tidak cocok
            </p>
          </div>

          <button
            type="submit"
            :disabled="updating || passwordForm.newPassword !== passwordForm.confirmPassword"
            class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm transform active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
          >
            <div v-if="updating" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span class="material-symbols-outlined text-[20px]" v-else>lock_reset</span>
            {{ updating ? 'Memperbarui...' : 'Perbarui Kata Sandi' }}
          </button>
        </form>
      </div>

      <!-- Password Policy Info Card -->
      <div class="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl">
            <span class="material-symbols-outlined text-[24px]">policy</span>
          </div>
          <div>
              <h3 class="text-xl font-bold text-indigo-900 dark:text-indigo-100">Kebijakan Kata Sandi</h3>
              <p class="text-sm font-medium text-indigo-600/70 dark:text-indigo-300/70">Standar keamanan yang harus dipenuhi</p>
          </div>
        </div>
        <ul class="space-y-4 text-sm font-medium text-indigo-900 dark:text-indigo-200">
          <li class="flex items-center gap-3 p-3 bg-white/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <span class="material-symbols-outlined text-indigo-600 text-[20px]">check_circle</span>
            <span>Minimal 8 karakter</span>
          </li>
          <li class="flex items-center gap-3 p-3 bg-white/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <span class="material-symbols-outlined text-indigo-600 text-[20px]">check_circle</span>
            <span>Harus mengandung huruf besar (A-Z)</span>
          </li>
          <li class="flex items-center gap-3 p-3 bg-white/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <span class="material-symbols-outlined text-indigo-600 text-[20px]">check_circle</span>
            <span>Harus mengandung huruf kecil (a-z)</span>
          </li>
          <li class="flex items-center gap-3 p-3 bg-white/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <span class="material-symbols-outlined text-indigo-600 text-[20px]">check_circle</span>
            <span>Harus mengandung angka (0-9)</span>
          </li>
          <li class="flex items-center gap-3 p-3 bg-white/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <span class="material-symbols-outlined text-indigo-600 text-[20px]">check_circle</span>
            <span>Harus mengandung simbol (!@#$%^&*)</span>
          </li>
          <li class="flex items-center gap-3 p-3 bg-white/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <span class="material-symbols-outlined text-indigo-600 text-[20px]">check_circle</span>
            <span>Tidak boleh menggunakan kata sandi lama</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { success: showSuccess, error: showError } = useNotification();
const updating = ref(false);

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    await showError('Kata sandi baru tidak cocok');
    return;
  }

  updating.value = true;

  try {
    await api.post('/password/update', {
      oldPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
      confirmPassword: passwordForm.value.confirmPassword,
    });

    await showSuccess('Kata sandi berhasil diperbarui');
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  } catch (error: any) {
    console.error('Error updating password:', error);
    await showError(error.response?.data?.message || 'Gagal memperbarui kata sandi');
  } finally {
    updating.value = false;
  }
};
</script>
