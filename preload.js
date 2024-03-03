const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {  

  // RENDERER->MAIN
  // one way only, with no response
  // should be accompanied by ipcMain.on() in 
  // the controller file
  // seNotifyAPI: {
  //   doSth: (someData) => ipcRenderer.send("channel", someData)
  // }

  // RENDERER->MAIN with result coming back to RENDERER
  // here we provide a request-response communication between renderer and main with
  // main returning data to renderer as a result of method call
  // methods that handle renderer's calls are in the "controller" file
  seAPI: {
    saveFile: (content, fileFullPath) => ipcRenderer.invoke('seapi_saveFile', content, fileFullPath),
    loadFile: () => ipcRenderer.invoke('seapi_loadFile'),
    editorUIEvent: (eventName, data) => ipcRenderer.invoke('seapi_editorUIEvent', eventName, data),
    closeRemotesWindow: () => ipcRenderer.invoke('seapi_closeRemotesWindow'),
    getRemotes: () => ipcRenderer.invoke('seapi_getRemotes'),
    removeRemote: (fileMetadataSecure) => ipcRenderer.invoke('seapi_removeRemote', fileMetadataSecure)
  },

  // MAIN->RENDERER
  // here we send data to callback functions in renderer/view js from
  // the main process via webContents.send() method
  // these methods are used in the "js" files where renderer process
  // subscribes itself with callback to receive notifications from main process.
  // So somewhere in the main there is a call to webContents.send(),
  // then ipcRenderer reacts to the events and dispatches data to the 
  // listener in the renderer process that is handling data
  // is is important to note that the first argument passed on to callback
  // is the _event object which holds a channel to main process via
  // _event.sender.send() method. As a result when there is a ipcMain.on() accompanying it will be
  // called.
  listenerAPI: {
    onNewFile: (callback) => ipcRenderer.on('listener_newFile', callback),    
    onSaveFile: (callback) => ipcRenderer.on('listener_saveFile', callback),
    onSaveFileSuccess: (callback) => ipcRenderer.on('listener_saveFile_success', callback),
    onOpenFile: (callback) => ipcRenderer.on('listener_openFile', callback),
    onSearch: (callback) => ipcRenderer.on('listener_search', callback)
    
  }
})

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type])
    }
  })
  