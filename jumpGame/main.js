const { app, BrowserWindow } = require('electron');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 360,
    height: 576,
    webPreferences: {
      nodeIntegration: true, // Allow node.js features if necessary
    },
  });

  win.loadFile('index.html'); // Load your index.html
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
