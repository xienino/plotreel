import React, { useState } from 'react'
import { Space, Checkbox } from 'antd'
import PrivacyPolicyModal from './privacyPolicyModal'
import UserAgreementModal from './userAgreementModal'

const UserAgreement = ({ setIsCheckedAgreement, isCheckedAgreement, isShowRegistRow }) => {
  const [agreementOpen, setAgreementOpen] = useState(false)
  const [policyOpen, setPolicyOpen] = useState(false)
  return (
    <Space
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <div>
        <Checkbox
          onChange={(e) => setIsCheckedAgreement(e.target.checked)}
          checked={isCheckedAgreement}
        ></Checkbox>{' '}
        我已阅读并同意
        <span
          style={{ color: '#5748B0', cursor: 'pointer' }}
          onClick={() => setAgreementOpen(true)}
        >
          {' '}
          用户协议{' '}
        </span>
        和
        <span style={{ color: '#5748B0', cursor: 'pointer' }} onClick={() => setPolicyOpen(true)}>
          {' '}
          隐私政策{' '}
        </span>
      </div>
      {isShowRegistRow && (
        <div style={{ textAlign: 'left' }}>
          未注册的手机号，将按照《用户协议》和《隐私政策》注册新账号
        </div>
      )}
      <UserAgreementModal open={agreementOpen} setOpen={setAgreementOpen} />
      <PrivacyPolicyModal open={policyOpen} setOpen={setPolicyOpen} />
    </Space>
  )
}

export default UserAgreement
