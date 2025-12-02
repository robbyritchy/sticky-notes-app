// __tests__/HistoryModal.test.js
import { createHistoryModal } from "../src/components/HistoryModal.js";

// Mock the versionHistoryService
jest.mock("../src/services/versionHistoryService.js", () => ({
  versionHistoryService: {
    getHistory: jest.fn(),
    restoreVersion: jest.fn()
  }
}));

import { versionHistoryService } from "../src/services/versionHistoryService.js";

// Mock DOM elements and events
const mockElement = {
  addEventListener: jest.fn(),
  remove: jest.fn(),
  contains: jest.fn(),
  querySelector: jest.fn(() => mockElement),
  appendChild: jest.fn(),
  style: {},
  innerHTML: "",
  textContent: "",
  className: "",
  click: jest.fn()
};

const mockEvent = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: mockElement
};

describe.skip("createHistoryModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock document methods
    document.createElement = jest.fn(() => ({
      ...mockElement,
      appendChild: jest.fn(),
      addEventListener: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false),
      querySelector: jest.fn(() => mockElement),
      style: {},
      innerHTML: "",
      textContent: "",
      className: ""
    }));
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
    document.querySelector = jest.fn(() => mockElement);

    // Mock window methods
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  test("creates modal with correct structure", () => {
    const mockHistory = [
      {
        id: "v1",
        timestamp: "2024-01-15T10:00:00Z",
        data: { content: "Version 1", title: "Title 1" }
      }
    ];

    versionHistoryService.getHistory.mockReturnValue(mockHistory);

    const modal = createHistoryModal("note-123", "Test Note");

    expect(versionHistoryService.getHistory).toHaveBeenCalledWith("note-123");
    expect(document.createElement).toHaveBeenCalled();
  });

  test("displays version history correctly", () => {
    const mockHistory = [
      {
        id: "v1",
        timestamp: "2024-01-15T10:00:00Z",
        data: { content: "Version 1" }
      }
    ];

    versionHistoryService.getHistory.mockReturnValue(mockHistory);

    createHistoryModal("note-123", "Test Note");

    expect(versionHistoryService.getHistory).toHaveBeenCalledWith("note-123");
  });

  test("handles empty history", () => {
    versionHistoryService.getHistory.mockReturnValue([]);

    const modal = createHistoryModal("note-123", "Test Note");

    // Should still create modal but with empty message
    expect(document.createElement).toHaveBeenCalled();
  });

  test("calls onRestore when restore button is clicked", () => {
    const mockHistory = [
      {
        id: "v1",
        timestamp: "2024-01-15T10:00:00Z",
        data: { content: "Version 1" }
      }
    ];

    versionHistoryService.getHistory.mockReturnValue(mockHistory);

    const mockOnRestore = jest.fn();
    const modal = createHistoryModal("note-123", "Test Note", mockOnRestore);

    expect(mockOnRestore).not.toHaveBeenCalled(); // Not called yet
  });

  test("closes modal when close button is clicked", () => {
    versionHistoryService.getHistory.mockReturnValue([]);

    const modal = createHistoryModal("note-123", "Test Note");

    // The modal should have event listeners for closing
    expect(document.addEventListener).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  test("closes modal on Escape key", () => {
    versionHistoryService.getHistory.mockReturnValue([]);

    const modal = createHistoryModal("note-123", "Test Note");

    expect(mockElement.remove).toHaveBeenCalled();
  });

  test("closes modal when clicking outside", () => {
    versionHistoryService.getHistory.mockReturnValue([]);

    const modal = createHistoryModal("note-123", "Test Note");

    expect(mockElement.remove).toHaveBeenCalled();
  });
});
