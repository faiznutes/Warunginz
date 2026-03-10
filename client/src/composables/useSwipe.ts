import { ref, onMounted, onUnmounted } from 'vue';

export interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance to trigger swipe (default: 50px)
  velocityThreshold?: number; // Minimum velocity (default: 0.3)
}

export function useSwipe(element: HTMLElement | null, options: SwipeOptions = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocityThreshold = 0.3,
  } = options;

  const startX = ref(0);
  const startY = ref(0);
  const startTime = ref(0);
  const isSwiping = ref(false);
  const swipeDistance = ref(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (!e.touches[0]) return;
    startX.value = e.touches[0].clientX;
    startY.value = e.touches[0].clientY;
    startTime.value = Date.now();
    isSwiping.value = true;
    swipeDistance.value = 0;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwiping.value || !e.touches[0]) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - startX.value;
    const deltaY = currentY - startY.value;
    
    swipeDistance.value = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isSwiping.value) return;
    
    if (!e.changedTouches[0]) {
      isSwiping.value = false;
      return;
    }
    
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX.value;
    const deltaY = endY - startY.value;
    const deltaTime = Date.now() - startTime.value;
    
    const distance = Math.abs(deltaX) > Math.abs(deltaY) ? Math.abs(deltaX) : Math.abs(deltaY);
    const velocity = distance / deltaTime;
    
    // Check if swipe meets threshold
    if (distance < threshold || velocity < velocityThreshold) {
      isSwiping.value = false;
      swipeDistance.value = 0;
      return;
    }
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
    
    isSwiping.value = false;
    swipeDistance.value = 0;
  };

  onMounted(() => {
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  });

  onUnmounted(() => {
    if (element) {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    }
  });

  return {
    isSwiping,
    swipeDistance,
  };
}

