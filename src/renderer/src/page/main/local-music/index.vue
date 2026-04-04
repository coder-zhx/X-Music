<script setup lang="ts">
import { message } from 'ant-design-vue'
import { ref, computed, toRaw } from 'vue'
import ParseModal from './parseModal.vue'
import useModal from '@renderer/hooks/useModal'
import playService from '@renderer/service/playService'
import userDataService from '@renderer/service/userDataService'
import { v4 as uuidv4 } from 'uuid'

const Modal = useModal()

const localSongs = computed(() => {
  return userDataService.localSongs.value.map((t) => ({
    key: t.id,
    ...toRaw(t),
  }))
})

async function importSongs() {
  const path = await window.electron.ipcRenderer.invoke('file:selectDirectory')
  if (path) {
    const songFiles = await window.electron.ipcRenderer.invoke('file:findFiles', {
      path,
      regString: '\\.(mp3|flac|wav|m4a|ogg)$',
    })
    const lrcFiles = await window.electron.ipcRenderer.invoke('file:findFiles', {
      path,
      regString: '\\.lrc$',
    })
    if (songFiles.length) {
      const modal = Modal.create({
        title: '选择歌曲文件格式',
        width: '420px',
        content: ParseModal,
        footer: [
          {
            text: '取消',
            type: 'default',
            onClick: () => {
              modal.close()
            },
          },
          {
            text: '确定',
            type: 'primary',
            onClick: async (instance) => {
              const { type, separator } = instance
              parseSongs(songFiles, lrcFiles, type, separator)
              modal.close()
            },
          },
        ],
      })
    } else {
      message.error('未找到歌曲文件')
    }
  }
}

async function parseSongs(songFiles, lrcFiles, type, separator) {
  const list = await Promise.all(
    songFiles.map(async (songFile) => {
      songFile.metadata = await window.electron.ipcRenderer.invoke(
        'file:getMp3Metadata',
        songFile.path,
      )
      return songFile
    }),
  )

  const songs = list
    .filter((songFile) => songFile.metadata)
    .map((songFile) => {
      const song = {
        id: uuidv4(),
        type: 'local',
        name: '',
        al: {
          name: '',
          picUrl: '',
        },
        ar: [],
        dt: songFile.metadata.format.duration * 1000,
        filePath: songFile.path,
        lrcFilePath: '',
      }
      if (songFile.name.includes(separator)) {
        const [part1, part2] = songFile.name.split(separator)
        if (type === 1) {
          song.name = part1
          song.ar = [{ name: part2 }] as any
        } else {
          song.name = part2
          song.ar = [{ name: part1 }] as any
        }
      } else {
        song.name = songFile.name
      }
      const lrcFile = lrcFiles.find((item) => item.name === songFile.name)
      if (lrcFile) {
        song.lrcFilePath = lrcFile.path
      }
      return song
    })
  userDataService.addToLocalSongs(songs)
}

function removeSelectedSongs() {
  userDataService.removeFromLocalSongs(selectedRows.value)
}

const isEdit = ref(false)
const selectedRows = ref([])

const rowSelection = {
  onChange: (_selectedRowKeys, _selectedRows) => {
    selectedRows.value = _selectedRows
  },
}

const columns = [
  {
    title: '歌曲',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '歌手',
    key: 'ar',
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
      if (isEdit.value) return
      playService.playSong(record)
    },
  }
}
</script>

<template>
  <div class="page">
    <div class="page-title">本地音乐</div>
    <div class="top">
      <a-button
        v-if="localSongs.length"
        @click="playService.playSongs(localSongs as any[])"
        type="primary"
      >
        <Iconfont name="icon-play"></Iconfont>
        播放全部
      </a-button>
      <a-button @click="importSongs">
        <Iconfont name="icon-import"></Iconfont>
        导入歌曲
      </a-button>
      <template v-if="localSongs.length">
        <template v-if="!isEdit">
          <a-button @click="isEdit = true">
            <Iconfont name="icon-edit"></Iconfont>
            批量管理
          </a-button>
        </template>
        <template v-else>
          <a-button @click="removeSelectedSongs" :disabled="!selectedRows.length">
            <Iconfont name="icon-export"></Iconfont>
            批量移除
          </a-button>
          <a-button @click="isEdit = false">取消</a-button>
        </template>
      </template>
    </div>
    <div class="body">
      <a-table
        v-if="localSongs.length"
        :columns="columns"
        :data-source="localSongs"
        :pagination="false"
        :custom-row="customRow"
        :rowSelection="isEdit ? rowSelection : null"
      >
        <template #bodyCell="{ column, record }">
          <div v-if="column.key === 'name'" class="name">
            {{ record.name }}
          </div>
          <template v-if="column.key === 'ar'">{{ record.ar[0]?.name || '--' }}</template>
          <template v-if="column.key === 'dt'">{{ $duration(record.dt) || '--' }}</template>
        </template>
        <template #emptyText> </template>
      </a-table>
      <div v-else class="no-data">
        <Iconfont name="icon-no-data"></Iconfont>
        <div>暂无歌曲</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 40px;
  padding-bottom: 20px;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  padding-top: 24vh;
  color: $text-light;

  .icon-no-data {
    font-size: 100px;
  }
}
</style>
