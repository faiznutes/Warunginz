import { ref, onMounted } from 'vue';

const TOOLTIP_STORAGE_KEY = 'tooltips_shown';

// Track which tooltips have been shown
const shownTooltips = ref<Set<string>>(new Set());

// Load shown tooltips from localStorage
const loadShownTooltips = () => {
  try {
    const stored = localStorage.getItem(TOOLTIP_STORAGE_KEY);
    if (stored) {
      const tooltipIds = JSON.parse(stored);
      shownTooltips.value = new Set(tooltipIds);
    }
  } catch (e) {
    console.warn('Failed to load shown tooltips:', e);
    shownTooltips.value = new Set();
  }
};

// Save shown tooltip to localStorage
const markTooltipAsShown = (tooltipId: string) => {
  shownTooltips.value.add(tooltipId);
  try {
    localStorage.setItem(TOOLTIP_STORAGE_KEY, JSON.stringify(Array.from(shownTooltips.value)));
  } catch (e) {
    console.warn('Failed to save shown tooltip:', e);
  }
};

// Check if tooltip should be shown (first time only)
const shouldShowTooltip = (tooltipId: string): boolean => {
  return !shownTooltips.value.has(tooltipId);
};

// Reset all tooltips (for testing or user preference)
const resetTooltips = () => {
  shownTooltips.value.clear();
  try {
    localStorage.removeItem(TOOLTIP_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to reset tooltips:', e);
  }
};

// Initialize on mount
onMounted(() => {
  loadShownTooltips();
});

export function useTooltip(tooltipId: string) {
  const show = ref(shouldShowTooltip(tooltipId));
  
  const dismiss = () => {
    show.value = false;
    markTooltipAsShown(tooltipId);
  };
  
  const reset = () => {
    shownTooltips.value.delete(tooltipId);
    show.value = shouldShowTooltip(tooltipId);
  };
  
  return {
    show,
    dismiss,
    reset,
    shouldShow: () => shouldShowTooltip(tooltipId),
  };
}

export { resetTooltips };

