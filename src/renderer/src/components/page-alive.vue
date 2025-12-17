<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const includes = ref<string[]>([])
const excludes = ref<string[]>([])

let lastPosition = 0
let isForward = true

router.beforeEach((to, from, next) => {
  const curPosition = history.state.position
  if (lastPosition === 0 && curPosition !== 0) {
    lastPosition = +(localStorage.getItem('lastHistoryPosition') || 0)
  }
  isForward = curPosition >= lastPosition

  const toComponent = to.matched[to.matched.length - 1].components?.default
  const fromComponent = from.matched[from.matched.length - 1].components?.default
  if (isForward) {
    // 进入新页面之前，排除掉当前页面，以避免使用缓存
    excludes.value = [toComponent?.name || toComponent?.['__name']]
  } else {
    // 离开页面之前，删除当前页面缓存
    excludes.value = [fromComponent?.name || fromComponent?.['__name']]
  }
  if (['Home'].includes(toComponent?.name || '')) {
    // 进到首页时，清除所有缓存
    includes.value = []
  }
  next()
})

router.afterEach((to, _from) => {
  lastPosition = history.state.position
  localStorage.setItem('lastHistoryPosition', lastPosition + '')

  const toComponent = to.matched[to.matched.length - 1].components?.default
  if (isForward) {
    // 进入新页面之后，要求缓存当前页面
    includes.value.push(toComponent?.name || toComponent?.['__name'])
  }
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="includes" :exclude="excludes">
      <component :is="Component"></component>
    </keep-alive>
  </router-view>
</template>

<style lang="scss" scoped></style>
