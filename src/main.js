// main.js - integrated app with sidebar, minimize, dynamic layout
import { importExportService } from "./services/importExportService.js";
import { FilePicker } from "./components/FilePicker.js";
import { createStylePicker } from "./components/NoteStylePicker.js";
import { searchService } from "./services/searchService.js";
import { notificationService, reminderScheduler } from "./services/notificationService.js";
import { versionHistoryService } from "./services/versionHistoryService.js";
import { syncManagerService } from "./services/syncManagerService.js";
import { createHistoryModal } from "./components/HistoryModal.js";
import { sharingService } from "./services/sharingService.js";
import { checklistService } from "./services/checklistService.js";
import { createShareModal } from "./components/ShareModal.js";
import { createSharedNoteView } from "./components/SharedNoteView.js";
import { createAnalyticsView } from "./components/AnalyticsView.js";


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

// Analytics button
const analyticsBtn = document.createElement("button");
analyticsBtn.textContent = "📊 Analytics";
analyticsBtn.title = "View analytics and insights";
analyticsBtn.addEventListener("click", () => {
  switchToAnalyticsView();
});

// Sync status indicator
const syncStatusContainer = document.createElement("div");
syncStatusContainer.className = "sync-status";
syncStatusContainer.style.cssText = `
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding: 4px 12px;
  font-size: 12px;
  color: #666;
`;

const syncStatusIcon = document.createElement("span");
syncStatusIcon.style.cssText = `
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  display: inline-block;
`;

const syncStatusText = document.createElement("span");
syncStatusText.textContent = "Offline";

syncStatusContainer.appendChild(syncStatusIcon);
syncStatusContainer.appendChild(syncStatusText);

// Update sync status display
function updateSyncStatus(status) {
  const colors = {
    offline: "#999",
    syncing: "#ff9800",
    online: "#4caf50",
    error: "#f44336"
  };
  const labels = {
    offline: "Offline",
    syncing: "Syncing...",
    online: "Synced",
    error: "Sync Error"
  };
  
  syncStatusIcon.style.background = colors[status.status] || "#999";
  syncStatusText.textContent = labels[status.status] || "Unknown";
  
  if (status.error) {
    syncStatusText.textContent = status.error;
    syncStatusText.title = status.error;
  } else {
    syncStatusText.title = status.lastSync 
      ? `Last sync: ${new Date(status.lastSync).toLocaleString()}`
      : "Never synced";
  }
}

// Subscribe to sync status changes
syncManagerService.onStatusChange(updateSyncStatus);

