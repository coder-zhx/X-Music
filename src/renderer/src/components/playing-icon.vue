<script setup lang="ts">
defineProps({
  isPlaying: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <i class="playing-icon" :class="{ playing: isPlaying }">
    <svg viewBox="0 0 100 100">
      <rect x="12" y="20" width="10" height="60" rx="2" ry="2" class="bar bar-1" />
      <rect x="32" y="20" width="10" height="60" rx="2" ry="2" class="bar bar-2" />
      <rect x="54" y="20" width="10" height="60" rx="2" ry="2" class="bar bar-3" />
      <rect x="76" y="20" width="10" height="60" rx="2" ry="2" class="bar bar-4" />
    </svg>
  </i>
</template>

<style scoped lang="scss">
.playing-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $primary;
  font-size: 1em;
}

svg {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.bar {
  transform-origin: center;
  animation: wave 1s ease-in-out infinite;
  animation-play-state: paused;
  fill: currentColor;

  &.bar-2 {
    animation-delay: -0.4s;
  }

  &.bar-3 {
    animation-delay: -0.8s;
  }

  &.bar-4 {
    animation-delay: -0.4s;
  }
}

.playing .bar {
  animation-play-state: running;
}

@keyframes wave {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.5);
  }
}
</style>
