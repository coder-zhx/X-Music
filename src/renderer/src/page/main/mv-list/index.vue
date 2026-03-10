<script setup lang="ts">
import { getMvlist } from '@renderer/common/api'
import { MvDetail } from '@renderer/common/types/music'
import { ref } from 'vue'

defineOptions({
  name: 'Playlist',
})

const filterVisible = ref(false)
const loading = ref(false)
const list = ref<MvDetail[]>([])
const categoryList = ref<any[]>(['全部', '内地', '港台', '欧美', '日本', '韩国'])
const category = ref('全部')
const sort = ref('最新')
const pageNum = ref(1)
const pageSize = ref(60)
const nomore = ref(false)

async function getList(reset = false) {
  if (nomore.value) return
  if (reset) {
    pageNum.value = 1
  }
  if (pageNum.value === 1) {
    list.value = []
  }
  loading.value = true
  const res: any = await getMvlist({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    area: category.value,
    order: sort.value,
  })
  list.value.push(...res.data)
  nomore.value = !res.hasMore
  loading.value = false
  pageNum.value++

  // 某些尺寸下，一页数据触发不了无限滚动，所以多请求一页数据
  if (pageNum.value === 2) {
    await getList()
  }
}

function onSelectCat(item) {
  category.value = item
  filterVisible.value = false
  getList(true)
}

function switchSort() {
  if (sort.value === '最新') {
    sort.value = '最热'
  } else if (sort.value === '最热') {
    sort.value = '上升最快'
  } else {
    sort.value = '最新'
  }
  getList(true)
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      <a @click="$router.back()">
        <Iconfont name="icon-rollback"></Iconfont>
      </a>
      MV列表
      <span class="line"></span>
      <a-popover
        overlayClassName="mv-category-filter"
        placement="bottomLeft"
        v-model:open="filterVisible"
        trigger="click"
      >
        <span class="cat flex-y-center">
          {{ category || '全部' }}<Iconfont name="icon-arrow-down-solid"></Iconfont>
        </span>
        <template #content>
          <div class="category">
            <div
              class="item"
              :class="{ active: category === item }"
              v-for="item in categoryList"
              :key="item"
              @click="onSelectCat(item)"
            >
              {{ item }}
            </div>
          </div>
        </template>
      </a-popover>
      <span class="sort" @click="switchSort">
        <Iconfont name="icon-sort"></Iconfont>
        {{ sort }}
      </span>
    </h1>
    <Scroller class="body">
      <InfiniteScroll :loading="loading" :no-more="nomore" @load="getList">
        <ul class="list">
          <li v-for="item in list" :key="item.id" @click="$router.push(`/mv/${item.id}`)">
            <div
              class="cover"
              :style="{ backgroundImage: `url(${$imgSize(item.cover, 640, 360)})` }"
            >
              <div class="play">
                <Iconfont name="icon-play"></Iconfont>
              </div>
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
  .page-title {
    display: flex;
    align-items: center;

    .line {
      height: 16px;
      border-right: 1px solid $text;
      margin: 0 5px;
    }

    .cat {
      cursor: pointer;
    }

    .sort {
      display: flex;
      align-items: center;
      align-self: end;
      margin-left: auto;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;

      &:hover {
        color: $primary;
      }
    }
  }

  .body {
    .list {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      grid-gap: 20px 14px;
      flex: 1;
      overflow: auto;

      @media screen and (max-width: 1400px) {
        grid-template-columns: repeat(4, 1fr);
      }

      li {
        cursor: pointer;

        .cover {
          width: 100%;
          aspect-ratio: 16 / 9;
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
  }
}
</style>

<style lang="scss">
.mv-category-filter {
  .category {
    font-size: 14px;

    .item {
      padding: 5px 0;
      cursor: pointer;

      &.active {
        color: $primary;
      }
    }
  }
}
</style>
