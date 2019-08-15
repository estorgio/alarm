// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow } = require('electron');
const windowStateKeeper = require('electron-window-state');

let mainWindow;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

function createWindow() {
  const state = windowStateKeeper({
    defaultWidth: 440,
    defaultHeight: 590,
  });

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      devTools: !app.isPackaged,
    },
  });

  mainWindow.loadFile('app/app.html');
  if (!app.isPackaged) mainWindow.webContents.openDevTools();
  state.manage(mainWindow);

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') return;
  app.quit();
});

app.on('activate', () => {
  if (mainWindow !== null) return;
  createWindow();
});

app.on('second-instance', () => {
  if (mainWindow) mainWindow.show();
});
