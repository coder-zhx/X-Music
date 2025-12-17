<script setup lang="ts">
import { onActivated, useTemplateRef } from 'vue'

const scroller = useTemplateRef('scroller')
const state = {
  scrollTop: 0,
  scrollLeft: 0,
}

function onScroll() {
  state.scrollTop = scroller.value!.scrollTop
  state.scrollLeft = scroller.value!.scrollLeft
}

onActivated(() => {
  scroller.value!.scrollTo(state.scrollLeft, state.scrollTop)
})
</script>

<template>
  <div ref="scroller" class="scroller" @scroll="onScroll">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.scroller {
  height: 100%;
  overflow: auto;
}
</style>
