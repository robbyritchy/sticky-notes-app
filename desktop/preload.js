const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File system operations
  getAppDataPath: () => ipcRenderer.invoke('desktop:get-app-data-path'),
  showSaveDialog: (options) => ipcRenderer.invoke('desktop:show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('desktop:show-open-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('desktop:show-message-box', options),

  // App information
  getAppVersion: () => ipcRenderer.invoke('desktop:get-app-version'),

  // Update system
  checkForUpdates: () => ipcRenderer.invoke('desktop:check-for-updates'),
  installUpdate: () => ipcRenderer.invoke('desktop:install-update'),

  // Menu events
  onMenuNewNote: (callback) => ipcRenderer.on('menu-new-note', callback),
  onMenuImport: (callback) => ipcRenderer.on('menu-import', callback),
  onMenuExport: (callback) => ipcRenderer.on('menu-export', callback),
  onMenuAnalytics: (callback) => ipcRenderer.on('menu-analytics', callback),

  // Remove all listeners when cleaning up
  removeAllListeners: (event) => ipcRenderer.removeAllListeners(event)
});

// Also expose a simple way to check if we're running in Electron
contextBridge.exposeInMainWorld('isElectron', true);
