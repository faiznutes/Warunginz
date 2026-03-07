<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 md:px-8 font-display animate-fade-in">
    <div class="w-full space-y-12">
      <!-- Header -->
      <div class="flex flex-col gap-2 border-b border-slate-200 dark:border-slate-700 pb-8">
        <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Style Guide</h1>
        <p class="text-slate-500 dark:text-slate-400 text-lg font-medium">Core UI Components & Form Elements (Reskin V3)</p>
      </div>

      <!-- Buttons Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-blue-600">touch_app</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Buttons</h2>
        </div>
        
        <BaseCard title="Button Variants">
          <div class="flex flex-wrap gap-4 items-center">
            <BaseButton variant="primary">Primary</BaseButton>
            <BaseButton variant="secondary">Secondary</BaseButton>
            <BaseButton variant="danger">Danger</BaseButton>
            <BaseButton variant="success">Success</BaseButton>
            <BaseButton variant="outline">Outline</BaseButton>
            <BaseButton variant="ghost">Ghost</BaseButton>
            <BaseButton variant="white">White</BaseButton>
          </div>
        </BaseCard>

        <BaseCard title="Button Sizes">
          <div class="flex flex-wrap gap-4 items-center">
            <BaseButton size="sm">Small</BaseButton>
            <BaseButton size="md">Medium</BaseButton>
            <BaseButton size="lg">Large</BaseButton>
            <BaseButton size="xl">Extra Large</BaseButton>
          </div>
        </BaseCard>

        <BaseCard title="Button States">
          <div class="flex flex-wrap gap-4 items-center">
            <BaseButton loading>Loading</BaseButton>
            <BaseButton disabled>Disabled</BaseButton>
            <BaseButton icon="add">With Icon</BaseButton>
            <BaseButton variant="outline" icon="delete" rounded="full">Round Icon</BaseButton>
          </div>
        </BaseCard>
      </section>

      <!-- Form Inputs Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-blue-600">input</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Form Inputs</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BaseCard title="Text Inputs" class="space-y-6">
            <BaseInput label="Default Input" placeholder="Type something..." v-model="form.text" />
            <BaseInput label="With Icon" icon="mail" placeholder="email@example.com" v-model="form.email" />
            <BaseInput label="Error State" error="This field is required" placeholder="Error state..." v-model="form.error" />
            <BaseInput label="Disabled State" disabled placeholder="Can't type here" modelValue="Disabled content" />
          </BaseCard>

          <BaseCard title="Select & Choice" class="space-y-6">
            <BaseSelect 
              label="Select Option" 
              :options="['Option 1', 'Option 2', 'Option 3']" 
              v-model="form.select" 
            />
            
            <BaseTextarea 
               label="Bio / Description" 
               placeholder="Tell us about yourself..." 
               v-model="form.textarea" 
            />

            <div class="space-y-3 pt-2">
               <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Switches (Toggles)</p>
               <div class="flex flex-col gap-4">
                  <BaseSwitch label="Enable Notifications" v-model="form.switch1" />
                  <BaseSwitch label="Dark Mode" v-model="form.switch2" />
                  <BaseSwitch label="Disabled Switch" disabled v-model="form.switch3" />
               </div>
            </div>

            <div class="space-y-3 pt-2">
               <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Checkboxes</p>
               <div class="flex flex-col gap-2">
                  <BaseCheckbox label="Remember me" description="Save session for 30 days" v-model="form.checkbox1" />
                  <BaseCheckbox label="Subscribe to newsletter" v-model="form.checkbox2" />
                  <BaseCheckbox label="Disabled option" disabled v-model="form.checkbox3" />
               </div>
            </div>
             <div class="space-y-3 pt-2">
               <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Radio Buttons</p>
               <div class="flex flex-col gap-2">
                  <BaseRadio name="plan" label="Basic Plan" value="basic" v-model="form.radio" />
                  <BaseRadio name="plan" label="Pro Plan" description="Most popular choice" value="pro" v-model="form.radio" />
                  <BaseRadio name="plan" label="Enterprise" value="enterprise" disabled />
               </div>
            </div>
          </BaseCard>
        </div>
      </section>

      <!-- Badges & Cards -->
      <section class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
           <span class="material-symbols-outlined text-3xl text-blue-600">style</span>
           <h2 class="text-2xl font-black text-slate-900 dark:text-white">Badges & Cards</h2>
        </div>

         <BaseCard title="Status Badges" class="flex flex-wrap gap-4">
            <BaseBadge variant="success" dot>Active</BaseBadge>
            <BaseBadge variant="warning" dot>Pending</BaseBadge>
            <BaseBadge variant="error" dot>Failed</BaseBadge>
            <BaseBadge variant="info" icon="info">Info</BaseBadge>
            <BaseBadge variant="neutral">Draft</BaseBadge>
            <BaseBadge variant="primary" pulse dot>Processing</BaseBadge>
            <BaseBadge variant="orange" icon="star">Premium</BaseBadge>
         </BaseCard>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/ui/BaseInput.vue';
import BaseSelect from '../../components/ui/BaseSelect.vue';
import BaseCheckbox from '../../components/ui/BaseCheckbox.vue';
import BaseRadio from '../../components/ui/BaseRadio.vue';
import BaseBadge from '../../components/ui/BaseBadge.vue';
import BaseCard from '../../components/ui/BaseCard.vue';

const form = ref({
  text: '',
  email: '',
  error: '',
  select: '',
  textarea: '',
  checkbox1: true,
  checkbox2: false,
  checkbox3: false,
  radio: 'pro',
  switch1: true,
  switch2: false,
  switch3: false,
});
</script>
