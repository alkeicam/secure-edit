// main.js

// Modules to control application life and create native browser window
const { app } = require('electron')
const { BrowserWindow } = require('electron')
const ElectronApp = require('./logic/electron-app')

const electronApp = new ElectronApp();



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  electronApp.start();  

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) electronApp.start();
  })

  // logic  
  require("./logic/controller")  
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') app.quit()
  // when all windows closed quit the app even on macos
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.