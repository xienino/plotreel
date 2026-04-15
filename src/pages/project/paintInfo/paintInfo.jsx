import React, { useState, useRef } from 'react'
import { message, Layout, Button, Progress, Select, Modal, Tooltip } from 'antd'
import axios from 'axios'

import { useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ArrowDownOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons'
import {
  LACK_GOLD_CODE,
  SUCCESS_CODE,
  TRANS_VIDEO_STATE,
  ERROR_CODE,
  STROYBOARD_STATE,
  SELECT_MODE_LIST,
  SELECT_MODE,
  LABEL_TYPE,
  MSG_CODE,
  DRAW_STATE,
  BATCH_NUM,
} from '../../../assets/constant'
import { IconFont } from '../../../common/iconfont'
import { urlToBlobBase64, formatLocalAssets } from '../../../common/util'
import './paintInfo.sass'

import api from '../../../services/project'

import Storyboard from './storyboard'
import CurrentDetail from './currentDetail'

const { Sider } = Layout

const PaintInfo = () => {
  const {
    projectId,
    childRef,
    projectName,
    isComposed,
    setIsComposed,
    setComposeState,
    setVideoPath,
    setIsInited,
    checkProgress,
    checkExportJYProgress,
    isComplete,
    setIsComplete,
    drawingModel,
    drawingSdState,
    updateAccountInfo,
    enquiryImgCost,
    enquiryVideoCost,
    sdConfig,
    videoTemplateOptionsCloud,
    changeVideoModelForCloud,
    checkCoin,
    labelAllListMap,
    updateAllLabelList,
  } = useOutletContext()

  const [paintingStyleValue, setPaintingStyleValue] = useState() // 视觉风格
  const [pictureSize, setPictureSize] = useState('768*1344') // 画面尺寸
  const [tagList, setTagList] = useState([]) // 全部标签列表
  const [mediumData, setMediumData] = useState([]) // 主数据
  const [deleteShootingModalState, setDeleteShootingModalState] = useState(false) // 分镜删除弹窗是否展示
  const [currentIndex, setCurrentIndex] = useState(0) // 当前选中的行index
  const selectedIndexRef = useRef(0)
  const [selectedList, setSelectedList] = useState([]) // 选中分镜的index列表
  const [modal, modalContextHolder] = Modal.useModal()
  const [targetDeleteIndex, setTargetDeleteIndex] = useState() // 单一删除的分镜
  const [extractPercent, setExtractPercent] = useState(0) // 情节推理进度
  const [drawPercent, setDrawPercent] = useState(0) // 绘图进度

  // 关键词
  const [drawedNum, setDrawedNum] = useState(0)

  // 绘图
  const drawingTimer = useRef()
  const drawingVideoTimerListRef = useRef({})
  const drawingImageTimerListRef = useRef({})

  // 批量任务定时器
  const batchTasksTimer = useRef()
  // 智能分割
  const intelligentIimer = useRef()
  const [manualRefreshMedium, setManualRefreshMedium] = useState(false) // 强制更新所有数据 forceUpdate

  const [playAudioIndex, setPlayAudioIndex] = useState(null)
  const [repaintingCount, setRepaintingCount] = useState(1)
  const [prevImageMappings, setPrevImageMappings] = useState({})
  const prevImageMappingsRef = useRef({})
  const voicePlay = useRef()

  // 当前选择分镜的模式
  const [imgCostSum, setImgCostSum] = useState() // 所选分镜配图总费用
  const [selectMode, setSelectMode] = useState(SELECT_MODE.ALL)

  const mediumDataRef = useRef(mediumData)

  const isSavePromptLoading = useRef(false) // 智能推理关键词框编辑后，是否正在保存中
  const isRedrawImageLoading = useRef(false) // 重绘当前分镜，是否正在loading中（等待关键词编辑保存后再进行重绘）

  const detailRef = useRef()
  const newLabelIdRef = useRef(1) // 标签id

  const abortExtractRef = useRef({}) // 使用 ref 存储 abortController 避免渲染重置
  const abortDrawRef = useRef({}) // 使用 ref 存储 abortController 避免渲染重置

  // 向下插入分镜
  const handleAddItem = async (targetIndex) => {
    const res = await api.addMediumShooting({
      taskId: projectId,
      index: targetIndex,
    })
    if (res?.data?.resCode === SUCCESS_CODE) {
      let newMediumData = [...mediumDataRef.current]
      const { animation, height, lens, type, width } = mediumData[0]
      const emptyItem = {
        animation,
        chosenPic: 0,
        height,
        index: targetIndex,
        label: [],
        lens,
        materials: [],
        source: '',
        state: STROYBOARD_STATE.STOP,
        type,
        width,
      }
      newMediumData.splice(targetIndex, 0, emptyItem)
      const newSelectedList = []
      for (const [index, element] of newMediumData.entries()) {
        // 重排index
        if (element && element.materials) {
          element.materials = element.materials.map((i) => {
            i.mUrl =
              i.mUrl.replace(`${projectId}/${element.index}`, `${projectId}/${index}`) +
              `?t=${new Date().getTime()}` // 图片重新加载
            return i
          })
        }
        if (selectedList.indexOf(element?.index) > -1) {
          newSelectedList.push(index)
        }
        element.index = index
      }
      setSelectedList(newSelectedList)
      setMediumData(newMediumData)
      mediumDataRef.current = newMediumData
      api.getProjectDetail({
        // mock
        taskId: projectId,
      })
    }
  }
  const deleteShooting = async () => {
    // 删除分镜
    const isSingleDelete = targetDeleteIndex != null
    if (targetDeleteIndex == null && !selectedList?.length) {
      return
    }
    const params = {
      taskId: projectId,
      indexes: isSingleDelete ? [targetDeleteIndex] : selectedList,
    }
    const res = await api.deleteMediumShooting(params)
    if (res?.data?.resCode === SUCCESS_CODE) {
      const newMediumData = [...mediumDataRef.current].filter((item) => {
        return isSingleDelete
          ? targetDeleteIndex !== Number(item.index)
          : selectedList.indexOf(Number(item.index)) < 0
      })
      const newSelectedList = []
      for (const [index, element] of newMediumData.entries()) {
        // 重排index
        if (element && element.materials) {
          element.materials = element.materials.map((i) => {
            i.mUrl =
              i.mUrl.replace(`${projectId}/${element.index}`, `${projectId}/${index}`) +
              `?t=${new Date().getTime()}` // 图片重新加载
            return i
          })
        }
        element.index = index
        if (selectedList.indexOf(element?.index) > -1) {
          newSelectedList.push(index)
        }
      }
      if (isSingleDelete) {
        setSelectedList(newSelectedList)
      } else {
        setSelectedList([])
      }
      setMediumData(newMediumData)
      mediumDataRef.current = newMediumData
      setDeleteShootingModalState(false)
    }
    let newSelectedIndexes = currentIndex
    if (isSingleDelete) {
      newSelectedIndexes = targetDeleteIndex - 1 > -1 ? targetDeleteIndex - 1 : 0
    } else if (selectedList.some((i) => i == newSelectedIndexes)) {
      newSelectedIndexes = selectedList[0] - 1 > -1 ? selectedList[0] - 1 : 0
    }
    setCurrentIndex(newSelectedIndexes)
    selectedIndexRef.current = newSelectedIndexes
    if (isSingleDelete != null) {
      setTargetDeleteIndex(null)
    }
  }

  // 将子组件实例绑定到父组件传递的 ref 上
  React.useImperativeHandle(childRef, () => ({
    handleBack,
    handleNext,
    handleExportJY,
    clearFunc,
  }))

  const handleExportJY = async (useExistingAudio) => {
    // 导出剪映草稿
    if (isComplete && isComposed) {
      setComposeState(true)
      return
    }
    try {
      await genAudio()
      const params = {
        taskId: projectId,
        backgroundMusic: '', // todo
        useExistingAudio,
        indexes: mediumData.map((item) => item?.index),
      }
      const result = await api.exportJianyingDraft(params)
      if (result?.data?.resCode !== SUCCESS_CODE) {
        message.error('合成报错，请联系管理员查看详情')
        return
      }
      await checkExportJYProgress()
    } catch (e) {
      message.error('网络错误，请稍等')
    }
  }

  const genAudio = async () => {
    const instance = modal.info({
      title: '导出音频中...',
      content: '',
      footer: null,
      centered: true,
    })
    for (let i in mediumData) {
      const item = mediumData[i]
      const audioRes = await api.genAudio({
        // 步骤1: 生成分镜音频
        text: item.source,
        voice: item.voice.role,
      })
      await api.saveStoryboardAudio({
        // 步骤2: 分镜音频存本地
        taskId: projectId,
        index: item.index,
        source: item.source,
        audioBase64: audioRes?.data?.resData?.data,
        subtitles: audioRes?.data?.resData?.subtitles,
      })
    }
    instance.destroy()
  }
  const handleBack = async () => {
    if (
      mediumData.find(
        (i) => [STROYBOARD_STATE.ILLATION_ING, STROYBOARD_STATE.DRAWING_ING].indexOf(i.state) > -1,
      )
    ) {
      const res = await modal.confirm({
        content: '检测到您有正在推理/绘图中的分镜，是否等待推理完成/绘图完成再返回菜单',
        cancelText: '否',
        okText: '是',
      })
      return res
    }
  }

  const handleNext = async (useExistingAudio) => {
    // 点击下一步 导出视频
    if (isComplete && isComposed) {
      setComposeState(true)
      return
    }

    try {
      await genAudio()
      setComposeState(true)
      const result = await api.makeVideo({
        // 步骤3: 合成视频
        taskId: projectId,
        indexList: mediumData.map((item) => {
          return {
            index: item?.index,
            source: item?.source,
            animation: item?.animation,
            chosenPic: item?.chosenPic,
          }
        }),
      })
      if (result?.data?.resCode != SUCCESS_CODE) {
        let msg = '合成报错'
        if (result?.data?.resMsg?.msgCode == 2) msg = '合成音频报错'
        if (result?.data?.resMsg?.msgCode == 3) msg = '合成视频报错'
        message.error(`${msg}，请联系管理员查看详情`)
        return true
      }
      result.data.resData.videoPath && setVideoPath(result.data.resData.videoPath)
      await checkProgress()
    } catch (e) {
      message.error('网络错误，请稍等')
    }
  }
  const handleEditTag = async (label, cIndex) => {
    // 修改标签
    const newMediumData = [...mediumDataRef.current]
    const targetRow = newMediumData.find((item) => item.index === cIndex)
    const {
      index,
      source,
      prompt_chinese,
      prompt_english,
      chosenPic,
      voice,
      lens,
      animation,
      video_prompt,
    } = targetRow
    targetRow.label = label
    const { data } = await api.setFileContent({
      taskId: projectId,
      textList: [
        {
          index,
          source,
          prompt_chinese,
          prompt_english,
          chosenPic,
          voice,
          label,
          lens,
          animation,
          video_prompt,
        },
      ],
    })
    if (data.resCode === SUCCESS_CODE) {
      setIsComposed(false)
      setMediumData(newMediumData)
      mediumDataRef.current = newMediumData
    } else {
      message.error(data.resMsg.msgText)
    }
  }

  const handlePrompt = async (prompt_chinese, cIndex) => {
    if (!prompt_chinese) {
      message.warning('故事情景不能为空')
    }
    const newMediumData = [...mediumDataRef.current]
    const targetRow = newMediumData.find((item) => item.index === cIndex)
    if (targetRow['prompt_chinese'] === prompt_chinese) {
      return
    }
    let prompt_english = ''
    if (prompt_chinese) {
      const transRes = await api.translation({
        text: prompt_chinese,
        sourceLang: 'zh',
        targetLang: 'en',
      })
      if (!transRes?.data?.resData) {
        message.error('修改画面提示词失败，请重试')
        isSavePromptLoading.current = false
        return
      }
      prompt_english = transRes?.data?.resData?.TargetText
    }

    targetRow.prompt_chinese = prompt_chinese
    targetRow.prompt_english = prompt_english

    const { data } = await api.setFileContent({
      taskId: projectId,
      textList: [
        {
          index: targetRow.index,
          prompt_chinese: prompt_chinese,
          prompt_english: prompt_english,
        },
      ],
    })
    if (data?.resCode === SUCCESS_CODE) {
      setIsComposed(false)
      setMediumData(newMediumData)
      mediumDataRef.current = newMediumData
      if (prompt_chinese) message.success('已更新智能推理关键词')
    } else {
      message.error(data.resMsg.msgText)
    }
    isSavePromptLoading.current = false
    if (isRedrawImageLoading.current) {
      isRedrawImageLoading.current = false
      redrawImage(targetRow)
    }
  }

  const handleEditText = async (text, cIndex) => {
    // 编辑原文描述, 点击保存时
    if (!text) {
      return
    }
    const newMediumData = [...mediumDataRef.current]
    const targetRow = newMediumData.find((item) => item.index === cIndex)
    if (targetRow['source'] === text) {
      return
    }
    targetRow.source = text
    const {
      index,
      source,
      prompt_chinese,
      prompt_english,
      chosenPic,
      voice,
      label,
      lens,
      animation,
      video_prompt,
    } = targetRow
    const { data } = await api.setFileContent({
      taskId: projectId,
      textList: [
        {
          index,
          source,
          prompt_chinese,
          prompt_english,
          chosenPic,
          voice,
          label,
          lens,
          animation,
          video_prompt,
        },
      ],
    })
    if (data.resCode === SUCCESS_CODE) {
      setIsComposed(false)
      setMediumData(newMediumData)
      mediumDataRef.current = newMediumData
    } else {
      message.error(data.resMsg.msgText)
    }
  }

  const handlePlayAudio = async (setPlayAudioLoading, isAudioPlaying, record) => {
    if (isAudioPlaying) {
      voicePlay.current && voicePlay.current.pause()
      setPlayAudioIndex(null)
      return
    }
    let hide = message.loading('正在获取音频……')
    const currentKey = `${record['index']}`
    setPlayAudioIndex(currentKey)
    setPlayAudioLoading(true)
    const audioRes = await api.genAudio({
      // 步骤1: 生成分镜音频
      text: record.source,
      voice: record?.voice?.role,
    })
    if (audioRes?.data?.resMsg?.msgCode === MSG_CODE.COST_ERROR) {
      message.error('播放音频失败，余额不足')
      setPlayAudioLoading(false)
      hide()
      return
    }
    const response = await api.saveStoryboardAudio({
      // 步骤2: 分镜音频存本地
      taskId: projectId,
      index: record.index,
      source: record.source,
      audioBase64: audioRes?.data?.resData?.data,
      subtitles: audioRes?.data?.resData?.subtitles,
    })
    hide()
    if (response && response?.data?.resCode === SUCCESS_CODE) {
      if (voicePlay.current) {
        voicePlay.current.pause()
      }
      voicePlay.current = new Audio(
        formatLocalAssets(response?.data?.resData?.audioUrl + `?t=${new Date().getTime()}`), // 音频存储路径不变，重置后需重新加载
      )
      voicePlay.current.addEventListener('canplaythrough', (event) => {
        voicePlay.current.play()
      })
      voicePlay.current.addEventListener('ended', (event) => {
        setPlayAudioIndex(null)
      })
    } else {
      message.error('播放音频失败')
    }
    setPlayAudioLoading(false)
  }

  const setTranVideoInterval = async (transVideoTaskId, index) => {
    // transVideoTaskId
    drawingVideoProcess(transVideoTaskId, index)
    if (drawingVideoTimerListRef?.current[index]) {
      clearInterval(drawingVideoTimerListRef?.current[index])
    }
    const id = setInterval(() => drawingVideoProcess(transVideoTaskId, index), 10000)
    drawingVideoTimerListRef.current = {
      ...drawingVideoTimerListRef.current,
      [index]: id,
    }
  }
  const setSyncDrawInterval = async (drawTaskId, index) => {
    return new Promise((resole, reject) => {
      drawingImageProcess(drawTaskId, index)
      if (drawingImageTimerListRef?.current[index]) {
        clearInterval(drawingImageTimerListRef?.current[index])
      }
      const id = setInterval(async () => {
        const isDone = await drawingImageProcess(drawTaskId, index)
        if (isDone) {
          resole(isDone)
        }
      }, 5000)
      drawingImageTimerListRef.current = {
        ...drawingImageTimerListRef.current,
        [index]: id,
      }
    })
  }
  // 文生图 定时查询任务
  const drawingImageProcess = async (drawTaskId, index) => {
    let isDone = false
    const newMediumData = [...mediumDataRef.current]
    newMediumData.drawTaskId = drawTaskId
    const { data } =
      (await api.generationsCheck({
        taskId: drawTaskId,
      })) || {}
    if (data?.resCode === SUCCESS_CODE) {
      let localImageRes = null
      let lineupRes
      switch (data?.resData?.status) {
        case DRAW_STATE.DONE:
          updateAccountInfo()
          localImageRes = await api.saveStoryboardImage({
            // 分镜图片保存本地
            taskId: projectId,
            index: index, // 分镜序号
            imageList: data?.resData?.imageList.map((i) => ({
              format: 'url',
              imageData: i.url,
            })),
          })
          await updateTargetDetail(index, localImageRes?.data?.resData?.materials[0]?.mIndex)
          isDone = true
          break
        case DRAW_STATE.ING:
          newMediumData[index].state = STROYBOARD_STATE.DRAWING_ING
          break
        case DRAW_STATE.LINEUP:
          newMediumData[index].state = STROYBOARD_STATE.DRAWING_LINEUP
          break
        case DRAW_STATE.ERROR:
          newMediumData[index].state = STROYBOARD_STATE.DRAWING_FAIL
          message.error(data?.resMsg?.msgText || '绘图出现异常，请重新操作')
          isDone = true
          break
        default:
          newMediumData[index].state = STROYBOARD_STATE.ILLATION_DONE
          break
      }
      if (data?.resData?.status === DRAW_STATE.LINEUP) {
        lineupRes = await api.queueCheck({ taskId: drawTaskId })
        if (lineupRes?.data?.resData >= 0)
          newMediumData[index].lineup = lineupRes?.data?.resData + 1
      } else {
        newMediumData[index].lineup = null
      }
    } else {
      message.error('绘图报错，请联系管理员处理')
      newMediumData.forEach((i) => {
        if (Number(i.index) === Number(index)) {
          i.state = STROYBOARD_STATE.DRAWING_FAIL
        }
      })
      isDone = true
    }
    setMediumData(newMediumData)
    mediumDataRef.current = newMediumData
    const unDoneStateList = [
      STROYBOARD_STATE.DRAWING_WAIT,
      STROYBOARD_STATE.DRAWING_LINEUP,
      STROYBOARD_STATE.DRAWING_ING,
    ]
    const doneData = handleProcess(newMediumData, unDoneStateList)
    if (doneData.length === selectedList.length) {
      setDrawPercent(100)
      setTimeout(() => setDrawPercent(0), 300)
    } else {
      if (!doneData.length) return
      setDrawPercent(parseInt((doneData.length / selectedList.length) * 100))
    }
    if (isDone) {
      clearImageIntervalAndSave(index)
      soleveImageListLoading(index)
    }
    return isDone
  }
  const soleveImageListLoading = (index) => {
    const currentMediumData = [...mediumDataRef.current]
    const currentRecord = currentMediumData[index] || {}
    let newMaterials = currentRecord.materials ? [...currentRecord.materials] : []
    if (newMaterials?.length < 1) return
    if (newMaterials[newMaterials.length - 1]?.isLoading) {
      newMaterials.pop()
    }
    currentRecord.materials = newMaterials
    setMediumData(currentMediumData)
    mediumDataRef.current = currentMediumData
  }
  const clearImageIntervalAndSave = (index) => {
    if (drawingImageTimerListRef.current[index]) {
      clearInterval(drawingImageTimerListRef?.current[index])
      api.setFileContent({
        taskId: projectId,
        textList: [
          {
            index: index,
            drawTaskId: '',
          },
        ],
      })
      drawingImageTimerListRef.current[index] = null
    }
    const existList = Object.values(drawingImageTimerListRef.current)
    return existList.filter((i) => !!i)
  }
  const clearVideoIntervalAndSave = (index) => {
    if (drawingVideoTimerListRef.current[index]) {
      clearInterval(drawingVideoTimerListRef.current[index])
      api.setFileContent({
        taskId: projectId,
        textList: [
          {
            index: index,
            transVideoTaskId: '',
          },
        ],
      })
      drawingVideoTimerListRef.current[index] = null
    }
    const existList = Object.values(drawingVideoTimerListRef.current)
    return existList.filter((i) => !!i)
  }
  // 生成视频
  const redrawVideo = async (record) => {
    const currentMediumData = [...mediumDataRef.current]
    currentMediumData
      .filter((item) => Number(record.index) === Number(item.index))
      .forEach((item) => (item.state = STROYBOARD_STATE.TRANS_VIDEO_LINEUP))
    setMediumData(currentMediumData)
    mediumDataRef.current = currentMediumData

    const targetImg = record?.materials.find((i) => i?.mIndex === record.chosenPic)
    let prompt = ' '
    if (record?.video_prompt) {
      const transRes = await api.translation({
        text: record?.video_prompt,
        sourceLang: 'zh',
        targetLang: 'en',
      })
      prompt = transRes?.data?.resData?.TargetText
    }
    const imgBase64 = await urlToBlobBase64(formatLocalAssets(targetImg?.mUrl))
    const result = await api.image2video({
      // 图转视频
      prompt, // 正向提示词
      image: imgBase64?.base64?.replace('data:image/png;base64,', ''),
      model: sdConfig.videoModel,
    })
    switch (result?.data?.resCode) {
      case LACK_GOLD_CODE: // -3
        currentMediumData.forEach((i) => (i.state = STROYBOARD_STATE.TRANS_VIDEO_FAIL))
        setMediumData(currentMediumData)
        mediumDataRef.current = currentMediumData
        break
      case SUCCESS_CODE: // 1
        // 把图转视频的taskId存入项目数据中
        api.setFileContent({
          taskId: projectId,
          textList: [
            {
              index: record.index,
              transVideoTaskId: result?.data?.resData?.taskId,
            },
          ],
        })
        setTranVideoInterval(result?.data?.resData?.taskId, record.index)
        break
      default: // 比如0
        // 转视频异常，需要把当前分镜isVideoFailed改为true, 但不能中止所有分镜制作
        currentMediumData[record.index].state = STROYBOARD_STATE.TRANS_VIDEO_FAIL
        setMediumData(currentMediumData)
        mediumDataRef.current = currentMediumData
    }
  }

  const changeDetail = async (index, record) => {
    setCurrentIndex(index)
    selectedIndexRef.current = index
  }

  // 图生视频定时查询任务
  const drawingVideoProcess = async (transVideoTaskId, index) => {
    const newMediumData = [...mediumDataRef.current]
    const { data } =
      (await api.image2videoCheck({
        taskId: transVideoTaskId,
      })) || {}

    if (data?.resCode === SUCCESS_CODE) {
      let localVideoRes = null
      let lineupRes = null
      switch (data?.resData?.status) {
        case TRANS_VIDEO_STATE.DONE:
          clearVideoIntervalAndSave(index)
          updateAccountInfo() // 更新算币总额
          localVideoRes = await api.saveStoryboardVideo({
            // 分镜视频保存本地
            taskId: projectId,
            index: index, // 分镜序号
            videoUrl: data?.resData?.videoUrl,
          })
          updateTargetDetail(index, localVideoRes?.data?.resData?.materials?.mIndex)

          break
        case TRANS_VIDEO_STATE.ING:
          newMediumData[index].state = STROYBOARD_STATE.TRANS_VIDEO_ING
          break
        case TRANS_VIDEO_STATE.LINEUP:
          newMediumData[index].state = STROYBOARD_STATE.TRANS_VIDEO_LINEUP
          break
        case TRANS_VIDEO_STATE.ERROR:
          newMediumData[index].state = STROYBOARD_STATE.TRANS_VIDEO_FAIL
          message.error(data?.resMsg?.msgText || '图转视频出现异常，请重新操作')
          clearVideoIntervalAndSave(index)
          break
        default:
          newMediumData[index].state = STROYBOARD_STATE.DRAWING_DONE
          break
      }
      if (data?.resData?.status === TRANS_VIDEO_STATE.LINEUP) {
        lineupRes = await api.queueCheck({ taskId: transVideoTaskId })
        if (lineupRes?.data?.resData >= 0)
          newMediumData[index].lineup = lineupRes?.data?.resData + 1
      } else {
        newMediumData[index].lineup = null
      }
    } else {
      message.error('图转视频报错，请联系管理员处理')
      newMediumData.forEach((i) => {
        if (Number(i.index) === Number(index)) {
          i.state = STROYBOARD_STATE.TRANS_VIDEO_FAIL
        }
      })
      clearVideoIntervalAndSave(index)
    }
    setMediumData(newMediumData)
    mediumDataRef.current = newMediumData
  }

  const batchExtract = async () => {
    // 批量情节推理
    const currentMediumData = mediumDataRef.current
    const selectedData = currentMediumData.filter((item) =>
      selectedList.some((selectedIndex) => Number(selectedIndex) === Number(item.index)),
    )
    if (!selectedData?.length) {
      message.warning('请先勾选需要推理的分镜')
      return
    }
    if (
      selectedData.find(
        (i) =>
          [
            STROYBOARD_STATE.ILLATION_WAIT,
            STROYBOARD_STATE.ILLATION_LINEUP,
            STROYBOARD_STATE.ILLATION_ING,
          ].indexOf(i.state) > -1,
      )
    ) {
      message.warning('勾选分镜正在推理或推理排队中，请重新选择或稍后再试')
      return
    }
    if (selectedData.some((i) => !i.source)) {
      message.warning('存在勾选分镜脚本为空，请输入内容后再试')
      return
    }
    if (
      selectedData.find(
        (i) =>
          [
            STROYBOARD_STATE.DRAWING_WAIT,
            STROYBOARD_STATE.DRAWING_LINEUP,
            STROYBOARD_STATE.DRAWING_ING,
          ].indexOf(i.state) > -1,
      )
    ) {
      message.warning('勾选分镜正在绘图或绘图排队中，请重新选择或稍后再试')
      return
    }
    setExtractPercent(0.1)
    const indexGroups = []
    selectedData.forEach((item, index) => {
      item.state = STROYBOARD_STATE.ILLATION_WAIT
      if (!(index % 3)) {
        indexGroups.push([item.index])
      } else {
        indexGroups[indexGroups.length - 1].push(item.index)
      }
    })
    for (let index in indexGroups) {
      const indexGroup = indexGroups[index]
      const list = currentMediumData
        .filter((data) => indexGroup.some((i) => data.index == i))
        .map((i) => {
          i.state = STROYBOARD_STATE.ILLATION_ING
          return i
        })
      setMediumData([...currentMediumData])
      mediumDataRef.current = currentMediumData
      const result = await Promise.all(list.map((item) => getInfoExtract(item)))
    }
  }
  const reIllation = (item) => {
    // 重新推理
    const currentMediumData = [...mediumDataRef.current]
    const target = currentMediumData.find((i) => Number(i.index) === Number(item.index))
    target.state = STROYBOARD_STATE.ILLATION_ING
    setMediumData([...currentMediumData])
    mediumDataRef.current = currentMediumData
    getInfoExtract(item)
  }
  const getInfoExtract = async (item) => {
    const param = {
      previous: mediumData.map((i) => i.source).join(''),
      source: item.source,
      person_labels: tagList.filter((i) => i.type == LABEL_TYPE.PERSON).map((i) => i.names[0]),
      scence_labels: tagList.filter((i) => i.type == LABEL_TYPE.SCENCE).map((i) => i.names[0]),
    }
    const currentMediumData = [...mediumDataRef.current]
    const target = currentMediumData.find((i) => i.index == item.index)
    try {
      const abortController = new AbortController() // 创建新的 AbortController 并存储
      abortExtractRef.current = {
        ...abortExtractRef.current,
        [item.index]: abortController,
      }
      const res = await api.infoExtract(param, {
        signal: abortExtractRef.current[item.index].signal, // 绑定 signal
      })
      const { data } = res || {}
      if (target.chosenPic <= 0) {
        target.state = data?.resData?.prompt?.chinese
          ? STROYBOARD_STATE.ILLATION_DONE
          : STROYBOARD_STATE.ILLATION_FAIL
      } else {
        target.state = STROYBOARD_STATE.DRAWING_DONE
      }
      target.prompt_chinese = data?.resData?.prompt?.chinese
      target.prompt_english = data?.resData?.prompt?.english
      if (data?.resData?.labels) {
        const labelsInfo = [] // todo
        data?.resData?.labels.forEach((lableName) => {
          const labelInfo = tagList.find((i) => i.names[0] == lableName)
          labelInfo && labelsInfo.push(labelInfo)
        })
        target.label = labelsInfo.map((i) => {
          return {
            labelId: i.labelId,
            label: {
              title: i.title, // 所属项目名称
              names: i.names,
              type: i.type,
              prompt: i.prompt,
              lora: i.lara,
            },
          }
        })
      }
      const {
        index,
        source,
        prompt_chinese,
        prompt_english,
        chosenPic,
        voice,
        label = [],
        lens,
        animation,
        video_prompt,
      } = target
      api.setFileContent({
        taskId: projectId,
        textList: [
          {
            index: Number(index),
            source,
            prompt_chinese,
            prompt_english,
            chosenPic,
            voice,
            label,
            lens,
            animation,
            video_prompt,
          },
        ],
      })
    } catch (e) {
      if (axios.isCancel(e)) {
        message.success('已停止推理')
        const target = currentMediumData.find((i) => i.index == item.index)
        target.state = target.prompt_chinese
          ? target.chosenPic > 0
            ? STROYBOARD_STATE.DRAWING_DONE
            : STROYBOARD_STATE.ILLATION_DONE
          : STROYBOARD_STATE.STOP
      } else {
        const target = currentMediumData.find((i) => i.index == item.index)
        target.state = STROYBOARD_STATE.ILLATION_FAIL
      }
    } finally {
      // 处理进度展示
      const doneData = handleProcess(currentMediumData, [
        STROYBOARD_STATE.ILLATION_ING,
        STROYBOARD_STATE.ILLATION_LINEUP,
        STROYBOARD_STATE.ILLATION_WAIT,
      ])
      if (doneData.length === selectedList.length) {
        setExtractPercent(100)
        setTimeout(() => setExtractPercent(0), 300)
      } else {
        setExtractPercent(parseInt((doneData.length / selectedList.length) * 100))
      }
      setMediumData(currentMediumData)
      mediumDataRef.current = currentMediumData
      updateAccountInfo()
    }
  }
  const handleProcess = (currentMediumData, unDoneStateList) => {
    const selectedData = currentMediumData.filter((item) =>
      selectedList.some((selectedIndex) => Number(selectedIndex) === Number(item.index)),
    )
    const doneData = selectedData.filter((i) => {
      return unDoneStateList.indexOf(Number(i.state)) < 0
    })
    return doneData
  }
  // 停止
  const handleCancel = () => {
    const currentMediumData = [...mediumDataRef.current]
    if (Object.keys(abortExtractRef.current).length) {
      Object.keys(abortExtractRef.current).forEach((index) => {
        abortExtractRef.current[index].abort('用户主动取消请求') // 触发取消
      })
    }
    if (Object.keys(abortDrawRef.current).length) {
      Object.keys(abortDrawRef.current).forEach((index) => {
        abortDrawRef.current[index].abort('用户主动取消请求') // 触发取消
      })
    }
    if (Object.values(drawingVideoTimerListRef?.current)?.length > 0) {
      // 图转视频
      Object.values(drawingVideoTimerListRef?.current)?.forEach((i) => {
        clearInterval(i)
      })
      currentMediumData.forEach((target) => {
        if (
          [
            STROYBOARD_STATE.TRANS_VIDEO_WAIT,
            STROYBOARD_STATE.TRANS_VIDEO_LINEUP,
            STROYBOARD_STATE.TRANS_VIDEO_ING,
          ].indexOf(target.state) > -1
        ) {
          target.state = STROYBOARD_STATE.DRAWING_DONE
        }
      })
      setMediumData(currentMediumData)
      mediumDataRef.current = currentMediumData
    }
    if (Object.keys(drawingImageTimerListRef?.current)?.length > 0) {
      // 文生图
      Object.keys(drawingImageTimerListRef?.current)?.forEach((i) => {
        clearImageIntervalAndSave(i)
      })
      currentMediumData.forEach((target) => {
        if (
          [
            STROYBOARD_STATE.DRAWING_WAIT,
            STROYBOARD_STATE.DRAWING_LINEUP,
            STROYBOARD_STATE.DRAWING_ING,
          ].indexOf(target.state) > -1
        ) {
          let newMaterials = target.materials ? [...target.materials] : []
          if (target.chosenPic === newMaterials.length) {
            target.chosenPic = target.chosenPic - 1 || 1
          }
          if (newMaterials[newMaterials.length - 1]?.isLoading) {
            newMaterials.pop()
          }
          target.materials = newMaterials
          target.state =
            target.chosenPic > 0 ? STROYBOARD_STATE.DRAWING_DONE : STROYBOARD_STATE.ILLATION_DONE
        }
      })
      setDrawPercent(0)
      setMediumData(currentMediumData)
      mediumDataRef.current = currentMediumData
    }
  }

  const handleEdit = async (keyName, value, cIndex) => {
    // 编辑镜头， 运镜效果，视频提示词
    const newMediumData = [...mediumData]
    const targetRow = newMediumData.find((item) => item.index === cIndex)
    if (targetRow[keyName] === value) {
      return
    }
    targetRow[keyName] = value
    const {
      index,
      source,
      prompt_chinese,
      prompt_english,
      chosenPic,
      voice,
      label,
      lens,
      animation,
      video_prompt,
    } = targetRow
    const { data } = await api.setFileContent({
      taskId: projectId,
      textList: [
        {
          index,
          source,
          prompt_chinese,
          prompt_english,
          chosenPic,
          voice,
          label,
          lens,
          animation,
          video_prompt,
        },
      ],
    })
    if (data.resCode === SUCCESS_CODE) {
      setIsComposed(false)
      mediumDataRef.current = newMediumData
      message.success('已更新')
    } else {
      message.error(data.resMsg.msgText)
    }
  }

  // 绘制配图
  const batchDraw = async () => {
    if (checkCoin()) return
    const currentMediumData = [...mediumDataRef.current]
    const selectedData = currentMediumData.filter((item) =>
      selectedList.some((selectedIndex) => selectedIndex == item.index),
    )
    if (selectedData.find((i) => i.state === STROYBOARD_STATE.STOP)) {
      message.warning('部分分镜未推理完成，请推理完成后再进行绘图操作')
      return
    }
    if (
      selectedData.find(
        (i) =>
          [
            STROYBOARD_STATE.ILLATION_WAIT,
            STROYBOARD_STATE.ILLATION_LINEUP,
            STROYBOARD_STATE.ILLATION_ING,
          ].indexOf(i.state) > -1,
      )
    ) {
      message.warning('勾选分镜正在推理或推理排队中，请重新选择或稍后再试')
      return
    }
    if (
      selectedData.find(
        (i) =>
          [
            STROYBOARD_STATE.DRAWING_WAIT,
            STROYBOARD_STATE.DRAWING_LINEUP,
            STROYBOARD_STATE.DRAWING_ING,
          ].indexOf(i.state) > -1,
      )
    ) {
      message.warning('勾选分镜正在绘图或绘图排队中，请重新选择或稍后再试')
      return
    }
    setDrawPercent(0.1)
    const indexGroups = []
    selectedData.forEach((item, index) => {
      item.state = STROYBOARD_STATE.DRAWING_WAIT
      if (!(index % BATCH_NUM)) {
        indexGroups.push([item.index])
      } else {
        indexGroups[indexGroups.length - 1].push(item.index)
      }
    })
    for (let index in indexGroups) {
      const indexGroup = indexGroups[index]
      const list = currentMediumData
        .filter((data) => indexGroup.some((i) => data.index == i))
        .map((i) => {
          i.state = STROYBOARD_STATE.DRAWING_ING
          const newMaterials = i?.materials ? [...i.materials] : []
          newMaterials.push({
            mIndex: (i.materials?.length || 0) + 1,
            isLoading: true,
          })
          i.chosenPic = (i.materials?.length || 0) + 1
          i.materials = newMaterials
          return i
        })
      setMediumData(currentMediumData)
      mediumDataRef.current = currentMediumData
      await Promise.all(list.map((item) => getGenerations(item)))
    }
  }

  const redrawImage = async (record) => {
    // 重绘分镜
    if (checkCoin()) return
    const currentMediumData = [...mediumDataRef.current]
    const target = currentMediumData.find((i) => i.index === record.index)
    target.state = STROYBOARD_STATE.DRAWING_ING
    setMediumData(currentMediumData)
    mediumDataRef.current = currentMediumData
    await getGenerations(record)
  }
  const getRecordImage = async (prompt, item) => {
    // 步骤 2： 分镜绘图
    const abortController = new AbortController() // 创建新的 AbortController 并存储
    abortDrawRef.current = {
      ...abortDrawRef.current,
      [item.index]: abortController,
    }
    let imageInfo = {}
    try {
      const imgRes = await api.generateSdImageSynchronous(
        {
          taskId: projectId,
          prompt,
          width: Number(item.width),
          height: Number(item.height),
          repaintingCount: 1,
        },
        {
          signal: abortDrawRef.current[item.index].signal, // 绑定 signal
        },
      )
      imageInfo = {
        imageData: imgRes?.data?.resData?.imageData[0],
        format: 'base64',
      }
    } catch (e) {
      if (axios.isCancel(e)) {
        message.success('已停止绘图')
        return Promise.reject(e)
      }
    }
    return imageInfo
  }
  // 异步文生图, 逻辑同转视频一致
  const syncRecordImage = async (prompt, item) => {
    const currentMediumData = [...mediumDataRef.current]
    const res =
      (await api.generations({
        prompt,
        width: item.width,
        height: item.height,
        model: sdConfig.value,
      })) || {}
    switch (res?.data?.resCode) {
      case SUCCESS_CODE: // 1
        api.setFileContent({
          taskId: projectId,
          textList: [
            {
              index: item.index,
              drawTaskId: res?.data?.resData?.taskId,
            },
          ],
        })
        await setSyncDrawInterval(res?.data?.resData?.taskId, item.index)
        break
      default: // 比如0
        // 转视频异常，需要把当前分镜isVideoFailed改为true, 但不能中止所有分镜制作
        currentMediumData[item.index].state = STROYBOARD_STATE.DRAWING_FAIL
        setMediumData(currentMediumData)
        mediumDataRef.current = currentMediumData
    }
  }

  const getGenerations = async (item) => {
    let isError = false
    let msgCode = ''
    const assembleRes = await api.assemble4Generations({
      // 步骤 1： 提示词组装
      prompt: item.prompt_english,
      style: item.type, // 画风  "动漫"，"写实"等
      lens: item.lens,
      labels: item.label.map((i) => ({
        label: {
          type: i?.label?.type,
          prompt: {
            english: i?.label?.prompt?.english,
          },
        },
      })),
      common_prompt: '', // 通用提示词, 使用本地sd时传
    })
    if (assembleRes?.data?.resData?.prompt) {
      const currentMediumData = [...mediumDataRef.current]
      const target = currentMediumData.find((i) => Number(i.index) === Number(item.index))
      try {
        if (drawingModel === 'custom') {
          // 步骤 2: 本地sd绘图
          const imageInfo = await getRecordImage(assembleRes?.data?.resData?.prompt, item)
          if (!imageInfo.imageData) {
            isError = true
            msgCode = imageInfo.msgCode
          } else {
            const localImgRes = await api.saveStoryboardImage({
              // 步骤 3： 分镜图片保存本地
              taskId: projectId,
              index: item.index, // 分镜序号
              imageList: [imageInfo],
            })
            // 步骤 4： 更新分镜详情
            await updateTargetDetail(item.index, localImgRes?.data?.resData?.materials[0]?.mIndex)
          }
        } else {
          await syncRecordImage(assembleRes?.data?.resData?.prompt, item)
        }
      } catch (e) {
        if (axios.isCancel(e)) {
          target.state = target.prompt_chinese
            ? target.chosenPic > 0
              ? STROYBOARD_STATE.DRAWING_DONE
              : STROYBOARD_STATE.ILLATION_DONE
            : STROYBOARD_STATE.STOP
          setMediumData(currentMediumData)
          mediumDataRef.current = currentMediumData
        }
      }
    } else {
      isError = true
    }
    const currentMediumData = [...mediumDataRef.current]
    if (isError) {
      if (Number(msgCode) !== MSG_CODE.COST_ERROR) {
        message.error('绘制报错，请稍后重试')
      }
      const currentRecord = currentMediumData[item.index]
      currentRecord.state = STROYBOARD_STATE.DRAWING_FAIL
      setMediumData(currentMediumData)
      mediumDataRef.current = currentMediumData
    } else {
      updateAccountInfo()
    }
    if (drawingModel !== 'custom') return
    const doneData = handleProcess(currentMediumData, [
      STROYBOARD_STATE.DRAWING_WAIT,
      STROYBOARD_STATE.DRAWING_LINEUP,
      STROYBOARD_STATE.DRAWING_ING,
    ])
    if (doneData.length === selectedList.length) {
      setDrawPercent(100)
      setTimeout(() => setDrawPercent(0), 300)
    } else {
      setDrawPercent(parseInt((doneData.length / selectedList.length) * 100))
    }
  }
  const updateTargetDetail = async (newIndex, chosenPic) => {
    // 更新指定分镜详情
    const currentMediumData = [...mediumDataRef.current]
    await api.setFileContent({
      taskId: projectId,
      textList: [{ index: newIndex, chosenPic }],
    })
    const res = await api.getProjectDetail({
      taskId: projectId,
      indexes: [newIndex],
    })
    const currentRecord = currentMediumData[newIndex]
    if (currentRecord && res?.data?.resCode === SUCCESS_CODE) {
      const item = res.data.resData[newIndex]
      currentRecord.state = item.prompt_chinese
        ? item.chosenPic > 0
          ? STROYBOARD_STATE.DRAWING_DONE
          : STROYBOARD_STATE.ILLATION_DONE
        : STROYBOARD_STATE.STOP
      const newMaterials = [...item.materials].concat(
        currentRecord?.materials?.filter((i) => i.isLoading) || [],
      )
      currentRecord.materials = newMaterials
      currentRecord.chosenPic = item.chosenPic
      setMediumData(currentMediumData)
      mediumDataRef.current = currentMediumData
    }
  }

  const initProjectDetail = async (isInit) => {
    const response = await api.getProjectDetail({
      taskId: projectId,
    })
    if (response?.data?.resCode === ERROR_CODE) {
      const errorMsg = response && response.statusText ? response.statusText : ''
      message.error(`获取详情数据失败！${errorMsg}`)
      return
    }
    const detailList = []
    const hasImgIndexes = []
    const type = response.data.type
    const width = response.data.width
    const height = response.data.height
    const transVideoList = []
    const drawList = []
    for (let index in response.data.resData) {
      const item = response.data.resData[index]
      if (item.chosenPic > 0) hasImgIndexes.push(index)
      if (item.transVideoTaskId) {
        transVideoList.push({
          transVideoTaskId: item.transVideoTaskId,
          index: Number(index),
        })
      }
      if (item.drawTaskId) {
        drawList.push({
          drawTaskId: item.drawTaskId,
          index: Number(index),
        })
      }
      const newRecord = {
        ...item,
        state: item.prompt_chinese
          ? item.chosenPic > 0
            ? STROYBOARD_STATE.DRAWING_DONE
            : STROYBOARD_STATE.ILLATION_DONE
          : STROYBOARD_STATE.STOP,
        index: Number(index),
        type,
        width,
        height,
      }
      detailList.push(newRecord)
    }
    setRepaintingCount(response.data?.repaintingCount) // 重绘数量
    setMediumData(detailList)
    setSelectedList(detailList.map((i) => Number(i.index)))
    mediumDataRef.current = detailList
    transVideoList.forEach((i) => {
      setTranVideoInterval(i.transVideoTaskId, i.index)
    })
    drawList.forEach((i) => {
      setSyncDrawInterval(i.drawTaskId, i.index)
    })
    setIsInited(true)
  }

  const refreshRoleProperties = async () => {
    // 获取全部标签
    if (!projectName) return
    const { data } = await api.getLabel({ taskId: projectId })
    if (data.resCode !== SUCCESS_CODE) {
      message.error('获取标签异常，请联系管理员查看详情')
      return
    }
    const indexs = Object.keys(data.resData)
    const roleSettingList = indexs.map((i) => {
      const item = data?.resData[i]
      const targetImg = item?.label?.materials.find(
        (m) => m.imageName === item?.label?.chosenImageName,
      )
      return {
        ...item?.label,
        labelId: item?.labelId,
        promptText: item?.label?.prompt.english,
        labelText: item?.label?.prompt.chinese,
        img: targetImg?.imageUrl,
      }
    })
    setTagList(roleSettingList)
    if (roleSettingList?.length) {
      const newId =
        Number(
          Math.max.apply(
            null,
            roleSettingList.map((i) => i.labelId),
          ) || 0,
        ) + 1
      newLabelIdRef.current = Number(newId)
    }
  }

  const refreshTargetRowPrevImage = (index, currentPrevImg) => {
    const newPrevImageMappings = { ...prevImageMappingsRef.current }
    newPrevImageMappings[index] = currentPrevImg
    setPrevImageMappings(newPrevImageMappings)
    prevImageMappingsRef.current = newPrevImageMappings
  }

  useEffect(() => {
    setImgCostSum(enquiryImgCost * (selectedList?.length || 0))
  }, [selectedList, enquiryImgCost])

  const refreshLeftState = () => {
    setIsComplete(
      mediumData.every((i) => {
        return i.chosenPic > 0
      }),
    )
  }

  useEffect(() => {
    refreshLeftState()
    setDrawedNum(mediumData?.filter((i) => i.chosenPic > 0).length)
  }, [mediumData])

  useEffect(() => {
    return () => {
      clearFunc()
    }
  }, [])

  useEffect(() => {
    // 初始化
    clearFunc()
    if (drawingSdState) {
      initProjectDetail(true)
    } else {
      initProjectDetail(false)
    }
  }, [drawingSdState])

  useEffect(() => {
    refreshRoleProperties()
  }, [projectName])

  useEffect(() => {
    if (manualRefreshMedium === false) {
      return
    }
    initProjectDetail()
    setManualRefreshMedium(false)
  }, [manualRefreshMedium])

  const mergeShootingHandler = async (placement, record) => {}

  const clearFunc = async () => {
    if (batchTasksTimer.current) clearInterval(batchTasksTimer.current)
    if (drawingTimer.current) clearInterval(drawingTimer.current)
    if (drawingVideoTimerListRef?.current) {
      Object.values(drawingVideoTimerListRef?.current).forEach((i) => {
        clearInterval(i)
      })
    }
    if (drawingImageTimerListRef?.current) {
      Object.values(drawingImageTimerListRef?.current).forEach((i) => {
        clearInterval(i)
      })
    }
    if (intelligentIimer.current) clearInterval(intelligentIimer.current)
    if (voicePlay.current) voicePlay.current.pause()
  }
  const changeSelectMode = async (newListLength) => {
    if (!newListLength) {
      setSelectMode(SELECT_MODE.UNSELECT)
    } else if (newListLength === mediumData.length) {
      setSelectMode(SELECT_MODE.ALL)
    } else {
      setSelectMode(SELECT_MODE.CUSTOM)
    }
  }
  const handleSelectModeChange = async (e) => {
    setSelectMode(e)
    switch (e) {
      case SELECT_MODE.ALL:
        setSelectedList(mediumData.map((i) => i.index))
        break
      case SELECT_MODE.SELECT_UNILLATION:
        setSelectedList(mediumData.filter((i) => !i.prompt_chinese).map((i) => Number(i.index)))
        break
      case SELECT_MODE.SELECT_UNDRAWING:
        setSelectedList(mediumData.filter((i) => i.chosenPic < 1).map((i) => Number(i.index)))
        break
      case SELECT_MODE.UNSELECT:
        setSelectedList([])
        break
      default:
        break
    }
  }
  return (
    <Layout className="paintInfo">
      <Sider width="266" className="paintSider">
        <div className="paintSiderTop">
          <div className="storyboardBar">
            <Button
              className="detailLargeBtn"
              type="primary"
              onClick={batchExtract}
              style={
                extractPercent === 0 || extractPercent === 100 ? {} : { background: 'transparent' }
              }
              disabled={extractPercent !== 0 && extractPercent !== 100}
            >
              <Progress
                className="storyProcess"
                percent={parseInt(extractPercent)}
                type="line"
                percentPosition={{ align: 'center', type: 'outer' }}
                size={[230, 25]}
                trailColor="#323234"
                style={
                  extractPercent === 0 || extractPercent === 100 ? { visibility: 'hidden' } : {}
                }
              />
              <div style={{ zIndex: 1 }}>
                情节推理
                {drawingModel === 'cloud' && drawingSdState && (
                  <IconFont
                    type="icon-jinbi1"
                    style={{ color: '#f9dd4b', marginTop: 2, marginLeft: 2 }}
                  />
                )}
              </div>
            </Button>
            <ArrowDownOutlined />
            <Button
              className="detailLargeBtn"
              type="primary"
              onClick={batchDraw}
              style={drawPercent === 0 || drawPercent === 1000 ? {} : { background: 'transparent' }}
              disabled={drawPercent !== 0 && drawPercent !== 100}
            >
              <Progress
                className="storyProcess"
                percent={parseInt(drawPercent)}
                type="line"
                percentPosition={{ align: 'center', type: 'outer' }}
                size={[230, 25]}
                trailColor="#323234"
                style={drawPercent === 0 || drawPercent === 100 ? { visibility: 'hidden' } : {}}
              />
              <div style={{ zIndex: 1 }}>
                绘制配图
                {drawingModel === 'cloud' && drawingSdState && (
                  <IconFont
                    type="icon-jinbi1"
                    style={{ color: '#f9dd4b', marginTop: 2, marginLeft: 2 }}
                  />
                )}
                {drawingModel === 'cloud' && imgCostSum}
              </div>
            </Button>
          </div>
        </div>
        <div className="paintOptBar">
          <div>
            <Select
              value={selectMode}
              style={{ width: 100 }}
              onChange={handleSelectModeChange}
              options={SELECT_MODE_LIST}
            />
            <Tooltip title="删除">
              <Button
                size="small"
                icon={<DeleteOutlined />}
                className="deleteShooting"
                onClick={() => {
                  if (!selectedList?.length) {
                    return message.warning('请选择你要删除的分镜')
                  }
                  setDeleteShootingModalState(true)
                }}
              ></Button>
            </Tooltip>
            <Tooltip title="停止">
              <Button
                size="small"
                icon={<CloseOutlined />}
                className="addShooting"
                onClick={handleCancel}
              ></Button>
            </Tooltip>
          </div>
          {drawedNum < mediumData?.length ? (
            <div>绘图{`${drawedNum}/${mediumData?.length}`}</div>
          ) : (
            <></>
          )}
        </div>
        <div className="storyboardList">
          {mediumData.map((detail) => {
            return (
              <Storyboard
                key={detail.index}
                changeSelectMode={changeSelectMode}
                changeDetail={changeDetail}
                currentIndex={currentIndex}
                selectedList={selectedList}
                setSelectedList={setSelectedList}
                setDeleteShootingModalState={() => {
                  if (mediumData.length === 1) {
                    message.warning('当前作品只存在一个分镜，不可删除')
                    return
                  }
                  setDeleteShootingModalState(true)
                }}
                setTargetDeleteIndex={setTargetDeleteIndex}
                handleAddItem={handleAddItem}
                projectId={projectId}
                detail={detail}
                shotText={detail.source}
                mergeShootingHandler={async (placement) => mergeShootingHandler(placement, detail)}
              />
            )
          })}
        </div>
      </Sider>
      <CurrentDetail
        detailRef={detailRef}
        enquiryImgCost={enquiryImgCost}
        enquiryVideoCost={enquiryVideoCost}
        drawingModel={drawingModel}
        drawingSdState={drawingSdState}
        isSavePromptLoading={isSavePromptLoading}
        repaintingCount={repaintingCount}
        setRepaintingCount={setRepaintingCount}
        setIsComposed={setIsComposed}
        refreshTargetRowPrevImage={refreshTargetRowPrevImage}
        tagList={tagList}
        setTagList={setTagList}
        prevImageMappings={prevImageMappings}
        handleEdit={handleEdit}
        playAudioIndex={playAudioIndex}
        playAudio={async (setPlayAudioLoading, isAudioPlaying, record) => {
          handlePlayAudio(setPlayAudioLoading, isAudioPlaying, record)
        }}
        projectId={projectId}
        setMediumData={setMediumData}
        detail={mediumData[currentIndex]}
        redrawImage={redrawImage}
        redrawVideo={redrawVideo}
        reIllation={reIllation}
        mediumDataRef={mediumDataRef}
        handlePrompt={handlePrompt}
        handleEditText={handleEditText}
        handleEditTag={handleEditTag}
        projectName={projectName}
        paintingStyleValue={paintingStyleValue}
        pictureSize={pictureSize}
        sdConfig={sdConfig}
        videoTemplateOptionsCloud={videoTemplateOptionsCloud}
        changeVideoModelForCloud={changeVideoModelForCloud}
        newLabelIdRef={newLabelIdRef}
        refreshRoleProperties={refreshRoleProperties}
        labelAllListMap={labelAllListMap}
        updateAllLabelList={updateAllLabelList}
        updateAccountInfo={updateAccountInfo}
        clearImageIntervalAndSave={clearImageIntervalAndSave}
        setDrawPercent={setDrawPercent}
        clearVideoIntervalAndSave={clearVideoIntervalAndSave}
      />
      <Modal
        title="提示"
        open={deleteShootingModalState}
        onOk={deleteShooting}
        onCancel={() => {
          setTargetDeleteIndex(null)
          setDeleteShootingModalState(false)
        }}
        okText="确认"
        cancelText="取消"
        zIndex={999}
        centered
      >
        {targetDeleteIndex == null ? (
          <p>您是否确定删除所选分镜，确定后将无法再恢复</p>
        ) : (
          <p>您是否确定删除该分镜，确定后将无法再恢复</p>
        )}
      </Modal>
      {modalContextHolder}
    </Layout>
  )
}

export default PaintInfo
