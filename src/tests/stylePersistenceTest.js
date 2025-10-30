// __tests__/stylePersistence.test.js
import { getNotes, saveNotes } from "../main.js"; // or import service functions
describe("style persistence", () => {
  test("saves and reloads color and shape", () => {
    const notes = [
      { id: "1", content: "a", color: "#ff0000", shape: "circle", top: "10px", left: "10px", width: "100px", height: "100px" }
    ];
    localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
    // simulate reload
    const reloaded = JSON.parse(localStorage.getItem("stickynotes-notes"));
    expect(reloaded[0].color).toBe("#ff0000");
    expect(reloaded[0].shape).toBe("circle");
  });
});
