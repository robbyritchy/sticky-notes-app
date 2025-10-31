// main.js - integrated app with sidebar, minimize, dynamic layout
import { importExportService } from "./services/importExportService.js";
import { FilePicker } from "./components/FilePicker.js";
import { createStylePicker } from "./components/NoteStylePicker.js";
import { searchService } from "./services/searchService.js";
import { notificationService, reminderScheduler } from "./services/notificationService.js";

const notesContainer = document.getElementById("app");
let addNoteButton = notesContainer.querySelector(".add-note");

// create sidebar
const sidebar = document.createElement("div");
sidebar.id = "notes-sidebar";
document.body.appendChild(sidebar);

// create toolbar
const toolbar = document.createElement("div");
toolbar.className = "toolbar";
const importBtn = document.createElement("button"); importBtn.textContent = "Import";

// Export dropdown
const exportWrapper = document.createElement("div");
exportWrapper.className = "export-wrapper";
exportWrapper.style.position = "relative";
exportWrapper.style.display = "inline-block";

const exportBtn = document.createElement("button");
exportBtn.textContent = "Export ▼";
exportWrapper.appendChild(exportBtn);

// dropdown list container
const dropdown = document.createElement("div");
dropdown.className = "export-dropdown";
dropdown.style.position = "absolute";
dropdown.style.top = "100%";
dropdown.style.left = "0";
dropdown.style.background = "#fff";
dropdown.style.border = "1px solid #ccc";
dropdown.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
dropdown.style.padding = "4px 0";
dropdown.style.display = "none";
dropdown.style.zIndex = "1000";
exportWrapper.appendChild(dropdown);

exportBtn.addEventListener("click", () => {
  // Toggle dropdown visibility
  dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
  rebuildDropdown();
});

// Rebuild dropdown items dynamically
function rebuildDropdown() {
  dropdown.innerHTML = "";

  // Option: Export all
  const allOpt = document.createElement("div");
  allOpt.textContent = "Export All Notes";
  allOpt.className = "dropdown-item";
  allOpt.style.cursor = "pointer";
  allOpt.style.padding = "4px 8px";
  allOpt.addEventListener("click", () => {
    dropdown.style.display = "none";
    importExportService.exportNotes(getNotes());
  });
  dropdown.appendChild(allOpt);

  // Divider
  const divider = document.createElement("div");
  divider.style.borderTop = "1px solid #ddd";
  divider.style.margin = "4px 0";
  dropdown.appendChild(divider);

  // Individual notes
  const notes = getNotes();
  if (notes.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "(no notes)";
    empty.style.color = "#777";
    empty.style.padding = "4px 8px";
    dropdown.appendChild(empty);
  } else {
    notes.forEach(n => {
      const item = document.createElement("div");
      item.textContent = n.title || n.content.substring(0, 20) || "Untitled";
      item.className = "dropdown-item";
      item.style.cursor = "pointer";
      item.style.padding = "4px 8px";
      item.addEventListener("click", () => {
        dropdown.style.display = "none";
        importExportService.exportNotes([n]);
      });
      dropdown.appendChild(item);
    });
  }
}

// Hide dropdown if clicking outside
document.addEventListener("click", (e) => {
  if (!exportWrapper.contains(e.target)) dropdown.style.display = "none";
});

// append wrapper instead of button
toolbar.appendChild(exportWrapper);


const styleLegendBtn = document.createElement("button"); styleLegendBtn.textContent = "Style";
toolbar.appendChild(importBtn);  toolbar.appendChild(styleLegendBtn);
notesContainer.appendChild(toolbar);

// search bar
const searchBar = document.createElement("div");
searchBar.className = "search-bar";
const searchInput = document.createElement("input");
searchInput.placeholder = "Search notes by text or category…";
searchBar.appendChild(searchInput);
notesContainer.appendChild(searchBar);

// File picker + import/export wiring
const filePicker = new FilePicker(async (file) => {
  try {
    const imported = await importExportService.importNotes(file);
    const current = getNotes();
    imported.forEach(n => {
      if (current.some(c => c.id == n.id)) n.id = `import-${Date.now()}-${Math.floor(Math.random()*10000)}`;
      n.content = n.content || "";
      n.category = n.category || "Uncategorized";
      n.top = n.top || "60px"; n.left = n.left || "60px";
      n.width = n.width || "200px"; n.height = n.height || "220px";
      n.color = n.color || "#fff59d"; n.shape = n.shape || "rectangle";
    });
    const merged = [...current, ...imported];
    saveNotes(merged);
    renderAllNotes();
    updateSidebar();
    reminderScheduler.rescheduleAll(merged);
    alert(`Imported ${imported.length} notes.`);
  } catch (err) { alert("Import failed: " + (err.message || err)); }
});

