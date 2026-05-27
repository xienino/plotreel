import {
  Button,
  theme,
  Space,
  Tabs,
  Row,
  Col,
  Input,
  message,
  ConfigProvider,
  Checkbox,
} from 'antd'
import { ExperimentOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
// import { registerUser, getRegisterVerificationCode, login, genImgCaptcha } from '../services/index';
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { themeConfig } from '../layout/index'
import './login.sass'
import { SUCCESS_CODE } from '../assets/constant'
import api from '../services/project.jsx'
import UserAgreement from './userAgreement/userAgreement'
import DragHeader from '../components/DragHeader/DragHeader'

const pattern = /^(?![0-9]+$)(?=.*[A-Z])(?=.*[a-z])[0-9A-Za-z]{8,}$/

const globalToken = theme.getDesignToken(themeConfig)
const TIME_COUNT = 60 //更改倒计时时间

const Index = () => {
  const [phoneValue, setPhoneValue] = useState() // 手机号
  const [password, setPassword] = useState() // 密码
  const [passwordStatus, setPasswordStatus] = useState('')
  const [passwordValue2, setPasswordValue2] = useState() // 密码二次确认
  const [passwordStatus2, setPasswordStatus2] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [verificationCode, setVerificationCode] = useState() // 验证码
  const [seconds, setSeconds] = useState(0) // 验证码倒计时
  const [uuid, setUuid] = useState()
  const [isNewPassword, setIsNewPassword] = useState(false) // 是否是设置密码状态
  const [isFindPassword, setIsFindPassword] = useState(false) // 是否是找回密码状态
  const [isCheckedAgreement, setIsCheckedAgreement] = useState(false) // 是否勾选了用户协议与隐私政策

  const navigate = useNavigate()

  const handleRegister = async () => {
    // 注册方法
    if (!password || !passwordValue2) {
      message.error('请输入密码')
      return
    }
    if (password !== passwordValue2) {
      message.error('两次密码输入不一致')
      return
    }
    setLoginLoading(true)
    if (isFindPassword) {
      const res = await api.resetPwd({
        mobileNo: phoneValue,
        verifyCode: verificationCode,
        pwd: password,
        sysId: 'pnt',
        flagSrc: '0',
      })
      if (res?.data?.resCode === SUCCESS_CODE) {
        res?.data?.resMsg && message.error(res?.data?.resMsg[0].msgText)
        setLoginLoading(false)
        return
      }
      setIsFindPassword(false)
      handlePasswordLogin() // 密码登录
      return
    } else {
      const res = await api.autoLogin({
        // 用户-自动注册并登录接口
        mobileNo: phoneValue,
        loginPwd: password,
        flagSrc: '0',
      })
      if (res?.data?.resData?.mtk) {
        await api.setMtk({
          mtk: res.data.resData.mtk,
        })
        sessionStorage.setItem('account', phoneValue)
        sessionStorage.setItem('password', password)
        navigate('/project')
      }
    }
    setLoginLoading(false)
  }

  const handleLogin = async (event) => {
    if (!isCheckedAgreement) return
    // 登录方法
    const params = {
      account: phoneValue,
      vcode: verificationCode,
      flagSrc: '0', // 0客户端， 1服务端
      sysId: 'pnt',
      uuid: uuid,
    }
    const res = await api.loginByVcode(params)
    if (res.data.resData?.autoLogin) {
      setIsNewPassword(true)
    } else if (res?.data?.resData?.mtk) {
      await api.setMtk({
        mtk: res.data.resData.mtk,
        account: phoneValue,
        password: '',
      })
      sessionStorage.setItem('account', phoneValue)
      navigate('/project')
    } else {
      message.error(res.data?.resMsg?.msgText)
    }
  }
  const handlePasswordLogin = async () => {
    if (!isCheckedAgreement) return
    // 密码登录
    const res = await api.doLogin({
      account: phoneValue,
      pwd: password,
      flag: '0',
      sysId: 'pnt',
    })
    if (res.data.resData?.autoLogin) {
      setIsNewPassword(true)
    } else if (res?.data?.resData?.mtk) {
      await api.setMtk({
        mtk: res.data.resData.mtk,
        account: phoneValue,
        password: password,
      })
      sessionStorage.setItem('account', phoneValue)
      sessionStorage.setItem('password', password)
      navigate('/project')
    } else {
      message.error(res.data?.resMsg[0].msgText)
    }
  }
  const handleGetVerificationCode = async (scene) => {
    // todo 接口 校验验证码是否正确
    if (!phoneValue) {
      message.warning('请先输入手机号')
      return
    }
    const params = {
      mobileNo: phoneValue,
      scene,
    }
    const res = await api.sendVerifyCode(params)
    if (res.data.resData) {
      setUuid(res.data.resData.uuid)
      setSeconds(60)
    } else {
      message.error(res.data.resMsg[0].msgText)
    }
  }
  const handleResetPwd = async () => {
    // 跳转到修改密码页
    if (!phoneValue) return message.error('请输入手机号')
    if (!verificationCode) return message.error('请输入验证码')
    setIsNewPassword(true)
  }
  const changePassword1 = async (e) => {
    setPassword(e.target.value)
    if (!pattern.test(e.target.value)) {
      setPasswordStatus('error')
    } else {
      setPasswordStatus('')
    }
  }
  const changePassword2 = async (e) => {
    setPasswordValue2(e.target.value)
    if (!pattern.test(e.target.value)) {
      setPasswordStatus2('error')
    } else {
      setPasswordStatus2('')
    }
  }
  useEffect(() => {
    const account = sessionStorage.getItem('account')
    const password = sessionStorage.getItem('password')
    if (account && password) {
      setPhoneValue(account)
      setPassword(password)
    }
  }, [])
  useEffect(() => {
    const timerId = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1)
      } else {
        clearInterval(timerId)
      }
    }, 1000) // 每秒更新一次

    return () => {
      clearInterval(timerId)
    }
  }, [seconds])
  return (
    <>
      <ConfigProvider theme={themeConfig}>
        <div>
          <DragHeader globalToken={globalToken}></DragHeader>
        </div>
        <div
          style={{
            paddingTop: 40,
            background: globalToken.backgroundColor,
            height: '100%',
            width: '100%',
            position: 'fixed',
          }}
        >
          <div>
            <Space
              size="small"
              style={{
                left: 45,
                top: 80,
                position: 'absolute',
                fontSize: 25,
                fontWeight: 1000,
                color: '#525863',
                fontFamily: 'monospace',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
            >
              <ExperimentOutlined />
              <div>plotreel</div>
            </Space>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              height: '100%',
            }}
          >
            <div
              style={{
                background: globalToken.colorBgContainer,
                width: '350px',
                boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)',
                borderRadius: '10px',
                padding: '40px 60px',
                height: '320px',
              }}
            >
              <Space direction="vertical" size="large" style={{ display: 'flex' }}>
                <Row justify="center">
                  <Col>
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 380,
                        color: '#404653',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                      }}
                    >
                      欢迎使用
                      <span
                        style={{
                          fontWeight: 500,
                        }}
                      >
                        plotreel
                      </span>
                    </div>
                  </Col>
                </Row>
                <Tabs
                  defaultActiveKey="2"
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                  }}
                  items={
                    isFindPassword && !isNewPassword
                      ? [
                          {
                            key: '4',
                            label: '找回密码',
                            children: (
                              <>
                                <Space
                                  direction="vertical"
                                  size="large"
                                  style={{
                                    display: 'flex',
                                    marginTop: 25,
                                  }}
                                >
                                  <Space
                                    direction="vertical"
                                    size="middle"
                                    style={{ display: 'flex' }}
                                  >
                                    <Input
                                      size="large"
                                      spellCheck={false}
                                      placeholder="手机号"
                                      value={phoneValue}
                                      onChange={(e) => setPhoneValue(e.target.value)}
                                    />
                                    <Space.Compact style={{ width: '100%' }}>
                                      <Input
                                        size="large"
                                        placeholder="验证码"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                      />
                                      <Button
                                        size="large"
                                        disabled={seconds > 0}
                                        onClick={() => handleGetVerificationCode('reset')}
                                      >
                                        {seconds > 0 ? `${seconds}秒后重新获取` : '获取验证码'}
                                      </Button>
                                    </Space.Compact>
                                  </Space>
                                  <Space
                                    direction="vertical"
                                    size="small"
                                    style={{ display: 'flex' }}
                                  >
                                    <Button
                                      block
                                      size="large"
                                      type="primary"
                                      onClick={handleResetPwd}
                                      loading={loginLoading}
                                    >
                                      确认
                                    </Button>
                                    <Row justify="space-between">
                                      <Col></Col>
                                      <Col>
                                        <Button
                                          type="link"
                                          onClick={() => setIsFindPassword(false)}
                                          icon={<ArrowLeftOutlined />}
                                          style={{
                                            color: '#7256E4',
                                          }}
                                        >
                                          返回验证码登录
                                        </Button>
                                      </Col>
                                    </Row>
                                  </Space>
                                </Space>
                              </>
                            ),
                          },
                        ]
                      : isNewPassword
                        ? [
                            {
                              key: '3',
                              label: '设置密码',
                              children: (
                                <>
                                  <Space
                                    direction="vertical"
                                    size="large"
                                    style={{
                                      display: 'flex',
                                      marginTop: 25,
                                    }}
                                  >
                                    <Space
                                      direction="vertical"
                                      size="middle"
                                      style={{ display: 'flex' }}
                                    >
                                      <Input.Password
                                        size="large"
                                        placeholder="密码"
                                        value={password}
                                        status={passwordStatus}
                                        onChange={changePassword1}
                                      />
                                      {passwordStatus && (
                                        <div
                                          style={{
                                            textAlign: 'start',
                                          }}
                                        >
                                          大小写字母及数字且八位以上,不能为空
                                        </div>
                                      )}
                                    </Space>
                                    <Space
                                      direction="vertical"
                                      size="middle"
                                      style={{ display: 'flex' }}
                                    >
                                      <Input.Password
                                        size="large"
                                        placeholder="密码"
                                        value={passwordValue2}
                                        status={passwordStatus2}
                                        onChange={changePassword2}
                                      />
                                      {passwordStatus2 && (
                                        <span
                                          style={{
                                            textAlign: 'start',
                                          }}
                                        >
                                          大小写字母及数字且八位以上,不能为空
                                        </span>
                                      )}
                                    </Space>
                                    <Space
                                      direction="vertical"
                                      size="small"
                                      style={{ display: 'flex' }}
                                    >
                                      <Button
                                        block
                                        size="large"
                                        type="primary"
                                        onClick={handleRegister}
                                        loading={loginLoading}
                                      >
                                        确认并登录
                                      </Button>
                                      <Row justify="space-between">
                                        <Col></Col>
                                        <Col>
                                          <Button
                                            type="link"
                                            onClick={() => {
                                              setIsNewPassword(false)
                                              setIsFindPassword(false)
                                            }}
                                            icon={<ArrowLeftOutlined />}
                                            style={{
                                              color: '#7256E4',
                                            }}
                                          >
                                            返回验证码登录
                                          </Button>
                                        </Col>
                                      </Row>
                                    </Space>
                                  </Space>
                                </>
                              ),
                            },
                          ]
                        : [
                            {
                              key: '1',
                              label: '验证码登录',
                              children: (
                                <>
                                  <Space
                                    direction="vertical"
                                    size="large"
                                    style={{
                                      display: 'flex',
                                      marginTop: 25,
                                    }}
                                  >
                                    <Space
                                      direction="vertical"
                                      size="middle"
                                      style={{
                                        display: 'flex',
                                      }}
                                    >
                                      <Input
                                        size="large"
                                        spellCheck={false}
                                        placeholder="手机号"
                                        value={phoneValue}
                                        onChange={(e) => setPhoneValue(e.target.value)}
                                      />
                                    </Space>
                                    <Space.Compact
                                      style={{
                                        width: '100%',
                                      }}
                                    >
                                      <Input
                                        size="large"
                                        placeholder="验证码"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                      />
                                      <Button
                                        size="large"
                                        disabled={seconds > 0}
                                        onClick={() => handleGetVerificationCode('login')}
                                      >
                                        {seconds > 0 ? `${seconds}秒后重新获取` : '获取验证码'}
                                      </Button>
                                    </Space.Compact>
                                    <UserAgreement
                                      isShowRegistRow={true}
                                      setIsCheckedAgreement={setIsCheckedAgreement}
                                      isCheckedAgreement={isCheckedAgreement}
                                    />
                                    <Space
                                      direction="vertical"
                                      size="small"
                                      style={{ display: 'flex' }}
                                    >
                                      <Button
                                        block
                                        size="large"
                                        type="primary"
                                        onClick={handleLogin}
                                        loading={loginLoading}
                                      >
                                        登录
                                      </Button>
                                    </Space>
                                  </Space>
                                </>
                              ),
                            },
                            {
                              key: '2',
                              label: '密码登录',
                              children: (
                                <>
                                  <Space
                                    direction="vertical"
                                    size="large"
                                    style={{
                                      display: 'flex',
                                      marginTop: 25,
                                    }}
                                  >
                                    <Space
                                      direction="vertical"
                                      size="middle"
                                      style={{ display: 'flex' }}
                                    >
                                      <Input
                                        size="large"
                                        placeholder="手机号"
                                        value={phoneValue}
                                        onChange={(e) => setPhoneValue(e.target.value)}
                                      />
                                    </Space>
                                    <Space
                                      direction="vertical"
                                      size="middle"
                                      style={{ display: 'flex' }}
                                    >
                                      <Input.Password
                                        size="large"
                                        placeholder="密码"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                      />
                                    </Space>
                                    <UserAgreement
                                      setIsCheckedAgreement={setIsCheckedAgreement}
                                      isCheckedAgreement={isCheckedAgreement}
                                    />
                                    <Space
                                      direction="vertical"
                                      size="small"
                                      style={{ display: 'flex' }}
                                    >
                                      <Button
                                        block
                                        size="large"
                                        type="primary"
                                        onClick={handlePasswordLogin}
                                        loading={loginLoading}
                                      >
                                        登录
                                      </Button>
                                      <Row justify="space-between">
                                        <Col></Col>
                                        <Col>
                                          <Button
                                            type="link"
                                            onClick={() => setIsFindPassword(true)}
                                            style={{
                                              color: '#7256E4',
                                            }}
                                          >
                                            忘记密码
                                          </Button>
                                        </Col>
                                      </Row>
                                    </Space>
                                  </Space>
                                </>
                              ),
                            },
                          ]
                  }
                />
              </Space>
            </div>
          </div>
        </div>
      </ConfigProvider>
    </>
  )
}

export default Index
