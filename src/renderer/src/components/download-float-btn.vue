<script setup lang="ts">
import downloadService from '@renderer/service/downloadService'
import { computed, watch, ref } from 'vue'

const totalTask = ref(0)
watch(
  downloadService.taskList,
  (val) => {
    if (val.length === 0) {
      totalTask.value = 0
    } else if (val.length > totalTask.value) {
      totalTask.value = val.length
    }
  },
  { immediate: true },
)
const percent = computed(() => {
  const taskList = downloadService.taskList.value
  const goingList = taskList.filter((item) => item.progressInfo?.progress)
  const progress = goingList.reduce((acc, cur) => {
    return acc + (cur.progressInfo?.progress || 0) / 100
  }, 0)
  return ((totalTask.value - taskList.length + progress) / totalTask.value) * 100
})
</script>

<template>
  <div
    class="download-float-btn"
    v-if="downloadService.taskList.value.length"
    @click="$router.push('/my-love/my-download')"
  >
    <a-progress
      type="circle"
      :percent="percent"
      :showInfo="false"
      :size="50"
      strokeColor="#e61723"
    />
    <Iconfont name="icon-download"></Iconfont>
  </div>
</template>

<style lang="scss" scoped>
.download-float-btn {
  position: absolute;
  right: 40px;
  bottom: 20px;
  z-index: 10;
  width: 50px;
  height: 50px;
  background: $background-light;
  border-radius: 50%;
  box-shadow: 0px 0px 20px 0px $box-shadow;
  padding: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;

  .ant-progress-circle {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>
