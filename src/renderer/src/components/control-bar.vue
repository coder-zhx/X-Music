<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MarqueeText from './marquee-text.vue'
import AmbientBar from './ambient-bar.vue'
import LoveBtn from './love-btn.vue'
import playService from '@renderer/service/playService'
import lyricService from '@renderer/service/lyricService'
import PlayList from './play-list.vue'
import Player from './player/index.vue'
import appService from '@renderer/service/appService'
import broadcastService from '@renderer/service/broadcastService'
import { useAppStore } from '@renderer/stores/app'
import { SongBrOptions } from '@renderer/common/consts/common'
import { adjustColorBrightness, getImgColors } from '@renderer/utils/color'

const appStore = useAppStore()

const playState = playService.state
const lyricState = lyricService.state

const playProgress = ref(0)
const seeking = ref(false)
const playlistPanelVisible = ref(false)
const playerVisible = ref(false)
const controlBarVisible = ref(true)
const coverColor = ref<number[]>([75, 75, 75])

const style = computed(() => {
  let bg = ''
  if (playerVisible.value) {
    bg = `rgba(${coverColor.value.join(', ')}, 1)`
  } else if (
    !appService.isDark.value &&
    appService.appBgVisible.value &&
    appService.appBgImgMainColor.value.length
  ) {
    const color = adjustColorBrightness(appService.appBgImgMainColor.value, -0.1)
    bg = `rgba(${color.join(', ')}, 1)`
  }
  if (!bg) return null
  return {
    background: bg,
  }
})
const loopIcon = computed(() => {
  switch (playService.loopMode.value) {
    case 'LISTLOOP':
      return 'icon-loop'
    case 'SINGLELOOP':
      return 'icon-repeat'
    case 'RANDOM':
      return 'icon-random'
  }
  return ''
})
const playBr = computed(() => {
  return SongBrOptions.find((t) => t.value === appStore.systemConfig.playBr)?.label || '其他'
})
const ambientBarVisible = computed(() => {
  return appStore.isDark && appStore.systemConfig.ambientBar
})

watch(
  () => playState.value.currentTime,
  () => {
    if (!seeking.value) {
      playProgress.value = playState.value.currentTime
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => playState.value.curSong,
  async () => {
    if (playState.value.curSong) {
      const imgUrl = playState.value.curSong?.al?.picUrl
      if (imgUrl) {
        const colors = await getImgColors(imgUrl + '?param=300y300')
        coverColor.value = colors ? adjustColorBrightness(colors[0], -0.6) : [75, 75, 75]
      }
    }
  },
  {
    immediate: true,
  },
)

function seek() {
  seeking.value = true
}
function seeked(v) {
  seeking.value = false
  playService.seek(v)
}

let timer
function onMousemove() {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    controlBarVisible.value = !playerVisible.value
  }, 10 * 1000)
}

function showControlBar() {
  controlBarVisible.value = true
  onMousemove()
}

async function showDeskLyric() {
  if (lyricService.deskLyricVisible.value) {
    await lyricService.showLyricWindow(false)
  } else {
    await lyricService.showLyricWindow(true)
    broadcastService.postMessage({ type: 'event:unlockLyricWin' })
  }
}
</script>

