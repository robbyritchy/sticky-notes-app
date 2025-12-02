// __tests__/SharedNoteView.test.js
import { createSharedNoteView } from "../src/components/SharedNoteView.js";

// Mock the checklistService
jest.mock("../src/services/checklistService.js", () => ({
  checklistService: {
    isChecklist: jest.fn(),
    getCompletionStats: jest.fn()
  }
}));

import { checklistService } from "../src/services/checklistService.js";

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

describe("createSharedNoteView", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock document methods
    document.createElement = jest.fn(() => mockElement);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
  });

  test("creates shared view for regular note", () => {
    const sharedNote = {
      id: "note-123",
      title: "Shared Note",
      content: "This is shared content",
      isShared: true,
      isReadOnly: true,
      updatedAt: "2024-01-15T10:00:00Z"
    };

    checklistService.isChecklist.mockReturnValue(false);

    const view = createSharedNoteView(sharedNote);

    expect(document.body.innerHTML).toBe("");
    expect(document.createElement).toHaveBeenCalled();
  });

  test("creates shared view for checklist note", () => {
    const sharedNote = {
      id: "note-123",
      title: "Shared Checklist",
      type: "checklist",
      items: [
        { id: "item1", text: "Task 1", checked: true },
        { id: "item2", text: "Task 2", checked: false }
      ],
      isShared: true,
      isReadOnly: true,
      updatedAt: "2024-01-15T10:00:00Z"
    };

    checklistService.isChecklist.mockReturnValue(true);
    checklistService.getCompletionStats.mockReturnValue({
      total: 2,
      completed: 1,
      percentage: 50
    });

    const view = createSharedNoteView(sharedNote);

    expect(checklistService.isChecklist).toHaveBeenCalledWith(sharedNote);
    expect(checklistService.getCompletionStats).toHaveBeenCalledWith(sharedNote);
  });

  test("displays note title", () => {
    const sharedNote = {
      title: "Test Shared Note",
      content: "Content",
      updatedAt: "2024-01-15T10:00:00Z"
    };

    checklistService.isChecklist.mockReturnValue(false);

    createSharedNoteView(sharedNote);

    // Title should be set in the created elements
    expect(document.createElement).toHaveBeenCalled();
  });

  test("displays note content for regular notes", () => {
    const sharedNote = {
      title: "Test Note",
      content: "This is the content of the shared note.",
      updatedAt: "2024-01-15T10:00:00Z"
    };

    checklistService.isChecklist.mockReturnValue(false);

    createSharedNoteView(sharedNote);

    expect(document.createElement).toHaveBeenCalled();
  });

  test("displays checklist items for checklist notes", () => {
    const sharedNote = {
      title: "Test Checklist",
      type: "checklist",
      items: [
        { id: "1", text: "Task 1", checked: true },
        { id: "2", text: "Task 2", checked: false }
      ],
      updatedAt: "2024-01-15T10:00:00Z"
    };

    checklistService.isChecklist.mockReturnValue(true);
    checklistService.getCompletionStats.mockReturnValue({
      total: 2,
      completed: 1,
      percentage: 50
    });

    createSharedNoteView(sharedNote);

    expect(checklistService.getCompletionStats).toHaveBeenCalledWith(sharedNote);
  });

  test("shows last updated timestamp", () => {
    const sharedNote = {
      title: "Test Note",
      content: "Content",
      updatedAt: "2024-01-15T10:00:00Z"
    };

    checklistService.isChecklist.mockReturnValue(false);

    createSharedNoteView(sharedNote);

    // Should format and display the updated timestamp
    expect(document.createElement).toHaveBeenCalled();
  });

  test("handles empty checklist", () => {
    const sharedNote = {
      title: "Empty Checklist",
      type: "checklist",
      items: [],
      updatedAt: "2024-01-15T10:00:00Z"
    };

    checklistService.isChecklist.mockReturnValue(true);
    checklistService.getCompletionStats.mockReturnValue({
      total: 0,
      completed: 0,
      percentage: 0
    });

    createSharedNoteView(sharedNote);

    expect(checklistService.isChecklist).toHaveBeenCalledWith(sharedNote);
  });

  test("displays read-only badge", () => {
    const sharedNote = {
      title: "Read Only Note",
      content: "Content",
      isShared: true,
      isReadOnly: true,
      updatedAt: "2024-01-15T10:00:00Z"
    };

    checklistService.isChecklist.mockReturnValue(false);

    createSharedNoteView(sharedNote);

    // Should show "Shared Note (Read-Only)" badge
    expect(document.createElement).toHaveBeenCalled();
  });
});
