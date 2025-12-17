<script setup lang="ts">
import userDataService from '@renderer/service/userDataService'
import { Song } from '@renderer/common/types/music'
import { computed, PropType } from 'vue'

const props = defineProps({
  song: {
    type: Object as PropType<Song | null>,
    required: true,
  },
})

const isLove = computed(() => {
  return userDataService.loveSongs.value.find((song) => song.id === props.song?.id)
})

function toggle() {
  if (!props.song) return
  if (isLove.value) {
    userDataService.unloveSong(props.song)
  } else {
    userDataService.loveSong(props.song)
  }
}
</script>

<template>
  <a @click.stop="toggle">
    <Iconfont v-if="isLove" name="icon-love-fill"></Iconfont>
    <Iconfont v-if="!isLove" name="icon-love"></Iconfont>
  </a>
</template>

<style lang="scss" scoped>
.icon-love-fill {
  color: $primary !important;
}
</style>
