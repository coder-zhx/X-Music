<script setup lang="ts">
import downloadService from '@renderer/service/downloadService'
import { ref } from 'vue'

const curTab = ref('tab1')

const columns = [
  {
    title: '文件名',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '文件大小',
    key: 'size',
    ellipsis: true,
  },
  {
    title: '下载进度',
    key: 'progress',
  },
  {
    title: '操作',
    key: 'op',
    width: '100px',
  },
]
const list = downloadService.taskList

const columns2 = [
  {
    title: '文件名',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '文件大小',
    key: 'size',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'op',
    width: '100px',
  },
]
const list2 = downloadService.taskListHistory

function openDir(record) {
  if (record.path) {
    window.electron.ipcRenderer.invoke('shell:showItemInFolder', record.path)
  }
}
</script>

<template>
  <div class="download-task-list">
    <div class="fixed-top">
      <div class="btns" v-if="curTab === 'tab1'">
        <a-button
          v-if="downloadService.paused.value"
          :disabled="!downloadService.taskList.value.length"
          @click="downloadService.startAll()"
        >
          <Iconfont name="icon-play"></Iconfont>
          全部开始
        </a-button>
        <a-button
          v-if="!downloadService.paused.value"
          :disabled="!downloadService.taskList.value.length"
          @click="downloadService.pause()"
        >
          <Iconfont name="icon-pause"></Iconfont>
          全部暂停
        </a-button>
        <a-button
          :disabled="!downloadService.taskList.value.length"
          @click="downloadService.removeAll()"
        >
          <Iconfont name="icon-download-cancel"></Iconfont>
          全部取消
        </a-button>
      </div>
      <div class="btns" v-if="curTab === 'tab2'">
        <a-button
          :disabled="!downloadService.taskListHistory.value.length"
          @click="downloadService.clearHistory()"
        >
          <Iconfont name="icon-delete"></Iconfont>
          清空历史
        </a-button>
      </div>
      <a-tabs v-model:activeKey="curTab">
        <a-tab-pane key="tab1" tab="下载中"></a-tab-pane>
        <a-tab-pane key="tab2" tab="已完成"></a-tab-pane>
      </a-tabs>
    </div>
    <div class="list">
      <a-table v-if="curTab === 'tab1'" :columns="columns" :data-source="list" :pagination="false">
        <template #bodyCell="{ column, record }">
          <div :key="record.uuid">
            <div v-if="column.key === 'name'" class="name">
              <img class="cover" :src="record.extra?.al.picUrl + '?param=40y40'" alt="" />
              <div class="info">
                <div class="song-name">{{ record.extra?.name }}</div>
                <div class="artist">
                  <template v-for="(artist, index) in record.extra?.ar" :key="index">
                    <span>{{ artist.name }} </span>
                    <i v-if="index !== record.extra.ar.length - 1">/</i>
                  </template>
                </div>
              </div>
            </div>
            <div v-if="column.key === 'size'" class="size">
              {{ $byteFormat(record.progressInfo?.total) || '--' }}
            </div>
            <div v-if="column.key === 'progress'" class="progress">
              <a-progress :percent="record.progressInfo?.progress" :show-info="false" />
            </div>
            <div v-if="column.key === 'op'" class="op">
              <a-tooltip title="暂停下载" v-if="record.status === 'downloading'">
                <Iconfont name="icon-pause" @click="record.pause()"></Iconfont>
              </a-tooltip>
              <a-tooltip title="开始下载" v-else>
                <Iconfont name="icon-play" @click="record.start()"></Iconfont>
              </a-tooltip>
              <a-tooltip title="删除下载">
                <Iconfont
                  name="icon-delete"
                  @click="downloadService.removeTask(record.uuid)"
                ></Iconfont>
              </a-tooltip>
            </div>
          </div>
        </template>
        <template #emptyText>
          <div class="no-data">
            <Iconfont name="icon-no-data"></Iconfont>
            <div>暂无数据</div>
          </div>
        </template>
      </a-table>
      <a-table
        v-if="curTab === 'tab2'"
        :columns="columns2"
        :data-source="list2"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <div :key="record.uuid">
            <div v-if="column.key === 'name'" class="name">
              <img class="cover" :src="record.extra?.al.picUrl + '?param=40y40'" alt="" />
              <div class="info">
                <div class="song-name">{{ record.extra?.name }}</div>
                <div class="artist">
                  <template v-for="(artist, index) in record.extra?.ar" :key="index">
                    <span>{{ artist.name }} </span>
                    <i v-if="index !== record.extra.ar.length - 1">/</i>
                  </template>
                </div>
              </div>
            </div>
            <div v-if="column.key === 'size'" class="size">
              {{ $byteFormat(record.progressInfo?.total) || '--' }}
            </div>
            <div v-if="column.key === 'op'" class="op">
              <a-tooltip title="打开文件目录">
                <Iconfont name="icon-file-dir" @click="openDir(record)"></Iconfont>
              </a-tooltip>
              <a-tooltip title="删除记录">
                <Iconfont
                  name="icon-delete"
                  @click="downloadService.removeHistoryRecord(record.uuid)"
                ></Iconfont>
              </a-tooltip>
            </div>
          </div>
        </template>
        <template #emptyText>
          <div class="no-data">
            <Iconfont name="icon-no-data"></Iconfont>
            <div>暂无数据</div>
          </div>
        </template>
      </a-table>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.download-task-list {
  position: relative;

  .fixed-top {
    position: sticky;
    top: 0;
    background: $background;
    z-index: 10;
    transition-duration: 0.5s;
  }

  .btns {
    position: absolute;
    right: 20px;
    z-index: 10;
    display: flex;
    gap: 10px;
  }
}
.name {
  display: flex;
  gap: 4px;

  .cover {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    overflow: hidden;
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
      color: $text-light;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
}

.progress {
  width: 80%;
}

.op {
  display: flex;
  gap: 10px;

  .iconfont {
    font-size: 18px;
    cursor: pointer;
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
