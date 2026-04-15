import {
  Row,
  Col,
  Space,
  Button,
  Modal,
  Tabs,
  Input,
  message,
  Collapse,
  Spin,
  Descriptions,
  Select,
  InputNumber,
  Radio,
} from 'antd'
import { EyeTwoTone, EyeInvisibleOutlined, SyncOutlined, RedoOutlined } from '@ant-design/icons'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import api from '../services/project'
import IntegerStep from '../components/integerStep'
import debounce from 'lodash.debounce'
import { SUCCESS_CODE, SD_TYPE } from '../assets/constant'

const Settings = ({
  modalOpen,
  setModalOpen,
  setLoraList,
  setDrawingSdState,
  setJianYingState,
  jianYingState,
  setDrawingModel,
  setModelName,
  enquiryImgCost,
  setEnquiryImgCost,
  enquiryVideoCost,
  setEnquiryVideoCost,
  setIsInit,
  childRef,
  setSdConfig,
  sdConfig,
  videoTemplateOptionsCloud,
  settingRef,
  sdTemplateOptionsCloud,
}) => {
  const [sdTemplate, setSdTemplate] = useState() // 当前选择的大模型
  const [drawVaeValue, setDrawVaeValue] = useState('Automatic') // 当前选择的VAE
  const [drawSampleValue, setDrawSampleValue] = useState() // 当前选择的采样方法
  const [scheduler, setScheduler] = useState() // 当前选择的调度类型
  const [stepValue, setStepValue] = useState(25) // 当前的迭代步数
  const [promptWeightValue, setPromptWeightValue] = useState(7) // 当前的提示词引导系数
  const [drawSeedValue, setDrawSeedValue] = useState(-1) // 当前选择的随机种子
  const [nIter, setNIter] = useState(1) // 当前选择的生成数量

  const [vaeOptions, setVaeOptions] = useState([]) // VAE选择列表
  const [drawSampleOptions, setDrawSampleOptions] = useState([]) // 采样方法列表
  const [availableSchedulers, setAvailableSchedulers] = useState([]) // 调度类型列表
  const [changeModelLoading, setChangeModelLoading] = useState(false)
  const [sdTemplateOptions, setSdTemplateOptions] = useState([])
  const [sdWebUrl, setSdWebUrl] = useState()
  const [sdWebState, setSdWebState] = useState(false) // 本地sd是否启动
  const [materialRoot, setMaterialRoot] = useState(undefined) // 视频存储路径
  const [jianYingRoot, setJianYingRoot] = useState('') // 剪映草稿地址
  const [sdUserName, setSdUserName] = useState()
  const [sdPassword, setSdPassword] = useState()
  const [sdAuthState, setSdAuthState] = useState(false)
  const [drawModel, setDrawModel] = useState('') // 绘图模式
  const [tab, setTab] = useState('') // 当前绘图模式所选tab页
  const [loading, setLoading] = useState(false)

  // 云端
  const [cloudSdState, setCloudSdState] = useState(false) // 智绘云是否启动
  const [sdTemplateCloud, setSdTemplateCloud] = useState([]) // 当前所选绘图大模型
  const [videoTemplateCloud, setVideoTemplateCloud] = useState([]) // 视频大模型

  const [sdType, setSdType] = useState() // sd为0(默认), flux为1

  const handleOk = () => {
    setModalOpen(false)
  }
  const handleCancel = () => {
    setModalOpen(false)
  }
  const refreshJianYingRoot = async () => {
    const res = await api.saveJianyingAddress({
      jianyingDraftPath: jianYingRoot,
    })
    setJianYingState(res?.data?.resCode == SUCCESS_CODE)

    if (res?.data?.resCode != SUCCESS_CODE) {
      message.error('未检测到剪映，请确认剪映地址是否正确')
    } else {
      message.success('检测成功')
    }
  }

  const handleCheckSdWeb = async () => {
    // 本地sd检测环境
    setLoading(true)
    try {
      const params = {
        sd_url: sdWebUrl,
      }
      if (sdUserName || sdPassword) {
        params.username = sdUserName
        params.password = sdPassword
      }
      const { data } = await api.connectSd(params)
      if (data.resCode === SUCCESS_CODE) {
        message.success('stable diffusion连接成功')
        await changeSdWebUrl(sdWebUrl)
        setSdWebState(true)
        setDrawingSdState(true)
        setDrawModel(tab)
        initSdConfig()
      } else {
        message.error('stable diffusion连接失败')
        setSdWebState(false)
        setDrawingSdState(false)
      }
    } catch (e) {
      message.error('stable diffusion连接失败')
    }
    setLoading(false)
  }
  const changeVideoModelForCloud = async (value) => {
    // 更改智绘云视频模型
    setChangeModelLoading(true)
    const target = videoTemplateOptionsCloud?.find((i) => i.value === value)
    await api.setCloudModel({
      model: value,
      mode: 1, // 为0表示连绘画模型 为1表示连视频模型
    })
    const res = await api.getPaintingApiState({})
    setVideoTemplateCloud(value)
    setEnquiryVideoCost(target.modelFee)
    if (res?.data?.resCode == SUCCESS_CODE) {
      setCloudSdState(true)
      setDrawingSdState(true)
      setSdConfig({
        ...sdConfig,
        videoModel: value,
      })
      message.success(`智绘云${target.label}连接成功`)
    } else {
      setCloudSdState(false)
      setDrawingSdState(false)
      message.error(`智绘云${target?.label}连接失败，请稍后重试`)
    }
    setChangeModelLoading(false)
  }

  const changeSdModelForCloud = async (value) => {
    // 更改智绘云绘画模型
    if (!drawModel) setDrawingModel('cloud')
    setIsInit(true)
    const target = sdTemplateOptionsCloud?.find((i) => i.value === value)
    const setRes = await api.setCloudModel({
      remark: target.label,
      model: value,
      steps: target.steps,
      cfg_scale: target.cfg_scale,
      seed: -1,
      mode: 0, // 为0表示连绘画模型 为1表示连视频模型
    })
    console.log('setRes: ', setRes)
    if (setRes?.data?.resCode !== SUCCESS_CODE) {
      setCloudSdState(false)
      setDrawingSdState(false)
      message.error(`智绘云${target?.label}连接失败，请稍后重试`)
      return
    }
    const res = await api.getPaintingApiState({})
    setSdTemplateCloud(value)
    setSdConfig({
      ...sdTemplateOptionsCloud.find((i) => i.value === value),
      videoModel: sdConfig?.videoModel,
    })
    console.log('target: ', target)
    if (target?.label) {
      setModelName(target?.label)
      console.log('更新左上角名字：', target?.label)
    } else {
      message.error('智绘云连接报错')
    }
    setEnquiryImgCost(target.modelFee)
    if (res?.data?.resCode == SUCCESS_CODE) {
      setCloudSdState(true)
      setDrawingSdState(true)
      setDrawModel(tab)
      message.success(`智绘云${target?.label}连接成功`)
    } else {
      setCloudSdState(false)
      setDrawingSdState(false)
      message.error(`智绘云${target?.label}连接失败，请稍后重试`)
    }
  }

  useEffect(() => {
    if (drawModel) {
      setDrawingModel(drawModel)
    }
  }, [drawModel])

  useEffect(() => {
    setTab()
  }, [])

  useEffect(() => {
    initSdConfig()
    getPath()
    initJianying()
  }, [])

  useEffect(() => {
    initSdConfigCloud().then((res) => {
      setIsInit(true)
    })
  }, [sdTemplateOptionsCloud, videoTemplateOptionsCloud])

  React.useImperativeHandle(settingRef, () => ({
    handleVideoChange,
  }))
  const handleVideoChange = async (value) => {
    changeVideoModelForCloud(value)
  }

  const getPath = async () => {
    const res = await api.getShootingPath({})
    if (res?.data?.path) {
      setMaterialRoot(res?.data?.path)
    }
  }

  const initJianying = async () => {
    const res = await api.getJianyingConfig({})
    if (res?.data?.resData?.jianying) {
      setJianYingState(res?.data?.resData?.jianying)
      setJianYingRoot(res?.data?.resData?.jianyingDraftPath || '')
    }
  }
  const initSdConfigCloud = async () => {
    let targetSdConfig = {}
    const { data } = (await api.getPaintingApiState({})) || {}
    const { resCode, resData } = data
    const { imageModel, videoModel } = resData || {} // 处理视频大模型默认值
    if (Number(resCode) === SUCCESS_CODE) {
      // imageModel 绘图模型,如果是sd画图，此字段为空
      if (imageModel?.model) {
        setDrawModel('cloud')
        setTab('cloud')
        setCloudSdState(true)
        setDrawingSdState(true)
        setSdTemplateCloud(imageModel.model)
        targetSdConfig = sdTemplateOptionsCloud.find((i) => i.value === imageModel.model) || {} // todotodo
        setModelName(imageModel.remark)
        const imgModelTarget = sdTemplateOptionsCloud?.find((i) => i.value === imageModel.model)
        setEnquiryImgCost(imgModelTarget?.modelFee) // 绘图算币消耗
      } else {
        setDrawModel('custom')
        setTab('custom')
        setDrawingSdState(false)
      }
    }
    if (Number(resCode) === SUCCESS_CODE && !!videoModel) {
      const videoModelTarget = videoTemplateOptionsCloud?.find((i) => i.value === videoModel)
      setVideoTemplateCloud(videoModel)
      targetSdConfig.videoModel = videoModel
      setEnquiryVideoCost(videoModelTarget?.modelFee) // 视频算币消耗
    }
    setSdConfig(targetSdConfig)
  }
  const checkPaintingApiState = async () => {
    // todo
  }

  const initSdConfig = async () => {
    try {
      const result = await api.getSdConfig({})
      console.log('result: ', result)
      const { data } = result
      if (data.resData) {
        setSdWebUrl(data.resData?.sd_url)
        setSdUserName(data.resData?.username)
        setSdPassword(data.resData?.password)
        setSdTemplate(data.resData?.current_model)
        setDrawVaeValue(data.resData?.current_vae)
        setDrawSampleValue(data.resData?.sampler_name) // 当前选的采样方法
        setScheduler(data.resData?.scheduler) // 当前选的调度类型
        setStepValue(data.resData?.steps)
        setPromptWeightValue(data.resData?.cfg_scale)
        setDrawSeedValue(data.resData?.seed)
        setNIter(data.resData?.n_iter)
        setSdTemplateOptions(
          data.resData?.available_models?.map((i) => ({
            value: i.title,
            label: i.model_name,
          })),
        )
        setVaeOptions(data.resData?.available_vaes?.map((i) => ({ value: i, label: i })))
        setDrawSampleOptions(data.resData?.available_samplers?.map((i) => ({ value: i, label: i }))) // 采样方法列表
        setAvailableSchedulers(
          data.resData?.available_schedulers?.map((i) => ({ value: i, label: i })),
        ) // 调度类型列表
        setLoraList(data.resData?.available_loras?.map((i) => ({ model: i })))
        setSdType(data.resData?.state)
      }
      setSdWebState(data.resCode === SUCCESS_CODE) // 成功为1 错误为0
      setDrawingSdState(data.resCode === SUCCESS_CODE)
    } catch (e) {
      console.log('init 错误： ', e)
    }
  }

  const changeSdWebUrl = async (value) => {
    await api.setSdConfig({
      data: {
        sd_url: value,
        username: sdUserName,
        password: sdPassword,
      },
    })
  }

  const changeSdModel = async (value) => {
    // 更换sd模型
    console.log('value: ', value)
    setChangeModelLoading(true)
    var hide = message.loading('正在切换sd模板', 10000)
    const res = await api.setSdConfig({
      data: {
        current_model: value.label,
      },
    })
    if (res && res?.data?.resCode == SUCCESS_CODE) {
      setSdTemplate(value.value)
      message.success(`已切换到${value.label}`)
    } else {
      message.error('切换sd模板失败')
    }
    setChangeModelLoading(false)
    hide()
  }
  const changeSdVae = async (value) => {
    // 更换VAE
    setChangeModelLoading(true)
    var hide = message.loading('正在切换Vae', 10000)
    const res = await api.setSdConfig({
      data: {
        current_vae: value,
      },
    })
    if (res && res?.data?.resCode == SUCCESS_CODE) {
      setDrawVaeValue(value)
      message.success(`已切换到${value}`)
    } else {
      message.error('切换vae失败')
    }
    setChangeModelLoading(false)
    hide()
  }
  const changePromptWeight = useCallback(
    debounce(async (value) => {
      // 改变提示词引导系数
      setChangeModelLoading(true)
      var hide = message.loading('正在切换提示词引导系数', 10000)
      const res = await api.setSdConfig({
        data: {
          cfg_scale: value,
        },
      })
      if (res && res?.data?.resCode == SUCCESS_CODE) {
        setPromptWeightValue(value)
        message.success(`已切换到${value}`)
      } else {
        message.error('切换提示词引导系数失败')
      }
      setChangeModelLoading(false)
      hide()
    }, 1000),
    [],
  )
  const changeDrawSeedValue = async (value) => {
    // 改变随机种子
    setChangeModelLoading(true)
    var hide = message.loading('正在切换随机种子', 10000)
    const res = await api.setSdConfig({
      data: {
        seed: value,
      },
    })
    if (res && res?.data?.resCode == SUCCESS_CODE) {
      setDrawSeedValue(value)
      message.success(`已切换到${value}`)
    } else {
      message.error('切换随机种子失败')
    }
    setChangeModelLoading(false)
    hide()
  }
  const changeBatchSize = useCallback(
    debounce(async (value) => {
      // 改变生成数量
      setChangeModelLoading(true)
      var hide = message.loading('正在切换生成数量', 10000)
      const res = await api.setSdConfig({
        data: {
          n_iter: value,
        },
      })
      if (res && res?.data?.resCode == SUCCESS_CODE) {
        setNIter(value)
        message.success(`已切换到${value}`)
      } else {
        message.error('切换生成数量失败')
      }
      setChangeModelLoading(false)
      hide()
    }, 1000),
    [],
  )
  const changeDrawSampleValue = async (value) => {
    setChangeModelLoading(true)
    var hide = message.loading('正在切换采样方法', 10000)
    const res = await api.setSdConfig({
      data: {
        sampler_name: value,
      },
    })
    if (res && res?.data?.resCode == SUCCESS_CODE) {
      setDrawSampleValue(value)
      message.success(`已切换到${value}`)
    } else {
      message.error('切换采样方法失败')
    }
    setChangeModelLoading(false)
    hide()
  }
  const changeAvailableSchedulers = async (value) => {
    setChangeModelLoading(true)
    var hide = message.loading('正在切换调度类型', 10000)
    const res = await api.setSdConfig({
      data: {
        scheduler: value,
      },
    })
    if (res && res?.data?.resCode == SUCCESS_CODE) {
      setScheduler(value)
      message.success(`已切换到${value}`)
    } else {
      message.error('切换调度类型失败')
    }
    setChangeModelLoading(false)
    hide()
  }
  const changeStepValue = useCallback(
    debounce(async (value) => {
      setChangeModelLoading(true)
      var hide = message.loading('正在切换迭代步数', 10000)
      console.log('6: ', value)
      const res = await api.setSdConfig({
        data: {
          steps: value,
        },
      })
      if (res && res?.data?.resCode == SUCCESS_CODE) {
        setStepValue(value)
        message.success(`已切换到${value}`)
      } else {
        message.error('切换迭代步数失败')
      }
      setChangeModelLoading(false)
      hide()
    }, 1000),
    [],
  )

  const changeModalTab = async (activeKey) => {
    setTab(activeKey)
    console.log('drawModel: ', drawModel)
    if (drawModel == 'cloud') {
      setSdWebState(false)
    }
    if (drawModel == 'custom') {
      setSdTemplateCloud()
      setSdConfig()
      setEnquiryImgCost()
    }
  }
  const changeSdType = async (e) => {
    const oldSdType = sdType
    setSdType(e.target.value)
    const res = await api.changeLocalSdApiState({
      mode: e.target.value,
    })
    if (res?.data?.resCode === SUCCESS_CODE) {
      message.success('本地服务类型切换成功')
    } else {
      setSdType(oldSdType)
      message.error('本地服务类型切换失败，请刷新后重试')
    }
  }

  // 将子组件实例绑定到父组件传递的 ref 上
  React.useImperativeHandle(childRef, () => ({
    checkPaintingApiState,
  }))

  return (
    <>
      <Modal
        title="设置"
        open={modalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        zIndex={999}
        width={950}
        destroyOnClose
      >
        <Tabs
          tabPosition="left"
          items={[
            {
              label: '绘图配置',
              key: 'drawingSetting',
              children: (
                <div
                  style={{
                    height: 650,
                    overflow: 'auto',
                    padding: '0px 5px 0px 0px',
                  }}
                >
                  <div>
                    <Tabs
                      tabPosition="top"
                      centered
                      defaultActiveKey={drawModel}
                      onChange={changeModalTab}
                      items={[
                        {
                          label: '智绘云',
                          key: 'cloud',
                          children: (
                            <div style={{ height: 550 }}>
                              <br />
                              <div>
                                <Descriptions
                                  column={2}
                                  size="default"
                                  items={[
                                    {
                                      key: 'model',
                                      label: '绘图大模型',
                                      span: 2,
                                      children: (
                                        <div>
                                          <Space>
                                            <Select
                                              style={{
                                                width: 500,
                                              }}
                                              value={sdTemplateCloud}
                                              options={sdTemplateOptionsCloud}
                                              onChange={changeSdModelForCloud}
                                              loading={changeModelLoading}
                                            />
                                          </Space>
                                        </div>
                                      ),
                                    },
                                  ]}
                                />
                              </div>
                              <div
                                style={{
                                  width: '100%',
                                  textAlign: 'center',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginBottom: 300,
                                  fontSize: 18,
                                  display: 'flex',
                                }}
                              >
                                {enquiryImgCost ? (
                                  <span>
                                    <span>预计每张图消耗：</span>
                                    <span
                                      style={{
                                        color: 'rgb(255, 128, 26)',
                                        minWidth: 32,
                                        textAlign: 'left',
                                      }}
                                    >
                                      {' '}
                                      {enquiryImgCost}{' '}
                                    </span>
                                    <span>算币</span>
                                  </span>
                                ) : (
                                  ''
                                )}
                              </div>
                              <div>
                                <Descriptions
                                  column={2}
                                  size="default"
                                  items={[
                                    {
                                      key: 'model',
                                      label: '视频大模型',
                                      span: 2,
                                      children: (
                                        <div>
                                          <Space>
                                            <Select
                                              style={{
                                                width: 500,
                                              }}
                                              value={videoTemplateCloud}
                                              options={videoTemplateOptionsCloud}
                                              onChange={changeVideoModelForCloud}
                                              loading={changeModelLoading}
                                            />
                                          </Space>
                                        </div>
                                      ),
                                    },
                                  ]}
                                ></Descriptions>
                              </div>
                              <div
                                style={{
                                  width: '100%',
                                  textAlign: 'center',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 18,
                                  display: 'flex',
                                }}
                              >
                                {enquiryVideoCost ? (
                                  <span>
                                    <span>预计每段视频消耗：</span>
                                    <span
                                      style={{
                                        color: 'rgb(255, 128, 26)',
                                        minWidth: 32,
                                        textAlign: 'left',
                                      }}
                                    >
                                      {' '}
                                      {enquiryVideoCost}{' '}
                                    </span>
                                    <span>算币</span>
                                  </span>
                                ) : (
                                  ''
                                )}
                              </div>
                            </div>
                          ),
                        },
                        {
                          label: '本地服务',
                          key: 'custom',
                          children: (
                            <div
                              style={{
                                overflow: 'auto',
                                height: '560px',
                                padding: '0px 5px 0px 0px',
                              }}
                            >
                              <div>
                                {/* <p style={{ fontSize: 16 }}>SD WebUI环境配置</p> */}
                                <Row align="middle">
                                  <Col span={4}>SD WebUI URL地址</Col>
                                  <Col
                                    span={6}
                                    style={{
                                      textAlign: 'right',
                                    }}
                                  >
                                    {sdWebState ? (
                                      <div
                                        style={{
                                          color: 'rgb(34, 167, 12)',
                                        }}
                                      >
                                        已启动
                                      </div>
                                    ) : (
                                      <div
                                        style={{
                                          color: 'rgb(192, 49, 50)',
                                        }}
                                      >
                                        未启动
                                      </div>
                                    )}
                                  </Col>
                                  <Col
                                    span={7}
                                    style={{
                                      textAlign: 'right',
                                    }}
                                  >
                                    类型
                                  </Col>
                                </Row>
                                <Space direction="vertical" size="small">
                                  <Space>
                                    <Input
                                      size="large"
                                      style={{ width: 420 }}
                                      value={sdWebUrl}
                                      spellCheck={false}
                                      onChange={(e) => {
                                        setSdWebUrl(e.target.value)
                                      }}
                                    />
                                    <Button
                                      size="large"
                                      type="primary"
                                      loading={loading}
                                      onClick={handleCheckSdWeb}
                                    >
                                      检测环境
                                    </Button>
                                    <Radio.Group
                                      onChange={changeSdType}
                                      value={sdType}
                                      style={{
                                        paddingLeft: 40,
                                      }}
                                    >
                                      <Radio value={SD_TYPE.SD}>StableDiffusion</Radio>
                                      <Radio value={SD_TYPE.FLUX}>flux</Radio>
                                    </Radio.Group>
                                  </Space>
                                  <Collapse
                                    items={[
                                      {
                                        key: 'auth',
                                        label: (
                                          <div>
                                            鉴权（
                                            <span
                                              style={{
                                                fontSize: 12,
                                              }}
                                            >
                                              {' '}
                                              当你的sd需要鉴权时，请填写账户密码，否则忽略{' '}
                                            </span>
                                            ）
                                          </div>
                                        ),
                                        children: (
                                          <div>
                                            <Space size="large">
                                              <Space size="small">
                                                <div>账号：</div>
                                                <Input
                                                  value={sdUserName}
                                                  onChange={(e) => {
                                                    setSdUserName(e.target.value)
                                                  }}
                                                />
                                              </Space>
                                              <Space>
                                                <div>密码：</div>
                                                <Input.Password
                                                  value={sdPassword}
                                                  iconRender={(visible) =>
                                                    visible ? (
                                                      <EyeTwoTone />
                                                    ) : (
                                                      <EyeInvisibleOutlined />
                                                    )
                                                  }
                                                  onChange={(e) => {
                                                    setSdPassword(e.target.value)
                                                  }}
                                                />
                                              </Space>
                                            </Space>
                                          </div>
                                        ),
                                      },
                                    ]}
                                    ghost
                                    bordered
                                    size="small"
                                    defaultActiveKey={sdAuthState ? ['auth'] : []}
                                    onChange={(activeKeys) => {
                                      let state
                                      if (activeKeys.includes('auth')) {
                                        state = true
                                      } else {
                                        state = false
                                      }
                                      setSdAuthState(state)
                                    }}
                                  />
                                </Space>
                              </div>
                              <Spin
                                spinning={!sdWebState}
                                indicator={<div></div>}
                                tip="请先开启SD WebUI API服务"
                              >
                                <div style={{ paddingTop: 30 }}>
                                  <Descriptions
                                    column={2}
                                    // bordered
                                    // layout="vertical"
                                    size="default"
                                    items={[
                                      {
                                        key: 'tpl',
                                        label: 'SD模型(ckpt)',
                                        labelStyle: {
                                          width: 78,
                                        },
                                        children: (
                                          <div>
                                            <Space>
                                              <Select
                                                labelInValue
                                                style={{
                                                  width: 240,
                                                }}
                                                value={sdTemplate}
                                                options={sdTemplateOptions}
                                                onChange={changeSdModel}
                                                loading={changeModelLoading}
                                              />
                                            </Space>
                                          </div>
                                        ),
                                      },
                                      {
                                        key: 'vae',
                                        label: 'VAE',
                                        children: (
                                          <Space>
                                            <Select
                                              style={{
                                                width: 180,
                                              }}
                                              value={drawVaeValue}
                                              options={vaeOptions}
                                              onChange={changeSdVae}
                                            />
                                          </Space>
                                        ),
                                      },
                                      {
                                        key: 'sample',
                                        label: '采样方法',
                                        labelStyle: {
                                          width: 78,
                                        },
                                        children:
                                          sdType === SD_TYPE.FLUX ? (
                                            <div>Euler</div>
                                          ) : (
                                            <Select
                                              style={{
                                                width: 200,
                                              }}
                                              value={drawSampleValue}
                                              options={drawSampleOptions}
                                              onSelect={changeDrawSampleValue}
                                            />
                                          ),
                                      },
                                      {
                                        key: 'sample',
                                        label: '调度类型',
                                        labelStyle: {
                                          width: 78,
                                        },
                                        children:
                                          sdType === SD_TYPE.FLUX ? (
                                            <div>simple</div>
                                          ) : (
                                            <Select
                                              style={{
                                                width: 200,
                                              }}
                                              value={scheduler}
                                              options={availableSchedulers}
                                              onSelect={changeAvailableSchedulers}
                                            />
                                          ),
                                      },
                                      {
                                        key: 'step',
                                        label: '迭代步数',
                                        span: 2,
                                        children: (
                                          <IntegerStep
                                            max={150}
                                            min={1}
                                            width={300}
                                            onInputChange={changeStepValue}
                                            defaultValue={stepValue}
                                          />
                                        ),
                                      },
                                      {
                                        key: 'promptWeight',
                                        label: '提示词引导系数(CFG Scale)',
                                        span: 2,
                                        children:
                                          sdType === SD_TYPE.FLUX ? (
                                            <div>1</div>
                                          ) : (
                                            <IntegerStep
                                              disabled={sdType === SD_TYPE.FLUX}
                                              max={30}
                                              min={1}
                                              width={300}
                                              onInputChange={changePromptWeight}
                                              defaultValue={promptWeightValue}
                                            />
                                          ),
                                      },
                                      {
                                        key: 'seed',
                                        label: '随机种子(Seed)',
                                        span: 2,
                                        children: (
                                          <div>
                                            <Space>
                                              <InputNumber
                                                value={drawSeedValue}
                                                controlWidth={200}
                                                onChange={changeDrawSeedValue}
                                              />
                                              <Button
                                                icon={<RedoOutlined />}
                                                onClick={() => {
                                                  changeDrawSeedValue(-1)
                                                }}
                                              />
                                            </Space>
                                          </div>
                                        ),
                                      },
                                      {
                                        key: 'nIter',
                                        label: '生成数量',
                                        // span: 3,
                                        children: (
                                          <IntegerStep
                                            max={9}
                                            min={1}
                                            width={200}
                                            onInputChange={changeBatchSize}
                                            defaultValue={nIter}
                                          />
                                        ),
                                      },
                                    ]}
                                  />
                                </div>
                              </Spin>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
              ),
            },
            // {
            //     label: '翻译配置',
            //     key: 'translateSetting',
            //     // disabled: true,
            //     children: <div style={{height: 650}}>
            //         <Row justify="space-between" align="middle">
            //             <Col>
            //                 <p style={{ fontSize: 16 }}>翻译设置</p>
            //             </Col>
            //             <Col>
            //                 {
            //                     translateState ? <
            //                         div style={{ color: "rgb(34, 167, 12)" }}>已配置</div> :
            //                         <div style={{ color: "rgb(192, 49, 50)" }}>未配置</div>
            //                 }
            //             </Col>
            //         </Row>
            //         <Row justify="space-between" align="middle">
            //             <Col>
            //                 <Space direction="vertical">
            //                     <div>腾讯翻译SecretId</div>
            //                     <Input
            //                         size="large"
            //                         style={{ width: 300 }}
            //                         value={translateAppId}
            //                         spellCheck={false}
            //                         onChange={(e) => {
            //                             setTranslateAppId(e.target.value)
            //                         }}
            //                     />
            //                 </Space>
            //             </Col>
            //             <Col>
            //                 <Space direction="vertical">
            //                     <div>
            //                         腾讯翻译SecretKey
            //                     </div>
            //                     <div>
            //                         <Space>
            //                             <Input
            //                                 size="large"
            //                                 style={{ width: 300 }}
            //                                 value={translateSecretKey}
            //                                 spellCheck={false}
            //                                 onChange={(e) => {
            //                                     setTranslateSecretKey(e.target.value)
            //                                 }}
            //                             />
            //                             <Button
            //                                 size="large"
            //                                 type="primary"
            //                                 loading={verifyLoading}
            //                                 onClick={handleVerifyTranslateKey}
            //                             >保存密钥</Button>
            //                         </Space>
            //                     </div>
            //                 </Space>
            //             </Col>
            //         </Row>
            //     </div>
            // },
            {
              label: '基础配置',
              key: 'baseSetting',
              children: (
                <div style={{ height: 650 }}>
                  <p style={{ fontSize: 16, margin: '10px 0' }}>素材缓存</p>
                  <div style={{ marginBottom: 5 }}>
                    项目素材文件夹存储位置{' '}
                    <span style={{ fontSize: 12, color: '#5748B0' }}>
                      更改项目素材文件夹的存储位置，将影响已创建的小说项目的图片、视频等素材的使用，请谨慎操作。建议选择空文件夹
                    </span>
                  </div>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          size="large"
                          // disabled={true}
                          style={{
                            width: 500,
                            userSelect: 'none',
                            fontSize: 12,
                            fontWeight: 400,
                          }}
                          value={materialRoot}
                          spellCheck={false}
                          // onChange={(e) => setMaterialRoot(e.target.value)}
                        />
                      </Space.Compact>
                    </Col>
                    <Col></Col>
                  </Row>
                  <div style={{ margin: '10px 0', fontSize: 16 }}>
                    剪映草稿地址（
                    {jianYingState ? (
                      <span style={{ color: 'rgb(34, 167, 12)' }}>已检测到剪映</span>
                    ) : (
                      <span style={{ color: 'rgb(192, 49, 50)' }}>未检测到剪映</span>
                    )}
                    ）
                  </div>
                  <div style={{ fontSize: 12, color: '#5748B0', marginBottom: 5 }}>
                    打开剪映下载地址，找到JianyingPro Drafts，复制JianyingPro
                    Drafts所在目录地址，粘贴到下面输入框
                    <div>
                      （如修改了剪映草稿地址，请及时更新，否则无法在剪映中查找已导出的作品）
                    </div>
                  </div>
                  <Row
                    justify="space-between"
                    style={{ marginBottom: 5, textAlign: 'left' }}
                    align="middle"
                  >
                    <Col span={24}>
                      <Space.Compact style={{ width: '100%' }}>
                        <Input
                          size="large"
                          value={jianYingRoot}
                          spellCheck={false}
                          onChange={(e) => {
                            console.log('e.target.value； ', e.target.value)
                            setJianYingRoot(e.target.value)
                          }}
                          style={{
                            width: 500,
                            userSelect: 'none',
                            fontSize: 12,
                            fontWeight: 400,
                          }}
                        />
                        <Button
                          size="large"
                          onClick={async () => {
                            refreshJianYingRoot()
                          }}
                        >
                          开始检测
                        </Button>
                      </Space.Compact>
                    </Col>
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </>
  )
}

export default Settings
