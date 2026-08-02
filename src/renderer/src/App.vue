<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useAppStore } from './stores/app'
import { useUserStore } from './stores/user'
import { localStorageHelper } from '@renderer/common/utils/storage-helper'
import storeService from '@renderer/service/storeService'
import playService from '@renderer/service/playService'
import lyricService from '@renderer/service/lyricService'
import appService from '@renderer/service/appService'
import { onMounted, watch } from 'vue'
import { subscribeError } from './common/utils/http'
import logService from './service/logService'
import useModal from '@renderer/hooks/useModal'

const appStore = useAppStore()
const userStore = useUserStore()

const Modal = useModal()

playService.appStore = appStore
lyricService.appStore = appStore

const locale = zhCN

subscribeError((error) => {
  switch (error.status) {
    case 301:
      userStore.isLogin = false
      break
    case 401:
      if (error.config.url.includes('https://music.gdstudio.org/api.php')) {
        showPlayErrorModal()
      }
      break
  }
})

init()

watch(
  () => appStore.systemConfig,
  () => {
    storeService.set('systemConfig', appStore.systemConfig)
  },
  { deep: true },
)

watch(
  () => appStore.isDark,
  (value) => {
    document.body.classList.toggle('dark', value)
    appService.isDark.value = value
    localStorageHelper.setItem('isDark', value)
  },
  { immediate: true },
)

async function init() {
  appStore.isDark = !!localStorageHelper.getItem('isDark')
  const systemConfig: any = await storeService.get('systemConfig')
  appStore.systemConfig = {
    ...appStore.systemConfig,
    ...systemConfig,
  }
  if (appStore.systemConfig.deskLyric) {
    await lyricService.showLyricWindow(true)
  }
  lyricService.init()
}

function showPlayErrorModal() {
  const modal = Modal.create({
    title: '播放错误',
    content:
      '无法获取音乐资源，请等待软件修复，您可检查是否有版本更新，或者在github上提issue反馈问题',
    footer: [
      {
        text: '取消',
        type: 'default',
        onClick: () => {
          modal.close()
        },
      },
      {
        text: '去反馈',
        type: 'default',
        onClick: () => {
          window.open('https://github.com/coder-zhx/X-Music')
        },
      },
      {
        text: '查看github',
        type: 'default',
        onClick: () => {
          window.open('https://github.com/coder-zhx/X-Music/releases')
        },
      },
      {
        text: '查看网盘',
        type: 'default',
        onClick: () => {
          window.open('https://pan.quark.cn/s/072af8782c97?entry=webother#/list/share')
        },
      },
    ],
  })
}

onMounted(() => {
  logService.log('init')
})
</script>

<template>
  <a-config-provider :locale="locale">
    <div class="title-bar"></div>
    <div class="router-view">
      <router-view />
    </div>
  </a-config-provider>
</template>

<style lang="scss" scoped>
.title-bar {
  height: 30px;
  -webkit-app-region: drag;
}

.router-view {
  height: calc(100% - 30px);
}
</style>
