import { getSongUrl } from '@renderer/api'
import { message } from 'ant-design-vue'
import { ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { localStorageHelper } from '@renderer/utils/storage-helper'
import { getExtFromUrl } from '@renderer/utils/common'

export interface DownloadTask {
  type: 'song' | 'mv'
  id: number
  name: string
  extra?: any
  br?: number
}

class Task {
  uuid: string
  type: 'song' | 'mv'
  id: number
  name: string
  fileName: string
  status: 'waiting' | 'downloading' | 'paused' | 'done' | 'error'
  url?: string
  progressInfo?: {
    loaded: number
    total: number
    progress: number
  }
  path?: string
  extra?: any
  br?: number

  constructor(task: DownloadTask) {
    this.uuid = uuidv4()
    this.type = task.type
    this.name = task.name
    this.fileName = task.name
    this.id = task.id
    this.status = 'waiting'
    this.extra = task.extra
    this.br = task.br
  }

  async start() {
    this.status = 'downloading'
    const url = await this._getDownloadUrl()
    if (!url) {
      message.error('未找到资源')
      this.status = 'error'
      return
    }
    this.url = url
    if (this.status === 'downloading') {
      window.electron.ipcRenderer.invoke('downloader:download', {
        uuid: this.uuid,
        name: `${this.fileName}.${getExtFromUrl(this.url)}`,
        url: this.url,
      })
    }
  }

  async pause() {
    this.status = 'paused'
    window.electron.ipcRenderer.invoke('downloader:pause', this.uuid)
  }

  private async _getDownloadUrl() {
    if (this.type === 'song') {
      const res = await getSongUrl(this.id, this.br || 320)
      return res?.url || ''
    }
  }
}

class DownloadService {
  paused = ref(false)
  taskList = ref<Task[]>([])
  taskListHistory = ref<Task[]>([])

  // 能同时运行下载任务数量
  private maxRunningTask = 3

  constructor() {
    this.taskList.value = (localStorageHelper.getItem('downloadTaskList') || []).map((t) => {
      return new Task(t)
    })
    this.taskListHistory.value = localStorageHelper.getItem('downloadTaskListHistory') || []
    this._initListener()
    this._watchTaskList()
    this._watchHistoryTaskList()
  }

  private _initListener() {
    window.electron.ipcRenderer.on('downloader:progress', (_event, uuid, progressEvent) => {
      const task = this.taskList.value.find((t) => t.uuid === uuid)
      if (!task) return
      task.status = 'downloading'
      task.progressInfo = progressEvent
      this.taskList.value = [...this.taskList.value]
    })
    window.electron.ipcRenderer.on('downloader:pause', (_event, uuid) => {
      const task = this.taskList.value.find((t) => t.uuid === uuid)
      if (!task) return
      task.status = 'paused'
      this.taskList.value = [...this.taskList.value]
    })
    window.electron.ipcRenderer.on('downloader:success', (_event, uuid, fileInfo) => {
      const task = this.taskList.value.find((t) => t.uuid === uuid)
      if (!task) return
      task.status = 'done'
      task.path = fileInfo.path
      this.taskList.value = this.taskList.value.filter((t) => t.uuid !== uuid)
      this.taskListHistory.value = [...this.taskListHistory.value, task]
    })
    window.electron.ipcRenderer.on('downloader:error', (_event, uuid) => {
      const task = this.taskList.value.find((t) => t.uuid === uuid)
      if (!task) return
      task.status = 'error'
      this.taskList.value = [...this.taskList.value]
    })
  }

  private _watchTaskList() {
    watch(
      this.taskList,
      () => {
        if (!this.paused.value) {
          this.start()
        }
      },
      { deep: true },
    )
    watch(this.taskList, () => {
      localStorageHelper.setItem('downloadTaskList', this.taskList.value)
    })
  }

  private _watchHistoryTaskList() {
    watch(this.taskListHistory, () => {
      localStorageHelper.setItem('downloadTaskListHistory', this.taskListHistory.value)
    })
  }

  addTask(taskInfo: DownloadTask) {
    if (this.taskList.value.some((task) => task.id === taskInfo.id)) return
    const task = new Task(taskInfo)
    this.taskList.value = [...this.taskList.value, task]
  }

  removeTask(uuid: string) {
    const task = this.taskList.value.find((task) => task.uuid === uuid)
    if (!task) return
    if (task.status === 'downloading') {
      task.pause()
    }
    this.taskList.value = this.taskList.value.filter((task) => task.uuid !== uuid)
  }

  start() {
    this.paused.value = false
    const downloadingList = this.taskList.value.filter((task) => task.status === 'downloading')
    const waitingList = this.taskList.value.filter((task) => task.status === 'waiting')
    if (downloadingList.length < this.maxRunningTask && waitingList.length > 0) {
      waitingList.slice(0, this.maxRunningTask - downloadingList.length).map((task) => {
        task.start()
      })
    }
  }

  startAll() {
    this.paused.value = false
    const downloadingList = this.taskList.value.filter((task) => task.status === 'downloading')
    const waitingList = this.taskList.value.filter((task) => task.status !== 'downloading')
    if (downloadingList.length < this.maxRunningTask && waitingList.length > 0) {
      waitingList.slice(0, this.maxRunningTask - downloadingList.length).map((task) => {
        task.start()
      })
    }
  }

  removeAll() {
    this.pause()
    this.taskList.value = []
  }

  pause() {
    this.paused.value = true
    this.taskList.value
      .filter((t) => t.status === 'downloading')
      .map((task) => {
        task.pause()
      })
  }

  removeHistoryRecord(uuid: string) {
    this.taskListHistory.value = this.taskListHistory.value.filter((record) => record.uuid !== uuid)
  }

  clearHistory() {
    this.taskListHistory.value = []
  }
}

const downloadService = new DownloadService()
export default downloadService