importBtn.addEventListener("click", () => filePicker.open());

// Helpers
function getNotes() { return JSON.parse(localStorage.getItem("stickynotes-notes") || "[]"); }
function saveNotes(notes) { localStorage.setItem("stickynotes-notes", JSON.stringify(notes)); }

// --- CATEGORY STORAGE HELPERS ---
function getCategories() {
  // returns array of category names (persisted + derived)
  const persisted = JSON.parse(localStorage.getItem("stickynotes-categories") || "[]");
  const notes = getNotes();
  const fromNotes = [...new Set(notes.map(n => n.category).filter(Boolean))];
  // union persisted + fromNotes
  const all = [...new Set([...persisted, ...fromNotes])];
  // ensure "Uncategorized" exists
  if (!all.includes("Uncategorized")) all.unshift("Uncategorized");
  return all;
}
function saveCategories(list) {
  localStorage.setItem("stickynotes-categories", JSON.stringify(list));
}

// --- REPLACEMENT updateSidebar() ---
function updateSidebar() {
  sidebar.innerHTML = "";

  // === Add Category Button ===
  const addCatBtn = document.createElement("button");
  addCatBtn.textContent = "+ Add Category";
  addCatBtn.className = "add-category-btn";
  addCatBtn.addEventListener("click", () => {
    const newCat = prompt("Enter new category name:");
    if (!newCat) return;
    const trimmed = newCat.trim();
    if (!trimmed) return;

    const cats = getCategories();
    if (cats.includes(trimmed)) {
      alert("That category already exists!");
      return;
    }
    cats.push(trimmed);
    saveCategories(cats);
    updateSidebar();
  });
  sidebar.appendChild(addCatBtn);

  // pull categories (persisted + note-derived)
  const categories = getCategories();
  const notes = getNotes();

  categories.forEach(cat => {
    const catDiv = document.createElement("div");
    catDiv.className = "sidebar-category";
    catDiv.dataset.category = cat;

    const header = document.createElement("div");
    header.className = "category-header";
    header.textContent = cat;

    // optionally add rename/delete icons next to header (small UX nicety)
    const headerControls = document.createElement("span");
    headerControls.style.marginLeft = "8px";
    // rename
    const renameBtn = document.createElement("button");
    renameBtn.textContent = "✎";
    renameBtn.title = "Rename category";
    renameBtn.className = "small";
    renameBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const newName = prompt("Rename category:", cat);
      if (!newName) return;
      const trimmed = newName.trim();
      if (!trimmed) return;
      const allCats = getCategories();
      if (allCats.includes(trimmed)) return alert("That category already exists.");
      // update persisted categories and update notes that had this category
      const updatedCats = allCats.map(c => c === cat ? trimmed : c);
      saveCategories(updatedCats);
      const ns = getNotes();
      ns.forEach(n => { if (n.category === cat) n.category = trimmed; });
      saveNotes(ns);
      updateSidebar();
      renderAllNotes();
    });
    // delete (only if category not "Uncategorized")
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.title = "Delete category (notes will be moved to Uncategorized)";
    deleteBtn.className = "small";
    deleteBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (cat === "Uncategorized") return alert("Cannot delete Uncategorized.");
      if (!confirm(`Delete category "${cat}"? Notes in this category will be moved to Uncategorized.`)) return;
      // remove from persisted list and update notes
      const remaining = getCategories().filter(c => c !== cat);
      saveCategories(remaining);
      const ns = getNotes();
      ns.forEach(n => { if (n.category === cat) n.category = "Uncategorized"; });
      saveNotes(ns);
      updateSidebar();
      renderAllNotes();
    });

    headerControls.appendChild(renameBtn);
    headerControls.appendChild(deleteBtn);
    header.appendChild(headerControls);

    catDiv.appendChild(header);

    // container for items
    const itemsDiv = document.createElement("div");
    itemsDiv.className = "category-items";

    // Drag target behavior (drop sidebar items here)
    catDiv.addEventListener("dragover", e => {
      e.preventDefault();
      catDiv.classList.add("drag-over");
    });
    catDiv.addEventListener("dragleave", () => catDiv.classList.remove("drag-over"));
    catDiv.addEventListener("drop", e => {
      e.preventDefault();
      catDiv.classList.remove("drag-over");
      const noteId = e.dataTransfer.getData("text/plain");
      if (!noteId) return;
      const ns = getNotes();
      const target = ns.find(n => n.id == noteId);
      if (!target) return;
      target.category = cat;
      saveNotes(ns);
      // ensure this category exists in persisted list
      const persisted = getCategories();
      if (!persisted.includes(cat)) {
        persisted.push(cat);
        saveCategories(persisted);
      }
      updateSidebar();
      renderAllNotes();
    });

    // add items that belong to this category (sidebar entries draggable)
    notes.filter(n => (n.category || "Uncategorized") === cat).forEach(note => {
      const item = document.createElement("div");
      item.className = "sidebar-item";
      item.textContent = note.title || note.content.substring(0, 20) || "Untitled";
      item.dataset.noteId = note.id;

      // Make sidebar item draggable (drag within sidebar)
      item.draggable = true;
      item.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", note.id);
        item.classList.add("dragging");
      });
      item.addEventListener("dragend", () => item.classList.remove("dragging"));

      // click to reveal note
      item.addEventListener("click", () => {
        const noteEl = document.querySelector(`.note-wrapper[data-id='${note.id}']`);
        if (noteEl) {
          noteEl.classList.remove("minimized");
          noteEl.scrollIntoView({ behavior: "smooth", block: "center" });
          noteEl.style.border = "2px solid #1976d2";
          setTimeout(() => noteEl.style.border = "", 1000);
        }
      });

      itemsDiv.appendChild(item);
    });

    catDiv.appendChild(itemsDiv);
    sidebar.appendChild(catDiv);
  });
}



