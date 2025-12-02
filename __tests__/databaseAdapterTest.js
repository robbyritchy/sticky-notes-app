// __tests__/databaseAdapter.test.js
import * as databaseAdapter from "../src/services/databaseAdapter.js";

// Mock the database service
jest.mock("../src/services/databaseService.js", () => ({
  databaseService: {
    getNotes: jest.fn(),
    saveNote: jest.fn(),
    deleteNote: jest.fn(),
    getCategories: jest.fn(),
    saveCategory: jest.fn(),
    deleteCategory: jest.fn(),
    saveVersion: jest.fn(),
    getVersionsForNote: jest.fn(),
    saveShareLink: jest.fn(),
    getShareLink: jest.fn(),
    getShareLinksForNote: jest.fn(),
    deleteShareLink: jest.fn(),
    saveAnalyticsData: jest.fn(),
    getAnalyticsData: jest.fn(),
    getSetting: jest.fn(),
    saveSetting: jest.fn(),
    clearAllData: jest.fn(),
    getStats: jest.fn()
  }
}));

import { databaseService } from "../src/services/databaseService.js";

describe("databaseAdapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset localStorage mock
    localStorage.clear();

    // Mock successful database operations
    databaseService.getNotes.mockResolvedValue([]);
    databaseService.saveNote.mockResolvedValue(undefined);
    databaseService.deleteNote.mockResolvedValue(undefined);
    databaseService.getCategories.mockResolvedValue([]);
    databaseService.saveCategory.mockResolvedValue(undefined);
  });

  describe("getNotes", () => {
    test("returns notes from database", async () => {
      const mockNotes = [{ id: "1", content: "Note 1" }];
      databaseService.getNotes.mockResolvedValue(mockNotes);

      const result = await databaseAdapter.getNotes();

      expect(result).toEqual(mockNotes);
      expect(databaseService.getNotes).toHaveBeenCalled();
    });
  });

  describe("saveNotes", () => {
    test("saves notes to database", async () => {
      const notes = [{ id: "1", content: "Note 1" }];
      databaseService.getNotes.mockResolvedValue([]);

      await databaseAdapter.saveNotes(notes);

      expect(databaseService.deleteNote).toHaveBeenCalledWith("1");
      expect(databaseService.saveNote).toHaveBeenCalledWith(notes[0]);
    });

    test("handles database errors gracefully", async () => {
      const notes = [{ id: "1", content: "Note 1" }];
      databaseService.getNotes.mockRejectedValue(new Error("DB Error"));

      // Should not throw, should use localStorage fallback
      await expect(databaseAdapter.saveNotes(notes)).resolves.not.toThrow();

      // Should have fallen back to localStorage
      expect(localStorage.getItem("stickynotes-notes")).toBe(JSON.stringify(notes));
    });
  });

  describe("getCategories", () => {
    test("returns categories from database", async () => {
      const mockCategories = [{ id: "work", name: "Work" }];
      databaseService.getCategories.mockResolvedValue(mockCategories);

      const result = await databaseAdapter.getCategories();

      expect(result).toEqual(mockCategories);
    });
  });

  describe("saveCategories", () => {
    test("saves categories to database", async () => {
      const categories = [{ id: "work", name: "Work" }];
      databaseService.getCategories.mockResolvedValue([]);

      await databaseAdapter.saveCategories(categories);

      expect(databaseService.deleteCategory).toHaveBeenCalledWith("work");
      expect(databaseService.saveCategory).toHaveBeenCalledWith(categories[0]);
    });
  });

  describe("version history operations", () => {
    test("saves version", async () => {
      const version = { id: "v1", noteId: "note1", data: {} };

      await databaseAdapter.saveVersion(version);

      expect(databaseService.saveVersion).toHaveBeenCalledWith(version);
    });

    test("gets versions for note", async () => {
      const versions = [{ id: "v1", noteId: "note1" }];
      databaseService.getVersionsForNote.mockResolvedValue(versions);

      const result = await databaseAdapter.getVersionsForNote("note1");

      expect(result).toEqual(versions);
    });
  });

  describe("share link operations", () => {
    test("saves share link", async () => {
      const shareData = { token: "token123", noteId: "note1" };

      await databaseAdapter.saveShareLink(shareData);

      expect(databaseService.saveShareLink).toHaveBeenCalledWith(shareData);
    });

    test("gets share link", async () => {
      const shareData = { token: "token123", noteId: "note1" };
      databaseService.getShareLink.mockResolvedValue(shareData);

      const result = await databaseAdapter.getShareLink("token123");

      expect(result).toEqual(shareData);
    });

    test("gets share links for note", async () => {
      const shareLinks = [{ token: "token1", noteId: "note1" }];
      databaseService.getShareLinksForNote.mockResolvedValue(shareLinks);

      const result = await databaseAdapter.getShareLinksForNote("note1");

      expect(result).toEqual(shareLinks);
    });
  });

  describe("analytics operations", () => {
    test("saves analytics data", async () => {
      const data = { id: "analytics1", data: {} };

      await databaseAdapter.saveAnalyticsData(data);

      expect(databaseService.saveAnalyticsData).toHaveBeenCalledWith(data);
    });

    test("gets analytics data", async () => {
      const analyticsData = [{ id: "analytics1", data: {} }];
      databaseService.getAnalyticsData.mockResolvedValue(analyticsData);

      const result = await databaseAdapter.getAnalyticsData();

      expect(result).toEqual(analyticsData);
    });
  });

  describe("clearAllData", () => {
    test("clears all data", async () => {
      databaseService.clearAllData.mockResolvedValue(undefined);

      await databaseAdapter.clearAllData();

      expect(databaseService.clearAllData).toHaveBeenCalled();
      // Should also clear localStorage
      expect(localStorage.length).toBe(0);
    });
  });

  describe("getDatabaseStats", () => {
    test("returns database statistics", async () => {
      const stats = { notes: 5, categories: 2 };
      databaseService.getStats.mockResolvedValue(stats);

      const result = await databaseAdapter.getDatabaseStats();

      expect(result).toEqual(stats);
    });
  });
});
