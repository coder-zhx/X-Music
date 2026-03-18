class LogService {
  async playSong(id) {
    await window.electron.ipcRenderer.invoke(
      'http:post',
      'https://clientlogusf.music.163.com/weapi/feedback/weblog',
      window.asrsea({
        logs: JSON.stringify([
          {
            action: 'startplay',
            json: {
              id: id,
              type: 'song',
              content: '',
              mainsite: '1',
              mainsiteWeb: '1',
            },
          },
        ]),
      }),
      {
        headers: {
          'Nm-GCore-Status': '1',
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: 'https://music.163.com/',
          Cookie: localStorage.getItem('cookie'),
        },
      },
    )
  }
}

const logService = new LogService()
export default logService
