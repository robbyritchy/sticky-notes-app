/**
 * @jest-environment jsdom
 */

let getNotes, saveNotes;

beforeAll(async () => {
  // Create DOM elements first
  const appDiv = document.createElement("div");
  appDiv.id = "app";

  const addNoteBtn = document.createElement("button");
  addNoteBtn.className = "add-note";
  appDiv.appendChild(addNoteBtn);

  document.body.appendChild(appDiv);

  // Now import main.js dynamically
  const main = await import("../src/main.js");
  getNotes = main.getNotes;
  saveNotes = main.saveNotes;
});

describe("style persistence", () => {
  test("saves and reloads color and shape", () => {
    const notes = [
      { 
        id: "1",
        content: "a",
        title: "A",
        color: "#ff0000",
        shape: "circle",
        top: "10px",
        left: "10px",
        width: "100px",
        height: "100px"
      }
    ];

    saveNotes(notes);
    const reloaded = getNotes();

    expect(reloaded[0].color).toBe("#ff0000");
    expect(reloaded[0].shape).toBe("circle");
  });
});
