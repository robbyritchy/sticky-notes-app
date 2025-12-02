// src/services/databaseService.js
// IndexedDB-based database service for persistent note storage

class DatabaseService {
  constructor() {
    this.dbName = 'StickyNotesDB';
    this.version = 1;
    this.db = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  // Initialize the database
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initDatabase();
    return this.initPromise;
  }

  async _initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Database initialization failed:', request.error);
        // Fallback to localStorage if IndexedDB fails
        this.fallbackToLocalStorage = true;
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('Database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        this._createObjectStores(db);
      };
    });
  }

  // Create object stores (tables) in the database
  _createObjectStores(db) {
    // Notes store
    if (!db.objectStoreNames.contains('notes')) {
      const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
      notesStore.createIndex('category', 'category', { unique: false });
      notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
    }

    // Categories store
    if (!db.objectStoreNames.contains('categories')) {
      db.createObjectStore('categories', { keyPath: 'id' });
    }

    // Version history store
    if (!db.objectStoreNames.contains('versionHistory')) {
      const historyStore = db.createObjectStore('versionHistory', { keyPath: 'id' });
      historyStore.createIndex('noteId', 'noteId', { unique: false });
      historyStore.createIndex('timestamp', 'timestamp', { unique: false });
    }

    // Share links store
    if (!db.objectStoreNames.contains('shareLinks')) {
      const shareStore = db.createObjectStore('shareLinks', { keyPath: 'token' });
      shareStore.createIndex('noteId', 'noteId', { unique: false });
      shareStore.createIndex('createdAt', 'createdAt', { unique: false });
    }

    // Analytics store
    if (!db.objectStoreNames.contains('analytics')) {
      db.createObjectStore('analytics', { keyPath: 'id' });
    }

    // Settings store
    if (!db.objectStoreNames.contains('settings')) {
      db.createObjectStore('settings', { keyPath: 'key' });
    }
  }

  // Generic database operations
  async _performTransaction(storeName, mode, operation) {
    if (this.fallbackToLocalStorage) {
      return this._localStorageFallback(storeName, mode, operation);
    }

    if (!this.isInitialized) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);

      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => {
        // Transaction completed successfully
      };

      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Fallback to localStorage if IndexedDB fails
  _localStorageFallback(storeName, mode, operation) {
    console.warn('Using localStorage fallback for database operations');

    // Map store names to localStorage keys
    const keyMap = {
      notes: 'stickynotes-notes',
      categories: 'stickynotes-categories',
      versionHistory: 'stickynotes-history',
      shareLinks: 'stickynotes-share',
      analytics: 'stickynotes-analytics',
      settings: 'stickynotes-settings'
    };

    const storageKey = keyMap[storeName] || `stickynotes-${storeName}`;

    if (mode === 'readonly') {
      try {
        const data = localStorage.getItem(storageKey);
        return Promise.resolve(data ? JSON.parse(data) : []);
      } catch (error) {
        return Promise.resolve([]);
      }
    } else {
      // For write operations, we'll need to handle them differently
      return Promise.resolve(null);
    }
  }

  // Notes operations
  async getNotes() {
    return this._performTransaction('notes', 'readonly', (store) => {
      return store.getAll();
    });
  }

  async saveNote(note) {
    return this._performTransaction('notes', 'readwrite', (store) => {
      return store.put(note);
    });
  }

  async deleteNote(noteId) {
    return this._performTransaction('notes', 'readwrite', (store) => {
      return store.delete(noteId);
    });
  }

  async getNoteById(noteId) {
    return this._performTransaction('notes', 'readonly', (store) => {
      return store.get(noteId);
    });
  }

  async getNotesByCategory(category) {
    return this._performTransaction('notes', 'readonly', (store) => {
      const index = store.index('category');
      return index.getAll(category);
    });
  }

  // Categories operations
  async getCategories() {
    return this._performTransaction('categories', 'readonly', (store) => {
      return store.getAll();
    });
  }

  async saveCategory(category) {
    return this._performTransaction('categories', 'readwrite', (store) => {
      return store.put(category);
    });
  }

  async deleteCategory(categoryId) {
    return this._performTransaction('categories', 'readwrite', (store) => {
      return store.delete(categoryId);
    });
  }

  // Version history operations
  async saveVersion(version) {
    return this._performTransaction('versionHistory', 'readwrite', (store) => {
      return store.put(version);
    });
  }

  async getVersionsForNote(noteId) {
    return this._performTransaction('versionHistory', 'readonly', (store) => {
      const index = store.index('noteId');
      return index.getAll(noteId);
    });
  }

  async deleteVersionsForNote(noteId) {
    const versions = await this.getVersionsForNote(noteId);
    return this._performTransaction('versionHistory', 'readwrite', (store) => {
      const requests = versions.map(version => store.delete(version.id));
      return Promise.all(requests);
    });
  }

  // Share links operations
  async saveShareLink(shareData) {
    return this._performTransaction('shareLinks', 'readwrite', (store) => {
      return store.put(shareData);
    });
  }

  async getShareLink(token) {
    return this._performTransaction('shareLinks', 'readonly', (store) => {
      return store.get(token);
    });
  }

  async getShareLinksForNote(noteId) {
    return this._performTransaction('shareLinks', 'readonly', (store) => {
      const index = store.index('noteId');
      return index.getAll(noteId);
    });
  }

  async deleteShareLink(token) {
    return this._performTransaction('shareLinks', 'readwrite', (store) => {
      return store.delete(token);
    });
  }

  // Analytics operations
  async saveAnalyticsData(data) {
    return this._performTransaction('analytics', 'readwrite', (store) => {
      return store.put(data);
    });
  }

  async getAnalyticsData() {
    return this._performTransaction('analytics', 'readonly', (store) => {
      return store.getAll();
    });
  }

  // Settings operations
  async getSetting(key) {
    return this._performTransaction('settings', 'readonly', (store) => {
      return store.get(key);
    });
  }

  async saveSetting(key, value) {
    return this._performTransaction('settings', 'readwrite', (store) => {
      return store.put({ key, value });
    });
  }

  // Migration from localStorage
  async migrateFromLocalStorage() {
    if (this.fallbackToLocalStorage) return;

    console.log('Checking for localStorage data to migrate...');

    // Migrate notes
    const notesKey = 'stickynotes-notes';
    const notesData = localStorage.getItem(notesKey);
    if (notesData) {
      try {
        const notes = JSON.parse(notesData);
        for (const note of notes) {
          await this.saveNote(note);
        }
        console.log(`Migrated ${notes.length} notes from localStorage`);
      } catch (error) {
        console.error('Error migrating notes:', error);
      }
    }

    // Migrate categories
    const categoriesKey = 'stickynotes-categories';
    const categoriesData = localStorage.getItem(categoriesKey);
    if (categoriesData) {
      try {
        const categories = JSON.parse(categoriesData);
        for (const category of categories) {
          await this.saveCategory(category);
        }
        console.log(`Migrated ${categories.length} categories from localStorage`);
      } catch (error) {
        console.error('Error migrating categories:', error);
      }
    }

    // Note: We could add migration for other data types if needed

    // Mark migration as complete
    await this.saveSetting('migrationCompleted', true);
    console.log('Migration from localStorage completed');
  }

  // Clear all data
  async clearAllData() {
    const stores = ['notes', 'categories', 'versionHistory', 'shareLinks', 'analytics', 'settings'];

    for (const storeName of stores) {
      await this._performTransaction(storeName, 'readwrite', (store) => {
        return store.clear();
      });
    }

    console.log('All database data cleared');
  }

  // Get database statistics
  async getStats() {
    const stats = {};

    const stores = ['notes', 'categories', 'versionHistory', 'shareLinks', 'analytics', 'settings'];

    for (const storeName of stores) {
      try {
        const data = await this._performTransaction(storeName, 'readonly', (store) => {
          return store.getAll();
        });
        stats[storeName] = data.length;
      } catch (error) {
        stats[storeName] = 0;
      }
    }

    return stats;
  }
}

// Create and export a singleton instance
export const databaseService = new DatabaseService();

// Auto-initialize and migrate on first use (non-blocking)
setTimeout(async () => {
  try {
    await databaseService.init();
    console.log('Database initialized successfully');

    const migrationCompleted = await databaseService.getSetting('migrationCompleted').catch(() => null);
    if (!migrationCompleted) {
      console.log('Starting localStorage migration...');
      await databaseService.migrateFromLocalStorage();
      console.log('Migration completed');
    }
  } catch (error) {
    console.error('Database initialization failed, using localStorage fallback:', error);
    // Ensure fallback mode is enabled
    databaseService.fallbackToLocalStorage = true;
  }
}, 0);
