// services/checklistService.js
// #85 Add dynamic checklist item creation
// #86 Implement check/uncheck functionality
// #87 Apply visual updates for completed items
// #88 Persist checklist state after reload
// #89 Convert existing notes into checklists

export const checklistService = {
  // Check if a note is a checklist
  isChecklist(note) {
    return note && note.type === "checklist";
  },

  // Create a new checklist item
  createItem(text = "", checked = false) {
    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      text: text.trim(),
      checked: checked,
      createdAt: new Date().toISOString()
    };
  },

  // Add item to checklist
  addItem(note, itemText) {
    if (!this.isChecklist(note)) {
      return null;
    }
    
    if (!note.items) {
      note.items = [];
    }
    
    const newItem = this.createItem(itemText);
    note.items.push(newItem);
    return newItem;
  },

  // Remove item from checklist
  removeItem(note, itemId) {
    if (!this.isChecklist(note) || !note.items) {
      return false;
    }
    
    const index = note.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      note.items.splice(index, 1);
      return true;
    }
    return false;
  },

  // Toggle item checked state
  toggleItem(note, itemId) {
    if (!this.isChecklist(note) || !note.items) {
      return false;
    }
    
    const item = note.items.find(item => item.id === itemId);
    if (item) {
      item.checked = !item.checked;
      item.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  },

  // Update item text
  updateItemText(note, itemId, newText) {
    if (!this.isChecklist(note) || !note.items) {
      return false;
    }
    
    const item = note.items.find(item => item.id === itemId);
    if (item) {
      item.text = newText.trim();
      item.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  },

  // Get completion stats
  getCompletionStats(note) {
    if (!this.isChecklist(note) || !note.items) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    
    const total = note.items.length;
    const completed = note.items.filter(item => item.checked).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, percentage };
  },

  // Convert a regular note to a checklist
  convertToChecklist(note) {
    if (this.isChecklist(note)) {
      return note; // Already a checklist
    }
    
    note.type = "checklist";
    note.items = [];
    
    // If note has content, create initial items from lines
    if (note.content && note.content.trim()) {
      const lines = note.content.split("\n").filter(line => line.trim());
      lines.forEach(line => {
        const item = this.createItem(line.trim());
        note.items.push(item);
      });
      note.content = ""; // Clear content as it's now in items
    }
    
    return note;
  },

  // Convert a checklist back to a regular note
  convertToRegularNote(note) {
    if (!this.isChecklist(note)) {
      return note;
    }
    
    // Convert items back to content
    if (note.items && note.items.length > 0) {
      note.content = note.items.map(item => item.text).join("\n");
    }
    
    note.type = "note";
    delete note.items;
    
    return note;
  }
};

