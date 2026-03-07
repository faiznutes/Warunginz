<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 md:px-8 font-display animate-fade-in">
    <div class="w-full space-y-12">
      <!-- Header -->
      <div class="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-700 pb-8">
        <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Advanced Components</h1>
        <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">Modals, Dropdowns, Tooltips (Reskin V3)</p>
      </div>

      <!-- Modals Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-blue-600">window</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Modals</h2>
        </div>
        
        <BaseCard title="Modal Sizes" subtitle="Available sizes: sm, md, lg, xl, full">
          <div class="flex flex-wrap gap-3">
            <BaseButton @click="showModal('sm')">Small Modal</BaseButton>
            <BaseButton @click="showModal('md')">Medium Modal</BaseButton>
            <BaseButton @click="showModal('lg')">Large Modal</BaseButton>
            <BaseButton @click="showModal('xl')">Extra Large Modal</BaseButton>
            <BaseButton @click="showModal('full')">Full Width Modal</BaseButton>
          </div>
        </BaseCard>

        <BaseCard title="Modal with Form" subtitle="Example of modal containing a form">
          <BaseButton icon="add" @click="showFormModal = true">Add User</BaseButton>
        </BaseCard>
      </section>

      <!-- Dropdowns Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-purple-600">arrow_drop_down_circle</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Dropdowns</h2>
        </div>
        
        <BaseCard title="Basic Dropdown" subtitle="Click to open dropdown menu">
          <div class="flex gap-4 flex-wrap">
            <BaseDropdown label="Actions">
              <BaseDropdownItem icon="edit">Edit</BaseDropdownItem>
              <BaseDropdownItem icon="content_copy">Duplicate</BaseDropdownItem>
              <BaseDropdownDivider>Danger Zone</BaseDropdownDivider>
              <BaseDropdownItem icon="delete" danger>Delete</BaseDropdownItem>
            </BaseDropdown>

            <BaseDropdown label="Settings" position="right">
              <BaseDropdownItem icon="person">Profile</BaseDropdownItem>
              <BaseDropdownItem icon="settings">Settings</BaseDropdownItem>
              <BaseDropdownItem icon="help">Help</BaseDropdownItem>
              <div class="border-t border-slate-200 dark:border-slate-700 my-1"></div>
              <BaseDropdownItem icon="logout">Logout</BaseDropdownItem>
            </BaseDropdown>

            <BaseDropdown width="lg">
              <template #trigger>
                <BaseButton variant="outline" icon="more_vert" size="sm"></BaseButton>
              </template>
              <BaseDropdownItem icon="visibility">View Details</BaseDropdownItem>
              <BaseDropdownItem icon="download">Download</BaseDropdownItem>
              <BaseDropdownItem icon="share">Share</BaseDropdownItem>
            </BaseDropdown>
          </div>
        </BaseCard>
      </section>

      <!-- Tooltips Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-amber-600">info</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Tooltips</h2>
        </div>
        
        <BaseCard title="Tooltip Positions" subtitle="Hover over buttons to see tooltips">
          <div class="flex gap-4 flex-wrap items-center justify-center p-8">
            <BaseTooltip content="Tooltip on top" position="top">
              <BaseButton variant="outline">Top</BaseButton>
            </BaseTooltip>

            <BaseTooltip content="Tooltip on bottom" position="bottom">
              <BaseButton variant="outline">Bottom</BaseButton>
            </BaseTooltip>

            <BaseTooltip content="Tooltip on left" position="left">
              <BaseButton variant="outline">Left</BaseButton>
            </BaseTooltip>

            <BaseTooltip content="Tooltip on right" position="right">
              <BaseButton variant="outline">Right</BaseButton>
            </BaseTooltip>
          </div>
        </BaseCard>

        <BaseCard title="Icon Tooltips" subtitle="Tooltips on icon buttons">
          <div class="flex gap-3">
            <BaseTooltip content="Edit item">
              <BaseButton variant="ghost" icon="edit" size="sm"></BaseButton>
            </BaseTooltip>
            <BaseTooltip content="Delete item">
              <BaseButton variant="ghost" icon="delete" size="sm"></BaseButton>
            </BaseTooltip>
            <BaseTooltip content="Share item">
              <BaseButton variant="ghost" icon="share" size="sm"></BaseButton>
            </BaseTooltip>
            <BaseTooltip content="Download item">
              <BaseButton variant="ghost" icon="download" size="sm"></BaseButton>
            </BaseTooltip>
          </div>
        </BaseCard>
      </section>
    </div>

    <!-- Example Modals -->
    <BaseModal v-model="modalState.sm" title="Small Modal" subtitle="This is a small modal" :size="modalState.currentSize">
      <p class="text-slate-600 dark:text-slate-400">
        This is a small modal with minimal content. Perfect for quick confirmations or simple forms.
      </p>
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="outline" @click="modalState.sm = false">Cancel</BaseButton>
          <BaseButton @click="modalState.sm = false">Confirm</BaseButton>
        </div>
      </template>
    </BaseModal>

    <BaseModal v-model="showFormModal" title="Add New User" subtitle="Fill in the user details" size="md">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <BaseInput label="Full Name" v-model="form.name" required />
        <BaseInput label="Email" type="email" v-model="form.email" required />
        <BaseSelect label="Role" :options="['Admin', 'User', 'Guest']" v-model="form.role" />
        <BaseTextarea label="Bio" v-model="form.bio" :rows="3" />
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="outline" @click="showFormModal = false">Cancel</BaseButton>
          <BaseButton @click="handleSubmit">Save User</BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import BaseCard from '../../components/ui/BaseCard.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseSelect from '../../components/ui/BaseSelect.vue';
import BaseTextarea from '../../components/ui/BaseTextarea.vue';
import BaseModal from '../../components/ui/BaseModal.vue';
import BaseDropdown from '../../components/ui/BaseDropdown.vue';
import BaseDropdownItem from '../../components/ui/BaseDropdownItem.vue';
import BaseDropdownDivider from '../../components/ui/BaseDropdownDivider.vue';
import BaseTooltip from '../../components/ui/BaseTooltip.vue';

const modalState = reactive({
  sm: false,
  md: false,
  lg: false,
  xl: false,
  full: false,
  currentSize: 'sm' as 'sm' | 'md' | 'lg' | 'xl' | 'full'
});

const showFormModal = ref(false);

const form = reactive({
  name: '',
  email: '',
  role: '',
  bio: ''
});

const showModal = (size: 'sm' | 'md' | 'lg' | 'xl' | 'full') => {
  modalState.currentSize = size;
  modalState.sm = true;
};

const handleSubmit = () => {
  console.log('Form submitted:', form);
  showFormModal.value = false;
};
</script>
