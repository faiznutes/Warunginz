import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';

export function useSystemStatus() {
    const authStore = useAuthStore();

    // Online Status
    const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const updateOnlineStatus = () => {
        if (typeof navigator !== 'undefined') {
            isOnline.value = navigator.onLine;
        }
    };

    // Clock
    const currentTime = ref('');
    const updateTime = () => {
        const now = new Date();
        // Using simple format HH:mm
        currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };
    let clockInterval: number | undefined;

    // Outlet & Branch Info
    // Assuming tenantName is the Outlet Name
    const outletName = computed(() => authStore.user?.tenantName || 'Warungin Outlet');

    // Assuming 'storeName' or similar might exist on user object, or defaulting to 'Main Branch'
    // We treat 'Cabang' as the Store/Branch
    const branchName = computed(() => {
        const user: any = authStore.user;
        return user?.storeName || user?.branchName || (user?.permissions?.assignedQueue ? 'Dapur' : 'Pusat');
    });

    onMounted(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', updateOnlineStatus);
            window.addEventListener('offline', updateOnlineStatus);
            updateTime();
            clockInterval = window.setInterval(updateTime, 1000);
        }
    });

    onUnmounted(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
            if (clockInterval) clearInterval(clockInterval);
        }
    });

    return {
        isOnline,
        currentTime,
        outletName,
        branchName
    };
}
