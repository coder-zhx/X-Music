<script setup lang="ts">
import { ref } from 'vue'
import { getTodaySongs, todaySongDislike } from '@renderer/common/api'
import playService from '@renderer/service/playService'
import { Song } from '@renderer/common/types/music'
import { message } from 'ant-design-vue'

defineOptions({
  name: 'TodaySongs',
})

const loading = ref(false)
const songs = ref<Song[]>([])

getData()

async function getData() {
  loading.value = true
  const res = await getTodaySongs()
  if (res.code === 200) {
    songs.value = res.data.dailySongs
  }
  loading.value = false
}

async function dislike(id) {
  const res = await todaySongDislike(id)
  if (res.code === 200) {
    const res = await getTodaySongs()
    if (res.code === 200) {
      songs.value = res.data.dailySongs
    }
  } else {
    message.error(res.message)
  }
}
</script>

<template>
  <div class="page">
    <Loading :loading="loading">
      <div class="page-title">
        <a @click="$router.back()">
          <Iconfont name="icon-rollback"></Iconfont>
        </a>
        每日推荐
      </div>

      <div class="top">
        <div class="title">
          {{ $dateFormat(Date.now(), 'M') }}/<span class="day">
            {{ $dateFormat(Date.now(), 'D') }}</span
          >日歌曲推荐
        </div>
        <div class="desc">根据你的喜好生成，每天6:00更新</div>
        <div class="btns">
          <a-button type="primary" @click="playService.playSongs(songs)">
            <Iconfont name="icon-play2"></Iconfont>
            播放全部
          </a-button>
        </div>
      </div>

      <div class="body">
        <SongTable :list="songs">
          <template #opBtns="{ record }">
            <a @click="dislike(record.id)">
              <Iconfont name="icon-smiley-sad"></Iconfont>
            </a>
          </template>
        </SongTable>
      </div>
    </Loading>
  </div>
</template>

<style lang="scss" scoped>
.top {
  padding-bottom: 20px;
  .title {
    font-size: 24px;
    font-weight: bold;

    .day {
      font-size: 32px;
    }
  }
  .desc {
    margin-top: 8px;
  }

  .btns {
    margin-top: 16px;
  }
}
</style>
