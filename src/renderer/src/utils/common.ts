export function urlEncode(a) {
  if (null == a) return ''
  if (typeof a !== 'string') {
    a = String(a)
  }
  return encodeURIComponent(a)
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/!/g, '%21')
}

export function getOS() {
  if (navigator.userAgent.includes('Mac OS X')) {
    return 'mac'
  } else if (navigator.userAgent.includes('Windows')) {
    return 'win'
  } else if (navigator.userAgent.includes('Linux')) {
    return 'linux'
  } else {
    return 'unknown'
  }
}

/**
 * 从url中获取文件扩展名
 */
export function getExtFromUrl(url) {
  if (!url || typeof url !== 'string') {
    return ''
  }
  let path = url.split('?')[0].split('#')[0]
  const lastDotIndex = path.lastIndexOf('.')
  if (lastDotIndex === -1 || lastDotIndex === path.length - 1) {
    return ''
  }
  return path.substring(lastDotIndex + 1)
}
