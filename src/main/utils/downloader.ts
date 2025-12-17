import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import Store from 'electron-store'

const store = new Store()

// 文件下载路径
const fileDownloadPath = app.getPath('downloads')

export default class Downloader {
  win!: BrowserWindow
  taskMap = new Map()
  downloadItemMap = new Map<string, Electron.DownloadItem>()

  constructor(win: BrowserWindow) {
    this.win = win
    this.init()
  }

  init() {
    // 监听webContents下载事件
    this.win.webContents.session.on('will-download', (_event, item) => {
      // 通过url找到下载任务信息
      const url = item.getURL()
      let task
      this.taskMap.forEach((value, key) => {
        if (value.url === url) {
          task = value
          // 找到后删除
          this.taskMap.delete(key)
        }
      })
      if (!task) {
        item.cancel()
        return
      }

      const { uuid, name } = task
      // 将downloadItem保存起来，方便后续操作
      this.downloadItemMap.set(uuid, item)

      const systemConfig: any = store.get('systemConfig')
      const fileName = path.join(
        systemConfig?.downloadPath || fileDownloadPath,
        name.replaceAll('/', '／'),
      )
      // 先存到临时文件中
      const tempName = fileName + '.temp'
      item.setSavePath(tempName)

      item.on('updated', (_event, state) => {
        if (state === 'interrupted') {
          this.sendToRenderer('downloader:pause', uuid)
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            this.sendToRenderer('downloader:pause', uuid)
          } else {
            this.sendToRenderer('downloader:progress', uuid, {
              total: item.getTotalBytes(),
              loaded: item.getReceivedBytes(),
              progress: item.getPercentComplete(),
            })
          }
        }
      })
      item.on('done', (_event, state) => {
        if (state === 'completed') {
          // 下载完成再改名
          fs.renameSync(tempName, fileName)
          this.downloadItemMap.delete(uuid)
          this.sendToRenderer('downloader:success', uuid, {
            path: fileName,
          })
        } else {
          if (state === 'cancelled') {
            this.sendToRenderer('downloader:pause', uuid)
          } else {
            this.sendToRenderer('downloader:error', uuid)
          }
        }
      })
    })

    // 下载
    ipcMain.handle('downloader:download', async (_event, data) => {
      const { uuid, url } = data
      this.taskMap.set(uuid, data)
      this.win.webContents.downloadURL(url)
    })

    // 暂停下载
    ipcMain.handle('downloader:pause', async (_event, uuid) => {
      this.pause(uuid)
    })

    // 全部暂停
    ipcMain.handle('downloader:pauseAll', async (_event, uuids) => {
      uuids.forEach((uuid) => {
        this.pause(uuid)
      })
    })
  }

  pause(uuid) {
    this.taskMap.delete(uuid)
    const item = this.downloadItemMap.get(uuid)
    if (!item) return
    item.cancel()
    this.downloadItemMap.delete(uuid)
  }

  sendToRenderer(event: string, ...args: any[]) {
    if (this.win && !this.win.isDestroyed()) {
      this.win.webContents.send(event, ...args)
    }
  }
}
