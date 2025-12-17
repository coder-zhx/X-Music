import axios from 'axios'

const http = axios.create()

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
