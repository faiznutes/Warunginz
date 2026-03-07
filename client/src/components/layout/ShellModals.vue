<template>
  <div>
    <!-- Admin Info Modal -->
    <AdminInfoModal
      v-if="userRole === 'ADMIN_TENANT'"
      :show="showInfoModal"
      @close="$emit('update:showInfoModal', false)"
      @dont-show-today="$emit('dont-show-today')"
    />

    <!-- Keyboard Shortcuts Modal -->
    <KeyboardShortcutsModal 
      v-if="showShortcutsModal"
      :show="showShortcutsModal"
      @close="$emit('update:showShortcutsModal', false)"
    />

    <!-- Help Modal -->
    <HelpModal 
      v-if="showHelpModal"
      :show="showHelpModal"
      :helpContent="helpContent"
      @close="$emit('update:showHelpModal', false)"
    />

    <!-- Global Search -->
    <GlobalSearch ref="globalSearchRef" />

    <!-- Offline Indicator -->
    <OfflineIndicator />

    <!-- Welcome Tour -->
    <WelcomeTour />
    
    <!-- PWA Install Prompt -->
    <PWAInstallPrompt />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminInfoModal from '../AdminInfoModal.vue';
import KeyboardShortcutsModal from '../KeyboardShortcutsModal.vue';
import HelpModal from '../HelpModal.vue';
import GlobalSearch from '../GlobalSearch.vue';
import OfflineIndicator from '../OfflineIndicator.vue';
import WelcomeTour from '../WelcomeTour.vue';
import PWAInstallPrompt from '../PWAInstallPrompt.vue';

defineProps<{
  userRole: string;
  showInfoModal: boolean;
  showShortcutsModal?: boolean;
  showHelpModal?: boolean;
  helpContent?: any;
}>();

defineEmits([
  'update:showInfoModal', 
  'update:showShortcutsModal', 
  'update:showHelpModal',
  'dont-show-today'
]);

const globalSearchRef = ref<any>(null);

defineExpose({
  openGlobalSearch: () => globalSearchRef.value?.open()
});
</script>
