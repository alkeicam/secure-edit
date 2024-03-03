const AppMenu = require("./menu")
const path = require('path')
const { BrowserWindow } = require('electron')


class ElectronApp {
    constructor(){
        this.mainWindow = undefined;
        this.remotesWindow = undefined;
        this.menu = undefined;
    }


    start(){
        this.createMainWindow();
        this.createRemotesWindow();
        this.createMenu();
        this.showMain();
    }

    showMain(){
        this.mainWindow.show();
    }

    createMainWindow(){
        const mainWindow = new BrowserWindow({    
            width: 1600,
            show: false,
            height: 1240,
            webPreferences: {
              preload: path.join(__dirname, '../preload.js')
            }
          })
        
          // and load the index.html of the app.
          mainWindow.loadFile('app/index.html')
          this.mainWindow = mainWindow;
          mainWindow.webContents.openDevTools()
    }
    createRemotesWindow(){
        const remotesWindow = new BrowserWindow({    
            parent: this.mainWindow, 
            modal: true, 
            show: false,
            width: 1200,
            height: 800,
            webPreferences: {
              preload: path.join(__dirname, '../preload.js')
            }
          })
        
          remotesWindow.loadFile('app/remotes.html')
          this.remotesWindow = remotesWindow;
    }

    createMenu(){
        const appMenu = new AppMenu(this.mainWindow, this.remotesWindow);
        appMenu.updateMenu();

        this.menu = appMenu;
    }
}

module.exports = ElectronApp