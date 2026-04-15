import React, { useState, useRef, useCallback } from 'react'
import {
  message,
  Layout,
  Button,
  Popover,
  Select,
  Image,
  Modal,
  Input,
  Slider,
  InputNumber,
} from 'antd'
import { useEffect } from 'react'
import { EditOutlined, LoadingOutlined, LeftOutlined } from '@ant-design/icons'
import './paintInfo.sass'
import EditText from '../../../components/editTextArea/editText.jsx'
import ImageList from './imageList.jsx'
import api from '../../../services/project'
import debounce from 'lodash.debounce'
import { IconFont } from '../../../common/iconfont'
import { formatLocalAssets } from '../../../common/util'
import VideoPlayer from '../../../components/videoPlayer'
import {
  LACK_GOLD_CODE,
  ERROR_CODE,
  SUCCESS_CODE,
  STROYBOARD_STATE_LABEL,
  STROYBOARD_STATE,
  LABEL_TYPE,
} from '../../../assets/constant'
import AddLabelCard from '../baseInfo/addLabelCard'
import LabelCard from '../baseInfo/labelCard'
import AddLabelModal from '../baseInfo/addLabelModal'

const { Footer, Content } = Layout
const { TextArea } = Input

const animationList = [
  { label: '随机', value: 0 },
  { label: '左滑', value: 1 },
  { label: '右滑', value: 2 },
  { label: '上滑', value: 3 },
  { label: '下滑', value: 4 },
  { label: '缩小', value: 5 },
  { label: '放大', value: 6 },
]

