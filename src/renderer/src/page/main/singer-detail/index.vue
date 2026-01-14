<script setup lang="ts">
import { getSingerDetail } from '@renderer/common/utils/web-spider'
import { computed, onActivated, onDeactivated, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import playService from '@renderer/service/playService'
import userDataService from '@renderer/service/userDataService'
import { Singer } from '@renderer/common/types/music'
import appService from '@renderer/service/appService'

defineOptions({
  name: 'SingerDetail',
})

const route = useRoute()

const detailLoading = ref(false)
const detail = ref<Singer>()
const curTab = ref('1')

const isLove = computed(() => {
  return userDataService.loveSingers.value.find((singer) => singer.id === +route.params.id)
})

getDetail()

/**
 * 获取歌手详情
 */
async function getDetail() {
  detailLoading.value = true
  detail.value = await getSingerDetail(+route.params.id)
  appService.appBgImg.value = detail.value?.cover + '?param=40y40'
  appService.showAppBg()
  detailLoading.value = false
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
        歌手 | {{ detail?.name }}
      </div>

      <Scroller v-if="detail" class="body">
        <div class="top">
          <div class="left">
            <img id="cover" class="cover" :src="detail.cover + '?param=300y300'" />
          </div>
          <div class="right">
            <div class="name">{{ detail.name }}</div>
            <div class="alias">{{ detail.alias?.join('/') }}</div>
            <div class="desc">{{ detail.desc }}</div>
            <div class="btns">
              <a-button type="primary" @click="playService.playSongs(detail.songList)">
                <Iconfont name="icon-play2"></Iconfont>
                播放全部
              </a-button>
              <a-button v-if="isLove" @click="userDataService.unloveSinger(detail)">
                <Iconfont name="icon-love-fill" class="primary"></Iconfont>
                取消收藏
              </a-button>
              <a-button v-else @click="userDataService.loveSinger(detail)">
                <Iconfont name="icon-love"></Iconfont>
                收藏
              </a-button>
            </div>
          </div>
        </div>

        <a-tabs v-model:active-key="curTab">
          <a-tab-pane key="1" tab="热门歌曲">
            <SongTable :list="detail.songList"></SongTable>
          </a-tab-pane>
          <a-tab-pane key="2" tab="歌手介绍">
            <div class="description" v-html="detail.description"></div>
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
    gap: 20px;
    margin-bottom: 20px;

    .cover {
      width: 200px;
      height: 200px;
      border-radius: 10%;
    }

    .right {
      flex: 1;
      display: flex;
      flex-direction: column;

      .name {
        font-size: 20px;
        margin-top: 20px;
      }

      .alias {
        font-size: 14px;
        opacity: 0.6;
        margin-top: 10px;
      }

      .desc {
        font-size: 14px;
        opacity: 0.6;
        margin-top: 10px;
        margin-bottom: 10px;
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
  }

  .description {
    padding-bottom: 20px;

    :deep() {
      h2 {
        font-weight: bold;
        margin-top: 10px;
        margin-bottom: 10px;
      }

      p {
        line-height: 25px;
        opacity: 0.6;
        text-indent: 2em;
      }

      .z-indent {
        text-indent: 0;
      }
    }
  }
}
</style>
