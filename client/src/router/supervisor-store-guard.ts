import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
    getAllowedStoreIdsFromUser,
    getAssignedStoreIdFromUser,
} from '../utils/shift-state';

export const checkStoreAccess = async (
    to: RouteLocationNormalized,
    next: NavigationGuardNext
) => {
    const authStore = useAuthStore();
    const hasToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (hasToken && authStore.user && authStore.isAuthenticated) {
        const userRole = authStore.user.role;
        // ADMIN_TENANT tidak perlu toko - skip check
        const requiresStore = ['CASHIER', 'SUPERVISOR', 'KITCHEN'].includes(userRole);
        const selectedStoreId = authStore.selectedStoreId || localStorage.getItem('selectedStoreId');
        const assignedStoreId = getAssignedStoreIdFromUser(authStore.user);
        const allowedStoreIds = getAllowedStoreIdsFromUser(authStore.user);

        if (userRole === 'CASHIER' || userRole === 'KITCHEN') {
            if (assignedStoreId && selectedStoreId !== assignedStoreId) {
                authStore.setSelectedStore(assignedStoreId);
            }

            if (!assignedStoreId && to.name !== 'login' && to.name !== 'unauthorized') {
                next({
                    name: 'unauthorized',
                    query: { message: 'Akun Anda belum memiliki store aktif. Hubungi admin tenant.' }
                });
                return true;
            }

            return false;
        }

        if (userRole === 'SUPERVISOR' && allowedStoreIds.length > 0) {
            const resolvedStoreId = selectedStoreId && allowedStoreIds.includes(selectedStoreId)
                ? selectedStoreId
                : allowedStoreIds[0];

            if (resolvedStoreId && selectedStoreId !== resolvedStoreId) {
                authStore.setSelectedStore(resolvedStoreId);
            }
        }

        if (requiresStore && !authStore.selectedStoreId && to.name !== 'login' && to.name !== 'unauthorized') {
            const warning = userRole === 'SUPERVISOR'
                ? 'Supervisor belum memiliki store yang diizinkan. Hubungi admin tenant.'
                : 'Akun Anda belum memiliki store aktif. Hubungi admin tenant.';
            next({
                name: 'unauthorized',
                query: { message: warning }
            });
            return true;
        }
    }
    return false; // Proceed to next checks
};
