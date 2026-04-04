<script setup lang="ts">
import { LineLyric, YrcLyric } from '@renderer/common/types/music'
import lyricService from '@renderer/service/lyricService'
import playService from '@renderer/service/playService'
import { computed, onMounted, watch } from 'vue'

const lyricState = lyricService.state

watch(
  () => lyricState.value.currentLineIndex,
  () => {
    scrollToCurLine()
  },
)

const hasYrcLyric = computed(() => {
  return lyricState.value.yrcLyric.length > 0
})
const lyricList = computed<YrcLyric[] | LineLyric[]>(() => {
  return hasYrcLyric.value ? lyricState.value.yrcLyric : lyricState.value.lyric
})

const lineStyle = computed(() => {
  const curTime = playService.state.value.currentTime * 1000
  const line = lyricList.value[lyricState.value.currentLineIndex] as YrcLyric
  let percent = 0
  for (let i = 0; i < line.words.length; i++) {
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
    backgroundImage: `linear-gradient(to right, rgb(0 255 0) ${percent}%, rgb(255, 255, 255) 0%)`,
    color: 'transparent',
    backgroundClip: 'text',
    transition: `background-image 0.1s linear`,
  }
})

onMounted(() => {
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
</script>

<template>
  <div class="lyric" v-if="lyricList.length">
    <div
      v-for="(line, index) in lyricList"
      :key="index"
      class="lyric-line"
      :class="{ active: index === lyricState.currentLineIndex }"
      @click="playService.seek(line.time / 1000)"
    >
      <span :style="hasYrcLyric && index === lyricState.currentLineIndex ? lineStyle : null">
        {{ line.text }}
      </span>
    </div>
  </div>
  <div v-else class="no-data">
    <span v-if="!lyricState.lyricLoading">暂无歌词</span>
  </div>
</template>

<style lang="scss" scoped>
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
.no-data {
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #ffffff99;
}

@media screen and (min-width: 1200px) {
  .lyric-line {
    font-size: 26px !important;
  }

  .lyric-line.active {
    font-size: 36px !important;
  }
}
</style>
