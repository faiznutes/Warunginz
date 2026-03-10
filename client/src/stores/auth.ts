import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api';
import { safeFilter } from '../utils/array-helpers';
import {
  buildShiftContext,
  getAllowedStoreIdsFromUser,
  getAssignedStoreIdFromUser,
  normalizeOpenCashShift,
  normalizeOpenStoreShift,
  ShiftContext,
} from '../utils/shift-state';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  tenantName: string | null;
  permissions?: any;
  isActive?: boolean;
  subscriptionEnd?: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // Token storage strategy:
  // - rememberMe=true: localStorage (persists across browser restarts)
  // - rememberMe=false: sessionStorage (cleared on tab close)
  // - On init: try both, prioritize localStorage then sessionStorage

  // Initialize token - try localStorage first, then sessionStorage
  let initialToken: string | null = localStorage.getItem('token');
  if (!initialToken) {
    initialToken = sessionStorage.getItem('token');
  }

  const token = ref<string | null>(initialToken);
  const rememberMe = ref<boolean>(localStorage.getItem('rememberMe') === 'true');
  const user = ref<User | null>(null);
  const tenants = ref<Tenant[]>([]);
  const selectedTenantId = ref<string | null>(localStorage.getItem('selectedTenantId'));
  const selectedStoreId = ref<string | null>(localStorage.getItem('selectedStoreId'));

  // Shift status caching for CASHIER role - prevents excessive API calls
  const shiftStatus = ref<any | null>(null);
  const shiftContext = ref<ShiftContext | null>(null);
  const shiftStatusCheckedAt = ref<number>(0);
  const SHIFT_CACHE_DURATION = 5000; // Cache shift status for 5 seconds

  // M-5 FIX: Request deduplication for fetchMe() calls
  // Prevents multiple simultaneous /auth/me requests
  let pendingFetchMePromise: Promise<any> | null = null;

  const isAuthenticated = computed(() => {
    // Check if token exists
    const hasToken = token.value;
    // Return false immediately if no token to avoid flash
    if (!hasToken) {
      return false;
    }
    // Also check user object exists
    return !!user.value;
  });
  const isSuperAdmin = computed(() => user.value?.role === 'SUPER_ADMIN');
  const currentTenantId = computed(() => {
    if (isSuperAdmin.value && selectedTenantId.value) {
      return selectedTenantId.value;
    }
    return user.value?.tenantId || null;
  });

  const currentStoreId = computed(() => selectedStoreId.value);

  const isSubscriptionActive = computed(() => {
    if (isSuperAdmin.value) return true;
    if (!user.value?.subscriptionEnd) return true; // Default to active if not provided? Or false? 
    // Usually, if it's missing, we might assume it's an old user or not loaded yet.
    // But global rules say: "Subscription check HANYA di CREATE".
    return new Date(user.value.subscriptionEnd) > new Date();
  });

  // Check if shift status cache is still valid
  const isShiftCacheValid = computed(() => {
    return (Date.now() - shiftStatusCheckedAt.value) < SHIFT_CACHE_DURATION;
  });

  const persistUser = (userData: User | null) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  const normalizeUser = (rawUser: any): User | null => {
    if (!rawUser || typeof rawUser !== 'object') {
      return null;
    }

    return {
      id: rawUser.id,
      email: rawUser.email,
      name: rawUser.name,
      role: rawUser.role,
      tenantId: rawUser.tenantId ?? null,
      tenantName: rawUser.tenantName ?? null,
      permissions: rawUser.permissions ?? null,
      isActive: rawUser.isActive,
      subscriptionEnd: rawUser.subscriptionEnd ?? null,
    };
  };

  const syncRoleContext = (userData: User | null = user.value) => {
    if (!userData) {
      return;
    }

    if (userData.role === 'CASHIER' || userData.role === 'KITCHEN') {
      setSelectedStore(getAssignedStoreIdFromUser(userData));
      return;
    }

    if (userData.role === 'SUPERVISOR') {
      const allowedStoreIds = getAllowedStoreIdsFromUser(userData);
      if (allowedStoreIds.length === 0) {
        setSelectedStore(null);
        return;
      }

      const savedStoreId = selectedStoreId.value || localStorage.getItem('selectedStoreId');
      const resolvedStoreId = savedStoreId && allowedStoreIds.includes(savedStoreId)
        ? savedStoreId
        : allowedStoreIds[0];
      setSelectedStore(resolvedStoreId);
      return;
    }
  };

  /**
   * Set authentication with token and user data
   * respects rememberMe preference for token persistence
   */
  const setAuth = (newToken: string, userData: User, remember: boolean = false) => {
    token.value = newToken;
    user.value = userData;
    rememberMe.value = remember;

    // Clear all storage first to ensure clean state
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('rememberMe');

    // Store token based on remember me preference
    if (remember) {
      // Persist across sessions
      localStorage.setItem('token', newToken);
      localStorage.setItem('rememberMe', 'true');
    } else {
      // Clear on session end (tab close)
      sessionStorage.setItem('token', newToken);
      localStorage.setItem('rememberMe', 'false');
    }

    // Always store user data in localStorage for faster access
    persistUser(userData);
    syncRoleContext(userData);

    // Clear shift status cache on new auth
    invalidateShiftCache();
  };

  /**
   * Clear all authentication data from both storage locations
   * Ensures complete logout
   */
  const clearAuth = () => {
    token.value = null;
    user.value = null;
    rememberMe.value = false;

    // Clear from BOTH storage locations to ensure complete cleanup
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');

    tenants.value = [];
    selectedTenantId.value = null;
    localStorage.removeItem('selectedTenantId');
    selectedStoreId.value = null;
    localStorage.removeItem('selectedStoreId');

    // Clear shift status on logout
    invalidateShiftCache();
  };

  // Restore user from localStorage on init
  const restoreUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        user.value = normalizeUser(JSON.parse(storedUser));
        syncRoleContext(user.value);
      }
    } catch (error) {
      console.error('Failed to restore user:', error);
    }
  };

  const login = async (email: string, password: string, remember: boolean = false) => {
    const response = await api.post('/auth/login', { email, password });
    const userData = normalizeUser(response.data.user);
    const token = response.data.token;

    if (!userData || !token) {
      throw new Error('Login response is missing user or token');
    }

    // IMPORTANT: Set token FIRST before calling /auth/me
    // This ensures the Authorization header is included in the request
    setAuth(token, userData, remember);

    // Always fetch fresh user data including permissions from /auth/me
    // This ensures we have the latest permissions and all user data
    try {
      const meResponse = await api.get('/auth/me');
      const normalizedUser = normalizeUser(meResponse.data.user);
      if (normalizedUser) {
        user.value = normalizedUser;
        persistUser(normalizedUser);
        syncRoleContext(normalizedUser);
      }
    } catch (error) {
      console.warn('Failed to fetch user permissions after login:', error);
      // If /auth/me fails, use permissions from login response if available
      if (!userData.permissions) {
        userData.permissions = null;
      }
    }

    return response.data;
  };

  // Register removed - only super admin can create tenants

  const logout = () => {
    clearAuth();
    tenants.value = [];
    selectedTenantId.value = null;
    localStorage.removeItem('selectedTenantId');
    // Clear any pending requests by redirecting immediately
    // This prevents any pending API calls from showing error messages
  };

  const fetchTenants = async () => {
    try {
      const response = await api.get('/tenants');
      // Handle different response formats
      let tenantList: any[] = [];
      if (Array.isArray(response.data)) {
        tenantList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        tenantList = response.data.data;
      }

      // Filter out System tenant (double check, backend already filters)
      // Use safe filter to ensure array
      tenants.value = safeFilter(tenantList, (tenant: any) => tenant && tenant.name !== 'System');
      return tenants.value;
    } catch (error) {
      console.error('Error fetching tenants:', error);
      tenants.value = [];
      return [];
    }
  };

  const setSelectedTenant = (tenantId: string | null) => {
    selectedTenantId.value = tenantId;
    if (tenantId) {
      localStorage.setItem('selectedTenantId', tenantId);
    } else {
      localStorage.removeItem('selectedTenantId');
    }
    // Clear store selection when tenant changes
    selectedStoreId.value = null;
    localStorage.removeItem('selectedStoreId');
    invalidateShiftCache();
  };

  const setSelectedStore = (storeId: string | null) => {
    selectedStoreId.value = storeId;
    if (storeId) {
      localStorage.setItem('selectedStoreId', storeId);
    } else {
      localStorage.removeItem('selectedStoreId');
    }
    invalidateShiftCache();
  };

  const fetchMe = async () => {
    // M-5 FIX: Return pending promise if fetchMe is already in progress
    // This prevents duplicate /auth/me requests on rapid reconnects
    if (pendingFetchMePromise) {
      console.log('[Auth] FetchMe already in progress, reusing pending promise');
      return pendingFetchMePromise;
    }

    // Create the promise and store it while request is pending
    pendingFetchMePromise = (async () => {
      try {
        // Ensure token is available
        const currentToken = token.value || localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!currentToken) {
          throw new Error('No token available');
        }

        // Set token in store if not already set
        if (!token.value && currentToken) {
          token.value = currentToken;
        }

        const response = await api.get('/auth/me');
        const normalizedUser = normalizeUser(response.data.user);
        user.value = normalizedUser;

        // Update stored user data
        persistUser(normalizedUser);
        syncRoleContext(normalizedUser);

        if (normalizedUser?.role === 'CASHIER') {
          try {
            await getShiftContext(true);
            console.log('[Auth] Shift context loaded on session restore');
          } catch (shiftError) {
            console.warn('[Auth] Could not load shift context during session restore:', shiftError);
          }
        }

        return response.data;
      } catch (error) {
        // Only clear auth if it's a real authentication error (401 or 404)
        // Don't clear if it's just a network error or server error (500)
        if (error && typeof error === 'object' && 'response' in error) {
          const httpError = error as { response?: { status?: number } };
          const status = httpError.response?.status;
          if (status === 401 || status === 404) {
            clearAuth();
          }
          // For 500 errors, log but don't clear auth (might be temporary server issue)
          if (status === 500) {
            console.error('Server error in /auth/me:', error);
          }
        }
        throw error;
      } finally {
        // Clear pending promise when request completes (success or error)
        pendingFetchMePromise = null;
      }
    })();

    return pendingFetchMePromise;
  };

  const getShiftContext = async (force = false) => {
    if (!force && isShiftCacheValid.value && shiftContext.value) {
      return shiftContext.value;
    }

    if (user.value?.role !== 'CASHIER') {
      shiftContext.value = null;
      shiftStatus.value = null;
      shiftStatusCheckedAt.value = Date.now();
      return null;
    }

    const resolvedStoreId =
      getAssignedStoreIdFromUser(user.value) ||
      selectedStoreId.value ||
      localStorage.getItem('selectedStoreId');

    try {
      const [cashShiftResult, storeShiftResult] = await Promise.all([
        api.get('/cash-shift/current', { params: { includeTotals: false } }).catch((error: any) => {
          if (error.response?.status === 404) {
            return { data: null };
          }
          throw error;
        }),
        resolvedStoreId
          ? api.get('/store-shift/current', { params: { outletId: resolvedStoreId } }).catch((error: any) => {
              if (error.response?.status === 404) {
                return { data: null };
              }
              throw error;
            })
          : Promise.resolve({ data: null }),
      ]);

      const cashShift = normalizeOpenCashShift(cashShiftResult.data);
      const storeShift = normalizeOpenStoreShift(storeShiftResult.data);
      const context = buildShiftContext({
        storeId: resolvedStoreId || null,
        cashShift,
        storeShift,
      });

      shiftContext.value = context;
      shiftStatus.value = context.cashShift;
      shiftStatusCheckedAt.value = Date.now();

      return context;
    } catch (error) {
      shiftContext.value = null;
      shiftStatus.value = null;
      shiftStatusCheckedAt.value = 0;
      console.warn('Failed to fetch shift context:', error);
      return null;
    }
  };

  const getShiftStatus = async () => {
    const context = await getShiftContext();
    return context?.cashShift || null;
  };

  /**
   * Clear shift cache when needed (e.g., after opening/closing shift)
   */
  const invalidateShiftCache = () => {
    shiftStatus.value = null;
    shiftContext.value = null;
    shiftStatusCheckedAt.value = 0;
  };

  // Initialize user from localStorage after all store helpers are ready
  restoreUser();

  return {
    token,
    user,
    tenants,
    selectedTenantId,
    selectedStoreId,
    isAuthenticated,
    isSuperAdmin,
    currentTenantId,
    currentStoreId,
    isSubscriptionActive,
    shiftStatus,
    shiftContext,
    isShiftCacheValid,
    login,
    logout,
    fetchMe,
    fetchTenants,
    setSelectedTenant,
    setSelectedStore,
    clearAuth, // Export clearAuth for use in App.vue
    getShiftContext,
    getShiftStatus,
    invalidateShiftCache,
  };
});

