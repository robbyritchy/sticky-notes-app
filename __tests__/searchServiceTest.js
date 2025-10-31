// __tests__/searchService.test.js
import { searchService } from "../src/services/searchService.js";

describe("searchService", () => {
  const notes = [
    { id: "1", content: "Buy milk", category: "shopping" },
    { id: "2", content: "Meeting notes", category: "work" }
  ];

  test("filters by content", () => {
    const result = searchService.filter(notes, "milk");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  test("filters by category", () => {
    const result = searchService.filter(notes, "work");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });
});
