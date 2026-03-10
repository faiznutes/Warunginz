<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Otentikasi Dua Faktor</h1>
      <p class="text-slate-500 dark:text-slate-400 font-medium">Tingkatkan keamanan akun Anda dengan verifikasi langkah kedua.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- 2FA Status Card -->
    <div v-else class="space-y-6">
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-2xl shadow-sm" :class="status.enabled ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'">
              <span class="material-symbols-outlined text-[24px]">{{ status.enabled ? 'verified_user' : 'security' }}</span>
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white">Status 2FA</h3>
              <p class="text-sm font-medium text-slate-500">Status keamanan akun Anda</p>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            :class="status.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="status.enabled ? 'bg-green-500' : 'bg-slate-400'"></span>
            {{ status.enabled ? 'Aktif' : 'Nonaktif' }}
          </span>
        </div>

        <div v-if="status.enabled" class="mt-6 space-y-6">
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-5">
            <div class="flex items-center gap-4">
              <div class="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-blue-600">
                 <span class="material-symbols-outlined text-[24px]">key</span>
              </div>
              <div>
                <p class="text-sm font-bold text-blue-900 dark:text-blue-100">
                  Sisa Kode Cadangan: {{ status.remainingBackupCodes }}
                </p>
                <p class="text-xs text-blue-700 dark:text-blue-300 mt-1 font-medium leading-relaxed">
                  Simpan kode cadangan di tempat aman. Gunakan jika Anda kehilangan akses ke aplikasi otentikator.
                </p>
              </div>
            </div>
          </div>

          <button
            @click="showDisableModal = true"
            class="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:scale-95"
          >
            <span class="material-symbols-outlined text-[20px]">shield_off</span>
            Nonaktifkan 2FA
          </button>
        </div>

        <div v-else class="mt-6">
          <button
            @click="startSetup"
            class="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all font-bold text-sm active:scale-95"
          >
            <span class="material-symbols-outlined text-[20px]">shield</span>
            Aktifkan 2FA
          </button>
        </div>
      </div>

      <!-- Setup Flow -->
      <div v-if="setupStep === 'generate'" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 animate-fade-in-up">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
            <span class="material-symbols-outlined text-[24px]">qr_code_scanner</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">Langkah 1: Pindai Kode QR</h3>
            <p class="text-sm font-medium text-slate-500">Pindai dengan Google Authenticator atau Authy</p>
          </div>
        </div>

        <div v-if="generating" class="text-center py-12">
          <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-500 font-medium">Membuat kode QR...</p>
        </div>

        <div v-else-if="qrData" class="space-y-6">
          <!-- QR Code -->
          <div class="flex justify-center p-6 bg-white dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-700">
            <img :src="qrData.qrCode" alt="2FA QR Code" class="rounded-lg max-w-[200px]" />
          </div>

          <!-- Manual Entry -->
          <div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Atau masukkan manual:</p>
            <div class="flex items-center gap-3">
              <code class="flex-1 bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-mono font-bold text-slate-800 dark:text-white tracking-wide">{{ qrData.secret }}</code>
              <button
                @click="copySecret"
                class="px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition text-sm font-bold flex items-center gap-2"
              >
                <span class="material-symbols-outlined text-[18px]">content_copy</span>
                Salin
              </button>
            </div>
          </div>

          <!-- Backup Codes -->
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-5">
            <div class="flex items-center gap-3 mb-4">
               <div class="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl">
                 <span class="material-symbols-outlined text-[20px]">warning</span>
               </div>
              <p class="text-sm font-bold text-amber-800 dark:text-amber-200">Kode Cadangan (Simpan ini!)</p>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <code
                v-for="(code, index) in qrData.backupCodes"
                :key="index"
                class="bg-white dark:bg-slate-800 px-3 py-2 rounded-xl text-xs font-mono font-bold text-center border border-amber-100 dark:border-amber-800/30 text-slate-700 dark:text-slate-300"
              >
                {{ code }}
              </code>
            </div>
            <button
              @click="copyBackupCodes"
              class="w-full px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
            >
              <span class="material-symbols-outlined text-[20px]">content_copy</span>
              Salin Semua Kode
            </button>
          </div>

          <!-- Verify Token -->
          <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Masukkan 6 digit kode dari aplikasi:</label>
            <input
              v-model="verificationToken"
              type="text"
              maxlength="6"
              placeholder="000000"
              class="w-full px-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center text-3xl tracking-[1em] font-mono font-bold text-slate-900 dark:text-white transition-all placeholder:tracking-normal placeholder:text-lg"
              @input="verificationToken = verificationToken.replace(/\D/g, '')"
            />
            <p v-if="verifyError" class="text-sm text-red-600 font-bold text-center flex justify-center items-center gap-1">
                 <span class="material-symbols-outlined text-[16px]">error</span>
                 {{ verifyError }}
            </p>
          </div>

          <div class="flex gap-4">
            <button
              @click="cancelSetup"
              class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-bold text-sm"
            >
              Batal
            </button>
            <button
              @click="enable2FA"
              :disabled="verificationToken.length !== 6 || enabling"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition font-bold text-sm shadow-lg shadow-blue-500/30"
            >
              {{ enabling ? 'Mengaktifkan...' : 'Aktifkan 2FA' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Disable Modal -->
    <Teleport to="body">
      <div
        v-if="showDisableModal"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
        @click.self="showDisableModal = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-white/20 animate-scale-in">
          <div class="flex items-center gap-4 mb-6">
            <div class="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl">
              <span class="material-symbols-outlined text-[28px]">shield_off</span>
            </div>
            <div>
                 <h3 class="text-2xl font-black text-slate-900 dark:text-white">Nonaktifkan 2FA</h3>
                 <p class="text-sm font-medium text-slate-500">Konfirmasi keamanan</p>
            </div>
          </div>
          
          <div class="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4 mb-6">
              <p class="text-red-800 dark:text-red-200 text-sm font-medium leading-relaxed">
                Untuk menonaktifkan Otentikasi Dua Faktor, silakan masukkan kata sandi Anda demi keamanan.
              </p>
          </div>

          <div class="space-y-6">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kata Sandi</label>
              <input
                v-model="disablePassword"
                type="password"
                placeholder="Masukkan kata sandi Anda"
                class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                @keyup.enter="disable2FA"
              />
              <p v-if="disableError" class="text-sm text-red-600 font-bold mt-2 flex items-center gap-1">
                   <span class="material-symbols-outlined text-[16px]">error</span>
                   {{ disableError }}
              </p>
            </div>

            <div class="flex gap-4">
              <button
                @click="showDisableModal = false"
                class="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition font-bold text-sm"
              >
                Batal
              </button>
              <button
                @click="disable2FA"
                :disabled="!disablePassword || disabling"
                class="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed transition font-bold text-sm shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
              >
                 <div v-if="disabling" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {{ disabling ? 'Memproses...' : 'Nonaktifkan' }}
              </button>
            </div>
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

const { success } = useNotification();

const loading = ref(true);
const status = ref({
  enabled: false,
  remainingBackupCodes: 0,
});

const setupStep = ref<'idle' | 'generate'>('idle');
const generating = ref(false);
const qrData = ref<{
  secret: string;
  qrCode: string;
  backupCodes: string[];
} | null>(null);
const verificationToken = ref('');
const verifyError = ref('');
const enabling = ref(false);

const showDisableModal = ref(false);
const disablePassword = ref('');
const disableError = ref('');
const disabling = ref(false);

const loadStatus = async () => {
  try {
    const response = await api.get('/2fa/status');
    status.value = response.data;
  } catch (error: any) {
    console.error('Error loading 2FA status:', error);
  } finally {
    loading.value = false;
  }
};

const startSetup = async () => {
  setupStep.value = 'generate';
  generating.value = true;
  verifyError.value = '';
  verificationToken.value = '';

  try {
    const response = await api.post('/2fa/generate');
    qrData.value = response.data;
  } catch (error: any) {
    console.error('Error generating 2FA secret:', error);
    verifyError.value = error.response?.data?.message || 'Gagal membuat kode QR';
  } finally {
    generating.value = false;
  }
};

const enable2FA = async () => {
  if (verificationToken.value.length !== 6) {
    verifyError.value = 'Token harus 6 digit';
    return;
  }

  enabling.value = true;
  verifyError.value = '';

  try {
    await api.post('/2fa/enable', { token: verificationToken.value });
    await loadStatus();
    setupStep.value = 'idle';
    qrData.value = null;
    verificationToken.value = '';
    
    await success('2FA berhasil diaktifkan!', 'Sukses');
  } catch (err: any) {
    console.error('Error enabling 2FA:', err);
    verifyError.value = err.response?.data?.message || 'Token tidak valid';
  } finally {
    enabling.value = false;
  }
};

const cancelSetup = () => {
  setupStep.value = 'idle';
  qrData.value = null;
  verificationToken.value = '';
  verifyError.value = '';
};

const disable2FA = async () => {
  if (!disablePassword.value) {
    disableError.value = 'Kata sandi diperlukan';
    return;
  }

  disabling.value = true;
  disableError.value = '';

  try {
    await api.post('/2fa/disable', { password: disablePassword.value });
    await loadStatus();
    showDisableModal.value = false;
    disablePassword.value = '';
    
    await success('2FA berhasil dinonaktifkan', 'Sukses');
  } catch (err: any) {
    console.error('Error disabling 2FA:', err);
    disableError.value = err.response?.data?.message || 'Kata sandi salah';
  } finally {
    disabling.value = false;
  }
};

const copySecret = async () => {
  if (qrData.value) {
    navigator.clipboard.writeText(qrData.value.secret);
    await success('Secret tersalin!', 'Sukses');
  }
};

const copyBackupCodes = async () => {
  if (qrData.value) {
    navigator.clipboard.writeText(qrData.value.backupCodes.join('\n'));
    await success('Kode cadangan tersalin!', 'Sukses');
  }
};

onMounted(() => {
  loadStatus();
});
</script>
