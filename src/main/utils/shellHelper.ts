import { ipcMain, shell } from 'electron'
import path from 'path'
import fs from 'fs'

ipcMain.handle('shell:showItemInFolder', (_event, filePath) => {
  if (fs.existsSync(filePath)) {
    shell.showItemInFolder(filePath)
  } else {
    shell.openPath(path.dirname(filePath))
  }
})
