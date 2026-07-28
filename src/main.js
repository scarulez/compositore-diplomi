const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { execFile } = require('child_process');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 940, minWidth: 1120, minHeight: 720,
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: false }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('pick-file', async (_event, filters) => {
  const r = await dialog.showOpenDialog({ properties: ['openFile'], filters });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('pick-folder', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle('read-file', async (_event, filePath) => fs.readFile(filePath));
ipcMain.handle('save-file', async (_event, defaultPath, base64) => {
  const r = await dialog.showSaveDialog({ defaultPath, filters: [{ name: 'File di esempio', extensions: ['csv', 'xlsx'] }] });
  if (r.canceled || !r.filePath) return null;
  await fs.writeFile(r.filePath, Buffer.from(base64, 'base64'));
  return r.filePath;
});
ipcMain.handle('get-system-fonts', async () => {
  if (process.platform !== 'win32') return [];
  const query = (key) => new Promise((resolve) => execFile('reg', ['query', key], { windowsHide: true, maxBuffer: 1024 * 1024 }, (error, stdout) => {
    if (error) return resolve([]);
    resolve([...stdout.matchAll(/^\s{4}(.+?)\s+REG_\w+\s+/gm)].map(m => m[1]));
  }));
  const lists = await Promise.all([query('HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts'), query('HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts')]);
  return [...new Set(lists.flat().map(name => name.replace(/\s*\((?:TrueType|OpenType)\)$/i, '').replace(/\s+(?:Bold|Italic|Regular|Light|Medium|Semibold|Black)(?:\s+(?:Italic|Oblique))?$/i, '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
});
ipcMain.handle('save-images', async (_event, folder, images) => {
  await fs.mkdir(folder, { recursive: true });
  const used = new Set();
  const safeName = (name, index) => {
    let base = String(name || `diploma_${index + 1}`).replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').trim() || `diploma_${index + 1}`;
    let candidate = base, n = 2;
    while (used.has(candidate.toLowerCase())) candidate = `${base}_${n++}`;
    used.add(candidate.toLowerCase());
    return `${candidate}.png`;
  };
  for (let i = 0; i < images.length; i++) {
    const payload = images[i].dataUrl.replace(/^data:image\/png;base64,/, '');
    await fs.writeFile(path.join(folder, safeName(images[i].name, i)), Buffer.from(payload, 'base64'));
  }
  return images.length;
});
