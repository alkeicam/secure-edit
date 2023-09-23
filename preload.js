const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  bOrganizations: () => ipcRenderer.invoke('db:organizations'),
  bOrganization: (organizationId) => ipcRenderer.invoke('db:organization', organizationId),
  bUsers: (organizationId) => ipcRenderer.invoke('db:users', organizationId),
  bUser: (organizationId, userId) => ipcRenderer.invoke('db:user', organizationId, userId),
  bOrganizationStructure: (organizationId) => ipcRenderer.invoke('db:organizationStructure', organizationId),
  bOrganizationTypes: (organizationId) => ipcRenderer.invoke('db:organizationTypes', organizationId),
  bUserPermissions: (organizationId, userId) => ipcRenderer.invoke('db:userPermissions', organizationId, userId),
  bType: (organizationId, typeId) => ipcRenderer.invoke('db:type', organizationId, typeId),

  bProcessMappings: (organizationId) => ipcRenderer.invoke('db:processMappings',organizationId),
  bProcess: (organizationId, code) => ipcRenderer.invoke('db:process', organizationId, code),
  bPutProcess: (organizationId, code, item) => ipcRenderer.invoke('db:putProcess', organizationId, code, item),
  
  bPutDiagram: (organizationId, code, diagramJsonString) => ipcRenderer.invoke('db:putDiagram',organizationId, code, diagramJsonString),
  bDiagram: (organizationId, code) => ipcRenderer.invoke('db:diagram',organizationId, code),

  bPutStatus: (organizationId, code, item) => ipcRenderer.invoke('db:putStatus', organizationId, code, item), 
  bPutTransition: (organizationId, code, item) => ipcRenderer.invoke('db:putTransition', organizationId, code, item), 
  bPutAction: (organizationId, code, item) => ipcRenderer.invoke('db:putAction', organizationId, code, item),
  bPutTransitionAction: (organizationId, item) => ipcRenderer.invoke('db:putTransitionAction', organizationId, item),

  seAPI: {
    saveFile: (content, fileFullPath) => ipcRenderer.invoke('seapi_saveFile', content, fileFullPath),
    loadFile: () => ipcRenderer.invoke('seapi_loadFile'),
    editorUIEvent: (eventName, data) => ipcRenderer.invoke('seapi_editorUIEvent', eventName, data)
  },
  // here we send data to callback functions in renderer/view js 
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
  