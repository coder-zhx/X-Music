<script setup lang="ts">
import { ref, watch } from 'vue'
import PathSelect from '@renderer/components/path-select.vue'
import { ChromePicker } from 'vue-color'
import 'vue-color/style.css'
import { useAppStore } from '@renderer/stores/app'
import { message } from 'ant-design-vue'
import { SongBrOptions, FileNameFormatOptions } from '@renderer/common/consts/common'
import broadcastService from '@renderer/service/broadcastService'
import lyricService from '@renderer/service/lyricService'

const appStore = useAppStore()

const defaultDownloadPath = ref('')
const form = ref(appStore.systemConfig)

getDefaultDownloadPath()

watch(
  form,
  () => {
    appStore.systemConfig = form.value
  },
  { deep: true },
)

watch(
  () => form.value.lyricColor,
  () => {
    broadcastService.postMessage({ type: 'event:lyricColorChange' })
  },
)

async function getDefaultDownloadPath() {
  defaultDownloadPath.value = await window.electron.ipcRenderer.invoke('file:getPath', 'downloads')
  if (!form.value.downloadPath) {
    form.value.downloadPath = defaultDownloadPath.value
  }
}

async function clearCache() {
  await window.electron.ipcRenderer.invoke('file:clearMP3Cache')
  message.success('清除完成')
}

async function resetLyricColor() {
  form.value.lyricColor = appStore.defaultLyricColor
}

async function showDeskLyric() {
  if (form.value.deskLyric) {
    await lyricService.showLyricWindow(true)
    broadcastService.postMessage({ type: 'event:unlockLyricWin' })
  } else {
    await lyricService.showLyricWindow(false)
  }
}

async function openAtLogin() {
  await window.electron.ipcRenderer.invoke('app:openAtLogin', form.value.autoStart)
}
</script>

