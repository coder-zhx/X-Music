<script setup lang="ts">
const value = defineModel('value')
const emit = defineEmits(['change'])
async function selectPath() {
  try {
    const path = await window.electron.ipcRenderer.invoke('file:selectDirectory')
    if (path) {
      value.value = path
      emit('change', path)
    }
  } catch (error) {
    console.error('选择路径失败:', error)
  }
}
</script>

<template>
  <div class="path-select">
    <div class="path">{{ value }}</div>
    <a-button @click="selectPath">选择</a-button>
  </div>
</template>

<style lang="scss" scoped>
.path-select {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 400px;

  .path {
    flex: 1;
    padding: 8px 10px;
    border-radius: 8px;
    background: $bg-card;
    line-height: 16px;
    min-height: 32px;
    word-break: break-all;
    transition: background 0.5s ease !important;
  }
}
</style>
