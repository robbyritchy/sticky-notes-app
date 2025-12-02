// __tests__/checklistService.test.js
import { checklistService } from "../src/services/checklistService.js";

describe("checklistService", () => {
  describe("isChecklist", () => {
    test("returns true for checklist notes", () => {
      const checklistNote = { type: "checklist", items: [] };
      const regularNote = { type: "note", content: "text" };
      const undefinedType = {};

      expect(checklistService.isChecklist(checklistNote)).toBe(true);
      expect(checklistService.isChecklist(regularNote)).toBe(false);
      expect(checklistService.isChecklist(undefinedType)).toBe(false);
    });
  });

  describe("createItem", () => {
    test("creates new checklist item", () => {
      const item = checklistService.createItem("Buy milk", true);

      expect(item).toHaveProperty('id');
      expect(item.text).toBe("Buy milk");
      expect(item.checked).toBe(true);
      expect(item).toHaveProperty('createdAt');
    });

    test("creates item with default values", () => {
      const item = checklistService.createItem();

      expect(item.text).toBe("");
      expect(item.checked).toBe(false);
    });
  });

  describe("addItem", () => {
    test("adds item to checklist", () => {
      const note = { type: "checklist", items: [] };

      const newItem = checklistService.addItem(note, "New task");

      expect(note.items).toHaveLength(1);
      expect(note.items[0].text).toBe("New task");
      expect(newItem).toBe(note.items[0]);
    });

    test("returns null for non-checklist", () => {
      const note = { type: "note" };

      const result = checklistService.addItem(note, "Task");

      expect(result).toBeNull();
    });
  });

  describe("removeItem", () => {
    test("removes item from checklist", () => {
      const itemId = "item-123";
      const note = {
        type: "checklist",
        items: [
          { id: itemId, text: "Task 1" },
          { id: "item-456", text: "Task 2" }
        ]
      };

      const result = checklistService.removeItem(note, itemId);

      expect(result).toBe(true);
      expect(note.items).toHaveLength(1);
      expect(note.items[0].id).toBe("item-456");
    });

    test("returns false for non-existent item", () => {
      const note = { type: "checklist", items: [] };

      const result = checklistService.removeItem(note, "non-existent");

      expect(result).toBe(false);
    });
  });

  describe("toggleItem", () => {
    test("toggles item checked state", () => {
      const itemId = "item-123";
      const note = {
        type: "checklist",
        items: [{ id: itemId, text: "Task", checked: false }]
      };

      const result = checklistService.toggleItem(note, itemId);

      expect(result).toBe(true);
      expect(note.items[0].checked).toBe(true);

      // Toggle again
      checklistService.toggleItem(note, itemId);
      expect(note.items[0].checked).toBe(false);
    });

    test("returns false for non-existent item", () => {
      const note = { type: "checklist", items: [] };

      const result = checklistService.toggleItem(note, "non-existent");

      expect(result).toBe(false);
    });
  });

  describe("updateItemText", () => {
    test("updates item text", () => {
      const itemId = "item-123";
      const note = {
        type: "checklist",
        items: [{ id: itemId, text: "Old text" }]
      };

      const result = checklistService.updateItemText(note, itemId, "New text");

      expect(result).toBe(true);
      expect(note.items[0].text).toBe("New text");
      expect(note.items[0]).toHaveProperty('updatedAt');
    });

    test("returns false for non-existent item", () => {
      const note = { type: "checklist", items: [] };

      const result = checklistService.updateItemText(note, "non-existent", "text");

      expect(result).toBe(false);
    });
  });

  describe("getCompletionStats", () => {
    test("calculates completion statistics", () => {
      const note = {
        type: "checklist",
        items: [
          { id: "1", text: "Task 1", checked: true },
          { id: "2", text: "Task 2", checked: false },
          { id: "3", text: "Task 3", checked: true }
        ]
      };

      const stats = checklistService.getCompletionStats(note);

      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(2);
      expect(stats.percentage).toBe(67); // Math.round(2/3 * 100)
    });

    test("handles empty checklist", () => {
      const note = { type: "checklist", items: [] };

      const stats = checklistService.getCompletionStats(note);

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.percentage).toBe(0);
    });

    test("returns default stats for non-checklist", () => {
      const note = { type: "note" };

      const stats = checklistService.getCompletionStats(note);

      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.percentage).toBe(0);
    });
  });

  describe("convertToChecklist", () => {
    test("converts regular note to checklist", () => {
      const note = {
        type: "note",
        content: "Task 1\nTask 2\nTask 3"
      };

      const result = checklistService.convertToChecklist(note);

      expect(result.type).toBe("checklist");
      expect(result.items).toHaveLength(3);
      expect(result.items[0].text).toBe("Task 1");
      expect(result.items[1].text).toBe("Task 2");
      expect(result.items[2].text).toBe("Task 3");
      expect(result.content).toBe("");
    });

    test("returns existing checklist unchanged", () => {
      const note = { type: "checklist", items: [{ id: "1", text: "Existing" }] };

      const result = checklistService.convertToChecklist(note);

      expect(result).toBe(note); // Same reference
    });

    test("handles empty content", () => {
      const note = { type: "note", content: "" };

      const result = checklistService.convertToChecklist(note);

      expect(result.type).toBe("checklist");
      expect(result.items).toHaveLength(0);
    });
  });

  describe("convertToRegularNote", () => {
    test("converts checklist back to regular note", () => {
      const note = {
        type: "checklist",
        items: [
          { id: "1", text: "Task 1" },
          { id: "2", text: "Task 2" }
        ]
      };

      const result = checklistService.convertToRegularNote(note);

      expect(result.type).toBe("note");
      expect(result.content).toBe("Task 1\nTask 2");
      expect(result.items).toBeUndefined();
    });

    test("returns non-checklist unchanged", () => {
      const note = { type: "note", content: "text" };

      const result = checklistService.convertToRegularNote(note);

      expect(result).toBe(note);
    });
  });
});
