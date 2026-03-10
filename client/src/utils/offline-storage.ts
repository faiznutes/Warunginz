/**
 * Offline Storage Utility
 * Uses IndexedDB for offline data storage and sync
 */

interface OfflineAction {
  id: string;
  type: 'order' | 'transaction' | 'product' | 'customer';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
}

interface OfflineOrder {
  id: string; // UUID untuk transaksi offline
  orderData: any;
  timestamp: number;
  synced: boolean;
  serverOrderId?: string; // ID dari server setelah sync
  syncFailed?: boolean; // Mark if sync failed
  syncError?: string; // Error message if sync failed
  retryCount?: number; // Number of retry attempts
}

interface OfflineProduct {
  id: string;
  data: any;
  timestamp: number;
}

class OfflineStorage {
  private dbName = 'warungin-offline';
  private dbVersion = 2; // Increment version untuk schema baru
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for offline actions
        if (!db.objectStoreNames.contains('actions')) {
          const actionStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionStore.createIndex('type', 'type', { unique: false });
          actionStore.createIndex('synced', 'synced', { unique: false });
          actionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create object store for cached data
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create object store for offline orders
        if (!db.objectStoreNames.contains('orders')) {
          const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
          orderStore.createIndex('synced', 'synced', { unique: false });
          orderStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create object store for cached products
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Store offline action
   */
  async storeAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineAction: OfflineAction = {
      id,
      ...action,
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const request = store.add(offlineAction);

      request.onsuccess = () => {
        console.log('Offline action stored:', id);
        resolve(id);
      };

      request.onerror = () => {
        console.error('Failed to store offline action:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all unsynced actions
   */
  async getUnsyncedActions(): Promise<OfflineAction[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(0)); // 0 = false in IndexedDB

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get unsynced actions:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Mark action as synced
   */
  async markAsSynced(actionId: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const getRequest = store.get(actionId);

      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.synced = true;
          const updateRequest = store.put(action);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Cache API response
   */
  async cacheResponse(key: string, data: any, ttl: number = 3600000): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const cacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(cacheEntry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached response
   */
  async getCachedResponse(key: string): Promise<any | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        const age = Date.now() - entry.timestamp;
        if (age > entry.ttl) {
          // Delete expired cache
          const deleteTransaction = this.db!.transaction(['cache'], 'readwrite');
          deleteTransaction.objectStore('cache').delete(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generate UUID for offline transactions
   */
  generateUUID(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Store offline order
   */
  async storeOrder(orderData: any): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    const id = this.generateUUID();
    const offlineOrder: OfflineOrder = {
      id,
      orderData,
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readwrite');
      const store = transaction.objectStore('orders');
      const request = store.add(offlineOrder);

      request.onsuccess = () => {
        console.log('Offline order stored:', id);
        resolve(id);
      };

      request.onerror = () => {
        console.error('Failed to store offline order:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all unsynced orders
   */
  async getUnsyncedOrders(): Promise<OfflineOrder[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readonly');
      const store = transaction.objectStore('orders');
      const index = store.index('synced');
      const request = index.getAll(IDBKeyRange.only(0)); // 0 = false in IndexedDB

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('Failed to get unsynced orders:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Mark order as synced
   */
  async markOrderAsSynced(orderId: string, serverOrderId: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readwrite');
      const store = transaction.objectStore('orders');
      const getRequest = store.get(orderId);

      getRequest.onsuccess = () => {
        const order = getRequest.result;
        if (order) {
          order.synced = true;
          order.serverOrderId = serverOrderId;
          const updateRequest = store.put(order);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Delete synced order
   */
  async deleteOrder(orderId: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readwrite');
      const store = transaction.objectStore('orders');
      const request = store.delete(orderId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark order sync as failed with error reason
   * CRITICAL FIX: Track failed syncs for manual review
   */
  async markOrderSyncFailed(orderId: string, errorMessage: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readwrite');
      const store = transaction.objectStore('orders');
      const getRequest = store.get(orderId);

      getRequest.onsuccess = () => {
        const order = getRequest.result;
        if (order) {
          order.syncFailed = true;
          order.syncError = errorMessage;
          order.retryCount = (order.retryCount || 0) + 1;
          const updateRequest = store.put(order);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Get all failed sync orders (for manual review)
   */
  async getFailedSyncOrders(): Promise<OfflineOrder[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['orders'], 'readonly');
      const store = transaction.objectStore('orders');
      const request = store.getAll();

      request.onsuccess = () => {
        const orders = request.result || [];
        const failedOrders = orders.filter((order: OfflineOrder) => order.syncFailed === true);
        resolve(failedOrders);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cache products for offline use
   */
  async cacheProducts(products: any[]): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const transaction = this.db!.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');

    // Clear old products first
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Store new products
    for (const product of products) {
      const offlineProduct: OfflineProduct = {
        id: product.id,
        data: product,
        timestamp: Date.now(),
      };
      store.put(offlineProduct);
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('Products cached for offline use');
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get cached products
   */
  async getCachedProducts(): Promise<any[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const request = store.getAll();

      request.onsuccess = () => {
        const products = (request.result || []).map((p: OfflineProduct) => p.data);
        resolve(products);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update product stock locally (for offline mode)
   */
  async updateProductStockLocally(productId: string, newStock: number): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      const getRequest = store.get(productId);

      getRequest.onsuccess = () => {
        const product = getRequest.result;
        if (product) {
          product.data.stock = newStock;
          const updateRequest = store.put(product);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

export const offlineStorage = new OfflineStorage();

