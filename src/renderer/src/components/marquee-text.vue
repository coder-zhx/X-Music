<script setup lang="ts">
import { ref, onMounted, onUpdated } from 'vue'

const textEl = ref<HTMLElement | null>(null)
const isScrolling = ref(false)

const checkScroll = () => {
  if (textEl.value) {
    // 判断文本宽度是否超过容器宽度
    isScrolling.value = textEl.value.scrollWidth > textEl.value.clientWidth
  }
}

onMounted(() => {
  checkScroll()
  window.addEventListener('resize', checkScroll)
})

onUpdated(() => {
  checkScroll()
})
</script>

<template>
  <div ref="textEl" class="marquee" :class="{ scrolling: isScrolling }">
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.marquee {
  white-space: nowrap;
  position: relative;
  width: 100%;

  &.scrolling {
    animation: marquee 10s linear infinite;
  }

  & > div {
    width: fit-content;
  }
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
