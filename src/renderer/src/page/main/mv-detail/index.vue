<script setup lang="ts">
import { getCommentList, getMvDetail, getMvUrl, getSongerMvList } from '@renderer/api'
import { computed, onActivated, onDeactivated, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import videojs from 'video.js'
import playService from '@renderer/service/playService'
import router from '@renderer/router'
import { Comment, MvDetail } from '@renderer/common/types/music'

defineOptions({
  name: 'MvDetail',
})

let pageIsActive = true

const route = useRoute()
const mvId = computed(() => +route.params.id)
const playerId = computed(() => `payer_${mvId.value}_${Date.now()}`)

const loading = ref(false)
const detail = ref()
const url = ref()
const commentsLoading = ref(false)
const comments = ref<Comment[]>([])
const commentsTotal = ref(0)
const commentsParam = ref({
  pageNum: 1,
  pageSize: 20,
  cursor: '-1',
})
const otherMvList = ref<MvDetail[]>([])

const curTab = ref('1')

let player

watch(
  mvId,
  async () => {
    setTimeout(async () => {
      if (!pageIsActive) return
      await getDetail()
      getComments(true)
      getOtherMv()
      initPlayer()
    })
  },
  { immediate: true },
)

watch(
  () => playService.state.value.isPlaying,
  async (isPlaying) => {
    if (isPlaying && player) {
      player.pause()
    }
  },
)

onUnmounted(() => {
  if (player) {
    player.dispose()
  }
})

onActivated(() => {
  pageIsActive = true
})

onDeactivated(() => {
  pageIsActive = false
})

function initPlayer() {
  if (!player) {
    player = videojs(playerId.value, {
      autoplay: true,
      aspectRatio: '16:9',
      fluid: true,
    })
    player.on('ended', () => {
      let mvList = otherMvList.value.map((t) => t.id)
      if (mvList.length === 0) {
        mvList = playService.songList.value.filter((song) => song.mv).map((song) => song.mv)
      }
      if (mvList.length > 1) {
        const curMvIndex = mvList.indexOf(mvId.value)
        const nextMvIndex = (curMvIndex + 1) % mvList.length
        router.replace(`/mv/${mvList[nextMvIndex]}`)
      } else {
        player.currentTime(0)
        player.play()
      }
    })
    player.on('play', () => {
      playService.pause()
    })
  }
  player.src(url.value)
}

async function getDetail() {
  if (!detail.value) {
    loading.value = true
  }
  const detailRes = await getMvDetail(mvId.value)
  detail.value = detailRes?.data
  const urlRes = await getMvUrl(mvId.value)
  url.value = urlRes?.data?.url
  loading.value = false
}

async function getComments(reset = false) {
  if (reset) {
    comments.value = []
    commentsParam.value.pageNum = 1
    commentsParam.value.cursor = '-1'
  }
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

async function getOtherMv() {
  const res = await getSongerMvList(detail.value.artistId)
  otherMvList.value = res?.mvs || []
}
</script>

<template>
  <div class="page">
    <div class="page-title">
      <a @click="$router.back()">
        <Iconfont name="icon-rollback"></Iconfont>
      </a>
      MV | {{ detail?.name }}
    </div>
    <div class="body">
      <Loading :loading="loading">
        <video class="video-js" :id="playerId" controls></video>
        <template v-if="detail">
          <div class="info">
            <div class="name">{{ detail.name }} - {{ detail.artistName }}</div>
            <div class="publish">
              <span>发布时间：{{ detail.publishTime }}</span>
              <span>播放：{{ detail.playCount }}</span>
              <span>分享：{{ detail.shareCount }}</span>
              <span>收藏：{{ detail.subCount }}</span>
            </div>
            <div class="desc">{{ detail.desc }}</div>
          </div>

          <a-tabs v-model:active-key="curTab">
            <a-tab-pane key="1">
              <template #tab>
                评论
                <i>{{ detail.commentCount }}</i>
              </template>
              <InfiniteScroll
                :loading="commentsLoading"
                :no-more="comments.length >= commentsTotal"
                @load="getComments"
              >
                <CommentList :list="comments"></CommentList>
              </InfiniteScroll>
            </a-tab-pane>
            <a-tab-pane key="2">
              <template #tab> 更多MV </template>
              <ul class="mv-list">
                <li
                  v-for="item in otherMvList"
                  :key="item.id"
                  @click="router.replace(`/mv/${item.id}`)"
                >
                  <div
                    class="cover"
                    :style="{ backgroundImage: `url(${item.imgurl16v9 + '?param=640y360'})` }"
                  >
                    <div class="play">
                      <Iconfont name="icon-play"></Iconfont>
                    </div>
                  </div>
                  <a>{{ item.name }}</a>
                </li>
              </ul>
            </a-tab-pane>
          </a-tabs>
        </template>
      </Loading>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  .info {
    margin-top: 20px;
    margin-bottom: 40px;

    .name {
      font-size: 16px;
      font-weight: 500;
    }

    .publish {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }

    .desc {
      margin-top: 20px;
      color: $text-light;
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

  .mv-list {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 20px 14px;
    flex: 1;
    overflow: auto;

    @media screen and (max-width: 1200px) {
      grid-template-columns: repeat(4, 1fr);
    }

    li {
      cursor: pointer;
      max-width: 200px;
      line-height: normal;
      word-break: break-all;

      .cover {
        width: 100%;
        aspect-ratio: 16/9;
        background-size: cover;
        display: flex;
        align-items: center;
        justify-content: center;

        .play {
          width: 40px;
          height: 40px;
          background: #ffffff60;
          font-size: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #fff;
          visibility: hidden;
        }

        &:hover {
          .play {
            visibility: visible;
          }
        }
      }

      a {
        font-size: 12px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        word-break: break-all;
      }
    }
  }
}

.video-js {
  width: 100%;

  :deep() {
    .vjs-picture-in-picture-control {
      display: none;
    }
  }
}
</style>
