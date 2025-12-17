<script setup lang="ts">
import { FormInstance } from 'ant-design-vue'
import { ref, useTemplateRef } from 'vue'
import userDataService from '@renderer/service/userDataService'

const props = defineProps({
  detail: {
    type: Object,
  },
})

const formState = ref({
  name: '',
})
const formRef = useTemplateRef<FormInstance>('form')

if (props.detail) {
  formState.value = {
    ...props.detail,
  } as any
}

async function onOk() {
  await formRef.value!.validate()
  if (props.detail) {
    await userDataService.updateCustomPlaylist(props.detail.id, formState.value.name)
  } else {
    await userDataService.createCustomPlaylist(formState.value.name)
  }
}

defineExpose({
  onOk,
})
</script>

<template>
  <div class="wrapper">
    <a-form ref="form" :model="formState" name="basic" layout="vertical" autocomplete="off">
      <a-form-item
        label="歌单名称"
        name="name"
        :rules="[{ required: true, message: '请输入歌单名称' }]"
      >
        <a-input v-model:value="formState.name" />
      </a-form-item>
    </a-form>
  </div>
</template>

<style lang="scss" scoped></style>
