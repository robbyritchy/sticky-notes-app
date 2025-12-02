// __tests__/versionHistoryService.test.js
import { versionHistoryService } from "../src/services/versionHistoryService.js";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock Date
const mockDate = new Date('2024-01-15T10:00:00Z');
const originalDate = global.Date;
global.Date = jest.fn(() => mockDate);
global.Date.now = jest.fn(() => mockDate.getTime());
global.Date.prototype.toISOString = jest.fn(() => '2024-01-15T10:00:00.000Z');

describe("versionHistoryService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue("[]");
  });

  describe("saveVersion", () => {
    test("saves version snapshot for note", () => {
      const note = {
        id: "note-123",
        title: "Test Note",
        content: "Test content",
        category: "work",
        color: "#fff59d",
        shape: "rectangle"
      };

      const result = versionHistoryService.saveVersion(note);

      expect(result).toHaveProperty('id');
      expect(result.noteId).toBe("note-123");
      expect(result.timestamp).toBe(mockDate.toISOString());
      expect(result.data.title).toBe("Test Note");

      // Verify localStorage was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stickynotes-history-note-123',
        expect.any(String)
      );
    });

    test("limits history to 50 versions", () => {
      // Mock existing history with 50 items
      const existingHistory = Array.from({ length: 50 }, (_, i) => ({
        id: `version-${i}`,
        timestamp: new Date(Date.now() - i * 1000).toISOString(),
        data: { content: `Content ${i}` }
      }));

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));

      const note = { id: "note-123", content: "New content" };
      versionHistoryService.saveVersion(note);

      // Verify the oldest item was removed
      const storedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(storedData).toHaveLength(50);
      expect(storedData.some(version => version.data.content === "New content")).toBe(true); // New content should be in the array
    });

    test("returns null for invalid note", () => {
      const result = versionHistoryService.saveVersion(null);
      expect(result).toBeUndefined();

      const result2 = versionHistoryService.saveVersion({});
      expect(result2).toBeUndefined();
    });
  });

  describe("getHistory", () => {
    test("returns version history for note", () => {
      const mockHistory = [
        { id: "v1", timestamp: "2024-01-14T10:00:00Z", data: { content: "Version 1" } },
        { id: "v2", timestamp: "2024-01-15T10:00:00Z", data: { content: "Version 2" } }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

      const result = versionHistoryService.getHistory("note-123");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("v1");
      expect(result[1].id).toBe("v2");
    });

    test("returns empty array for note with no history", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = versionHistoryService.getHistory("note-123");

      expect(result).toEqual([]);
    });
  });

  describe("getVersion", () => {
    test("returns specific version by ID", () => {
      const mockHistory = [
        { id: "v1", timestamp: "2024-01-14T10:00:00Z", data: { content: "Version 1" } },
        { id: "v2", timestamp: "2024-01-15T10:00:00Z", data: { content: "Version 2" } }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

      const result = versionHistoryService.getVersion("note-123", "v2");

      expect(result).toBeTruthy();
      expect(result.id).toBe("v2");
      expect(result.data.content).toBe("Version 2");
    });

    test("returns null for non-existent version", () => {
      localStorageMock.getItem.mockReturnValue("[]");

      const result = versionHistoryService.getVersion("note-123", "non-existent");

      expect(result).toBeUndefined();
    });
  });

  describe("restoreVersion", () => {
    test("restores note to specific version", () => {
      const versionId = "v2";
      const mockHistory = [
        { id: "v1", timestamp: "2024-01-14T10:00:00Z", data: { content: "Version 1", title: "Old Title" } },
        { id: versionId, timestamp: "2024-01-15T10:00:00Z", data: { content: "Version 2", title: "New Title" } }
      ];

      const currentNotes = [
        { id: "note-123", content: "Current content", title: "Current Title" },
        { id: "other-note", content: "Other content" }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

      const result = versionHistoryService.restoreVersion("note-123", versionId, currentNotes);

      expect(result).toBeTruthy();
      expect(result.content).toBe("Version 2");
      expect(result.title).toBe("New Title");
      expect(result.updatedAt).toBe(mockDate.toISOString());

      // Verify new version was saved
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1); // saveVersion call inside restoreVersion
    });

    test("returns null for non-existent note", () => {
      const result = versionHistoryService.restoreVersion("non-existent", "v1", []);

      expect(result).toBeNull();
    });

    test("returns null for non-existent version", () => {
      const currentNotes = [{ id: "note-123" }];
      localStorageMock.getItem.mockReturnValue("[]");

      const result = versionHistoryService.restoreVersion("note-123", "non-existent", currentNotes);

      expect(result).toBeNull();
    });
  });

  describe("clearHistory", () => {
    test("clears history for specific note", () => {
      versionHistoryService.clearHistory("note-123");

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("stickynotes-history-note-123");
    });
  });

  describe("getAllHistory", () => {
    test("returns history for all notes", () => {
      // Mock localStorage.keys to return multiple history keys
      localStorageMock.key
        .mockReturnValueOnce('stickynotes-history-note1')
        .mockReturnValueOnce('stickynotes-history-note2')
        .mockReturnValueOnce('other-key');

      localStorageMock.length = 3;

      const history1 = [{ id: "v1", data: { content: "Note 1" } }];
      const history2 = [{ id: "v2", data: { content: "Note 2" } }];

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(history1))
        .mockReturnValueOnce(JSON.stringify(history2))
        .mockReturnValueOnce('other-data');

      const result = versionHistoryService.getAllHistory();

      expect(result).toHaveLength(2);
      expect(result[0].noteId).toBe('note1');
      expect(result[1].noteId).toBe('note2');
    });
  });
});
