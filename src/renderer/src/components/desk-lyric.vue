<script setup lang="ts">
import { LyricMode } from '@renderer/common/enums/common'
import { YrcLyric, LineLyric, Song } from '@renderer/common/types/music'
import { localStorageHelper } from '@renderer/common/utils/storage-helper'
import broadcastService from '@renderer/service/broadcastService'
import storeService from '@renderer/service/storeService'
import { computed, onMounted, ref, watch } from 'vue'

const isLock = ref(true)

const lyricState = ref({
  song: null as Song | null,
  lyric: [] as Array<{ time: number; text: string }>,
  yrcLyric: [] as Array<{ time: number; text: string }>,
  currentLineIndex: -1,
  currentLine: '',
  currentTime: 0,
})
const hasYrcLyric = computed(() => {
  return lyricState.value.yrcLyric?.length > 0
})
const lyricList = computed<YrcLyric[] | LineLyric[]>(() => {
  return hasYrcLyric.value ? lyricState.value.yrcLyric : lyricState.value.lyric
})

const playState = ref({
  isPlaying: false,
})
const lyricColor = ref('#00ff42')
const lyricBgColor = ref('#a0a0a0')
const lyricMode = ref(LyricMode.single)
const lyricFontSize = ref(30)

const lineStyle = computed(() => {
  const curTime = lyricState.value.currentTime * 1000
  const line = lyricList.value[lyricState.value.currentLineIndex] as YrcLyric
  let percent = 0
  for (let i = 0; i < line.words?.length; i++) {
    const word = line.words[i]
    if (curTime >= word.time && curTime < word.time + word.duration) {
      percent = ((i + (curTime - word.time) / word.duration) / line.words.length) * 100
      break
    }
    if (i === line.words.length - 1 && curTime >= word.time + word.duration) {
      percent = 100
    }
  }
  return {
    backgroundImage: `linear-gradient(to right, ${lyricColor.value} ${percent}%, ${lyricBgColor.value} 0%)`,
    color: 'transparent',
    backgroundClip: 'text',
    transition: `background-image 0.1s linear`,
  }
})

const songName = computed(() => {
  const song = lyricState.value.song
  if (!song) return ''
  return `${song.name} - ${song.ar.map((t) => t.name).join('/')}`
})

const showName = computed(() => {
  return (
    !lyricList.value.length ||
    lyricState.value.currentTime * 1000 < Math.min(lyricList.value[0]?.time, 2000)
  )
})

const firstLine = computed(() => {
  if (lyricState.value.currentLineIndex === -1) {
    return lyricList.value[0]?.text || ''
  }
  if (lyricState.value.currentLineIndex % 2 === 0) {
    return lyricList.value[lyricState.value.currentLineIndex]?.text
  } else {
    return lyricList.value[lyricState.value.currentLineIndex + 1]?.text
  }
})

const secondLine = computed(() => {
  if (lyricState.value.currentLineIndex === -1) {
    return lyricList.value[1]?.text || ''
  }
  if (lyricState.value.currentLineIndex % 2 === 1) {
    return lyricList.value[lyricState.value.currentLineIndex]?.text
  } else {
    return lyricList.value[lyricState.value.currentLineIndex + 1]?.text
  }
})

const defaultStyle = computed(() => {
  return { color: `${lyricBgColor.value}` }
})

const activeStyle = computed(() => {
  return hasYrcLyric.value ? lineStyle.value : { color: lyricColor.value }
})

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
  if (event.data.type === 'event:lyricConfigChange') {
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
  lyricFontSize.value = localStorageHelper.getItem('lyricFontSize') || 30
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

function adjustFontSize(delta) {
  lyricFontSize.value = Math.max(20, lyricFontSize.value + delta)
  lyricFontSize.value = Math.min(50, lyricFontSize.value + delta)
  localStorageHelper.setItem('lyricFontSize', lyricFontSize.value)
}

async function loadSystemConfig() {
  const systemConfig: any = await storeService.get('systemConfig')
  lyricColor.value = systemConfig.lyricColor
  lyricBgColor.value = systemConfig.lyricBgColor
  lyricMode.value = systemConfig.lyricMode
}
</script>

<template>
  <div class="desk-lyric" :class="{ isLock }" @mousedown="onMouseDown" @mouseup="onMouseUp">
    <div class="top">
      <div class="left">
        <a @click="adjustFontSize(1)">
          <Iconfont name="icon-zihao-add"></Iconfont>
        </a>
        <a @click="adjustFontSize(-1)">
          <Iconfont name="icon-zihao-sub"></Iconfont>
        </a>
      </div>
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
        <a class="lock" @click="isLock = !isLock">
          <Iconfont name="icon-lock"></Iconfont>
        </a>
        <a class="close" @click="close">
          <Iconfont name="icon-close"></Iconfont>
        </a>
      </div>
      <a class="unlock" @click="isLock = !isLock" @mouseenter="onEnterBtn" @mouseleave="onLeaveBtn">
        <Iconfont name="icon-unlock"></Iconfont>
      </a>
    </div>
    <div
      class="song-name"
      v-if="showName"
      :style="{ color: lyricColor, fontSize: lyricFontSize + 'px' }"
    >
      {{ songName }}
    </div>
    <template v-else>
      <div
        class="lyric-box"
        :style="{ color: lyricColor, fontSize: lyricFontSize + 'px' }"
        v-if="lyricMode === LyricMode.single"
      >
        <div class="line">
          <span :style="hasYrcLyric && lineStyle">{{ lyricState?.currentLine }}</span>
        </div>
      </div>
      <div
        class="lyric-box-two-line"
        :style="{ fontSize: lyricFontSize + 'px' }"
        v-if="lyricMode === LyricMode.double"
      >
        <div class="first-line ellipsis">
          <span :style="lyricState.currentLineIndex % 2 === 0 ? activeStyle : defaultStyle">
            {{ firstLine }}
          </span>
        </div>
        <div class="second-line ellipsis">
          <span :style="lyricState.currentLineIndex % 2 === 1 ? activeStyle : defaultStyle">
            {{ secondLine }}
          </span>
        </div>
      </div>
    </template>
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
    height: 80px;

    .left {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 20px;
    }

    .center {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      font-size: 30px;
    }

    .right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: right;
      gap: 20px;
      font-size: 20px;
    }

    a {
      display: inline-flex;
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

    .unlock {
      display: none;
      font-size: 24px;
    }
  }

  &.isLock {
    .left,
    .center,
    .right {
      display: none;
    }

    &:hover {
      .unlock {
        display: block;
      }
    }
  }

  .song-name {
    padding: 20px;
    text-align: center;
  }

  .lyric-box {
    font-size: 30px;
    padding: 20px;
    line-height: 1.5;
    text-align: center;
  }

  .lyric-box-two-line {
    font-size: 30px;
    color: rgb(162, 162, 162);
    padding: 0 20px;

    .first-line {
      text-align: left;
    }

    .second-line {
      text-align: right;
      margin-top: 10px;
    }
  }
}
</style>
