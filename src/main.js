// main.js - integrated app
import { importExportService } from "./services/importExportService.js";
import { FilePicker } from "./components/FilePicker.js";
import { createStylePicker } from "./components/NoteStylePicker.js";
import { searchService } from "./services/searchService.js";
import { notificationService, reminderScheduler } from "./services/notificationService.js";

const notesContainer = document.getElementById("app");
let addNoteButton = notesContainer.querySelector(".add-note");

// toolbar icons - using the images you provided earlier (paths to /mnt/data files)
// update these if you place images in a different folder
const IMPORT_ICON = "/mnt/data/5d4eafce-c613-4529-9473-e0dc8fc7af16.png";
const EXPORT_ICON = "/mnt/data/195a9fd0-4f58-4f8d-965d-160e68c05834.png";
const STYLE_ICON = "/mnt/data/7981ef25-05db-4344-b9e1-8a580dbd1862.png";

// create toolbar
const toolbar = document.createElement("div");
toolbar.className = "toolbar";

const importBtn = document.createElement("button");
importBtn.title = "Import notes";
importBtn.innerHTML = `<img src="${IMPORT_ICON}" alt="Import" />`;

const exportBtn = document.createElement("button");
exportBtn.title = "Export notes";
exportBtn.innerHTML = `<img src="${EXPORT_ICON}" alt="Export" />`;

const styleLegendBtn = document.createElement("button");
styleLegendBtn.title = "Style picker help";
styleLegendBtn.innerHTML = `<img src="${STYLE_ICON}" alt="Style" />`;

toolbar.appendChild(importBtn);
toolbar.appendChild(exportBtn);
toolbar.appendChild(styleLegendBtn);
notesContainer.appendChild(toolbar);

// search bar
const searchBar = document.createElement("div");
searchBar.className = "search-bar";
const searchInput = document.createElement("input");
searchInput.placeholder = "Search notes by text or category…";
searchBar.appendChild(searchInput);
notesContainer.appendChild(searchBar);

// file picker + import/export wiring
const filePicker = new FilePicker(async (file) => {
  try {
    const imported = await importExportService.importNotes(file);
    // Map to our note shape and merge
    const current = getNotes();
    // avoid collided ids: if imported id already exists, prefix with import-
    imported.forEach(n => {
      if (current.some(c => c.id == n.id)) {
        n.id = `import-${Date.now()}-${Math.floor(Math.random()*10000)}`;
      }
      // ensure required fields exist
      n.content = n.content || "";
      n.category = n.category || "Uncategorized";
      n.top = n.top || "60px";
      n.left = n.left || "60px";
      n.width = n.width || "200px";
      n.height = n.height || "220px";
      n.color = n.color || "#fff59d";
      n.shape = n.shape || "rectangle";
    });
    const merged = [...current, ...imported];
    saveNotes(merged);
    renderAllNotes();
    reminderScheduler.rescheduleAll(merged);
    alert(`Imported ${imported.length} notes.`);
  } catch (err) {
    alert("Import failed: " + (err.message || err));
  }
});

importBtn.addEventListener("click", () => filePicker.open());
exportBtn.addEventListener("click", () => {
  const notes = getNotes();
  importExportService.exportNotes(notes);
});

// small helper: get notes from localStorage (stickynotes-notes key)
function getNotes() {
  return JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
}
function saveNotes(notes) {
  localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
}

// Initialize app
init();

function init() {
  // If no add button in DOM (maybe replaced), ensure addNoteButton ref
  addNoteButton = notesContainer.querySelector(".add-note") || createAddButton();
  // restore notes
  renderAllNotes();
  // request notification permission so scheduler can display later
  if ("Notification" in window && Notification.permission !== "granted") {
    // ask but do not force - better UX is to ask when user enables reminders; we ask once here
    notificationService.requestPermission().then(p => {
      // no-op
    });
  }
  // schedule existing reminders
  reminderScheduler.rescheduleAll(getNotes());
  // wire search
  searchInput.addEventListener("input", (e) => {
    renderAllNotes(e.target.value);
  });
}

// create add button if one not present
function createAddButton() {
  const button = document.createElement("button");
  button.className = "add-note";
  button.textContent = "Add Note";
  notesContainer.appendChild(button);
  button.addEventListener("click", addNote);
  return button;
}