// Create note element
function createNoteElement(id, content, savedData = {}) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("note-wrapper");
  wrapper.dataset.id = id;
  wrapper.style.top = savedData.top || "50px";
  wrapper.style.left = savedData.left || "50px";
  wrapper.style.width = savedData.width || "200px";
  wrapper.style.height = savedData.height || "220px";
  wrapper.style.background = savedData.color || "#fff59d";
  wrapper.classList.remove("shape-circle", "shape-pillow");
  if (savedData.shape === "circle") wrapper.classList.add("shape-circle");
  if (savedData.shape === "pillow") wrapper.classList.add("shape-pillow");

  // ===== HEADER =====
  const header = document.createElement("div");
  header.className = "note-header";

  // Title input (replaces where category used to be)
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "Title";
  titleInput.value = savedData.title || "Untitled";
  titleInput.style.border = "none";
  titleInput.style.background = "transparent";
  titleInput.style.fontWeight = "bold";
  titleInput.style.outline = "none";
  titleInput.style.flex = "1";

  // Actions
  const actions = document.createElement("div");
  actions.className = "note-actions";

  const minimizeBtn = document.createElement("button");
  minimizeBtn.className = "small";
  minimizeBtn.textContent = "-";
  minimizeBtn.addEventListener("click", () => {
    wrapper.classList.toggle("minimized");
    updateNote(id, textarea.value, wrapper, titleInput.value, savedData);
  });

  const styleBtn = document.createElement("button");
  styleBtn.className = "small";
  styleBtn.textContent = "Style";
  styleBtn.addEventListener("click", (ev) => {
    let pickerEl = document.querySelector(".style-picker");
    if (pickerEl) {
      pickerEl.remove();
      return;
    }
    pickerEl = createStylePicker(
      { color: savedData.color, shape: savedData.shape },
      ({ color, shape }) => {
        if (color) {
          wrapper.style.background = color;
          updateNote(id, textarea.value, wrapper, titleInput.value, { color });
        }
        if (shape) {
          wrapper.classList.remove("shape-pillow", "shape-circle");
          if (shape === "circle") wrapper.classList.add("shape-circle");
          if (shape === "pillow") wrapper.classList.add("shape-pillow");
          updateNote(id, textarea.value, wrapper, titleInput.value, { shape });
        }
      }
    );
    document.body.appendChild(pickerEl);
    const rect = ev.target.getBoundingClientRect();
    pickerEl.style.left = rect.right + "px";
    pickerEl.style.top = rect.top + "px";
  });

  const reminderBtn = document.createElement("button");
  reminderBtn.className = "small";
  reminderBtn.textContent = savedData.reminderDate ? "🔔" : "🔕";
  reminderBtn.addEventListener("click", async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      await notificationService.requestPermission();
    }
    const input = prompt("Enter ISO datetime or blank to clear:", savedData.reminderDate || "");
    if (input === null) return;
    if (input.trim() === "") {
      savedData.reminderDate = null;
      reminderBtn.textContent = "🔕";
      updateNote(id, textarea.value, wrapper, titleInput.value, { reminderDate: null });
      reminderScheduler.clear(id);
      return;
    }
    const dt = new Date(input);
    if (isNaN(dt)) {
      alert("Invalid date format");
      return;
    }
    savedData.reminderDate = dt.toISOString();
    reminderBtn.textContent = "🔔";
    updateNote(id, textarea.value, wrapper, titleInput.value, { reminderDate: dt.toISOString() });
    reminderScheduler.schedule(Object.assign({}, savedData, { id }));
  });

  actions.append(minimizeBtn, styleBtn, reminderBtn);
  header.append(titleInput, actions);

  // ===== TEXTAREA =====
  const textarea = document.createElement("textarea");
  textarea.className = "note";
  textarea.value = content;
  textarea.placeholder = "Empty Sticky Note";

  // ===== FOOTER =====
  const footer = document.createElement("div");
  footer.className = "note-footer";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "note-delete";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    if (confirm("Delete this sticky note?")) deleteNote(id, wrapper);
  });

  footer.appendChild(deleteBtn);
  wrapper.append(header, textarea, footer);

  // ===== Auto-save behavior =====
  textarea.addEventListener("input", () => updateNote(id, textarea.value, wrapper, titleInput.value, savedData));
  titleInput.addEventListener("change", () => updateNote(id, textarea.value, wrapper, titleInput.value, savedData));

  // ===== Dragging =====
  let isDragging = false, offsetX, offsetY;
  header.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    const rect = wrapper.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    wrapper.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const containerRect = notesContainer.getBoundingClientRect();
    wrapper.style.left = e.clientX - containerRect.left - offsetX + "px";
    wrapper.style.top = e.clientY - containerRect.top - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = "move";
      updateNoteLayout(wrapper);
      updateNote(id, textarea.value, wrapper, titleInput.value, savedData);
    }
  });

  // ===== Resize observer =====
  const ro = new ResizeObserver(() => updateNoteLayout(wrapper));
  ro.observe(wrapper);

  return wrapper;
}



