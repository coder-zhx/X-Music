import ColorThief from 'colorthief'

/**
 * 从图片中获取主要的颜色
 * @param imgUrl
 * @param n
 * @returns
 */
export function getImgColors(imgUrl: string, n = 3): Promise<number[][] | null> {
  const img = new Image()
  img.src = imgUrl
  return new Promise((resolve) => {
    img.onload = () => {
      const colorThief = new ColorThief()
      const colors = colorThief.getPalette(img, n > 20 ? n : 20)
      resolve(extractImportantColors(colors, n))
    }
    img.onerror = () => {
      resolve(null)
    }
  })
}

// 提取视觉上重要颜色
export function extractImportantColors(colors, n = 2): any[] {
  // 权重计算函数
  const calculateWeight = (hsl) => {
    const [h, s, l] = hsl
    return s * 0.4 + (1 - Math.abs(l - 0.5)) * 0.3 + h * 0.3
  }

  // 颜色距离计算函数
  const colorDistance = (hsl1, hsl2) => {
    const [h1, s1, l1] = hsl1
    const [h2, s2, l2] = hsl2

    const hueDiff = angleDiff(h1 * 360, h2 * 360) / 360
    return hueDiff * 0.6 + Math.abs(s1 - s2) * 0.2 + Math.abs(l1 - l2) * 0.2
  }

  // 将颜色转换为包含HSL和权重的对象
  const colorObjects = colors.map((rgb) => ({
    rgb: rgb,
    hsl: rgbToHsl(rgb),
    weight: 0,
  }))

  // 按权重排序并初步筛选
  const selectedColors = colorObjects
    .sort((a, b) => calculateWeight(b.hsl) - calculateWeight(a.hsl))
    .slice(0, Math.min(colorObjects.length, n * 2))
    .map((item) => item.rgb)

  // 如果颜色数量不足，从剩余颜色中补充
  if (selectedColors.length < n && selectedColors.length < colors.length) {
    const remainingColors = colors.filter(
      (color) =>
        !selectedColors.some(
          (selected) =>
            selected[0] === color[0] && selected[1] === color[1] && selected[2] === color[2],
        ),
    )

    const sortedRemaining = remainingColors
      .map((rgb) => ({ rgb, hsl: rgbToHsl(rgb) }))
      .sort((a, b) => calculateWeight(b.hsl) - calculateWeight(a.hsl))

    const needed = n - selectedColors.length
    selectedColors.push(...sortedRemaining.slice(0, needed).map((item) => item.rgb))
  }

  // 使用最大最小距离算法优化颜色顺序
  const result: any[] = []
  const candidatePool = [...selectedColors]

  while (result.length < n && candidatePool.length > 0) {
    if (result.length === 0) {
      // 第一个选择权重最高的颜色
      result.push(candidatePool.shift())
      continue
    }

    // 找到与已选颜色中最小距离最大的颜色
    let maxMinDistance = -Infinity
    let selectedIndex = 0

    candidatePool.forEach((color, index) => {
      const colorHsl = rgbToHsl(color)
      const minDistance = result.reduce((minDist, selectedColor) => {
        const selectedHsl = rgbToHsl(selectedColor)
        const distance = colorDistance(selectedHsl, colorHsl)
        return Math.min(minDist, distance)
      }, Infinity)

      if (minDistance > maxMinDistance) {
        maxMinDistance = minDistance
        selectedIndex = index
      }
    })

    result.push(candidatePool.splice(selectedIndex, 1)[0])
  }

  return result.slice(0, n)
}

/**
 * 调整颜色亮度，使其变亮或变暗
 * @param color - RGB颜色 [R, G, B]
 * @param amount - 调整幅度，正值变亮，负值变暗，范围建议在 [-1, 1]
 * @returns 调整后的RGB颜色
 */
export function adjustColorBrightness(color: number[], amount: number = 0): number[] {
  // 将RGB值限制在0-255范围内
  const clamp = (value: number) => Math.min(255, Math.max(0, Math.round(value)))

  // 对每个颜色通道应用调整
  return [
    clamp(color[0] + color[0] * amount), // 调整红色通道
    clamp(color[1] + color[1] * amount), // 调整绿色通道
    clamp(color[2] + color[2] * amount), // 调整蓝色通道
  ] as [number, number, number]
}

// RGB转HSL的辅助函数
function rgbToHsl([r, g, b]) {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return [h, s, l]
}

// 计算两点间角度差的辅助函数
function angleDiff(a, b) {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}
