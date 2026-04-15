import React, { useState, useRef } from 'react'
import './dragHeader.sass'
import { IconFont } from '../../common/iconfont'

export const DragHeader = ({ children, globalToken }) => {
  const [isWindowMaximize, setIsWindowMaximize] = useState(false)
  const oldXRef = useRef(0)
  const oldYRef = useRef(0)
  // 最大化
  const handleMaximize = async () => {
    if (!window.pywebview) return
    const maximizeState = await window.pywebview.api.maximize_window()
    setIsWindowMaximize(maximizeState)
  }
  // 最小化
  const handleMinimize = () => {
    if (!window.pywebview) return
    window.pywebview.api.minimize_window()
  }
  // 关闭窗口
  const handleClose = () => {
    if (!window.pywebview) return
    window.pywebview.api.close_window()
  }
  const handleMouseDown = (currentEvent) => {
    oldXRef.current = currentEvent.screenX / window.devicePixelRatio
    oldYRef.current = currentEvent.screenY / window.devicePixelRatio
    document.onmousemove = function (e) {
      const addX = e.screenX / window.devicePixelRatio - oldXRef.current
      const addY = e.screenY / window.devicePixelRatio - oldYRef.current
      oldXRef.current = e.screenX / window.devicePixelRatio
      oldYRef.current = e.screenY / window.devicePixelRatio
      window.pywebview.api.move_window(addX, addY)
    }
    document.onmouseup = function (e) {
      document.onmousemove = document.onmouseup = ''
    }
  }
  return (
    <div
      className="top-bar"
      style={{
        WebkitAppRegion: 'drag',
        background: globalToken.backgroundColor,
        color: globalToken.colorText,
      }}
      // onMouseDown={handleMouseDown}
    >
      <div className="topbar-left">{children}</div>
      <div className="windowIcon">
        {/* <IconFont
          type="icon-zuixiaohua"
          style={{ marginLeft: 20, cursor: 'pointer' }}
          onClick={handleMinimize}
        />
        {isWindowMaximize ? (
          <IconFont
            type="icon-zuidahua"
            style={{ marginLeft: 20, cursor: 'pointer' }}
            onClick={handleMaximize}
          />
        ) : (
          <IconFont
            type="icon-3zuidahua-1"
            style={{ marginLeft: 20, cursor: 'pointer' }}
            onClick={handleMaximize}
          />
        )}
        <IconFont
          type="icon-guanbi"
          style={{ marginLeft: 20, cursor: 'pointer' }}
          onClick={handleClose}
        /> */}
      </div>
    </div>
  )
}

export default DragHeader
