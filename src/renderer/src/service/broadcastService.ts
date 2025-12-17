class BroadcastService {
  private _broadcastChannel = new BroadcastChannel('music-channel')

  postMessage(data) {
    this._broadcastChannel.postMessage(data)
  }

  onmessage(callback) {
    this._broadcastChannel.addEventListener('message', callback)
  }
}

const broadcastService = new BroadcastService()

export default broadcastService
