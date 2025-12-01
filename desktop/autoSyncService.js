// desktop/autoSyncService.js
// #112 Auto-sync on reconnect

const EventEmitter = require('events');
const desktopStore = require('./desktopStore');

class AutoSyncService extends EventEmitter {
  constructor() {
    super();
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.lastSyncTime = null;
    this.pendingChanges = new Set();
    this.syncInterval = null;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  async init() {
    // Load last sync time from storage
    try {
      const settings = await desktopStore.getData('stickynotes-settings');
      this.lastSyncTime = settings.lastSyncTime || null;
    } catch (error) {
      console.error('Failed to load sync settings:', error);
    }

    // Set up network event listeners
    window.addEventListener('online', () => {
      console.log('Network connection restored');
      this.isOnline = true;
      this.emit('online');
      this.scheduleSync();
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost');
      this.isOnline = false;
      this.emit('offline');
    });

    // Set up data change listeners
    desktopStore.onDataChange('stickynotes-notes', (data) => {
      this.markAsChanged('notes');
    });

    desktopStore.onDataChange('stickynotes-categories', (data) => {
      this.markAsChanged('categories');
    });

    // Start periodic sync if online
    if (this.isOnline) {
      this.startPeriodicSync();
    }

    console.log('Auto-sync service initialized');
  }

  markAsChanged(dataType) {
    this.pendingChanges.add(dataType);

    if (this.isOnline && !this.syncInProgress) {
      // Debounce sync calls
      clearTimeout(this.syncTimeout);
      this.syncTimeout = setTimeout(() => {
        this.performSync();
      }, 1000); // Wait 1 second after last change
    }
  }

  startPeriodicSync() {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.performSync();
      }
    }, 5 * 60 * 1000);
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async performSync() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.emit('sync-start');

    try {
      const syncResult = await this.syncWithServer();

      if (syncResult.success) {
        this.lastSyncTime = new Date().toISOString();
        this.pendingChanges.clear();

        // Save sync time to settings
        const settings = await desktopStore.getData('stickynotes-settings');
        settings.lastSyncTime = this.lastSyncTime;
        await desktopStore.saveData('stickynotes-settings', settings);

        this.emit('sync-success', syncResult);
        console.log('Sync completed successfully');
      } else {
        throw new Error(syncResult.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      this.emit('sync-error', error);

      // Retry logic
      if (this.isOnline && this.maxRetries > 0) {
        this.maxRetries--;
        setTimeout(() => {
          this.performSync();
        }, this.retryDelay);
      }
    } finally {
      this.syncInProgress = false;
      this.emit('sync-end');
    }
  }

  async syncWithServer() {
    try {
      // Get local data
      const localData = await desktopStore.exportAllData();

      // TODO: Replace with actual API call
      // For now, simulate server sync
      const response = await this.mockServerSync(localData);

      if (response.success) {
        // Handle server changes
        if (response.serverData) {
          await this.handleServerChanges(response.serverData);
        }

        return {
          success: true,
          changes: response.changes || [],
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: response.error || 'Server sync failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async handleServerChanges(serverData) {
    try {
      // Merge server changes with local data
      await desktopStore.importData(serverData, { merge: true });
      console.log('Server changes merged successfully');
    } catch (error) {
      console.error('Failed to merge server changes:', error);
      throw error;
    }
  }

  // Mock server sync for development
  async mockServerSync(localData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: 'Network error'
      };
    }

    // Simulate server having newer data sometimes
    const hasServerChanges = Math.random() < 0.3;

    return {
      success: true,
      changes: this.pendingChanges.size > 0 ? Array.from(this.pendingChanges) : [],
      serverData: hasServerChanges ? this.generateMockServerData() : null
    };
  }

  generateMockServerData() {
    // Generate some mock server data for testing
    return {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        'stickynotes-notes': [],
        'stickynotes-categories': ['Uncategorized', 'Work', 'Personal']
      }
    };
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      pendingChanges: Array.from(this.pendingChanges),
      nextSyncIn: this.getTimeToNextSync()
    };
  }

  getTimeToNextSync() {
    if (!this.syncInterval || !this.isOnline) return null;

    // Calculate time until next sync (simplified)
    return 5 * 60 * 1000; // 5 minutes
  }

  forceSync() {
    if (this.isOnline) {
      this.performSync();
    } else {
      console.warn('Cannot sync: offline');
    }
  }

  destroy() {
    this.stopPeriodicSync();
    clearTimeout(this.syncTimeout);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.removeAllListeners();
  }
}

// Create singleton instance
const autoSyncService = new AutoSyncService();

module.exports = autoSyncService;
