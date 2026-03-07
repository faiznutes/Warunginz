<template>
  <div class="min-h-screen bg-white dark:bg-slate-900 font-display text-slate-900 dark:text-white antialiased selection:bg-primary/20 selection:text-primary">
    <div class="min-h-screen flex items-center justify-center p-4 md:p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-[#101822] dark:via-[#15202e] dark:to-[#0f151e]">
      <!-- Main Card Container -->
      <div class="w-full max-w-[900px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row relative">
        <router-link
          to="/"
          class="absolute top-4 right-4 md:top-6 md:right-6 text-slate-400 hover:text-primary dark:text-slate-500 dark:hover:text-primary transition-colors z-20"
        >
          <div class="flex items-center gap-2 text-sm font-medium">
            <span class="md:hidden">Beranda</span>
            <span class="material-symbols-outlined">home</span>
          </div>
        </router-link>
        <!-- Left Section: Branding -->
        <div class="flex-1 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-slate-800 z-10">
          <div class="mb-8">
            <!-- Logo -->
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-3xl">storefront</span>
              </div>
              <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Warungin</h1>
            </div>
            <h2 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
              Selamat Datang Kembali
            </h2>
            <p class="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              Solusi POS Terpercaya untuk UMKM Indonesia. Kelola inventaris, transaksi, dan laporan bisnis Anda dengan lebih efisien dalam satu dashboard.
            </p>
          </div>
          <div class="mt-auto hidden md:block">
            <div class="flex items-center gap-2 text-sm text-slate-500">
              <span class="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Aman & Terpercaya</span>
            </div>
          </div>
        </div>

        <!-- Divider Line (Horizontal on Mobile, Vertical on Desktop) -->
        <div class="w-full h-px md:w-px md:h-auto bg-slate-200 dark:bg-slate-700 mx-0"></div>

        <!-- Right Section: Login Form -->
        <div class="flex-1 p-8 md:p-12 flex flex-col justify-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <div class="mb-6 md:hidden">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Masuk ke Akun Anda</h3>
          </div>
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Email Field -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="email">Email</label>
              <div class="relative flex items-center">
                <input
                  id="email"
                  v-model="email"
                  class="w-full h-12 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 pr-12 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 text-base transition-colors"
                  placeholder="nama@bisnisanda.com"
                  required
                  type="email"
                />
                <div class="absolute right-4 text-slate-400 pointer-events-none flex items-center">
                  <span class="material-symbols-outlined text-[20px]">mail</span>
                </div>
              </div>
            </div>
            <!-- Password Field -->
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300" for="password">Kata Sandi</label>
              </div>
              <div class="relative flex items-center">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  class="w-full h-12 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 pr-12 focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 text-base transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full p-1"
                  :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                >
                  <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input
                      id="remember-me"
                      v-model="rememberMe"
                      type="checkbox"
                      class="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                    />
                    <label for="remember-me" class="ml-2 block text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                      Ingat Saya
                    </label>
                </div>
                <router-link to="/forgot-password" class="text-sm font-medium text-primary hover:text-blue-600 transition-colors">
                    Lupa Kata Sandi?
                </router-link>
            </div>

            <!-- Submit Button -->
            <BaseButton
              type="submit"
              :loading="loading"
              variant="primary"
              size="xl"
              block
              class="h-12 shadow-md shadow-primary/25 hover:shadow-primary/30 group"
            >
              <span class="flex items-center gap-2">
                <span>Masuk Dashboard</span>
                <span v-if="!loading" class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </span>
            </BaseButton>
          </form>
          <div class="mt-8 text-center md:text-left">
            <p class="text-xs text-slate-500 dark:text-slate-500">
              © 2024 Warungin Indonesia. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </div>
      
       <!-- Background decorative elements -->
      <div class="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-300/20 dark:bg-slate-700/10 rounded-full blur-3xl"></div>
      </div>
    </div>
    
     <!-- Store Selector Modal -->
    <StoreSelectorModal
      :show="showStoreSelector"
      :required="true"
      @close="handleStoreSelectorClose"
      @select="handleStoreSelected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useNotification } from '../../composables/useNotification';
import StoreSelectorModal from '../../components/StoreSelectorModal.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import { getAllowedStoreIdsFromUser } from '../../utils/shift-state';

