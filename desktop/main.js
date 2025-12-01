const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Keep a global reference of the window object
let mainWindow;

// Create the browser window
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });


const indexPath = path.join(__dirname, '..', 'index.html');
mainWindow.loadFile(indexPath);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Set up application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu-new-note');
          }
        },
        { type: 'separator' },
        {
          label: 'Import Notes',
          click: () => {
            mainWindow.webContents.send('menu-import');
          }
        },
        {
          label: 'Export Notes',
          click: () => {
            mainWindow.webContents.send('menu-export');
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Analytics',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            mainWindow.webContents.send('menu-analytics');
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  // macOS: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for desktop-specific features
ipcMain.handle('desktop:get-app-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('desktop:get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('desktop:show-save-dialog', async (event, options) => {
  return await dialog.showSaveDialog(mainWindow, options);
});

ipcMain.handle('desktop:show-open-dialog', async (event, options) => {
  return await dialog.showOpenDialog(mainWindow, options);
});

ipcMain.handle('desktop:show-message-box', async (event, options) => {
  return await dialog.showMessageBox(mainWindow, options);
});

ipcMain.handle('desktop:create-popout-window', async (event, options) => {
  const { url, width, height } = options;

  try {
    // Create a new popout window
    const popoutWindow = new BrowserWindow({
      width: width,
      height: height,
      minWidth: 200,
      minHeight: 150,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      titleBarStyle: 'default',
      show: false, // Don't show until ready
      parent: mainWindow, // Make it a child window of the main window
      modal: false // Allow interaction with parent window
    });

    // Load the popout URL
    popoutWindow.loadURL(url);

    // Show window when ready
    popoutWindow.once('ready-to-show', () => {
      popoutWindow.show();
    });

    // Handle window closed
    popoutWindow.on('closed', () => {
      // Cleanup if needed
    });

    // Handle external links (prevent opening in system browser)
    popoutWindow.webContents.setWindowOpenHandler(({ url: externalUrl }) => {
      // For popout windows, allow opening external links in system browser
      require('electron').shell.openExternal(externalUrl);
      return { action: 'deny' };
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to create popout window:', error);
    return { success: false, error: error.message };
  }
});

// Auto-updater setup (placeholder for #113)
if (process.env.NODE_ENV === 'production') {
  // In production, set up auto-updater
  // require('./auto-updater');
}

// Handle app updates
ipcMain.handle('desktop:check-for-updates', () => {
  // Placeholder for update checking logic
  return { updateAvailable: false, version: app.getVersion() };
});

ipcMain.handle('desktop:install-update', () => {
  // Placeholder for update installation
  return { success: false, error: 'Update system not implemented yet' };
});
