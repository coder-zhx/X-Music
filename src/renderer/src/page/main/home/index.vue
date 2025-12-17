<script setup lang="ts">
import { useAppStore } from '@renderer/stores/app'
import Search from '@renderer/components/search.vue'
import { computed, ref } from 'vue'

defineOptions({
  name: 'Home',
})

const appStore = useAppStore()
const data = computed(() => appStore.recommondData)
const loading = ref(false)

async function refresh() {
  loading.value = true
  await appStore.getRecommendData()
  loading.value = false
}
</script>

<template>
  <Scroller v-if="data" class="page">
    <div class="header flex-x-center">
      <div class="search">
        <div class="placeholder" style="width: 24px; height: 24px"></div>
        <Search></Search>
        <a class="refresh" @click="refresh">
          <Iconfont :class="{ rotate: loading }" name="icon-refresh"></Iconfont>
        </a>
      </div>
    </div>

    <h1 class="title">
      推荐歌单
      <RouterLink to="/playlist">更多<Iconfont name="icon-arrow-right"></Iconfont> </RouterLink>
    </h1>
    <ul class="playlist">
      <li
        v-for="item in data.recommendPlaylist"
        :key="item.id"
        @click="$router.push(`/playlist/${item.id}`)"
      >
        <div class="img-wrapper">
          <img class="disk" src="@renderer/assets/img/disk.png" alt="" />
          <div class="cover-wrapper">
            <img class="cover" :src="item.picUrl + '?param=400y400'" alt="" />
          </div>
        </div>
        <a>{{ item.name }}</a>
      </li>
    </ul>

    <h1 class="title">
      热门歌手
      <RouterLink to="/singer-list">更多<Iconfont name="icon-arrow-right"></Iconfont> </RouterLink>
    </h1>
    <ul class="singer">
      <li
        v-for="item in data.recommendSinger"
        :key="item.id"
        @click="$router.push(`/singer/${item.id}`)"
      >
        <div class="img-wrapper">
          <img :src="item.picUrl + '?param=400y400'" alt="" />
        </div>
        <a>{{ item.name }}</a>
      </li>
    </ul>

    <h1 class="title">
      热门榜单
      <RouterLink to="/toplist">更多<Iconfont name="icon-arrow-right"></Iconfont> </RouterLink>
    </h1>
    <ul class="toplist">
      <li
        v-for="item in data.recommendToplist"
        :key="item.id"
        @click="$router.push(`/playlist/${item.id}`)"
      >
        <div class="img-wrapper">
          <img :src="item.coverImgUrl + '?param=400y400'" alt="" />
        </div>
        <div class="info">
          <div class="flex-y-center space-between">
            <span class="name">{{ item.name }}</span>
            <span class="update">{{ item.updateFrequency }}</span>
          </div>
          <div class="songs" v-if="item.tracks.length">
            <div class="song ellipsis" v-for="(song, index) in item.tracks" :key="index">
              <span>{{ index + 1 }}.</span>
              <span>{{ song.first }}-{{ song.second }}</span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </Scroller>
</template>

<style lang="scss" scoped>
.page {
  padding-right: 40px;
  padding-bottom: 20px;

  .search {
    display: flex;
    align-items: center;
    gap: 10px;

    .refresh {
      font-size: 24px;
      display: flex;
      align-items: center;
      color: $text-light;

      .iconfont {
        display: inline-flex;
      }

      .rotate {
        animation-duration: 1s;
      }
    }
  }

  .title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    margin-top: 40px;
    display: flex;
    align-items: center;

    &:first-child {
      margin-top: 0;
    }

    a {
      margin-left: auto;
      font-size: 12px;
      font-weight: normal;
      display: flex;
      align-items: center;
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

      .img-wrapper {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        z-index: 1;
        background-color: $bg-card;
        transition-duration: 0.5s;
        transition-property: background-color, color;

        .disk {
          position: absolute;
          z-index: -1;
          right: 0;
          transition-duration: 0.5s;
        }

        &:hover .disk {
          right: -24px;
        }
      }

      img {
        width: 100%;
        aspect-ratio: 1;
      }

      .cover-wrapper {
        width: 100%;
        aspect-ratio: 1;
        background-color: $bg-card;
        border-radius: 6px;
        overflow: hidden;
      }

      a {
        margin-top: 5px;
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

  .singer {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-gap: 20px 40px;

    @media screen and (max-width: 1000px) {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    }

    li {
      cursor: pointer;
      text-align: center;

      .img-wrapper {
        position: relative;
        width: 100%;
        border-radius: 50%;
        aspect-ratio: 1;
        overflow: hidden;
        background-color: $bg-card;

        &:hover img {
          transform: scale(1.5);
        }
      }

      img {
        width: 100%;
        height: 100%;
        aspect-ratio: 1;
        transition-duration: 0.5s;
      }

      a {
        margin-top: 5px;
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

  .toplist {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

    li {
      cursor: pointer;
      width: calc(50% - 10px);
      height: 200px;
      display: flex;
      padding: 20px;
      gap: 20px;
      background-color: $bg-card;
      border-radius: 12px;
      transition-duration: 0.5s !important;
      transition-property: background-color, color;

      .img-wrapper {
        height: 100%;
        aspect-ratio: 1;
        border-radius: 12px;
        overflow: hidden;
      }

      .info {
        width: 0;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .name {
          font-size: 16px;
          font-weight: bold;
        }

        .update {
          color: $text-light;
          font-size: 12px;
        }

        .songs {
          margin-top: auto;
          margin-bottom: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 12px;

          .song {
            & > span:nth-child(1) {
              margin-right: 14px;
            }
          }
        }
      }
    }

    @media screen and (max-width: 1200px) {
      li {
        height: 170px;
      }
    }
  }
}
</style>
