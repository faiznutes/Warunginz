<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 md:px-8 font-display animate-fade-in">
    <div class="w-full space-y-12">
      <!-- Header -->
      <div class="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-700 pb-8">
        <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Additional Components</h1>
        <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">Tabs, Progress Bars, Accordions (Reskin V3)</p>
      </div>

      <!-- Tabs Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-blue-600">tab</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Tabs</h2>
        </div>
        
        <BaseCard title="Basic Tabs" subtitle="Click tabs to switch content">
          <BaseTabs :tabs="basicTabs" v-model="activeBasicTab">
            <template #tab-0>
              <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Profile Information</h3>
                <p class="text-slate-600 dark:text-slate-400">Manage your personal information and account settings.</p>
              </div>
            </template>
            <template #tab-1>
              <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Security Settings</h3>
                <p class="text-slate-600 dark:text-slate-400">Configure your password, two-factor authentication, and security preferences.</p>
              </div>
            </template>
            <template #tab-2>
              <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Notification Preferences</h3>
                <p class="text-slate-600 dark:text-slate-400">Choose how and when you want to receive notifications.</p>
              </div>
            </template>
          </BaseTabs>
        </BaseCard>

        <BaseCard title="Tabs with Icons and Badges" subtitle="Enhanced tabs with visual indicators">
          <BaseTabs :tabs="advancedTabs" v-model="activeAdvancedTab">
            <template #tab-0>
              <div class="space-y-4">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">Dashboard Overview</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p class="text-sm text-slate-600 dark:text-slate-400">Total Sales</p>
                    <p class="text-2xl font-black text-blue-600">Rp 45.2M</p>
                  </div>
                  <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p class="text-sm text-slate-600 dark:text-slate-400">Orders</p>
                    <p class="text-2xl font-black text-blue-600">1,234</p>
                  </div>
                  <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <p class="text-sm text-slate-600 dark:text-slate-400">Customers</p>
                    <p class="text-2xl font-black text-amber-600">567</p>
                  </div>
                </div>
              </div>
            </template>
            <template #tab-1>
              <div class="space-y-3">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">Recent Messages (3)</h3>
                <div class="space-y-2">
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p class="font-bold text-sm">John Doe</p>
                    <p class="text-xs text-slate-500">Order #1234 has been shipped</p>
                  </div>
                  <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p class="font-bold text-sm">Jane Smith</p>
                    <p class="text-xs text-slate-500">Payment received for invoice #5678</p>
                  </div>
                </div>
              </div>
            </template>
            <template #tab-2>
              <div class="space-y-3">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">Settings</h3>
                <p class="text-slate-600 dark:text-slate-400">Configure your application preferences.</p>
              </div>
            </template>
          </BaseTabs>
        </BaseCard>
      </section>

      <!-- Progress Bars Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-blue-600">trending_up</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Progress Bars</h2>
        </div>
        
        <BaseCard title="Progress Variants" subtitle="Different colors for different states">
          <div class="space-y-6">
            <BaseProgress :value="75" label="Primary Progress" variant="primary" show-percentage />
            <BaseProgress :value="90" label="Success Progress" variant="success" show-percentage />
            <BaseProgress :value="50" label="Warning Progress" variant="warning" show-percentage />
            <BaseProgress :value="30" label="Error Progress" variant="error" show-percentage />
            <BaseProgress :value="65" label="Info Progress" variant="info" show-percentage />
          </div>
        </BaseCard>

        <BaseCard title="Progress Sizes" subtitle="Available sizes: xs, sm, md, lg">
          <div class="space-y-4">
            <BaseProgress :value="80" label="Extra Small" size="xs" show-percentage />
            <BaseProgress :value="80" label="Small" size="sm" show-percentage />
            <BaseProgress :value="80" label="Medium" size="md" show-percentage />
            <BaseProgress :value="80" label="Large" size="lg" show-percentage />
          </div>
        </BaseCard>

        <BaseCard title="Advanced Progress" subtitle="Striped and animated options">
          <div class="space-y-6">
            <BaseProgress 
              :value="45" 
              :max="100"
              label="Upload Progress" 
              helper-text="Uploading file... 45 MB of 100 MB"
              variant="primary"
              show-value
              striped
              animated
            />
            <BaseProgress 
              :value="8" 
              :max="10"
              label="Tasks Completed" 
              helper-text="8 out of 10 tasks completed"
              variant="success"
              show-value
            />
          </div>
        </BaseCard>
      </section>

      <!-- Accordion Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-purple-600">expand_circle_down</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Accordions</h2>
        </div>
        
        <BaseCard title="FAQ Accordion" subtitle="Click to expand/collapse sections">
          <div class="space-y-3">
            <BaseAccordion 
              title="Apa itu Warungin POS?" 
              subtitle="Informasi dasar tentang aplikasi"
              icon="help"
              default-open
            >
              <p class="text-slate-600 dark:text-slate-400">
                Warungin POS adalah sistem Point of Sale berbasis cloud yang dirancang khusus untuk UMKM di Indonesia. 
                Aplikasi ini membantu Anda mengelola penjualan, inventori, dan laporan keuangan dengan mudah.
              </p>
            </BaseAccordion>

            <BaseAccordion 
              title="Bagaimana cara memulai?" 
              subtitle="Panduan untuk pengguna baru"
              icon="rocket_launch"
            >
              <div class="space-y-3 text-slate-600 dark:text-slate-400">
                <p>Untuk memulai menggunakan Warungin POS:</p>
                <ol class="list-decimal list-inside space-y-2 ml-4">
                  <li>Daftar akun dan pilih paket berlangganan</li>
                  <li>Tambahkan produk dan kategori</li>
                  <li>Atur metode pembayaran</li>
                  <li>Mulai mencatat transaksi</li>
                </ol>
              </div>
            </BaseAccordion>

            <BaseAccordion 
              title="Berapa biaya berlangganan?" 
              subtitle="Informasi harga dan paket"
              icon="payments"
            >
              <p class="text-slate-600 dark:text-slate-400">
                Kami menawarkan berbagai paket berlangganan mulai dari Rp 99.000/bulan untuk paket Basic, 
                Rp 299.000/bulan untuk paket Pro, dan Rp 599.000/bulan untuk paket Enterprise dengan fitur lengkap.
              </p>
            </BaseAccordion>

            <BaseAccordion 
              title="Apakah data saya aman?" 
              subtitle="Keamanan dan privasi"
              icon="shield"
            >
              <p class="text-slate-600 dark:text-slate-400">
                Ya, keamanan data Anda adalah prioritas kami. Semua data dienkripsi dengan standar industri (AES-256), 
                backup otomatis setiap hari, dan server kami dilindungi dengan firewall dan sistem keamanan berlapis.
              </p>
            </BaseAccordion>
          </div>
        </BaseCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseTabs from '../../components/ui/BaseTabs.vue';
import BaseProgress from '../../components/ui/BaseProgress.vue';
import BaseAccordion from '../../components/ui/BaseAccordion.vue';

const activeBasicTab = ref(0);
const activeAdvancedTab = ref(0);

const basicTabs = [
  { label: 'Profile' },
  { label: 'Security' },
  { label: 'Notifications' }
];

const advancedTabs = [
  { label: 'Dashboard', icon: 'dashboard' },
  { label: 'Messages', icon: 'mail', badge: 3, badgeVariant: 'error' as const },
  { label: 'Settings', icon: 'settings' }
];
</script>
