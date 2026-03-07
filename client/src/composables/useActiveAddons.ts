import { ref, computed } from 'vue';
import api from '../api';
import { useAuthStore } from '../stores/auth';

/**
 * Composable to manage active addons for a tenant.
 * Uses shared state to avoid multiple API calls during layout transitions.
 */

const activeAddonsRaw = ref<any[]>([]);
const isLoaded = ref(false);
const isLoading = ref(false);

export function useActiveAddons() {
    const authStore = useAuthStore();
    const userRole = computed(() => authStore.user?.role || '');

    /**
     * Safe helper to normalize addon data into an array.
     */
    const normalizeAddons = (value: any): any[] => {
        try {
            if (Array.isArray(value)) return value;
            if (value && typeof value === 'object') {
                if (Array.isArray(value.data)) return value.data;
                if (Array.isArray(value.addons)) return value.addons;
            }
            return [];
        } catch (error) {
            console.error('[useActiveAddons] Normalization error:', error);
            return [];
        }
    };

    /**
     * Load addons from the API.
     */
    const loadAddons = async (force = false) => {
        if ((isLoaded.value && !force) || isLoading.value) return;

        // Only fetch for roles that can manage or use specific addons
        if (userRole.value !== 'ADMIN_TENANT' && userRole.value !== 'SUPER_ADMIN' && userRole.value !== 'SUPERVISOR') {
            return;
        }

        isLoading.value = true;
        try {
            const response = await api.get('/addons');
            activeAddonsRaw.value = normalizeAddons(response.data);
            isLoaded.value = true;
        } catch (error) {
            console.error('[useActiveAddons] Failed to load addons:', error);
            activeAddonsRaw.value = [];
        } finally {
            isLoading.value = false;
        }
    };

    /**
     * Check if a specific addon type is active.
     */
    const hasAddon = (addonType: string) => {
        return activeAddonsRaw.value.some(
            (addon: any) => addon && addon.addonType === addonType && addon.status === 'active'
        );
    };

    return {
        activeAddons: computed(() => activeAddonsRaw.value),
        isLoaded: computed(() => isLoaded.value),
        isLoading: computed(() => isLoading.value),
        loadAddons,
        hasAddon,
        hasBusinessAnalytics: computed(() => hasAddon('BUSINESS_ANALYTICS')),
        hasDeliveryMarketing: computed(() => hasAddon('DELIVERY_MARKETING')),
    };
}
