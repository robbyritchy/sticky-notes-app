// services/sharingService.js
// #80 Generate shareable link for notes
// #81 Create shared note read-only view
// #82 Update shared note when owner edits
// #83 Handle revoked link access
// #84 Test sharing flow and permissions

export const sharingService = {
  // Generate a unique shareable link for a note
  generateShareLink(noteId) {
    // Create a unique token for this note
    const token = this._generateToken();
    const shareData = {
      noteId,
      token,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    // Store share data
    const key = `stickynotes-share-${token}`;
    localStorage.setItem(key, JSON.stringify(shareData));
    
    // Also store token in note's share info
    const notes = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
    const note = notes.find(n => n.id === noteId);
    if (note) {
      note.shareToken = token;
      note.isShared = true;
      localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
    }
    
    // Generate URL (in a real app, this would be a full URL)
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${token}`;
    return { token, url: shareUrl, shareData };
  },

  // Get shared note by token
  getSharedNote(token) {
    const key = `stickynotes-share-${token}`;
    const shareData = JSON.parse(localStorage.getItem(key) || "null");
    
    if (!shareData || !shareData.isActive) {
      return null;
    }
    
    const notes = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
    const note = notes.find(n => n.id === shareData.noteId);
    
    if (!note) {
      return null;
    }
    
    return {
      ...note,
      isShared: true,
      isReadOnly: true, // Shared notes are read-only
      shareToken: token
    };
  },

  // Revoke a share link
  revokeShareLink(token) {
    const key = `stickynotes-share-${token}`;
    const shareData = JSON.parse(localStorage.getItem(key) || "null");
    
    if (shareData) {
      shareData.isActive = false;
      localStorage.setItem(key, JSON.stringify(shareData));
      
      // Remove token from note
      const notes = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
      const note = notes.find(n => n.shareToken === token);
      if (note) {
        note.shareToken = null;
        note.isShared = false;
        localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
      }
      
      return true;
    }
    return false;
  },

  // Get all active shares for a note
  getNoteShares(noteId) {
    const shares = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("stickynotes-share-")) {
        const shareData = JSON.parse(localStorage.getItem(key) || "{}");
        if (shareData.noteId === noteId && shareData.isActive) {
          shares.push({
            token: shareData.token,
            createdAt: shareData.createdAt,
            url: `${window.location.origin}${window.location.pathname}?share=${shareData.token}`
          });
        }
      }
    }
    return shares;
  },

  // Check if current page is a shared note view
  isSharedView() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has("share");
  },

  // Get share token from URL
  getShareTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("share");
  },

  // Generate a unique token
  _generateToken() {
    return `share_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
};

