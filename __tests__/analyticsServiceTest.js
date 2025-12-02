// __tests__/analyticsService.test.js
import { analyticsService } from "../src/services/analyticsService.js";

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

// Mock Date for consistent testing
const mockDate = new Date('2024-01-15T10:00:00Z');
global.Date = jest.fn(() => mockDate);
Date.now = jest.fn(() => mockDate.getTime());

describe("analyticsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe("getAnalytics", () => {
    test("returns comprehensive analytics data", () => {
      const mockNotes = [
        {
          id: "1",
          title: "Note 1",
          content: "Content 1",
          category: "work",
          createdAt: "2024-01-10T10:00:00Z",
          updatedAt: "2024-01-10T10:00:00Z",
          reminderDate: "2024-01-20T10:00:00Z"
        },
        {
          id: "2",
          title: "Note 2",
          content: "Content 2",
          category: "personal",
          createdAt: "2024-01-14T10:00:00Z",
          updatedAt: "2024-01-14T10:00:00Z"
        }
      ];

      const mockCategories = ["work", "personal"];

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockNotes)) // notes
        .mockReturnValueOnce(JSON.stringify(mockCategories)); // categories

      const result = analyticsService.getAnalytics();

      expect(result.summary.totalNotes).toBe(2);
      expect(result.summary.activeNotes).toBe(2);
      expect(result.summary.categories).toBe(2);
      expect(result.summary.recentNotes).toBe(2); // Both notes are recent
      expect(result.reminders.withReminders).toBe(1);
      expect(result.categories.work.count).toBe(1);
      expect(result.categories.personal.count).toBe(1);
    });

    test("handles empty data gracefully", () => {
      localStorageMock.getItem
        .mockReturnValueOnce("[]") // empty notes
        .mockReturnValueOnce("[]"); // empty categories

      const result = analyticsService.getAnalytics();

      expect(result.summary.totalNotes).toBe(0);
      expect(result.summary.activeNotes).toBe(0);
      expect(result.summary.categories).toBe(0); // No categories in empty data
    });

    test("calculates checklist statistics correctly", () => {
      const mockNotes = [
        {
          id: "1",
          type: "checklist",
          items: [
            { id: "item1", text: "Task 1", checked: true },
            { id: "item2", text: "Task 2", checked: false }
          ]
        },
        {
          id: "2",
          type: "checklist",
          items: [
            { id: "item3", text: "Task 3", checked: true },
            { id: "item4", text: "Task 4", checked: true }
          ]
        }
      ];

      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockNotes))
        .mockReturnValueOnce(JSON.stringify([]));

      const result = analyticsService.getAnalytics();

      expect(result.checklists.total).toBe(2);
      expect(result.checklists.completed).toBe(1); // Second checklist is fully completed
      expect(result.checklists.inProgress).toBe(1); // First checklist has partial completion
      expect(result.checklists.avgCompletionRate).toBe(75); // (1 + 0.5) / 2 * 100 = 75
    });
  });

  describe("getActivityOverTime", () => {
    test("returns activity data for specified days", () => {
      const mockNotes = [
        { createdAt: "2024-01-15T10:00:00Z" }, // Today (same as mock date)
        { createdAt: "2024-01-14T10:00:00Z" }, // Yesterday
        { createdAt: "2024-01-13T10:00:00Z" }  // Day before
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockNotes));

      const result = analyticsService.getActivityOverTime(mockNotes, 3);

      expect(result).toHaveLength(3);
      // Just check that we have some activity data
      expect(result.some(day => day.count > 0)).toBe(true);
    });
  });

  describe("exportAnalytics", () => {
    test("exports analytics data as JSON", () => {
      const mockNotes = [{ id: "1", content: "test" }];
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockNotes))
        .mockReturnValueOnce(JSON.stringify([]));

      // Mock URL and Blob
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.Blob = jest.fn(() => ({ size: 100 }));

      const mockLink = {
        click: jest.fn(),
        set href(val) { this.hrefValue = val; },
        set download(val) { this.downloadValue = val; }
      };

      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});

      analyticsService.exportAnalytics();

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.downloadValue).toContain('sticky-notes-analytics');
    });
  });
});
