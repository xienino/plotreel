import React, { useState } from 'react'
import { message, Button, Card, Checkbox, Tooltip, Image } from 'antd'
import './paintInfo.sass'
import { DeleteOutlined, PlusCircleFilled } from '@ant-design/icons'
import { STROYBOARD_STATE_LABEL, STROYBOARD_STATE } from '../../../assets/constant'
import { formatLocalAssets } from '../../../common/util'

const Storyboard = React.memo(
  function ({
    setDeleteShootingModalState,
    setTargetDeleteIndex,
    currentIndex,
    detail,
    changeDetail,
    selectedList,
    setSelectedList,
    changeSelectMode,
    handleAddItem,
  }) {
    const [isHovered, setIsHovered] = useState(false)

    const onSelectChange = () => {
      let newList = []
      if (selectedList.some((i) => i === detail.index)) {
        newList = selectedList.filter((i) => i !== detail.index)
      } else {
        newList = [...selectedList, Number(detail.index)]
      }
      setSelectedList(newList)
      changeSelectMode(newList.length)
    }
    const handleMouseEnter = () => {
      setIsHovered(true)
    }
    const handleMouseLeave = () => {
      setIsHovered(false)
    }

    const isLoading =
      [
        STROYBOARD_STATE.ILLATION_ING,
        STROYBOARD_STATE.DRAWING_ING,
        STROYBOARD_STATE.TRANS_VIDEO_ING,
      ].indexOf(detail.state) > -1
    let boardItem = null
    const targetImg = detail?.materials?.find((i) => i?.mIndex == detail?.chosenPic)
    if (!targetImg || targetImg?.isLoading) {
      boardItem = (
        <div className="boardLoadingTip">{STROYBOARD_STATE_LABEL[detail?.state]?.title}</div>
      )
    } else if (targetImg?.mFormat === '.png') {
      boardItem = (
        <Image src={formatLocalAssets(targetImg?.mUrl, 0.1)} placeholder="加载中" preview={false} />
      )
    } else {
      boardItem = <video src={formatLocalAssets(targetImg?.mUrl, 0.1)} />
    }
    const checked = selectedList.some((i) => i === detail.index)

    return (
      <div className="storyboardWrap">
        <Checkbox onChange={onSelectChange} checked={checked}>
          <div className="boardIndex">{Number(detail.index) + 1}</div>
        </Checkbox>
        <Card
          className="storyboard"
          hoverable
          onClick={() => {
            console.log('detail.index: ', detail.index)
            console.log('detail: ', detail)
            changeDetail(detail.index, detail)
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={
            Number(detail.index) === Number(currentIndex)
              ? { border: '2px solid #5748B0' }
              : { border: '2px solid #040404' }
          }
        >
          {boardItem}
          <div className="btnGroup">
            <Tooltip title="删除">
              <Button
                size="small"
                icon={<DeleteOutlined />}
                className="deleteShooting"
                style={{ visibility: isHovered ? 'visible' : 'hidden' }}
                onClick={() => {
                  if (isLoading) {
                    message.error('请先暂停项目，再进行删除')
                    return
                  }
                  setDeleteShootingModalState(true)
                  setTargetDeleteIndex(detail.index)
                }}
              ></Button>
            </Tooltip>
          </div>
          <div className="btnBottomGroup">
            <Tooltip title="向下插入">
              <PlusCircleFilled
                className="plusIcon"
                onClick={() => {
                  if (isLoading) {
                    message.error('请先暂停项目，再进行添加')
                    return
                  }
                  handleAddItem(detail.index + 1)
                }}
                style={{ visibility: isHovered ? 'visible' : 'hidden' }}
              />
            </Tooltip>
          </div>
        </Card>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // return true
    // 自定义比较逻辑，返回 true 表示 props 没有变化，不需要重新渲染
  },
)

Storyboard.displayName = 'Storyboard'
export default Storyboard
