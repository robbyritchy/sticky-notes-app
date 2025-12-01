// components/SharedNoteView.js
// #81 Create shared note read-only view

import { sharingService } from "../services/sharingService.js";
import { checklistService } from "../services/checklistService.js";

export function createSharedNoteView(sharedNote) {
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--base-color, #fdfdfd);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    overflow-y: auto;
  `;

  const noteCard = document.createElement("div");
  noteCard.style.cssText = `
    background: ${sharedNote.color || "#fff59d"};
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    padding: 24px;
    max-width: 600px;
    width: 100%;
    position: relative;
  `;

  // Header
  const header = document.createElement("div");
  header.style.cssText = `
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  `;

  const title = document.createElement("h2");
  title.textContent = sharedNote.title || "Untitled";
  title.style.cssText = `
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #333;
  `;

  const sharedBadge = document.createElement("div");
  sharedBadge.textContent = "🔗 Shared Note (Read-Only)";
  sharedBadge.style.cssText = `
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 4px;
  `;

  header.appendChild(title);
  header.appendChild(sharedBadge);

  // Content
  const content = document.createElement("div");
  content.style.cssText = `
    margin-bottom: 16px;
  `;

  if (checklistService.isChecklist(sharedNote)) {
    // Render checklist
    const checklistContainer = document.createElement("div");
    checklistContainer.className = "shared-checklist";
    
    if (sharedNote.items && sharedNote.items.length > 0) {
      const stats = checklistService.getCompletionStats(sharedNote);
      const statsDiv = document.createElement("div");
      statsDiv.style.cssText = `
        margin-bottom: 12px;
        font-size: 14px;
        color: #666;
      `;
      statsDiv.textContent = `Progress: ${stats.completed}/${stats.total} (${stats.percentage}%)`;
      checklistContainer.appendChild(statsDiv);

      sharedNote.items.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.style.cssText = `
          display: flex;
          align-items: center;
          padding: 8px;
          margin-bottom: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 4px;
        `;

        const checkbox = document.createElement("span");
        checkbox.textContent = item.checked ? "✓" : "☐";
        checkbox.style.cssText = `
          margin-right: 12px;
          font-size: 18px;
          color: ${item.checked ? "#4caf50" : "#999"};
        `;

        const itemText = document.createElement("span");
        itemText.textContent = item.text || "(empty)";
        itemText.style.cssText = `
          flex: 1;
          text-decoration: ${item.checked ? "line-through" : "none"};
          opacity: ${item.checked ? 0.6 : 1};
          color: ${item.checked ? "#666" : "#333"};
        `;

        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(itemText);
        checklistContainer.appendChild(itemDiv);
      });
    } else {
      const empty = document.createElement("div");
      empty.textContent = "No items in this checklist";
      empty.style.cssText = `
        color: #999;
        font-style: italic;
        padding: 20px;
        text-align: center;
      `;
      checklistContainer.appendChild(empty);
    }

    content.appendChild(checklistContainer);
  } else {
    // Render regular note content
    const textContent = document.createElement("div");
    textContent.textContent = sharedNote.content || "(empty)";
    textContent.style.cssText = `
      white-space: pre-wrap;
      line-height: 1.6;
      color: #333;
      min-height: 100px;
    `;
    content.appendChild(textContent);
  }

  // Footer
  const footer = document.createElement("div");
  footer.style.cssText = `
    padding-top: 12px;
    border-top: 1px solid rgba(0,0,0,0.1);
    font-size: 12px;
    color: #666;
    text-align: center;
  `;
  footer.textContent = `Last updated: ${new Date(sharedNote.updatedAt || sharedNote.createdAt).toLocaleString()}`;

  noteCard.appendChild(header);
  noteCard.appendChild(content);
  noteCard.appendChild(footer);
  container.appendChild(noteCard);

  return container;
}

