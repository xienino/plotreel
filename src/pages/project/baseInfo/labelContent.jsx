import React, { useState, useRef, useEffect } from 'react'
import { message, Button, Modal } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import './baseInfo.sass'
import { ERROR_CODE, LABEL_TYPE, TAG_STATE } from '../../../assets/constant'
import { getLabelImage } from '../../../common/util'
import { saveLabel } from '../../../common/util'

import api from '../../../services/project'
import AddLabelCard from './addLabelCard'
import AddLabelModal from './addLabelModal'
import LabelCard from './labelCard'
const ROLE_MAX_NUM = 10 // 最多添加多少角色
const SCENCE_MAX_NUM = 10 // 最多添加多少场景

const LabelContent = ({
  taskId,
  projectName,
  drawingModel,
  isHasSegmentation,
  paintingStyleValue,
  pictureSize,
  segmentationDetail,
  sdConfig,
  labelRef,
  checkCanGenLabel,
  checkCoin,
  labelAllListMap,
  updateAllLabelList,
  updateAccountInfo,
  enquiryImgCost,
  drawingSdState,
}) => {
  const [roleList, setRoleList] = useState([]) // 角色列表
  const roleListRef = useRef([])
  const [scenceList, setScenceList] = useState([]) // 角色列表
  const scenceListRef = useRef([])
  const initData = useRef(false)

  const [extractRoleLoading, setExtractRoleLoading] = useState(false) // 是否正在提取角色标签
  const [extractScenceLoading, setExtractScenceLoading] = useState(false) // 是否正在提取场景标签
  const [source, setSource] = useState('')
  const [modal, contextHolder] = Modal.useModal()
  const newLabelIdRef = useRef(1) // 标签id

  const [createModel, setCreateModel] = useState(false) // 是否打开新建标签弹窗
  const [targetLabel, setTargetLabel] = useState(null) // 当前正在编辑的标签id

  const getLabelInfo = async (updateLabelType) => {
    // 提取角色的列表初始化
    const { data } = (await api.getLabel({ taskId })) || {}
    if (data?.resData) {
      const list = data?.resData?.map((item) => {
        const targetMaterial = item?.label?.materials?.find(
          (i) => i.imageName === item?.label?.chosenImageName,
        )
        return {
          ...item.label,
          labelId: item?.labelId,
          img: targetMaterial?.imageUrl,
        }
      })
      if (updateLabelType == null || updateLabelType === LABEL_TYPE.PERSON) {
        const newList = list.filter((i) => i.type === LABEL_TYPE.PERSON)
        setRoleList(newList)
        roleListRef.current = newList
      }
      if (updateLabelType == null || updateLabelType === LABEL_TYPE.SCENCE) {
        const newList = list.filter((i) => i.type === LABEL_TYPE.SCENCE)
        setScenceList(newList)
        scenceListRef.current = newList
      }
      if (list?.length) {
        const newId =
          Number(
            Math.max.apply(
              null,
              list.map((i) => i.labelId),
            ) || 0,
          ) + 1
        if (Number(newId) > newLabelIdRef.current) {
          newLabelIdRef.current = Number(newId)
        }
      }
    } else {
      console.log('未获取到标签')
    }
  }
  const getNewSource = async () => {
    const textList = await checkCanGenLabel()
    const newSource = textList
      ?.filter((i) => !!i.source)
      ?.map((i) => i?.source)
      .join()
    setSource(newSource)
    return newSource
  }
  const handleExtractScence = async (cb) => {
    // 提取场景
    if (!drawingSdState) {
      message.warning('请在设置中连接服务')
      return
    }
    if (checkCoin()) return
    const source = await getNewSource()
    if (!source) return message.warning('请先输入故事脚本，再提取场景')
    setExtractScenceLoading(true) // 变成‘生成中...’加载状态
    const res = await api.extractScene({
      source,
    })
    if (res?.data?.resCode === ERROR_CODE) {
      message.error('场景提取失败')
      setExtractScenceLoading(false)
      return
    }
    if (!res?.data?.resData?.labels?.length) {
      setExtractScenceLoading(false)
      message.error('未能提取到场景标签')
    }
    const promiseList = []
    if (res?.data?.resData) {
      cb && cb()
      let newSceneList = res?.data?.resData?.labels.map((item, index) => {
        // 先把标签名更新到页面上
        return {
          labelId: Number(index) + newLabelIdRef.current,
          names: item.label.names,
          state: TAG_STATE.LOADING,
        }
      })
      newSceneList = newSceneList.concat(scenceList.filter((i) => i.userDefined))
      setScenceList(newSceneList)
      scenceListRef.current = newSceneList
      for (let index in res?.data?.resData?.labels) {
        const item = res?.data?.resData?.labels[index]
        promiseList.push(drawScence(Number(index) + newLabelIdRef.current, item.label))
      }
      newLabelIdRef.current =
        Number(newLabelIdRef.current) + Number(res?.data?.resData?.labels?.length)
    }
    setExtractScenceLoading(false)
    await Promise.all(promiseList)
  }
  const handleExtractRole = async (cb) => {
    // 提取角色
    if (!drawingSdState) {
      message.warning('请在设置中连接服务')
      return
    }
    if (checkCoin()) return
    const source = await getNewSource()
    if (!source) return message.warning('请先输入故事脚本，再提取角色')
    setExtractRoleLoading(true) // 变成‘生成中...’加载状态
    const res = await api.extractRole({
      // 步骤 1： 提取标签
      source,
    })
    if (res?.data?.resCode === ERROR_CODE) {
      setExtractRoleLoading(false)
      message.error('角色提取失败')
      return
    }
    if (!res?.data?.resData?.labels?.length) {
      setExtractRoleLoading(false)
      message.error('未能提取到角色标签')
    }
    const promiseList = []
    if (res?.data?.resData) {
      cb && cb()
      let newRoleList = res?.data?.resData?.labels.map((item, index) => {
        // 先把标签名更新到页面上
        return {
          labelId: Number(index) + newLabelIdRef.current,
          names: item.label.names,
          state: TAG_STATE.LOADING,
        }
      })
      newRoleList = newRoleList.concat(roleList.filter((i) => i.userDefined))
      setRoleList(newRoleList)
      roleListRef.current = newRoleList
      for (let index in res?.data?.resData?.labels) {
        const item = res?.data?.resData?.labels[index]
        promiseList.push(drawRole(Number(index) + newLabelIdRef.current, item.label))
      }
      newLabelIdRef.current =
        Number(newLabelIdRef.current) + Number(res?.data?.resData?.labels?.length)
    }
    setExtractRoleLoading(false)
    await Promise.all(promiseList)
  }
  const reDrawScence = (labelId, label) => {
    const currentSceneList = [...scenceListRef.current]
    const target = currentSceneList.find((i) => i.labelId == labelId)
    target.state = TAG_STATE.LOADING
    setScenceList(currentSceneList)
    scenceListRef.current = currentSceneList
    drawScence(labelId, label)
  }
  const assembleLabelInfo = (imgInfo, label) => {
    return {
      img: imgInfo?.imageUrl,
      state: TAG_STATE.NORMAL,
      names: label.names,
      materials: [
        {
          imageName: imgInfo?.imageName,
          imagePrompt: {
            chinese: label?.prompt?.chinese,
            english: label?.prompt?.english,
          },
          imageUrl: imgInfo?.imageUrl,
        },
      ],
      chosenImageName: imgInfo?.imageName,
      prompt: label?.prompt,
      userDefined: false,
    }
  }
  const drawScence = async (labelId, label) => {
    const projectInfo = { style: paintingStyleValue, pictureSize, taskId }
    const configInfo = { model: sdConfig.value, drawingModel }
    const originImage = await getLabelImage(
      label.prompt.english,
      LABEL_TYPE.SCENCE,
      projectInfo,
      configInfo,
    )
    const imgInfo = await saveLabel(
      labelId,
      label,
      LABEL_TYPE.SCENCE,
      originImage.imageData[0],
      projectName,
      taskId,
    )
    const currentSceneList = [...scenceListRef.current]
    const target = currentSceneList.find((i) => i.labelId == labelId)
    const moreInfo = assembleLabelInfo(imgInfo, label)
    if (!target) {
      currentSceneList.push({ labelId, ...moreInfo })
    } else {
      for (let key in moreInfo) {
        target[key] = moreInfo[key]
      }
    }
    setScenceList(currentSceneList)
    scenceListRef.current = currentSceneList
    updateAccountInfo()
  }
  const reDrawRole = (labelId, label) => {
    const currentRoleList = [...roleListRef.current]
    const target = currentRoleList.find((i) => i.labelId == labelId)
    target.state = TAG_STATE.LOADING
    setRoleList(currentRoleList)
    roleListRef.current = currentRoleList
    drawRole(labelId, label)
  }
  const drawRole = async (labelId, label) => {
    const projectInfo = { style: paintingStyleValue, pictureSize, taskId }
    const configInfo = { model: sdConfig.value, drawingModel }
    const originImage = await getLabelImage(
      label.prompt.english,
      LABEL_TYPE.PERSON,
      projectInfo,
      configInfo,
    )
    const imgInfo = await saveLabel(
      labelId,
      label,
      LABEL_TYPE.PERSON,
      originImage.imageData[0],
      projectName,
      taskId,
    )
    const currentRoleList = [...roleListRef.current]
    const target = currentRoleList.find((i) => i.labelId == labelId)
    const moreInfo = assembleLabelInfo(imgInfo, label)
    if (!target) {
      currentRoleList.push({
        labelId,
        ...moreInfo,
      })
    } else {
      for (let key in moreInfo) {
        target[key] = moreInfo[key]
      }
    }
    setRoleList(currentRoleList)
    roleListRef.current = currentRoleList
    updateAccountInfo()
  }

  const goNext = async () => {
    // 返回true则进行下一步
    if (!roleList?.length) {
      return modal.confirm({
        content: '还没有任何角色，是否继续',
        cancelText: '否',
        okText: '是',
      })
    }
    if (!scenceList?.length) {
      return modal.confirm({
        content: '还没有任何场景，是否继续',
        cancelText: '否',
        okText: '是',
      })
    }
    return true
  }
  const checkHasLabel = async () => {
    return roleList?.length > 0 || scenceList?.length > 0
  }
  const refreshExtractLabel = async (targetLabelType) => {
    // 重新提取标签
    if (targetLabelType === LABEL_TYPE.PERSON) {
      const labelIdList = roleListRef.current.filter((i) => !i.userDefined).map((i) => i.labelId)
      api.delLabel({
        taskId,
        labelIdList,
      })
      const newLabelList = [...roleListRef.current.filter((i) => i.userDefined)] // 过滤用户自定义标签
      setRoleList(newLabelList)
      roleListRef.current = newLabelList
      await handleExtractRole(() => {
        roleListRef.current
          .filter((i) => !i.userDefined)
          .forEach((i) => {
            deletLabel(i.labelId, i.labelType)
          })
      })
    } else {
      const labelIdList = scenceListRef.current.filter((i) => !i.userDefined).map((i) => i.labelId)
      api.delLabel({
        taskId,
        labelIdList,
      })
      const newLabelList = [...scenceListRef.current.filter((i) => i.userDefined)]
      setScenceList(newLabelList)
      scenceListRef.current = newLabelList
      await handleExtractScence(() => {
        scenceListRef.current
          .filter((i) => !i.userDefined)
          .forEach((i) => {
            deletLabel(i.labelId, i.labelType)
          })
      })
    }
  }
  const deletLabel = async (labelId, updateType) => {
    // todo
    const res = await api.delLabel({
      taskId,
      labelIdList: [labelId],
    })
    getLabelInfo(updateType)
  }

  useEffect(() => {
    const newSource = segmentationDetail?.map((i) => i?.source || '').join()
    setSource(newSource)
  }, [segmentationDetail])

  useEffect(() => {}, [isHasSegmentation])

  useEffect(() => {
    if (!projectName) return
    if (initData.current) {
      return
    }
    initData.current = true
    getLabelInfo()
  }, [projectName])
  useEffect(() => {
    let maxLabelId = 0
    Object.values(labelAllListMap).forEach((labelList) => {
      labelList.forEach((label) => {
        if (Number(label.labelId) > Number(maxLabelId)) {
          maxLabelId = label.labelId
        }
      })
    })
    if (Number(maxLabelId) + 1 > newLabelIdRef.current) {
      newLabelIdRef.current = Number(maxLabelId) + 1
    }
  }, [labelAllListMap])

  // 将子组件实例绑定到父组件传递的 ref 上
  React.useImperativeHandle(labelRef, () => ({
    goNext,
    refreshExtractLabel,
    checkHasLabel,
  }))

  return (
    <div className="detailRight">
      <div className="labelTitle">角色设计</div>
      <div className="labelTip">根据脚本内容和视觉风格生成，修改脚本内容或切换风格需重新提取</div>
      <div className="labelList">
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {roleList.length < ROLE_MAX_NUM && roleList.every((item) => item?.userDefined) && (
            <div style={{ height: 154 }}>
              <div className="labelCard">
                {extractRoleLoading ? (
                  <div>
                    <LoadingOutlined />
                    <div>AI生成中</div>
                  </div>
                ) : (
                  <Button type="primary" onClick={() => handleExtractRole()}>
                    提取角色
                  </Button>
                )}
              </div>
            </div>
          )}
          {roleList?.length
            ? roleList?.map((item) => (
                <LabelCard
                  key={item.labelId}
                  item={item}
                  reDraw={reDrawRole}
                  getLabelInfo={getLabelInfo}
                  labelType={LABEL_TYPE.PERSON}
                  taskId={taskId}
                  setCreateModel={setCreateModel}
                  setTargetLabel={setTargetLabel}
                />
              ))
            : ''}
          {roleList?.length < ROLE_MAX_NUM && (
            <AddLabelCard
              labelType={LABEL_TYPE.PERSON}
              setCreateModel={setCreateModel}
              setTargetLabel={setTargetLabel}
            />
          )}
        </div>
      </div>
      <div className="labelTitle">场景设计</div>
      <div className="labelTip">根据脚本内容和视觉风格生成，修改脚本内容或切换风格需重新提取</div>
      <div className="labelList">
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {scenceList.length < SCENCE_MAX_NUM && scenceList.every((item) => item?.userDefined) && (
            <div style={{ height: 154 }}>
              <div className="labelCard">
                {extractScenceLoading ? (
                  <div>
                    <LoadingOutlined />
                    <div>AI生成中</div>
                  </div>
                ) : (
                  <Button type="primary" onClick={() => handleExtractScence()}>
                    提取场景
                  </Button>
                )}
              </div>
            </div>
          )}
          {scenceList?.length
            ? scenceList?.map((item) => (
                <LabelCard
                  key={item.labelId}
                  item={item}
                  reDraw={reDrawScence}
                  getLabelInfo={getLabelInfo}
                  labelType={LABEL_TYPE.SCENCE}
                  taskId={taskId}
                  setCreateModel={setCreateModel}
                  setTargetLabel={setTargetLabel}
                />
              ))
            : ''}
          {scenceList?.length < SCENCE_MAX_NUM && (
            <AddLabelCard
              labelType={LABEL_TYPE.SCENCE}
              setCreateModel={setCreateModel}
              setTargetLabel={setTargetLabel}
            />
          )}
        </div>
      </div>
      <AddLabelModal
        drawingModel={drawingModel}
        createModel={createModel}
        setCreateModel={setCreateModel}
        newLabelIdRef={newLabelIdRef}
        labelId={targetLabel?.labelId}
        getLabelInfo={getLabelInfo}
        labelType={targetLabel?.type}
        defaultLabelInfo={targetLabel}
        taskId={taskId}
        projectName={projectName}
        paintingStyleValue={paintingStyleValue}
        pictureSize={pictureSize}
        sdConfig={sdConfig}
        labelAllListMap={labelAllListMap}
        updateAllLabelList={updateAllLabelList}
        updateAccountInfo={updateAccountInfo}
        enquiryImgCost={enquiryImgCost}
        userDefined={targetLabel?.userDefined}
      />
      {contextHolder}
    </div>
  )
}

export default LabelContent
