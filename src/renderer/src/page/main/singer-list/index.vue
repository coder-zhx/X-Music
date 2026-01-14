<script setup lang="ts">
import { getSingerList } from '@renderer/common/api'
import { Singer } from '@renderer/common/types/music'
import { ref, watch } from 'vue'

defineOptions({
  name: 'SingerList',
})

const loading = ref(false)
const singerList = ref<Singer[]>([])
const pageNum = ref(1)
const pageSize = ref(60)
const nomore = ref(false)

const area = ref(-1)
const type = ref(-1)
const initial = ref(-1)
const areas = [
  { id: -1, name: '全部' },
  { id: 7, name: '华语' },
  { id: 96, name: '欧美' },
  { id: 8, name: '日本' },
  { id: 16, name: '韩国' },
  { id: 0, name: '其他' },
]
const types = [
  { id: -1, name: '全部' },
  { id: 1, name: '男歌手' },
  { id: 2, name: '女歌手' },
  { id: 3, name: '乐队组合' },
]
const initials = [
  { id: -1, name: '热门' },
  ...new Array(26).fill(0).map((_, i) => ({
    id: 65 + i,
    name: String.fromCharCode(65 + i),
  })),
  { id: 0, name: '#' },
]

watch([type, area, initial], () => {
  getData(true)
})

async function getData(reset = false) {
  if (reset) {
    pageNum.value = 1
  }
  if (pageNum.value === 1) {
    singerList.value = []
  }
  loading.value = true
  const res = await getSingerList({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    type: type.value,
    area: area.value,
    initial: initial.value,
  })
  singerList.value.push(...res.artists)
  nomore.value = !res.more
  loading.value = false
  pageNum.value++
}
</script>

<template>
  <div class="page">
    <div class="page-title">
      <a @click="$router.back()">
        <Iconfont name="icon-rollback"></Iconfont>
      </a>
      歌手列表
    </div>
    <Scroller class="body">
      <div class="filters">
        <div class="tags">
          <span
            v-for="item in areas"
            :key="item.id"
            class="tag"
            :class="{ active: area === item.id }"
            @click="area = item.id"
          >
            {{ item.name }}
          </span>
        </div>
        <div class="tags">
          <span
            v-for="item in types"
            :key="item.id"
            class="tag"
            :class="{ active: type === item.id }"
            @click="type = item.id"
          >
            {{ item.name }}
          </span>
        </div>
        <div class="letters">
          <span
            v-for="item in initials"
            :key="item.id"
            class="tag"
            :class="{ active: initial === item.id }"
            @click="initial = item.id"
          >
            {{ item.name }}
          </span>
        </div>
      </div>
      <InfiniteScroll :loading="loading" :no-more="nomore" @load="getData">
        <ul class="singer-list">
          <li v-for="item in singerList" :key="item.id" @click="$router.push(`/singer/${item.id}`)">
            <div class="img-wrapper">
              <img :src="item.picUrl + '?param=400y400'" alt="" />
            </div>
            <a>{{ item.name }}</a>
          </li>
        </ul>
      </InfiniteScroll>
    </Scroller>
  </div>
</template>

<style lang="scss" scoped>
.page {
  .body {
    .filters {
      margin-bottom: 20px;

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 15px 10px;
        margin-bottom: 20px;

        .tag {
          padding: 4px 15px;
          border: 1px solid $border;
          border-radius: 20px;
          cursor: pointer;

          &.active,
          &:hover {
            color: $primary;
            border-color: $primary-light;
          }
        }
      }

      .letters {
        display: flex;
        flex-wrap: wrap;
        gap: 15px 20px;

        .tag {
          cursor: pointer;

          &.active,
          &:hover {
            color: $primary;
          }
        }
      }
    }

    .singer-list {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-gap: 35px 20px;
      flex: 1;
      overflow: auto;

      @media screen and (max-width: 1200px) {
        grid-template-columns: repeat(6, 1fr);
      }

      li {
        cursor: pointer;
        text-align: center;

        .img-wrapper {
          position: relative;
          border-radius: 30%;
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          background: $bg-card;

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
          margin-top: 15px;
          font-size: 14px;
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
}
</style>
