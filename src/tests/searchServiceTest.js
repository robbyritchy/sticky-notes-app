import { searchService } from "../services/searchService.js";
describe("searchService", () => {
  const notes = [
    { id: "1", content: "Buy milk", category: "shopping" },
    { id: "2", content: "Meeting notes", category: "work" }
  ];
  test("filters by content", () => {
    const r = searchService.filter(notes, "milk");
    expect(r.length).toBe(1);
    expect(r[0].id).toBe("1");
  });
  test("filters by category", () => {
    const r = searchService.filter(notes, "work");
    expect(r.length).toBe(1);
    expect(r[0].id).toBe("2");
  });
});
