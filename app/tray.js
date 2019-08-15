// eslint-disable-next-line import/no-extraneous-dependencies
const { remote } = require('electron');

const { app, Tray, Menu } = remote;

(async () => {
  const currentWindow = remote.getCurrentWindow();
  const icon = await app.getFileIcon(app.getPath('exe'), { size: 'large' });
  const tray = new Tray(icon);
  tray.setToolTip(`Alarm v${app.getVersion()}`);

  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Exit Alarm',
      click: () => currentWindow.destroy(),
    },
  ]);
  tray.setContextMenu(trayMenu);

  tray.on('double-click', () => {
    if (currentWindow.isVisible()) {
      currentWindow.hide();
    } else {
      currentWindow.show();
    }
  });
})();
