import React, { useState, useEffect } from 'react'
import { message, Button, Input, Segmented, Modal, ConfigProvider, Image } from 'antd'

const ProtocolModal = ({ protocolOpen, setProtocolOpen }) => {
  return (
    <div>
      <Modal
        title="充值协议"
        open={protocolOpen}
        onOk={() => setProtocolOpen(false)}
        onCancel={() => setProtocolOpen(false)}
        width={600}
      >
        <p>这是充值协议的内容...</p>
      </Modal>
    </div>
  )
}

export default ProtocolModal
