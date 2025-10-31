// __tests__/importExportService.test.js
import { importExportService } from "../services/importExportService.js";

describe("importExportService", () => {
  const sampleNotes = [{ id: "n1", content: "test" }];

  test("export produces downloadable anchor", () => {
    const aMock = { click: jest.fn() };
    const createAnchorSpy = jest.spyOn(document, 'createElement').mockReturnValue(aMock);
    importExportService.exportNotes(sampleNotes);
    expect(createAnchorSpy).toHaveBeenCalledWith("a");
    expect(aMock.click).toHaveBeenCalled();
    createAnchorSpy.mockRestore();
  });

  test("import reads valid JSON", async () => {
    const file = new File([JSON.stringify(sampleNotes)], "n.json", { type: "application/json" });
    const notes = await importExportService.importNotes(file);
    expect(notes).toEqual(sampleNotes);
  });

  test("import rejects invalid JSON", async () => {
    const file = new File(["notjson"], "bad.json", { type: "application/json" });
    await expect(importExportService.importNotes(file)).rejects.toThrow();
  });
});
