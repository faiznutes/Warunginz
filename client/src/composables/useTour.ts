import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const TOUR_STORAGE_KEY = 'welcome_tour_completed';
const TOUR_VERSION = '1.0'; // Increment to reset tour for all users

// Check if tour should be shown
const shouldShowTour = (userId?: string): boolean => {
  try {
    // If no user, don't show tour
    if (!userId) return false;
    
    const userSpecificKey = `${TOUR_STORAGE_KEY}_${userId}`;
    const completed = localStorage.getItem(userSpecificKey);
    if (!completed) return true;
    
    const data = JSON.parse(completed);
    // If version changed, show tour again
    if (data.version !== TOUR_VERSION) {
      return true;
    }
    
    return !data.completed;
  } catch (e) {
    console.warn('Failed to check tour status:', e);
    return false; // Don't show tour if we can't check
  }
};

// Mark tour as completed
const completeTour = (userId?: string) => {
  try {
    if (!userId) return;
    
    const userSpecificKey = `${TOUR_STORAGE_KEY}_${userId}`;
    localStorage.setItem(userSpecificKey, JSON.stringify({
      completed: true,
      version: TOUR_VERSION,
      completedAt: new Date().toISOString(),
    }));
  } catch (e) {
    console.warn('Failed to save tour completion:', e);
  }
};

// Reset tour (for testing or user preference)
const resetTour = (userId?: string) => {
  try {
    if (!userId) return;
    
    const userSpecificKey = `${TOUR_STORAGE_KEY}_${userId}`;
    localStorage.removeItem(userSpecificKey);
  } catch (e) {
    console.warn('Failed to reset tour:', e);
  }
};

export function useTour() {
  const show = ref(false);
  const currentStep = ref(0);
  const authStore = useAuthStore();
  
  onMounted(() => {
    // Check if tour should be shown after a short delay
    setTimeout(() => {
      const userId = authStore.user?.id;
      if (shouldShowTour(userId)) {
        show.value = true;
        currentStep.value = 0;
      }
    }, 1500); // Wait a bit longer for layout to settle
  });
  
  const next = () => {
    currentStep.value++;
  };
  
  const previous = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    }
  };
  
  const skip = () => {
    show.value = false;
    const userId = authStore.user?.id;
    completeTour(userId);
  };
  
  const finish = () => {
    show.value = false;
    const userId = authStore.user?.id;
    completeTour(userId);
  };
  
  const reset = () => {
    const userId = authStore.user?.id;
    resetTour(userId);
    show.value = true;
    currentStep.value = 0;
  };
  
  return {
    show,
    currentStep,
    next,
    previous,
    skip,
    finish,
    reset,
  };
}

