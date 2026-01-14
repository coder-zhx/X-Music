<script setup lang="ts">
import { getSuggest } from '@renderer/common/api'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from 'lodash-es'

const router = useRouter()
const route = useRoute()

const keyword = defineModel<string>('value', { default: '' })
const options = ref([])

const onSelect = debounce((value) => {
  if (!value) return
  keyword.value = value
  if (route.name === 'search') {
    router.replace(`/search?keyword=${value}`)
  } else {
    router.push(`/search?keyword=${value}`)
  }
}, 200)
function onSearch(value: string) {
  if (value) {
    getSuggest(value).then((res) => {
      if (res.code === 200) {
        options.value = res.result.allMatch?.map((t) => {
          return {
            value: t.keyword,
            text: t.keyword,
          }
        })
      }
    })
  } else {
    options.value = []
  }
}
</script>

<template>
  <div class="search-input">
    <a-auto-complete
      :backfill="true"
      :allow-clear="false"
      :options="options"
      style="width: 400px"
      :default-active-first-option="false"
      @select="onSelect"
      @search="onSearch"
    >
      <div>
        <a-input
          v-model:value="keyword"
          size="large"
          placeholder="搜索歌曲/歌手/歌单"
          @keydown.enter="() => onSelect(keyword)"
        />
        <Iconfont name="icon-search"></Iconfont>
      </div>
    </a-auto-complete>
  </div>
</template>

<style lang="scss" scoped>
.search-input {
  :deep() {
    .ant-select-selection-search-input {
      position: relative;
    }
    .ant-input {
      padding-left: 35px;
    }
    .icon-search {
      position: absolute;
      left: 10px;
      top: 10px;
      font-size: 20px;
      color: $text-light;
    }
  }
}
</style>
