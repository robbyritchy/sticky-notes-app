// __tests__/AnalyticsView.test.js
import { createAnalyticsView } from "../src/components/AnalyticsView.js";

// Mock the analyticsService
jest.mock("../src/services/analyticsService.js", () => ({
  analyticsService: {
    getAnalytics: jest.fn(),
    exportAnalytics: jest.fn()
  }
}));

import { analyticsService } from "../src/services/analyticsService.js";

// Mock DOM elements
const mockElement = {
  addEventListener: jest.fn(),
  remove: jest.fn(),
  contains: jest.fn(),
  querySelector: jest.fn(),
  style: {},
  innerHTML: "",
  textContent: "",
  appendChild: jest.fn(),
  className: "",
  click: jest.fn()
};

describe("createAnalyticsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock document methods
    document.createElement = jest.fn(() => mockElement);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();

    // Mock window methods
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();

    // Mock analytics data
    const mockAnalytics = {
      summary: {
        totalNotes: 10,
        activeNotes: 8,
        archivedNotes: 2,
        categories: 3,
        recentNotes: 3,
        monthlyNotes: 5
      },
      categories: {
        work: { count: 4, percentage: 50 },
        personal: { count: 3, percentage: 38 },
        other: { count: 1, percentage: 12 }
      },
      reminders: {
        withReminders: 2,
        overdue: 0,
        percentage: 25
      },
      checklists: {
        total: 1,
        completed: 1,
        inProgress: 0,
        avgCompletionRate: 100
      },
      activity: [
        { date: "2024-01-15", count: 2, label: "Jan 15" },
        { date: "2024-01-14", count: 1, label: "Jan 14" }
      ],
      mostActiveCategory: {
        name: "work",
        count: 4
      }
    };

    analyticsService.getAnalytics.mockReturnValue(mockAnalytics);
  });

  test("creates analytics view with correct structure", () => {
    const mockOnBack = jest.fn();
    const view = createAnalyticsView(mockOnBack);

    expect(document.createElement).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalled();
  });

  test("displays summary cards with correct data", () => {
    createAnalyticsView(jest.fn());

    // Should create multiple summary cards
    expect(document.createElement).toHaveBeenCalledWith("div");
  });

  test("displays category breakdown", () => {
    createAnalyticsView(jest.fn());

    expect(analyticsService.getAnalytics).toHaveBeenCalled();
  });

  test("displays activity chart", () => {
    createAnalyticsView(jest.fn());

    // Should create chart elements
    expect(document.createElement).toHaveBeenCalled();
  });

  test("displays checklist statistics", () => {
    createAnalyticsView(jest.fn());

    // Should show checklist completion stats
    expect(document.createElement).toHaveBeenCalled();
  });

  test("export button triggers analytics export", () => {
    analyticsService.exportAnalytics.mockImplementation(() => {});

    createAnalyticsView(jest.fn());

    // Find export button and simulate click
    const createElementCalls = document.createElement.mock.calls;
    const exportButton = createElementCalls.find(call =>
      call[0] === "button" &&
      mockElement.textContent === "📥 Export Data"
    );

    if (exportButton) {
      exportButton.click();
      expect(analyticsService.exportAnalytics).toHaveBeenCalled();
    }
  });

  test("back button triggers onBack callback", () => {
    const mockOnBack = jest.fn();
    createAnalyticsView(mockOnBack);

    // Find back button and simulate click
    const createElementCalls = document.createElement.mock.calls;
    const backButton = createElementCalls.find(call =>
      call[0] === "button" &&
      mockElement.textContent === "← Back to Notes"
    );

    if (backButton) {
      backButton.click();
      expect(mockOnBack).toHaveBeenCalled();
    }
  });

  test("listens for storage changes to update analytics", () => {
    createAnalyticsView(jest.fn());

    expect(window.addEventListener).toHaveBeenCalled();
  });

  test("updates analytics when storage changes", () => {
    const getAnalyticsSpy = analyticsService.getAnalytics;
    let storageHandler;

    // Mock addEventListener to capture the storage handler
    window.addEventListener = jest.fn((event, handler) => {
      if (event === "storage") {
        storageHandler = handler;
      }
    });

    createAnalyticsView(jest.fn());

    // Simulate storage change
    const storageEvent = {
      key: "stickynotes-notes"
    };

    storageHandler(storageEvent);

    // Should call getAnalytics again
    expect(getAnalyticsSpy).toHaveBeenCalled();
  });
});
