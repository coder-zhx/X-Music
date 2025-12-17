<script setup lang="ts">
import downloadService from '@renderer/service/downloadService'
import { useAppStore } from '@renderer/stores/app'
import { Song } from '@renderer/common/types/music'
import { message } from 'ant-design-vue'
import { PropType } from 'vue'
import { FileNameFormat } from '@renderer/common/enums/common'

const props = defineProps({
  song: {
    type: Object as PropType<Song>,
    required: true,
  },
})

const appStore = useAppStore()

function download() {
  downloadService.addTask({
    type: 'song',
    name: getFileName(),
    id: props.song.id,
    extra: props.song,
    br: appStore.systemConfig.downloadBr,
  })
  message.success('已添加下载任务')
}

function getFileName() {
  const songName = props.song.name
  const singerName = props.song.ar[0]?.name
  switch (appStore.systemConfig.fileNameFormat) {
    case FileNameFormat.songName:
      return songName
    case FileNameFormat.songName_singerName:
      return songName + (singerName ? '-' + singerName : '')
    case FileNameFormat.singerName_songName:
      return (singerName ? singerName + '-' : '') + songName
    default:
      return songName
  }
}
</script>

<template>
  <a @click="download">
    <Iconfont name="icon-download"></Iconfont>
  </a>
</template>

<style lang="scss" scoped></style>
