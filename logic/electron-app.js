const AppMenu = require("./menu")
const path = require('path')
const { BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const FileManager = require("./file-manager");
const store = require("./store")


class ElectronApp {
    constructor(){
        this.mainWindow = undefined;
        this.remotesWindow = undefined;
        this.menu = undefined;
        this.fileManager = FileManager.getInstance();
    }


    start(){
        const that = this;    
        this.createMenu();          
    
        ipcMain.handle('seapi_closeRemotesWindow', (electronEE, ...args)=>{
            that.closeRemotesWindow();
        })

        ipcMain.on('listener_saveFile_response', async (_event, contents, fileMetadata) => {    
            const fileContents = await that.fileManager.saveFile(contents, fileMetadata);     
            // and send back data about save file
            _event.sender.send('listener_saveFile_success', fileContents);
            
            if(fileContents.error) return;
            // on success save add newly saved file to recent's list
            
            that.menu.addRecent({
                label: fileContents.fileName,
                fullPath: fileContents.fullPath,
                destination: fileContents.destination
            })
        })

        ipcMain.handle('seapi_getRemotes', (electronEE, ...args)=>{
            return store.remotes();
        });

        ipcMain.handle('seapi_removeRemote', (electronEE, fileMetadataSecure)=>{
            store.removeRemote(fileMetadataSecure);
            return store.remotes();
        });
        

        
        this.showMain();
    }

    showMain(){
        this.createMainWindow();  
        this.mainWindow.show();
    }

    closeRemotesWindow(){
        this.remotesWindow.close();
    }

    showRemotesWindow(){
        this.createRemotesWindow();
        this.remotesWindow.show();
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
        remotesWindow.webContents.openDevTools()
        
    }

    createMenu(){
        const appMenu = new AppMenu(this);
        appMenu.updateMenu();

        this.menu = appMenu;
    }
}

module.exports = ElectronApp