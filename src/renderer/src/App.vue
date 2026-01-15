<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useAppStore } from './stores/app'
import { localStorageHelper } from '@renderer/common/utils/storage-helper'
import storeService from '@renderer/service/storeService'
import playService from '@renderer/service/playService'
import lyricService from '@renderer/service/lyricService'
import appService from '@renderer/service/appService'
import { watch } from 'vue'

const appStore = useAppStore()
playService.appStore = appStore
lyricService.appStore = appStore

const locale = zhCN

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
