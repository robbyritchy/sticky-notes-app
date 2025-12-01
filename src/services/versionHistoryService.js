// services/versionHistoryService.js
// #75 Implement version tracking for notes
// #79 Persist version history data

export const versionHistoryService = {
  // Get version history for a note
  getHistory(noteId) {
    const key = `stickynotes-history-${noteId}`;
    return JSON.parse(localStorage.getItem(key) || "[]");
  },

  // Save a version snapshot
  saveVersion(note) {
    if (!note || !note.id) return;
    
    const key = `stickynotes-history-${note.id}`;
    const history = this.getHistory(note.id);
    
    // Create version snapshot
    const version = {
      id: `${note.id}-v${Date.now()}`,
      noteId: note.id,
      timestamp: new Date().toISOString(),
      data: {
        title: note.title,
        content: note.content,
        category: note.category,
        color: note.color,
        shape: note.shape,
        top: note.top,
        left: note.left,
        width: note.width,
        height: note.height,
        reminderDate: note.reminderDate
      }
    };

    // Add to history (keep last 50 versions per note)
    history.unshift(version);
    if (history.length > 50) {
      history.pop();
    }

    localStorage.setItem(key, JSON.stringify(history));
    return version;
  },

  // Get a specific version by ID
  getVersion(noteId, versionId) {
    const history = this.getHistory(noteId);
    return history.find(v => v.id === versionId);
  },

  // Restore a note to a specific version
  restoreVersion(noteId, versionId, currentNotes) {
    const version = this.getVersion(noteId, versionId);
    if (!version) return null;

    const noteIndex = currentNotes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return null;

    // Restore note data
    const restoredNote = {
      ...currentNotes[noteIndex],
      ...version.data,
      updatedAt: new Date().toISOString()
    };

    // Save restored version as new version
    this.saveVersion(restoredNote);
    
    return restoredNote;
  },

  // Clear history for a note
  clearHistory(noteId) {
    const key = `stickynotes-history-${noteId}`;
    localStorage.removeItem(key);
  },

  // Get all history (for all notes)
  getAllHistory() {
    const allHistory = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("stickynotes-history-")) {
        const noteId = key.replace("stickynotes-history-", "");
        const history = this.getHistory(noteId);
        allHistory.push({ noteId, history });
      }
    }
    return allHistory;
  }
};

