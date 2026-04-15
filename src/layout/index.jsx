import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ReloadOutlined, SettingOutlined, PayCircleOutlined, LeftOutlined } from '@ant-design/icons'
import {
  Descriptions,
  Button,
  theme,
  Space,
  Modal,
  Avatar,
  ConfigProvider,
  Image,
  Progress,
} from 'antd'
import { message, Tooltip } from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import { IconFont } from '../common/iconfont'
import Settings from '../pages/settings'
import './index.sass'
import logoicon from '../assets/logoicon.png'
import defaultAvator from '../assets/defaultAvator.png'
import api from '../services/project'
import PayModal from './payModal'
import DragHeader from '../components/DragHeader/DragHeader.jsx'
import {
  LACK_GOLD_CODE,
  NETWORK_ERR,
  LOGOUT_CODE,
  dstcode,
  dstcodeUrl,
  ERROR_CODE,
  MSG_CODE,
  SUCCESS_CODE,
} from '../assets/constant'
import axios from 'axios'
import Recharge from '../pages/recharge/recharge'

export const themeConfig = {
  token: {
    // z组件容器的背景色
    colorBgContainer: '#121212',
    // layout组件的背景色，例如 Protable, Segmented 的背景
    colorBgLayout: '#323234',
    // 浮层容器背景色
    // colorBgElevated: '#1B1B1C',
    // 字体颜色
    colorText: '#C2CAC6',
    // 第三级文本色一般用于描述性文本，例如表单的中的补充说明文本
    colorTextTertiary: '#C2CAC6',
    // 主要颜色
    colorPrimary: 'rgba(87,72,176,1)',
    // 背景色
    backgroundColor: '#121212',
    // linkHoverBg: '#8276C9',

    // contentBg: '#191A23',
    // footerBg: '#191A23',
    //Tooltip 的背景色
    colorBgSpotlight: '#070709',
    // 自定义
    colorMenu: '#1B1B1C',
    darkItemSelectedBg: '#32304b',
    colorDisplayContainer: '#29292D',
    // controlInteractiveSize: 18
    // 用于表示操作成功的 Token 序列，如 Result、Progress 等组件会使用该组梯度变量
    colorSuccess: '#7256E4',

    // 菜单 1B1B1C
    // 主要颜色 00C1CD
    // 背景 121212
    // 容器悬浮 070709

    // colorBorder: '#ffffff',
    // defaultColor: '#8276C9',
    // defaultGhostBorderColor	: null,
    // borderRadius: 0,
    // padding:0,
    // paddingXXS: 0,
    // paddingXS: 0,
    // paddingSM: 0,
    // paddingContentVerticalLG	: 0,
    // cellPaddingBlock:0,
    // headerBorderRadius:0,
  },
  components: {
    Button: {
      // primaryColor: "rgba(87,72,176,1)", // 主题色-按钮颜色
    },
    Segmented: {
      // trackBg: '#323234',
      itemColor: 'white',
    },
    Radio: {
      radioSize: 18,
    },
    Progress: {
      defaultColor: '#7256E4',
    },
  },

  algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
}
const globalToken = theme.getDesignToken(themeConfig)

