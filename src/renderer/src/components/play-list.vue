<script setup lang="ts">
import playService from '@renderer/service/playService'
import { computed, watch } from 'vue'
import LoveBtn from '@renderer/components/love-btn.vue'
import CollectBtn from '@renderer/components/collect-btn.vue'
import { useRoute, useRouter } from 'vue-router'

const playState = playService.state
const songList = playService.songList
const router = useRouter()
const route = useRoute()

const show = defineModel<boolean>('show', { default: false })

watch(show, (val) => {
  if (val) {
    setTimeout(() => {
      scrollToCurSong()
    }, 300)
  }
})

const curIndex = computed(() => {
  return songList.value.findIndex((song) => song.id === playState.value.curSong?.id)
})

function close() {
  show.value = false
}

function onItemClick(item) {
  if (item.id === playState.value.curSong?.id) {
    playService.toggle()
  } else {
    playService.playSong(item)
  }
}

function toMv(item) {
  close()
  if (route.name === 'mv-detail') {
    router.replace(`/mv/${item.mv}`)
  } else {
    router.push(`/mv/${item.mv}`)
  }
}

function scrollToCurSong() {
  const scrollEl = document.querySelector('.panel-body') as HTMLElement
  const el = document.querySelector('.curPlay') as HTMLElement
  if (!scrollEl || !el) return
  // 计算可视区域参数
  const containerHeight = scrollEl.clientHeight
  const scrollTop = scrollEl.scrollTop
  const targetTop = el.offsetTop - scrollEl.offsetTop

  // 判断是否在可视区域 (上下各留50px缓冲空间)
  const isVisible = targetTop >= scrollTop - 50 && targetTop <= scrollTop + containerHeight - 50

  if (!isVisible) {
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="panel-wrapper">
      <div v-show="show" class="panel-wrapper">
        <div class="mask" @click="close"></div>
        <Transition name="panel">
          <div v-show="show" class="panel">
            <div class="panel-header">
              <div class="title">
                正在播放
                <span>{{ curIndex + 1 }}/{{ songList.length }}</span>
              </div>
              <a class="ml-auto" @click="playService.clear()">清空</a>
            </div>
            <div class="panel-body song-list">
              <div
                v-for="(item, i) in songList"
                :key="item.id"
                class="item"
                :class="{ curPlay: item.id === playState.curSong?.id }"
                @click="onItemClick(item)"
              >
                <div class="index">
                  <PlayingIcon
                    v-if="item.id === playState.curSong?.id"
                    :is-playing="playState.isPlaying"
                  ></PlayingIcon>
                  <span v-else class="num">{{ i + 1 }}</span>
                </div>
                <a-image
                  class="cover"
                  :src="item.al.picUrl + '?param=40y40'"
                  :width="40"
                  :preview="false"
                />
                <div class="song-info">
                  <div class="name ellipsis">
                    {{ item.name }}
                    <Iconfont v-if="item.mv" name="icon-mv" @click.stop="toMv(item)"></Iconfont>
                  </div>
                  <div class="artist ellipsis">
                    <template v-for="(artist, index) in item.ar" :key="index">
                      <span>{{ artist.name }} </span>
                      <i v-if="index !== item.ar.length - 1">/</i>
                    </template>
                  </div>
                </div>
                <div class="btns" @click.stop>
                  <LoveBtn :song="item"></LoveBtn>
                  <CollectBtn :song="item" placement="bottomRight"></CollectBtn>
                  <a @click="playService.removeSong(item)">
                    <Iconfont name="icon-delete"></Iconfont>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.panel-wrapper {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 999;

  .mask {
    width: 100%;
    height: 100%;
  }
}

.panel {
  height: calc(100vh - 120px);
  max-height: 800px;
  width: 400px;
  position: fixed;
  bottom: 110px;
  right: 0;
  background-color: $background;
  border-radius: 8px;
  box-shadow: 0px 0px 20px 0px $box-shadow;
  display: flex;
  flex-direction: column;

  .panel-header {
    display: flex;
    align-items: center;
    padding: 20px;

    .title {
      font-size: 20px;
      font-weight: bold;
    }
  }

  .panel-body {
    flex: 1;
    overflow: auto;
    margin-bottom: 20px;
  }
}

.panel-wrapper-enter-active,
.panel-wrapper-leave-active {
  transition: opacity 0.3s ease;
}

.panel-wrapper-enter-from,
.panel-wrapper-leave-to {
  opacity: 0;
}

.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.song-list {
  .item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    cursor: pointer;
    user-select: none;

    &:hover {
      background: $bg-card;
    }

    :deep() {
      .cover {
        border-radius: 4px;
      }
    }

    .index {
      min-width: 20px;
      text-align: center;

      .num {
        font-size: 12px;
        color: $text-light;
      }

      .playing-icon {
        font-size: 20px;
      }
    }

    .song-info {
      flex: 1;
      width: 0;

      .song-name {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .icon-mv {
        color: $primary;
        cursor: pointer;
      }

      .artist {
        font-size: 12px;
        color: $text-light;
        margin-top: 4px;
      }
    }

    .btns {
      display: none;
      align-items: center;
      gap: 8px;
      font-size: 18px;

      a {
        display: inline-flex;
      }
    }

    &:hover .btns {
      display: flex;
    }
  }
}
</style>
