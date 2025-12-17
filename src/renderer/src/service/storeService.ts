import { isProxy, toRaw } from 'vue'

class StoreService {
  set(key, value) {
    if (isProxy(value)) {
      value = toRaw(value)
    }
    window.electron.ipcRenderer.invoke('store:set', key, value)
  }

  async get(key) {
    return await window.electron.ipcRenderer.invoke('store:get', key)
  }
}

const storeService = new StoreService()

export default storeService
