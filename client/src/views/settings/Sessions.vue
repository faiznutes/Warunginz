<template>
  <div class="flex flex-col gap-8 animate-fade-in font-display">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <h1 class="text-3xl font-black leading-tight tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Sesi Aktif</h1>
      <p class="text-slate-500 dark:text-slate-400 font-medium">Kelola sesi login aktif Anda di berbagai perangkat.</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Sessions List -->
    <div v-else class="space-y-6">
      <!-- Empty State -->
      <div v-if="sessions.length === 0" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
        <div class="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="material-symbols-outlined text-[40px] text-slate-400">devices_off</span>
        </div>
        <p class="text-slate-500 font-medium">Tidak ada sesi aktif</p>
      </div>

      <!-- Session Cards -->
      <div v-else class="grid grid-cols-1 gap-4">
        <div
            v-for="session in sessions"
            :key="session.id"
            class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 hover:shadow-md transition-all group"
        >
            <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
                <div class="flex items-center gap-4 mb-4">
                <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                    :class="session.isCurrent ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'"
                >
                    <span class="material-symbols-outlined text-[24px]">{{ session.isCurrent ? 'computer' : 'devices' }}</span>
                </div>
                <div class="flex-1">
                    <div class="flex items-center gap-3 flex-wrap">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">{{ session.deviceInfo || 'Perangkat Tidak Dikenal' }}</h3>
                    <span
                        v-if="session.isCurrent"
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold"
                    >
                        <span class="w-2 h-2 rounded-full bg-green-500"></span>
                        Saat Ini
                    </span>
                    </div>
                    <p class="text-sm text-slate-500 mt-1 font-mono bg-slate-50 dark:bg-slate-900 inline-block px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{{ session.ipAddress || 'IP Tidak Dikenal' }}</p>
                </div>
                </div>

                <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-slate-400">schedule</span>
                    <span>Terakhir aktif: <strong class="text-slate-700 dark:text-slate-300">{{ formatDate(session.lastActivityAt) }}</strong></span>
                </div>
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[18px] text-slate-400">calendar_today</span>
                    <span>Dibuat: <strong class="text-slate-700 dark:text-slate-300">{{ formatDate(session.createdAt) }}</strong></span>
                </div>
                </div>
            </div>

            <button
                v-if="!session.isCurrent"
                @click="revokeSession(session.id)"
                class="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-bold flex items-center gap-2 border border-red-100 dark:border-red-900/30"
            >
                <span class="material-symbols-outlined text-[18px]">logout</span>
                <span class="hidden sm:inline">Akhiri Sesi</span>
            </button>
            </div>
        </div>
      </div>

      <!-- Actions Card -->
      <div v-if="sessions.length > 1" class="bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 p-6 sm:p-8">
        <div class="flex items-center gap-4 mb-6">
          <div class="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl">
            <span class="material-symbols-outlined text-[24px]">security</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-red-900 dark:text-red-100">Tindakan Keamanan</h3>
            <p class="text-sm font-medium text-red-700/70 dark:text-red-300/70">Akhiri semua sesi kecuali yang saat ini</p>
          </div>
        </div>
        <button
          @click="revokeAllSessions"
          class="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:scale-95"
        >
          <span class="material-symbols-outlined text-[20px]">logout</span>
          Akhiri Semua Sesi Lain
        </button>
        <p class="text-xs text-red-600 dark:text-red-400 mt-3 text-center font-medium">
          Ini akan mengakhiri semua sesi aktif kecuali sesi Anda saat ini.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { useNotification } from '../../composables/useNotification';

const { confirm, success, error } = useNotification();

const loading = ref(true);
const sessions = ref<any[]>([]);

const loadSessions = async () => {
  try {
      const response = await api.get('/sessions');
      const sessionsData = response.data.sessions || [];
      
      // Mark current session (if we have sessionId from JWT or localStorage)
      const currentSessionId = localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId');
      sessions.value = sessionsData.map((session: any) => ({
        ...session,
        isCurrent: session.id === currentSessionId || (!currentSessionId && sessionsData.indexOf(session) === 0),
        lastActivityAt: session.lastActivity || session.lastActivityAt || session.createdAt,
      }));
  } catch (error: any) {
    console.error('Error loading sessions:', error);
  } finally {
    loading.value = false;
  }
};

const revokeSession = async (sessionId: string) => {
  const confirmed = await confirm(
    'Apakah Anda yakin ingin mengakhiri sesi ini?',
    'Akhiri Sesi',
    'Ya, Akhiri',
    'Batal'
  );
  
  if (!confirmed) return;

  try {
    await api.delete(`/sessions/${sessionId}`);
    await loadSessions();
    await success('Sesi berhasil diakhiri', 'Sukses');
  } catch (err: any) {
    console.error('Error revoking session:', err);
    await error(err.response?.data?.message || 'Gagal mengakhiri sesi', 'Error');
  }
};

const revokeAllSessions = async () => {
  const confirmed = await confirm(
    'Apakah Anda yakin ingin mengakhiri semua sesi lain? Anda akan tetap login di perangkat ini.',
    'Akhiri Semua Sesi',
    'Ya, Akhiri Semua',
    'Batal'
  );
  
  if (!confirmed) return;

  try {
    await api.post('/sessions/revoke-all');
    await loadSessions();
    await success('Semua sesi lain berhasil diakhiri', 'Sukses');
  } catch (err: any) {
    console.error('Error revoking all sessions:', err);
    await error(err.response?.data?.message || 'Gagal mengakhiri sesi', 'Error');
  }
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadSessions();
});
</script>