const MyLayout = ({
  loraList,
  setLoraList,
  setDrawingSdState,
  setJianYingState,
  jianYingState,
  drawingModel,
  setDrawingModel,
  modelName,
  drawingSdState,
  setModelName,
  sdConfig,
  setSdConfig,
  sdTemplateOptionsCloud,
  setSdTemplateOptionsCloud,
  videoTemplateOptionsCloud,
  setVideoTemplateOptionsCloud,
}) => {
  const [userInfoModalState, setUserInfoModalState] = useState(false)
  const [settingModalOpen, setSettingModalOpen] = useState(false)
  const [userInfo, setUserInfo] = useState({})
  const [currentMtk, setCurrentMtk] = useState()
  const [coinSum, setCoinSum] = useState(0)
  const [payModal, setPayModal] = useState(false) // 算币详情弹窗
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [open, setOpen] = useState(false) // 算币不足提示弹窗
  const [modal, contextHolder] = Modal.useModal()

  const [enquiryImgCost, setEnquiryImgCost] = useState() // 智绘云-每张图扣除的算币
  const [enquiryVideoCost, setEnquiryVideoCost] = useState() // 智绘云-每个视频扣除的算币
  const [nextBtnLoading, setNextBtnLoading] = useState(false)
  const [isNextPage, setIsNextPage] = useState(false) // true 算币充值页; false 算币列表页
  const [isInit, setIsInit] = useState(false)
  const [mtk, setMtk] = useState()

  // 版本更新相关
  const [updaterModal, setUpdaterModal] = useState(false) // 版本更新弹窗
  const [progressIntervalId, setProgressIntervalId] = useState() // 更新下载进度定时器
  const [updateProgress, setUpdateProgress] = useState(0) // 版本更新百分比
  const [version, setVersion] = useState('') // 最新的版本号
  const [packageUrl, setPackageUrl] = useState('') // 升级包地址
  const [pkgSize, setPkgSize] = useState(0) // 更新包总大小
  const [currentPkgSize, setCurrentPkgSize] = useState(0) // 实时已下载更新包大小

  // const pageNum = useRef(1) // 页码
  const navigate = useNavigate()

  const baseUrl = useRef()
  const expireTimer = useRef()
  const statusTimer = useRef()
  const childRef = useRef(null)
  const settingRef = useRef()
  const payModalRef = useRef()

  const logout = async () => {
    const account = sessionStorage.getItem('account')
    const password = sessionStorage.getItem('password')
    await Promise.all([
      api.doLogout({}),
      api.setMtk({
        mtk: '',
        account,
        password,
      }),
    ])
    navigate('/login')
  }

  // 创建一个axios实例
  const instance = axios.create({
    timeout: 10000 * 60, // 设置请求超时时间1min
  })

  // 添加请求拦截器
  // let store_count = 0
  instance.interceptors.request.use(
    async (config) => {
      if (!config.baseURL) {
        baseUrl.current = process.env.REACT_APP_ENDPOINT
        config.baseURL = baseUrl.current
      }
      // return config;

      // const { loading = true, timeout, ip } = config
      // if (loading) {
      //     store_count++
      //     store.commit('store_loading', store_count)
      // }
      // if(ip) config.headers['X-Custom-Forwarded-For'] = ip
      config.headers.mtk = mtk
      if (dstcodeUrl.indexOf(config.url) > -1) {
        config.headers.dstcode = dstcode
      }
      return config
    },
    (e) => {
      // if (store_count != 0) {
      //     store_count--
      //     store.commit('store_loading', store_count)
      // }
      return Promise.reject(e)
    },
  )

  // 添加响应拦截
  instance.interceptors.response.use(
    (response) => {
      const msg = response?.data?.resMsg[0]
      if (response?.data?.resCode === LOGOUT_CODE || msg?.msgCode === MSG_CODE.LOGIN_EXPIRE) {
        navigate('/login')
        if (!isFirstLogin) {
          message.error('登录已过期')
          setIsFirstLogin(false)
        }
        return Promise.resolve(response)
      }
      if (
        response?.data?.resCode === LACK_GOLD_CODE ||
        response?.data?.resMsg[0]?.msgCode == MSG_CODE.COST_ERROR
      ) {
        openCoinConfirm()
      }
      if (response?.data?.resCode === NETWORK_ERR) {
        message.error('智绘连接失败，请检查网络')
      }
      return response
    },
    async (e) => {
      if (e.response && e.response.status === 500) {
        message.error('服务异常，请稍后再试~')
        console.log('服务异常')
      } else {
        return Promise.reject(e)
      }
    },
  )
  const handleCoinConfirmOk = () => {
    setPayModal(true)
    setIsNextPage(true)
    setOpen(false)
  }
  const openCoinConfirm = () => {
    if (!open) setOpen(true)
  }
  const changeVideoModelForCloud = (value) => {
    if (settingRef?.current?.handleVideoChange) {
      settingRef?.current?.handleVideoChange(value)
    }
  }

  window.axiosInstance = instance
  const checkCoin = () => {
    if (enquiryImgCost > coinSum) {
      openCoinConfirm()
      return true
    }
  }
  const updateAccountInfo = () => {
    api.getAccountInfo().then((res) => {
      if (res?.data?.resData) {
        setCoinSum(res?.data?.resData?.balance || 0)
      } else {
        // message.error(res?.data?.resMsg[0]?.msgText)
      }
    })
  }

  const checkPaintingApiState = async () => {
    return childRef?.current?.checkPaintingApiState()
  }

  const upgradeLast = async () => {
    const res = await api.upgradeLast()
    const { remark, upgradeType } = res?.data?.resData || {}
    if (!version) return
    setVersion(res?.data?.resData?.version)
    setPackageUrl(res?.data?.resData?.packageUrl)
    const checkRes = await api.updaterCheck({
      version: res?.data?.resData?.version,
    })
    // resCode: 1需要执行更新 0不需要; upgradeType: 更新方式 0全量(强制)更新 1热更新
    if (checkRes?.data?.resCode === SUCCESS_CODE) {
      const remarkInfo = remark ? JSON.parse(remark) : {}
      const modalParam = {
        title: remarkInfo?.title || '更新',
        content: (
          <div>
            {remarkInfo?.contents?.map((item, i) => {
              return <div key={i}>{item}</div>
            })}
          </div>
        ),
        cancelText: '暂不考虑',
        okText: '立即升级',
      }
      let modalRes = false
      if (upgradeType === 0) {
        modalRes = await modal.info(modalParam) // 强制更新提示弹窗
      } else {
        modalRes = await modal.confirm(modalParam) // 非强制更新提示弹窗
      }
      if (!modalRes) return
      // 立即更新
      setUpdaterModal(true)
      clearInterval(progressIntervalId)
      const id = setInterval(async () => {
        const progressRes = await api.checkUpdateProgress()
        if (progressRes?.data?.resCode === SUCCESS_CODE) {
          setUpdateProgress(progressRes?.data?.resData?.progress || 0) // 更新下载进度条
          if (progressRes?.data?.resData?.progress === 100) {
            updateNow()
          }
        }
      }, 1000)
      setProgressIntervalId(id)
    } else {
      console.log('无需更新')
    }
  }
  const stopUpdate = async () => {
    modal
      .confirm({
        title: '中断更新？',
        content: '中断后将会自动删除已下载的内容，下次更新将重新下载。',
        cancelText: '中断',
        okText: '我再想想',
      })
      .then((res) => {
        if (!res) {
          setUpdaterModal(false) // 关闭更新进度展示弹窗
        }
      })
  }
  const updateNow = async () => {
    setUpdaterModal(false) // 关闭更新进度展示弹窗
    clearInterval(progressIntervalId)
    const isRestart = await modal.confirm({
      title: '',
      content: '安装成功，重启应用打开新版本？',
      cancelText: '否',
      okText: '是',
    })
    if (isRestart) {
      const updRes = await api.updater({
        version: version,
        packageUrl: packageUrl,
      })
      // msgCode 0成功更新 1已是最新版本 2出错
      if (updRes?.data?.resCode === SUCCESS_CODE && updRes?.data?.resMsg?.msgCode === 0) {
        Modal.destroyAll()
        window?.pywebview?.api?.close_window()
      }
    }
  }

  const initConfig = async () => {
    const res = await api.getModelPage({
      pageNum: 1,
      pageSize: 200,
    })

    const imgOptions =
      res?.data?.resData?.rows
        .filter((i) => {
          return i.type === 1 // 1绘图 2 图转视频
        })
        .map((i) => {
          const extra = JSON.parse(i.extra)
          return {
            value: i.name,
            label: i.remark,
            steps: extra.steps,
            cfg_scale: extra.cfg_scale,
            modelFee: extra?.modelFee,
          }
        }) || []
    const videoOptions = res?.data?.resData?.rows
      .filter((i) => {
        return i.type === 2 // 1绘图 2图转视频
      })
      .map((i) => {
        const extra = JSON.parse(i.extra)
        return {
          value: i.name,
          label: i.remark,
          modelFee: extra?.modelFee,
        }
      })
    setSdTemplateOptionsCloud(imgOptions)
    setVideoTemplateOptionsCloud(videoOptions)
  }

  useEffect(() => {
    upgradeLast()
    api.getMtk({}).then((res) => {
      if (res?.data?.resData?.account && res?.data?.resData?.password) {
        sessionStorage.setItem('account', res?.data?.resData?.account)
        sessionStorage.setItem('password', res?.data?.resData?.password)
      }
      if (res?.data?.resCode === ERROR_CODE || !res?.data?.resData?.mtk) {
        setIsFirstLogin(true)
        navigate('/login')
      } else {
        setMtk(res?.data?.resData?.mtk)
        setCurrentMtk(res?.data?.resData?.mtk)
      }
    })
  }, [])
  useEffect(() => {
    if (mtk) {
      updateAccountInfo()
      initConfig().then((res) => {
        setIsInit(true)
      })
    }
  }, [mtk])

  useEffect(() => {
    if (payModal) {
      updateAccountInfo()
      payModalRef?.current?.initCurrencyList()
    }
  }, [payModal])

  const handleRecharge = async () => {
    // 充值
    setIsNextPage(true)
  }

  return (
    <ConfigProvider theme={themeConfig}>
      <div className="layout-container">
        <DragHeader globalToken={globalToken}>
          <div className="flex-center">
            <div
              style={{
                fontSize: 15,
                fontWeight: 1000,
                color: globalToken.colorText,
                fontFamily: 'monospace',
                paddingLeft: 8,
                paddingRight: 50,
              }}
            >
              <Space size="small">
                <Image src={logoicon} width={25} preview={false} />
              </Space>
            </div>
            {isInit && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 1000,
                  fontFamily: 'monospace',
                }}
              >
                {!drawingSdState ? (
                  <div style={{ color: '#FF4222' }}> 未连接服务 </div>
                ) : drawingModel === 'cloud' ? (
                  <div style={{ color: 'green' }}>智绘云-{modelName}</div>
                ) : drawingModel === 'custom' ? (
                  <div style={{ color: 'green' }}>本地服务-已连接</div>
                ) : (
                  ''
                )}
              </div>
            )}
          </div>
          <div>
            <Space size="small">
              <Tooltip title="刷新">
                <Button
                  icon={<ReloadOutlined />}
                  type="text"
                  style={{
                    WebkitAppRegion: 'no-drag',
                    cursor: nextBtnLoading ? 'not-allowed' : 'auto',
                  }}
                  onClick={() => {
                    if (nextBtnLoading) return
                    window.location.reload()
                  }}
                />
              </Tooltip>
              <Tooltip title="设置">
                <Button
                  icon={<SettingOutlined />}
                  type="text"
                  style={{
                    WebkitAppRegion: 'no-drag',
                    marginRight: 17,
                    cursor: nextBtnLoading ? 'not-allowed' : 'auto',
                  }}
                  onClick={() => {
                    if (nextBtnLoading) return
                    setSettingModalOpen(!settingModalOpen)
                  }}
                />
              </Tooltip>
              <Tooltip title="算币">
                <div
                  className="payTipWrap"
                  onClick={() => {
                    setIsNextPage(false)
                    setPayModal(true)
                  }}
                >
                  <PayCircleOutlined />
                  <div className="coinSum">{coinSum}</div>
                  {/* <Button
                                        size='small'
                                        variant="outlined"
                                        style={{
                                            WebkitAppRegion: 'no-drag',
                                        }}
                                    >签到</Button> */}
                </div>
              </Tooltip>
              <div
                style={{
                  WebkitAppRegion: 'no-drag',
                  cursor: 'pointer',
                  serSelect: 'none',
                  WebkitUserSelect: 'none',
                  marginLeft: 7,
                }}
                onClick={() => {
                  setUserInfo({
                    account: sessionStorage.getItem('account'),
                  })
                  setUserInfoModalState(true)
                }}
              >
                <Avatar style={{ verticalAlign: 'middle' }} alt="智绘" src={defaultAvator}>
                  名
                </Avatar>
              </div>
            </Space>
          </div>
        </DragHeader>
        <div
          className="outlet-container"
          style={{
            height: '100%',
            background: globalToken.colorBgContainer,
            top: 40,
          }}
        >
          <div
            style={{ position: 'absolute', bottom: 50, left: 10, fontSize: 14, color: '#B2B5C3' }}
          >
            test-2.2.1-beta.20250515
          </div>
          {currentMtk && (
            <Outlet
              context={{
                sdConfig,
                videoTemplateOptionsCloud,
                changeVideoModelForCloud,
                checkPaintingApiState,
                enquiryImgCost,
                enquiryVideoCost,
                updateAccountInfo,
                checkCoin,
                nextBtnLoading,
                setNextBtnLoading,
              }}
            />
          )}
        </div>
        <Modal
          title="账号信息"
          open={userInfoModalState}
          onCancel={() => setUserInfoModalState(!userInfoModalState)}
          footer={null}
          zIndex={999}
          centered={true}
          maskClosable={false}
        >
          <Descriptions
            column={1}
            size="default"
            bordered
            items={[
              {
                key: '0',
                label: '手机号',
                children: userInfo.account,
              },
            ]}
          ></Descriptions>
          <br />
          <Button
            style={{ padding: 6 }}
            type="dashed"
            block
            onClick={() => {
              logout()
            }}
          >
            退出登录
          </Button>
        </Modal>
        <Modal
          classNames={{
            content: 'payModalWrap',
          }}
          title={
            isNextPage ? (
              <div className="payModalTitle">
                <div
                  onClick={() => {
                    setIsNextPage(false)
                    clearInterval(statusTimer.current)
                    clearInterval(expireTimer.current)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <LeftOutlined />
                  <span style={{ paddingLeft: 8 }}>返回详情</span>
                </div>
              </div>
            ) : (
              <div className="payModalTitle">
                剩余算币：{coinSum}
                <Button style={{ marginLeft: 20 }} onClick={handleRecharge}>
                  充值
                </Button>
              </div>
            )
          }
          open={payModal}
          onCancel={() => {
            clearInterval(statusTimer.current)
            clearInterval(expireTimer.current)
            setIsNextPage(false)
            setPayModal(false)
            sessionStorage.setItem('memberData', JSON.stringify({}))
          }}
          footer={null}
          centered={true}
          maskClosable={false}
        >
          {isNextPage ? (
            <Recharge
              setPayModal={setPayModal}
              updateAccountInfo={updateAccountInfo}
              expireTimer={expireTimer}
              statusTimer={statusTimer}
            ></Recharge>
          ) : (
            <PayModal
              payModal={!!payModal}
              sdTemplateOptionsCloud={sdTemplateOptionsCloud}
              childRef={payModalRef}
            />
          )}
        </Modal>
        <Modal
          title=""
          open={open}
          onOk={handleCoinConfirmOk}
          onCancel={() => setOpen(false)}
          okText="前往"
          cancelText="取消"
          zIndex={2000}
        >
          <p>算币不足，请前往充值</p>
        </Modal>
        {currentMtk && (
          <Settings
            sdTemplateOptionsCloud={sdTemplateOptionsCloud}
            setSdConfig={setSdConfig}
            sdConfig={sdConfig}
            videoTemplateOptionsCloud={videoTemplateOptionsCloud}
            setVideoTemplateOptionsCloud={setVideoTemplateOptionsCloud}
            childRef={childRef}
            enquiryImgCost={enquiryImgCost}
            setEnquiryImgCost={setEnquiryImgCost}
            enquiryVideoCost={enquiryVideoCost}
            setEnquiryVideoCost={setEnquiryVideoCost}
            setModelName={setModelName}
            setDrawingModel={setDrawingModel}
            drawingSdState={drawingSdState}
            setDrawingSdState={setDrawingSdState}
            setIsInit={setIsInit}
            setJianYingState={setJianYingState}
            jianYingState={jianYingState}
            loraList={loraList}
            setLoraList={setLoraList}
            modalOpen={settingModalOpen}
            setModalOpen={setSettingModalOpen}
            settingRef={settingRef}
          />
        )}
        <Modal
          title="版本升级"
          open={updaterModal}
          onCancel={stopUpdate}
          footer={null}
          zIndex={999}
          centered={true}
          maskClosable={false}
        >
          <div>
            正在下载{version}版本
            {currentPkgSize}MB/{pkgSize}MB({updateProgress}%)
            <Progress percent={updateProgress} showInfo={false} />
          </div>
        </Modal>
      </div>
      {contextHolder}
    </ConfigProvider>
  )
}

export default MyLayout
