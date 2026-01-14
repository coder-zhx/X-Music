<script setup lang="ts">
import { getQrcode, getQrcodeKey, qrcodeCheck } from '@renderer/common/api'
import { useUserStore } from '@renderer/stores/user'
import { useIntervalFn } from '@vueuse/core'
import { onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits(['close'])

const userStore = useUserStore()

let qrkey = ''
const qrurl = ref('')
const status = ref(801) // 800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功

const { pause, resume, isActive } = useIntervalFn(
  () => {
    qrCheck()
  },
  2000,
  {
    immediate: false,
  },
)

onMounted(() => {
  initQrcode()
})

onUnmounted(() => {
  pause()
})

async function initQrcode() {
  const res1 = await getQrcodeKey()
  qrkey = res1.data.unikey
  const res2 = await getQrcode(qrkey)
  qrurl.value = res2.data.qrimg
  status.value = 801

  if (!isActive.value) {
    resume()
  }
}

async function qrCheck() {
  const res = await qrcodeCheck(qrkey)
  status.value = res.code
  if (status.value === 803) {
    pause()
    close()
    userStore.checkLogin()
  }
}

function close() {
  emit('close')
}
</script>

<template>
  <div class="login-modal">
    <div class="title">账户登录</div>
    <div class="qrcode-box">
      <img class="qrcode" :src="qrurl" alt="" />
      <div class="mask" v-if="status === 800">
        <Iconfont name="icon-refresh2" @click="initQrcode"></Iconfont>
      </div>
    </div>
    <div class="status">
      <span v-if="status === 800">二维码已过期，请刷新</span>
      <span v-if="status === 801">请使用网易云音乐APP扫码登录</span>
      <span v-if="status === 802">请在手机上确认</span>
      <span v-if="status === 802">授权登录成功</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: $text;

  .title {
    font-size: 20px;
    font-weight: bold;
    margin-top: -28px;
    margin-bottom: 28px;
  }

  .qrcode-box {
    position: relative;
    .qrcode {
      width: 200px;
      height: 200px;
    }

    .mask {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 1;
      background: #e9e9e9d9;
      display: flex;
      align-items: center;
      justify-content: center;

      .iconfont {
        color: #000;
        font-size: 40px;
        cursor: pointer;
      }
    }
  }

  .status {
    margin-top: 10px;
  }
}
</style>
