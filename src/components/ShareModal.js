// components/ShareModal.js
// #80 Generate shareable link for notes
// #83 Handle revoked link access

import { sharingService } from "../services/sharingService.js";

export function createShareModal(noteId, noteTitle) {
  const modal = document.createElement("div");
  modal.className = "share-modal";
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
    max-width: 500px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;

  // Header
  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  `;

  const title = document.createElement("h2");
  title.textContent = `Share: ${noteTitle || "Untitled"}`;
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

  // Share link section
  const shareSection = document.createElement("div");
  shareSection.style.marginBottom = "20px";

  const shareLabel = document.createElement("label");
  shareLabel.textContent = "Shareable Link:";
  shareLabel.style.cssText = `
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #333;
  `;

  const linkContainer = document.createElement("div");
  linkContainer.style.cssText = `
    display: flex;
    gap: 8px;
    align-items: center;
  `;

  const linkInput = document.createElement("input");
  linkInput.type = "text";
  linkInput.readOnly = true;
  linkInput.style.cssText = `
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background: #f5f5f5;
  `;

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "Copy";
  copyBtn.style.cssText = `
    padding: 8px 16px;
    background: #1976d2;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  copyBtn.addEventListener("click", () => {
    linkInput.select();
    document.execCommand("copy");
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = "Copy";
    }, 2000);
  });

  linkContainer.appendChild(linkInput);
  linkContainer.appendChild(copyBtn);

  shareSection.appendChild(shareLabel);
  shareSection.appendChild(linkContainer);

  // Generate share link
  const existingShares = sharingService.getNoteShares(noteId);
  let currentShare = null;

  if (existingShares.length > 0) {
    currentShare = existingShares[0];
    linkInput.value = currentShare.url;
  } else {
    const shareResult = sharingService.generateShareLink(noteId);
    currentShare = shareResult;
    linkInput.value = shareResult.url;
  }

  // Active shares list
  const activeSharesSection = document.createElement("div");
  activeSharesSection.style.marginTop = "20px";

  const activeSharesLabel = document.createElement("div");
  activeSharesLabel.textContent = "Active Shares:";
  activeSharesLabel.style.cssText = `
    font-weight: bold;
    margin-bottom: 8px;
    color: #333;
  `;

  const sharesList = document.createElement("div");
  sharesList.className = "shares-list";

  function updateSharesList() {
    sharesList.innerHTML = "";
    const shares = sharingService.getNoteShares(noteId);
    
    if (shares.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No active shares";
      empty.style.cssText = `
        color: #999;
        font-style: italic;
        padding: 8px;
      `;
      sharesList.appendChild(empty);
    } else {
      shares.forEach(share => {
        const shareItem = document.createElement("div");
        shareItem.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          border: 1px solid #eee;
          border-radius: 4px;
          margin-bottom: 8px;
        `;

        const shareInfo = document.createElement("div");
        shareInfo.style.cssText = `
          flex: 1;
          font-size: 12px;
          color: #666;
        `;
        shareInfo.textContent = `Created: ${new Date(share.createdAt).toLocaleString()}`;

        const revokeBtn = document.createElement("button");
        revokeBtn.textContent = "Revoke";
        revokeBtn.style.cssText = `
          padding: 4px 12px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        `;
        revokeBtn.addEventListener("click", () => {
          if (confirm("Revoke this share link? Others will no longer be able to access it.")) {
            sharingService.revokeShareLink(share.token);
            updateSharesList();
            if (share.token === currentShare?.token) {
              linkInput.value = "";
              const newShare = sharingService.generateShareLink(noteId);
              currentShare = newShare;
              linkInput.value = newShare.url;
            }
          }
        });

        shareItem.appendChild(shareInfo);
        shareItem.appendChild(revokeBtn);
        sharesList.appendChild(shareItem);
      });
    }
  }

  updateSharesList();

  activeSharesSection.appendChild(activeSharesLabel);
  activeSharesSection.appendChild(sharesList);

  // Info text
  const infoText = document.createElement("div");
  infoText.style.cssText = `
    margin-top: 16px;
    padding: 12px;
    background: #e3f2fd;
    border-radius: 4px;
    font-size: 12px;
    color: #1976d2;
  `;
  infoText.textContent = "Anyone with this link can view your note in read-only mode.";

  content.appendChild(header);
  content.appendChild(shareSection);
  content.appendChild(activeSharesSection);
  content.appendChild(infoText);
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

