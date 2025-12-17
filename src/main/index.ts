import { app, shell, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import './utils/fileHelper'
import './utils/shellHelper'
import './utils/appHelper'
import { createLyricWindow } from './utils/lyricWindow'
import Downloader from './utils/downloader'
import startApiServer from './utils/apiServer'

let mainWindow: BrowserWindow
let preventQuit = true
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1056,
    height: 752,
    minWidth: 1056,
    minHeight: 752,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false,
      webSecurity: false,
      devTools: true,
    },
    // remove the default titlebar
    titleBarStyle: 'hidden',
    // expose window controls in Windows/Linux
    ...(process.platform !== 'darwin'
      ? {
          titleBarOverlay: {
            color: '#ffffff00',
          },
        }
      : {}),
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('close', (e) => {
    if (preventQuit && process.platform !== 'linux') {
      e.preventDefault()
      if (process.platform === 'darwin') {
        if (mainWindow.isFullScreen()) {
          mainWindow.setFullScreen(false)
          mainWindow.once('leave-full-screen', () => {
            mainWindow.hide()
          })
        } else {
          mainWindow.hide()
        }
      } else {
        mainWindow.hide()
      }
    }
  })

  mainWindow.on('closed', () => {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (win.id !== mainWindow.id) {
        win.close()
      }
    })
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

let tray: Tray
function createTray(): void {
  const icon = nativeImage.createFromPath(join(app.getAppPath(), 'resources/tray-icon.ico'))
  tray = new Tray(icon)
  tray.setToolTip('X Music')

  tray.on('click', () => {
    mainWindow.show()
  })

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示',
      click: () => {
        mainWindow.show()
      },
    },
    {
      label: '退出',
      click: () => {
        preventQuit = false
        app.quit()
      },
    },
  ])

  tray.setContextMenu(contextMenu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  await startApiServer()
  createWindow()
  createLyricWindow()
  if (process.platform === 'win32') {
    createTray()
  }

  new Downloader(mainWindow)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
    }
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  app.on('before-quit', () => {
    preventQuit = false
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// 关闭安全策略
app.commandLine.appendSwitch('disable-web-security')
