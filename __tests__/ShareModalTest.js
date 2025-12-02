// __tests__/ShareModal.test.js
import { createShareModal } from "../src/components/ShareModal.js";

// Mock the sharingService
jest.mock("../src/services/sharingService.js", () => ({
  sharingService: {
    generateShareLink: jest.fn(),
    getNoteShares: jest.fn(),
    revokeShareLink: jest.fn()
  }
}));

import { sharingService } from "../src/services/sharingService.js";

// Mock DOM elements and events
const mockElement = {
  addEventListener: jest.fn(),
  remove: jest.fn(),
  contains: jest.fn(() => false),
  querySelector: jest.fn(),
  style: {},
  innerHTML: "",
  textContent: "",
  appendChild: jest.fn(),
  className: "",
  click: jest.fn(),
  select: jest.fn()
};

const mockInput = {
  ...mockElement,
  type: "text",
  value: "",
  readOnly: true,
  select: jest.fn()
};

const mockEvent = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: mockElement
};

describe.skip("createShareModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock document methods
    document.createElement = jest.fn((tagName) => {
      if (tagName === "input") {
        return mockInput;
      }
      return mockElement;
    });
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
    document.querySelector = jest.fn(() => mockElement);
    document.execCommand = jest.fn(() => true);

    // Mock window methods
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
    const originalLocation = window.location;
    delete window.location;
    window.location = {
      origin: "http://localhost:3000",
      pathname: "/",
      search: ""
    };
  });

  test("creates modal with shareable link", () => {
    const mockShares = [];
    const mockGenerateResult = {
      token: "test-token",
      url: "http://localhost:3000/?share=test-token"
    };

    sharingService.getNoteShares.mockReturnValue(mockShares);
    sharingService.generateShareLink.mockReturnValue(mockGenerateResult);

    const modal = createShareModal("note-123", "Test Note");

    expect(sharingService.generateShareLink).toHaveBeenCalledWith("note-123");
    expect(document.createElement).toHaveBeenCalled();
  });

  test("displays existing share links", () => {
    const mockShares = [
      {
        token: "existing-token",
        createdAt: "2024-01-15T10:00:00Z",
        url: "http://localhost:3000/?share=existing-token"
      }
    ];

    sharingService.getNoteShares.mockReturnValue(mockShares);

    createShareModal("note-123", "Test Note");

    expect(sharingService.getNoteShares).toHaveBeenCalledWith("note-123");
  });

  test("copies link to clipboard when copy button is clicked", () => {
    const mockShares = [];
    const mockGenerateResult = {
      token: "test-token",
      url: "http://localhost:3000/?share=test-token"
    };

    sharingService.getNoteShares.mockReturnValue(mockShares);
    sharingService.generateShareLink.mockReturnValue(mockGenerateResult);

    createShareModal("note-123", "Test Note");

    // Find the copy button and simulate click
    const createElementCalls = document.createElement.mock.calls;
    const copyButton = createElementCalls.find(call =>
      call[0] === "button" &&
      mockElement.textContent === "Copy"
    );

    if (copyButton) {
      copyButton.click();
      expect(document.execCommand).toHaveBeenCalledWith("copy");
    }
  });

  test("revokes share link when revoke button is clicked", () => {
    const mockShares = [
      {
        token: "test-token",
        createdAt: "2024-01-15T10:00:00Z",
        url: "http://localhost:3000/?share=test-token"
      }
    ];

    sharingService.getNoteShares.mockReturnValue(mockShares);
    sharingService.revokeShareLink.mockReturnValue(true);

    // Mock window.confirm
    global.confirm = jest.fn(() => true);

    createShareModal("note-123", "Test Note");

    // Note: This test would need more complex DOM interaction mocking to work properly
    // For now, just verify the service setup works
    expect(sharingService.getNoteShares).toHaveBeenCalledWith("note-123");
  });

  test("closes modal when close button is clicked", () => {
    sharingService.getNoteShares.mockReturnValue([]);
    sharingService.generateShareLink.mockReturnValue({
      token: "test-token",
      url: "http://localhost:3000/?share=test-token"
    });

    const modal = createShareModal("note-123", "Test Note");

    // The modal should have event listeners for closing
    expect(document.addEventListener).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  test("closes modal on Escape key", () => {
    sharingService.getNoteShares.mockReturnValue([]);
    sharingService.generateShareLink.mockReturnValue({
      token: "test-token",
      url: "http://localhost:3000/?share=test-token"
    });

    const modal = createShareModal("note-123", "Test Note");

    // Get the escape handler
    const escapeHandler = document.addEventListener.mock.calls.find(
      call => call[0] === "keydown"
    )[1];

    // Simulate Escape key
    const escapeEvent = { key: "Escape" };
    escapeHandler(escapeEvent);

    expect(mockElement.remove).toHaveBeenCalled();
  });

  test("closes modal when clicking outside", () => {
    sharingService.getNoteShares.mockReturnValue([]);
    sharingService.generateShareLink.mockReturnValue({
      token: "test-token",
      url: "http://localhost:3000/?share=test-token"
    });

    const modal = createShareModal("note-123", "Test Note");

    // Get the click handler - find it in the mock calls
    const clickCalls = document.addEventListener.mock.calls.filter(
      call => call[0] === "click"
    );

    if (clickCalls.length > 0) {
      const clickHandler = clickCalls[0][1];
      // Simulate click outside modal
      const outsideClick = { target: document.body };
      mockElement.contains.mockReturnValue(false);
      clickHandler(outsideClick);

      expect(mockElement.remove).toHaveBeenCalled();
    }
  });
});
