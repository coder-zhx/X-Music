<script setup lang="ts">
defineProps({
  name: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <i class="iconfont" :class="name">
    <svg aria-hidden="true">
      <use :xlink:href="'#' + name"></use>
    </svg>
  </i>
</template>

<style lang="scss" scoped>
.iconfont {
  width: 1em;
  height: 1em;
  display: inline-flex;

  svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
    overflow: hidden;
  }
}
</style>
