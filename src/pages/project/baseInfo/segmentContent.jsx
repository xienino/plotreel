import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input, message } from 'antd'
import api from '../../../services/project'
import { SUCCESS_CODE, KEY_CODE, SEGMENT } from '../../../assets/constant'

const SegmentContent = ({
  segmentationDetail,
  taskId,
  segmentRef,
  setIsUploaded,
  setIsShowReDrawRoleBtn,
  checkHasLabel,
  setIsShowReDrawSceneBtn,
  isDisabled,
  setTotalWorld,
}) => {
  const [textList, setTextList] = useState([])
  const [segmentLen, setSegmentLen] = useState(0)
  const textListRef = useRef([])
  const itemsRef = useRef(null)
  const [changeKey, setChangeKey] = useState(1)

  const getMap = () => {
    if (!itemsRef.current) {
      itemsRef.current = new Map()
    }
    return itemsRef.current
  }
  const changeSegmentRowFocus = (index, cursor = 'end', focusPosition) => {
    const map = getMap()
    const node = map.get(index)
    if (node) {
      node.focus({
        cursor,
      })
      if (focusPosition) {
        setTimeout(() => {
          node.setSelectionRange(focusPosition, focusPosition)
        }, 0)
      }
    }
  }
  const addRow = (index, leftString, rightString) => {
    if (textListRef.current?.length >= SEGMENT.MAX_ROW_NUM) {
      message.warning(`最多可创建${SEGMENT.MAX_ROW_NUM}条分镜`)
      return
    }
    // 新增行
    let newTextList = []
    textListRef.current.forEach((i) => {
      if (i.index < index) {
        newTextList.push({
          index: i.index,
          source: i.source,
        })
      } else if (i.index === index) {
        newTextList = newTextList.concat([
          { index: i.index, source: leftString },
          { index: Number(i.index) + 1, source: rightString },
        ])
      } else {
        newTextList.push({
          index: Number(i.index) + 1,
          source: i.source,
        })
      }
    })
    setTextList(newTextList)
    textListRef.current = newTextList
    setTimeout(() => {
      changeSegmentRowFocus(Number(index) + 1, 'start')
    }, 30)
  }
  const deleteRow = (index, rightString) => {
    // 删除行
    let beforeRowFocusPosition = 0
    let newTextList = []
    textListRef.current.forEach((i) => {
      if (i.index < index - 1) {
        // 待删除行上一行的之前行
        newTextList.push({
          index: i.index,
          source: i.source,
        })
      } else if (i.index === index - 1) {
        // 待删除行的上一行
        newTextList.push({
          index: i.index,
          source: i.source + rightString,
        })
        beforeRowFocusPosition = i.source.length
      } else if (i.index > index) {
        // 待删除行的之后行
        newTextList.push({
          index: i.index - 1,
          source: i.source,
        })
      }
    })
    setTextList(newTextList)
    textListRef.current = newTextList
    setTimeout(() => {
      changeSegmentRowFocus(
        Number(index) > 0 ? Number(index) - 1 : 0,
        'end',
        beforeRowFocusPosition,
      )
    }, 30)
  }
  const handleKeyDown = async (e, index) => {
    const leftString = e.target.value.slice(0, e.target.selectionStart)
    const rightString = e.target.value.slice(e.target.selectionStart)
    let selectedText = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd)
    if (e.keyCode === KEY_CODE.ENTER) {
      addRow(index, leftString, rightString)
      return
    }
    if (!selectedText && !leftString && e.keyCode === KEY_CODE.BACKSPACE) {
      // 当前未选中文本，且当前行值的左侧为空时，按下backspace键，需删除当前行
      deleteRow(index, rightString)
    }
    if (e.keyCode !== KEY_CODE.UP && e.keyCode !== KEY_CODE.DOWN) return
    const nextIndex = e.keyCode === KEY_CODE.UP ? index - 1 : index + 1
    changeSegmentRowFocus(nextIndex)
  }
  const handleChange = async (e, index) => {
    const originTextList = [...textListRef.current]
    const targetItem = originTextList.find((i) => i.index === index)
    targetItem.source = e.target.value
    const total = originTextList.reduce((prev, curr) => {
      return prev + (curr?.source?.length || 0)
    }, 0)
    if (total > SEGMENT.MAX_WORD) {
      message.warning(`最多可输入${SEGMENT.MAX_WORD}字`)
      targetItem.source = e.target.defaultValue
    }
    textListRef.current = originTextList
    setTextList(textListRef.current)
    setTotalWorld(total > SEGMENT.MAX_WORD ? SEGMENT.MAX_WORD : total)
    if (await checkHasLabel()) {
      setIsShowReDrawRoleBtn(true)
      setIsShowReDrawSceneBtn(true)
    }
  }

  const handleSave = async (isShowLoading = true) => {
    var hide = null
    if (isShowLoading) {
      hide = message.loading('加载中...')
    }
    if (segmentLen > textList?.length) {
      const deleteList = []
      for (let i = textList.length; i < segmentLen; i++) {
        deleteList.push(i)
      }
      await api.deleteMediumShooting({
        taskId,
        indexes: deleteList,
      })
    }
    const res = await api.setFileContent({
      taskId,
      textList: textList
        .filter((i) => !!i.source)
        .map((i, index) => {
          return {
            ...i,
            index: index,
          }
        }),
    })
    if (res?.data?.resCode !== SUCCESS_CODE) {
      message.success('脚本修改失败，请稍后重试')
    }
    hide && hide()
  }
  const checkCanGoNext = async (isShowLoading) => {
    const validTextList = textList.filter((i) => !!i.source)
    if (!validTextList?.length) return []
    await handleSave(isShowLoading)
    return textList
  }

  useEffect(() => {
    const list = segmentationDetail.map((i) => ({
      ...i,
      index: Number(i.index),
      source: i.source,
      placeholder: i.placeholder,
    }))
    setTextList(list)
    setChangeKey(changeKey + 1)
    textListRef.current = list
    if (segmentLen < list?.length) {
      setSegmentLen(list.length)
    }
  }, [segmentationDetail])

  useEffect(() => {
    if (textList.every((i) => !i.source)) {
      setIsUploaded(false)
    }
  }, [textList])

  // 将子组件实例绑定到父组件传递的 ref 上
  React.useImperativeHandle(segmentRef, () => ({
    checkCanGoNext,
  }))

  return (
    <div className="segmentContent">
      {textList &&
        textList.map((detail) => (
          <div className="segmentItem" key={changeKey.toString() + detail.index.toString()}>
            <div style={{ flexShrink: 0, paddingRight: 10 }}>分镜{detail.index + 1}</div>
            <Input
              disabled={isDisabled}
              placeholder={detail.placeholder || ''}
              variant="borderless"
              defaultValue={detail.source ? detail.source : ''}
              value={detail.source ? detail.source : ''}
              className="segmentInput"
              onChange={(e) => handleChange(e, detail.index)}
              onKeyDown={(value) => handleKeyDown(value, detail.index)}
              ref={(node) => {
                const map = getMap()
                node ? map.set(detail.index, node) : map.delete(detail.index)
              }}
              maxLength={SEGMENT.MAX_ROW_WORD_LEN}
              count={{ show: true, max: SEGMENT.MAX_ROW_WORD_LEN }}
            />
          </div>
        ))}
    </div>
  )
}

export default SegmentContent
