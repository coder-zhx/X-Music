class LogService {
  log(action: string, data?: Record<string, any>) {
    const { aplus_queue } = window
    if (!aplus_queue) return

    let _data = {}
    if (data) {
      Object.keys(data).forEach((key) => {
        _data[`x_${key}`] = data[key]
      })
    }

    if (action === 'init') {
      aplus_queue.push({
        action: 'aplus.sendPV',
        arguments: [
          {
            is_auto: false,
          },
          _data,
        ],
      })
    } else {
      aplus_queue.push({
        action: 'aplus.record',
        arguments: [action, 'CLK', _data],
      })
    }
  }
}

const logService = new LogService()
export default logService
