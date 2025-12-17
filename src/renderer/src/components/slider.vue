<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    default: 30,
  },
  min: {
    type: Number,
    default: 40,
  },
  max: {
    type: Number,
    default: 100,
  },
})

const emit = defineEmits(['update:value', 'change', 'after-change'])

const model = ref(0)
const sliderEl = ref<HTMLDivElement>()

const width = computed(() => {
  if (props.max - props.min <= 0) {
    return 0
  }
  return ((model.value - props.min) / (props.max - props.min)) * 100
})

watch(
  () => props.value,
  () => {
    model.value = props.value
  },
  {
    immediate: true,
  },
)

const isDragging = ref(false)
function onMouseDown(e: MouseEvent) {
  isDragging.value = true
  updateValue(e)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  updateValue(e)
}

function onMouseUp(e: MouseEvent) {
  isDragging.value = false
  updateValue(e)
  emit('after-change', model.value)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

function updateValue(e: MouseEvent) {
  const rect = sliderEl.value!.getBoundingClientRect()
  const percentage = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1)
  model.value = props.min + percentage * (props.max - props.min)
  emit('update:value', model.value)
  emit('change', model.value)
}
</script>

<template>
  <div
    ref="sliderEl"
    class="slider"
    :class="{ draging: isDragging }"
    @mousedown.self="onMouseDown"
    @mouseup.self="onMouseUp"
  >
    <div class="slider-rail"></div>
    <div class="slider-track" :style="{ width: width + '%' }"></div>
  </div>
</template>

<style lang="scss" scoped>
.slider {
  width: 100%;
  height: 4px;
  padding: 4px 0;
  position: relative;
  cursor: pointer;
  box-sizing: content-box;

  .slider-rail {
    width: 100%;
    height: 4px;
    background: $btn-hover;
    transition: background 0.5s ease;
    pointer-events: none;
  }

  .slider-track {
    width: 0;
    height: 4px;
    position: absolute;
    top: 4px;
    background: $primary-light;
    pointer-events: none;
  }

  &:hover,
  &.draging {
    .slider-track {
      background: $primary;
    }
  }
}
</style>
