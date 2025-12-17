import { App } from 'vue'
import moment from 'moment'

export default {
  install: (app: App) => {
    app.config.globalProperties.$duration = duration
    app.config.globalProperties.$dateFormat = dateFormat
    app.config.globalProperties.$byteFormat = byteFormat
    app.config.globalProperties.$number2wan = number2wan
    app.config.globalProperties.$imgSize = imgSize
  },
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $duration: (time: number) => string
    $dateFormat: (date: Date | number | string, fmt?: string) => string
    $byteFormat: (byte: number, fractionDigits?: number) => string
    $number2wan: (num: number) => string
    $imgSize: (url: string, width: number, height: number) => string
  }
}

/**
 * 将时长从毫秒转成mm:ss格式
 */
function duration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 * 日期格式化
 */
function dateFormat(date: Date | number | string, fmt = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return ''
  return moment(date).format(fmt)
}

/**
 * 字节格式化
 */
function byteFormat(bytes, fractionDigits = 2) {
  if (bytes === 0) return '0 B'
  if (isNaN(bytes)) return ''

  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1)

  return parseFloat((bytes / Math.pow(k, i)).toFixed(fractionDigits)) + ' ' + units[i]
}

/**
 * 将数字转换为万单位
 */
function number2wan(num) {
  return num >= 10000 ? (num / 10000).toFixed(1) + '万' : num
}

/**
 * 设置url中的图片尺寸参数
 */
function imgSize(url, width, height) {
  if (url.match(/thumbnail=\d+y\d+/)) {
    const lastIndex = url.lastIndexOf('thumbnail=')
    const before = url.substring(0, lastIndex)
    const after = url.substring(lastIndex)
    return before + after.replace(/thumbnail=\d+y\d+/, `thumbnail=${width}y${height}`)
  }
  if (url.match(/param=\d+y\d+/)) {
    return url.replace(/param=\d+y\d+/g, `param=${width}y${height}`)
  }
  return `${url}?param=${width}y${height}`
}
