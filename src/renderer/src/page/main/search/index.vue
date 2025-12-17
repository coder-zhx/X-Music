<script setup lang="ts">
import { ref, watch } from 'vue'
import Search from '@renderer/components/search.vue'
import playService from '@renderer/service/playService'
import { useRoute } from 'vue-router'
import { getSuggestMultimatch, searchSongs } from '@renderer/api'
import { Song } from '@renderer/common/types/music'

const route = useRoute()

const keyword = ref<string>(route.query.keyword as string)

const loading = ref(false)
const songLoading = ref(false)
const songParam = ref({
  pageNum: 1,
  pageSize: 50,
})
const songList = ref<Song[]>([])
const songTotal = ref(0)
const multimatch = ref<any[]>([])

watch(
  () => route.query.keyword,
  () => {
    loading.value = true
    Promise.all([getMultimatch(), getSonglist(true)]).then(() => {
      loading.value = false
    })
  },
  { immediate: true },
)

async function getSonglist(reset = false) {
  if (reset) {
    songParam.value.pageNum = 1
    songList.value = []
  }
  songLoading.value = true
  const res = await searchSongs({
    keyword: route.query.keyword as string,
    pageNum: songParam.value.pageNum,
    pageSize: songParam.value.pageSize,
  })
  if (res.code === 200) {
    songList.value = [...songList.value, ...res.result.songs]
    songTotal.value = res.result.songCount
    songLoading.value = false
    songParam.value.pageNum++
  }
}

async function getMultimatch() {
  getSuggestMultimatch(route.query.keyword as string).then((res) => {
    if (res.code === 200) {
      multimatch.value = [
        ...(res.result.playlist || []).map((t) => {
          return {
            type: 'playlist',
            id: t.id,
            name: t.name,
            cover: t.coverImgUrl,
            creator: t.creator?.nickname,
            playCount: t.playCount,
          }
        }),
        ...(res.result.artist || []).map((t) => {
          return {
            type: 'artist',
            id: t.id,
            name: t.name,
            cover: t.img1v1Url,
            musicSize: t.musicSize,
            fansSize: t.fansSize,
          }
        }),
      ]
    }
  })
}
</script>

<template>
  <div class="page">
    <div class="page-title">
      <div class="left">
        <a @click="$router.back()">
          <Iconfont name="icon-rollback"></Iconfont>
          返回
        </a>
      </div>
      <Search v-model:value="keyword"></Search>
      <div class="right"></div>
    </div>
    <div class="body">
      <Loading :loading="loading">
        <template v-if="multimatch.length">
          <div class="group-title">最佳匹配</div>
          <div class="multi-match">
            <template v-for="item in multimatch" :key="item.id">
              <div
                v-if="item.type === 'playlist'"
                class="item playlist"
                @click="$router.push(`/playlist/${item.id}`)"
              >
                <img class="cover" :src="item.cover" alt="" />
                <div class="info">
                  <div class="name">{{ item.name }}</div>
                  <div class="other">
                    <span>by: {{ item.creator }}</span>
                    <span>播放: {{ item.playCount }}</span>
                  </div>
                </div>
              </div>
              <div
                v-if="item.type === 'artist'"
                class="item artist"
                @click="$router.push(`/singer/${item.id}`)"
              >
                <img class="cover" :src="item.cover + '?param=200y200'" alt="" />
                <div class="info">
                  <div class="name">{{ item.name }}</div>
                  <div class="other">
                    <span>单曲: {{ item.musicSize }}</span>
                    <span>粉丝: {{ item.fansSize }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
        <template v-if="songList.length">
          <div class="group-title">单曲</div>
          <div style="padding-left: 16px">
            <a-button type="primary" @click="playService.playSongs(songList)">
              <Iconfont name="icon-play2"></Iconfont>
              播放全部
            </a-button>
          </div>
          <InfiniteScroll
            :loading="songLoading"
            :no-more="songList.length >= songTotal"
            :data="songList"
            @load="getSonglist"
          >
            <SongTable :list="songList"></SongTable>
          </InfiniteScroll>
        </template>
      </Loading>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  .page-title {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left,
    .right {
      width: 100px;
      display: flex;
      align-items: center;
    }
  }

  .body {
    .group-title {
      margin-top: 40px;
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: bold;
    }

    .multi-match {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 20px;

      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        background-color: $bg-card;
        padding: 10px;
        border-radius: 8px;
        cursor: pointer;
        transition-duration: 0.5s !important;
        transition-property: background-color, color;

        &:hover {
          background-color: $bg-card-hover;
        }

        .cover {
          width: 80px;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
        }

        &.artist .cover {
          border-radius: 50%;
        }

        .info {
          flex: 1;

          .name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .other {
            display: flex;
            gap: 20px;
          }
        }
      }
    }
  }
}
</style>
