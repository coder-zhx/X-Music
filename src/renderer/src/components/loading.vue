<script setup lang="ts">
import { HalfCircleSpinner } from 'epic-spinners'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div v-if="loading" class="loading">
    <half-circle-spinner :animation-duration="1000" :size="40" color="#ff1d5e" />
  </div>
  <slot v-else></slot>
</template>

<style lang="scss" scoped>
.loading {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
