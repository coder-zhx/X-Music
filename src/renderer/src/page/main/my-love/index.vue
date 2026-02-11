<script setup lang="ts">
import { computed, ref } from 'vue'
import userDataService from '@renderer/service/userDataService'
import useModal from '@renderer/hooks/useModal'
import CreatePlaylist from '@renderer/components/create-playlist.vue'
import DownloadTaskList from '@renderer/components/download-task-list.vue'
import { useUserStore } from '@renderer/stores/user'

const Modal = useModal()
const userStore = useUserStore()

const selfPlaylist = computed(() => {
  if (userStore.isLogin) {
    return userStore.selfPlaylist
  } else {
    return userDataService.customPlaylists.value
  }
})
const likePlaylist = computed(() => {
  if (userStore.isLogin) {
    return userStore.likePlaylist
  } else {
    return userDataService.lovePlaylists.value
  }
})
const likeSingerlist = computed(() => {
  if (userStore.isLogin) {
    return userStore.likeSingerlist
  } else {
    return userDataService.loveSingers.value
  }
})

const curTab = ref('tab1')

function createPlaylist() {
  const modal = Modal.create({
    title: '新建歌单',
    width: '420px',
    content: CreatePlaylist,
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
    <a-tabs v-model:activeKey="curTab" class="tabs">
      <a-tab-pane key="tab1" tab="我的收藏"></a-tab-pane>
      <a-tab-pane key="tab2" tab="我的下载"></a-tab-pane>
    </a-tabs>
    <div class="body" v-if="curTab === 'tab1'">
      <h1 class="title">私人歌单</h1>
      <ul class="playlist">
        <li
          v-for="item in selfPlaylist"
          :key="item.id"
          @click="$router.push(`/${userStore.isLogin ? 'playlist' : 'custom-playlist'}/${item.id}`)"
        >
          <template v-if="item.id === 'my-love-songs'">
            <img v-if="item.cover" class="cover" :src="item.cover + '?param=200y200'" alt="" />
            <div class="my-love" v-else>
              <Iconfont name="icon-love-fill"></Iconfont>
            </div>
          </template>
          <template v-else>
            <img
              v-if="item.cover?.startsWith('http')"
              class="cover"
              :src="item.cover + '?param=200y200'"
              alt=""
            />
            <img v-else class="cover" :src="item.cover" alt="" />
          </template>
          <a>{{ item.name }}</a>
        </li>
        <li>
          <div class="add" @click="createPlaylist">
            <a-tooltip title="创建歌单">
              <Iconfont name="icon-folder-add"></Iconfont>
            </a-tooltip>
          </div>
        </li>
      </ul>

      <h1 class="title">我喜欢的歌单</h1>
      <ul class="playlist">
        <li
          v-for="item in likePlaylist"
          :key="item.id"
          @click="$router.push(`/playlist/${item.id}`)"
        >
          <img class="cover" :src="item.coverImgUrl + '?param=400y400'" alt="" />
          <a>{{ item.name }}</a>
        </li>
        <li>
          <div class="add" @click="$router.push('/playlist')">
            <a-tooltip title="发现更多">
              <Iconfont name="icon-arrow-right-circle"></Iconfont>
            </a-tooltip>
          </div>
        </li>
      </ul>

      <h1 class="title">我喜欢的歌手</h1>
      <ul class="singer-list">
        <li
          v-for="item in likeSingerlist"
          :key="item.id"
          @click="$router.push(`/singer/${item.id}`)"
        >
          <img class="cover" :src="item.cover + '?param=400y400'" alt="" />
          <a>{{ item.name }}</a>
        </li>
        <li>
          <div class="add" @click="$router.push('/singer-list')">
            <a-tooltip title="发现更多">
              <Iconfont name="icon-arrow-right-circle"></Iconfont>
            </a-tooltip>
          </div>
        </li>
      </ul>
    </div>
    <div class="body" v-if="curTab === 'tab2'">
      <DownloadTaskList></DownloadTaskList>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  :deep(.tabs) {
    & > .ant-tabs-nav {
      &::before {
        display: none;
      }

      & > .ant-tabs-nav-wrap > .ant-tabs-nav-list {
        & > .ant-tabs-tab {
          font-size: 18px;

          & > .ant-tabs-tab-btn {
            color: $text-light !important;
          }
        }

        & > .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: $text !important;
        }

        & > .ant-tabs-ink-bar {
          background: $text !important;
          display: none;
        }
      }
    }
  }

  .body {
    padding-bottom: 40px;

    .title {
      font-size: 18px;
      margin-bottom: 20px;
      margin-top: 60px;
      display: flex;
      align-items: center;

      &:nth-child(1) {
        margin-top: 0;
      }
    }

    .playlist {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      grid-gap: 20px 40px;

      @media screen and (max-width: 1000px) {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      }

      li {
        cursor: pointer;
        max-width: 200px;

        img {
          width: 100%;
          aspect-ratio: 1;
        }

        .cover {
          border-radius: 12px;
        }

        a {
          margin-top: 10px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-all;
          text-align: center;
        }
      }

      .add,
      .my-love {
        width: 100%;
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

      .my-love {
        .iconfont {
          font-size: 50px;
          color: $text-light;
        }
      }
    }

    .singer-list {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      grid-gap: 20px 40px;

      @media screen and (max-width: 1000px) {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      }

      li {
        cursor: pointer;
        max-width: 200px;

        img {
          width: 100%;
          aspect-ratio: 1;
        }

        .cover {
          border-radius: 50%;
        }

        a {
          margin-top: 10px;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-all;
          text-align: center;
        }
      }

      .add {
        width: 100%;
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
  }
}
</style>
