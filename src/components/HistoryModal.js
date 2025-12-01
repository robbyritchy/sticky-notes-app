// components/HistoryModal.js
// #76 Create "History" modal UI
// #77 Add version preview before restore
// #78 Implement restore functionality

import { versionHistoryService } from "../services/versionHistoryService.js";

export function createHistoryModal(noteId, noteTitle, onRestore) {
  const modal = document.createElement("div");
  modal.className = "history-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  const content = document.createElement("div");
  content.style.cssText = `
    background: white;
    border-radius: 8px;
    width: 90%;
    max-width: 700px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;

  // Header
  const header = document.createElement("div");
  header.style.cssText = `
    padding: 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const title = document.createElement("h2");
  title.textContent = `Version History: ${noteTitle || "Untitled"}`;
  title.style.margin = "0";
  title.style.fontSize = "20px";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 32px;
    height: 32px;
    line-height: 32px;
  `;
  closeBtn.addEventListener("click", () => modal.remove());

  header.appendChild(title);
  header.appendChild(closeBtn);

  // History list container
  const listContainer = document.createElement("div");
  listContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    padding: 10px;
  `;

  // Preview container
  const previewContainer = document.createElement("div");
  previewContainer.style.cssText = `
    border-top: 1px solid #eee;
    padding: 20px;
    background: #f9f9f9;
    max-height: 200px;
    overflow-y: auto;
  `;
  previewContainer.style.display = "none";

  const previewTitle = document.createElement("div");
  previewTitle.textContent = "Preview:";
  previewTitle.style.cssText = `
    font-weight: bold;
    margin-bottom: 10px;
    color: #333;
  `;

  const previewContent = document.createElement("div");
  previewContent.style.cssText = `
    background: white;
    padding: 15px;
    border-radius: 4px;
    border: 1px solid #ddd;
    white-space: pre-wrap;
    font-family: inherit;
    max-height: 150px;
    overflow-y: auto;
  `;

  previewContainer.appendChild(previewTitle);
  previewContainer.appendChild(previewContent);

  // Load history
  const history = versionHistoryService.getHistory(noteId);
  
  if (history.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "No version history available";
    empty.style.cssText = `
      padding: 40px;
      text-align: center;
      color: #999;
    `;
    listContainer.appendChild(empty);
  } else {
    history.forEach((version, index) => {
      const item = document.createElement("div");
      item.style.cssText = `
        padding: 12px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background 0.2s;
      `;
      item.addEventListener("mouseenter", () => {
        item.style.background = "#f5f5f5";
      });
      item.addEventListener("mouseleave", () => {
        item.style.background = "white";
      });

      const date = new Date(version.timestamp);
      const dateStr = date.toLocaleString();

      const versionInfo = document.createElement("div");
      versionInfo.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;

      const versionLabel = document.createElement("div");
      versionLabel.textContent = index === 0 ? "Current Version" : `Version ${history.length - index}`;
      versionLabel.style.cssText = `
        font-weight: ${index === 0 ? "bold" : "normal"};
        color: ${index === 0 ? "#1976d2" : "#333"};
      `;

      const dateLabel = document.createElement("div");
      dateLabel.textContent = dateStr;
      dateLabel.style.cssText = `
        font-size: 12px;
        color: #666;
      `;

      versionInfo.appendChild(versionLabel);
      versionInfo.appendChild(dateLabel);

      const previewBtn = document.createElement("button");
      previewBtn.textContent = "Preview";
      previewBtn.style.cssText = `
        margin-top: 8px;
        padding: 6px 12px;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      `;
      previewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        previewContent.textContent = version.data.content || "(empty)";
        previewContainer.style.display = "block";
      });

      const restoreBtn = document.createElement("button");
      restoreBtn.textContent = "Restore";
      restoreBtn.style.cssText = `
        margin-top: 8px;
        margin-left: 8px;
        padding: 6px 12px;
        background: #4caf50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      `;
      restoreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Restore this version? This will replace the current note content.`)) {
          if (onRestore) {
            onRestore(version);
          }
          modal.remove();
        }
      });

      if (index === 0) {
        restoreBtn.disabled = true;
        restoreBtn.style.opacity = "0.5";
        restoreBtn.style.cursor = "not-allowed";
      }

      const actions = document.createElement("div");
      actions.appendChild(previewBtn);
      actions.appendChild(restoreBtn);

      item.appendChild(versionInfo);
      item.appendChild(actions);
      listContainer.appendChild(item);
    });
  }

  content.appendChild(header);
  content.appendChild(listContainer);
  content.appendChild(previewContainer);
  modal.appendChild(content);

  // Close on outside click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", escapeHandler);
    }
  };
  document.addEventListener("keydown", escapeHandler);

  return modal;
}

