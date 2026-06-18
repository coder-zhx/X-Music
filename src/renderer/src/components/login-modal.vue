<script setup lang="ts">
import {
  getQrcode,
  getQrcodeKey,
  loginByPhone,
  qrcodeCheck,
  sendCaptcha,
} from '@renderer/common/api'
import { CountryCodeList } from '@renderer/common/consts/country'
import logService from '@renderer/service/logService'
import { useUserStore } from '@renderer/stores/user'
import { useIntervalFn } from '@vueuse/core'
import { message } from 'ant-design-vue'
import { computed, onUnmounted, ref, watch } from 'vue'

const emit = defineEmits(['close'])

const userStore = useUserStore()

const curTab = ref('phoneLogin')
const form = ref({
  phone: '',
  ctcode: '86',
  captcha: '',
})
const phoneLogining = ref(false)

const captchaTime = ref(0)
const captchaTimer = useIntervalFn(
  () => {
    captchaTime.value = captchaTime.value - 1
    if (captchaTime.value <= 0) {
      captchaTime.value = 0
      captchaTimer.pause()
    }
  },
  1000,
  {
    immediate: false,
  },
)

const phoneLoginDisabled = computed(() => {
  return !form.value.phone || !form.value.captcha
})

const handleSendCaptchaDisabled = computed(() => {
  if (form.value.ctcode === '86' && !/^1\d{10}$/.test(form.value.phone)) {
    return true
  }
  return !form.value.phone || captchaTime.value > 0
})

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

onUnmounted(() => {
  pause()
})

watch(curTab, () => {
  if (curTab.value === 'qrcodeLogin') {
    initQrcode()
  } else {
    pause()
  }
})

async function handleSendCaptcha() {
  if (form.value.ctcode === '86' && !/^1\d{10}$/.test(form.value.phone)) {
    message.error('请输入正确的手机号')
    return
  }
  const res = await sendCaptcha(form.value.phone)
  if (res.code === 200) {
    message.success('验证码已发送')
    captchaTime.value = 60
    captchaTimer.resume()
  } else {
    message.error(res.message || '发送失败，请稍后重试')
  }
}

async function phoneLogin() {
  if (form.value.ctcode === '86' && !/^1\d{10}$/.test(form.value.phone)) {
    message.error('请输入正确的手机号')
    return
  }
  if (!form.value.captcha || form.value.captcha.length < 4) {
    message.warning('请输入验证码')
    return
  }
  phoneLogining.value = true
  const res = await loginByPhone({
    phone: form.value.phone,
    captcha: form.value.captcha,
    countrycode: form.value.ctcode,
  })
  if (res.code === 200) {
    close()
    onLoginSuccess(res.cookie)
  } else {
    message.error(res.message || '登录失败，请检查验证码')
  }
}

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
    onLoginSuccess(res.cookie)
  }
}

async function onLoginSuccess(cookie: string) {
  localStorage.setItem('cookie', cookie)
  close()
  await userStore.checkLogin()
  userStore.getUserPlaylist()
  userStore.getUserSingerList()
  userStore.getUserLikeSongIdList()
  logService.log('user_login', {
    id: userStore.profile?.userId,
    name: userStore.profile?.nickname,
  })
}

function close() {
  emit('close')
}
</script>

<template>
  <div class="login-modal">
    <div class="title">网易云账号登录</div>
    <a-tabs v-model:activeKey="curTab" class="tabs">
      <a-tab-pane key="phoneLogin" tab="手机登录"></a-tab-pane>
      <a-tab-pane key="qrcodeLogin" tab="二维码登录"></a-tab-pane>
    </a-tabs>
    <template v-if="curTab === 'phoneLogin'">
      <div class="phone-box">
        <div class="phone-input-group">
          <a-select v-model:value="form.ctcode" size="large">
            <a-select-option
              v-for="item in CountryCodeList"
              :key="item.countryName"
              :value="item.countryCode"
            >
              {{ item.countryName }}
            </a-select-option>
          </a-select>
          <a-input v-model:value="form.phone" placeholder="请输入手机号" size="large" />
        </div>
        <div class="captcha-input-group">
          <a-input v-model:value="form.captcha" placeholder="请输入短信验证码" size="large" />
          <a-button
            @click="handleSendCaptcha"
            type="primary"
            size="large"
            :disabled="handleSendCaptchaDisabled"
          >
            {{ captchaTime ? `${captchaTime}秒后重发` : '发送验证码' }}
          </a-button>
        </div>

        <a-button
          style="margin-top: 32px"
          @click="phoneLogin"
          block
          type="primary"
          size="large"
          :disabled="phoneLoginDisabled"
        >
          登录
        </a-button>
      </div>
    </template>
    <template v-if="curTab === 'qrcodeLogin'">
      <div class="qrcode-box">
        <div class="qrcode" :style="{ backgroundImage: `url(${qrurl})` }" alt="" />
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
    </template>
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
  }

  .tabs {
    :deep() {
      .ant-tabs-nav::before {
        border-bottom: none;
      }
    }
  }

  .phone-box {
    width: 100%;
    margin-bottom: -20px;
    padding: 0 20px;

    .phone-input-group {
      display: flex;
      align-items: center;

      :deep() {
        .ant-select-selector {
          border: none;
          border-radius: 8px 0 0 8px;
        }
        .ant-input {
          border: none;
          border-radius: 0 8px 8px 0;
          height: 40px;
        }
      }
    }

    .captcha-input-group {
      display: flex;
      align-items: center;
      margin-top: 10px;
      gap: 10px;

      .ant-input {
        flex: 1;
        height: 40px;
      }
      .ant-btn {
        width: 120px;
      }
    }
  }

  .qrcode-box {
    position: relative;
    .qrcode {
      width: 200px;
      height: 200px;
      border: 1px solid $border;
      background-size: 100% 100%;
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
