<script setup lang="ts">
import { computed, onMounted, PropType, ref, watch } from 'vue'
import playService from '@renderer/service/playService'
import lyricService from '@renderer/service/lyricService'
import RealPlayer from './real-player.vue'
import FloatComment from './float-comment.vue'

const props = defineProps({
  isFull: {
    type: Boolean,
    default: false,
  },
  coverColor: {
    type: Array as PropType<number[]>,
    default: () => [75, 75, 75],
  },
})

const emit = defineEmits(['close'])

const playState = playService.state
const lyricState = lyricService.state

const modeList = ['player', 'disk', 'simple', 'hidden']
const playerMode = ref(modeList[0])

const style = computed(() => {
  return {
    background: `linear-gradient(to bottom, rgba(${props.coverColor.join(', ')}, 0.7), rgba(${props.coverColor.join(', ')}, 1) )`,
  }
})

watch(
  () => lyricState.value.currentLineIndex,
  () => {
    scrollToCurLine()
  },
)

onMounted(() => {
  playerMode.value = localStorage.getItem('playerMode') || modeList[0]
  scrollToCurLine('instant')
})

function scrollToCurLine(behavior: ScrollBehavior = 'smooth') {
  const el = document.querySelectorAll('.lyric-line')[lyricState.value.currentLineIndex]
  if (el) {
    el.scrollIntoView({
      behavior,
      block: 'center',
    })
  }
}

function toggleMode() {
  const index = modeList.findIndex((mode) => mode === playerMode.value)
  playerMode.value = modeList[(index + 1) % modeList.length]
  localStorage.setItem('playerMode', playerMode.value)
}

function close() {
  emit('close')
}
</script>

<template>
  <div class="player-wrapper">
    <div class="mask" :style="style"></div>
    <div class="top-op" v-if="!isFull">
      <Iconfont name="icon-arrow-down" title="收起" @click="close"></Iconfont>
      <Iconfont name="icon-random" title="切换样式" @click="toggleMode"></Iconfont>
    </div>
    <div class="content">
      <div class="left" v-if="playerMode !== 'hidden'">
        <div class="player simple-mode" v-if="playerMode === 'simple'">
          <img :src="playState.curSong?.al?.picUrl + '?param=300y300'" alt="" />
        </div>
        <div class="player disk-mode" v-if="playerMode === 'disk'">
          <div
            class="disk rotate"
            :class="{ pause: !playState.isPlaying }"
            :style="{ '--c': `rgba(${coverColor.join(', ')}, 0.6)` }"
          >
            <img :src="playState.curSong?.al?.picUrl + '?param=300y300'" alt="" />
          </div>
          <div class="needle" :class="{ playing: playState.isPlaying }"></div>
        </div>
        <div class="player player-mode" v-if="playerMode === 'player'">
          <RealPlayer></RealPlayer>
        </div>
      </div>
      <div class="right" v-if="playState.curSong">
        <div class="header">
          <div class="song-name">{{ playState.curSong.name }}</div>
          <div class="song-info">
            <span>
              <template v-for="(artist, index) in playState.curSong.ar" :key="index">
                <span>{{ artist.name }} </span>
                <i v-if="index !== playState.curSong.ar.length - 1">/</i>
              </template>
            </span>
          </div>
        </div>
        <div class="lyric">
          <div
            v-for="(line, index) in lyricState.lyric"
            :key="index"
            class="lyric-line"
            :class="{ active: index === lyricState.currentLineIndex }"
            @click="playService.seek(line.time)"
          >
            {{ line.text }}
          </div>
        </div>
      </div>
    </div>
    <FloatComment class="float-comment"></FloatComment>
  </div>
</template>

<style lang="scss" scoped>
.player-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background-color: $background;
  background-size: 100% 100%;
  transition-duration: 0.3s;
  color: #ffffff;

  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(100px);
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 1;
    transition-duration: 0.5s;
    transition-property: background;
  }

  .top-op {
    position: absolute;
    top: 20px;
    width: 100%;
    padding: 20px 40px;
    display: flex;
    gap: 20px;
    z-index: 3;

    .iconfont {
      font-size: 20px;
      cursor: pointer;
    }
  }

  .content {
    display: flex;
    height: 100%;
    position: relative;
    z-index: 2;

    .left {
      width: 40%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .right {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .header {
        text-align: center;
        margin-bottom: 40px;
        margin-top: -110px;

        .song-name {
          font-size: 28px;
          margin-bottom: 20px;
        }

        .song-info {
          font-size: 16px;
          color: #ffffff99;
        }
      }

      .lyric {
        height: 50%;
        overflow: auto;
        text-align: center;
        font-size: 18px;
        padding: 0 40px;

        &::after {
          content: '';
          display: block;
          height: 50%;
        }

        &::-webkit-scrollbar {
          display: none;
        }

        .lyric-line {
          padding: 16px 0;
          color: #ffffff99;
          margin: 4px 0;
          cursor: pointer;

          &:hover {
            background: #ffffff1a;
            border-radius: 8px;
          }
        }

        .lyric-line.active {
          font-size: 24px;
          color: #ffffff;
        }
      }
    }
  }

  .player {
    &.simple-mode {
      img {
        width: 200px;
        height: 200px;
      }
    }

    &.disk-mode {
      position: relative;

      .disk {
        --c: #3a3a3a;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000;
        background-image: url(@renderer/assets/img/disk.png);
        background-clip: content-box;
        background-size: 100% 100%;
        animation-duration: 10s;
        border: 8px solid var(--c);

        img {
          width: 45%;
          height: 45%;
          border-radius: 50%;
        }
      }

      .needle {
        width: 200px;
        height: 200px;
        background: url(@renderer/assets/img/needle.png);
        background-size: 100% 100%;
        position: absolute;
        top: -150px;
        transform: rotateZ(-30deg);
        transition-duration: 0.5s;
        transition-property: transform;

        &.playing {
          transform: rotateZ(13deg);
        }
      }
    }
  }
}

@media screen and (min-width: 1200px) {
  .simple-mode {
    img {
      width: 300px !important;
      height: 300px !important;
    }
  }

  .disk-mode {
    .disk {
      width: 300px !important;
      height: 300px !important;
      border-width: 12px;
    }

    .needle {
      width: 300px !important;
      height: 300px !important;
      top: -225px !important;
    }
  }

  .lyric-line {
    font-size: 26px !important;
  }

  .lyric-line.active {
    font-size: 36px !important;
  }
}
</style>
