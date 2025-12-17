<script setup lang="ts">
import { getPlaylistDetail, getCommentList } from '@renderer/api'
import SongTable from '@renderer/components/song-table.vue'
import { computed, onActivated, onDeactivated, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import playService from '@renderer/service/playService'
import userDataService from '@renderer/service/userDataService'
import { PlaylistDetail } from '@renderer/common/types/music'
import appService from '@renderer/service/appService'
import downloadService from '@renderer/service/downloadService'
import { message } from 'ant-design-vue'
import { useAppStore } from '@renderer/stores/app'
import { FileNameFormat } from '@renderer/common/enums/common'

defineOptions({
  name: 'PlaylistDetail',
})

const appStore = useAppStore()

const route = useRoute()
const detailLoading = ref(false)
const detail = ref<PlaylistDetail>()

const commentsLoading = ref(false)
const comments = ref<any[]>([])
const commentsTotal = ref(0)
const commentsParam = ref({
  pageNum: 1,
  pageSize: 20,
  cursor: '-1',
})
const isLove = computed(() => {
  return userDataService.lovePlaylists.value.find((playlist) => playlist.id === +route.params.id)
})

const curTab = ref('1')

getData()

async function getData() {
  await getDetail()
  getComments()
}

/**
 * 获取歌单详情
 */
async function getDetail() {
  detailLoading.value = true
  const res = await getPlaylistDetail(+route.params.id)
  if (res.code === 200) {
    detail.value = res.playlist
    appService.appBgImg.value = detail.value?.coverImgUrl + '?param=40y40'
    appService.showAppBg()
  }
  detailLoading.value = false
}

/**
 * 获取歌单评论
 */
async function getComments() {
  if (!detail.value?.commentThreadId) return
  commentsLoading.value = true
  const res = await getCommentList({
    threadId: detail.value.commentThreadId,
    pageNum: commentsParam.value.pageNum,
    pageSize: commentsParam.value.pageSize,
    cursor: commentsParam.value.cursor,
  })
  comments.value = [...comments.value, ...res.data.comments]
  commentsTotal.value = res.data.totalCount
  commentsLoading.value = false
  commentsParam.value.pageNum++
  commentsParam.value.cursor = res.data.cursor
}

/**
 * 下载全部歌曲
 */
function download() {
  detail.value?.tracks.map((song) => {
    downloadService.addTask({
      type: 'song',
      name: getFileName(song),
      id: song.id,
      extra: song,
      br: appStore.systemConfig.downloadBr,
    })
  })
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

onActivated(() => {
  appService.showAppBg()
})

onDeactivated(() => {
  appService.hideAppBg()
})
onUnmounted(() => {
  appService.clearAppBg()
})
</script>

<template>
  <div class="page">
    <Loading :loading="detailLoading">
      <div class="page-title">
        <a @click="$router.back()">
          <Iconfont name="icon-rollback"></Iconfont>
        </a>
        歌单 | {{ detail?.name }}
      </div>

      <Scroller v-if="detail" class="body">
        <div class="top">
          <div class="left">
            <div class="author">
              <img :src="detail.creator.avatarUrl" alt="" />
              <div>
                <div>{{ detail.creator.nickname }}</div>
                <div class="signature">{{ detail.creator.signature }}</div>
              </div>
            </div>
            <div class="desc">{{ detail.description }}</div>
            <div class="tags">
              <span v-for="tag in detail.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
            <div class="btns">
              <a-button type="primary" @click="playService.playSongs(detail.tracks)">
                <Iconfont name="icon-play2"></Iconfont>
                播放全部
              </a-button>
              <a-button v-if="isLove" @click="userDataService.unlovePlaylist(detail)">
                <Iconfont name="icon-love-fill" class="primary"></Iconfont>
                取消收藏
              </a-button>
              <a-button v-else @click="userDataService.lovePlaylist(detail)">
                <Iconfont name="icon-love"></Iconfont>
                收藏
              </a-button>
              <a-button @click="download">
                <Iconfont name="icon-download"></Iconfont>
                下载
              </a-button>
            </div>
          </div>
          <div class="right">
            <img id="pl-cover" class="cover" :src="detail.coverImgUrl" alt="" />
          </div>
        </div>

        <a-tabs v-model:active-key="curTab">
          <a-tab-pane key="1">
            <template #tab>
              歌曲<i>{{ $number2wan(detail.tracks.length) }}</i>
            </template>
            <SongTable :list="detail.tracks"></SongTable>
          </a-tab-pane>
          <a-tab-pane key="2">
            <template #tab>
              评论
              <i>{{ $number2wan(detail.commentCount) }}</i>
            </template>
            <InfiniteScroll
              :loading="commentsLoading"
              :no-more="comments.length >= commentsTotal"
              @load="getComments"
            >
              <CommentList :list="comments"></CommentList>
            </InfiniteScroll>
          </a-tab-pane>
        </a-tabs>
      </Scroller>
    </Loading>
  </div>
</template>

<style lang="scss" scoped>
.page {
  .top {
    display: flex;
    flex-wrap: wrap-reverse;
    gap: 20px 40px;
    margin-bottom: 20px;

    .left {
      flex: 1;
      display: flex;
      flex-direction: column;

      .author {
        display: flex;
        gap: 10px;
        align-items: center;

        img {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 50%;
        }

        .signature {
          font-size: 12px;
          margin-top: 6px;
          opacity: 0.6;
        }
      }

      .desc {
        margin-top: 20px;
      }

      .tags {
        margin-top: 10px;
        margin-bottom: 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        color: $primary;
      }

      .btns {
        margin-top: auto;
        display: flex;
        gap: 20px;

        .primary {
          color: $primary;
        }
      }
    }

    .right {
      width: 30%;
      text-align: right;

      .cover {
        width: 100%;
        max-width: 300px;
        border-radius: 10px;
      }
    }
  }

  :deep() {
    .ant-tabs-tab + .ant-tabs-tab {
      margin-left: 50px;
    }
  }

  .ant-tabs-tab-btn {
    i {
      font-size: 12px;
      position: absolute;
      top: 10px;
    }
  }
}
</style>
