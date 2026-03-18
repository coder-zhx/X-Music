import { getLyric } from '@renderer/common/api'
import playService from '@renderer/service/playService'
import { ref, toRaw, watch } from 'vue'
import broadcastService from './broadcastService'
import { LineLyric, Song, YrcLyric } from '@renderer/common/types/music'

class LyricService {
  appStore
  state = ref({
    song: null as Song | null,
    lyric: [] as Array<LineLyric>,
    yrcLyric: [] as Array<YrcLyric>,
    currentLineIndex: -1,
    currentLine: '',
    currentTime: 0,
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
          song: toRaw(playService.state.value.curSong),
          lyric: [],
          yrcLyric: [],
          currentLineIndex: -1,
          currentLine: '',
          currentTime: 0,
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
    const lyric = this._parseLyric(res.lrc?.lyric)
    const yrcLyric = this._parseYrcLyric(res.yrc?.lyric)

    this.state.value = {
      ...toRaw(this.state.value),
      lyric,
      yrcLyric,
      currentLineIndex: -1,
      currentLine: '',
      currentTime: 0,
    }
  }

  private _getCurrentLine() {
    const lyric = this.state.value.yrcLyric?.length
      ? this.state.value.yrcLyric
      : this.state.value.lyric
    if (!lyric.length) return
    const currentTime = playService.state.value.currentTime * 1000
    this.state.value.currentLineIndex = lyric.findLastIndex((line) => line.time <= currentTime)
    this.state.value.currentLine = lyric[this.state.value.currentLineIndex]?.text
    this.state.value.currentTime = playService.state.value.currentTime
  }

  /**
   * 解析行歌词
   */
  private _parseLyric(lyric: string) {
    if (!lyric) return []
    const arr = lyric
      .split('\n')
      .map((line) => {
        if (!line) return null
        const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)$/)!
        if (match && match[3]) {
          return {
            time: (parseFloat(match[1]) * 60 + parseFloat(match[2])) * 1000,
            text: match[3].trim(),
          }
        }
        return null
      })
      .filter((t) => !!t)
    return arr
  }

  /**
   * 解析逐字歌词
   */
  private _parseYrcLyric(lyric: string) {
    if (!lyric) return []
    const arr: any[] = []
    lyric.split('\n').forEach((line) => {
      if (line.startsWith('{')) return

      const timeMatch = line.match(/\[(\d+),(\d+)\]/)
      if (!timeMatch) return
      const time = parseInt(timeMatch[1])
      const duration = parseInt(timeMatch[2])

      const wordPattern = /\((\d+),(\d+),\d+\)(.)/g
      const words: any[] = []
      let match
      while ((match = wordPattern.exec(line)) !== null) {
        words.push({
          time: parseInt(match[1]),
          duration: parseInt(match[2]),
          text: match[3],
        })
      }
      arr.push({
        time,
        text: words.map((t) => t.text).join(''),
        duration,
        words,
      })
    })
    return arr
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
