import { ipcMain, app } from 'electron'

/**
 * 设置开机启动
 * @param autoStart
 */
ipcMain.handle('app:openAtLogin', (_event, autoStart) => {
  app.setLoginItemSettings({
    openAtLogin: autoStart,
  })
})