<template>
  <Transition name="player">
    <Player
      v-if="playerVisible"
      :isFull="!controlBarVisible"
      :coverColor="coverColor"
      @mousemove="onMousemove"
      @click="showControlBar"
      @close="playerVisible = false"
    >
    </Player>
  </Transition>
  <div class="control-bar-wrapper" :class="{ hide: !controlBarVisible }">
    <AmbientBar v-if="ambientBarVisible"></AmbientBar>
    <div class="bg" @mousemove="onMousemove" @click="showControlBar">
      <div class="control-bar flex-y-center" :style="style" :class="{ 'has-bg': style }">
        <div class="left flex-y-center flex-1">
          <div
            class="disk rotate"
            :class="{ pause: !playState.isPlaying }"
            @click="playerVisible = !playerVisible"
          >
            <img
              v-if="playState.curSong"
              :src="playState.curSong?.al?.picUrl + '?param=300y300'"
              alt=""
            />
          </div>
          <div v-if="playState.curSong" class="song-info">
            <div class="song ellipsis">
              <span class="song-name">{{ playState.curSong.name }}</span>
              <span class="singer">
                -
                <template v-for="(artist, index) in playState.curSong.ar" :key="index">
                  <span>{{ artist.name }} </span>
                  <i v-if="index !== playState.curSong.ar.length - 1">/</i>
                </template>
              </span>
            </div>
            <MarqueeText class="lyric">{{ lyricState.currentLine }}</MarqueeText>
          </div>
        </div>
        <div class="center flex-1">
          <div class="btns">
            <LoveBtn :song="playState.curSong"></LoveBtn>
            <a @click="playService.playPrev">
              <Iconfont name="icon-prev"></Iconfont>
            </a>
            <a class="play" @click="playService.toggle">
              <Iconfont v-if="playState.isPlaying" name="icon-pause"></Iconfont>
              <Iconfont v-else name="icon-play"></Iconfont>
            </a>
            <a @click="playService.playNext">
              <Iconfont name="icon-next"></Iconfont>
            </a>
            <a @click="playService.changeLoopMode">
              <Iconfont :name="loopIcon"></Iconfont>
            </a>
          </div>
          <div class="progress">
            <span>{{ $duration(playProgress * 1000) }}</span>
            <Slider
              v-model:value="playProgress"
              :tip-formatter="null"
              :min="0"
              :max="(playState.curSong?.dt || 0) / 1000"
              @change="seek"
              @after-change="seeked"
            />
            <span>{{ $duration(playState.curSong?.dt || 0) }}</span>
          </div>
        </div>
        <div class="right flex-1">
          <div class="btns">
            <a-popover>
              <template #content>
                <div class="br-pop">
                  <a-radio-group v-model:value="appStore.systemConfig.playBr">
                    <a-radio v-for="item in SongBrOptions" :value="item.value" :key="item.value">
                      {{ item.label }}
                    </a-radio>
                  </a-radio-group>
                </div>
              </template>
              <a class="br">{{ playBr }}</a>
            </a-popover>
            <a
              @click="showDeskLyric"
              class="lyric-btn"
              :class="{ open: lyricService.deskLyricVisible.value }"
            >
              词
            </a>
            <a class="ml-auto" @click="playlistPanelVisible = true">
              <Iconfont name="icon-play-list"></Iconfont>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <PlayList v-model:show="playlistPanelVisible"></PlayList>
</template>

<style lang="scss" scoped>
.control-bar-wrapper {
  position: relative;
  z-index: 200;
  transition: all 0.3s ease;
  position: relative;

  &.hide {
    transform: translateY(100%);
  }

  .bg {
    background: #000;
    position: relative;
    z-index: 300;
  }

  .control-bar {
    width: 100%;
    height: 100px;
    padding: 10px 20px;
    user-select: none;
    gap: 20px;
    background-color: $background;
    transition-duration: 0.5s !important;
    transition-property: background-color, color;

    &.has-bg {
      div,
      span,
      a {
        color: #ffffff !important;
      }

      .lyric-btn:not(.open) {
        color: #adadad !important;
      }
    }

    .left {
      flex-shrink: 0;
      overflow: hidden;

      .disk {
        width: 60px;
        height: 60px;
        background: #000;
        border-radius: 50%;
        background-image: url(@renderer/assets/img/disk.png);
        background-size: 100% 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 10px;
        flex-shrink: 0;
        cursor: pointer;

        img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }
      }

      .rotate {
        animation-duration: 10s;
      }

      .song-info {
        flex: 1;
        overflow: hidden;

        .song {
          min-height: 18px;
          color: $text;
        }

        .lyric {
          margin-top: 4px;
          min-height: 18px;
          color: $text-light;
        }
      }
    }

    .center {
      flex-shrink: 0;

      .btns {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        font-size: 30px;

        a {
          padding: 5px;
          border-radius: 50%;
          color: $text;
          display: inline-flex;

          &:hover {
            background-color: $btn-hover;
          }
        }

        .play {
          background-color: $primary;
          color: #ffffff;

          &:hover {
            background-color: $primary-light;
          }
        }
      }

      .progress {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 10px;
        margin-top: 10px;

        .slider {
          flex: 1;
        }

        & > span {
          width: 28px;
        }
      }
    }

    .right {
      flex-shrink: 0;

      .btns {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        font-size: 24px;
        padding-left: 40px;

        a {
          display: inline-flex;
          padding: 10px;
          border-radius: 50%;
          color: $text;

          &:hover {
            background-color: $btn-hover;
          }
        }

        .br {
          font-size: 12px;
          color: $text-light;
          border-radius: 4px;
          padding: 2px 4px;
          border: 1px solid currentColor;
        }

        .lyric-btn {
          color: $text-light;
          font-size: 20px;

          &.open {
            color: $text;
          }
        }
      }
    }
  }
}

.br-pop {
  :deep() {
    .ant-radio-wrapper {
      display: flex;
      margin: 0;

      & + .ant-radio-wrapper {
        margin-top: 10px;
      }

      &-checked {
        color: $primary;
      }

      .ant-radio {
        display: none;
      }
    }
  }
}

.player-enter-active,
.player-leave-active {
  transition: all 0.3s ease-in-out;
}

.player-enter-from,
.player-leave-to {
  transform: translateY(100%);
}
</style>
