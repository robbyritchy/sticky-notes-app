// services/searchService.js
export const searchService = {
  filter(notes, query) {
    if (!query || !query.trim()) return notes;
    const q = query.trim().toLowerCase();
    return notes.filter(n => {
      const content = (n.content || "").toLowerCase();
      const category = (n.category || "").toLowerCase();
      return content.includes(q) || category.includes(q);
    });
  }
};
