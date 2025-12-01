// desktop/desktopStore.js
// #111 Implement offline datastore for desktop

const fs = require('fs').promises;
const path = require('path');
const { app } = require('electron');

class DesktopStore {
  constructor() {
    this.userDataPath = null;
    this.data = {};
    this.listeners = new Map();
  }

  async init() {
    try {
      this.userDataPath = app.getPath('userData');
      await this.ensureDataDirectory();

      // Load existing data
      await this.loadAllData();
    } catch (error) {
      console.error('Failed to initialize desktop store:', error);
      // Fallback to in-memory storage
    }
  }

  async ensureDataDirectory() {
    const dataDir = path.join(this.userDataPath, 'sticky-notes-data');
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  getDataFilePath(key) {
    return path.join(this.userDataPath, 'sticky-notes-data', `${key}.json`);
  }

  async loadData(key) {
    try {
      const filePath = this.getDataFilePath(key);
      const data = await fs.readFile(filePath, 'utf8');
      this.data[key] = JSON.parse(data);
      return this.data[key];
    } catch (error) {
      // File doesn't exist or can't be read, return default
      this.data[key] = this.getDefaultValue(key);
      return this.data[key];
    }
  }

  async saveData(key, value) {
    try {
      this.data[key] = value;
      const filePath = this.getDataFilePath(key);
      await fs.writeFile(filePath, JSON.stringify(value, null, 2));

      // Notify listeners
      this.notifyListeners(key, value);
    } catch (error) {
      console.error(`Failed to save data for key ${key}:`, error);
      throw error;
    }
  }

  getData(key) {
    return this.data[key] || this.getDefaultValue(key);
  }

  getDefaultValue(key) {
    const defaults = {
      'stickynotes-notes': [],
      'stickynotes-categories': ['Uncategorized'],
      'stickynotes-settings': {
        theme: 'light',
        autoSave: true,
        syncEnabled: false
      }
    };
    return defaults[key] || null;
  }

  async loadAllData() {
    const keys = ['stickynotes-notes', 'stickynotes-categories', 'stickynotes-settings'];
    await Promise.all(keys.map(key => this.loadData(key)));
  }

  // Event system for real-time updates
  onDataChange(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  notifyListeners(key, value) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error('Error in data change listener:', error);
        }
      });
    }
  }

  // Backup functionality
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.userDataPath, 'backups');
      await fs.mkdir(backupDir, { recursive: true });

      const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
      const backupData = {
        timestamp: new Date().toISOString(),
        version: require('../package.json').version,
        data: this.data
      };

      await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2));
      return backupFile;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  async restoreFromBackup(backupFile) {
    try {
      const backupData = JSON.parse(await fs.readFile(backupFile, 'utf8'));
      this.data = backupData.data;

      // Save all data to current files
      await Promise.all(
        Object.keys(this.data).map(key => this.saveData(key, this.data[key]))
      );

      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw error;
    }
  }

  // Export all data for cross-device sync
  async exportAllData() {
    return {
      timestamp: new Date().toISOString(),
      version: require('../package.json').version,
      data: this.data
    };
  }

  // Import data from another device
  async importData(importData, options = {}) {
    try {
      const { merge = false, overwrite = false } = options;

      if (overwrite) {
        this.data = importData.data;
      } else if (merge) {
        // Merge logic for notes and categories
        if (importData.data['stickynotes-notes']) {
          const existingNotes = this.data['stickynotes-notes'] || [];
          const importedNotes = importData.data['stickynotes-notes'];

          // Simple merge - could be enhanced with conflict resolution
          const mergedNotes = [...existingNotes];
          importedNotes.forEach(importedNote => {
            const existingIndex = mergedNotes.findIndex(n => n.id === importedNote.id);
            if (existingIndex === -1) {
              mergedNotes.push(importedNote);
            } else if (new Date(importedNote.updatedAt) > new Date(mergedNotes[existingIndex].updatedAt)) {
              mergedNotes[existingIndex] = importedNote;
            }
          });

          this.data['stickynotes-notes'] = mergedNotes;
        }

        if (importData.data['stickynotes-categories']) {
          const existingCats = new Set(this.data['stickynotes-categories'] || []);
          const importedCats = importData.data['stickynotes-categories'] || [];
          importedCats.forEach(cat => existingCats.add(cat));
          this.data['stickynotes-categories'] = Array.from(existingCats);
        }
      } else {
        // Replace all data
        this.data = importData.data;
      }

      // Save all data
      await Promise.all(
        Object.keys(this.data).map(key => this.saveData(key, this.data[key]))
      );

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const desktopStore = new DesktopStore();

module.exports = desktopStore;