const router = useRouter();
const { error: showError, warning: showWarning } = useNotification();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const showPassword = ref(false);
const rememberMe = ref(localStorage.getItem('rememberMe') === 'true');
const showStoreSelector = ref(false);

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (authStore.isAuthenticated) {
    const redirect = route.query.redirect as string;
    if (redirect) {
    router.push(redirect);
    } else {
      router.push('/app');
    }
    return;
  }
  
  if (rememberMe.value) {
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
      email.value = storedEmail;
    }
  }
});

const handleLogin = async () => {
  loading.value = true;
  try {
    const trimmedEmail = email.value.trim();
    const trimmedPassword = password.value.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      await showWarning('Email dan kata sandi wajib diisi');
      loading.value = false;
      return;
    }
    
    await authStore.login(trimmedEmail, trimmedPassword, rememberMe.value);
    
    let retries = 0;
    while (!authStore.user && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (!authStore.user) {
      try {
        await authStore.fetchMe();
      } catch (error) {
        console.error('Failed to fetch user after login:', error);
      }
    }
    
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', trimmedEmail);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    
    const user = authStore.user;
    if (user?.role === 'SUPERVISOR' && getAllowedStoreIdsFromUser(user).length === 0) {
      await showWarning('Akun supervisor belum memiliki toko aktif yang diizinkan. Hubungi admin tenant.');
    }
    
    const redirect = route.query.redirect as string;
    if (redirect) {
      router.push(redirect);
    } else {
      const userRole = authStore.user?.role;
      
      // CASHIER uses shift context to decide between recovery, open-shift, or POS
      if (userRole === 'CASHIER') {
        const shiftContext = await authStore.getShiftContext(true);
        if (shiftContext?.requiresRecoveryClose) {
          router.push('/app/cashier/cash-shift');
        } else if (shiftContext?.hasHealthyActiveShift) {
          router.push('/pos');
        } else {
          router.push('/open-shift');
        }
        return;
      }
      if (userRole === 'KITCHEN') {
        router.push('/kitchen');
        return;
      }
      
      if (userRole === 'SUPER_ADMIN') {
        router.push({ name: 'super-dashboard' });
      } else {
        router.push({ name: 'dashboard' });
      }
    }
  } catch (error: any) {
    if (error.response?.status === 429) {
      const retryAfter = error.response?.data?.retryAfter;
      let message = error.response?.data?.message || error.response?.data?.error || 'Terlalu banyak percobaan login';
      
      if (retryAfter) {
        const minutes = Math.ceil(retryAfter / 60);
        message = `${message}. Silakan coba lagi dalam ${minutes} menit.`;
      } else {
        message = `${message}. Silakan tunggu sebelum mencoba lagi.`;
      }
      
      await showError(message);
    } else if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      
      if (errorMessage && (
        errorMessage.includes('Store') || 
        errorMessage.includes('store') ||
        errorMessage.includes('tidak aktif') ||
        errorMessage.includes('memindahkan') ||
        errorMessage.includes('ditetapkan') ||
        errorMessage.includes('diizinkan')
      )) {
        await showWarning(errorMessage, 'Toko Tidak Aktif');
      } else {
        await showError(errorMessage || 'Akses ditolak');
      }
    } else {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      
      if (errorMessage) {
        await showError(errorMessage);
      } else {
        await showError('Email atau kata sandi tidak valid');
      }
    }
    console.error('Login error:', error);
  } finally {
    loading.value = false;
  }
};

const handleStoreSelectorClose = () => {
  showStoreSelector.value = false;
  const redirect = route.query.redirect as string;
  if (redirect) {
  router.push(redirect);
  } else {
    const userRole = authStore.user?.role;
    if (userRole === 'SUPER_ADMIN') {
      router.push({ name: 'super-dashboard' });
    } else {
      router.push({ name: 'dashboard' });
    }
  }
};

const handleStoreSelected = (_storeId: string) => {
  showStoreSelector.value = false;
  const redirect = route.query.redirect as string;
  if (redirect) {
  router.push(redirect);
  } else {
    const userRole = authStore.user?.role;
    if (userRole === 'SUPER_ADMIN') {
      router.push({ name: 'super-dashboard' });
    } else {
      router.push({ name: 'dashboard' });
    }
  }
};
</script>
