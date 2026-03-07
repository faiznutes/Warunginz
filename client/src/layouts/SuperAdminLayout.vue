<template>
  <div class="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-white font-display overflow-hidden h-screen flex">
    <!-- Sidebar -->
    <aside 
      class="w-64 bg-slate-50 dark:bg-[#1e293b] border-r border-[#e7edf3] dark:border-slate-700 flex flex-col h-full shrink-0 transition-all duration-300 fixed lg:relative z-50"
      :class="{ 
        '-translate-x-full lg:translate-x-0': !sidebarOpen && windowWidth < 1024,
        'translate-x-0': sidebarOpen || windowWidth >= 1024,
        'shadow-xl lg:shadow-none': sidebarOpen && windowWidth < 1024
      }"
    >
      <div class="p-6 pb-2 shrink-0">
        <div class="flex flex-col gap-1">
          <h1 class="text-blue-600 dark:text-blue-400 text-xl font-bold leading-normal flex items-center gap-2">
            <span class="material-symbols-outlined icon-filled">storefront</span>
            Warungin
          </h1>
          <p class="text-[#4c739a] dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-normal pl-8">Super Admin Panel</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 custom-scrollbar">
        <router-link 
          to="/app/super-dashboard" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path === '/app/super-dashboard' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path === '/app/super-dashboard' }">dashboard</span>
          <p class="text-sm font-medium leading-normal">Dashboard</p>
        </router-link>

        <router-link 
          to="/app/tenants" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path.startsWith('/app/tenants') && !$route.path.includes('/support') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/tenants') && !$route.path.includes('/support') }">store</span>
          <p class="text-sm font-medium leading-normal">Tenants</p>
        </router-link>

        <router-link 
          to="/app/subscription" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path.startsWith('/app/subscription') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/subscription') }">receipt_long</span>
          <p class="text-sm font-medium leading-normal">Subscriptions</p>
        </router-link>

        <router-link 
          to="/app/superadmin/contact-messages" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path === '/app/superadmin/contact-messages' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path === '/app/superadmin/contact-messages' }">support_agent</span>
          <p class="text-sm font-medium leading-normal">Support & Pesan</p>
        </router-link>

        <router-link 
          to="/app/addons" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path.startsWith('/app/addons') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/addons') }">extension</span>
          <p class="text-sm font-medium leading-normal">Addons</p>
        </router-link>

        <div class="my-2 border-t border-slate-200 dark:border-slate-700"></div>

        <router-link 
          to="/app/finance" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path.startsWith('/app/finance') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/finance') }">payments</span>
          <p class="text-sm font-medium leading-normal">Finance</p>
        </router-link>

        <router-link 
          to="/app/analytics" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path.startsWith('/app/analytics') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/analytics') }">analytics</span>
          <p class="text-sm font-medium leading-normal">Analytics</p>
        </router-link>

        <router-link 
          to="/app/reports/global" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path.startsWith('/app/reports') ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path.startsWith('/app/reports') }">summarize</span>
          <p class="text-sm font-medium leading-normal">Laporan</p>
        </router-link>

        <div class="my-2 border-t border-slate-200 dark:border-slate-700"></div>
        <p class="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 mt-1">System</p>

        <router-link 
          to="/app/superadmin/server-monitor" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path === '/app/superadmin/server-monitor' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path === '/app/superadmin/server-monitor' }">dns</span>
          <p class="text-sm font-medium leading-normal">Server Monitor</p>
        </router-link>

        <router-link 
          to="/app/superadmin/backups" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path === '/app/superadmin/backups' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path === '/app/superadmin/backups' }">backup</span>
          <p class="text-sm font-medium leading-normal">Backups</p>
        </router-link>

        <router-link 
          to="/app/superadmin/system-info" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path === '/app/superadmin/system-info' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path === '/app/superadmin/system-info' }">info</span>
          <p class="text-sm font-medium leading-normal">Info Sistem</p>
        </router-link>

        <router-link 
          to="/app/settings/system" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group"
          active-class="bg-blue-50 text-blue-600 font-bold"
          :class="[$route.path === '/app/settings/system' ? '' : 'text-[#4c739a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600']"
          @click="windowWidth < 1024 ? sidebarOpen = false : null"
        >
          <span class="material-symbols-outlined" :class="{ 'icon-filled': $route.path === '/app/settings/system' }">settings</span>
          <p class="text-sm font-medium leading-normal">Settings</p>
        </router-link>

        <button 
          @click="handleLogout" 
          class="flex items-center gap-3 px-3 py-3 rounded-xl text-[#4c739a] dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors w-full text-left"
        >
          <span class="material-symbols-outlined">logout</span>
          <p class="text-sm font-medium leading-normal">Logout</p>
        </button>
      </nav>

      <div class="p-4 border-t border-[#e7edf3] dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/50">
        <div class="flex items-center gap-3">
          <div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-600 shadow-sm bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
             {{ user?.name?.substring(0,2).toUpperCase() || 'SA' }}
          </div>
          <div class="flex flex-col overflow-hidden">
            <p class="text-sm font-bold text-[#0d141b] dark:text-white truncate">{{ user?.name || 'Super Admin' }}</p>
            <p class="text-xs text-[#4c739a] dark:text-slate-400 truncate">{{ user?.email || 'admin@warungin.com' }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile/tablet -->
    <div
      v-if="sidebarOpen && windowWidth < 1024"
      class="fixed inset-0 bg-[#0d141b]/50 z-40 transition-opacity duration-300 backdrop-blur-sm"
      @click="sidebarOpen = false"
    ></div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
      <!-- Header -->
      <header class="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-[#1e293b] border-b border-[#e7edf3] dark:border-slate-700 shrink-0 z-10">
        <div class="flex items-center gap-4">
          <button 
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden text-[#4c739a]"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div>
            <nav class="flex items-center gap-2 text-sm text-[#4c739a] dark:text-slate-400 mb-1">
              <span class="hover:text-blue-600 transition-colors cursor-pointer">Home</span>
              <span class="text-xs">/</span>
              <span class="text-[#0d141b] dark:text-white font-medium">{{ pageTitle }}</span>
            </nav>
            <h2 class="text-[#0d141b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">{{ pageTitle }}</h2>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <NotificationDropdown />
        </div>
      </header>

      <!-- Scrollable Dashboard Content -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth hover:scroll-auto">
        <div class="max-w-[1400px] mx-auto flex flex-col gap-6 h-full">
           <router-view></router-view>
           <!-- Footer spacing -->
           <div class="h-8 shrink-0"></div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import NotificationDropdown from '../components/NotificationDropdown.vue';

const route = useRoute();
const authStore = useAuthStore();

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
const sidebarOpen = ref(true);

const user = computed(() => authStore.user);

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/app/super-dashboard': 'Super Admin Dashboard',
    '/app/tenants': 'Tenant Management',
    '/app/tenants/support': 'Support & Pesan',
    '/app/addons': 'Addon Management',
    '/app/reports/global': 'Laporan Global',
    '/app/settings/system': 'System Settings',
    '/app/settings/archive': 'Archive Management',
    '/app/settings/retention': 'Retention Management',
    '/app/superadmin/backups': 'Backup Management',
    '/app/superadmin/server-monitor': 'Server Monitor',
    '/app/superadmin/system-info': 'Informasi Sistem',
    '/app/superadmin/contact-messages': 'Support & Pesan',
    '/app/analytics': 'Advanced Analytics',
    '/app/finance': 'Keuangan',
    '/app/profit-loss': 'Laporan Laba Rugi',
  };
  // Fallback for dynamic routes or sub-routes
  if (route.path.startsWith('/app/tenants/')) return 'Tenant Details';
  
  return titles[route.path] || 'Super Admin Dashboard';
});

const handleLogout = () => {
  authStore.clearAuth();
  window.location.replace('/login');
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = true;
  } else {
    sidebarOpen.value = false;
  }
};

onMounted(() => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value >= 1024) {
    sidebarOpen.value = true;
  } else {
    sidebarOpen.value = false;
  }
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style>
/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
.material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.icon-filled {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>

