<script setup lang="ts">
import { localStorageHelper } from '@renderer/common/utils/storage-helper'
import playService from '@renderer/service/playService'
import { ref, watch } from 'vue'

const value = ref(playService.getVolume())
const isMute = ref(value.value === 0)

let oldValue = 0
function toggle() {
  isMute.value = !isMute.value
  if (isMute.value) {
    oldValue = value.value
    value.value = 0
  } else {
    value.value = oldValue
  }
}

function onChange() {
  isMute.value = value.value === 0
}

watch(value, () => {
  playService.setVolume(value.value)
  localStorageHelper.setItem('volume', value.value)
})
</script>

<template>
  <div class="voice-btn-wrapper">
    <a-popover trigger="click">
      <template #content>
        <div class="slider-wrapper">
          <div>{{ Math.floor(value * 100) }}%</div>
          <div class="flex-1">
            <a-slider
              v-model:value="value"
              :min="0"
              :max="1"
              :step="0.01"
              vertical
              :tooltipOpen="false"
              @change="onChange"
            />
          </div>
          <a @click="toggle" class="inner-icon">
            <Iconfont :name="isMute ? 'icon-voice-off' : 'icon-voice-on'"></Iconfont>
          </a>
        </div>
      </template>
      <a class="voice-btn">
        <Iconfont :name="isMute ? 'icon-voice-off' : 'icon-voice-on'"></Iconfont>
      </a>
    </a-popover>
  </div>
</template>

<style lang="scss" scoped>
.slider-wrapper {
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
  user-select: none;
  font-size: 12px;
  color: $text-light;

  .inner-icon {
    display: inline-flex;
    font-size: 18px;
    margin-top: 5px;
  }
}

.voice-btn-wrapper {
  display: inline-flex;

  .voice-btn {
    display: inline-flex;
    color: $text-light;
    padding: 10px;
    border-radius: 50%;

    &:hover {
      background-color: var(--btn-hover);
    }
  }
}
</style>
