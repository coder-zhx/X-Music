import { getRecommendData } from '@renderer/api'
import { defineStore } from 'pinia'
import { Playlist, Singer, Toplist } from '@renderer/common/types/music'

export const useAppStore = defineStore('app', {
  state: () => ({
    isDark: false,
    recommondData: {
      recommendPlaylist: [] as Playlist[],
      recommendSinger: [] as Singer[],
      recommendToplist: [] as Toplist[],
    },
    defaultLyricColor: '#00ff42',
    systemConfig: {
      autoStart: false,
      autoPlay: false,
      playBr: 320,
      downloadBr: 320,
      maxCache: 1,
      fileNameFormat: 2,
      downloadPath: '',
      deskLyric: true,
      ambientBar: true,
      lyricColor: '#00ff42',
    },
  }),
  actions: {
    toggleDark() {
      this.isDark = !this.isDark
    },
    async getRecommendData() {
      this.recommondData = await getRecommendData()
    },
  },
})
