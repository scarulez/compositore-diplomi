const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('diplomi', {
  pickFile: (filters) => ipcRenderer.invoke('pick-file', filters),
  pickFolder: () => ipcRenderer.invoke('pick-folder'),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (defaultPath, base64) => ipcRenderer.invoke('save-file', defaultPath, base64),
  getSystemFonts: () => ipcRenderer.invoke('get-system-fonts'),
  saveImages: (folder, images) => ipcRenderer.invoke('save-images', folder, images)
});
