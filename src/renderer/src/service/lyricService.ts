import { getLyric } from '@renderer/common/api'
import playService from '@renderer/service/playService'
import { ref, toRaw, watch } from 'vue'
import broadcastService from './broadcastService'

class LyricService {
  appStore
  state = ref({
    lyric: [] as Array<{ time: number; text: string }>,
    currentLineIndex: 0,
    currentLine: '',
  })
  // 桌面歌词
  deskLyricVisible = ref(false)

  async init() {
    watch(this.deskLyricVisible, (show) => {
      this.appStore.systemConfig.deskLyric = show
    })
    watch(
      () => playService.state.value.curSong,
      () => {
        this.state.value = {
          lyric: [],
          currentLineIndex: 0,
          currentLine: '',
        }
        this._getLyric()
      },
      {
        immediate: true,
      },
    )
    watch([() => playService.state.value.currentTime, this.state], () => {
      this._getCurrentLine()
    })
    watch(
      this.state,
      () => {
        this._sendDataToLyricWindow()
      },
      { deep: true },
    )
    // 监听桌面歌词窗口的开关
    window.electron.ipcRenderer.on('lyricWin:show', (_event, show) => {
      this.deskLyricVisible.value = show
      if (show) {
        this._sendDataToLyricWindow()
      }
    })
    // 探测桌面歌词窗口是否打开
    this._detectLyricWindow()
  }

  private async _getLyric() {
    const song = playService.state.value.curSong
    if (!song) {
      return
    }
    const res = await getLyric(song.id)
    if (!res) return
    this._parseLyric(res.lrc.lyric)
  }

  private _getCurrentLine() {
    const lyric = this.state.value.lyric
    if (!lyric.length) return
    const currentTime = playService.state.value.currentTime
    this.state.value.currentLineIndex = lyric.findLastIndex((line) => line.time <= currentTime)
    this.state.value.currentLine = lyric[this.state.value.currentLineIndex]?.text
  }

  private _parseLyric(lyric: string) {
    if (!lyric) return
    const arr = lyric
      .split('\n')
      .map((line) => {
        if (!line) return null
        const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)$/)!
        if (match && match[3]) {
          return {
            time: parseFloat(match[1]) * 60 + parseFloat(match[2]),
            text: match[3].trim(),
          }
        }
        return null
      })
      .filter((t) => !!t)
    this.state.value = {
      lyric: arr,
      currentLineIndex: 0,
      currentLine: '',
    }
  }

  private _sendDataToLyricWindow() {
    const data = {
      type: 'data:lyricData',
      data: toRaw(this.state.value),
    }
    broadcastService.postMessage(data)
  }

  private async _detectLyricWindow() {
    this.deskLyricVisible.value = await window.electron.ipcRenderer.invoke(
      'lyricWin:isLyricWindowShow',
    )
  }

  async showLyricWindow(show: boolean) {
    if (show) {
      await window.electron.ipcRenderer.invoke('lyricWin:showLyricWindow')
    } else {
      await window.electron.ipcRenderer.send('lyricWin:hideLyricWindow')
    }
  }
}

const lyricService = new LyricService()

export default lyricService
