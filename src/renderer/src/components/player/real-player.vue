<script setup lang="ts">
import analyserService from '@renderer/service/analyserService'
import lyricService from '@renderer/service/lyricService'
import playService from '@renderer/service/playService'
import { onMounted, onUnmounted } from 'vue'
import { chunk, throttle } from 'lodash-es'

const playState = playService.state
const lyricState = lyricService.state

let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D

let unsubscribe
onMounted(() => {
  const drawFn = throttle(draw, 100)
  unsubscribe = analyserService.subscribeData(drawFn)
})

onUnmounted(() => {
  unsubscribe()
})

function draw(data) {
  canvas = document.getElementById('audio-display') as HTMLCanvasElement
  if (!canvas) return
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const fontSize = canvas.width * 0.05
  ctx.font = `lighter ${fontSize}px Arial`
  ctx.strokeStyle = '#bebebe'
  // 歌名
  const name = playState.value.curSong?.name || ''
  const singer = playState.value.curSong?.ar[0].name || ''
  ctx.strokeText(name + '-' + singer, 4, fontSize + 2)
  // 歌词
  ctx.strokeText(lyricState.value.currentLine, 4, (fontSize + 2) * 2)

  ctx.fillStyle = '#01fdff'
  const maxH = canvas.height * 0.4
  const y2 = canvas.height
  // 波形图
  chunk(data, Math.floor(data.length / 50)).forEach((arr, i) => {
    const v = arr[0]
    ctx.fillRect(canvas.width / 2 - i * 4, y2 - (v / 255) * maxH, 3, y2)
    if (i > 0) {
      ctx.fillRect(canvas.width / 2 + i * 4, y2 - (v / 255) * maxH, 3, y2)
    }
  })
}
</script>

<template>
  <div class="real-player" :class="{ playing: playState.isPlaying }">
    <div class="needle"></div>
    <img
      class="cover rotate"
      :class="{ pause: !playState.isPlaying }"
      :src="playState.curSong?.al?.picUrl + '?param=300y300'"
      alt=""
    />
    <canvas id="audio-display"></canvas>
    <div class="btns">
      <a class="prev" @click="playService.playPrev"></a>
      <a class="next" @click="playService.playNext"></a>
      <a class="pause" @click="playService.toggle"></a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.real-player {
  width: 200px;
  height: 200px;
  background-image: url(@renderer/assets/img/player.png);
  background-size: 100% 100%;
  box-shadow: 8px 10px 6px rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  position: relative;

  .needle {
    width: 100%;
    height: 100%;
    background-image: url(@renderer/assets/img/player-needle.png);
    background-size: 100% 100%;
    position: absolute;
    top: -40%;
    left: 35%;
    transform: rotateZ(-20deg);
    transition-duration: 0.5s;
    transition-property: transform;
  }

  &.playing .needle {
    transform: rotateZ(0deg);
  }

  .cover {
    width: 30%;
    height: 30%;
    border-radius: 50%;
    position: absolute;
    left: 25%;
    top: 25%;
    animation-duration: 10s;
  }

  #audio-display {
    width: 45%;
    height: 12%;
    position: absolute;
    left: 20%;
    bottom: 1.5%;
    background-color: #4f7d51;
  }

  .btns {
    .prev {
      position: absolute;
      width: 10%;
      height: 10%;
      left: 6%;
      bottom: 3%;
      border-radius: 50%;
    }

    .next {
      position: absolute;
      width: 10%;
      height: 10%;
      left: 69%;
      bottom: 3%;
      border-radius: 50%;
    }

    .pause {
      position: absolute;
      width: 10%;
      height: 10%;
      left: 85%;
      bottom: 3%;
      border-radius: 50%;
    }
  }
}

@media screen and (min-width: 1200px) {
  .real-player {
    width: 300px;
    height: 300px;
  }
}
</style>
