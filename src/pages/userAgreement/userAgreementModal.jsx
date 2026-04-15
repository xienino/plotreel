import React from 'react'
import { Button, Modal } from 'antd'

const UserAgreementModal = ({ open, setOpen }) => {
  return (
    <div>
      <Modal
        title="用户协议"
        open={open}
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        width={600}
      >
        <p>这是用户协议的内容...</p>
      </Modal>
    </div>
  )
}

export default UserAgreementModal
