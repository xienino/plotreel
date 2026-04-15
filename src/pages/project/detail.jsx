import React, { useState, useRef } from 'react'
import {
  message,
  Button,
  Row,
  Col,
  Space,
  Segmented,
  Modal,
  Progress,
  Select,
  Checkbox,
  Input,
} from 'antd'
import { IconFont } from '../../common/iconfont'
import { Outlet, useMatches, useNavigate, useOutletContext } from 'react-router-dom'
import { LeftOutlined, EditOutlined } from '@ant-design/icons'
import { SUCCESS_CODE, PROJECT_STAGE, LABEL_TYPE } from '../../assets/constant'
import { formatLocalAssets } from '../../common/util'

import { useEffect } from 'react'
import './project.sass'

import api from '../../services/project'

const Detail = ({
  drawingSdState,
  jianYingState,
  loraList,
  drawingModel,
  sdTemplateOptionsCloud,
}) => {
  const {
    updateAccountInfo,
    enquiryImgCost,
    enquiryVideoCost,
    nextBtnLoading,
    setNextBtnLoading,
    sdConfig,
    videoTemplateOptionsCloud,
    changeVideoModelForCloud,
    checkCoin,
  } = useOutletContext()

  const matches = useMatches()
  const [alignValue, setAlignValue] = useState(
    matches[matches.length - 1]['pathname'].split('/')[3],
  ) // 当前所选主tab页的值
  const [projectName, setProjectName] = useState(null)
  const [activeName, setActiveName] = useState()
  const [isShowInput, setIsShowInput] = useState(false)
  const inputRef = useRef()
  const [isUploaded, setIsUploaded] = useState(0) // false:待上传文本; true:已上传文本并确认
  const childRef = useRef(null)
  const [projectId, setProjectId] = useState(matches[matches.length - 1]['params']['id'])
  const navigate = useNavigate()
  const [projectDetail, setProjectDetail] = useState({})
  const [isComposed, setIsComposed] = useState(false) // 是否已合成
  // 总体绘制合成
  const [isComplete, setIsComplete] = useState(false) // 是否全部分镜已完成绘制
  const initData = useRef()
  const isTagUsed = useRef(false)

  const [selectExportState, setSelectExportState] = useState(false)
  const [exportType, setExportType] = useState('1') // '1'本地导出，'2'剪映导出
  const [startExportJY, setStartExportJY] = useState(false) // 是否开始合成剪映草稿
  const [isJumpAudio, setIsJumpAudio] = useState(false)
  const [composeState, setComposeState] = useState(false) // 合成中弹窗是否展示
  const [videoUrl, setVideoUrl] = useState() // 已合成视频的base64
  const [videoPath, setVideoPath] = useState() // 视频文件存储地址
  const [composeProgress, setComposeProgress] = useState(0)
  const [isInited, setIsInited] = useState(false) // 页面是否完成初始化
  const composeTimer = useRef()

  // 标签库
  const [labelAllListMap, setLabelAllListMap] = useState({
    [LABEL_TYPE.PERSON]: [],
    [LABEL_TYPE.SCENCE]: [],
  })

  const getVideoSrc = async () => {
    const result = await api.seekVideo({ taskId: projectId })
    setVideoUrl(formatLocalAssets(result?.data?.videoUrl))
  }

  const refreshProjectDetail = async () => {
    const { data } = await api.getProjectDetail({
      // stage -1：新建项目阶段，还未上传文本；0: 文本解析阶段； 1：已上传文本
      taskId: projectId,
    })
    if (data.resCode === SUCCESS_CODE) {
      setIsUploaded(data.stage === PROJECT_STAGE.UPLOADED)
      setProjectName(data?.title || '')
      setActiveName(data?.title || '')
      setProjectDetail(data?.resData || {})
      return data
    } else {
      // message.error('获取详情失败！')
    }
  }
  const onNext = async () => {
    if (childRef?.current?.checkCanGoNext && (await childRef?.current?.checkCanGoNext())) return
    setNextBtnLoading(true)
    const handleNextRes = await childRef?.current?.handleNext(isJumpAudio)
    if (handleNextRes) {
      // 合成视频报错时
      setAlignValue('paint')
    }
    setNextBtnLoading(false)
  }
  const onNextExportVideo = async () => {
    // 绘制页点击下一步
    if (!isComplete) {
      message.error('请完成所有分镜绘制')
      return
    }
    setNextBtnLoading(true)
    setAlignValue('preview')
    setSelectExportState(true)
  }

  const handleExportVideo = async () => {
    // 预览视频 类型选择弹窗中 点击下一步
    if (exportType == '2' && !jianYingState) {
      message.error('请在设置中配置剪映草稿地址')
      return
    }
    if (startExportJY) {
      if (composeProgress == 100) {
        navigate('/project')
      } else {
        message.warning('剪映草稿合成中，请稍等')
      }
      return
    }
    // if ((alignValue === 'paint') && !isComplete) {
    //   message.error('请完成所有分镜绘制')
    //   return
    // }
    setNextBtnLoading(true)
    setAlignValue('preview')
    if (exportType === '2') {
      setStartExportJY(true)
      await childRef?.current?.handleExportJY(isJumpAudio)
    } else {
      setSelectExportState(false)
      await childRef?.current?.handleNext(isJumpAudio)
    }
    setNextBtnLoading(false)
  }
  const downloadVideo = async () => {
    const res = await api.copyVideo({
      taskId: projectId,
    })
    if (res?.data?.resCode !== SUCCESS_CODE) {
      message.error(res?.data?.resMsg?.msgText || '下载失败')
    } else {
      message.success('下载成功，已保存至“此电脑/下载”目录下')
    }
  }
  const gotoIndex = () => {
    if (childRef?.current?.clearFunc) {
      childRef?.current?.clearFunc()
    }
    if (!isUploaded) {
      setIsUploaded(true)
    } else {
      navigate('/project')
    }
  }
  const checkProgress = () => {
    return new Promise((res, rej) => {
      if (composeTimer.current) clearInterval(composeTimer.current)
      const id = setInterval(async () => {
        const result = await api.getMakeVideoProgress({ taskId: projectId })
        if (result.data.resCode == 2) {
          rej(false)
        } else if (result.data?.resData?.progress === 100) {
          clearInterval(composeTimer.current)
          setIsComposed(true)
          await getVideoSrc()
          res(true)
        } else {
          setComposeProgress(parseInt(result?.data?.progress || result?.data?.resData?.progress))
        }
      }, 3000)
      composeTimer.current = id
    })
  }
  const checkExportJYProgress = () => {
    return new Promise((res, rej) => {
      if (composeTimer.current) clearInterval(composeTimer.current)
      const id = setInterval(async () => {
        const result = await api.getExportProgress({ taskId: projectId })
        if (result.data.resCode == 2) {
          clearInterval(composeTimer.current)
          setIsComposed(true)
          rej(false)
        } else if (result.data?.progress == 100 || result.data?.progress === 0) {
          console.log('视频合成进度完了: ', result.data?.progress)
          setComposeProgress(parseInt(result?.data?.progress))
          clearInterval(composeTimer.current)
          setIsComposed(true)
          res(true)
        } else {
          console.log('parseInt(result?.data?.progress): ', parseInt(result?.data?.progress))
          setComposeProgress(parseInt(result?.data?.progress))
        }
      }, 3000)
      composeTimer.current = id
    })
  }
  const changeSegment = async (value, id) => {
    // 切换分步tab页
    if (value === 'paint' && !drawingSdState) {
      message.warning('请在设置中连接服务')
      return
    }
    if (childRef?.current?.clearFunc) {
      childRef?.current?.clearFunc()
    }
    if (id) {
      setProjectId(id)
    }
    if (value === 'preview') {
      if (!isComposed && !nextBtnLoading) {
        message.warning('请点击下一步生成视频')
      } else {
        setAlignValue(value)
        // setComposeState(true)
        setSelectExportState(true)
      }
      return
    }
    if (alignValue === 'base') {
      // 前进
      if (await childRef?.current?.checkCanGoNext(value)) return
    }
    setAlignValue(value)
    navigate(`${value}/${id || projectId}`)
  }

  const goBack = async () => {
    // 下载视频
    if (childRef?.current?.handleBack && (await childRef?.current?.handleBack())) return
    if (nextBtnLoading) return
    if (childRef?.current?.clearFunc) {
      childRef?.current?.clearFunc()
    }
    navigate('/project')
  }
  const saveNewName = async () => {
    if (activeName === projectName) {
      inputRef.current?.blur()
      setIsShowInput(false)
      return
    }
    const result = await api.editProjectBasicInformation({
      taskId: projectId,
      newName: activeName,
    })
    if (result?.data?.resCode === SUCCESS_CODE) {
      message.success('名称修改成功')
      inputRef.current?.blur()
    } else {
      message.success('名称修改失败，请联系管理员查看原因')
      setActiveName(projectName)
    }
    setIsShowInput(false)
  }
  const updateAllLabelList = async () => {
    const [personRes, labelRes] = await Promise.all([
      api.getAllLabel({
        pageSize: 100,
        pageNum: 1,
        type: LABEL_TYPE.PERSON,
      }),
      api.getAllLabel({
        pageSize: 100,
        pageNum: 1,
        type: LABEL_TYPE.SCENCE,
      }),
    ])
    setLabelAllListMap({
      [LABEL_TYPE.PERSON]: personRes?.data?.resData?.rows || [],
      [LABEL_TYPE.SCENCE]: labelRes?.data?.resData?.rows || [],
    })
  }

  useEffect(() => {
    setActiveName(projectName)
  }, [projectName])

  useEffect(() => {
    if (projectId === '0') return
    if (initData.current) {
      return
    }
    refreshProjectDetail()
    initData.current = true
  }, [projectId])

  useEffect(() => {
    updateAllLabelList()
    return () => {
      // 取消视频生成
      setNextBtnLoading(false)
      clearInterval(composeTimer.current)
      setComposeState(false)
      setSelectExportState(false)
    }
  }, [setNextBtnLoading])
  useEffect(() => {
    console.log('detail sdTemplateOptionsCloud: ', sdTemplateOptionsCloud)
  }, [sdTemplateOptionsCloud])

  return (
    <div className="detailWrap">
      <Row align="middle" justify="space-between" style={{ padding: 8 }} className="detailBar">
        <Col flex="0 0 180px">
          <Space>
            <Button
              icon={<LeftOutlined />}
              type="text"
              onClick={goBack}
              size="large"
              style={{ cursor: nextBtnLoading ? 'not-allowed' : 'auto' }}
            >
              返回
            </Button>
            {alignValue === 'paint' && (
              <div
                style={{
                  fontWeight: 'bold',
                  color: '#E8E8E8',
                  whiteSpace: 'nowrap',
                  fontSize: 12,
                  cursor: 'pointer',
                  width: 120,
                }}
              >
                <Input
                  value={activeName}
                  ref={inputRef}
                  style={{
                    border: isShowInput ? '' : '1px solid transparent',
                    fontSize: 14,
                    backgroundColor: 'rgb(29, 29, 31)',
                  }}
                  onChange={(e) => setActiveName(e.target.value)}
                  onPressEnter={() => {
                    inputRef.current?.blur()
                  }}
                  onClick={() => {
                    setIsShowInput(true)
                  }}
                  onBlur={saveNewName}
                  prefix={<EditOutlined />}
                />
              </div>
            )}
          </Space>
        </Col>
        <Col flex="0 0 388px" style={{ paddingRight: '100px' }}>
          <Segmented
            size="large"
            value={alignValue}
            onChange={changeSegment}
            options={[
              {
                label: '故事设定',
                value: 'base',
                icon: <IconFont type="icon-basic-info" />,
              },
              {
                label: '推理配图',
                value: 'paint',
                icon: <IconFont type="icon-jinyonghuizhi" />,
              },
              {
                label: '预览视频',
                value: 'preview',
                icon: <IconFont type="icon-shipin" />,
              },
            ]}
          />
        </Col>
        <Col flex="0 0 100px">
          {alignValue === 'base' && (
            <Button onClick={onNext} type="primary" loading={nextBtnLoading}>
              下一步
              {!!drawingModel && (
                <IconFont
                  type="icon-jinbi1"
                  style={{ color: '#f9dd4b', marginTop: 2, marginLeft: 2 }}
                />
              )}
            </Button>
          )}
          {alignValue === 'paint' && isInited && (
            <Button
              onClick={onNextExportVideo}
              type="primary"
              style={{ display: isComposed ? 'none' : 'block' }}
              loading={nextBtnLoading}
            >
              下一步
            </Button>
          )}
        </Col>
      </Row>
      <div className="flex-between detailContent">
        <Outlet
          context={{
            sdConfig,
            videoTemplateOptionsCloud,
            changeVideoModelForCloud,
            enquiryImgCost,
            enquiryVideoCost,
            updateAccountInfo,
            checkCoin,
            isInited,
            setIsInited,
            drawingSdState,
            jianYingState,
            loraList,
            projectName,
            setProjectName,
            isUploaded,
            setIsUploaded,
            refreshProjectDetail,
            projectId,
            projectDetail,
            childRef,
            isTagUsed,
            changeSegment,
            isComposed,
            setIsComposed,
            setComposeState,
            setVideoPath,
            setComposeProgress,
            checkProgress,
            checkExportJYProgress,
            isComplete,
            setIsComplete,
            drawingModel,
            labelAllListMap,
            updateAllLabelList,
          }}
        />
      </div>
      <Modal
        title="导出视频"
        okText="确定"
        cancelText="取消"
        onCancel={() => {
          setSelectExportState(false)
          setAlignValue('paint')
          setNextBtnLoading(false)
        }}
        closable={!(exportType === '2' && startExportJY)}
        open={selectExportState}
        footer={
          <div>
            <Button
              style={{
                marginRight: 10,
                display: exportType === '2' && composeProgress == 100 ? 'none' : 'inlineBlock',
              }}
              onClick={() => {
                setSelectExportState(false)
                setAlignValue('paint')
                setNextBtnLoading(false)
              }}
            >
              取消
            </Button>
            <Button type="primary" onClick={handleExportVideo}>
              确定
            </Button>
          </div>
        }
      >
        <div>
          导出类型：
          <Select
            value={exportType}
            options={[
              { value: '1', label: <span>本地导出</span> },
              { value: '2', label: <span>剪映草稿</span> },
            ]}
            disabled={startExportJY && composeProgress !== 100}
            style={{ width: 'calc(100% - 61px)' }}
            onChange={(e) => {
              setExportType(e)
            }}
          ></Select>
        </div>
        <div style={{ paddingLeft: 36, marginTop: 20 }}>
          <Checkbox
            onChange={(e) => {
              setIsJumpAudio(e.target.checked)
            }}
            style={{ marginRight: 10 }}
            disabled={startExportJY && composeProgress !== 100}
          ></Checkbox>
          跳过已有音频的章节
        </div>
        {exportType === '2' && startExportJY && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '20px',
              }}
            >
              <div>处理进度</div>
              <div>{composeProgress == 100 ? '已完成，请打开剪映搜索项目同名草稿' : ''}</div>
            </div>
            <Progress percent={composeProgress} />
          </div>
        )}
      </Modal>
      <Modal
        title=""
        open={composeState}
        confirmLoading={!isComposed}
        closable={false}
        onCancel={() => {
          setNextBtnLoading(false)
          setAlignValue('paint')
          setComposeState(false)
        }}
        maskClosable={false}
        zIndex={999}
        centered
        width={820}
        footer={
          <div>
            <Button
              style={{
                marginRight: 10,
                display: isComposed ? 'none' : 'inlineBlock',
              }}
              onClick={() => {
                setNextBtnLoading(false)
                setAlignValue('paint')
                clearInterval(composeTimer.current)
                setComposeState(false)
                setComposeProgress(0)
                gotoIndex()
              }}
            >
              后台合成
            </Button>
            {isComposed && (
              <Button style={{ marginRight: 10 }} onClick={downloadVideo}>
                下载
              </Button>
            )}
            <Button type="primary" onClick={gotoIndex} disabled={!isComposed}>
              确定
            </Button>
          </div>
        }
      >
        <div className="composeModal">
          {isComposed ? (
            <>
              <video
                src={videoUrl}
                width="500"
                type="video/mp4"
                controls
                style={{ maxHeight: '80%', maxWidth: '100%' }}
                controlsList="nodownload"
              ></video>
              <div style={{ width: '100%' }}>视频文件地址为：{videoPath}</div>
            </>
          ) : (
            <>
              <Progress type="circle" percent={composeProgress} strokeColor="#5748B0" />
              <div style={{ paddingTop: '20px' }}>视频生成中</div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Detail
