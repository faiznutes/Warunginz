import { ref, onMounted, onUnmounted } from 'vue';

export interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // Distance in pixels to trigger refresh
  maxPullDistance?: number; // Maximum pull distance
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const { onRefresh, threshold = 80, maxPullDistance = 120 } = options;
  
  const isPulling = ref(false);
  const pullDistance = ref(0);
  const isRefreshing = ref(false);
  const startY = ref(0);
  const currentY = ref(0);

  const handleTouchStart = (e: TouchEvent) => {
    // Only enable if at the top of the page
    if (window.scrollY > 10) return;
    
    startY.value = e.touches[0].clientY;
    isPulling.value = true;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling.value) return;
    
    currentY.value = e.touches[0].clientY;
    const deltaY = currentY.value - startY.value;
    
    // Only allow pull down (positive deltaY)
    if (deltaY > 0 && window.scrollY === 0) {
      // Prevent default scrolling while pulling
      e.preventDefault();
      
      // Calculate pull distance with resistance
      const resistance = 0.5; // Add resistance after threshold
      if (deltaY <= threshold) {
        pullDistance.value = deltaY;
      } else {
        pullDistance.value = threshold + (deltaY - threshold) * resistance;
      }
      
      // Cap at max distance
      if (pullDistance.value > maxPullDistance) {
        pullDistance.value = maxPullDistance;
      }
    } else {
      pullDistance.value = 0;
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.value) return;
    
    isPulling.value = false;
    
    // Trigger refresh if pulled past threshold
    if (pullDistance.value >= threshold) {
      isRefreshing.value = true;
      try {
        await onRefresh();
      } finally {
        isRefreshing.value = false;
        pullDistance.value = 0;
      }
    } else {
      // Animate back to 0
      pullDistance.value = 0;
    }
  };

  const setupListeners = () => {
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const removeListeners = () => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  onMounted(() => {
    setupListeners();
  });

  onUnmounted(() => {
    removeListeners();
  });

  return {
    isPulling,
    pullDistance,
    isRefreshing,
  };
}

