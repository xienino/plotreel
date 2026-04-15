import React, { useEffect, useRef, useState } from 'react'
import WebSocketClient from './WebSocketClient'
import { TRANS_STATE_MAP, TRANS_STATE } from '../assets/constant'

const WebSocketComponent = () => {
  const [progress, setProgress] = useState(0)
  const wsDrawing = useRef(null)
  const [batchDrawingList, setBatchDrawingList] = useState([
    { index: 0, source: '分镜1', state: TRANS_STATE.TRANS_STATE },
    { index: 1, source: '分镜2' },
    { index: 2, source: '分镜3' },
    { index: 3, source: '分镜4' },
  ])

  const handleBatchDrawing = () => {
    const wsDrawing = new WebSocketClient('ws://example.com/websocket/drawing')

    batchDrawingList.forEach((i) => wsDrawing.current.send(i))
    wsDrawing.current.onOpen = () => {
      console.log('绘图ws开启')
    }

    wsDrawing.current.onMessage = (data) => {
      console.log('已获取到绘图信息:', data)
      try {
        const parsedData = JSON.parse(data)
        if (parsedData.state === TRANS_STATE.ING) {
          // setBatchDrawingList 更新数据state
          setProgress(parsedData.progress)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    wsDrawing.current.onClose = () => {
      console.log('WebSocket closed')
    }

    wsDrawing.current.onError = (error) => {
      console.error('WebSocket error:', error)
    }

    wsDrawing.current.connect()
  }

  useEffect(() => {
    return () => {
      wsDrawing.current.close()
    }
  }, [])

  return (
    <div>
      <h1>ws demo</h1>
      <div onClick={handleBatchDrawing}>点击开启批量绘图</div>
      <div>
        {batchDrawingList.map((i) => (
          <div>
            分镜序号：<div>{i.index + 1}</div>
            分镜绘制状态：<div>{i}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WebSocketComponent
