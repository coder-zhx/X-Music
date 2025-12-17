import { is } from '@electron-toolkit/utils'
import { BrowserWindow, ipcMain, screen } from 'electron'
import Store from 'electron-store'
import { join } from 'path'

const store: any = new Store()

let lyricWindow: BrowserWindow

export function createLyricWindow() {
  lyricWindow = new BrowserWindow({
    width: 1040,
    height: 200,
    minWidth: 1040,
    minHeight: 200,
    transparent: true,
    frame: false,
    fullscreenable: false,
    fullscreen: false,
    minimizable: false,
    alwaysOnTop: true,
    hasShadow: false,
    roundedCorners: false,
    show: false,
    autoHideMenuBar: true,
    skipTaskbar: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: false,
    trafficLightPosition: { x: -100, y: -100 },
    backgroundColor: '#00000000',
    type: process.platform === 'darwin' ? 'panel' : 'dock',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      backgroundThrottling: false,
      webSecurity: false,
      devTools: true,
    },
  })

  lyricWindow.on('ready-to-show', () => {
    const bounds = store.get('lyricWindowBounds')
    if (bounds) {
      lyricWindow.setBounds(bounds)
    } else {
      const primaryDisplay = screen.getPrimaryDisplay()
      const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize

      const [windowWidth, windowHeight] = lyricWindow.getSize()
      const x = Math.round((screenWidth - windowWidth) / 2)
      const y = screenHeight - windowHeight - 100

      lyricWindow.setPosition(x, y)
    }

    lyricWindow.hide()
  })

  lyricWindow.on('show', () => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('lyricWin:show', true)
    })
  })

  lyricWindow.on('hide', () => {
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('lyricWin:show', false)
    })
  })

  lyricWindow.on('close', () => {
    const bounds = lyricWindow.getBounds()
    store.set('lyricWindowBounds', bounds)
    lyricWindow.destroy()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    lyricWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '?win=desk-lyric')
  } else {
    lyricWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      query: {
        win: 'desk-lyric',
      },
    })
  }
}

ipcMain.handle('lyricWin:showLyricWindow', (_event) => {
  if (!lyricWindow || lyricWindow.isDestroyed()) {
    createLyricWindow()
  } else {
    lyricWindow.showInactive()
  }
})

ipcMain.on('lyricWin:hideLyricWindow', () => {
  if (lyricWindow.isDestroyed()) return
  lyricWindow.hide()
})

ipcMain.handle('lyricWin:isLyricWindowShow', (_event) => {
  return lyricWindow && lyricWindow.isVisible()
})

ipcMain.on('lyricWin:set-ignore-mouse-events', (_event, ignore, options) => {
  if (lyricWindow.isDestroyed()) return
  lyricWindow.setIgnoreMouseEvents(ignore, options)
})

ipcMain.on('lyricWin:moveWindow', (_event, deltaX, detalY) => {
  if (lyricWindow.isDestroyed()) return
  const [x, y] = lyricWindow.getPosition()
  lyricWindow.setPosition(x + deltaX, y + detalY)
})
