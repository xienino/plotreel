import { Log } from './log'

export class EventDispatcher extends Log {
  constructor() {
    super()
    this.listeners = {}
  }

  addEventListener(type, listener) {
    // 绑定
    if (!this.listeners[type]) {
      this.listeners[type] = []
    }
    if (this.listeners[type].indexOf(listener) === -1) {
      this.listeners[type].push(listener)
    }
  }

  removeEventListener(type) {
    this.listeners[type] = []
  }

  dispatchEvent(type, data) {
    const listenerArray = this.listeners[type] || []
    if (listenerArray.length === 0) return
    listenerArray.forEach((listener) => {
      listener.call(this, data)
    })
  }
}
