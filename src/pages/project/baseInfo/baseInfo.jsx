import React, { useState, useRef, useEffect, useCallback } from 'react'
import { message, Button, Select, Input, Radio, Skeleton, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import './baseInfo.sass'
import { useOutletContext, useParams } from 'react-router-dom'
import SegmentContent from './segmentContent'
import LabelContent from './labelContent'
import { pictureSizeList, SUCCESS_CODE, LABEL_TYPE, SEGMENT } from '../../../assets/constant'

import api from '../../../services/project'

const skeletonList = [1, 2, 3, 4, 5, 6]

const BaseInfo = ({ drawingSdState }) => {
  const {
    projectName,
    setProjectName,
    refreshProjectDetail,
    childRef,
    changeSegment,
    isUploaded,
    setIsUploaded,
    drawingModel,
    projectDetail,
    sdConfig,
    checkCoin,
    labelAllListMap,
    updateAllLabelList,
    updateAccountInfo,
    enquiryImgCost,
  } = useOutletContext()

  // 文本相关
  const [segmentationDetail, setSegmentationDetail] = useState(null) // 分镜行文本
  const [totalWorld, setTotalWorld] = useState(0) // 当前字数
  const [isDisabled, setIsDisabled] = useState(false) // 文本输入区是否禁用
  const [fileInfo, setFileInfo] = useState()

  // 标签相关
  const [isShowReDrawRoleBtn, setIsShowReDrawRoleBtn] = useState(false) // 是否显示重新生成标签按钮组
  const [isShowReDrawSceneBtn, setIsShowReDrawSceneBtn] = useState(false) // 是否显示重新生成标签按钮组
  const [extractRoleLoading, setExtractRoleLoading] = useState(false) // 是否正在提取角色标签
  const [extractScenceLoading, setExtractScenceLoading] = useState(false) // 是否正在提取场景标签

  const [isHasSegmentation, setIsHasSegmentation] = useState(false)
  const [paintingStyleValue, setPaintingStyleValue] = useState() // 视觉风格
  const [bakProjectName, setBakProjectName] = useState(null)
  const [pictureSize, setPictureSize] = useState('768*1344') // 画面尺寸
  const [selectedVoice, setSelectedVoice] = useState() // 旁白配音
  const [audioVoiceList, setAudioVoiceList] = useState([]) // 音频列表
  const [paintingStyle, setPaintingStyle] = useState()

  const inputRef = useRef()
  const segmentRef = useRef(null)
  const labelRef = useRef(null)

  const { id: taskId } = useParams()

  const changePaintingStyle = async (e) => {
    console.log('e: ', e.target.value)
    // newType
    saveBaseInfo({ newType: e.target.value }, '视觉风格')
    setPaintingStyleValue(e.target.value)
    if (await checkHasLabel()) {
      setIsShowReDrawRoleBtn(true)
      setIsShowReDrawSceneBtn(true)
    }
  }
  const checkHasLabel = () => {
    return labelRef?.current?.checkHasLabel()
  }

  const handleFileParse = async (info) => {
    if (await checkHasLabel()) {
      setIsShowReDrawRoleBtn(true)
      setIsShowReDrawSceneBtn(true)
    }
    setFileInfo({
      isEmpty: !info.file.size,
      name: info.file.name,
      size: `${parseInt(info.file.size / 1000)}kb`,
    })
    const formdata = new FormData()
    formdata.append('file', info.fileList[info.fileList.length - 1].originFileObj)
    formdata.append('taskId', taskId)
    const fileParseRes = await api.fileParse(formdata)
    if (fileParseRes?.data?.resCode === SUCCESS_CODE) {
      message.success(`${info.file.name} 上传成功`)
      setIsUploaded(true)

      const res = await api.textSeparator({
        source: fileParseRes?.data?.resData?.fileContent,
      })
      const input = res?.data?.resData?.content
      const regex = /[\n]+/
      let list = input
        .split(regex)
        .filter((str) => str.trim().length > 0)
        .map((i) => i.replace('\n', ''))
      let limitLenList = []
      list.forEach((i) => {
        if (i.length > SEGMENT.MAX_ROW_WORD_LEN) {
          limitLenList.push(i.slice(0, SEGMENT.MAX_ROW_WORD_LEN))
          limitLenList.push(i.slice(SEGMENT.MAX_ROW_WORD_LEN))
        } else {
          limitLenList.push(i)
        }
      })

      if (limitLenList.length > SEGMENT.MAX_ROW_NUM) {
        message.warning('脚本分镜超出，已自动保存前100个分镜')
        limitLenList = limitLenList.slice(0, SEGMENT.MAX_ROW_NUM)
      }
      const maxWordList = []
      for (let i in limitLenList) {
        const l = limitLenList[i]
        const currentWordsLen = maxWordList.reduce((prev, curr) => prev + Number(curr?.length), 0)
        if (currentWordsLen + Number(l?.length) <= SEGMENT.MAX_WORD) {
          maxWordList.push(l)
        } else {
          if (SEGMENT.MAX_WORD > currentWordsLen) {
            maxWordList.push(l.slice(0, SEGMENT.MAX_WORD - currentWordsLen))
          }
          message.warning('脚本内容过长，已自动截取前3000字')
          break
        }
      }
      const textList = maxWordList.map((source, index) => ({
        index,
        source,
      }))
      setSegmentationDetail(textList)
      setTotalWorld(
        textList.reduce((prev, curr) => {
          return prev + (curr?.source?.length || 0)
        }, 0),
      )
      setTimeout(() => {
        segmentRef?.current?.checkCanGoNext()
      }, 300)
    } else {
      if (fileParseRes?.data?.resMsg?.msgCode === 4) {
        message.error('文件内容为空，请重新上传')
      } else {
        message.error('上传失败，请联系管理员查看原因')
      }
    }
  }

  const handleNext = async () => {
    if (await labelRef?.current?.goNext()) {
      changeSegment('paint')
    }
  }

  const checkCanGoNext = async (nextTag) => {
    // nextTag 想要跳转到的tab页的值
    if (!paintingStyleValue) {
      return message.error('请选择视觉风格')
    }
    if (!projectName) {
      return message.error('请输入作品标题')
    }
    if (!pictureSize) {
      return message.error('请选择画面尺寸')
    }
    const textList = await segmentRef?.current?.checkCanGoNext()
    if (textList?.every((i) => !i?.source) && !isUploaded) {
      return message.error('请上传文件或输入文本')
    }
    if (fileInfo?.isEmpty) {
      return message.error('请上传非空文件')
    }
  }
  const checkCanGenLabel = async () => {
    const isShowLoading = false
    const textList = await segmentRef?.current?.checkCanGoNext(isShowLoading)
    if (textList?.length) setSegmentationDetail(textList)
    return textList
  }

  const init = async () => {
    if (!taskId) return
    const result = await api.getStyleList()
    if (result?.data?.resCode !== SUCCESS_CODE) {
      message.error('系统异常，请退出重试')
      return
    }
    setPaintingStyle(
      result?.data?.resData?.map((i) => ({
        value: i.name,
        label: i.name,
        img: i.url,
      })),
    )
    setPaintingStyleValue(result?.data?.resData[0].name)

    const { data } = await api.getTimbres({})
    const voiceList = data?.resData.map((i) => ({
      label: `${i.name}-${i.gender}-${i.tag}`,
      value: i.value,
    }))
    setAudioVoiceList(voiceList)
    refreshProjectDetail().then((data) => {
      const { fileName, fileSize, height, width, type, resData } = data || {}
      if (resData) {
        const newSegmentation = []
        for (let index in resData) {
          newSegmentation.push({
            ...resData[index],
            index,
          })
        }
        setSegmentationDetail(newSegmentation)
        setTotalWorld(
          newSegmentation.reduce((prev, curr) => {
            return prev + (curr?.source?.length || 0)
          }, 0),
        )
        setIsUploaded(true)
      } else {
        setSegmentationDetail([
          {
            index: 0,
            source: '',
            placeholder: '请输入或粘贴脚本内容，每行控制在60字以内',
          },
          { index: 1, source: '', placeholder: '目前最多支持10个角色哦～' },
          { index: 2, source: '' },
          { index: 3, source: '' },
          { index: 4, source: '' },
          { index: 5, source: '' },
        ])
        setIsUploaded(false)
      }
      if (type) {
        setPaintingStyleValue(type)
      }
      if (width || height) {
        setPictureSize(`${width}*${height}`)
      }
      setFileInfo({
        name: fileName,
        size: `${parseInt(fileSize / 1000)}kb`,
      })
      if (resData && resData[0]?.voice?.role) {
        const target = voiceList.find((i) => i.value === resData[0]?.voice?.role)
        setSelectedVoice(target)
      } else {
        setSelectedVoice({
          label: voiceList[0].label,
          value: voiceList[0].value,
        })
      }
    })
  }

  const saveBaseInfo = async (newObj, nameString) => {
    // 更改作品标题、画风、尺寸
    const { data } = await api.editProjectBasicInformation({
      taskId,
      ...newObj,
    })
    if (data && data.resCode === SUCCESS_CODE) {
      message.success(`${nameString}修改成功`)
    }
  }
  const changePictureSize = (item) => {
    const [width, height] = item.split('*')
    setPictureSize(item)
    saveBaseInfo({ newSize: { width: Number(width), height: Number(height) } }, '画面尺寸')
  }
  const changeVoice = async (item) => {
    const target = audioVoiceList.find((i) => i.value === item)
    setSelectedVoice({
      label: target.label,
      value: item.value,
    })
    const newSegmentationDetail = segmentationDetail.map((i) => ({
      ...i,
      index: i.index,
      audioUrl: '', // 清空已有音频
      voice: {
        role: item,
      },
    }))
    const result = await api.setFileContent({
      taskId,
      textList: newSegmentationDetail,
    })
    setSegmentationDetail(newSegmentationDetail)

    if (result?.data?.resCode === SUCCESS_CODE) {
      message.success('更改配音成功，将应用于所有分镜')
    }
  }
  const refreshExtractLabel = async (labelType) => {
    if (labelType === LABEL_TYPE.PERSON) {
      setExtractRoleLoading(true)
      await labelRef?.current?.refreshExtractLabel(labelType)
      setExtractRoleLoading(false)
      setIsShowReDrawRoleBtn(false)
    }
    if (labelType === LABEL_TYPE.SCENCE) {
      setExtractScenceLoading(true)
      await labelRef?.current?.refreshExtractLabel(labelType)
      setExtractScenceLoading(false)
      setIsShowReDrawSceneBtn(false)
    }
  }

  // 将子组件实例绑定到父组件传递的 ref 上
  React.useImperativeHandle(childRef, () => ({
    handleNext,
    checkCanGoNext,
  }))

  useEffect(() => {
    setIsHasSegmentation(segmentationDetail?.some((i) => !!i.source))
    setIsDisabled(segmentationDetail?.some((i) => i.chosenPic > 0))
  }, [segmentationDetail])

  useEffect(() => {
    init()
  }, [])

  return (
    <div className="baseInfoWrap">
      <div className="detailBaseInfo">
        <div className="flex1 detailLeft">
          <div>
            <span className="detailRowTitle">故事脚本</span>
            <Upload
              name="file"
              accept={['.txt', '.pdf', '.docx']}
              itemRender={() => <></>}
              beforeUpload={() => false}
              onChange={async (info) => {
                handleFileParse(info)
              }}
            >
              <Button
                icon={<UploadOutlined />}
                style={{ backgroundColor: 'rgba(36,38,46,1)' }}
                disabled={isDisabled}
              >
                {isUploaded ? '重新' : ''}上传脚本
              </Button>
            </Upload>
            {fileInfo && (
              <div className="segmentContentWrap">
                <SegmentContent
                  taskId={taskId}
                  segmentationDetail={segmentationDetail}
                  segmentRef={segmentRef}
                  setIsUploaded={setIsUploaded}
                  setSegmentationDetail={setSegmentationDetail}
                  setIsShowReDrawRoleBtn={setIsShowReDrawRoleBtn}
                  checkHasLabel={checkHasLabel}
                  setIsShowReDrawSceneBtn={setIsShowReDrawSceneBtn}
                  isDisabled={isDisabled}
                  totalWorld={totalWorld}
                  setTotalWorld={setTotalWorld}
                />
                {isShowReDrawRoleBtn || isShowReDrawSceneBtn ? (
                  <div className="flex-center">
                    {isShowReDrawRoleBtn && (
                      <Button
                        style={{ marginRight: 4 }}
                        onClick={() => refreshExtractLabel(LABEL_TYPE.PERSON)}
                        disabled={extractRoleLoading}
                      >
                        重新生成角色
                      </Button>
                    )}
                    {isShowReDrawSceneBtn && (
                      <Button
                        style={{ marginLeft: 4 }}
                        onClick={() => refreshExtractLabel(LABEL_TYPE.SCENCE)}
                        disabled={extractScenceLoading}
                      >
                        重新生成场景
                      </Button>
                    )}
                  </div>
                ) : (
                  ''
                )}
                <div className="totalWorld">{`${totalWorld}/${SEGMENT.MAX_WORD}字`}</div>
              </div>
            )}
          </div>
          <div>
            <div className="detailRowTitle">视觉风格</div>
            <div>
              <Radio.Group onChange={changePaintingStyle} value={paintingStyleValue}>
                {paintingStyle
                  ? paintingStyle.map((item) => (
                      <Radio value={item.value} className="paintingStyleItem" key={item.value}>
                        <div className="paintingStyleLabel">{item.label}</div>
                        <img src={item.img} />
                      </Radio>
                    ))
                  : skeletonList.map((i) => (
                      <Skeleton.Image
                        key={i}
                        active={true}
                        className="paintingStyleItem"
                        style={{
                          width: 120,
                          height: 67,
                          marginRight: 0,
                          borderRadius: 8,
                        }}
                      />
                    ))}
              </Radio.Group>
            </div>
          </div>
          <div>
            <span className="detailRowTitle">作品标题</span>
            <Input
              ref={inputRef}
              value={projectName}
              className="projectName"
              spellCheck={false}
              size="small"
              onChange={(e) => {
                var reg = /[*:<>?/"|\\]/
                if (reg.test(e.target.value)) message.warning('请输入中文')
                setProjectName(e.target.value)
              }}
              placeholder="请输入作品名称"
              onClick={() => {
                if (projectName?.includes('新建项目')) {
                  setBakProjectName(projectName)
                  setProjectName('')
                }
              }}
              onBlur={async () => {
                if (!projectName) {
                  setProjectName(bakProjectName)
                }
                if (!taskId) return
                if (projectName !== bakProjectName && projectName) {
                  saveBaseInfo({ newName: projectName }, '名称')
                }
              }}
            />
          </div>
          <div style={{ paddingTop: 20 }}>
            <span className="detailRowTitle">画面尺寸</span>
            <Select
              value={pictureSize}
              size="large"
              style={{ width: 266 }}
              onChange={changePictureSize}
              placeholder="请选择画面尺寸"
              options={pictureSizeList}
              labelRender={({ label }) => <div style={{ textAlign: 'left' }}>{label}</div>}
            />
          </div>
          <div style={{ paddingTop: 20 }}>
            <span className="detailRowTitle">旁白配音</span>
            <Select
              value={selectedVoice}
              size="large"
              style={{ width: 266 }}
              onChange={changeVoice}
              placeholder="请选择旁白配音"
              options={audioVoiceList}
              labelRender={({ label }) => <div style={{ textAlign: 'left' }}>{label}</div>}
            />
          </div>
        </div>
        <LabelContent
          taskId={taskId}
          projectName={projectName}
          drawingModel={drawingModel}
          isHasSegmentation={isHasSegmentation}
          paintingStyleValue={paintingStyleValue}
          projectDetail={projectDetail}
          sdConfig={sdConfig}
          pictureSize={pictureSize}
          segmentationDetail={segmentationDetail}
          labelRef={labelRef}
          checkCanGenLabel={checkCanGenLabel}
          checkCoin={checkCoin}
          labelAllListMap={labelAllListMap}
          updateAllLabelList={updateAllLabelList}
          updateAccountInfo={updateAccountInfo}
          enquiryImgCost={enquiryImgCost}
          drawingSdState={drawingSdState}
        />
      </div>
    </div>
  )
}

export default BaseInfo
