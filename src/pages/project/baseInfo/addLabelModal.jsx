import React, { useState, useEffect } from 'react'
import { message, Button, Input, Segmented, Modal, ConfigProvider } from 'antd'
import './baseInfo.sass'
import { LoadingOutlined } from '@ant-design/icons'
import { IconFont } from '../../../common/iconfont'
import {
  formatLocalAssets,
  saveLabel,
  getLabelImage,
  urlToBlobBase64,
  dataURLtoFile,
} from '../../../common/util'
import LabelLibCard from '../labelInfo/labelLibCard'

import {
  LABEL_TYPE_EDIT_TAB,
  LABEL_TYPE_TAB,
  LABEL_TYPE,
  SUCCESS_CODE,
  LABEL_TYPE_LABEL,
  MSG_CODE,
} from '../../../assets/constant'

import api from '../../../services/project'
const { TextArea } = Input

const themeConfig = {
  components: {
    Segmented: {
      itemColor: 'white',
      itemActiveBg: 'rgba(255,255,255,0.9)',
      itemHoverBg: 'rgba(255,255,255,0.9)',
      itemSelectedBg: 'rgba(255,255,255,0.9)',
      itemHoverColor: 'black',
      itemSelectedColor: 'black',
    },
  },
}

const AddLabelModal = ({
  drawingModel,
  createModel,
  setCreateModel,
  newLabelIdRef,
  labelId,
  getLabelInfo,
  labelType,
  defaultLabelInfo,
  projectName,
  taskId,
  paintingStyleValue,
  pictureSize,
  sdConfig,
  labelAllListMap,
  updateAllLabelList,
  updateAccountInfo,
  enquiryImgCost,
  userDefined,
}) => {
  const [addLabelName, setAddLabelName] = useState('') // 新建标签名
  const [labelDescribeCN, setLabelDescribeCN] = useState('') // 描述文字-中文
  const [labelDescribeEN, setLabelDescribeEN] = useState('') // 描述文字-英文
  const [addLabelImgSrc, setAddLabelImgSrc] = useState('') // 新建标图片
  const [currentTab, setCurrentTab] = useState('add') // 'add': 新建角色/新建场景, 'select': 角色库选择/场景库选择
  const [isTextAreaFocus, setIsTextAreaFocus] = useState(false)
  const [isGenImgLoading, setIsGenImgLoading] = useState(false) // 生成效果图是否正在加载中
  const [isAddLabelLoading, setIsAddLabelLoading] = useState(false) // 生成效果图是否正在加载中
  const [generateRecords, setGenerateRecords] = useState([]) // 生成记录列表 name img chinese english
  const [targetRecordsIndex, setTargetRecordsIndex] = useState(0) // 当前选中的生成记录index
  const [labelAllList, setLabelAllList] = useState([]) // 标签库列表
  const [isSyncLoading, setIsSyncLoading] = useState(false)
  const [selectIndex, setSelectIndex] = useState() // 标签库当前选中项的index
  const [id, setId] = useState() // 角色库内标签唯一标识，用于确定同步标签时是更新还是新增
  const [modal, contextHolder] = Modal.useModal()

  const clearAddLabelInfo = () => {
    setCreateModel(false)
    setAddLabelName('')
    setLabelDescribeCN('')
    setAddLabelImgSrc('')
    setLabelDescribeEN('')
    setCurrentTab('add')
    setIsTextAreaFocus(false)
    setIsGenImgLoading(false)
    setIsAddLabelLoading(false)
    setGenerateRecords([])
  }
  const changeRecordItem = (i) => {
    setTargetRecordsIndex(i)
    const { name, chinese, english, img } = generateRecords[i]
    setAddLabelName(name)
    setLabelDescribeCN(chinese)
    setLabelDescribeEN(english)
    setAddLabelImgSrc(img)
  }
  const getLabelDescribeEN = async () => {
    if (labelDescribeEN) {
      return labelDescribeEN
    }
    const transRes = await api.translation({
      text: labelDescribeCN,
      sourceLang: 'zh',
      targetLang: 'en',
    })
    setLabelDescribeEN(transRes?.data?.resData?.TargetText)
    return transRes?.data?.resData?.TargetText || ''
  }
  const handleEdit = async () => {
    // 编辑
    if (checkLabelInfoBeforeSave()) return
    setIsAddLabelLoading(true)
    let imageData = addLabelImgSrc
    if (!addLabelImgSrc) {
      imageData = await generatLabelImg()
    }
    const labelInfo = {
      names: [addLabelName],
      prompt: {
        chinese: labelDescribeCN,
        english: await getLabelDescribeEN(),
      },
    }
    await saveLabel(labelId, labelInfo, labelType, imageData, projectName, taskId, userDefined)
    setIsAddLabelLoading(false)
    getLabelInfo(labelType) // 更新页面标签数据
    setCreateModel(false)
  }
  const handleSave = async () => {
    if (labelId) {
      handleEdit()
    } else {
      handleCreate()
    }
  }
  const checkLabelInfoBeforeSave = () => {
    if (!addLabelName) {
      message.warning('请先输入标签名称')
      return true
    }
    if (!labelDescribeCN) {
      message.warning('请先输入标签描述词')
      return true
    }
  }
  const handleCreate = async () => {
    // 新建标签
    if (checkLabelInfoBeforeSave()) return
    setIsAddLabelLoading(true)
    let imageData = addLabelImgSrc
    if (!addLabelImgSrc) {
      imageData = await generatLabelImg()
    }
    const id = newLabelIdRef.current
    newLabelIdRef.current = Number(newLabelIdRef.current) + 1
    const labelInfo = {
      names: [addLabelName],
      prompt: {
        chinese: labelDescribeCN,
        english: await getLabelDescribeEN(),
      },
    }
    await saveLabel(id, labelInfo, labelType, imageData, projectName, taskId, true)
    setIsAddLabelLoading(false)
    getLabelInfo(labelType) // 更新页面标签数据
    clearAddLabelInfo()
  }

  const generatLabelImg = async () => {
    // 新建标签弹窗，生成效果图
    const originGenerateRecords = [...generateRecords]
    if (!labelDescribeCN) {
      message.warning(`请输入${LABEL_TYPE_LABEL[labelType]}描述`)
      return
    }
    setIsGenImgLoading(true)
    setGenerateRecords([...originGenerateRecords, { loading: true }])
    const english = await getLabelDescribeEN() // 步骤1: 中译英
    const projectInfo = { style: paintingStyleValue, pictureSize, taskId }
    const configInfo = { model: sdConfig.value, drawingModel }
    const imageInfo = await getLabelImage(english, labelType, projectInfo, configInfo) // 步骤2: 获取图片（提示词组装、标签绘图）
    if (!imageInfo?.imageData && imageInfo?.msgCode.toString() !== MSG_CODE.COST_ERROR) {
      message.error('绘制失败，请重新尝试')
    }
    setAddLabelImgSrc(imageInfo.imageData[0])
    setTargetRecordsIndex(Number(generateRecords?.length))
    setGenerateRecords([
      ...originGenerateRecords,
      {
        name: addLabelName,
        img: imageInfo.imageData,
        chinese: labelDescribeCN,
        english,
      },
    ])
    updateAccountInfo()
    setIsGenImgLoading(false)
    return imageInfo?.imageData[0]
  }

  const syncToCloud = async () => {
    // 同步标签库
    if (!addLabelName) {
      return message.warning('请输入名称')
    }
    if (!labelDescribeCN) {
      return message.warning('请输入描述词')
    }
    if (!addLabelImgSrc) {
      return message.warning('请先生成效果图')
    }
    setIsSyncLoading(true)
    const fileInfo = await urlToBlobBase64(formatLocalAssets(addLabelImgSrc))
    const formdata = new FormData()
    formdata.append('file', dataURLtoFile(fileInfo?.base64))
    const fileUploadRes = await api.fileUpload(formdata) // 把本地图片上传到远程
    if (!fileUploadRes?.data?.resData) {
      setIsSyncLoading(false)
      return message.error('操作失败')
    }
    const params = {
      labelId: labelId || newLabelIdRef.current,
      name: addLabelName,
      image: fileUploadRes?.data?.resData,
      prompt: labelDescribeCN,
      priority: 1, // 是否为默认角色 0默认 1非默认
      type: labelType,
    }
    if (id) params.id = id
    const res = await api.uploadLabel([params])
    updateAllLabelList()
    if (res?.data?.resCode === SUCCESS_CODE) {
      message.success('已同步')
    } else {
      message.error('操作失败')
    }
    setIsSyncLoading(false)
  }
  const changeCurrentTab = (value, id) => {
    setCurrentTab(value)
  }
  const initRoleInfo = async () => {
    // 初始化当前编辑标签
    setAddLabelName(defaultLabelInfo?.names ? defaultLabelInfo?.names[0] : '')
    setLabelDescribeCN(defaultLabelInfo?.prompt?.chinese)
    setLabelDescribeEN(defaultLabelInfo?.prompt?.english)
    setAddLabelImgSrc(defaultLabelInfo?.img)
    const newRecords =
      defaultLabelInfo?.materials?.map((i) => ({
        name: defaultLabelInfo?.names ? defaultLabelInfo?.names[0] : '',
        img: i?.imageUrl,
        chinese: i?.imagePrompt?.chinese,
        english: i?.imagePrompt?.english,
      })) || []
    setGenerateRecords(newRecords)
    setTargetRecordsIndex(
      defaultLabelInfo?.materials?.findIndex(
        (i) => i.imageName === defaultLabelInfo.chosenImageName,
      ),
    )
  }
  const selectGenLabel = (item) => {
    setAddLabelName(item.name)
    setLabelDescribeCN(item.prompt)
    setAddLabelImgSrc(item.image)
  }
  const deletLabel = async (labelId, updateType) => {
    const res = await api.delLabel({
      taskId,
      labelIdList: [labelId],
    })
    if (res?.data?.resCode === SUCCESS_CODE) {
      message.success('删除成功')
    }
    getLabelInfo(updateType)
  }
  const handleDelete = async () => {
    modal
      .confirm({
        content: '是否确认删除此标签？',
        cancelText: '否',
        okText: '是',
      })
      .then((res) => {
        if (res) {
          deletLabel(labelId, labelType)
          setCreateModel(false)
        }
      })
  }
  useEffect(() => {
    if (!createModel) {
      clearAddLabelInfo()
    }
  }, [createModel])
  useEffect(() => {
    if (labelAllListMap && labelType != null) {
      const list = labelAllListMap[labelType] || []
      setLabelAllList(list)
      if (labelId) {
        const target = list.find((i) => Number(i.labelId) === Number(labelId))
        setId(target?.id)
      } else {
        setId(null)
      }
    }
  }, [labelAllListMap, labelId, labelType, newLabelIdRef])
  useEffect(() => {
    if (defaultLabelInfo && createModel) {
      initRoleInfo()
    }
  }, [defaultLabelInfo, createModel])

  return (
    <Modal
      title=""
      open={createModel}
      width={1064}
      zIndex={1000}
      closable={false}
      styles={{
        content: { padding: 0 },
        footer: { paddingTop: 5, paddingBottom: 13 },
      }}
      footer={
        <div className="addLabelFoolter">
          <Button
            style={{ marginRight: 10, width: 100, marginRight: 35 }}
            onClick={() => setCreateModel(false)}
          >
            取消
          </Button>
          <Button
            style={{ width: 100, marginLeft: 35 }}
            type="primary"
            onClick={handleSave}
            loading={isAddLabelLoading}
          >
            确定
          </Button>
        </div>
      }
    >
      <div className="addLabelContent">
        <div className="addLabelLeft">
          {addLabelImgSrc ? (
            <img src={formatLocalAssets(addLabelImgSrc, 0.1)} className="addLabelImgSrc" />
          ) : (
            <div className="addLabelImgSrc"></div>
          )}
          <div
            style={{
              display: 'flex',
              paddingRight: 14,
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <span style={{ flexShrink: 0, paddingRight: 10 }}>名称</span>
            <Input
              placeholder="请输入"
              value={addLabelName}
              onChange={(e) => setAddLabelName(e.target.value)}
            />
          </div>
          {labelId && (
            <Button
              onClick={handleDelete}
              style={{ width: 150, marginBottom: 15, background: '#3F3F3F' }}
            >
              删除
            </Button>
          )}
          {currentTab === 'add' && (
            <Button onClick={syncToCloud} style={{ width: 150 }} loading={isSyncLoading}>
              {labelType === LABEL_TYPE.PERSON ? '同步角色库' : '同步场景库'}
            </Button>
          )}
        </div>
        <div className="addLabelRight">
          {!labelId && (
            <ConfigProvider theme={themeConfig}>
              <Segmented
                block
                size="large"
                value={currentTab}
                onChange={changeCurrentTab}
                options={labelId ? LABEL_TYPE_EDIT_TAB[labelType] : LABEL_TYPE_TAB[labelType]}
                style={{ width: 200 }}
              />
            </ConfigProvider>
          )}
          {currentTab === 'add' && (
            <>
              <div
                className="addLabelInputContent"
                style={isTextAreaFocus ? { border: '1px solid #4d4099' } : {}}
              >
                <TextArea
                  value={labelDescribeCN}
                  placeholder="请输入描述词"
                  onChange={(e) => {
                    setLabelDescribeCN(e.target.value)
                    setLabelDescribeEN('')
                  }}
                  autoSize={{ minRows: 3, maxRows: 3 }}
                  style={{ fontSize: 14, border: 'none', marginBottom: 15 }}
                  onFocus={() => setIsTextAreaFocus(true)}
                  onBlur={() => setIsTextAreaFocus(false)}
                />
                <Button
                  style={{ float: 'right' }}
                  onClick={generatLabelImg}
                  loading={isGenImgLoading}
                >
                  生成效果图
                  {!!drawingModel && (
                    <IconFont
                      type="icon-jinbi1"
                      style={{
                        color: '#f9dd4b',
                        marginTop: 2,
                        marginLeft: 2,
                      }}
                    />
                  )}
                  {drawingModel === 'cloud' && enquiryImgCost}
                </Button>
              </div>
              <div className="addLabelRecordsContent">
                <div className="recordsTitle">生成记录</div>
                <div className="addLabelRecordsList">
                  {generateRecords.map((item, i) => {
                    if (item.img) {
                      return (
                        <img
                          alt=""
                          className="generateRecordsItem"
                          key={i}
                          src={formatLocalAssets(item.img, 0.1)}
                          style={{
                            border:
                              targetRecordsIndex === i ? '2px solid #4d4099' : '2px solid #1f1f1f',
                          }}
                          onClick={() => changeRecordItem(i)}
                        />
                      )
                    } else if (item.loading) {
                      return (
                        <div className="generateRecordsItemLoading" key={i}>
                          <LoadingOutlined />
                          <div>AI生成中</div>
                        </div>
                      )
                    }
                    return ''
                  })}
                </div>
              </div>
            </>
          )}
          {currentTab === 'select' && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                marginTop: 20,
              }}
            >
              {labelAllList.map((item, i) => (
                <LabelLibCard
                  item={item}
                  key={i}
                  i={i}
                  selectIndex={selectIndex}
                  setSelectIndex={setSelectIndex}
                  selectGenLabel={selectGenLabel}
                  updateAllLabelList={updateAllLabelList}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {contextHolder}
    </Modal>
  )
}

export default AddLabelModal
