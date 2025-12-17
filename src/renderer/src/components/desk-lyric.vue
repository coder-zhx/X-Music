<script setup lang="ts">
import broadcastService from '@renderer/service/broadcastService'
import storeService from '@renderer/service/storeService'
import { onMounted, ref, watch } from 'vue'

const isLock = ref(true)

const lyricState = ref({
  lyric: [] as Array<{ time: number; text: string }>,
  currentLineIndex: 0,
  currentLine: '',
})
const playState = ref({
  isPlaying: false,
})
const lyricColor = ref('#00ff42')

watch(
  isLock,
  () => {
    if (isLock.value) {
      // 忽略鼠标事件
      window.electron.ipcRenderer.send('lyricWin:set-ignore-mouse-events', isLock.value, {
        forward: true,
      })
    } else {
      window.electron.ipcRenderer.send('lyricWin:set-ignore-mouse-events', false)
    }
  },
  { immediate: true },
)

// 通过广播接收歌词数据播放状态
broadcastService.onmessage((event) => {
  if (event.data.type === 'data:lyricData') {
    lyricState.value = event.data.data
  }
  if (event.data.type === 'data:playState') {
    playState.value = event.data.data
  }
  if (event.data.type === 'event:unlockLyricWin') {
    isLock.value = false
  }
  if (event.data.type === 'event:lyricColorChange') {
    loadSystemConfig()
  }
})

loadSystemConfig()

// 通过广播发送播放控制事件
function sendToMain(event) {
  broadcastService.postMessage({ type: event })
}

onMounted(() => {
  document.body.classList.add('lyric-win')
})

let lastPostion
function onMouseDown(e) {
  lastPostion = { screenX: e.screenX, screenY: e.screenY }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseUp() {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

// 让窗口跟随鼠标移动
function onMouseMove(e) {
  if (isLock.value) return
  const deltaX = e.screenX - lastPostion.screenX
  const detalY = e.screenY - lastPostion.screenY
  lastPostion = { screenX: e.screenX, screenY: e.screenY }
  window.electron.ipcRenderer.send('lyricWin:moveWindow', deltaX, detalY)
}

// 进入解锁按钮时，禁用鼠标事件忽略，以便能够响应点击事件
function onEnterBtn() {
  window.electron.ipcRenderer.send('lyricWin:set-ignore-mouse-events', false)
}

// 离开解锁按钮时，恢复鼠标事件忽略
function onLeaveBtn() {
  if (isLock.value) {
    window.electron.ipcRenderer.send('lyricWin:set-ignore-mouse-events', true, { forward: true })
  }
}

function close() {
  window.electron.ipcRenderer.send('lyricWin:hideLyricWindow')
}

async function loadSystemConfig() {
  const systemConfig: any = await storeService.get('systemConfig')
  lyricColor.value = systemConfig.lyricColor
}
</script>

<template>
  <div class="desk-lyric" :class="{ isLock }" @mousedown="onMouseDown" @mouseup="onMouseUp">
    <div class="top">
      <div class="left"></div>
      <div class="center">
        <a @click="sendToMain('event:playPrev')">
          <Iconfont name="icon-prev"></Iconfont>
        </a>
        <a class="play" @click="sendToMain('event:toggle')">
          <Iconfont :name="playState.isPlaying ? 'icon-pause' : 'icon-play'"></Iconfont>
        </a>
        <a @click="sendToMain('event:playNext')">
          <Iconfont name="icon-next"></Iconfont>
        </a>
      </div>
      <div class="right">
        <a class="lock" @click="isLock = !isLock" @mouseenter="onEnterBtn" @mouseleave="onLeaveBtn">
          <Iconfont :name="isLock ? 'icon-lock' : 'icon-unlock'"></Iconfont>
        </a>
        <a class="close" @click="close">
          <Iconfont name="icon-close"></Iconfont>
        </a>
      </div>
    </div>
    <div class="lyric-box" :style="{ color: lyricColor }">
      <div class="line">{{ lyricState?.currentLine }}</div>
    </div>
  </div>
</template>

<style lang="scss">
body.lyric-win {
  background: transparent;
}
</style>

<style lang="scss" scoped>
.desk-lyric {
  width: 100%;
  height: 100%;
  background: transparent;
  color: #fff;
  transition-duration: 0.5s !important;
  transition-property: background-color, color;

  &:not(.isLock):hover {
    background: #000000aa;
  }

  .top {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;

    .left {
      flex: 1;
    }

    .center {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }

    .right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: right;
      gap: 20px;
    }

    a {
      display: inline-flex;
      font-size: 30px;
    }

    .play {
      background: #ffffff55;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drag {
      -webkit-app-region: drag;
      cursor: move;
    }
  }

  &.isLock {
    .center,
    .close,
    .lock {
      visibility: hidden;
    }
  }

  &:hover {
    .lock {
      visibility: visible !important;
    }
  }

  .lyric-box {
    font-size: 30px;
    padding: 20px 40px;
    line-height: 1.5;
    text-align: center;
  }
}
</style>
