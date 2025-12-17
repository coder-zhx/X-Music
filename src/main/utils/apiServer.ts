import neteaseCloudMusicApi from 'NeteaseCloudMusicApi'
import net from 'net'
import Store from 'electron-store'

const store = new Store()

export default async function startApiServer() {
  const port = await getAvailablePort(12140)
  await (neteaseCloudMusicApi as any).serveNcmApi({
    port: port,
    host: '127.0.0.1',
  })
  store.set('apiServerPort', port)
}

async function getAvailablePort(port) {
  function testPort(port) {
    return new Promise((resolve, reject) => {
      let server = net.createServer().listen(port, '127.0.0.1')
      server.on('listening', () => {
        server.close()
        resolve(port)
      })
      server.on('error', (err) => {
        if (err['code'] == 'EADDRINUSE') {
          reject(err)
        }
      })
    })
  }

  let finalPort

  try {
    finalPort = await testPort(port)
  } catch (error) {
    finalPort = await getAvailablePort(++port)
  }

  return finalPort
}
