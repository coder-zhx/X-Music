import { loginCheck, logout } from '@renderer/common/api'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
    profile: null as null | any,
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
      await logout()
      this.checkLogin()
    },
  },
})
