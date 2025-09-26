const notesContainer = document.getElementById("app");
const addNoteButton = notesContainer.querySelector(".add-note");

init();

function init() {
  getNotes().forEach(note => {
    const noteElement = createNoteElement(note.id, note.content, note);
    notesContainer.insertBefore(noteElement, addNoteButton);
  });

  addNoteButton.addEventListener("click", () => addNote());
}

function getNotes() {
  return JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
}

function saveNotes(notes) {
  localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
}

function createNoteElement(id, content, savedData = {}) {
  const element = document.createElement("textarea");
  element.classList.add("note");
  element.value = content;
  element.placeholder = "Empty Sticky Note";

  // Restore saved position/size if available
  element.style.top = savedData.top || "50px";
  element.style.left = savedData.left || "50px";
  element.style.width = savedData.width || "200px";
  element.style.height = savedData.height || "200px";

  // Save content changes
  element.addEventListener("change", () => {
    updateNote(id, element.value, element);
  });

  // Double click deletes
  element.addEventListener("dblclick", () => {
    const doDelete = confirm("Delete this sticky note?");
    if (doDelete) deleteNote(id, element);
  });

  // Dragging
  let isDragging = false, offsetX, offsetY;

  element.addEventListener("mousedown", (e) => {
    // If near the resize corner, skip drag (browser handles resize)
    const rect = element.getBoundingClientRect();
    const resizeZone = 15; // pixels from right/bottom
    const inResizeCorner =
      e.offsetX > rect.width - resizeZone && e.offsetY > rect.height - resizeZone;

    if (!inResizeCorner) {
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      element.style.left = (e.pageX - offsetX) + "px";
      element.style.top = (e.pageY - offsetY) + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      updateNote(id, element.value, element); // save new position
    } else {
      // mouseup after resize → save size
      updateNote(id, element.value, element);
    }
  });

  return element;
}

function addNote() {
  const notes = getNotes();
  const noteObject = {
    id: Math.floor(Math.random() * 10000),
    content: "",
    top: "50px",
    left: "50px",
    width: "200px",
    height: "200px"
  };

  const noteElement = createNoteElement(noteObject.id, noteObject.content, noteObject);
  notesContainer.insertBefore(noteElement, addNoteButton);
  notes.push(noteObject);
  saveNotes(notes);
}

function updateNote(id, newContent, element) {
  const notes = getNotes();
  const targetNote = notes.find(note => note.id == id);
  if (targetNote) {
    targetNote.content = newContent;
    targetNote.top = element.style.top;
    targetNote.left = element.style.left;
    targetNote.width = element.style.width;
    targetNote.height = element.style.height;
    saveNotes(notes);
  }
}

function deleteNote(id, element) {
  const notes = getNotes().filter(note => note.id != id);
  saveNotes(notes);
  notesContainer.removeChild(element);
}
