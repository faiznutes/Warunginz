<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 md:px-8 font-display animate-fade-in">
    <div class="w-full space-y-12">
      <!-- Header -->
      <div class="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-700 pb-8">
        <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Loading & Empty States</h1>
        <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">Spinners, Skeletons, and State Management (Reskin V3)</p>
      </div>

      <!-- Spinners Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-blue-600">progress_activity</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Spinners</h2>
        </div>
        
        <BaseCard title="Spinner Sizes" subtitle="Available sizes: xs, sm, md, lg, xl">
          <div class="flex items-center gap-8 flex-wrap">
            <div class="flex flex-col items-center gap-2">
              <BaseSpinner size="xs" />
              <span class="text-xs text-slate-500">XS</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <BaseSpinner size="sm" />
              <span class="text-xs text-slate-500">SM</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <BaseSpinner size="md" />
              <span class="text-xs text-slate-500">MD</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <BaseSpinner size="lg" />
              <span class="text-xs text-slate-500">LG</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <BaseSpinner size="xl" />
              <span class="text-xs text-slate-500">XL</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard title="Spinner with Label" subtitle="Centered spinner with loading text">
          <div class="h-32 flex items-center justify-center">
            <BaseSpinner size="lg" label="Memuat data..." center />
          </div>
        </BaseCard>
      </section>

      <!-- Skeleton Screens Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-purple-600">skeleton</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Skeleton Screens</h2>
        </div>
        
        <BaseCard title="Content Skeleton" subtitle="Default skeleton with avatar and lines">
          <BaseSkeleton :lines="4" show-avatar show-title />
        </BaseCard>

        <BaseCard title="Table Skeleton" subtitle="Loading state for data tables">
          <BaseTableSkeleton :rows="5" :columns="4" />
        </BaseCard>

        <BaseCard title="Card Grid Skeleton" subtitle="Loading state for card layouts" :padding="'none'">
          <div class="p-6">
            <BaseCardSkeleton :count="3" />
          </div>
        </BaseCard>
      </section>

      <!-- Empty States Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-amber-600">inbox</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Empty States</h2>
        </div>
        
        <BaseCard title="Default Empty State">
          <BaseEmptyState 
            title="Tidak Ada Produk"
            description="Belum ada produk yang ditambahkan. Mulai dengan menambahkan produk pertama Anda."
            action-label="Tambah Produk"
            action-icon="add"
            show-action
            @action="log('Add product clicked')"
          />
        </BaseCard>

        <BaseCard title="Search Results Empty">
          <BaseEmptyState 
            icon="search_off"
            title="Tidak Ditemukan"
            description="Pencarian Anda tidak menghasilkan hasil. Coba gunakan kata kunci yang berbeda."
          />
        </BaseCard>
      </section>

      <!-- Error States Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-red-600">error</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Error States</h2>
        </div>
        
        <BaseCard title="404 - Page Not Found">
          <BaseErrorState 
            type="error"
            code="404"
            title="Halaman Tidak Ditemukan"
            description="Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan."
            show-home
            @home="log('Home clicked')"
          />
        </BaseCard>

        <BaseCard title="500 - Server Error">
          <BaseErrorState 
            type="error"
            code="500"
            title="Terjadi Kesalahan Server"
            description="Maaf, terjadi kesalahan pada server kami. Tim kami sedang menangani masalah ini."
            show-retry
            show-home
            @retry="log('Retry clicked')"
            @home="log('Home clicked')"
          />
        </BaseCard>

        <BaseCard title="403 - Forbidden">
          <BaseErrorState 
            type="forbidden"
            code="403"
            title="Akses Ditolak"
            description="Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator jika Anda merasa ini adalah kesalahan."
            show-home
            @home="log('Home clicked')"
          />
        </BaseCard>

        <BaseCard title="Network Error">
          <BaseErrorState 
            type="warning"
            icon="wifi_off"
            title="Koneksi Terputus"
            description="Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi."
            show-retry
            retry-label="Coba Lagi"
            @retry="log('Retry clicked')"
          />
        </BaseCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseSpinner from '../../components/ui/BaseSpinner.vue';
import BaseSkeleton from '../../components/ui/BaseSkeleton.vue';
import BaseTableSkeleton from '../../components/ui/BaseTableSkeleton.vue';
import BaseCardSkeleton from '../../components/ui/BaseCardSkeleton.vue';
import BaseEmptyState from '../../components/ui/BaseEmptyState.vue';
import BaseErrorState from '../../components/ui/BaseErrorState.vue';

const log = (message: string) => {
  console.log(message);
};
</script>
