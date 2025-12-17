<template>
  <div class="infinite-scroll">
    <slot name="default"></slot>
    <div ref="trigger" class="intersection-trigger"></div>
    <div v-if="loading" class="loading-text">加载中...</div>
    <div v-if="noMore && data.length" class="no-more-text">没有更多了</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Array,
    default: () => [],
  },
  noMore: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['load'])

const trigger = ref(null)

const observer = new IntersectionObserver(([entry]: IntersectionObserverEntry[]) => {
  if (entry.isIntersecting && !props.loading && !props.noMore) {
    emit('load')
  }
})

onMounted(() => {
  if (trigger.value) {
    observer.observe(trigger.value)
  }
})

onUnmounted(() => {
  if (observer && trigger.value) {
    observer.unobserve(trigger.value)
    observer.disconnect()
  }
})
</script>

<style scoped>
.intersection-trigger {
  height: 1px;
  width: 1px;
  visibility: hidden;
}

.loading-text,
.no-more-text {
  text-align: center;
  padding: 10px;
  color: #999;
}
</style>
