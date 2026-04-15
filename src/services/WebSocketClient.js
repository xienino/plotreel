import { EventDispatcher } from './dispatcher'

export class WebSocketClient extends EventDispatcher {
  constructor(url, options = {}) {
    super()
    this.url = url
    this.heartbeatInterval = options.heartbeatInterval || 5000 // 发送心跳数据间隔
    this.reconnectDelay = options.reconnectDelay || 3000 // 重连间隔
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5 // 最大重连数
  }
  ws = null // socket实例
  heartbeatTimer = undefined // 计时器id
  reconnectAttempts = 0 // 重连次数
  isManualClose = false // 彻底终止ws

  onopen(callBack) {
    this.addEventListener('open', callBack)
  }

  onmessage(callBack) {
    this.addEventListener('message', callBack)
  }

  onclose(callBack) {
    this.addEventListener('close', callBack)
  }

  onerror(callBack) {
    this.addEventListener('error', callBack)
  }

  // !初始化连接
  connect() {
    if (this.reconnectAttempts === 0) {
      this.log('WebSocket', `初始化连接中...${this.url}`)
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return
    }
    this.ws = new WebSocket(this.url)

    this.ws.onopen = (event) => {
      this.isManualClose = false
      this.reconnectAttempts = 0 // 重置重连尝试成功连接
      this.startHeartbeat() // 在连接成功时停止当前的心跳检测并重新启动
      this.log('WebSocket', `连接成功,等待服务端数据推送[onopen]...${this.url}`)
      this.dispatchEvent('open', event) // 发送
    }

    this.ws.onmessage = (event) => {
      this.dispatchEvent('message', event)
      //   this.startHeartbeat()
    }

    this.ws.onclose = (event) => {
      if (this.reconnectAttempts === 0) {
        this.log('WebSocket', `连接断开[onclose]...${this.url}`)
      }
      this.stopHeartbeat()
      if (!this.isManualClose) this.reconnect()
      this.dispatchEvent('close', event)
    }

    this.ws.onerror = (event) => {
      if (this.reconnectAttempts === 0) {
        this.log('WebSocket', `连接异常[onerror]...${this.url}`)
      }
      this.stopHeartbeat()
      this.dispatchEvent('error', event)
    }
  }

  // > 断网重连
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      this.log(
        'WebSocket',
        `尝试重连... (${this.reconnectAttempts}/${this.maxReconnectAttempts})       ${this.url}`,
      )
      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay)
    } else {
      this.stopHeartbeat()
      this.log('WebSocket', `最大重连失败，终止重连: ${this.url}`)
    }
  }

  // >消息发送
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Request {sid, data, timer, result}

      // inflight_requests (map)  push request to map
      //

      this.ws.send(message)
    } else {
      console.error('[WebSocket] 未连接')
    }
  }

  // >关闭连接
  close() {
    if (this.ws) {
      this.isManualClose = true
      this.ws.close()
      this.ws = null
      this.removeEventListener('open')
      this.removeEventListener('message')
      this.removeEventListener('close')
      this.removeEventListener('error')
    }
    this.stopHeartbeat()
  }

  // >开始心跳检测 -> 定时发送心跳消息
  startHeartbeat() {
    if (this.isManualClose) return
    if (this.heartbeatTimer) {
      this.stopHeartbeat()
    }
    this.heartbeatTimer = setInterval(() => {
      if (this.ws) {
        this.ws.send(JSON.stringify({ type: 'heartBeat', data: {} }))
        this.log('WebSocket', '送心跳数据...')
      } else {
        console.error('[WebSocket] 未连接')
      }
    }, this.heartbeatInterval)
  }

  // >关闭心跳
  stopHeartbeat() {
    clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = undefined
  }
}
