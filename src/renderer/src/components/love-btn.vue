<script setup lang="ts">
import userDataService from '@renderer/service/userDataService'
import { Song } from '@renderer/common/types/music'
import { computed, PropType } from 'vue'
import { useUserStore } from '@renderer/stores/user'
import { likeSong } from '@renderer/common/api'
import { message } from 'ant-design-vue'

const props = defineProps({
  song: {
    type: Object as PropType<Song | null>,
    required: true,
  },
})

const userStore = useUserStore()

const isLove = computed(() => {
  if (userStore.isLogin) {
    return userStore.likeSongIdList.find((id) => id === props.song?.id)
  } else {
    return userDataService.loveSongs.value.find((song) => song.id === props.song?.id)
  }
})

async function toggle() {
  if (!props.song) return
  if (userStore.isLogin) {
    likeSong({
      id: props.song.id,
      like: !isLove.value,
    }).then((res) => {
      if (res.code === 200) {
        userStore.getUserLikeSongIdList()
      } else {
        message.error('操作失败')
      }
    })
    if (isLove.value) {
      userStore.likeSongIdList = userStore.likeSongIdList.filter((id) => id !== props.song!.id)
    } else {
      userStore.likeSongIdList.push(props.song.id)
    }
  } else {
    if (isLove.value) {
      userDataService.unloveSong(props.song)
    } else {
      userDataService.loveSong(props.song)
    }
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