function createNoteElement(id, content, savedData = {}) {
  // wrapper
  const wrapper = document.createElement("div");
  wrapper.classList.add("note-wrapper");
  wrapper.style.position = "absolute";
  wrapper.style.top = savedData.top || "50px";
  wrapper.style.left = savedData.left || "50px";
  wrapper.style.width = savedData.width || "200px";
  wrapper.style.height = savedData.height || "220px";
  wrapper.dataset.id = id;

  // apply style
  wrapper.style.background = savedData.color || "#fff59d";
  const shape = savedData.shape || "rectangle";
  wrapper.classList.remove("shape-pillow","shape-circle");
  if (shape === "circle") wrapper.classList.add("shape-circle");
  if (shape === "pillow") wrapper.classList.add("shape-pillow");

  // header (category + actions)
  const header = document.createElement("div");
  header.className = "note-header";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.value = savedData.category || "Uncategorized";
  categoryInput.style.border = "none";
  categoryInput.style.background = "transparent";
  categoryInput.style.fontWeight = "bold";
  categoryInput.style.outline = "none";

  const actions = document.createElement("div");
  actions.className = "note-actions";

  const styleBtn = document.createElement("button");
  styleBtn.title = "Style";
  styleBtn.className = "small";
  styleBtn.textContent = "Style";

  const reminderBtn = document.createElement("button");
  reminderBtn.title = "Set reminder";
  reminderBtn.className = "small";
  reminderBtn.textContent = savedData.reminderDate ? "🔔" : "🔕";

  actions.appendChild(styleBtn);
  actions.appendChild(reminderBtn);

  header.appendChild(categoryInput);
  header.appendChild(actions);

  // textarea content
  const textarea = document.createElement("textarea");
  textarea.className = "note";
  textarea.value = content;
  textarea.placeholder = "Empty Sticky Note";

  // footer (delete)
  const footer = document.createElement("div");
  footer.className = "note-footer";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "note-delete";
  deleteBtn.textContent = "Delete";

  footer.appendChild(deleteBtn);

  // append
  wrapper.appendChild(header);
  wrapper.appendChild(textarea);
  wrapper.appendChild(footer);

  // Persist changes on change events
  textarea.addEventListener("input", () => {
    updateNote(id, textarea.value, wrapper, categoryInput.value);
  });
  categoryInput.addEventListener("change", () => {
    updateNote(id, textarea.value, wrapper, categoryInput.value);
  });

  deleteBtn.addEventListener("click", () => {
    const ok = confirm("Delete this sticky note?");
    if (ok) deleteNote(id, wrapper);
  });

  // style picker popup
  let pickerEl = null;
  styleBtn.addEventListener("click", (ev) => {
    if (pickerEl) {
      pickerEl.remove();
      pickerEl = null;
      return;
    }
    const initial = { color: savedData.color || "#fff59d", shape: savedData.shape || "rectangle" };
    pickerEl = createStylePicker(initial, ({ color, shape }) => {
      if (color) {
        wrapper.style.background = color;
        // update note data & persist
        updateNote(id, textarea.value, wrapper, categoryInput.value, { color });
      }
      if (shape) {
        wrapper.classList.remove("shape-pillow","shape-circle");
        if (shape === "circle") wrapper.classList.add("shape-circle");
        if (shape === "pillow") wrapper.classList.add("shape-pillow");
        updateNote(id, textarea.value, wrapper, categoryInput.value, { shape });
      }
    });
    // place popup near button
    document.body.appendChild(pickerEl);
    const rect = ev.target.getBoundingClientRect();
    pickerEl.style.left = rect.right + "px";
    pickerEl.style.top = rect.top + "px";

    // clicking outside removes picker
    const onDocClick = (e) => {
      if (!pickerEl.contains(e.target) && e.target !== styleBtn) {
        pickerEl.remove();
        pickerEl = null;
        document.removeEventListener("click", onDocClick);
      }
    };
    document.addEventListener("click", onDocClick);
  });

  // reminder selector (simple prompt for date/time ISO string)
  reminderBtn.addEventListener("click", async () => {
    // ask permission if needed
    if ("Notification" in window && Notification.permission !== "granted") {
      const perm = await notificationService.requestPermission();
      if (perm !== "granted") {
        alert("Notifications permission not granted. Reminders will not produce desktop notifications.");
      }
    }
    const current = savedData.reminderDate || "";
    const input = prompt("Enter reminder ISO datetime (YYYY-MM-DDTHH:MM:SS) or blank to clear:", current);
    if (input === null) return;
    const trimmed = (input || "").trim();
    if (trimmed === "") {
      savedData.reminderDate = null;
      reminderBtn.textContent = "🔕";
      updateNote(id, textarea.value, wrapper, categoryInput.value, { reminderDate: null });
      reminderScheduler.clear(id);
      return;
    }
    // validate
    const dt = new Date(trimmed);
    if (isNaN(dt.getTime())) {
      alert("Invalid date format.");
      return;
    }
    savedData.reminderDate = dt.toISOString();
    reminderBtn.textContent = "🔔";
    updateNote(id, textarea.value, wrapper, categoryInput.value, { reminderDate: dt.toISOString() });
    // schedule
    reminderScheduler.schedule(Object.assign({}, savedData, { id }));
  });

  // Dragging wrapper (drag from header area)
  let isDragging = false, offsetX=0, offsetY=0;
  header.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    wrapper.style.cursor = "grabbing";
  });
  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    wrapper.style.left = (e.pageX - offsetX) + "px";
    wrapper.style.top = (e.pageY - offsetY) + "px";
  });
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = "move";
      updateNote(id, textarea.value, wrapper, categoryInput.value);
    }
  });

  // resizing: watch for mouseup to save size & pos
  wrapper.addEventListener("mouseup", () => {
    updateNote(id, textarea.value, wrapper, categoryInput.value);
  });

  return wrapper;
}

