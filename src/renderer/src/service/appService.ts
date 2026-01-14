import { ref, watch } from 'vue'
import { getImgColors } from '@renderer/common/utils/color'

class AppService {
  isDark = ref(false)

  appBgVisible = ref(false)
  appBgImg = ref<string | undefined>('')
  appBgImgColors = ref<number[][]>([])
  appBgImgMainColor = ref<number[]>([])

  constructor() {
    watch(
      this.appBgImg,
      () => {
        if (this.appBgImg.value) {
          this._getAppBgImgColor()
        }
      },
      {
        immediate: true,
      },
    )

    watch(
      [this.appBgVisible, this.appBgImgMainColor, this.isDark],
      () => {
        const color = this.appBgImgMainColor.value
        if (color.length && this.appBgVisible.value && !this.isDark.value) {
          const gradientBg = `
            linear-gradient(
              180deg,
              rgba(${color.join(', ')}, 0.5),
              rgba(${color.join(', ')}, 0.8)
            )
          `
          const app = document.querySelector('#app') as HTMLElement
          app.style.background = gradientBg
          app.classList.toggle('gradient-bg', true)
        } else {
          const app = document.querySelector('#app') as HTMLElement
          app.style.background = ''
          app.classList.toggle('gradient-bg', false)
        }
      },
      {
        immediate: true,
      },
    )
  }

  private async _getAppBgImgColor() {
    const colors = await getImgColors(this.appBgImg.value!, 20)
    if (colors) {
      this.appBgImgColors.value = colors
      this.appBgImgMainColor.value = colors[0]
    }
  }

  showAppBg() {
    this.appBgVisible.value = true
  }

  hideAppBg() {
    this.appBgVisible.value = false
  }
  clearAppBg() {
    this.appBgImg.value = ''
    this.appBgImgColors.value = []
    this.appBgImgMainColor.value = []
  }
}

const appService = new AppService()

export default appService
