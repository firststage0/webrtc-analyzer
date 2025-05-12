const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Включаем логирование
const log = require('electron-log');
log.transports.file.level = 'debug';
log.info('App starting...');

function createWindow() {
  try {
    log.info('Creating main window...');
    
    // Создаем окно браузера
    const mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false, // Скрываем окно до полной загрузки
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webSecurity: true,
        allowRunningInsecureContent: false,
        enableRemoteModule: false
      }
    });

    // Загружаем index.html
    const startUrl = isDev 
      ? 'http://localhost:3001' 
      : `file://${path.join(__dirname, '../dist/webrtc-analyzer/browser/index.html')}`;
    
    log.info('Loading URL:', startUrl);

    // Показываем окно только после полной загрузки
    mainWindow.once('ready-to-show', () => {
      log.info('Window ready to show');
      mainWindow.show();
    });

    mainWindow.loadURL(startUrl);

    // Открываем DevTools в режиме разработки
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    // Обработка ошибок загрузки
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error('Failed to load:', errorCode, errorDescription);
      dialog.showErrorBox('Ошибка загрузки', 
        `Не удалось загрузить приложение: ${errorDescription}\nКод ошибки: ${errorCode}`);
      
      if (isDev) {
        mainWindow.loadURL('http://localhost:3001');
      }
    });

    // Логируем успешную загрузку
    mainWindow.webContents.on('did-finish-load', () => {
      log.info('Window loaded successfully');
    });

    mainWindow.on('closed', () => {
      log.info('Window closed');
    });

  } catch (error) {
    log.error('Error creating window:', error);
    dialog.showErrorBox('Ошибка', 
      `Не удалось создать окно приложения: ${error.message}`);
  }
}

// Обработка ошибок приложения
app.on('window-all-closed', () => {
  log.info('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  log.info('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Обработка ошибок
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
  dialog.showErrorBox('Критическая ошибка', 
    `Произошла непредвиденная ошибка: ${error.message}`);
});

// Инициализация приложения
app.whenReady().then(() => {
  log.info('App ready');
  createWindow();
}).catch(error => {
  log.error('Error during app initialization:', error);
  dialog.showErrorBox('Ошибка инициализации', 
    `Не удалось инициализировать приложение: ${error.message}`);
}); 