<script setup lang="ts">
import userDataService from '@renderer/service/userDataService'
import { Song } from '@renderer/common/types/music'
import { message } from 'ant-design-vue'
import { computed, PropType, ref } from 'vue'
import { useUserStore } from '@renderer/stores/user'
import { operatePlaylist } from '@renderer/common/api'

const props = defineProps({
  song: {
    type: Object as PropType<Song | null>,
    required: true,
  },
  placement: {
    type: String,
    default: 'bottom',
  },
})

const userStore = useUserStore()

const visible = ref<boolean>(false)
const playlist = computed(() => {
  if (userStore.isLogin) {
    return userStore.selfPlaylist
  } else {
    return userDataService.customPlaylists.value
  }
}) as any

const handleClick = async (item) => {
  if (userStore.isLogin) {
    const res = await operatePlaylist({
      op: 'add',
      pid: item.id,
      tracks: props.song!.id,
    })
    if (res.status === 200) {
      message.success('添加成功')
    } else {
      message.error('添加失败')
    }
  } else {
    userDataService.addToCustomPlaylist(item.id, props.song!)
    message.success('添加成功')
  }
  visible.value = false
}
</script>

<template>
  <a-popover v-model:open="visible" trigger="click" :placement="placement">
    <template #title>
      <div class="title">收藏到歌单</div>
    </template>
    <template #content>
      <ul class="list">
        <div class="item" v-for="item in playlist" :key="item.id" @click="handleClick(item)">
          <div v-if="item.id === 'my-love-songs'" class="my-love">
            <Iconfont name="icon-love-fill"></Iconfont>
          </div>
          <img v-else class="cover" :src="item.cover" alt="" />
          <span>{{ item.name }}</span>
        </div>
      </ul>
    </template>
    <a @click.stop>
      <Iconfont name="icon-folder-add"></Iconfont>
    </a>
  </a-popover>
</template>

<style lang="scss" scoped>
.title {
  text-align: center;
  font-size: 16px;
}
.list {
  width: 200px;
  max-height: 300px;
  overflow: auto;
  margin: 0 -12px;

  .item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    cursor: pointer;

    &:hover {
      background-color: #e1e1e1;
    }

    .my-love {
      width: 30px;
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background-color: #fbfbfb;
      transition-duration: 0.5s !important;
      transition-property: background-color, color;
      gap: 10px;

      .iconfont {
        font-size: 20px;
        color: #858585;
      }
    }

    .cover {
      width: 30px;
      height: 30px;
      border-radius: 4px;
    }

    span {
      display: -webkit-box;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
    }
  }
}
a {
  display: inline-flex;
}
</style>
