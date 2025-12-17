import { PlaylistDetail, Singer, Song } from '@renderer/common/types/music'
import { ref, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import cover1 from '@renderer/assets/img/cover_01.png?inline'
import cover2 from '@renderer/assets/img/cover_02.png?inline'
import cover3 from '@renderer/assets/img/cover_03.png?inline'
import cover4 from '@renderer/assets/img/cover_04.png?inline'
import cover5 from '@renderer/assets/img/cover_05.png?inline'
import cover6 from '@renderer/assets/img/cover_06.png?inline'
import cover7 from '@renderer/assets/img/cover_07.png?inline'

type CustomPlaylist = {
  id: string
  name: string
  cover: string
}

function getRandomCover() {
  const coverList = [cover1, cover2, cover3, cover4, cover5, cover6, cover7]
  return coverList[Math.floor(Math.random() * coverList.length)]
}

class UserDataService {
  // 喜欢的歌曲
  loveSongs = ref<Song[]>([])
  // 喜欢的歌单
  lovePlaylists = ref<PlaylistDetail[]>([])
  // 喜欢的歌手
  loveSingers = ref<Singer[]>([])
  // 自定义歌单
  customPlaylists = ref<CustomPlaylist[]>([
    {
      id: 'my-love-songs',
      name: '我喜欢的歌曲',
      cover: '',
    },
  ])

  constructor() {
    this._init()
  }

  _init() {
    // 读取我喜欢的歌曲
    this.getCustomPlaylistSongs(this.customPlaylists.value[0].id).then((songs) => {
      this.loveSongs.value = songs
    })

    // 读取我收藏的歌单列表
    window.electron.ipcRenderer
      .invoke('file:readUserData', {
        name: `lovePlaylists.json`,
        subPath: 'love',
      })
      .then((res) => {
        try {
          if (!res) return
          const arr = JSON.parse(res)
          if (Array.isArray(arr)) {
            this.lovePlaylists.value = arr
          }
        } catch (_error) {}
      })

    // 读取我收藏的歌手
    window.electron.ipcRenderer
      .invoke('file:readUserData', {
        name: `loveSingers.json`,
        subPath: 'love',
      })
      .then((res) => {
        try {
          if (!res) return
          const arr = JSON.parse(res)
          if (Array.isArray(arr)) {
            this.loveSingers.value = arr
          }
        } catch (_error) {}
      })

    // 读取自定义歌单列表
    window.electron.ipcRenderer
      .invoke('file:readUserData', {
        name: `customPlaylists.json`,
        subPath: 'love',
      })
      .then((res) => {
        try {
          if (!res) return
          const arr = JSON.parse(res)
          if (Array.isArray(arr) && arr[0]?.id === 'my-love-songs') {
            this.customPlaylists.value = arr
          }
        } catch (_error) {}
      })

    // 监听我喜欢的歌单，同步到本地文件
    watch(
      () => this.lovePlaylists.value,
      () => {
        window.electron.ipcRenderer.invoke('file:writeUserData', {
          name: `lovePlaylists.json`,
          subPath: 'love',
          data: JSON.stringify(this.lovePlaylists.value),
        })
      },
    )

    // 监听我喜欢的歌手，同步到本地文件
    watch(
      () => this.loveSingers.value,
      () => {
        window.electron.ipcRenderer.invoke('file:writeUserData', {
          name: `loveSingers.json`,
          subPath: 'love',
          data: JSON.stringify(this.loveSingers.value),
        })
      },
    )

    // 监听自定义歌单列表，同步到本地文件
    watch(
      () => this.customPlaylists.value,
      () => {
        window.electron.ipcRenderer.invoke('file:writeUserData', {
          name: `customPlaylists.json`,
          subPath: 'love',
          data: JSON.stringify(this.customPlaylists.value),
        })
      },
    )
  }

  /**
   * 获取自定义歌曲的歌曲列表
   * @param playlistId 自定义歌单id
   * @returns 歌曲列表
   */
  async getCustomPlaylistSongs(playlistId: string): Promise<Song[]> {
    const playlist = this.customPlaylists.value.find((t) => t.id === playlistId)
    if (!playlist) return []

    const res = await window.electron.ipcRenderer.invoke('file:readUserData', {
      name: `${playlistId}.json`,
      subPath: 'love',
    })
    try {
      if (res) {
        const arr = JSON.parse(res)
        if (Array.isArray(arr)) {
          return arr
        }
      }
    } catch (_error) {}
    return []
  }

  /**
   * 创建自定义歌单
   * @param name 歌单名称
   */
  async createCustomPlaylist(name: string) {
    const id = uuidv4()
    if (this.customPlaylists.value.some((t) => t.id === id)) return
    this.customPlaylists.value.push({
      id,
      name,
      cover: getRandomCover(),
    })
    this.customPlaylists.value = [...this.customPlaylists.value]
  }

  /**
   * 编辑自定义歌单
   * @param name 歌单名称
   */
  async updateCustomPlaylist(id: string, name: string) {
    const index = this.customPlaylists.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      this.customPlaylists.value[index].name = name
      this.customPlaylists.value = [...this.customPlaylists.value]
    }
  }

  /**
   * 删除自定义歌单
   * @param name 歌单名称
   */
  async deleteCustomPlaylist(playlistId: string) {
    if (playlistId === 'my-love-songs') return
    this.customPlaylists.value = this.customPlaylists.value.filter((t) => t.id !== playlistId)
    window.electron.ipcRenderer.invoke('file:deleteUserData', {
      name: `${playlistId}.json`,
      subPath: 'love',
    })
  }

  /**
   * 将歌曲添加到自定义歌单
   * @param playlistId 自定义歌单id
   * @param song 歌曲
   */
  async addToCustomPlaylist(playlistId: string, song: Song) {
    const playlist = this.customPlaylists.value.find((t) => t.id === playlistId)
    if (!playlist) return
    const songs = await this.getCustomPlaylistSongs(playlistId)
    if (songs.some((t) => t.id === song.id)) {
      return
    }
    songs.unshift(song)
    if (playlistId === 'my-love-songs') {
      this.loveSongs.value = songs
    }
    window.electron.ipcRenderer.invoke('file:writeUserData', {
      name: `${playlistId}.json`,
      subPath: 'love',
      data: JSON.stringify(songs),
    })
    this._updateCustomPlaylistCover(playlistId)
  }

  /**
   * 从自定义歌单中删除某首歌曲
   * @param playlistId 自定义歌单id
   * @param song 歌曲
   */
  async removeFromCustomPlaylist(playlistId: string, song: Song) {
    const playlist = this.customPlaylists.value.find((t) => t.id === playlistId)
    if (!playlist) return
    let songs = await this.getCustomPlaylistSongs(playlistId)
    songs = songs.filter((t) => t.id !== song.id)
    if (playlistId === 'my-love-songs') {
      this.loveSongs.value = songs
    }
    window.electron.ipcRenderer.invoke('file:writeUserData', {
      name: `${playlistId}.json`,
      subPath: 'love',
      data: JSON.stringify(songs),
    })
    this._updateCustomPlaylistCover(playlistId)
  }

  /**
   * 更新自定义歌单封面
   * @param playlistId 自定义歌单id
   */
  async _updateCustomPlaylistCover(playlistId: string) {
    const playlist = this.customPlaylists.value.find((t) => t.id === playlistId)
    if (!playlist) return
    const songs = await this.getCustomPlaylistSongs(playlistId)
    if (playlistId === 'my-love-songs') {
      playlist.cover = songs[0]?.al?.picUrl
    } else {
      playlist.cover = songs[0]?.al?.picUrl || getRandomCover()
    }
    this.customPlaylists.value = [...this.customPlaylists.value]
  }

  /**
   * 将歌曲设置成喜欢
   * @param song 歌曲
   */
  loveSong(song: Song) {
    if (this.loveSongs.value.some((item) => item.id === song.id)) return
    this.loveSongs.value.unshift(song)
    this.loveSongs.value = [...this.loveSongs.value]
    this.addToCustomPlaylist(this.customPlaylists.value[0].id, song)
  }

  /**
   * 将歌曲取消喜欢
   * @param song 歌曲
   */
  unloveSong(song: Song) {
    this.loveSongs.value = this.loveSongs.value.filter((item) => item.id !== song.id)
    this.removeFromCustomPlaylist(this.customPlaylists.value[0].id, song)
  }

  /**
   * 将歌手添加到收藏
   * @param singer 歌手
   */
  loveSinger(singer: Singer) {
    if (this.loveSingers.value.some((item) => item.id === singer.id)) return
    const _singer = {
      ...singer,
      songList: [],
    }
    this.loveSingers.value.unshift(_singer)
    this.loveSingers.value = [...this.loveSingers.value]
  }

  /**
   * 将歌手取消收藏
   * @param singer 歌手
   */
  unloveSinger(singer: Singer) {
    this.loveSingers.value = this.loveSingers.value.filter((item) => item.id !== singer.id)
  }

  /**
   * 将歌单添加到收藏
   * @param playlist 歌单
   */
  lovePlaylist(playlist: PlaylistDetail) {
    if (this.lovePlaylists.value.some((item) => item.id === playlist.id)) return
    const _playlist = {
      ...playlist,
      tracks: [],
      trackIds: [],
    }
    this.lovePlaylists.value.push(_playlist)
    this.lovePlaylists.value = [...this.lovePlaylists.value]
  }

  /**
   * 将歌单取消收藏
   * @param playlist 歌单
   */
  unlovePlaylist(playlist: PlaylistDetail) {
    this.lovePlaylists.value = this.lovePlaylists.value.filter((item) => item.id !== playlist.id)
  }
}

const userDataService = new UserDataService()

export default userDataService
