import { ref, toRaw, watch } from 'vue'
import { getSongUrl } from '@renderer/api'
import { localStorageHelper } from '@renderer/utils/storage-helper'
import { Song } from '@renderer/common/types/music'
import { message } from 'ant-design-vue'
import broadcastService from './broadcastService'
import { getExtFromUrl } from '@renderer/utils/common'

const LOOPMODES = ['LISTLOOP', 'SINGLELOOP', 'RANDOM']
class PlayService {
  appStore
  audio = new Audio()
  songList = ref<Song[]>([])
  state = ref({
    isPlaying: false,
    currentTime: 0,
    curSong: null as Song | null,
  })
  loopMode = ref(LOOPMODES[0])

  private _autoNextTimer

  constructor() {
    this._restoreState()
    this._bindListener()
    this._bindShortcutKeys()
    this._watchSongList()
    this._watchState()
    window.addEventListener('beforeunload', () => {
      this._saveState()
    })
  }

  private _restoreState() {
    const songList = localStorageHelper.getItem('playlist')
    const state = localStorageHelper.getItem('playState')
    if (songList && state) {
      this.songList.value = songList
      this.state.value = {
        ...state,
        isPlaying: false,
      }
    }
    const loopMode = localStorageHelper.getItem('loopMode')
    if (loopMode) {
      this.loopMode.value = loopMode
    }
  }

  private _saveState() {
    localStorageHelper.setItem('playlist', this.songList.value)
    localStorageHelper.setItem('playState', this.state.value)
    localStorageHelper.setItem('loopMode', this.loopMode.value)
  }

  private _bindListener() {
    this.audio.addEventListener('play', () => {
      this.state.value.isPlaying = true
    })
    this.audio.addEventListener('pause', () => {
      this.state.value.isPlaying = false
    })
    this.audio.addEventListener('timeupdate', () => {
      this.state.value.currentTime = this.audio.currentTime
    })
    this.audio.addEventListener('ended', () => {
      this.state.value.isPlaying = false
      if (this.loopMode.value === 'SINGLELOOP') {
        this.playSong(this.state.value.curSong)
      } else {
        this.playNext()
      }
    })
    broadcastService.onmessage((event) => {
      if (event.data.type === 'event:playPrev') {
        this.playPrev()
      }
      if (event.data.type === 'event:toggle') {
        this.toggle()
      }
      if (event.data.type === 'event:playNext') {
        this.playNext()
      }
    })
  }

