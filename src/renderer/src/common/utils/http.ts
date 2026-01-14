import axios from 'axios'
import storeService from '@renderer/service/storeService'

let baseUrl = ''

async function initBaseUrl() {
  const port = (await storeService.get('apiServerPort')) || 12140
  baseUrl = `http://localhost:${port}`
}

const http = axios.create()

http.interceptors.request.use(
  async function (config) {
    if (!config.url?.startsWith('http')) {
      if (!baseUrl) {
        await initBaseUrl()
      }
      config.url = `${baseUrl}${config.url}`
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

http.interceptors.response.use(
  function (response) {
    return response.data
  },
  function (error) {
    switch (error.status) {
      case 401:
        break
      default:
        break
    }
  },
)

export default http
