// __tests__/stylePersistence.test.js
import { getNotes, saveNotes } from "../main.js";

describe("style persistence", () => {
  test("saves and reloads color and shape", () => {
    const notes = [
      { 
        id: "1", content: "a", title: "A", 
        color: "#ff0000", shape: "circle", 
        top: "10px", left: "10px", width: "100px", height: "100px"
      }
    ];
    saveNotes(notes);
    const reloaded = getNotes();
    expect(reloaded[0].color).toBe("#ff0000");
    expect(reloaded[0].shape).toBe("circle");
  });
});
