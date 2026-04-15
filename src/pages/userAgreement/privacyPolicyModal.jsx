import React from 'react'
import { Button, Modal } from 'antd'

const PrivacyPolicy = ({ open, setOpen }) => {
  return (
    <div>
      <Modal
        title="隐私政策"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width={600}
      >
        <p>这是隐私政策的内容...</p>
      </Modal>
    </div>
  )
}

export default PrivacyPolicy
