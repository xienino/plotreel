import { useState } from 'react'
import { Button, Image } from 'antd'

import { DeleteOutlined } from '@ant-design/icons'

const OpenPose = function ({ cIndex, projectId, openPose, setMediumData, mediumDataRef }) {
  const [openPoseActivate, setOpenPoseActivate] = useState(false)
  if (!openPose) {
    return (
      <div
        onMouseEnter={() => {
          setOpenPoseActivate(true)
        }}
        onMouseLeave={() => {
          setOpenPoseActivate(false)
        }}
        onClick={async () => {}}
        style={{
          height: 200,
          resize: 'none',
          // margin: 10,
          display: 'flex',
          overflow: 'auto',

          borderRadius: '6px',
          padding: '4px 11px',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: openPoseActivate ? 'rgba(0, 0, 0, 0.5)' : undefined,
          cursor: 'pointer',
          serSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {openPose}
        上传
      </div>
    )
  } else {
    return (
      <div
        style={{
          height: 200,
          resize: 'none',
          // margin: 10,
          display: 'flex',
          overflow: 'auto',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button
          style={{ position: 'absolute', right: 3, zIndex: 999, top: 3 }}
          type="text"
          icon={<DeleteOutlined />}
          onClick={async () => {}}
        />
        <Image
          style={{
            maxHeight: 200,
            WebkitUserSelect: 'none',
            cursor: 'move',
            backgroundColor: openPoseActivate ? 'rgba(0, 0, 0, 0.5)' : undefined,
          }}
          src={openPose}
          preview={{
            zIndex: 999,
          }}
          onDragOver={(e) => {
            e.preventDefault()
          }}
          onDragEnter={(e) => {
            e.preventDefault()
          }}
        />
      </div>
    )
  }
}

export default OpenPose
