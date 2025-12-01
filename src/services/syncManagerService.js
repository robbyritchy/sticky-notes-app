// services/syncManagerService.js
// #72 Develop sync manager service
// #73 Update backend for version control (placeholder for future backend integration)
// #74 Add sync status and error messages

export const syncManagerService = {
  _status: "offline", // "offline" | "syncing" | "online" | "error"
  _lastSync: null,
  _error: null,
  _listeners: [],

  // Initialize sync manager
  init() {
    // Check online status
    this._status = navigator.onLine ? "online" : "offline";
    
    // Listen for online/offline events
    window.addEventListener("online", () => {
      this._status = "online";
      this._notifyListeners();
      this.sync();
    });

    window.addEventListener("offline", () => {
      this._status = "offline";
      this._error = "No internet connection";
      this._notifyListeners();
    });

    // Auto-sync when online
    if (this._status === "online") {
      this.sync();
    }
  },

  // Subscribe to status changes
  onStatusChange(callback) {
    this._listeners.push(callback);
    // Immediately call with current status
    callback(this.getStatus());
    return () => {
      this._listeners = this._listeners.filter(cb => cb !== callback);
    };
  },

  _notifyListeners() {
    this._listeners.forEach(cb => cb(this.getStatus()));
  },

  // Get current sync status
  getStatus() {
    return {
      status: this._status,
      lastSync: this._lastSync,
      error: this._error,
      isOnline: navigator.onLine
    };
  },

  // Sync notes with backend (placeholder - can be extended with actual API)
  async sync() {
    if (!navigator.onLine) {
      this._status = "offline";
      this._error = "No internet connection";
      this._notifyListeners();
      return { success: false, error: "Offline" };
    }

    this._status = "syncing";
    this._error = null;
    this._notifyListeners();

    try {
      // TODO: Replace with actual backend API call
      // For now, simulate sync with localStorage
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, this would:
      // 1. Fetch latest notes from backend
      // 2. Merge with local changes
      // 3. Upload local changes
      // 4. Handle conflicts

      this._status = "online";
      this._lastSync = new Date().toISOString();
      this._error = null;
      this._notifyListeners();
      
      return { success: true };
    } catch (error) {
      this._status = "error";
      this._error = error.message || "Sync failed";
      this._lastSync = null;
      this._notifyListeners();
      return { success: false, error: this._error };
    }
  },

  // Manual sync trigger
  async syncNow() {
    return await this.sync();
  },

  // Check if data needs syncing (placeholder)
  hasPendingChanges() {
    // In a real implementation, track which notes have been modified
    // but not yet synced
    return false;
  }
};

