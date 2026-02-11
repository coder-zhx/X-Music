import {
  getLikeSongIdList,
  getMylikePlaylist,
  getMylikeSingerlist,
  loginCheck,
  logout,
} from '@renderer/common/api'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
    profile: null as null | any,
    selfPlaylist: [] as any[],
    likePlaylist: [] as any[],
    likeSingerlist: [] as any[],
    likeSongIdList: [] as any[],
  }),
  actions: {
    async checkLogin() {
      const res = await loginCheck()
      if (res.data?.profile) {
        this.isLogin = true
        this.profile = res.data.profile
      } else {
        this.isLogin = false
        this.profile = null
      }
    },
    async logout() {
      const res = await logout()
      if (res.code === 200) {
        this.isLogin = false
        this.profile = null
        localStorage.removeItem('cookie')
      }
    },
    /**
     * 获取用户的歌单
     */
    async getUserPlaylist() {
      if (!this.isLogin) return
      const result = await getMylikePlaylist(this.profile.userId)
      this.selfPlaylist = result
        .filter((t) => t.creator.userId === this.profile.userId)
        .map((t) => {
          t.cover = t.coverImgUrl
          return t
        })
      this.likePlaylist = result.filter((t) => t.creator.userId !== this.profile.userId)
    },
    /**
     * 获取用户收藏的歌手
     */
    async getUserSingerList() {
      if (!this.isLogin) return
      const result = await getMylikeSingerlist()
      this.likeSingerlist = result.map((t) => {
        t.cover = t.picUrl
        return t
      })
    },
    /**
     * 获取用户喜欢的歌曲id列表
     */
    async getUserLikeSongIdList() {
      if (!this.isLogin) return
      this.likeSongIdList = await getLikeSongIdList(this.profile.userId)
    },
  },
})
