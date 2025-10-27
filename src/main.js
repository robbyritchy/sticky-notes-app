const notesContainer = document.getElementById("app");
const addNoteButton = notesContainer.querySelector(".add-note");

init();

// Group Button 
const groupButton = document.createElement("button");
groupButton.textContent = "Group by Category";
groupButton.style.position = "absolute";
groupButton.style.top = "10px";
groupButton.style.left = "60px";
groupButton.style.padding = "8px 12px";
groupButton.style.fontSize = "14px";
groupButton.style.border = "none";
groupButton.style.background = "#2196f3";
groupButton.style.color = "white";
groupButton.style.borderRadius = "6px";
groupButton.style.cursor = "pointer";
groupButton.addEventListener("mouseover", () => groupButton.style.background = "#1976d2");
groupButton.addEventListener("mouseout", () => groupButton.style.background = "#2196f3");
notesContainer.appendChild(groupButton);

groupButton.addEventListener("click", groupNotesByCategory);

function groupNotesByCategory() {
  const notes = Array.from(notesContainer.querySelectorAll(".note-wrapper"));
  
  // Map notes by category
  const categoryMap = {};
  notes.forEach(note => {
    const category = note.querySelector(".note-header").value || "Uncategorized";
    if (!categoryMap[category]) categoryMap[category] = [];
    categoryMap[category].push(note);
  });

  // Layout variables
  const columnWidth = 220; // width of each column including spacing
  const startX = 20;       // left padding
  const startY = 60;       // top padding
  const verticalSpacing = 20;

  let colIndex = 0;
  for (const category in categoryMap) {
    let yOffset = startY;
    const notesInCategory = categoryMap[category];
    for (const note of notesInCategory) {
      note.style.left = startX + colIndex * columnWidth + "px";
      note.style.top = yOffset + "px";
      yOffset += note.offsetHeight + verticalSpacing;
    }
    colIndex++;
  }
}


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
  const wrapper = document.createElement("div");
  wrapper.classList.add("note-wrapper");
  wrapper.style.position = "absolute";
  wrapper.style.top = savedData.top || "50px";
  wrapper.style.left = savedData.left || "50px";
  wrapper.style.width = savedData.width || "200px";
  wrapper.style.height = savedData.height || "220px";
  wrapper.style.background = "#fff59d";
  wrapper.style.boxShadow = "0 3px 6px rgba(0,0,0,0.2)";
  wrapper.style.borderRadius = "8px";
  wrapper.style.overflow = "hidden";
  wrapper.style.cursor = "move";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";

  // Category Header 
  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.classList.add("note-header");
  categoryInput.placeholder = "Category";
  categoryInput.value = savedData.category || "Uncategorized";
  categoryInput.style.width = "100%";
  categoryInput.style.border = "none";
  categoryInput.style.background = "#f0e45c";
  categoryInput.style.fontWeight = "bold";
  categoryInput.style.fontSize = "14px";
  categoryInput.style.outline = "none";
  categoryInput.style.cursor = "text";
  categoryInput.style.padding = "6px 8px";
  categoryInput.style.boxSizing = "border-box";
  categoryInput.style.flexShrink = "0";

  // Note Textarea 
  const textarea = document.createElement("textarea");
  textarea.classList.add("note");
  textarea.value = content;
  textarea.placeholder = "Empty Sticky Note";
  textarea.style.width = "100%";
  textarea.style.height = "100%";
  textarea.style.border = "none";
  textarea.style.resize = "none";
  textarea.style.background = "transparent";
  textarea.style.outline = "none";
  textarea.style.fontSize = "14px";
  textarea.style.cursor = "text";
  textarea.style.padding = "6px 8px";
  textarea.style.boxSizing = "border-box";
  textarea.style.flexGrow = "1";

  // Save content/category changes
  textarea.addEventListener("change", () => {
    updateNote(id, textarea.value, wrapper, categoryInput.value);
  });
  categoryInput.addEventListener("change", () => {
    updateNote(id, textarea.value, wrapper, categoryInput.value);
  });

  //Dragging 
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  categoryInput.addEventListener("mousedown", (e) => {
    // If near the resize corner, skip drag (browser handles resize)
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    wrapper.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      wrapper.style.left = e.pageX - offsetX + "px";
      wrapper.style.top = e.pageY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = "move";
      updateNote(id, textarea.value, wrapper, categoryInput.value);
    }
  });

  // Delete Button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "×";
  deleteBtn.style.position = "absolute";
  deleteBtn.style.top = "4px";
  deleteBtn.style.right = "4px";
  deleteBtn.style.width = "20px";
  deleteBtn.style.height = "20px";
  deleteBtn.style.border = "none";
  deleteBtn.style.background = "red";
  deleteBtn.style.color = "white";
  deleteBtn.style.borderRadius = "50%";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.addEventListener("click", () => {
    const confirmDelete = confirm("Delete this sticky note?");
    if (confirmDelete) {
      deleteNote(id, wrapper);
    }
  });

  wrapper.appendChild(categoryInput);
  wrapper.appendChild(textarea);
  wrapper.appendChild(deleteBtn);

  return wrapper;
}


function addNote() {
  const notes = getNotes();
  const noteObject = {
    id: Math.floor(Math.random() * 10000),
    content: "",
    category: "Uncategorized",
    top: "50px",
    left: "50px",
    width: "200px",
    height: "220px"
  };

  const noteElement = createNoteElement(noteObject.id, noteObject.content, noteObject);
  notesContainer.insertBefore(noteElement, addNoteButton);
  notes.push(noteObject);
  saveNotes(notes);
}

function updateNote(id, newContent, element, newCategory = "Uncategorized") {
  const notes = getNotes();
  const targetNote = notes.find(note => note.id == id);
  if (targetNote) {
    targetNote.content = newContent;
    targetNote.category = newCategory || "Uncategorized";
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
  // remove element from DOM if it's still attached
  if (element && element.parentNode === notesContainer) {
    notesContainer.removeChild(element);
  }
}