// Small util: create style picker element (we import the function earlier)
function createStylePicker(initial, onChange) {
  // fallback: if imported module not available at runtime, create minimal picker
  // actual implementation lives in components/NoteStylePicker.js; but include fallback just in case
  return (window.__createStylePicker && window.__createStylePicker(initial,onChange)) || (function () {
    const root = document.createElement("div");
    root.className = "style-picker";
    root.innerHTML = "<div>Style picker</div>";
    return root;
  })();
}

function addNote() {
  const notes = getNotes();
  const noteObject = {
    id: Math.floor(Math.random() * 1000000).toString(),
    content: "",
    category: "Uncategorized",
    top: "50px",
    left: "50px",
    width: "200px",
    height: "220px",
    color: "#fff59d",
    shape: "rectangle",
    reminderDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  notes.push(noteObject);
  saveNotes(notes);
  renderAllNotes();
}

function updateNote(id, newContent, element, newCategory = "Uncategorized", extras = {}) {
  const notes = getNotes();
  const targetNote = notes.find(note => note.id == id);
  if (targetNote) {
    targetNote.content = newContent;
    targetNote.category = newCategory || "Uncategorized";
    targetNote.top = element.style.top || element.getAttribute("data-top") || targetNote.top;
    targetNote.left = element.style.left || element.getAttribute("data-left") || targetNote.left;
    targetNote.width = element.style.width || element.getAttribute("data-width") || targetNote.width;
    targetNote.height = element.style.height || element.getAttribute("data-height") || targetNote.height;
    if (extras.color !== undefined) targetNote.color = extras.color;
    if (extras.shape !== undefined) targetNote.shape = extras.shape;
    if (extras.reminderDate !== undefined) targetNote.reminderDate = extras.reminderDate;
    targetNote.updatedAt = new Date().toISOString();
    saveNotes(notes);
  }
}

function deleteNote(id, element) {
  const notes = getNotes().filter(note => note.id != id);
  saveNotes(notes);
  if (element && element.parentNode === notesContainer) {
    notesContainer.removeChild(element);
  }
  reminderScheduler.clear(id);
}

// render and re-render
function renderAllNotes(filterQuery = "") {
  // remove existing note wrappers (but keep toolbar/search/add button)
  const preserved = new Set();
  // preserve toolbar, searchbar, and add button by removing only .note-wrapper elements
  const existing = Array.from(notesContainer.querySelectorAll(".note-wrapper"));
  existing.forEach(n => n.remove());

  const notes = getNotes();
  const filtered = searchService.filter(notes, filterQuery);

  // create DOM elements for notes
  filtered.forEach(note => {
    const el = createNoteElement(note.id, note.content, note);
    // make sure size/position are applied from saved data
    el.style.top = note.top || el.style.top;
    el.style.left = note.left || el.style.left;
    el.style.width = note.width || el.style.width;
    el.style.height = note.height || el.style.height;
    notesContainer.insertBefore(el, addNoteButton);
  });
}

// Expose some helpers to console for debugging
window._stickies = {
  getNotes,
  saveNotes,
  renderAllNotes,
  addNote
};
