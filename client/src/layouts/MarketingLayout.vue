<template>
  <div class="min-h-screen flex flex-col w-full overflow-x-hidden bg-background-light dark:bg-background-dark">
    <!-- Navigation - Fixed Header -->
    <nav class="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2 hover:opacity-90 transition-opacity group">
            <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <span class="text-xl font-bold text-slate-900 dark:text-white">Warungin</span>
          </router-link>

          <!-- Navigation Links - Hidden below 1200px (lg breakpoint) -->
          <div class="hidden lg:flex items-center space-x-8">
            <router-link
              to="/"
              class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition font-medium"
              active-class="text-primary dark:text-primary font-semibold"
            >
              Beranda
            </router-link>
            <router-link
              to="/demo"
              class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition font-medium"
              active-class="text-primary dark:text-primary font-semibold"
            >
              Demo
            </router-link>
            <router-link
              to="/contact"
              class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition font-medium"
              active-class="text-primary dark:text-primary font-semibold"
            >
              Kontak
            </router-link>
            <router-link
              to="/pricing"
              class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition font-medium"
              active-class="text-primary dark:text-primary font-semibold"
            >
              Harga
            </router-link>
            <router-link
              to="/help"
              class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition font-medium"
              active-class="text-primary dark:text-primary font-semibold"
            >
              Bantuan
            </router-link>
            <router-link
              to="/terms"
              class="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition font-medium"
              active-class="text-primary dark:text-primary font-semibold"
            >
              Syarat & Ketentuan
            </router-link>
          </div>

          <!-- Auth Buttons (Desktop only - above 1200px) -->
          <div class="hidden lg:flex items-center space-x-4">
            <router-link
              to="/login"
              class="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition font-medium"
            >
              Masuk
            </router-link>
            <router-link
              to="/pricing"
              class="px-6 py-2 bg-primary text-white rounded-xl hover:bg-blue-600 transition font-medium shadow-lg shadow-primary/20"
            >
              Lihat Harga
            </router-link>
          </div>

          <!-- Hamburger Menu Button - Show below 1200px (lg breakpoint) -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <span class="material-symbols-outlined">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
          </button>
        </div>

        <!-- Mobile/Tablet Menu - Show below 1200px -->
        <div
          v-if="mobileMenuOpen"
          class="lg:hidden py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
        >
          <div class="flex flex-col space-y-3">
            <router-link
              to="/"
              @click="mobileMenuOpen = false"
              class="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition"
              active-class="text-primary dark:text-primary font-semibold bg-primary/5 dark:bg-white/5"
            >
              Beranda
            </router-link>
            <router-link
              to="/demo"
              @click="mobileMenuOpen = false"
              class="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition"
              active-class="text-primary dark:text-primary font-semibold bg-primary/5 dark:bg-white/5"
            >
              Demo
            </router-link>
            <router-link
              to="/contact"
              @click="mobileMenuOpen = false"
              class="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition"
              active-class="text-primary dark:text-primary font-semibold bg-primary/5 dark:bg-white/5"
            >
              Kontak
            </router-link>
            <router-link
              to="/pricing"
              @click="mobileMenuOpen = false"
              class="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition"
              active-class="text-primary dark:text-primary font-semibold bg-primary/5 dark:bg-white/5"
            >
              Harga
            </router-link>
            <router-link
              to="/help"
              @click="mobileMenuOpen = false"
              class="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition"
              active-class="text-primary dark:text-primary font-semibold bg-primary/5 dark:bg-white/5"
            >
              Bantuan
            </router-link>
            <router-link
              to="/terms"
              @click="mobileMenuOpen = false"
              class="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition"
              active-class="text-primary dark:text-primary font-semibold bg-primary/5 dark:bg-white/5"
            >
              Syarat & Ketentuan
            </router-link>
            <!-- Auth Buttons for Mobile/Tablet -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 px-4">
              <router-link
                to="/login"
                @click="mobileMenuOpen = false"
                class="block w-full px-4 py-2 text-center text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition font-medium border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary dark:hover:border-primary"
              >
                Masuk
              </router-link>
              <router-link
                to="/pricing"
                @click="mobileMenuOpen = false"
                class="block w-full px-4 py-2 text-center bg-primary text-white rounded-xl hover:bg-blue-600 transition font-medium shadow-md"
              >
                Lihat Harga
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1 w-full min-h-0 relative pt-16">
      <div class="w-full h-full">
        <router-view />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-0">
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Company Info -->
          <div>
            <router-link to="/" class="flex items-center gap-2 mb-4 hover:opacity-90 transition-opacity group inline-flex">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[20px]">storefront</span>
              </div>
              <span class="text-xl font-bold text-slate-900 dark:text-white">Warungin</span>
            </router-link>
            <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Sistem modern untuk UMKM Indonesia. Kelola bisnis Anda dengan mudah, efisien, dan terjangkau.
            </p>
          </div>

          <!-- Links -->
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white mb-4">Produk</h3>
            <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <router-link to="/demo" class="hover:text-primary transition">Request Demo</router-link>
              </li>
              <li>
                <router-link to="/" class="hover:text-primary transition">Fitur</router-link>
              </li>
              <li>
                <router-link to="/pricing" class="hover:text-primary transition">Harga & Paket</router-link>
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white mb-4">Dukungan</h3>
            <ul class="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <router-link to="/contact" class="hover:text-primary transition">Hubungi Kami</router-link>
              </li>
              <li>
                <router-link to="/terms" class="hover:text-primary transition">Syarat & Ketentuan</router-link>
              </li>
              <li>
                <router-link to="/help" class="hover:text-primary transition">Pusat Bantuan</router-link>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="font-bold text-slate-900 dark:text-white mb-4">Kontak</h3>
            <ul class="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li class="flex items-center space-x-2">
                <span class="material-symbols-outlined text-[18px]">mail</span>
                <span>support@warungin.com</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="material-symbols-outlined text-[18px]">call</span>
                <span>+62 812-3456-7890</span>
              </li>
              <li class="flex items-center space-x-2">
                <span class="material-symbols-outlined text-[18px]">location_on</span>
                <span>Surabaya, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-slate-100 dark:border-slate-800 mt-12 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2024 Warungin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const mobileMenuOpen = ref(false);
</script>
