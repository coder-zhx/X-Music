<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import analyserService from '@renderer/service/analyserService'

const energy = ref(0)
const style = computed(() => {
  return {
    '--glow-spread': `${energy.value * 10 - 2}px`,
    '--glow-blur': `${energy.value * 20 + 5}px`,
    '--glow-color': `hsl(${new Date().getSeconds() * 6 * 2}, 100%, 50%)`,
  }
})

let unsubscribe
onMounted(() => {
  unsubscribe = analyserService.subscribeData((_frequencyData, waveData) => {
    // 计算均方根响度
    let sum = 0
    for (let i = 0; i < waveData.length; i++) {
      const amplitude = (waveData[i] - 128) / 128
      sum += amplitude * amplitude
    }
    const rms = Math.sqrt(sum / waveData.length)
    energy.value = Math.min(rms, 0.5)
  })
})
onUnmounted(() => {
  unsubscribe?.()
})
</script>

<template>
  <div class="ambient-bar" :style="style"></div>
</template>

<style lang="scss" scoped>
.ambient-bar {
  box-shadow: 0 0 var(--glow-blur) var(--glow-spread) var(--glow-color);
  height: 20px;
  margin-bottom: -20px;
  position: fixed;
  z-index: 100;
  width: 100%;
}
</style>
