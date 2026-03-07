const CACHE_PREFIX = 'warungin_cache_';
const CACHE_EXPIRY_PREFIX = 'warungin_cache_expiry_';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCache() {
  // Get cached data
  const getCached = <T>(key: string): T | null => {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      const expiry = localStorage.getItem(`${CACHE_EXPIRY_PREFIX}${key}`);
      
      if (!cached || !expiry) {
        return null;
      }
      
      // Check if cache is expired
      if (Date.now() > parseInt(expiry, 10)) {
        // Remove expired cache
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
        localStorage.removeItem(`${CACHE_EXPIRY_PREFIX}${key}`);
        return null;
      }
      
      return JSON.parse(cached) as T;
    } catch (e) {
      console.warn('Failed to get cached data:', e);
      return null;
    }
  };
  
  // Set cached data
  const setCached = <T>(key: string, data: T, duration: number = DEFAULT_CACHE_DURATION) => {
    try {
      const expiry = Date.now() + duration;
      localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
      localStorage.setItem(`${CACHE_EXPIRY_PREFIX}${key}`, expiry.toString());
    } catch (e) {
      console.warn('Failed to cache data:', e);
    }
  };
  
  // Clear cached data
  const clearCached = (key: string) => {
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      localStorage.removeItem(`${CACHE_EXPIRY_PREFIX}${key}`);
    } catch (e) {
      console.warn('Failed to clear cache:', e);
    }
  };
  
  // Clear all cache
  const clearAllCache = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_EXPIRY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear all cache:', e);
    }
  };
  
  return {
    getCached,
    setCached,
    clearCached,
    clearAllCache,
  };
}

