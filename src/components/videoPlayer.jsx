import React, { useState, useRef } from 'react'
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'

const VideoPlayer = ({ src }) => {
  const [showPlayBtn, setShowPlayBtn] = useState(false) // 是否显示视频播放/暂停键
  const [isPlaying, setIsPlaying] = useState(false) // 是否正在播放
  const videoRef = useRef(null) // 视频播放控制
  return (
    <div
      onMouseEnter={() => setShowPlayBtn(true)}
      onMouseLeave={() => setShowPlayBtn(false)}
      className="flex-center detailVideoWrap"
    >
      <video
        src={src}
        type="video/mp4"
        width="100%"
        height="100%"
        controlsList="nodownload"
        onEnded={() => setIsPlaying(false)}
        ref={videoRef}
      ></video>
      {showPlayBtn && !isPlaying && (
        <PlayCircleOutlined
          style={{ cursor: 'pointer', fontSize: '50px', position: 'absolute', opacity: '.6' }}
          onClick={() => {
            setIsPlaying(true)
            videoRef?.current?.play()
          }}
        />
      )}
      {showPlayBtn && isPlaying && (
        <PauseCircleOutlined
          style={{ cursor: 'pointer', fontSize: '50px', position: 'absolute', opacity: '.6' }}
          onClick={() => {
            setIsPlaying(false)
            videoRef?.current?.pause()
          }}
        />
      )}
    </div>
  )
}

export default VideoPlayer
