// __tests__/databaseService.test.js
import { databaseService } from "../src/services/databaseService.js";

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn()
};

// Mock window.indexedDB
Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});

// Mock IDBDatabase, IDBObjectStore, etc.
const mockObjectStore = {
  createIndex: jest.fn(),
  put: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  index: jest.fn(() => mockObjectStore)
};

const mockTransaction = {
  objectStore: jest.fn(() => mockObjectStore)
};

const mockDatabase = {
  createObjectStore: jest.fn(() => mockObjectStore),
  transaction: jest.fn(() => mockTransaction),
  objectStoreNames: {
    contains: jest.fn(() => false)
  }
};

describe("databaseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock IndexedDB open
    mockIndexedDB.open.mockReturnValue({
      onerror: null,
      onsuccess: null,
      onupgradeneeded: null,
      result: mockDatabase
    });
  });

  describe("initialization", () => {
    test("initializes successfully", async () => {
      const result = await databaseService.init();
      expect(mockIndexedDB.open).toHaveBeenCalledWith('StickyNotesDB', 1);
    });

    test("handles initialization errors", async () => {
      mockIndexedDB.open.mockReturnValue({
        onerror: () => {},
        onsuccess: null,
        onupgradeneeded: null,
        error: new Error('DB Error')
      });

      // Should not throw, should use localStorage fallback
      await expect(databaseService.init()).resolves.not.toThrow();
    });
  });

  describe("note operations", () => {
    beforeEach(async () => {
      await databaseService.init();
    });

    test("saves a note", async () => {
      const note = { id: "test-note", content: "Test content" };
      mockObjectStore.put.mockResolvedValue(undefined);

      await databaseService.saveNote(note);

      expect(mockObjectStore.put).toHaveBeenCalledWith(note);
    });

    test("gets notes", async () => {
      const mockNotes = [{ id: "1", content: "Note 1" }];
      mockObjectStore.getAll.mockResolvedValue(mockNotes);

      const result = await databaseService.getNotes();

      expect(result).toEqual(mockNotes);
      expect(mockObjectStore.getAll).toHaveBeenCalled();
    });

    test("deletes a note", async () => {
      mockObjectStore.delete.mockResolvedValue(undefined);

      await databaseService.deleteNote("test-id");

      expect(mockObjectStore.delete).toHaveBeenCalledWith("test-id");
    });
  });

  describe("migration", () => {
    test("migrates from localStorage", async () => {
      // Mock localStorage with existing data
      const mockNotes = [{ id: "migrated-note", content: "Migrated content" }];
      localStorage.setItem("stickynotes-notes", JSON.stringify(mockNotes));

      mockObjectStore.put.mockResolvedValue(undefined);

      await databaseService.migrateFromLocalStorage();

      expect(mockObjectStore.put).toHaveBeenCalled();
    });
  });

  describe("fallback behavior", () => {
    test("uses localStorage when IndexedDB fails", async () => {
      // Force fallback mode
      databaseService.fallbackToLocalStorage = true;

      const mockNotes = [{ id: "fallback-note" }];
      localStorage.setItem("stickynotes-notes", JSON.stringify(mockNotes));

      const result = await databaseService.getNotes();

      expect(result).toEqual(mockNotes);
    });
  });
});
