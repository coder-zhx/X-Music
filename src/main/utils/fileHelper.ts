import { app, ipcMain, dialog } from 'electron'
import fs from 'fs'
import path from 'path'
import Store from 'electron-store'

const store = new Store()

// mp3文件缓存路径
const mp3CachePath = path.resolve(app.getPath('userData'), 'userCache/mp3Cache')
// 用户数据存储路径
const userDataPath = path.resolve(app.getPath('userData'), 'userData')

ipcMain.handle('file:getPath', async (_event, name) => {
  return app.getPath(name)
})

// 存储数据
ipcMain.handle('store:set', async (_event, key, value) => {
  return store.set(key, value)
})

// 读取数据
ipcMain.handle('store:get', async (_event, key) => {
  return store.get(key)
})

// 选择目录
ipcMain.handle('file:selectDirectory', async (_event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// 缓存mp3文件
ipcMain.handle('file:cacheMp3File', async (_event, data) => {
  const response = await fetch(data.url)
  if (response.ok) {
    const buffer = Buffer.from(await response.arrayBuffer())
    const dirPath = mp3CachePath
    fs.mkdirSync(dirPath, { recursive: true })
    fs.writeFileSync(path.resolve(dirPath, data.name), buffer)
  }
  checkCacheFolderFull()
})

// 获取缓存的mp3文件
ipcMain.handle('file:getCachedMp3File', async (_event, name) => {
  fs.mkdirSync(mp3CachePath, { recursive: true })
  const files = fs.readdirSync(mp3CachePath)
  const file = files.find((file) => file.includes(name))
  if (file) {
    return path.resolve(mp3CachePath, file)
  }
  return null
})

// 清除歌曲缓存
ipcMain.handle('file:clearMP3Cache', async (_event) => {
  try {
    return await fs.rmdirSync(mp3CachePath, { recursive: true })
  } catch (error) {
    console.log(error)
  }
})

// 读取用户数据
ipcMain.handle('file:readUserData', async (_event, data) => {
  const dirPath = path.resolve(userDataPath, data.subPath)
  fs.mkdirSync(dirPath, { recursive: true })
  try {
    return fs.readFileSync(path.resolve(dirPath, data.name), { encoding: 'utf-8' })
  } catch (_error) {
    return ''
  }
})

// 写入用户数据
ipcMain.handle('file:writeUserData', async (_event, data) => {
  const dirPath = path.resolve(userDataPath, data.subPath)
  fs.mkdirSync(dirPath, { recursive: true })
  return fs.writeFileSync(path.resolve(dirPath, data.name), data.data)
})

// 删除用户数据
ipcMain.handle('file:deleteUserData', async (_event, data) => {
  const dirPath = path.resolve(userDataPath, data.subPath)
  fs.mkdirSync(dirPath, { recursive: true })
  try {
    fs.unlinkSync(path.resolve(dirPath, data.name))
  } catch (_error) {}
})

/**
 * 检查缓存文件夹是否已满
 */
export function checkCacheFolderFull() {
  let totalSize = 0
  let list: any[] = []
  const calculateSize = (currentPath) => {
    const stats = fs.statSync(currentPath)

    if (stats.isFile()) {
      totalSize += stats.size
      list.push({
        path: currentPath,
        stats: stats,
      })
    } else if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath)
      files.forEach((file) => {
        calculateSize(path.join(currentPath, file))
      })
    }
  }
  calculateSize(mp3CachePath)
  // 将文件按创建时间排序
  const files = list.sort((a, b) => a.stats.birthtimeMs - b.stats.birthtimeMs).map((t) => t.path)

  const systemConfig: any = store.get('systemConfig')
  const maxCache = systemConfig.maxCache || 1 // 1G

  // 缓存超过设置的最大缓存时，删除一半文件
  if (totalSize > maxCache * 1024 * 1024 * 1024) {
    for (let i = 0; i < files.length / 2; i++) {
      fs.unlinkSync(files[i])
    }
  }
}
