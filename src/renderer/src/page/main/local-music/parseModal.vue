<script setup lang="ts">
import { ref } from 'vue'

const type = ref(1)
const separator = ref('-')

defineExpose({
  type,
  separator,
})
</script>

<template>
  <div>
    <a-radio-group v-model:value="type">
      <div>
        <a-radio :value="1">歌名{{ separator || '-' }}歌手</a-radio>
      </div>
      <div style="margin-top: 10px">
        <a-radio :value="2">歌手{{ separator || '-' }}歌名</a-radio>
      </div>
    </a-radio-group>
    <div class="flex-y-center" style="gap: 10px; margin-top: 10px">
      <span>分隔符</span>
      <div style="width: 40px">
        <a-input v-model:value="separator" placeholder="-" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
