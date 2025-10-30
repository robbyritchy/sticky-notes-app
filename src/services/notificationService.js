
export const notificationService = {
  async requestPermission() {
    if (!("Notification" in window)) {
      return "unsupported";
    }
    const perm = await Notification.requestPermission();
    return perm; // "granted"|"denied"|"default"
  },

  showNotification(title, options = {}) {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      const n = new Notification(title, options);
      return n;
    } catch (err) {
      console.error("Notification failed:", err);
    }
  }
};

// Reminder scheduler (keeps in-memory timeouts while session alive)
export const reminderScheduler = {
  _timeouts: new Map(),

  schedule(note) {
    this.clear(note.id);
    if (!note.reminderDate) return;
    const when = new Date(note.reminderDate).getTime();
    const now = Date.now();
    if (isNaN(when) || when <= now) {
      // If past, show immediately
      notificationService.showNotification("Reminder", {
        body: note.content || "Reminder",
      });
      return;
    }
    const ms = when - now;
    const t = setTimeout(() => {
      notificationService.showNotification("Reminder", {
        body: note.content || "Reminder",
      });
      this._timeouts.delete(note.id);
    }, ms);
    this._timeouts.set(note.id, t);
  },

  clear(noteId) {
    const t = this._timeouts.get(noteId);
    if (t) {
      clearTimeout(t);
      this._timeouts.delete(noteId);
    }
  },

  rescheduleAll(notes) {
    // clear all timeouts
    for (const [id,t] of this._timeouts) {
      clearTimeout(t);
    }
    this._timeouts.clear();
    // schedule again
    notes.forEach(n => {
      this.schedule(n);
    });
  }
};
