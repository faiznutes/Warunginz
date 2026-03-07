/**
 * Sync Manager
 * Handles automatic synchronization of offline transactions
 */

import api from '../api';
import { offlineStorage } from './offline-storage';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
}

class SyncManager {
  private syncInterval: number | null = null;
  private syncIntervalMs = 10000; // 10 seconds
  private statusCallbacks: ((status: SyncStatus) => void)[] = [];
  private currentStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
  };

  constructor() {
    // Listen to online/offline events
    window.addEventListener('online', () => {
      this.currentStatus.isOnline = true;
      this.notifyStatus();
      this.startAutoSync();
    });

    window.addEventListener('offline', () => {
      this.currentStatus.isOnline = false;
      this.notifyStatus();
      this.stopAutoSync();
    });

    // Start auto sync if online
    if (this.currentStatus.isOnline) {
      this.startAutoSync();
    }
  }

  /**
   * Subscribe to sync status changes
   */
  onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusCallbacks.push(callback);
    callback(this.currentStatus); // Call immediately with current status

    // Return unsubscribe function
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.currentStatus };
  }

  /**
   * Notify all subscribers of status change
   */
  private notifyStatus(): void {
    this.statusCallbacks.forEach(callback => callback(this.currentStatus));
  }

  /**
   * Start automatic sync
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      return; // Already running
    }

    // Sync immediately
    this.sync();

    // Then sync every interval
    this.syncInterval = window.setInterval(() => {
      this.sync();
    }, this.syncIntervalMs);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Manual sync trigger
   */
  async sync(): Promise<void> {
    if (!this.currentStatus.isOnline || this.currentStatus.isSyncing) {
      return;
    }

    this.currentStatus.isSyncing = true;
    this.notifyStatus();

    try {
      const unsyncedOrders = await offlineStorage.getUnsyncedOrders();
      this.currentStatus.pendingCount = unsyncedOrders.length;

      if (unsyncedOrders.length === 0) {
        this.currentStatus.isSyncing = false;
        this.currentStatus.lastSyncTime = Date.now();
        this.notifyStatus();
        return;
      }

      console.log(`🔄 Syncing ${unsyncedOrders.length} offline orders...`);

      // Sync orders one by one
      for (const order of unsyncedOrders) {
        try {
          // CRITICAL FIX: Backend will validate stock availability
          // If stock is insufficient, backend will throw error and we'll handle it
          const orderResponse = await api.post('/orders', order.orderData);
          const serverOrder = orderResponse.data;

          // Create transaction if order data includes transaction info
          if (order.orderData.transactionData) {
            const transactionData = {
              ...order.orderData.transactionData,
              orderId: serverOrder.id,
            };
            await api.post('/transactions', transactionData);
          }

          // Mark as synced
          await offlineStorage.markOrderAsSynced(order.id, serverOrder.id);

          // Delete from local storage after successful sync
          await offlineStorage.deleteOrder(order.id);

          console.log(`✅ Synced order ${order.id} → ${serverOrder.id}`);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
          
          // CRITICAL FIX: Handle different error types
          if (errorMessage.includes('Insufficient stock') || errorMessage.includes('stock')) {
            // Stock validation failed - mark for manual review
            console.error(`❌ Stock validation failed for order ${order.id}:`, errorMessage);
            // Store error reason for manual review (could add to offlineStorage)
            await offlineStorage.markOrderSyncFailed(order.id, errorMessage);
          } else if (errorMessage.includes('Transaction amount') || errorMessage.includes('does not match')) {
            // Transaction amount mismatch - mark for manual review
            console.error(`❌ Transaction validation failed for order ${order.id}:`, errorMessage);
            await offlineStorage.markOrderSyncFailed(order.id, errorMessage);
          } else if (error.response?.status === 429 || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
            // Transient error - will retry on next sync
            console.warn(`⚠️ Transient error for order ${order.id}, will retry:`, errorMessage);
            // Don't mark as failed, will retry
          } else {
            // Other errors - mark for manual review
            console.error(`❌ Failed to sync order ${order.id}:`, errorMessage);
            await offlineStorage.markOrderSyncFailed(order.id, errorMessage);
          }
          // Continue with next order even if one fails
        }
      }

      // Update pending count
      const remainingOrders = await offlineStorage.getUnsyncedOrders();
      this.currentStatus.pendingCount = remainingOrders.length;
      this.currentStatus.lastSyncTime = Date.now();

      console.log(`✅ Sync completed. ${remainingOrders.length} orders remaining.`);
    } catch (error: any) {
      console.error('❌ Sync error:', error);
    } finally {
      this.currentStatus.isSyncing = false;
      this.notifyStatus();
    }
  }

  /**
   * Force sync (manual trigger)
   */
  async forceSync(): Promise<void> {
    await this.sync();
  }

  /**
   * Get pending orders count
   */
  async getPendingCount(): Promise<number> {
    const orders = await offlineStorage.getUnsyncedOrders();
    this.currentStatus.pendingCount = orders.length;
    this.notifyStatus();
    return orders.length;
  }
}

export const syncManager = new SyncManager();
