const FileManager = require("./file-manager");
const { ipcMain, Menu} = require('electron')

const fileManager = FileManager.getInstance();

const AppMenu = require("./menu")

function handleUIEvent (eventName, data){
    
    switch (eventName) {
        case "ui_dirty_count":                        
            const menu = Menu.getApplicationMenu();
            // hide menu save when there are no dirty editors open
            const fileSaveMenuItem = menu?.items.find((item)=>item.id=="file")?.submenu.items.find((item)=>item.id=="save");            
            data>0?fileSaveMenuItem.enabled = true:fileSaveMenuItem.enabled = false;                                
            break; 
        default:
            break;
    }
}

// RENDERER -> MAIN with response going back to RENDERER
// handle calls from renderer, process in main process and provide response to the renderer process
// so this is api provided by the main process to the renderer process
ipcMain.handle('seapi_saveFile', (electronEE, ...args)=>{return fileManager.saveFile(...args)});
ipcMain.handle('seapi_loadFile', (electronEE, ...args)=>{return fileManager.loadFile(...args)});
ipcMain.handle('seapi_editorUIEvent', (electronEE, ...args)=>{return handleUIEvent(...args)});



class RemotesWindowController {
    init(remotesWindow){
        ipcMain.handle('seapi_closeRemotesWindow', (electronEE, ...args)=>{
            remotesWindow.close();
        })
    }
}


// RENRER->MAIN (no response)
// receive responses from application listeners

// is is important to note that the first argument passed on to callback
// is the _event object which holds a channel to main process via
// _event.sender.send() method. As a result when there is a ipcMain.on() accompanying it will be
// called.
ipcMain.on('listener_saveFile_response', async (_event, contents, fileMetadata) => {    
    const fileContents = await fileManager.saveFile(contents, fileMetadata);     
    // and send back data about save file
    _event.sender.send('listener_saveFile_success', fileContents);
    
    if(fileContents.error) return;
    // on success save add newly saved file to recent's list
    const appMenu = new AppMenu();
    appMenu.addRecent({
        label: fileContents.fileName,
        fullPath: fileContents.fullPath,
        destination: fileContents.destination
    })
})

module.exports = {
    remotesWindowController: new RemotesWindowController()
}

