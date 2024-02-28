/**
 * Recently open file item
 * @typedef {Object} RecentItem
 * @property {string} label - label/name of the file.
 * @property {string} fullPath - full absolute path to file
 */

const { Menu, BrowserWindow } = require('electron')
const FileManager = require("./file-manager")
const persistentStore = require("./store")

const isMac = process.platform === 'darwin'


class AppMenu {
    constructor(){
        this.id = `${Math.random().toString(36).substring(2, 8)}`;
        
        // console.log(`with main window ${mainWindow.id}`);
        this.fileManager = FileManager.getInstance();
        const that = this;        
        this.store = persistentStore;
        

        this.configuration = [
            { role: 'appMenu' },
            // ...(isMac ? [{
            //   label: app.name,
            //   submenu: [
            //     { role: 'about' },
            //     { type: 'separator' },
            //     { role: 'services' },
            //     { type: 'separator' },
            //     { role: 'hide' },
            //     { role: 'hideOthers' },
            //     { role: 'unhide' },
            //     { type: 'separator' },
            //     { role: 'quit' }
            //   ]
            // }] : []),
            // { role: 'fileMenu' }
            {
                id: "file",
              label: 'File',
              submenu: [
                isMac ? { role: 'close' } : { role: 'quit' },
                { type: 'separator' },
                {
                    label: 'Open',
                    accelerator: "CmdOrCtrl+O",
                    click: async (data) => {
                        const fileContents = await that.fileManager.loadFile();
                        const wins = BrowserWindow.getAllWindows();
                        BrowserWindow.fromId(1).webContents.send('listener_openFile', fileContents);   
                        
                        if(fileContents.error) return;
                        // add recent only when open was successfull
                        that.addRecent({
                            label: fileContents.fileName,
                            fullPath: fileContents.fullPath,
                            destination: fileContents.destination
                        })
                    }
                },
                {
                    id: "save",
                    label: 'Save',
                    accelerator: "CmdOrCtrl+S",
                    click: async () => {
                        // const fileContents = await fileManager.saveFile();
                        BrowserWindow.fromId(1).webContents.send('listener_saveFile');
                    }
                },
                { type: 'separator' },
                {
                    label: 'New File',
                    accelerator: "CmdOrCtrl+N",
                    click: async () => {                        
                        BrowserWindow.fromId(1).webContents.send('listener_openFile');
                    }
                },{
                    id: "recent",
                    label: 'Recent',
                    submenu: []
                }
                
              ]
            },
            // { role: 'editMenu' }
            {
              id: 'edit',
              label: 'Edit',
              submenu: [
                { role: 'undo' },
                { role: 'redo' },
                // { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                // { role: 'search' },
                {
                  id: "mySearch",
                  label: 'Find/Replace',
                  accelerator: "CmdOrCtrl+F",
                  click: async () => {                        
                    BrowserWindow.fromId(1).webContents.send('listener_search');
                  }
                },
                ...(isMac ? [
                  { role: 'pasteAndMatchStyle' },
                  { role: 'delete' },
                  { role: 'selectAll' },
                  { type: 'separator' },
                  {
                    label: 'Speech',
                    submenu: [
                      { role: 'startSpeaking' },
                      { role: 'stopSpeaking' }
                    ]
                  }
                ] : [
                  { role: 'delete' },
                  { type: 'separator' },
                  { role: 'selectAll' }
                ])
              ]
            },
            // // { role: 'viewMenu' }
            // {
            //   label: 'View',
            //   submenu: [
            //     { role: 'reload' },
            //     { role: 'forceReload' },
            //     { role: 'toggleDevTools' },
            //     { type: 'separator' },
            //     { role: 'resetZoom' },
            //     { role: 'zoomIn' },
            //     { role: 'zoomOut' },
            //     { type: 'separator' },
            //     { role: 'togglefullscreen' }
            //   ]
            // },
            // // { role: 'windowMenu' }
            // {
            //   label: 'Window',
            //   submenu: [
            //     { role: 'minimize' },
            //     { role: 'zoom' },
            //     ...(isMac ? [
            //       { type: 'separator' },
            //       { role: 'front' },
            //       { type: 'separator' },
            //       { role: 'window' }
            //     ] : [
            //       { role: 'close' }
            //     ])
            //   ]
            // },
            {
              role: 'help',
              submenu: [
                {
                  label: 'Learn More',
                  click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://electronjs.org')
                  }
                }
              ]
            }
          ]
    }  

    _truncateWithEllipses(text, max){
        return text.substr(0,max-1)+(text.length>max?'...':''); 
    }

    /**
     * Adds new recent entry to recents menu
     * @param {RecentItem} recent 
     */
    addRecent(recent){
        recent.label = this._truncateWithEllipses(`${recent.label} ${recent.fullPath}`, 64);
        this.store.addRecent(recent);
        this.updateMenu();        
    }

    _clearRecents(){
        this.store.purge();
        this.updateMenu();
    }

    updateMenu(){
        const menu = Menu.buildFromTemplate(this.template(this.store.recents()));
        Menu.setApplicationMenu(menu);
    }

    
    /**
     * Generates app menu configuration
     * @param {RecentItem[]} recents to be populated into "Recents" submenu
     * @returns menu configuration
     */
    template(recents){
        const that = this;
        
        const recentMenuItem = this.configuration.find((item)=>item.id == "file").submenu.find((item)=>item.id == "recent");
        recentMenuItem.submenu = [];

        
        recents?.forEach((item)=>{
            recentMenuItem.submenu.push({
                label: item.label,
                click: async () => {
                    const fileContents = await that.fileManager.loadFile(item.fullPath);
                    BrowserWindow.fromId(1).webContents.send('listener_openFile', fileContents);                                        
                    that.addRecent({
                        label: fileContents.fileName,
                        fullPath: fileContents.fullPath,
                        destination: fileContents.destination
                    })
                    
                }
            })
        })        
        
        if(recentMenuItem.submenu.length>0){
            recentMenuItem.submenu.push({ type: 'separator' });    
            recentMenuItem.submenu.push({
                label: "Clear recents",
                click: async () => {
                    that._clearRecents();
                }
            })
        }

        // const mySearchMenuItem = this.configuration.find((item)=>item.id == "edit").submenu.find((item)=>item.id == "mySearch");

            
        return this.configuration;
    }
}

module.exports = AppMenu
