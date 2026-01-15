<script setup lang="ts">
import ControlBar from '@renderer/components/control-bar.vue'
import { useAppStore } from '@renderer/stores/app'
import { useUserStore } from '@renderer/stores/user'
import { HalfCircleSpinner } from 'epic-spinners'
import playService from '@renderer/service/playService'
import { computed, onMounted, ref } from 'vue'
import pageAlive from '@renderer/components/page-alive.vue'

const appStore = useAppStore()
const userStore = useUserStore()
const loading = ref(false)

const showFooter = computed(() => {
  return playService.state.value.curSong !== null
})

loadData()
async function loadData() {
  loading.value = true
  await userStore.checkLogin()
  await appStore.getRecommendData()
  loading.value = false
}

onMounted(() => {
  // 启动应用自动播放歌曲
  if (appStore.systemConfig.autoPlay && playService.state.value.curSong) {
    playService.resume()
  }
})
</script>

<template>
  <div v-if="loading" class="loading">
    <half-circle-spinner :animation-duration="1000" :size="40" color="#ff1d5e" />
  </div>
  <div v-else class="main" :style="{ 'padding-bottom': showFooter ? '100px' : '0' }">
    <ul class="nav">
      <li>
        <router-link to="/home">
          <Iconfont name="icon-home"></Iconfont>
        </router-link>
      </li>
      <li>
        <router-link to="/my-love">
          <Iconfont name="icon-heart-fill"></Iconfont>
        </router-link>
      </li>
    </ul>
    <ul class="nav bottom-nav" :style="{ bottom: showFooter ? '135px' : '35px' }">
      <li>
        <a @click="appStore.toggleDark()">
          <Iconfont :name="appStore.isDark ? 'icon-sun' : 'icon-moon'"></Iconfont>
        </a>
      </li>
      <li>
        <router-link to="/setting">
          <Iconfont name="icon-setting"></Iconfont>
        </router-link>
      </li>
    </ul>
    <div class="page-wrap">
      <page-alive></page-alive>
    </div>
    <div class="footer" v-if="showFooter">
      <ControlBar></ControlBar>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main {
  position: relative;
  height: 100%;
  padding-left: 100px;

  .nav {
    position: fixed;
    left: 35px;
    top: 30%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    color: $nav;

    .iconfont {
      font-size: 30px;
      cursor: pointer;
    }

    .router-link-active .iconfont {
      color: $primary;
    }
  }

  .bottom-nav {
    top: unset;
    bottom: 40px;
  }

  .page-wrap {
    height: 100%;
  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
  }
}
</style>

<style lang="scss">
#app.gradient-bg {
  .main > .nav {
    color: #fff;
  }
}
</style>
