import React, { useState, useRef, useEffect } from 'react'
import { Upload, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'

const { Dragger } = Upload

const Uploading = ({ setIsUploaded, fileParseInfoRef, setFileInfo }) => {
  const props = {
    name: 'file',
    accept: ['.txt', '.pdf', '.docx'],
    style: { height: '10%', display: 'flex' },
  }
  const [audioState, setAudioState] = useState(0)

  return (
    <>
      <div style={{ height: '100%' }}>
        <Dragger
          beforeUpload={() => false}
          onChange={async (info) => {
            setFileInfo({
              isEmpty: !info.file.size,
              name: info.file.name,
              size: `${parseInt(info.file.size / 1000)}kb`,
            })
            const formdata = new FormData()
            formdata.append('file', info.fileList[info.fileList.length - 1].originFileObj)
            fileParseInfoRef.current = formdata
            message.success(`${info.file.name} 上传成功`)
            setIsUploaded(true)
          }}
          {...props}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />·
          </p>
          <p className="ant-upload-text">单击或拖动.txt/.pdf/.docx文件到此区域</p>
        </Dragger>
      </div>
    </>
  )
}

export default Uploading
