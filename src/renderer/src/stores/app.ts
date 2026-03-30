import { getRecommendData } from '@renderer/common/api'
import { defineStore } from 'pinia'
import { Playlist, Singer, Toplist } from '@renderer/common/types/music'
import { useUserStore } from './user'

export const useAppStore = defineStore('app', {
  state: () => ({
    isDark: false,
    recommondData: {
      recommendPlaylist: [] as Playlist[],
      recommendSinger: [] as Singer[],
      recommendToplist: [] as Toplist[],
    },
    defaultLyricColor: '#00ff42',
    defaultLyricBgColor: '#a0a0a0',
    systemConfig: {
      autoStart: false,
      autoPlay: false,
      playBr: 320,
      downloadBr: 320,
      maxCache: 1,
      fileNameFormat: 2,
      downloadLyric: false,
      downloadPath: '',
      deskLyric: true,
      lyricMode: 1,
      ambientBar: true,
      lyricColor: '#00ff42',
      lyricBgColor: '#a0a0a0',
    },
  }),
  actions: {
    toggleDark() {
      this.isDark = !this.isDark
    },
    async getRecommendData() {
      const userStore = useUserStore()
      this.recommondData = await getRecommendData({
        isLogin: userStore.isLogin,
      })
    },
  },
})
