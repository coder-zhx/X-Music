<script setup lang="ts">
import { getPlaylist } from '@renderer/api'
import { PlaylistDetail } from '@renderer/common/types/music'
import { getPlaylistCategory } from '@renderer/utils/web-spider'
import { ref } from 'vue'

defineOptions({
  name: 'Playlist',
})

const filterVisible = ref(false)
const loading = ref(false)
const playlist = ref<PlaylistDetail[]>([])
const categoryList = ref<any[]>([])
const category = ref('华语')
const pageNum = ref(1)
const pageSize = ref(60)
const nomore = ref(false)

getCategory()

async function getCategory() {
  const res = await getPlaylistCategory()
  categoryList.value = res
}

async function getList(reset = false) {
  if (nomore.value) return
  if (reset) {
    pageNum.value = 1
  }
  if (pageNum.value === 1) {
    playlist.value = []
  }
  loading.value = true
  const res: any = await getPlaylist({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    cat: category.value,
  })
  playlist.value.push(...res.playlists)
  nomore.value = !res.more
  loading.value = false
  pageNum.value++

  // 某些尺寸下，一页数据触发不了无限滚动，所以多请求一页数据
  if (pageNum.value === 2) {
    getList()
  }
}

function onSelectCat(cat) {
  category.value = cat
  filterVisible.value = false
  getList(true)
}
</script>

<template>
  <div class="page">
    <h1 class="page-title">
      <a @click="$router.back()">
        <Iconfont name="icon-rollback"></Iconfont>
      </a>
      歌单列表
      <span class="line"></span>
      <a-popover
        overlayClassName="playlist-category-filter"
        placement="bottomLeft"
        v-model:open="filterVisible"
        trigger="click"
      >
        <span class="cat flex-y-center">
          {{ category || '全部' }}<Iconfont name="icon-arrow-down-solid"></Iconfont>
        </span>
        <template #title>
          <span>选择风格</span>
          <a class="clear" @click="onSelectCat('')">清除</a>
        </template>
        <template #content>
          <div class="category">
            <div class="group" v-for="group in categoryList" :key="group.title">
              <span class="title">{{ group.title }}</span>
              <div class="children">
                <template v-for="child in group.children" :key="child">
                  <span
                    class="child"
                    :class="{ active: category === child }"
                    @click="onSelectCat(child)"
                  >
                    {{ child }}
                  </span>
                  <i></i>
                </template>
              </div>
            </div>
          </div>
        </template>
      </a-popover>
    </h1>
    <Scroller class="body">
      <InfiniteScroll :loading="loading" :no-more="nomore" @load="getList">
        <ul class="playlist">
          <li v-for="item in playlist" :key="item.id" @click="$router.push(`/playlist/${item.id}`)">
            <div class="img-wrapper">
              <img :src="$imgSize(item.coverImgUrl, 400, 400)" alt="" />
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
  }

  .body {
    .playlist {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      grid-gap: 20px 14px;
      flex: 1;
      overflow: auto;

      @media screen and (max-width: 1200px) {
        grid-template-columns: repeat(5, 1fr);
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
          width: 100%;
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
  }
}
</style>

<style lang="scss">
.playlist-category-filter {
  .ant-popover-title {
    display: flex;
    font-size: 16px;

    .clear {
      margin-left: auto;
      margin-right: 20px;
      color: $primary;
    }
  }

  .category {
    font-size: 14px;

    .group {
      display: flex;
      gap: 10px;
      width: 700px;
      margin-top: 20px;

      .title {
        font-weight: bold;
        flex-shrink: 0;
      }

      .children {
        display: flex;
        gap: 10px;
        flex: 1;
        flex-wrap: wrap;
        align-items: center;

        .child {
          cursor: pointer;

          &.active {
            color: $primary;
          }
        }

        i {
          height: 14px;
          border-right: 1px solid #bebebe;
        }
      }
    }
  }
}
</style>
