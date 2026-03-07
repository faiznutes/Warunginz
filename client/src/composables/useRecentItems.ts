import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

export interface RecentItem {
  path: string;
  name: string;
  icon: string;
  timestamp: number;
  type?: 'product' | 'order' | 'customer' | 'report' | 'other';
}

const RECENT_ITEMS_KEY = 'recent_items';
const MAX_RECENT_ITEMS = 5;

// Route name mapping to display names and icons
const routeConfig: Record<string, { name: string; icon: string; type: RecentItem['type'] }> = {
  'dashboard': { name: 'Dashboard', icon: 'dashboard', type: 'other' },
  'products': { name: 'Produk', icon: 'inventory_2', type: 'product' },
  'products-adjustments': { name: 'Penyesuaian Stok', icon: 'inventory', type: 'product' },
  'orders': { name: 'Pesanan', icon: 'receipt_long', type: 'order' },
  'orders-kitchen': { name: 'Dapur', icon: 'restaurant_menu', type: 'order' },
  'customers': { name: 'Pelanggan', icon: 'person', type: 'customer' },
  'reports': { name: 'Laporan', icon: 'assessment', type: 'report' },
  'reports-global': { name: 'Laporan Global', icon: 'bar_chart', type: 'report' },
  'reports-advanced': { name: 'Laporan Lanjutan', icon: 'analytics', type: 'report' },
  'settings': { name: 'Pengaturan', icon: 'settings', type: 'other' },
  'pos': { name: 'POS', icon: 'point_of_sale', type: 'other' },
};

export function useRecentItems() {
  const recentItems = ref<RecentItem[]>([]);
  const route = useRoute();

  // Load recent items from localStorage
  const loadRecentItems = () => {
    try {
      const stored = localStorage.getItem(RECENT_ITEMS_KEY);
      if (stored) {
        recentItems.value = JSON.parse(stored).slice(0, MAX_RECENT_ITEMS);
      }
    } catch (e) {
      console.warn('Failed to load recent items:', e);
      recentItems.value = [];
    }
  };

  // Save recent items to localStorage
  const saveRecentItems = () => {
    try {
      localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(recentItems.value));
    } catch (e) {
      console.warn('Failed to save recent items:', e);
    }
  };

  // Add current route to recent items
  const addRecentItem = (path: string, customName?: string, customIcon?: string) => {
    // Skip if it's already the most recent
    if (recentItems.value.length > 0 && recentItems.value[0].path === path) {
      return;
    }

    // Skip dashboard and login routes
    if (path === '/app/dashboard' || path.includes('/login')) {
      return;
    }

    // Remove if already exists
    const existingIndex = recentItems.value.findIndex(item => item.path === path);
    if (existingIndex !== -1) {
      recentItems.value.splice(existingIndex, 1);
    }

    // Get route name from path or use custom
    const routeName = route.name as string || path.split('/').pop() || 'unknown';
    const config = routeConfig[routeName] || { name: customName || routeName, icon: customIcon || 'link', type: 'other' as RecentItem['type'] };

    // Add to beginning
    recentItems.value.unshift({
      path,
      name: customName || config.name,
      icon: customIcon || config.icon,
      type: config.type,
      timestamp: Date.now(),
    });

    // Keep only MAX_RECENT_ITEMS
    if (recentItems.value.length > MAX_RECENT_ITEMS) {
      recentItems.value = recentItems.value.slice(0, MAX_RECENT_ITEMS);
    }

    saveRecentItems();
  };

  // Clear recent items
  const clearRecentItems = () => {
    recentItems.value = [];
    saveRecentItems();
  };

  // Get recent items grouped by type
  const groupedRecentItems = computed(() => {
    const groups: Record<string, RecentItem[]> = {
      product: [],
      order: [],
      customer: [],
      report: [],
      other: [],
    };

    recentItems.value.forEach(item => {
      if (item.type && groups[item.type]) {
        groups[item.type].push(item);
      } else {
        groups.other.push(item);
      }
    });

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([type, items]) => ({ type, items }));
  });

  // Initialize
  loadRecentItems();

  return {
    recentItems: computed(() => recentItems.value),
    groupedRecentItems,
    addRecentItem,
    clearRecentItems,
    loadRecentItems,
  };
}

