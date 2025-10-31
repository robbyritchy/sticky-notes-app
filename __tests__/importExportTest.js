/**
 * @jest-environment jsdom
 */

global.URL = {
  createObjectURL: jest.fn(() => "mock-url"),
  revokeObjectURL: jest.fn()
};

class MockFileReader {
  readAsText(file) {
    this.result = file.mockContent;
    setTimeout(() => this.onload({ target: this }), 0);
  }
}
global.FileReader = MockFileReader;

const clickMock = jest.fn();
const originalCreateElement = document.createElement.bind(document);
jest.spyOn(document, "createElement").mockImplementation((tag) => {
  const el = originalCreateElement(tag);
  if (tag === "a") el.click = clickMock;
  return el;
});

import { importExportService } from "../src/services/importExportService.js";

describe("importExportService", () => {
  const sampleNotes = [{ id: "n1", content: "test" }];

  test("export produces downloadable anchor", () => {
    importExportService.exportNotes(sampleNotes);
    expect(clickMock).toHaveBeenCalled();
  });

  test("import reads valid JSON", async () => {
    const file = new File([JSON.stringify({ notes: sampleNotes })], "n.json", { type: "application/json" });
    file.mockContent = JSON.stringify({ notes: sampleNotes });
    const notes = await importExportService.importNotes(file);
    expect(notes).toEqual(sampleNotes);
  });

  test("import rejects invalid JSON structure", async () => {
    const file = new File([JSON.stringify({ wrong: 123 })], "bad.json", { type: "application/json" });
    file.mockContent = JSON.stringify({ wrong: 123 });
    await expect(importExportService.importNotes(file)).rejects.toThrow("Invalid export file");
  });
});
