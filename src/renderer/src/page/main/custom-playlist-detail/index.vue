<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import userDataService from '@renderer/service/userDataService'
import playService from '@renderer/service/playService'
import downloadService from '@renderer/service/downloadService'
import { Song } from '@renderer/common/types/music'
import { cloneDeep } from 'lodash-es'
import useModal from '@renderer/hooks/useModal'
import CreatePlaylist from '@renderer/components/create-playlist.vue'
import { deletePlaylist, getPlaylistDetail, operatePlaylist } from '@renderer/common/api'
import { useAppStore } from '@renderer/stores/app'
import { useUserStore } from '@renderer/stores/user'
import { message } from 'ant-design-vue'
import { FileNameFormat } from '@renderer/common/enums/common'

defineOptions({
  name: 'CustomPlaylistDetail',
})

const route = useRoute()
const router = useRouter()
const Modal = useModal()
const appStore = useAppStore()
const userStore = useUserStore()
const playlistId = route.params.id as string

const playlist = ref()
const list = ref<Song[]>([])

const canEdit = computed(() => {
  if (!playlist.value) return false
  return playlistId !== 'my-love-songs' && playlist.value?.specialType !== 5
})

onMounted(() => {
  getData()
})

async function getData() {
  if (playlistId && !isNaN(Number(playlistId))) {
    const res = await getPlaylistDetail(+playlistId)
    if (res.code === 200) {
      playlist.value = {
        ...res.playlist,
        cover: res.playlist.coverImgUrl,
      }
      list.value = res.playlist.tracks
    }
  } else {
    playlist.value = cloneDeep(
      userDataService.customPlaylists.value.find((playlist) => playlist.id === playlistId),
    )
    list.value = await userDataService.getCustomPlaylistSongs(playlistId)
  }
}

/**
 * 下载全部歌曲
 */
function download() {
  const tasks = list.value?.map((song) => {
    return {
      type: 'song',
      name: getFileName(song),
      id: song.id,
      extra: song,
      br: appStore.systemConfig.downloadBr,
      downloadLyric: appStore.systemConfig.downloadLyric,
    }
  })
  downloadService.addTasks(tasks as any)
  message.success('已添加到下载队列')
}

function getFileName(song) {
  const songName = song.name
  const singerName = song.ar[0]?.name
  switch (appStore.systemConfig.fileNameFormat) {
    case FileNameFormat.songName:
      return songName
    case FileNameFormat.songName_singerName:
      return songName + (singerName ? '-' + singerName : '')
    case FileNameFormat.singerName_songName:
      return (singerName ? singerName + '-' : '') + songName
    default:
      return songName
  }
}

async function deleteRow(song: Song) {
  if (playlistId && !isNaN(Number(playlistId))) {
    const res = await operatePlaylist({
      op: 'del',
      pid: playlistId,
      tracks: song!.id,
    })
    if (res.status === 200) {
      getData()
    } else {
      message.error('删除失败')
    }
  } else {
    list.value = list.value.filter((item) => item.id !== song.id)
    userDataService.removeFromCustomPlaylist(playlistId, song)
  }
}

function handleDelete() {
  const modal = Modal.create({
    title: '删除歌单',
    width: '420px',
    content: '确定删除歌单吗？',
    footer: [
      {
        text: '取消',
        type: 'default',
        onClick: () => {
          modal.close()
        },
      },
      {
        text: '确定',
        type: 'primary',
        onClick: async () => {
          if (playlistId && !isNaN(Number(playlistId))) {
            const res = await deletePlaylist({ id: playlistId })
            if (res.code === 200) {
              userStore.getUserPlaylist()
              router.back()
            } else {
              message.error('删除歌单失败')
            }
          } else {
            userDataService.deleteCustomPlaylist(playlistId)
            router.back()
          }
          modal.close()
        },
      },
    ],
  })
}

function handleEdit() {
  const modal = Modal.create({
    title: '编辑歌单',
    width: '420px',
    content: CreatePlaylist,
    componentParams: {
      detail: playlist.value,
    },
    footer: [
      {
        text: '取消',
        type: 'default',
        onClick: () => {
          modal.close()
        },
      },
      {
        text: '确定',
        type: 'primary',
        onClick: async (instance) => {
          try {
            await instance.onOk()
            modal.close()
            getData()
            userStore.getUserPlaylist()
          } catch (_error) {}
        },
      },
    ],
  })
}
</script>

<template>
  <div class="page">
    <div class="page-title">
      <a @click="$router.back()">
        <Iconfont name="icon-rollback"></Iconfont>
      </a>
      私人歌单
      <span v-if="playlist?.name"> | {{ playlist?.name }}</span>
    </div>

    <div class="body">
      <div class="top">
        <div class="left">
          <img v-if="playlist?.cover" id="pl-cover" class="cover" :src="playlist?.cover" alt="" />
          <div class="my-love" v-else>
            <Iconfont name="icon-love-fill"></Iconfont>
          </div>
        </div>
        <div class="right">
          <div class="btns">
            <a-button type="primary" @click="playService.playSongs(list)" :disabled="!list.length">
              <Iconfont name="icon-play2"></Iconfont>
              播放全部
            </a-button>
            <a-button @click="download" :disabled="!list.length">
              <Iconfont name="icon-download"></Iconfont>
              下载
            </a-button>
            <a-button @click="handleEdit" v-if="canEdit">
              <Iconfont name="icon-edit"></Iconfont>
              编辑
            </a-button>
            <a-button @click="handleDelete" v-if="canEdit">
              <Iconfont name="icon-delete"></Iconfont>
              删除
            </a-button>
          </div>
        </div>
      </div>

      <SongTable :list="list">
        <template #opBtns="{ record }">
          <a @click="deleteRow(record)">
            <Iconfont name="icon-delete"></Iconfont>
          </a>
        </template>
      </SongTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top {
  display: flex;
  flex-wrap: wrap-reverse;
  gap: 20px 40px;
  margin-bottom: 20px;

  .left {
    .cover {
      width: 100px;
      height: 100px;
      border-radius: 10px;
    }

    .my-love {
      width: 100px;
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background-color: $bg-card;
      transition-duration: 0.5s !important;
      transition-property: background-color, color;
      gap: 10px;

      .iconfont {
        font-size: 50px;
        color: $text-light;
      }
    }
  }

  .right {
    flex: 1;
    display: flex;
    flex-direction: column;

    .btns {
      margin-top: auto;
      display: flex;
      gap: 20px;

      .primary {
        color: $primary;
      }
    }
  }
}
</style>