const CurrentDetail = ({
  detail,
  redrawImage,
  setMediumData,
  mediumDataRef,
  drawingState,
  projectId,
  playAudio,
  handleEditText,
  handlePrompt,
  handleEdit,
  prevImageMappings,
  tagList,
  handleEditTag,
  refreshTargetRowPrevImage,
  setTagList,
  playAudioIndex,
  setIsComposed,
  setRepaintingCount,
  repaintingCount,
  isSavePromptLoading,
  drawingModel,
  drawingSdState,
  redrawVideo,
  enquiryImgCost,
  enquiryVideoCost,
  detailRef,
  reIllation,
  projectName,
  paintingStyleValue,
  pictureSize,
  sdConfig,
  videoTemplateOptionsCloud,
  changeVideoModelForCloud,
  newLabelIdRef,
  refreshRoleProperties,
  labelAllListMap,
  updateAllLabelList,
  updateAccountInfo,
  clearImageIntervalAndSave,
  setDrawPercent,
  clearVideoIntervalAndSave,
}) => {
  const inputRef = useRef()
  const [inputText, setInputText] = useState('')
  const [bakSource, setBakSource] = useState('')
  const [playAudioLoading, setPlayAudioLoading] = useState(false)
  const [animation, setAnimation] = useState(0)
  const [lens, setLens] = useState(0)
  const [roleIds, setRoleIds] = useState([]) // 当前分镜绑定的角色列表
  const [scenceIds, setScenceIds] = useState()
  const [currentScence, setCurrentScence] = useState() // 当前所选场景
  const [selectScenceId, setSelectScenceId] = useState({}) // 临时选中场景index
  const [currentRoleList, setCurrentRoleList] = useState([]) // 当前所选角色列表
  const [selectRoleIds, setSelectRoleIds] = useState([]) // 临时选中角色index列表
  const [roleList, setRoleList] = useState([]) // 角色列表
  const [scenceList, setScenceList] = useState([]) // 场景列表
  const tagListRef = useRef()
  const [showScenceChangeModal, setShowScenceChangeModal] = useState(false)
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [isTransVideo, setIsTransVideo] = useState(false)
  const [imgCostSum, setImgCostSum] = useState() // 重绘总费用
  const editTextRef = useRef(null)

  const [createModel, setCreateModel] = useState(false) // 是否打开新建标签弹窗
  const [targetLabel, setTargetLabel] = useState(null)
  const [isEdit, setIsEdit] = useState(false)
  const [audioVoiceList, setAudioVoiceList] = useState([])
  const [selectedVoice, setSelectedVoice] = useState() // 旁白配音

  const textAreaBlur = () => {
    editTextRef?.current?.textAreaBlur()
  }

  React.useImperativeHandle(detailRef, () => ({
    textAreaBlur,
  }))

  const debounceRepaintFunc = useCallback(
    debounce(async (value) => {
      const res = await api.editRepaintingCount({
        taskId: projectId,
        repaintingCount: value,
      })
      if (res?.data?.resCode === SUCCESS_CODE) {
        message.success('重绘数量修改成功')
      } else {
        message.success('重绘数量修改失败，请稍后重试')
      }
    }, 1000),
    [],
  )

  const handleChangeScroll = (value) => {
    setRepaintingCount(value)
    debounceRepaintFunc(value)
  }

  const changeAnimation = (value) => {
    setAnimation(value)
    handleEdit('animation', value, detail.index)
  }

  const changeRole = () => {
    // 打开角色弹窗
    setShowRoleChangeModal(true)
    currentRoleList && setSelectRoleIds(currentRoleList.map((i) => i.labelId))
  }
  const changeScenario = () => {
    // 打开场景弹窗
    setShowScenceChangeModal(true) // todo
    if (currentScence) {
      setSelectScenceId(currentScence.labelId)
    } else {
      setSelectScenceId([])
    }
  }
  const saveScenceChange = async () => {
    // 保存场景标签修改
    const newScence = scenceList
      .filter((i) => i.labelId == selectScenceId)
      .map((i) => {
        return {
          labelId: i.labelId,
          label: {
            lora: i.lora,
            names: i.names,
            prompt: i.prompt,
            title: i.title,
            type: i.type,
          },
        }
      })
    let newTagList = [...newScence]
    if (currentRoleList) newTagList = newTagList.concat(currentRoleList)
    await handleEditTag(newTagList, detail.index)
    setCurrentScence(newScence[0])
    setShowScenceChangeModal(false)
  }
  const saveRoleChange = async () => {
    // 保存角色标签修改
    const roleTagList = roleList
      .filter((i) => {
        return selectRoleIds.some((selected) => selected === i.labelId)
      })
      .map((i) => {
        return {
          labelId: i.labelId,
          label: {
            lora: i.lora,
            names: i.names,
            prompt: i.prompt,
            title: i.title,
            type: i.type,
          },
        }
      })
    if (roleTagList.length > 2) {
      message.warning('最多支持两个出境角色')
      return
    }
    const newTagList = [...roleTagList]
    if (currentScence) newTagList.push(currentScence)
    await handleEditTag(newTagList, detail.index)
    setCurrentRoleList(roleTagList)
    setShowRoleChangeModal(false)
  }
  const handleSelect = async (record, isRole) => {
    if (isRole) {
      const targetIndex = selectRoleIds.findIndex((selected) => selected === record.labelId)
      if (targetIndex > -1) {
        let newSelectedIndexes = selectRoleIds.filter((i) => i !== record.labelId)
        setSelectRoleIds(newSelectedIndexes)
      } else {
        setSelectRoleIds([...selectRoleIds, record.labelId])
      }
    } else {
      if (selectScenceId == record.labelId) {
        setSelectScenceId(null)
      } else {
        setSelectScenceId(record.labelId)
      }
    }
  }
  const getPrevImage = async (record) => {
    if (!drawingSdState) return message.error('sd已断开，请先连接sd后再进行绘图操作')
    const newList = [...tagListRef.current]
    const target = newList.find((i) => i.labelId == record.labelId)
    target.isLoading = true
    setTagList(newList)
    tagListRef.current = newList

    if (prevImageMappings[record.labelId]) return
    const { title, prompt, lora } = record
    const label = {
      labelId: record.labelId,
      taskId: projectId,
      label: { title, prompt, lora },
    }
    const res = await api.generateLabelImage(label)
    if (res?.data?.resCode === LACK_GOLD_CODE) {
      // if (res?.config?.url) { // mock
      target.isLoading = false
      setTagList(newList)
      refreshTargetRowPrevImage(record.labelId, '')
      tagListRef.current = newList
      return
    }
    if (res?.data?.resCode === ERROR_CODE) {
      target.isLoading = false
      refreshTargetRowPrevImage(record.labelId, '')
      message.error(res?.data?.resMsg?.msgText || '系统报错，请联系管理员查看原因')
      return
    }
    const { data } = await api.findLabelImage({
      labelList: [label],
    })
    const newImg =
      data?.resData && data?.resData[0]?.imageBase64
        ? `data:image/png;base64,${data?.resData[0]?.imageBase64}`
        : ''
    if (!newImg) {
      message.error('未获取到图片，请检查sd连接或重试')
    }

    refreshTargetRowPrevImage(record.labelId, newImg)
    target.isLoading = false
    setTagList(newList)
    tagListRef.current = newList
  }

  const setContentInset = async (targetChosenPic, cIndex) => {
    // 设为本镜
    const newMediumData = [...mediumDataRef.current]
    const currentMedium = newMediumData.find((element) => element.index === cIndex)
    currentMedium.chosenPic = targetChosenPic
    const { index, chosenPic, state } = currentMedium
    if (
      [
        STROYBOARD_STATE.ILLATION_FAIL,
        STROYBOARD_STATE.DRAWING_FAIL,
        STROYBOARD_STATE.TRANS_VIDEO_FAIL,
      ].indexOf(state) > -1
    ) {
      currentMedium.state =
        currentMedium.chosenPic > 0 ? STROYBOARD_STATE.DRAWING_DONE : STROYBOARD_STATE.ILLATION_DONE
    }
    const result = await api.setFileContent({
      taskId: projectId,
      textList: [{ index, chosenPic }],
    })
    if (result?.data?.resCode === SUCCESS_CODE) {
      setIsComposed(false)
      setMediumData(newMediumData)
      mediumDataRef.current = newMediumData
    } else {
      message.error('设置分镜报错')
    }
  }
  const handleRetry = () => {
    // 推理失败 绘图失败 转视频失败
    switch (detail?.state) {
      case STROYBOARD_STATE.ILLATION_FAIL:
        reIllation(detail)
        break
      case STROYBOARD_STATE.DRAWING_FAIL:
        redrawImage(detail)
        break
      case STROYBOARD_STATE.TRANS_VIDEO_FAIL:
        redrawVideo(detail)
        break
      default:
        break
    }
  }
  const redrawByRepaintingCount = async () => {
    if (isEdit) {
      await handlePrompt(editTextRef?.current?.getCurrentText(), detail.index)
    }
    const newMediumData = [...mediumDataRef.current]
    const currentMedium = newMediumData.find((element) => element.index === detail.index)
    const newMaterials = currentMedium?.materials ? [...currentMedium.materials] : []
    for (let i = 0; i < repaintingCount; i++) {
      newMaterials.push({
        mIndex: (currentMedium.materials?.length || 0) + 1,
        isLoading: true,
      })
    }
    currentMedium.materials = newMaterials
    currentMedium.chosenPic = newMaterials.length
    setMediumData(newMediumData)
    mediumDataRef.current = newMediumData
    // 根据重绘数量重绘当前分镜
    for (let i = 0; i < repaintingCount; i++) {
      await redrawImage(detail)
    }
    setIsEdit(false)
  }
  const cancelLineup = async () => {
    const res = await api.queueRemove({
      taskId: detail.drawTaskId,
    })
    if (res?.data?.resCode === SUCCESS_CODE) {
      let existList = null
      if (detail.state === STROYBOARD_STATE.DRAWING_LINEUP) {
        existList = clearImageIntervalAndSave(detail.index)
        !existList?.length && setDrawPercent(0)
      }
      if (detail.state === STROYBOARD_STATE.TRANS_VIDEO_LINEUP) {
        existList = clearVideoIntervalAndSave(detail.index)
      }
      const newMediumData = [...mediumDataRef.current]
      const currentMedium = newMediumData.find((element) => element.index === detail.index)
      currentMedium.lineup = null
      currentMedium.state =
        currentMedium.chosenPic > 0 ? STROYBOARD_STATE.DRAWING_DONE : STROYBOARD_STATE.ILLATION_DONE
      setMediumData(newMediumData)
      mediumDataRef.current = newMediumData // todotodo
    }
  }
  const initVoice = async () => {
    const { data } = await api.getTimbres({})
    const voiceList = data?.resData.map((i) => ({
      label: `${i.name}-${i.gender}-${i.tag}`,
      value: i.value,
    }))
    setAudioVoiceList(voiceList)
    const target = voiceList.find((i) => i.value === detail?.voice?.role)
    setSelectedVoice(target)
  }
  const changeVoice = async (item) => {
    const target = audioVoiceList.find((i) => i.value === item)
    setSelectedVoice({
      label: target.label,
      value: item,
    })
    detail.voice.role = item
    const result = await api.setFileContent({
      taskId: projectId,
      textList: [detail],
    })
    if (result?.data?.resCode === SUCCESS_CODE) {
      message.success('更改配音成功')
    }
  }

  useEffect(() => {
    if (detail) {
      setIsTransVideo(false)
      setInputText(detail.source)
      setAnimation(detail.animation)
      setLens(detail.lens)
      initVoice()
    }
  }, [detail])

  useEffect(() => {
    if (detail?.label) {
      const roleTarget = detail.label.filter((i) => i?.label?.type === LABEL_TYPE.PERSON)
      const scenceTarget = detail.label.find((i) => i?.label?.type === LABEL_TYPE.SCENCE)
      roleTarget && setRoleIds(roleTarget.map((i) => i.labelId))
      scenceTarget && setScenceIds(scenceTarget.labelId)
    }
  }, [detail?.label])

  useEffect(() => {
    if (detail?.label) {
      setCurrentScence(detail.label.find((label) => label.labelId === scenceIds))
    }
  }, [scenceIds, detail])

  useEffect(() => {
    if (detail?.label) {
      setCurrentRoleList(
        detail.label.filter((label) => {
          return roleIds.some((i) => i === label.labelId)
        }),
      )
    }
  }, [roleIds, detail])

  useEffect(() => {
    setScenceList(tagList.filter((tag) => tag.type === LABEL_TYPE.SCENCE))
    setRoleList(tagList.filter((tag) => tag.type === LABEL_TYPE.PERSON))
    tagListRef.current = tagList
  }, [tagList])

  useEffect(() => {
    setIsAudioPlaying(detail?.index === playAudioIndex)
  }, [playAudioIndex, detail])

  useEffect(() => {
    setImgCostSum(parseInt(enquiryImgCost * repaintingCount))
  }, [enquiryImgCost, repaintingCount])

  const drawingCurrent =
    [
      STROYBOARD_STATE.ILLATION_ING,
      STROYBOARD_STATE.DRAWING_ING,
      STROYBOARD_STATE.TRANS_VIDEO_ING,
    ].indexOf(detail?.state) > -1
  const isUnIllation =
    [
      STROYBOARD_STATE.STOP,
      STROYBOARD_STATE.ILLATION_WAIT,
      STROYBOARD_STATE.ILLATION_LINEUP,
      STROYBOARD_STATE.ILLATION_ING,
    ].indexOf(detail?.state) > -1

  let paintDetailRight = (
    <div className="paintDetailRight">
      <div className="optContent" style={isUnIllation ? { visibility: 'hidden' } : {}}>
        <div className="detailCell cell2">
          {detail && !drawingCurrent && (
            <div className="cellContent">
              {
                <>
                  <EditText
                    setIsEdit={setIsEdit}
                    editTextRef={editTextRef}
                    drawingModel={drawingModel}
                    drawingSdState={drawingSdState}
                    isSavePromptLoading={isSavePromptLoading}
                    height={130}
                    value={detail.prompt_chinese}
                    onEdit={(value) => handlePrompt(value, detail.index)}
                    slot={
                      <div>
                        <div className="labelCell" onClick={changeScenario}>
                          <div style={{ flexShrink: 0 }}>场景：</div>
                          <div className="flex-center labelCellContent">
                            {currentScence?.label?.names ? currentScence?.label?.names[0] : '无'}
                          </div>
                          <EditOutlined style={{ marginLeft: 10 }} />
                        </div>
                        <div className="labelCell" onClick={changeRole}>
                          <div style={{ flexShrink: 0 }}>角色：</div>
                          {currentRoleList?.length ? (
                            <div className="flex-center">
                              {currentRoleList.map((role) => (
                                <div
                                  className="labelCellContent"
                                  style={{ paddingRight: 5 }}
                                  key={role?.labelId}
                                >
                                  {role?.label?.names[0]}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex-center">无</div>
                          )}
                          <EditOutlined style={{ marginLeft: 10 }} />
                        </div>
                        <div className="flex-left">故事情景：</div>
                      </div>
                    }
                    lockEdit={false}
                  />
                </>
              }
            </div>
          )}
        </div>
        <div className="detailCell cell4">
          {detail && !drawingCurrent && (
            <div className="cellContent">
              {
                <>
                  <div>运镜效果</div>
                  <Select
                    value={animation}
                    onChange={changeAnimation}
                    options={animationList}
                    className="animationSelect"
                  />
                </>
              }
            </div>
          )}
        </div>
        <div className="detailCell cell5">
          {detail && !drawingCurrent && (
            <div className="cellContent">
              {
                <>
                  <div style={{ paddingRight: '10px' }}>重绘数量</div>
                  <Slider
                    style={{ flex: 1 }}
                    min={1}
                    max={9}
                    onChange={handleChangeScroll}
                    value={repaintingCount}
                  />
                  <InputNumber
                    min={1}
                    max={9}
                    style={{ width: '50px' }}
                    value={repaintingCount}
                    onChange={handleChangeScroll}
                  />
                </>
              }
            </div>
          )}
        </div>
      </div>
      {detail && (
        <div style={{ paddingTop: 10, visibility: isUnIllation ? 'hidden' : 'visible' }}>
          <Button
            className="detailLargeBtn"
            type="primary"
            onClick={() => redrawByRepaintingCount(detail)}
            disabled={!drawingSdState || drawingCurrent}
          >
            重绘分镜
            {drawingModel === 'cloud' && drawingSdState && (
              <IconFont
                type="icon-jinbi1"
                style={{ color: '#f9dd4b', marginTop: 2, marginLeft: 2 }}
              />
            )}
            {drawingModel === 'cloud' && imgCostSum}
          </Button>
        </div>
      )}
    </div>
  )
  if (isTransVideo) {
    paintDetailRight = (
      <div className="paintDetailRight">
        <Button
          icon={<LeftOutlined />}
          type="text"
          onClick={() => setIsTransVideo(false)}
          size="large"
          className="backBtn"
        >
          返回
        </Button>
        <div className="detailCell cell3">
          {detail && !drawingCurrent && (
            <div className="cellContent">
              {
                <>
                  <div className="flex-between" style={{ width: '100%', marginBottom: 10 }}>
                    <div>转视频模型：</div>
                    <Select
                      style={{
                        width: 150,
                      }}
                      value={sdConfig.videoModel}
                      options={videoTemplateOptionsCloud}
                      onChange={changeVideoModelForCloud}
                    />
                  </div>
                  <EditText
                    drawingModel={drawingModel}
                    drawingSdState={drawingSdState}
                    isSavePromptLoading={isSavePromptLoading}
                    value={detail.video_prompt}
                    onEdit={(value) => handleEdit('video_prompt', value, detail.index)}
                    lockEdit={false}
                    placeholder="结合图片，描述你想生成的画面和动作"
                  />
                </>
              }
            </div>
          )}
        </div>
        {detail && (
          <div style={{ paddingTop: 10 }}>
            <Button
              className="detailLargeBtn"
              type="primary"
              onClick={() => {
                if (!isCanTransVideo) {
                  message.error('只能用图片转视频，请切换当前选中')
                  return
                }
                redrawVideo(detail)
              }}
              style={{ marginTop: 10 }}
              disabled={!drawingSdState || drawingCurrent}
            >
              生成视频
              {drawingSdState && (
                <IconFont
                  type="icon-jinbi1"
                  style={{ color: '#f9dd4b', marginTop: 2, marginLeft: 2 }}
                />
              )}
              {enquiryVideoCost}
            </Button>
          </div>
        )}
      </div>
    )
  }
  const roleName = selectedVoice?.label

  const sourceDom = (
    <div className="flex-center sourceWrap">
      <TextArea
        size="large"
        value={inputText}
        className="source"
        spellCheck={false}
        onChange={(e) => setInputText(e.target.value)}
        ref={inputRef}
        maxLength={60}
        onBlur={async () => {
          if (!inputText) {
            setInputText(bakSource)
          }
          if (inputText !== bakSource && inputText) {
            handleEditText(inputText, detail.index)
            console.log('修改source')
          }
        }}
        autoSize={{ minRows: 1, maxRows: 1 }}
      />
      <EditOutlined
        style={{ cursor: 'pointer' }}
        onClick={() => {
          inputRef.current.focus()
        }}
      />
      <Popover
        content={
          <div className="flex-column-center">
            <Select
              value={selectedVoice}
              size="large"
              style={{ width: 210 }}
              onChange={changeVoice}
              placeholder="请选择旁白配音"
              options={audioVoiceList}
              labelRender={({ label }) => <div style={{ textAlign: 'left' }}>{label}</div>}
            />
            <Button
              className="retryBtn"
              loading={playAudioLoading}
              onClick={(e) => {
                if (playAudio) {
                  playAudio(setPlayAudioLoading, isAudioPlaying, detail)
                }
                e.stopPropagation()
              }}
            >
              试听
            </Button>
          </div>
        }
        title="更改配音"
        trigger="click"
      >
        <Button size="large" type="text" className="retryBtnWrap">
          <IconFont type="icon-a-5Jyinboyinpin" style={{ fontSize: 16 }} />
          {isAudioPlaying ? '停止' : roleName}
        </Button>
      </Popover>
    </div>
  )

  let detailContent = null
  let isCanTransVideo = true
  const storyboardStateInfo = STROYBOARD_STATE_LABEL[detail?.state] || {}
  const isShowLineupRow =
    (detail?.state === STROYBOARD_STATE.DRAWING_LINEUP ||
      detail?.state === STROYBOARD_STATE.TRANS_VIDEO_LINEUP) &&
    detail?.lineup >= 0

  if (
    detail?.state <= STROYBOARD_STATE.ILLATION_DONE ||
    (detail?.chosenPic > 0 && detail?.materials?.length > 0)
  ) {
    const targetImg = detail?.materials?.find((i) => i?.mIndex == detail?.chosenPic)
    if (detail?.state <= STROYBOARD_STATE.ILLATION_DONE || targetImg?.isLoading) {
      detailContent = (
        <div
          className="flex-column-center"
          style={{ flex: 1, width: '100%', position: 'relative' }}
        >
          {storyboardStateInfo.isLoading && <LoadingOutlined style={{ fontSize: 24 }} />}
          <span className="detailLoadingText">
            {storyboardStateInfo.title}
            {isShowLineupRow && `，您前面还有${detail?.lineup || 0}位`}
            {storyboardStateInfo.subTitle}
          </span>
          {isShowLineupRow && (
            <Button
              onClick={cancelLineup}
              style={{ background: '#C2CAC6', color: '#424242', marginTop: 10 }}
            >
              取消排队
            </Button>
          )}
          {storyboardStateInfo.tip && (
            <div className="detailLoadingTextSmall">{storyboardStateInfo.tip}</div>
          )}
          {storyboardStateInfo.isShowRetryBtn && (
            <Button style={{ marginTop: 15 }} onClick={handleRetry}>
              重试
            </Button>
          )}
          <div style={{ position: 'absolute', bottom: 0, width: '100%' }}>{sourceDom}</div>
        </div>
      )
    } else if (targetImg?.mFormat === '.mp4') {
      isCanTransVideo = false
      detailContent = <VideoPlayer src={formatLocalAssets(targetImg.mUrl)} />
    } else {
      detailContent = (
        <Image
          src={formatLocalAssets(targetImg.mUrl)}
          preview={false}
          width={'100%'}
          height={'100%'}
          fallback="加载中"
          placeholder={
            <Image
              preview={false}
              src={formatLocalAssets(targetImg.mUrl, 0.1)}
              width={'100%'}
              height={'100%'}
            />
          }
        />
      )
    }
  } else {
    detailContent = (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }} className="detailLoadingText">
        {detail?.isIllationFailed
          ? '推理失败，请稍后再试！'
          : detail?.isPaintingFailed
            ? '绘图失败，请稍后再试！'
            : ''}
      </div>
    )
  }

  return (
    <Layout style={{ background: '#101010', overflow: 'auto' }}>
      <Content className="paintContent" style={{ overflow: 'auto', minHeight: '550px' }}>
        <div className="flex-between currentDetail">
          <div className="paintDetailLeft">
            <Button
              type="text"
              onClick={() => {
                if (detail?.chosenPic < 1) return
                setIsTransVideo(true)
              }}
              size="large"
              className="transVideoBtn"
              style={detail?.chosenPic < 1 ? { background: 'gray', cursor: 'not-allowed' } : {}}
            >
              <IconFont type="icon-zhuanhuan-yuan-shangxia-F" style={{ fontSize: 16 }} />
              转视频
            </Button>
            {detail ? (
              <div
                style={{
                  height: 'calc(100% - 224px)',
                  width: '100%',
                  position: 'relative',
                  display: 'flex',
                }}
              >
                {detailContent}
                {sourceDom}
              </div>
            ) : (
              <div style={{ flex: 1 }}></div>
            )}
            <Footer className="paintFooter">
              <div>生成记录</div>
              {detail && (
                <ImageList
                  setContentInset={setContentInset}
                  images={detail.materials}
                  projectId={projectId}
                  cIndex={detail['index']}
                  detail={detail}
                  drawingState={drawingState}
                  repaintingCount={repaintingCount}
                />
              )}
            </Footer>
          </div>
          {paintDetailRight}
        </div>
      </Content>
      <Modal
        title="修改出镜场景"
        open={showScenceChangeModal}
        okText="确定"
        onOk={saveScenceChange}
        onCancel={() => setShowScenceChangeModal(false)}
        cancelText="取消"
        zIndex={999}
        centered
        width={820}
      >
        <div className="detailTagModalWrap">
          <div className="detailTagModalWrap2" style={{ minHeight: 350, overflowX: 'auto' }}>
            {scenceList &&
              scenceList.map((item) => {
                return item?.materials?.length > 0 ? (
                  <LabelCard
                    key={item?.labelId}
                    item={item}
                    getLabelInfo={refreshRoleProperties}
                    labelType={LABEL_TYPE.SCENCE}
                    taskId={projectId}
                    size="big"
                    handleClick={() => {
                      handleSelect(item, true)
                    }}
                    isSelect={selectScenceId === item.labelId}
                    isHideReDrawBtn={true}
                    setCreateModel={setCreateModel}
                    setTargetLabel={setTargetLabel}
                  />
                ) : (
                  ''
                )
              })}
            <AddLabelCard
              labelType={LABEL_TYPE.SCENCE}
              size="big"
              setCreateModel={setCreateModel}
              setTargetLabel={setTargetLabel}
            />
          </div>
        </div>
      </Modal>
      <Modal
        title="修改出镜角色"
        open={showRoleChangeModal}
        okText="确定"
        onOk={saveRoleChange}
        onCancel={() => setShowRoleChangeModal(false)}
        cancelText="取消"
        zIndex={999}
        centered
        width={820}
      >
        <div className="detailTagModalWrap">
          <div className="detailTagModalWrap2" style={{ minHeight: 350, overflowX: 'auto' }}>
            {roleList &&
              roleList.map((item) => {
                return item?.materials?.length > 0 ? (
                  <LabelCard
                    key={item?.labelId}
                    item={item}
                    getLabelInfo={refreshRoleProperties}
                    labelType={LABEL_TYPE.PERSON}
                    taskId={projectId}
                    size="big"
                    handleClick={() => {
                      handleSelect(item, true)
                    }}
                    isSelect={selectRoleIds.some((selected) => selected === item.labelId)}
                    isHideReDrawBtn={true}
                    setCreateModel={setCreateModel}
                    setTargetLabel={setTargetLabel}
                  />
                ) : (
                  <div
                    className="flex-column-center detailTagModal"
                    onClick={() => {
                      handleSelect(item, true)
                    }}
                  >
                    <div className="modalTip flex-center">
                      {item.isLoading ? (
                        <LoadingOutlined style={{ fontSize: 30 }} />
                      ) : (
                        <span onClick={() => getPrevImage(item)} style={{ cursor: 'pointer' }}>
                          预览效果图
                        </span>
                      )}
                    </div>
                    <div className="detailTagText">{item.names[0]}</div>
                  </div>
                )
              })}
            <AddLabelCard
              labelType={LABEL_TYPE.PERSON}
              size="big"
              setCreateModel={setCreateModel}
              setTargetLabel={setTargetLabel}
            />
          </div>
        </div>
      </Modal>
      <AddLabelModal
        drawingModel={drawingModel}
        createModel={createModel}
        setCreateModel={setCreateModel}
        newLabelIdRef={newLabelIdRef}
        labelId={targetLabel?.labelId}
        getLabelInfo={refreshRoleProperties}
        labelType={targetLabel?.type}
        defaultLabelInfo={targetLabel}
        taskId={projectId}
        projectName={projectName}
        paintingStyleValue={paintingStyleValue}
        pictureSize={pictureSize}
        sdConfig={sdConfig}
        labelAllListMap={labelAllListMap}
        updateAllLabelList={updateAllLabelList}
        enquiryImgCost={enquiryImgCost}
        updateAccountInfo={updateAccountInfo}
      />
    </Layout>
  )
}

export default CurrentDetail
