import { Router } from 'vue-router';
import { useAuthStore } from '../stores/auth';

/**
 * Helper function untuk redirect ke dashboard yang sesuai berdasarkan role
 * Super Admin akan diarahkan ke super-dashboard, role lain ke dashboard
 */
export const navigateToDashboard = (router: Router) => {
  const authStore = useAuthStore();
  const userRole = authStore.user?.role;
  
  if (userRole === 'SUPER_ADMIN') {
    router.push({ name: 'super-dashboard' });
  } else {
    router.push({ name: 'dashboard' });
  }
};

/**
 * Helper function untuk mendapatkan route name dashboard yang sesuai berdasarkan role
 */
export const getDashboardRoute = (): string => {
  const authStore = useAuthStore();
  const userRole = authStore.user?.role;
  
  return userRole === 'SUPER_ADMIN' ? 'super-dashboard' : 'dashboard';
};

/**
 * Helper function untuk mendapatkan path dashboard yang sesuai berdasarkan role
 */
export const getDashboardPath = (): string => {
  const authStore = useAuthStore();
  const userRole = authStore.user?.role;
  
  return userRole === 'SUPER_ADMIN' ? '/app/super-dashboard' : '/app/dashboard';
};
