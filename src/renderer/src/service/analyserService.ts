import playService from '@renderer/service/playService'

class AnalyserService {
  private callbacks = new Map<symbol, (frequencyData: Uint8Array, waveData: Uint8Array) => void>()
  private intervalId

  analyser!: AnalyserNode
  constructor() {
    this.init()
  }

  init() {
    const audioCtx = new AudioContext()
    const source = audioCtx.createMediaElementSource(playService.audio)
    this.analyser = audioCtx.createAnalyser()

    source.connect(this.analyser)
    this.analyser.connect(audioCtx.destination)
    this.analyser.fftSize = 2048

    playService.audio.addEventListener('play', () => {
      if (this.callbacks.size) {
        this.startAnimationLoop()
        setTimeout(() => {
          this.startAnimationLoop()
        }, 500)
      }
    })
    playService.audio.addEventListener('pause', () => {
      setTimeout(() => {
        this.stopAnimationLoop()
      }, 500)
    })
  }

  subscribeData(fn: (frequencyData: Uint8Array, waveData: Uint8Array) => void) {
    const uniqueKey = Symbol()
    this.callbacks.set(uniqueKey, fn)
    if (!this.intervalId && playService.state.value.isPlaying) {
      this.startAnimationLoop()
    }
    return () => this.unregisterCallback(uniqueKey)
  }

  private startAnimationLoop() {
    const bufferLength = this.analyser.frequencyBinCount
    const frequencyData = new Uint8Array(bufferLength)
    const waveData = new Uint8Array(bufferLength)

    const updateData = () => {
      this.analyser.getByteFrequencyData(frequencyData)
      this.analyser.getByteTimeDomainData(waveData)
      this.callbacks.forEach((fn) => fn(frequencyData, waveData))
    }

    // 如果计时器未运行，则启动计时器
    if (!this.intervalId) {
      this.intervalId = setInterval(updateData, 20)
    }
  }

  private stopAnimationLoop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }

  private unregisterCallback(uniqueKey: symbol) {
    this.callbacks.delete(uniqueKey)
    if (this.callbacks.size === 0) {
      this.stopAnimationLoop()
    }
  }
}

const analyserService = new AnalyserService()

export default analyserService
