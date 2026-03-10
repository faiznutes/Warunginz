import { ref, onMounted, onUnmounted } from 'vue';

export interface InfiniteScrollOptions {
  onLoadMore: () => Promise<void> | void;
  threshold?: number; // Distance from bottom in pixels to trigger load
  enabled?: () => boolean; // Condition to enable infinite scroll
}

export function useInfiniteScroll(options: InfiniteScrollOptions) {
  const { onLoadMore, threshold = 200, enabled = () => true } = options;
  
  const isLoading = ref(false);
  const hasMore = ref(true);
  const isInitialized = ref(false);

  const handleScroll = async () => {
    if (!enabled() || isLoading.value || !hasMore.value) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Check if user is near bottom
    if (scrollTop + windowHeight >= documentHeight - threshold) {
      isLoading.value = true;
      try {
        await onLoadMore();
      } catch (error) {
        console.error('Error in infinite scroll load:', error);
      } finally {
        isLoading.value = false;
      }
    }
  };

  const setupScrollListener = () => {
    if (isInitialized.value) return;
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    isInitialized.value = true;
  };

  const removeScrollListener = () => {
    if (!isInitialized.value) return;
    
    window.removeEventListener('scroll', handleScroll);
    isInitialized.value = false;
  };

  onMounted(() => {
    setupScrollListener();
  });

  onUnmounted(() => {
    removeScrollListener();
  });

  return {
    isLoading,
    hasMore,
    setHasMore: (value: boolean) => {
      hasMore.value = value;
    },
    setupScrollListener,
    removeScrollListener,
  };
}

