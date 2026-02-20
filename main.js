// main.js
const { app, dialog, BrowserWindow, shell } = require('electron');
const path = require('path');

const { createWindow, getMainWindow } = require('./src/main-process/window-manager');
const { initializeIpcHandlers } = require('./src/main-process/ipc-handlers');

// --- THIS IS THE FIX: Development Mode Toggle ---
// Set to 'true' when running with `npm start` to bypass the launcher check.
// Set to 'false' before creating a production build.
const IN_DEVELOPMENT_MODE = true;

// This argument will be passed by the launcher when it starts the app.
const LAUNCHER_ARG = '--launched-by-xutron';
const LAUNCHER_PROTOCOL_URI = 'xutron-launcher://relaunch?appId=zipanalyser';

// Check if the app was launched directly in production
// MODIFIED: This condition now uses the new boolean toggle.
if (!IN_DEVELOPMENT_MODE && !process.argv.includes(LAUNCHER_ARG)) {
    console.log('Not launched by XutronCore Launcher. Attempting to open launcher...');
    try {
        shell.openExternal(LAUNCHER_PROTOCOL_URI);
    } catch (e) {
        dialog.showErrorBox(
            'Launcher Required',
            'Could not start the XutronCore Launcher. Please ensure it is installed correctly and try again.'
        );
    }
    app.quit();
} else {
    // --- ALL ORIGINAL APP INITIALIZATION CODE IS PLACED INSIDE THIS ELSE BLOCK ---

    if (require('electron-squirrel-startup')) {
      app.quit();
    }

    app.whenReady().then(() => {
      console.log("Main Process: App ready.");
      initializeIpcHandlers();
      createWindow();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    console.log("Main Process: Initializing...");
}