toolbar.appendChild(importBtn);
toolbar.appendChild(styleLegendBtn);
toolbar.appendChild(analyticsBtn);
toolbar.appendChild(syncStatusContainer);
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

  // Actions - Dropdown menu
  const actions = document.createElement("div");
  actions.className = "note-actions";
  actions.style.position = "relative";

  // Dropdown wrapper
  const dropdownWrapper = document.createElement("div");
  dropdownWrapper.className = "note-actions-dropdown";
  dropdownWrapper.style.cssText = "position: relative; display: inline-block;";

  // Dropdown button
  const menuBtn = document.createElement("button");
  menuBtn.className = "note-menu-btn";
  menuBtn.textContent = "⋯";
  menuBtn.title = "Note options";
  menuBtn.style.cssText = `
    font-size: 16px;
    line-height: 1;
    padding: 2px 6px;
    background: #f0e45c;
    border: 1px solid #d6c700;
    border-radius: 3px;
    cursor: pointer;
    min-width: 20px;
    min-height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    font-weight: bold;
    position: relative;
    z-index: 10;
  `;

  // Add click visual feedback
  menuBtn.addEventListener("mousedown", () => {
    menuBtn.style.background = "#e8dc54";
  });
  menuBtn.addEventListener("mouseup", () => {
    menuBtn.style.background = "#f0e45c";
  });
  menuBtn.addEventListener("mouseleave", () => {
    menuBtn.style.background = "#f0e45c";
  });

  // Dropdown menu
  const dropdown = document.createElement("div");
  dropdown.className = "note-actions-dropdown-menu";
  dropdown.style.cssText = `
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    padding: 4px 0;
    display: none;
    z-index: 1000000;
    min-width: 180px;
    border-radius: 4px;
    margin-top: 4px;
    max-height: 300px;
    overflow-y: auto;
    pointer-events: auto;
  `;

  // Build dropdown items
  function buildDropdownMenu() {
    dropdown.innerHTML = "";
    const noteIsChecklist = checklistService.isChecklist(savedData);
    const notes = getNotes();
    const note = notes.find(n => n.id === id);

    // Minimize
    const minimizeItem = createDropdownItem(
      wrapper.classList.contains("minimized") ? "Expand" : "Minimize",
      () => {
        wrapper.classList.toggle("minimized");
        const content = textarea ? textarea.value : "";
        updateNote(id, content, wrapper, titleInput.value, savedData);
        dropdown.style.display = "none";
      }
    );
    dropdown.appendChild(minimizeItem);

    // Style
    const styleItem = createDropdownItem("Style", (ev) => {
      let pickerEl = document.querySelector(".style-picker");
      if (pickerEl) {
        pickerEl.remove();
      } else {
        pickerEl = createStylePicker(
          { color: savedData.color, shape: savedData.shape },
          ({ color, shape }) => {
            if (color) {
              wrapper.style.background = color;
              const content = textarea ? textarea.value : "";
              updateNote(id, content, wrapper, titleInput.value, { color });
            }
            if (shape) {
              wrapper.classList.remove("shape-pillow", "shape-circle");
              if (shape === "circle") wrapper.classList.add("shape-circle");
              if (shape === "pillow") wrapper.classList.add("shape-pillow");
              const content = textarea ? textarea.value : "";
              updateNote(id, content, wrapper, titleInput.value, { shape });
            }
          }
        );
        document.body.appendChild(pickerEl);
        const rect = menuBtn.getBoundingClientRect();
        pickerEl.style.left = rect.right + "px";
        pickerEl.style.top = rect.top + "px";
      }
      dropdown.style.display = "none";
    });
    dropdown.appendChild(styleItem);

    // Reminder
    const reminderItem = createDropdownItem(
      savedData.reminderDate ? "🔔 Edit Reminder" : "🔕 Set Reminder",
      async () => {
        if ("Notification" in window && Notification.permission !== "granted") {
          await notificationService.requestPermission();
        }
        const input = prompt("Enter ISO datetime or blank to clear:", savedData.reminderDate || "");
        if (input === null) {
          dropdown.style.display = "none";
          return;
        }
        if (input.trim() === "") {
          savedData.reminderDate = null;
          const content = textarea ? textarea.value : "";
          updateNote(id, content, wrapper, titleInput.value, { reminderDate: null });
          reminderScheduler.clear(id);
        } else {
          const dt = new Date(input);
          if (isNaN(dt)) {
            alert("Invalid date format");
          } else {
            savedData.reminderDate = dt.toISOString();
            const content = textarea ? textarea.value : "";
            updateNote(id, content, wrapper, titleInput.value, { reminderDate: dt.toISOString() });
            reminderScheduler.schedule(Object.assign({}, savedData, { id }));
          }
        }
        dropdown.style.display = "none";
      }
    );
    dropdown.appendChild(reminderItem);

    // Divider
    dropdown.appendChild(createDivider());

    // History
    const historyItem = createDropdownItem("📜 Version History", () => {
      if (!note) {
        dropdown.style.display = "none";
        return;
      }
      const modal = createHistoryModal(
        id,
        note.title || "Untitled",
        (version) => {
          const restored = versionHistoryService.restoreVersion(id, version.id, notes);
          if (restored) {
            const updatedNotes = notes.map(n => n.id === id ? restored : n);
            saveNotes(updatedNotes);
            renderAllNotes();
            updateSidebar();
            alert("Note restored to selected version.");
          }
        }
      );
      document.body.appendChild(modal);
      dropdown.style.display = "none";
    });
    dropdown.appendChild(historyItem);

    // Share
    const shareItem = createDropdownItem(
      savedData.isShared ? "🔗 Manage Sharing" : "🔗 Share Note",
      () => {
        if (!note) {
          dropdown.style.display = "none";
          return;
        }
        const modal = createShareModal(id, note.title || "Untitled");
        document.body.appendChild(modal);
        dropdown.style.display = "none";
      }
    );
    dropdown.appendChild(shareItem);

    // Checklist toggle
    const checklistItem = createDropdownItem(
      noteIsChecklist ? "☑ Convert to Regular Note" : "☐ Convert to Checklist",
      () => {
        if (!note) {
          dropdown.style.display = "none";
          return;
        }
        if (noteIsChecklist) {
          checklistService.convertToRegularNote(note);
        } else {
          checklistService.convertToChecklist(note);
        }
        saveNotes(notes);
        renderAllNotes();
        updateSidebar();
        dropdown.style.display = "none";
      }
    );
    dropdown.appendChild(checklistItem);

    // Divider
    dropdown.appendChild(createDivider());

    // Pop-out in new window (#100, #101, #104)
    const popoutItem = createDropdownItem("🡥 Pop Out in New Window", async () => {
      // Get the note element to calculate its size
      const noteElement = document.querySelector(`.note-wrapper[data-id="${id}"]`);
      if (!noteElement) {
        dropdown.style.display = "none";
        return;
      }

      const rect = noteElement.getBoundingClientRect();
      const noteWidth = Math.max(200, Math.ceil(rect.width + 20)); // Add some padding, round up
      const noteHeight = Math.max(150, Math.ceil(rect.height + 20)); // Add some padding, round up

      const url = new URL(window.location.href);
      url.searchParams.set("popout", id);

      // In Electron, use IPC to create a new window instead of window.open()
      if (window.electronAPI) {
        try {
          // Send message to main process to create popout window
          await window.electronAPI.createPopoutWindow({
            url: url.toString(),
            width: noteWidth,
            height: noteHeight
          });
        } catch (error) {
          console.error("Failed to create popout window:", error);
          // Fallback to regular window.open for web
          window.open(url.toString(), "_blank");
        }
      } else {
        // Web fallback
        window.open(
          url.toString(),
          "_blank",
          `width=${noteWidth},height=${noteHeight},scrollbars=no,resizable=no`
        );
      }

      dropdown.style.display = "none";
    });
    dropdown.appendChild(popoutItem);
  }

  function createDropdownItem(text, onClick) {
    const item = document.createElement("div");
    item.className = "dropdown-item";
    item.textContent = text;
    item.style.cssText = `
      padding: 8px 16px;
      cursor: pointer;
      font-size: 13px;
      color: #333;
      transition: background 0.15s;
    `;
    item.addEventListener("mouseenter", () => {
      item.style.background = "#f5f5f5";
    });
    item.addEventListener("mouseleave", () => {
      item.style.background = "transparent";
    });
    item.addEventListener("click", onClick);
    return item;
  }

  function createDivider() {
    const divider = document.createElement("div");
    divider.style.cssText = `
      height: 1px;
      background: #eee;
      margin: 4px 0;
    `;
    return divider;
  }

  // Toggle dropdown
  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isVisible = dropdown.style.display === "block";

    if (isVisible) {
      dropdown.style.display = "none";
    } else {
      // Ensure dropdown is properly positioned before showing
      dropdown.style.display = "block";
      buildDropdownMenu();

      // Position dropdown to stay within window bounds
      setTimeout(() => {
        const buttonRect = menuBtn.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Use absolute positioning for better control
        let dropdownLeft = buttonRect.right;
        let dropdownTop = buttonRect.bottom + 4;

        // Check if dropdown would go off right edge
        const estimatedDropdownWidth = 200; // approximate
        if (dropdownLeft + estimatedDropdownWidth > windowWidth) {
          dropdownLeft = buttonRect.left - estimatedDropdownWidth;
          if (dropdownLeft < 0) dropdownLeft = 10; // keep some margin
        }

        // Check if dropdown would go off bottom edge
        const estimatedDropdownHeight = 200; // approximate
        if (dropdownTop + estimatedDropdownHeight > windowHeight) {
          dropdownTop = buttonRect.top - estimatedDropdownHeight - 4;
          if (dropdownTop < 10) dropdownTop = 10; // keep some margin
        }

        // Apply fixed positioning
        dropdown.style.position = 'fixed';
        dropdown.style.left = dropdownLeft + 'px';
        dropdown.style.top = dropdownTop + 'px';
        dropdown.style.right = 'auto';
        dropdown.style.bottom = 'auto';
        dropdown.style.margin = '0';
      }, 10);
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdownWrapper.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  // In desktop app, ensure dropdown is properly positioned
  if (window.electronAPI || window.isElectron) {
    // Force dropdown to use fixed positioning in desktop app
    dropdown.style.position = 'fixed';
    dropdown.style.zIndex = '999999';
  }

  dropdownWrapper.appendChild(menuBtn);
  dropdownWrapper.appendChild(dropdown);
  actions.appendChild(dropdownWrapper);
  header.append(titleInput, actions);

  // ===== CONTENT AREA =====
  const contentArea = document.createElement("div");
  contentArea.className = "note-content-area";
  contentArea.style.cssText = "flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column;";

  const isChecklist = checklistService.isChecklist(savedData);
  
  let textarea = null;
  let checklistContainer = null;

  if (isChecklist) {
    // Create checklist UI (#85, #86, #87)
    checklistContainer = document.createElement("div");
    checklistContainer.className = "checklist-container";
    
    // Progress indicator
    const progressDiv = document.createElement("div");
    progressDiv.className = "checklist-progress";
    progressDiv.style.cssText = `
      font-size: 11px;
      color: #666;
      margin-bottom: 8px;
      padding: 4px 0;
    `;
    checklistContainer.appendChild(progressDiv);

    // Checklist items
    const itemsList = document.createElement("div");
    itemsList.className = "checklist-items";
    
    // Function to update progress indicator
    function updateProgress() {
      const notes = getNotes();
      const note = notes.find(n => n.id === id);
      if (note) {
        const stats = checklistService.getCompletionStats(note);
        progressDiv.textContent = `${stats.completed}/${stats.total} completed (${stats.percentage}%)`;
      }
    }
    
    function renderChecklistItems() {
      itemsList.innerHTML = "";
      const notes = getNotes();
      const note = notes.find(n => n.id === id);
      if (!note || !note.items) {
        updateProgress();
        return;
      }

      note.items.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "checklist-item";
        itemDiv.style.cssText = `
          display: flex;
          align-items: center;
          padding: 6px;
          margin-bottom: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
          gap: 8px;
        `;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.checked;
        checkbox.style.cssText = "cursor: pointer;";
        checkbox.addEventListener("change", () => {
          const notes = getNotes();
          const note = notes.find(n => n.id === id);
          if (note) {
            checklistService.toggleItem(note, item.id);
            saveNotes(notes);
            updateProgress(); // Update progress immediately after toggling
            renderChecklistItems();
            updateNote(id, "", wrapper, titleInput.value, savedData);
          }
        });

        const itemInput = document.createElement("input");
        itemInput.type = "text";
        itemInput.value = item.text;
        itemInput.placeholder = "Checklist item...";
        itemInput.style.cssText = `
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          text-decoration: ${item.checked ? "line-through" : "none"};
          opacity: ${item.checked ? 0.6 : 1};
          font-size: 14px;
        `;
        itemInput.addEventListener("blur", () => {
          const notes = getNotes();
          const note = notes.find(n => n.id === id);
          if (note) {
            checklistService.updateItemText(note, item.id, itemInput.value);
            saveNotes(notes);
            updateNote(id, "", wrapper, titleInput.value, savedData);
          }
        });
        itemInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            itemInput.blur();
            // Add new item
            const notes = getNotes();
            const note = notes.find(n => n.id === id);
            if (note) {
              checklistService.addItem(note, "");
              saveNotes(notes);
              updateProgress();
              renderChecklistItems();
              updateNote(id, "", wrapper, titleInput.value, savedData);
            }
          } else if (e.key === "Delete" && !itemInput.value.trim()) {
            const notes = getNotes();
            const note = notes.find(n => n.id === id);
            if (note) {
              checklistService.removeItem(note, item.id);
              saveNotes(notes);
              updateProgress();
              renderChecklistItems();
              updateNote(id, "", wrapper, titleInput.value, savedData);
            }
          }
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×";
        deleteBtn.style.cssText = `
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          font-size: 18px;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        deleteBtn.addEventListener("click", () => {
          const notes = getNotes();
          const note = notes.find(n => n.id === id);
          if (note) {
            checklistService.removeItem(note, item.id);
            saveNotes(notes);
            updateProgress();
            renderChecklistItems();
            updateNote(id, "", wrapper, titleInput.value, savedData);
          }
        });

        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(itemInput);
        itemDiv.appendChild(deleteBtn);
        itemsList.appendChild(itemDiv);
      });

      // Add new item button
      const addItemBtn = document.createElement("button");
      addItemBtn.textContent = "+ Add Item";
      addItemBtn.style.cssText = `
        width: 100%;
        padding: 8px;
        margin-top: 8px;
        background: rgba(255,255,255,0.5);
        border: 1px dashed #999;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        color: #666;
      `;
      addItemBtn.addEventListener("click", () => {
        const notes = getNotes();
        const note = notes.find(n => n.id === id);
        if (note) {
          checklistService.addItem(note, "");
          saveNotes(notes);
          updateProgress();
          renderChecklistItems();
          updateNote(id, "", wrapper, titleInput.value, savedData);
        }
      });
      itemsList.appendChild(addItemBtn);
    }

    // Initial render
    updateProgress();
    renderChecklistItems();
    checklistContainer.appendChild(itemsList);
    contentArea.appendChild(checklistContainer);
  } else {
    // Regular textarea
    textarea = document.createElement("textarea");
    textarea.className = "note";
    textarea.value = content;
    textarea.placeholder = "Empty Sticky Note";
    // Ensure textarea doesn't clip - use proper overflow
    textarea.style.overflow = "auto";
    textarea.style.wordWrap = "break-word";
    textarea.style.overflowWrap = "break-word";
    contentArea.appendChild(textarea);
  }

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
  wrapper.append(header, contentArea, footer);

  // ===== Auto-save behavior =====
  if (textarea) {
    textarea.addEventListener("input", () => updateNote(id, textarea.value, wrapper, titleInput.value, savedData));
  }
  titleInput.addEventListener("change", () => {
    const content = textarea ? textarea.value : "";
    updateNote(id, content, wrapper, titleInput.value, savedData);
  });

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
      const content = textarea ? textarea.value : "";
      updateNote(id, content, wrapper, titleInput.value, savedData);
    }
  });

  // ===== Resize observer =====
  const ro = new ResizeObserver(() => updateNoteLayout(wrapper));
  ro.observe(wrapper);
  
  // Apply initial scaling after DOM is fully rendered
  requestAnimationFrame(() => {
    updateNoteLayout(wrapper);
  });

  return wrapper;
}



// dynamic layout for header/footer/textarea
function updateNoteLayout(wrapper){
  const header = wrapper.querySelector(".note-header");
  const footer = wrapper.querySelector(".note-footer");
  const contentArea = wrapper.querySelector(".note-content-area");
  const textarea = wrapper.querySelector(".note");
  const titleInput = wrapper.querySelector("input[type='text']");
  if(!header || !footer || !contentArea) return;
  const w = wrapper.offsetWidth, h = wrapper.offsetHeight;
  header.style.width=w+"px"; 
  footer.style.width=w+"px";
  contentArea.style.width=w+"px";
  
  // Calculate available height for content area
  const headerHeight = header.offsetHeight;
  const footerHeight = footer.offsetHeight;
  const availableHeight = h - headerHeight - footerHeight;
  
  if (textarea) {
    // For textarea, set contentArea height and let textarea fill it
    contentArea.style.height = availableHeight + "px";
    contentArea.style.minHeight = "0"; // Allow flex shrinking
    textarea.style.width = "100%";
    textarea.style.height = "100%";
    textarea.style.boxSizing = "border-box";
  } else {
    // Checklist container - set height directly
    contentArea.style.height = availableHeight + "px";
    contentArea.style.overflowY = "auto";
  }
  
  // Scale header elements based on note size
  // Base size is 200px width, scale proportionally
  const baseWidth = 200;
  const scale = Math.max(0.8, Math.min(1.5, w / baseWidth)); // Clamp between 0.8x and 1.5x (increased min from 0.7)
  
  // Scale header font size
  const baseFontSize = 14;
  header.style.fontSize = (baseFontSize * scale) + "px";
  
  // Scale title input
  if (titleInput) {
    titleInput.style.fontSize = (baseFontSize * scale) + "px";
  }
  
  // Scale buttons in header - ensure minimum visible size
  const buttons = header.querySelectorAll("button");
  buttons.forEach(btn => {
    const baseBtnFontSize = 12;
    const baseBtnPadding = 6;
    const minButtonSize = 20; // Minimum button size in pixels
    const calculatedSize = 24 * scale;
    
    btn.style.fontSize = (baseBtnFontSize * scale) + "px";
    btn.style.padding = (baseBtnPadding * scale) + "px";
    btn.style.minWidth = Math.max(minButtonSize, calculatedSize) + "px";
    btn.style.minHeight = Math.max(minButtonSize, calculatedSize) + "px";
    btn.style.display = "inline-flex"; // Ensure buttons are visible
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
  });
  
  // Scale header padding
  const basePadding = 6;
  header.style.padding = (basePadding * scale) + "px " + (basePadding * 1.3 * scale) + "px";
  
  // Scale textarea font size
  const baseTextareaFontSize = 14;
  textarea.style.fontSize = (baseTextareaFontSize * scale) + "px";
  textarea.style.padding = (basePadding * scale) + "px " + (basePadding * 1.3 * scale) + "px";
  
  // Scale footer elements
  const footerButtons = footer.querySelectorAll("button");
  footerButtons.forEach(btn => {
    const baseBtnFontSize = 12;
    const baseBtnPadding = 6;
    btn.style.fontSize = (baseBtnFontSize * scale) + "px";
    btn.style.padding = (baseBtnPadding * scale) + "px " + (baseBtnPadding * 1.3 * scale) + "px";
  });
  footer.style.padding = (basePadding * scale) + "px";
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
  type: "note", // Default to regular note, can be "checklist"
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
};  
  notes.push(noteObject); 
  saveNotes(notes);
  // Save initial version (#75)
  versionHistoryService.saveVersion(noteObject);
  renderAllNotes(); 
  updateSidebar();
}

function updateNote(id, newContent, element, newTitle = "Untitled", extras = {}) {
  const notes = getNotes();
  const target = notes.find(n => n.id == id);
  if (!target) return;

  // Check if content actually changed before saving version
  const contentChanged = target.content !== newContent || target.title !== newTitle;
  const significantChange = contentChanged || 
    (extras.color !== undefined && extras.color !== target.color) ||
    (extras.shape !== undefined && extras.shape !== target.shape);

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
  
  // Save version history for significant changes (#75)
  // Debounce: only save if content/title changed (not just position)
  if (contentChanged) {
    versionHistoryService.saveVersion(target);
  }
  
  updateSidebar();
}


function deleteNote(id,element){ const notes=getNotes().filter(n=>n.id!=id); saveNotes(notes); if(element&&element.parentNode===notesContainer) notesContainer.removeChild(element); reminderScheduler.clear(id); updateSidebar(); }

function renderAllNotes(filterQuery="") {
  Array.from(notesContainer.querySelectorAll(".note-wrapper")).forEach(n=>n.remove());
  const notes = searchService.filter(getNotes(),filterQuery);
  notes.forEach(note=>{ const el=createNoteElement(note.id,note.content,note); el.style.top=note.top; el.style.left=note.left; el.style.width=note.width; el.style.height=note.height; notesContainer.insertBefore(el,addNoteButton); });
  updateSidebar();
}

// Render a single note (used for pop-out windows)
function renderPopoutNote(noteId) {
  // Clear everything from body
  document.body.innerHTML = "";

  const notes = getNotes();
  const note = notes.find(n => n.id === noteId);

  if (!note) {
    document.body.innerHTML = "<p style='padding:16px;color:#666'>Note not found.</p>";
    return;
  }

  const el = createNoteElement(note.id, note.content, note);
  document.body.appendChild(el);
}

// Initialize with sample notes on first load
function initializeSampleData() {
  const notesKey = "stickynotes-notes";
  const categoriesKey = "stickynotes-categories";

  // Check if data already exists
  const existingNotes = localStorage.getItem(notesKey);
  if (existingNotes && JSON.parse(existingNotes).length > 0) {
    return; // Don't overwrite existing data
  }

  // Sample categories
  const sampleCategories = [
    { id: 'work', name: 'Work' },
    { id: 'personal', name: 'Personal' },
    { id: 'ideas', name: 'Ideas' }
  ];

  // Sample notes
  const sampleNotes = [
    {
      id: 'welcome-note',
      title: 'Welcome to Sticky Notes!',
      content: `🎉 Welcome to your sticky notes app!

This note demonstrates the app's features. Your notes are automatically saved and will persist when you refresh the page.

Features:
• Drag notes around to organize your workspace
• Click the ⋯ menu for note options
• Use categories to organize your notes
• Double-click notes to edit them
• Notes persist across browser sessions

Try creating a new note with the + button!`,
      category: 'personal',
      color: '#e8f5e8',
      shape: 'rectangle',
      top: 100,
      left: 100,
      width: 320,
      height: 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'getting-started',
      title: 'Getting Started Guide',
      content: `📝 How to use Sticky Notes:

1. **Create notes**: Click the + button in the top-left
2. **Edit notes**: Double-click any note to edit its content
3. **Move notes**: Drag notes around by their title bar
4. **Organize**: Use categories to group related notes
5. **Options**: Click ⋯ on any note for more options
6. **Persistence**: Your notes save automatically!

The app remembers everything - try refreshing the page!`,
      category: 'ideas',
      color: '#e3f2fd',
      shape: 'rectangle',
      top: 350,
      left: 150,
      width: 300,
      height: 180,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Save sample data
  localStorage.setItem(notesKey, JSON.stringify(sampleNotes));
  localStorage.setItem(categoriesKey, JSON.stringify(sampleCategories));

  console.log('Sample notes loaded for first-time users!');
}

// init
initializeSampleData();
init();
function init(){

  const urlParams = new URLSearchParams(window.location.search);
  const popoutId = urlParams.get("popout");

  // Pop-out note view (#101)
  if (popoutId) {
    document.body.classList.add("popout-mode");
    renderPopoutNote(popoutId);
    reminderScheduler.rescheduleAll(getNotes());
    syncManagerService.init();
    return;
  }

  // Shared note view (#81)
  if (sharingService.isSharedView()) {
    const token = sharingService.getShareTokenFromURL();
    const sharedNote = sharingService.getSharedNote(token);

    if (sharedNote) {
      // Show shared note view
      const sharedView = createSharedNoteView(sharedNote);
      document.body.innerHTML = "";
      document.body.appendChild(sharedView);
      return; // Don't initialize normal app
    } else {
      alert("This shared note link is invalid or has been revoked.");
    }
  }

  // Main app view
  addNoteButton = notesContainer.querySelector(".add-note");
  if(addNoteButton) addNoteButton.addEventListener("click", addNote);
  renderAllNotes();
  if("Notification" in window && Notification.permission!=="granted") notificationService.requestPermission();
  reminderScheduler.rescheduleAll(getNotes());
  searchInput.addEventListener("input",(e)=>renderAllNotes(e.target.value));

  // Initialize sync manager (#72, #74)
  syncManagerService.init();

  // Save initial versions for existing notes (#75)
  const notes = getNotes();
  notes.forEach(note => {
    const history = versionHistoryService.getHistory(note.id);
    if (history.length === 0) {
      versionHistoryService.saveVersion(note);
    }
  });

}

// Cross-window sync: update views when notes change in another tab/window (#102, #104)
window.addEventListener("storage", (e) => {
  if (e.key !== "stickynotes-notes") return;

  const params = new URLSearchParams(window.location.search);
  const popoutId = params.get("popout");

  if (popoutId) {
    // Pop-out window: re-render that specific note
    renderPopoutNote(popoutId);
    reminderScheduler.rescheduleAll(getNotes());
  } else if (!sharingService.isSharedView()) {
    // Main app view: re-render all notes (ignore shared read-only view)
    const currentQuery = (typeof searchInput !== "undefined" && searchInput.value) || "";
    renderAllNotes(currentQuery);
    reminderScheduler.rescheduleAll(getNotes());
  }
});

// View switching functions (#105)
let currentView = "notes"; // "notes" or "analytics"
let analyticsViewElement = null;

function switchToAnalyticsView() {
  if (currentView === "analytics") return;

  // Hide notes view elements
  sidebar.style.display = "none";
  toolbar.style.display = "none";
  searchBar.style.display = "none";
  notesContainer.style.display = "none";

  // Show analytics view
  analyticsViewElement = createAnalyticsView(switchToNotesView);
  document.body.appendChild(analyticsViewElement);

  currentView = "analytics";
}

function switchToNotesView() {
  if (currentView === "notes") return;

  // Remove analytics view
  if (analyticsViewElement) {
    document.body.removeChild(analyticsViewElement);
    analyticsViewElement = null;
  }

  // Show notes view elements
  sidebar.style.display = "";
  toolbar.style.display = "";
  searchBar.style.display = "";
  notesContainer.style.display = "";

  // Refresh notes view
  const currentQuery = (typeof searchInput !== "undefined" && searchInput.value) || "";
  renderAllNotes(currentQuery);

  currentView = "notes";
}

window._stickies = { getNotes, saveNotes, renderAllNotes, addNote };

// Export for ESM tests
export { getNotes, saveNotes, renderAllNotes, addNote };