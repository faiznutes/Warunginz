import { ref, computed } from 'vue';
import { useNotification } from './useNotification';
import { useAuthStore } from '../stores/auth';

export function useShiftReminder() {
  const { warning: showWarning } = useNotification();
  const authStore = useAuthStore();
  
  const currentShift = ref<any>(null);
  const shiftDurationHours = ref(0);
  const shouldShowReminder = computed(() => shiftDurationHours.value >= 8);
  let checkInterval: ReturnType<typeof setInterval> | null = null;
  const lastReminderShown = ref<Date | null>(null);

  const loadCurrentShift = async () => {
    try {
      const shiftContext = await authStore.getShiftContext(true);
      currentShift.value = shiftContext?.cashShift || null;
      
      if (currentShift.value && currentShift.value.shiftStart) {
        const shiftStart = new Date(currentShift.value.shiftStart);
        const now = new Date();
        const diffMs = now.getTime() - shiftStart.getTime();
        shiftDurationHours.value = diffMs / (1000 * 60 * 60);
        
        // Show reminder if shift is >= 8 hours and we haven't shown it in the last hour
        if (shouldShowReminder.value) {
          const now = new Date();
          const lastShown = lastReminderShown.value;
          
          // Only show if we haven't shown in the last hour
          if (!lastShown || (now.getTime() - lastShown.getTime()) > 60 * 60 * 1000) {
            showWarning(
              `Shift sudah berjalan ${Math.floor(shiftDurationHours.value)} jam. Pertimbangkan untuk tutup shift.`,
              'Pengingat Shift'
            );
            lastReminderShown.value = now;
          }
        }
      } else {
        shiftDurationHours.value = 0;
      }
    } catch (error: any) {
      // 404 means no active shift, which is fine
      if (error.response?.status !== 404) {
        console.error('Error loading current shift:', error);
      }
      currentShift.value = null;
      shiftDurationHours.value = 0;
    }
  };

  const startChecking = () => {
    // Check immediately
    loadCurrentShift();
    
    // Then check every 5 minutes
    checkInterval = setInterval(() => {
      loadCurrentShift();
    }, 5 * 60 * 1000);
  };

  const stopChecking = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  };

  return {
    currentShift,
    shiftDurationHours,
    shouldShowReminder,
    loadCurrentShift,
    startChecking,
    stopChecking,
  };
}

