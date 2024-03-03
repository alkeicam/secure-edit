// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const AppMenu = require("./logic/menu")


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({    
    width: 1600,
    height: 1240,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('app/index.html')

  const remotesWindow = new BrowserWindow({    
    parent: mainWindow, 
    modal: true, 
    show: false,
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  remotesWindow.loadFile('app/remotes.html')
  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  remotesWindow.webContents.openDevTools()

  const appMenu = new AppMenu(mainWindow, remotesWindow);
  appMenu.updateMenu();
  
//   Menu.setApplicationMenu(Menu.buildFromTemplate([
//     {
//         label: app.getName(),
//         submenu: [
//             {label: 'Quit', role: 'quit'  }]
//     }
// ]))
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // logic  
  require("./logic/controller")
  const {remotesWindowController} = require("./logic/controller")
  remotesWindowController.init(remotesWindow);
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