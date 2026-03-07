import { ref } from 'vue';
import api from '../api';

const pendingOrdersCount = ref(0);
let interval: any = null;

export function usePendingOrders() {
    const fetchPendingOrdersCount = async () => {
        try {
            const response = await api.get('/orders?status=PENDING&limit=1');
            pendingOrdersCount.value = response.data?.pagination?.totalItems || 0;
        } catch (error) {
            console.error('[usePendingOrders] Failed to fetch count:', error);
        }
    };

    const startPolling = (ms = 30000) => {
        stopPolling();
        fetchPendingOrdersCount();
        interval = setInterval(fetchPendingOrdersCount, ms);
    };

    const stopPolling = () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    };

    return {
        pendingOrdersCount,
        fetchPendingOrdersCount,
        startPolling,
        stopPolling,
    };
}
