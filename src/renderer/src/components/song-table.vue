<script setup lang="ts">
import playService from '@renderer/service/playService'
import { Song } from '@renderer/common/types/music'
import LoveBtn from './love-btn.vue'
import CollectBtn from './collect-btn.vue'
import DownloadBtn from './download-btn.vue'

defineProps({
  list: {
    type: Array<Song>,
    default: () => [],
  },
})

const playState = playService.state
const columns = [
  {
    title: '歌曲/歌手',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '',
    key: 'op',
    width: '150px',
  },
  {
    title: '专辑',
    key: 'al',
    ellipsis: true,
  },
  {
    title: '时长',
    key: 'dt',
    width: '100px',
  },
]

const customRow = (record) => {
  return {
    onClick: () => {
      playService.playSong(record)
    },
  }
}
</script>

<template>
  <div>
    <a-table :columns="columns" :data-source="list" :pagination="false" :custom-row="customRow">
      <template #bodyCell="{ column, record }">
        <div v-if="column.key === 'name'" class="name">
          <div class="pic-wrap">
            <img :src="record.al.picUrl + '?param=40y40'" alt="" />
          </div>
          <div class="info">
            <div class="song-name">
              <span class="ellipsis">{{ record.name }}</span>
              <Iconfont
                v-if="record.mv"
                name="icon-mv"
                @click.stop="$router.push(`/mv/${record.mv}`)"
              ></Iconfont>
              <PlayingIcon
                v-if="record.id === playState.curSong?.id"
                :is-playing="playState.isPlaying"
                style="font-size: 16px"
              ></PlayingIcon>
            </div>
            <div class="artist">
              <template v-for="(artist, index) in record.ar" :key="index">
                <span>{{ artist.name }} </span>
                <i v-if="index !== record.ar.length - 1">/</i>
              </template>
            </div>
          </div>
        </div>
        <template v-if="column.key === 'op'">
          <div class="op" @click.stop>
            <LoveBtn :song="record"></LoveBtn>
            <CollectBtn :song="record"></CollectBtn>
            <DownloadBtn :song="record"></DownloadBtn>
          </div>
        </template>
        <template v-if="column.key === 'al'">{{ record.al.name }}</template>
        <template v-if="column.key === 'dt'">{{ $duration(record.dt) }}</template>
      </template>
      <template #emptyText>
        <div class="no-data">
          <Iconfont name="icon-no-data"></Iconfont>
          <div>暂无数据</div>
        </div>
      </template>
    </a-table>
  </div>
</template>

<style lang="scss" scoped>
.name {
  display: flex;
  gap: 4px;

  .pic-wrap {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
    }
  }

  .info {
    flex: 1;
    width: 0;

    div {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .song-name {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .icon-mv {
      color: $primary;
      cursor: pointer;
    }

    .artist {
      font-size: 12px;
      opacity: 0.6;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}

.op {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;

  a {
    display: inline-flex;
  }
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: $text-light;

  .icon-no-data {
    font-size: 100px;
  }
}
</style>
