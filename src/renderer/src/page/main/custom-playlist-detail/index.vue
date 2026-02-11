<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import userDataService from '@renderer/service/userDataService'
import playService from '@renderer/service/playService'
import { Song } from '@renderer/common/types/music'
import { cloneDeep } from 'lodash-es'
import useModal from '@renderer/hooks/useModal'
import CreatePlaylist from '@renderer/components/create-playlist.vue'
import { deletePlaylist, getPlaylistDetail } from '@renderer/common/api'
import { message } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()
const Modal = useModal()
const playlistId = route.params.id as string

const playlist = ref()
const playState = playService.state
const list = ref<Song[]>([])
const columns = [
  {
    title: '歌曲/歌手',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '专辑',
    key: 'al',
    ellipsis: true,
  },
  {
    title: '时长',
    key: 'dt',
    width: '100px',
  },
  {
    title: '操作',
    key: 'op',
    width: '80px',
    align: 'center',
  },
]

const customRow = (record) => {
  return {
    onClick: () => {
      playService.playSong(record)
    },
  }
}

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
    console.log(playlist.value)
    list.value = await userDataService.getCustomPlaylistSongs(playlistId)
  }
}

function deleteRow(song: Song) {
  list.value = list.value.filter((item) => item.id !== song.id)
  userDataService.removeFromCustomPlaylist(playlistId, song)
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
            if (res.code !== 200) {
              message.error('删除歌单失败')
            }
          } else {
            userDataService.deleteCustomPlaylist(playlistId)
          }
          modal.close()
          router.back()
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

      <a-table :columns="columns" :data-source="list" :pagination="false" :custom-row="customRow">
        <template #bodyCell="{ column, record }">
          <div v-if="column.key === 'name'" class="name">
            <div class="pic-wrap">
              <img :src="record.al.picUrl + '?param=40y40'" alt="" />
            </div>
            <div class="info">
              <div class="song-name">
                <span class="ellipsis">{{ record.name }}</span>
                <PlayingIcon
                  v-if="record.id === playState.curSong?.id"
                  :is-playing="playState.isPlaying"
                  style="font-size: 16px"
                ></PlayingIcon>
              </div>
              <div class="artist">
                <template v-for="(artist, index) in record.ar" :key="index">
                  <span>{{ artist.name }} </span>
                  <i v-if="index !== record.ar.length - 1">/</i>
                </template>
              </div>
            </div>
          </div>
          <template v-if="column.key === 'op'">
            <div class="op" @click.stop>
              <a @click="deleteRow(record)">
                <Iconfont name="icon-delete"></Iconfont>
              </a>
            </div>
          </template>
          <template v-if="column.key === 'al'">{{ record.al.name }}</template>
          <template v-if="column.key === 'dt'">{{ $duration(record.dt) }}</template>
        </template>
        <template #emptyText>
          <div class="no-data">
            <Iconfont name="icon-no-data"></Iconfont>
            <div>没有歌曲，去收藏一些吧~</div>
          </div>
        </template>
      </a-table>
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

.name {
  display: flex;
  gap: 4px;

  .pic-wrap {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .info {
    flex: 1;
    width: 0;

    div {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .song-name {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .artist {
      font-size: 12px;
      color: $text-light;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}

.op {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 18px;

  a {
    display: flex;
  }
}

.no-data {
  height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: $text-light;

  .icon-no-data {
    font-size: 100px;
  }
}
</style>