  private _bindShortcutKeys() {
    document.addEventListener('keydown', (e) => {
      const isInputElement =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      if (isInputElement) return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          this.toggle()
          break
        case 'ArrowLeft':
          e.preventDefault()
          this.audio.currentTime -= 5
          break
        case 'ArrowRight':
          e.preventDefault()
          this.audio.currentTime += 5
          break
      }
    })
  }

  private _watchSongList() {
    watch(
      [this.songList, () => this.state.value.curSong],
      () => {
        this._saveState()
      },
      { deep: true },
    )
  }

  private _watchState() {
    watch(
      this.state,
      () => {
        broadcastService.postMessage({
          type: 'data:playState',
          data: toRaw(this.state.value),
        })
      },
      { deep: true },
    )
  }

  private async _cacheSong(songId, br, url) {
    window.electron.ipcRenderer.invoke('file:cacheMp3File', {
      name: `${songId}_${br}.${getExtFromUrl(url)}`,
      url: url,
    })
  }

  private async _getCachedSongUrl(songId, br) {
    return await window.electron.ipcRenderer.invoke('file:getCachedMp3File', `${songId}_${br}`)
  }

  async playSong(song, positon = 0) {
    if (this._autoNextTimer) {
      clearTimeout(this._autoNextTimer)
    }

    this.audio.pause()
    this.audio.currentTime = 0
    if (this.audio.src) {
      this.audio.src = ''
    }
    this.state.value.currentTime = 0
    this.state.value.isPlaying = false

    const songId = song.id
    const curBr = this.appStore.systemConfig.playBr

    const isInPlayList = !!this.songList.value.find((item) => item.id === songId)
    if (!isInPlayList) {
      this.songList.value.push(song)
    }
    this.state.value.curSong = song

    let url = ''
    const cachedUrl = await this._getCachedSongUrl(songId, curBr)
    if (cachedUrl) {
      url = 'file://' + cachedUrl
    } else {
      const res = await getSongUrl(songId, curBr)
      url = res?.url
    }
    if (songId !== this.state.value.curSong!.id) {
      return
    }
    if (!url) {
      const index = this.songList.value.findIndex(
        (item) => item.id === this.state.value.curSong?.id,
      )
      if (
        isInPlayList &&
        this.songList.value.length > 1 &&
        index < this.songList.value.length - 1
      ) {
        message.error('未找到资源，自动播放下一首')
        this._autoNextTimer = setTimeout(() => {
          this.playNext()
        }, 1000)
      } else {
        message.error('未找到资源，试试其它歌曲吧')
      }
      return
    }
    // this.audio = new Audio()
    // this._bindListener()
    this.audio.src = url
    this.audio.play().catch(() => {})
    if (positon > 0) {
      this.audio.currentTime = positon
    }

    if (!cachedUrl) {
      this._cacheSong(songId, curBr, url)
    }
  }

  async playSongs(songs: Song[]) {
    if (this.songList.value === songs) return
    this.songList.value = songs
    this.playSong(songs[0])
  }

  removeSong(song: Song) {
    const _isPlaying = this.state.value.isPlaying
    if (this.state.value.curSong?.id === song.id) {
      if (_isPlaying && this.songList.value.length > 1) {
        this.playNext()
      } else {
        const index = this.songList.value.findIndex((item) => item.id === song.id)
        const nextIndex = index + 1 >= this.songList.value.length ? 0 : index + 1
        const nextSong = nextIndex !== index ? this.songList.value[nextIndex] : null
        this.state.value = {
          curSong: nextSong,
          currentTime: 0,
          isPlaying: false,
        }
        this.audio.removeAttribute('src')
        this.audio.load()
      }
    }
    this.songList.value = this.songList.value.filter((item) => item.id !== song.id)
  }

  pause() {
    this.audio.pause()
  }

  resume() {
    if (this.audio.src) {
      this.audio.play()
    } else if (this.state.value.curSong) {
      const { curSong, currentTime } = this.state.value
      this.playSong(curSong, currentTime)
    }
  }

  seek(to: number) {
    this.audio.currentTime = to
  }

  toggle() {
    if (this.audio.paused) {
      this.resume()
    } else {
      this.pause()
    }
  }

  playNext() {
    const index = this.songList.value.findIndex((item) => item.id === this.state.value.curSong?.id)
    if (this.loopMode.value === 'LISTLOOP' || this.loopMode.value === 'SINGLELOOP') {
      if (index === this.songList.value.length - 1) {
        this.playSong(this.songList.value[0])
      } else {
        this.playSong(this.songList.value[index + 1])
      }
    }
    if (this.loopMode.value === 'RANDOM') {
      let nextIndex = index
      if (this.songList.value.length > 1) {
        const list = this.songList.value.map((_t, i) => i).filter((i) => i !== index)
        nextIndex = list[Math.floor(Math.random() * list.length)]
      }
      this.playSong(this.songList.value[nextIndex])
    }
  }

  playPrev() {
    const index = this.songList.value.findIndex((item) => item.id === this.state.value.curSong?.id)
    if (index === 0) {
      this.playSong(this.songList.value[this.songList.value.length - 1])
    } else {
      this.playSong(this.songList.value[index - 1])
    }
  }

  changeLoopMode() {
    const index = LOOPMODES.findIndex((mode) => mode === this.loopMode.value)
    this.loopMode.value = LOOPMODES[(index + 1) % LOOPMODES.length]
  }

  clear() {
    this.audio.pause()
    this.audio.removeAttribute('src')
    this.audio.load()
    this.songList.value = []
    this.state.value = {
      isPlaying: false,
      curSong: null,
      currentTime: 0,
    }
  }
}

const playService = new PlayService()

export default playService
