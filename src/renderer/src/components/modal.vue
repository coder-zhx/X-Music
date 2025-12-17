<script setup lang="ts">
import { computed, ref } from 'vue'

type Btn = {
  text: string
  type?: 'primary'
  onClick: (component) => void
}

const props = defineProps({
  title: {
    type: String,
  },
  width: {
    type: [String, Number],
    default: '500px',
  },
  content: {
    type: Object,
  },
  componentParams: {
    type: Object,
  },
  footer: {
    type: Array<Btn>,
    default: () => [],
  },
  onClosed: {
    type: Function,
  },
})

const show = ref(true)
const contentIsText = computed(() => {
  return typeof props.content === 'string'
})

function close() {
  show.value = false
}

function closed() {
  props.onClosed?.()
}

defineExpose({
  close,
})
</script>

<template>
  <a-modal v-model:open="show" :title="title" :width="width" centered @cancel="closed">
    <div class="content">
      <component
        ref="component"
        v-if="!contentIsText"
        :is="content"
        v-bind="componentParams"
        @close="close"
      ></component>
      <div v-if="contentIsText" v-html="content"></div>
    </div>
    <template #footer>
      <a-button
        v-for="item in footer"
        :key="item.text"
        :type="item.type"
        @click="item.onClick($refs.component)"
      >
        {{ item.text }}
      </a-button>
    </template>
  </a-modal>
</template>

<style lang="scss" scoped>
.content {
  padding: 20px 0;
}
</style>
