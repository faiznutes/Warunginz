import { ref } from 'vue';
import api from '../api';

const criticalStockCount = ref(0);
const loading = ref(false);

export function useStockAlerts() {
    const fetchCriticalStock = async () => {
        loading.value = true;
        try {
            const response = await api.get('/products');
            const products = response.data.data || response.data;
            if (Array.isArray(products)) {
                // Ensure stock and minStock are numbers
                criticalStockCount.value = products.filter((p: any) => {
                    const stock = Number(p.stock);
                    const minStock = Number(p.minStock);
                    return stock <= minStock;
                }).length;
            }
        } catch (error) {
            console.error('Failed to fetch low stock count', error);
            criticalStockCount.value = 0;
        } finally {
            loading.value = false;
        }
    };

    return {
        criticalStockCount,
        fetchCriticalStock,
        loading
    };
}