<template>
  <div class="page">
    <div class="page-title">系统设置</div>

    <div class="body">
      <div class="group-list">
        <!-- <div class="group">
          <div class="group-name">账号</div>
          <div class="group-content">
            <div class="item">
              <a-button type="primary">
                <Iconfont name="icon-scan"></Iconfont>
                扫码登录
              </a-button>
            </div>
          </div>
        </div> -->
        <div class="group">
          <div class="group-name">常规</div>
          <div class="group-content">
            <div class="item">
              <a-checkbox v-model:checked="form.autoStart" @change="openAtLogin">
                开机自启
              </a-checkbox>
            </div>
            <div class="item">
              <a-checkbox v-model:checked="form.autoPlay">启动后自动播放音乐</a-checkbox>
            </div>
          </div>
        </div>
        <div class="group">
          <div class="group-name">音质与下载</div>
          <div class="group-content">
            <div class="item">
              <div class="item-title">播放音质</div>
              <div class="item-content">
                <a-radio-group v-model:value="form.playBr">
                  <a-radio v-for="item in SongBrOptions" :value="item.value" :key="item.value">
                    {{ item.label }}
                  </a-radio>
                </a-radio-group>
              </div>
            </div>
            <div class="item">
              <div class="item-title">下载音质</div>
              <div class="item-content">
                <a-radio-group v-model:value="form.downloadBr">
                  <a-radio v-for="item in SongBrOptions" :value="item.value" :key="item.value">
                    {{ item.label }}
                  </a-radio>
                </a-radio-group>
              </div>
            </div>
            <div class="item">
              <div class="item-title">缓存设置</div>
              <div class="item-content max-cache">
                <div style="width: 300px">
                  <a-slider v-model:value="form.maxCache" :min="1" :max="10" />
                </div>
                <span>{{ form.maxCache }}G</span>
                <a-button @click="clearCache">清除缓存</a-button>
              </div>
            </div>
            <div class="item">
              <div class="item-title">下载文件保存路径</div>
              <div class="item-content">
                <PathSelect v-model:value="form.downloadPath"></PathSelect>
              </div>
            </div>
            <div class="item">
              <div class="item-title">下载文件名格式</div>
              <div class="item-content">
                <a-radio-group v-model:value="form.fileNameFormat">
                  <a-radio
                    v-for="item in FileNameFormatOptions"
                    :value="item.value"
                    :key="item.value"
                  >
                    {{ item.label }}
                  </a-radio>
                </a-radio-group>
              </div>
            </div>
          </div>
        </div>
        <div class="group">
          <div class="group-name">动效</div>
          <div class="group-content">
            <div class="item">
              <a-checkbox v-model:checked="form.ambientBar">开启氛围灯效果</a-checkbox>
            </div>
          </div>
        </div>
        <div class="group">
          <div class="group-name">桌面歌词</div>
          <div class="group-content">
            <div class="item">
              <a-checkbox v-model:checked="form.deskLyric" @change="showDeskLyric">
                开启桌面歌词
              </a-checkbox>
            </div>
            <div class="item">
              <div class="item-title">歌词文字颜色</div>
              <div class="item-content lyric-color flex-y-center">
                <span class="flex-y-center"
                  >当前：
                  <a-popover overlayClassName="color-picker" trigger="click">
                    <template #content>
                      <ChromePicker class="chrome-picker" v-model="form.lyricColor" />
                    </template>
                    <span class="color" :style="{ background: form.lyricColor }"></span>
                  </a-popover>
                </span>
                <a-button @click="resetLyricColor">重置</a-button>
              </div>
            </div>
          </div>
        </div>
        <div class="group">
          <div class="group-name">关于X Music</div>
          <div class="group-content about-info">
            <div class="item">
              <div class="item-title">版本:</div>
              <div class="item-content">v1.0.0 <a-button>检查更新</a-button></div>
            </div>
            <div class="item">
              <div class="item-title">作者:</div>
              <div class="item-content">coder</div>
            </div>
            <div class="item">
              <div class="item-title">源代码:</div>
              <div class="item-content">github</div>
            </div>
          </div>
        </div>
        <div class="group">
          <div class="group-name">特别申明</div>
          <div class="group-content">
            <ul class="declare">
              <li>1. 本软件仅用于个人学习，禁止用于商业用途</li>
              <li>2. 本软件所有音乐数据均来自公开网络，数据版权归属原平台</li>
              <li>3. 尊重版权，支持正版，下载正规软件，享受高品音质</li>
              <div class="links">
                <a href="https://music.163.com/" target="_blank">
                  <img src="@renderer/assets/img/wangyiyun.png" alt="" />
                  网易云音乐
                </a>
                <a href="https://y.qq.com/" target="_blank">
                  <img src="@renderer/assets/img/qqyinyue.png" alt="" />
                  QQ音乐
                </a>
                <a href="https://music.migu.cn/" target="_blank">
                  <img src="@renderer/assets/img/migu.png" alt="" />
                  咪咕音乐
                </a>
              </div>
            </ul>
          </div>
        </div>
        <div class="group">
          <div class="group-name">打赏作者</div>
          <div class="group-content">
            如果您觉得本软件对您有用，您可以通过以下方式打赏作者，您的支持是作者最大的动力！
            <div class="donate-ways">
              <div class="way">
                <img src="@renderer/assets/img/wxpay.png" alt="" />
                <div>微信</div>
              </div>
              <div class="way">
                <img src="@renderer/assets/img/alipay.png" alt="" />
                <div>支付宝</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.group-list {
  .group {
    display: flex;
    margin-top: 50px;

    .group-name {
      width: 150px;
      font-size: 16px;
      font-weight: 500;
    }

    .group-content {
      flex: 1;

      .item {
        & + .item {
          margin-top: 20px;
        }

        .item-title {
          color: $text-light;
          margin-bottom: 10px;
        }

        .max-cache {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .lyric-color {
          .color {
            width: 22px;
            height: 22px;
            border-radius: 4px;
            background-color: red;
            display: inline-block;
            margin-right: 12px;
            cursor: pointer;
          }
        }
      }

      .declare {
        li + li {
          margin-top: 10px;
        }

        .links {
          display: flex;
          gap: 20px;
          margin-top: 5px;

          a {
            color: $primary;
            border: 1px solid $primary;
            padding: 5px 10px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 4px;

            img {
              width: 16px;
            }
          }
        }
      }

      .donate-ways {
        display: flex;
        align-items: center;
        gap: 40px;
        margin-top: 10px;

        .way {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;

          img {
            width: 150px;
          }
        }
      }
    }

    .about-info {
      .item {
        display: flex;
        gap: 10px;
        align-items: center;

        .item-title {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.color-picker {
  .ant-popover-inner {
    padding: 0;
  }
  .chrome-picker {
    box-shadow: none;
  }
}
</style>
