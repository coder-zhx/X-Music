<script setup lang="ts">
import { getToplist } from '@renderer/common/api'
import { Toplist } from '@renderer/common/types/music'
import { ref } from 'vue'

const loading = ref(false)
const list = ref<Toplist[]>([])

getList()

async function getList() {
  loading.value = true
  list.value = await getToplist()
  loading.value = false
}
</script>

<template>
  <div class="page">
    <div class="page-title">
      <a @click="$router.back()">
        <Iconfont name="icon-rollback"></Iconfont>
      </a>
      榜单列表
    </div>
    <div class="body">
      <Loading :loading="loading">
        <div class="group-title">官方热榜</div>
        <ul class="toplist">
          <li
            v-for="item in list.slice(0, 4)"
            :key="item.id"
            @click="$router.push(`/playlist/${item.id}`)"
          >
            <div class="img-wrapper">
              <img :src="item.coverImgUrl" alt="" />
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

        <div class="group-title">全球榜单</div>
        <ul class="list">
          <li
            v-for="item in list.slice(4)"
            :key="item.id"
            @click="$router.push(`/playlist/${item.id}`)"
          >
            <div class="img-wrapper">
              <img :src="item.coverImgUrl" alt="" />
            </div>
            <a>{{ item.name }}</a>
          </li>
        </ul>
      </Loading>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.group-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 50px;
  display: flex;
  align-items: center;

  &:nth-child(1) {
    margin-top: 20px;
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
        font-size: 14px;

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

.list {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  grid-gap: 20px 14px;
  flex: 1;
  overflow: auto;

  @media screen and (max-width: 1200px) {
    grid-template-columns: repeat(6, 1fr);
  }

  li {
    cursor: pointer;

    .img-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      z-index: 1;
      background-color: $bg-card;

      .disk {
        position: absolute;
        z-index: -1;
        right: -12px;
        transition-duration: 0.5s;
      }

      &:hover .disk {
        right: -24px;
      }
    }

    img {
      aspect-ratio: 1;
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
</style>
