import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

/**
 * Composable to manage user-related layout logic.
 */
export function useLayoutUser() {
    const authStore = useAuthStore();

    const user = computed(() => authStore.user);
    const userName = computed(() => authStore.user?.name || 'User');
    const userEmail = computed(() => authStore.user?.email || '');
    const userRole = computed(() => (authStore.user?.role || '') as string);

    const userInitials = computed(() => {
        const name = userName.value;
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    });

    const handleLogout = () => {
        authStore.clearAuth();
        window.location.replace('/login');
    };

    return {
        user,
        userName,
        userEmail,
        userRole,
        userInitials,
        handleLogout,
    };
}
