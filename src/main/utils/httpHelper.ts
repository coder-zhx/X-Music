import { ipcMain } from 'electron'
import axios from 'axios'

const http = axios.create()

ipcMain.handle('http:get', async (_event, url, config) => {
  return http.get(url, config)
})

ipcMain.handle('http:post', async (_event, url, body, config) => {
  return await http.post(url, body, config)
})

http.interceptors.request.use(
  async function (config) {
    config.headers['User-Agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36 Edg/89.0.774.54'
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
    return error.response.data
  },
)
