export const localStorageHelper = {
  /**
   * 读取数据，会自动反序列化
   */
  getItem(key: string) {
    const json = localStorage.getItem(key)
    if (!json) return
    try {
      const value = JSON.parse(json)
      return value
    } catch (_error) {
      return json
    }
  },
  /**
   * 写入数据，会尝试把数据序列化
   */
  setItem(key: string, value: unknown) {
    try {
      const json = JSON.stringify(value)
      localStorage.setItem(key, json)
    } catch (_error) {
      localStorage.setItem(key, value as string)
    }
  },
  removeItem(key: string) {
    localStorage.removeItem(key)
  },
}

export const sessionStorageHelper = {
  /**
   * 读取数据，会自动反序列化
   */
  getItem(key: string) {
    const json = sessionStorage.getItem(key)
    if (!json) return
    try {
      const value = JSON.parse(json)
      return value
    } catch (_error) {
      return json
    }
  },
  /**
   * 写入数据，会尝试把数据序列化
   */
  setItem(key: string, value: unknown) {
    try {
      const json = JSON.stringify(value)
      sessionStorage.setItem(key, json)
    } catch (_error) {
      sessionStorage.setItem(key, value as string)
    }
  },
  removeItem(key: string) {
    sessionStorage.removeItem(key)
  },
}
