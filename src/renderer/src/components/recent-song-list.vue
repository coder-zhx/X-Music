<script setup lang="ts">
import { getRecentSongList } from '@renderer/common/api'
import { Song } from '@renderer/common/types/music'
import playService from '@renderer/service/playService'
import { ref } from 'vue'

const list = ref<Song[]>([])
const loading = ref(false)
getList()

async function getList() {
  loading.value = true
  const res = await getRecentSongList()
  if (res.code === 200) {
    list.value = res.data?.list?.map((t) => t.data)
  }
  loading.value = false
}
</script>

<template>
  <div class="recent-song-page">
    <Loading :loading="loading">
      <div class="top">
        <div class="btns">
          <a-button type="primary" @click="playService.playSongs(list)">
            <Iconfont name="icon-play2"></Iconfont>
            播放全部
          </a-button>
        </div>
      </div>

      <Scroller class="body">
        <SongTable :list="list"></SongTable>
      </Scroller>
    </Loading>
  </div>
</template>

<style lang="scss" scoped>
.recent-song-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-right: -40px;

  .top {
    padding-bottom: 20px;
  }
}
</style>
