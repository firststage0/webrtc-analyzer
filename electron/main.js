const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Включаем логирование
const log = require('electron-log');
log.transports.file.level = 'debug';
log.info('App starting...');

let mainWindow = null;

function createWindow() {
  try {
    log.info('Creating main window...');
    
    // Создаем окно браузера
    mainWindow = new BrowserWindow({
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

    // Определяем правильный путь к index.html
    let startUrl;
    if (isDev) {
      startUrl = 'http://localhost:3001';
    } else {
      // В production режиме используем правильный путь к файлам в app.asar
      const appPath = app.getAppPath();
      log.info('App path:', appPath);
      startUrl = `file://${path.join(appPath, 'dist', 'webrtc-analyzer', 'index.html')}`;
    }
    
    log.info('Loading URL:', startUrl);

    // Показываем окно только после полной загрузки
    mainWindow.once('ready-to-show', () => {
      log.info('Window ready to show');
      mainWindow.show();
    });

    // Обработка обновления страницы
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.key.toLowerCase() === 'r') {
        event.preventDefault();
        log.info('Manual reload requested');
        
        // Очищаем кэш перед перезагрузкой
        mainWindow.webContents.session.clearCache().then(() => {
          log.info('Cache cleared');
          mainWindow.loadURL(startUrl);
        });
      }
    });

    mainWindow.loadURL(startUrl);

    // Открываем DevTools в режиме разработки
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    // Обработка ошибок загрузки
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error('Failed to load:', errorCode, errorDescription);
      log.error('Attempted URL:', startUrl);
      log.error('Current directory:', app.getAppPath());
      
      // Специальная обработка для ошибки -6 (ERR_FILE_NOT_FOUND)
      if (errorCode === -6) {
        log.error('File not found error detected');
        if (isDev) {
          log.info('Attempting to reload development server');
          mainWindow.loadURL('http://localhost:3001');
        } else {
          // В production режиме пробуем перезагрузить из правильного пути
          log.info('Attempting to reload from:', startUrl);
          mainWindow.loadURL(startUrl);
        }
        return;
      }
      
      dialog.showErrorBox('Ошибка загрузки', 
        `Не удалось загрузить приложение: ${errorDescription}\nКод ошибки: ${errorCode}\nПроверьте логи для подробностей.`);
    });

    // Добавляем обработчик для успешной загрузки
    mainWindow.webContents.on('did-finish-load', () => {
      log.info('Window loaded successfully');
      log.info('Current URL:', mainWindow.webContents.getURL());
    });

    // Добавляем обработчик для ошибок рендеринга
    mainWindow.webContents.on('render-process-gone', (event, details) => {
      log.error('Render process gone:', details);
      dialog.showErrorBox('Ошибка рендеринга', 
        `Процесс рендеринга завершился: ${details.reason}\nКод: ${details.exitCode}`);
    });

    mainWindow.on('closed', () => {
      log.info('Window closed');
      mainWindow = null;
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
  if (mainWindow === null) {
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