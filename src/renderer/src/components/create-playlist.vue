<script setup lang="ts">
import { FormInstance, message } from 'ant-design-vue'
import { ref, useTemplateRef } from 'vue'
import userDataService from '@renderer/service/userDataService'
import { useUserStore } from '@renderer/stores/user'
import { createPlaylist, updatePlaylist } from '@renderer/common/api'

const props = defineProps({
  detail: {
    type: Object,
  },
})

const userStore = useUserStore()

const form = ref({
  name: '',
})
const formRef = useTemplateRef<FormInstance>('formRef')

if (props.detail) {
  form.value = {
    ...props.detail,
  } as any
}

async function onOk() {
  await formRef.value!.validate()
  if (userStore.isLogin) {
    if (props.detail) {
      const res = await updatePlaylist({
        id: props.detail.id,
        name: form.value.name,
      })
      if (res.code !== 200) {
        message.error('更新歌单失败')
      }
    } else {
      const res = await createPlaylist(form.value)
      if (res.code !== 200) {
        message.error('创建歌单失败')
      }
    }
  } else {
    if (props.detail) {
      await userDataService.updateCustomPlaylist(props.detail.id, form.value.name)
    } else {
      await userDataService.createCustomPlaylist(form.value.name)
    }
  }
}

defineExpose({
  onOk,
})
</script>

<template>
  <div class="wrapper">
    <a-form ref="formRef" :model="form" name="basic" layout="vertical" autocomplete="off">
      <a-form-item
        label="歌单名称"
        name="name"
        :rules="[{ required: true, message: '请输入歌单名称' }]"
      >
        <a-input v-model:value="form.name" />
      </a-form-item>
    </a-form>
  </div>
</template>

<style lang="scss" scoped></style>
