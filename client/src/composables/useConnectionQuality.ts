import { ref, onMounted, onUnmounted, computed } from 'vue';

type ConnectionQuality = 'good' | 'poor' | 'offline';

export function useConnectionQuality() {
    const isOnline = ref(navigator.onLine);
    const latency = ref<number | null>(null);
    const lastCheck = ref<Date | null>(null);
    const checkInterval = ref<number | null>(null);

    const quality = computed<ConnectionQuality>(() => {
        if (!isOnline.value) return 'offline';
        if (latency.value === null) return 'good'; // Assume good until checked
        if (latency.value > 500) return 'poor';
        return 'good';
    });

    const checkConnection = async () => {
        if (!navigator.onLine) {
            isOnline.value = false;
            latency.value = null;
            return;
        }

        const start = performance.now();
        try {
            // Use efficient HEAD request to a reliable endpoint (e.g., API health or favicon)
            // using no-cache to get real network latency
            await fetch('/api/health', {
                method: 'HEAD',
                cache: 'no-store',
                signal: AbortSignal.timeout(5000) // 5s timeout
            });

            const end = performance.now();
            latency.value = Math.round(end - start);
            isOnline.value = true;
            lastCheck.value = new Date();
        } catch (error) {
            // If fetch fails, we might be offline or server is down
            console.warn('Connection check failed:', error);
            // Don't immediately mark offline on one failure unless it's a network error
            // But for simplicity, if we leverage window 'offline' event, we can be less aggressive here.
            // We'll just mark latency as high/unknown or leave it.
            // If it helps, we can mark as poor.
            latency.value = 9999;
        }
    };

    const handleOnline = () => { isOnline.value = true; checkConnection(); };
    const handleOffline = () => { isOnline.value = false; };

    onMounted(() => {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        checkConnection();

        // Periodic check every 30 seconds
        checkInterval.value = window.setInterval(checkConnection, 30000);
    });

    onUnmounted(() => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        if (checkInterval.value) clearInterval(checkInterval.value);
    });

    return {
        isOnline,
        quality,
        latency,
        checkConnection
    };
}
