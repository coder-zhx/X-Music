import axios from 'axios'
import storeService from '@renderer/service/storeService'

let baseUrl = ''

async function initBaseUrl() {
  const port = (await storeService.get('apiServerPort')) || 12140
  baseUrl = `http://localhost:${port}`
}

const http = axios.create()

let errorHandler: (error) => void
export function subscribeError(fn) {
  errorHandler = fn
}

http.interceptors.request.use(
  async function (config) {
    if (!config.url?.startsWith('http')) {
      if (!baseUrl) {
        await initBaseUrl()
      }
      config.url = `${baseUrl}${config.url}`
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          cookie: localStorage.getItem('cookie'),
        }
      }
      if (config.method === 'post') {
        config.data = {
          ...config.data,
          cookie: localStorage.getItem('cookie'),
        }
      }
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
    if (errorHandler) {
      errorHandler(error)
    }
    return error.response.data
  },
)

export default http
