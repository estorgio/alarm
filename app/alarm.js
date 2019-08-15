// eslint-disable-next-line import/no-extraneous-dependencies
const { remote } = require('electron');
const { Howl } = require('howler');

const { BrowserWindow } = remote;
let alarmWindow = null;

const beep = new Howl({
  src: 'assets/beep.mp3',
  autoplay: false,
  loop: true,
  volume: 0.05,
});

function show(list) {
  alarmWindow = new BrowserWindow({
    // parent: remote.getCurrentWindow(),
    height: 300,
    width: 400,
    maximizable: false,
    minimizable: false,
    fullscreen: false,
    fullscreenable: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  alarmWindow.loadFile('app/alarm.html');
  // alarmWindow.webContents.openDevTools();

  alarmWindow.webContents.executeJavaScript(
    `loadAlarmList(${JSON.stringify(list)})`,
  );

  beep.play();

  alarmWindow.on('closed', () => {
    beep.stop();
    alarmWindow = null;
  });
}

module.exports = {
  show,
};