// dynamic layout for header/footer/textarea
function updateNoteLayout(wrapper){
  const header = wrapper.querySelector(".note-header");
  const footer = wrapper.querySelector(".note-footer");
  const textarea = wrapper.querySelector(".note");
  if(!textarea || !header || !footer) return;
  const w = wrapper.offsetWidth, h = wrapper.offsetHeight;
  header.style.width=w+"px"; footer.style.width=w+"px";
  textarea.style.width=w+"px"; textarea.style.height=(h-header.offsetHeight-footer.offsetHeight)+"px";
}

function addNote() {
  const notes = getNotes();
const noteObject = { 
  id: Math.floor(Math.random()*1000000).toString(),
  title: "Untitled",
  content: "",
  category: "Uncategorized",
  top: "50px", left: "50px", width: "300px", height: "220px",
  color: "#fff59d", shape: "rectangle", reminderDate: null,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};  notes.push(noteObject); saveNotes(notes); renderAllNotes(); updateSidebar();
}

function updateNote(id, newContent, element, newTitle = "Untitled", extras = {}) {
  const notes = getNotes();
  const target = notes.find(n => n.id == id);
  if (!target) return;

  target.content = newContent;
  target.title = newTitle; 
  target.top = element.style.top;
  target.left = element.style.left;
  target.width = element.style.width;
  target.height = element.style.height;

  if (extras.color !== undefined) target.color = extras.color;
  if (extras.shape !== undefined) target.shape = extras.shape;
  if (extras.reminderDate !== undefined) target.reminderDate = extras.reminderDate;

  target.updatedAt = new Date().toISOString();
  saveNotes(notes);
  updateSidebar();
}


function deleteNote(id,element){ const notes=getNotes().filter(n=>n.id!=id); saveNotes(notes); if(element&&element.parentNode===notesContainer) notesContainer.removeChild(element); reminderScheduler.clear(id); updateSidebar(); }

function renderAllNotes(filterQuery="") {
  Array.from(notesContainer.querySelectorAll(".note-wrapper")).forEach(n=>n.remove());
  const notes = searchService.filter(getNotes(),filterQuery);
  notes.forEach(note=>{ const el=createNoteElement(note.id,note.content,note); el.style.top=note.top; el.style.left=note.left; el.style.width=note.width; el.style.height=note.height; notesContainer.insertBefore(el,addNoteButton); });
  updateSidebar();
}

// init
init();
function init(){
  addNoteButton = notesContainer.querySelector(".add-note");
  if(addNoteButton) addNoteButton.addEventListener("click", addNote);
  renderAllNotes();
  if("Notification" in window && Notification.permission!=="granted") notificationService.requestPermission();
  reminderScheduler.rescheduleAll(getNotes());
  searchInput.addEventListener("input",(e)=>renderAllNotes(e.target.value));
}



// expose helpers
window._stickies={getNotes, saveNotes, renderAllNotes, addNote};
