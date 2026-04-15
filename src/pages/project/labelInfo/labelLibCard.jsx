import React, { useState, useEffect } from 'react'
import { message, Button, Modal, Image } from 'antd'
import './labelInfo.sass'
import { DeleteOutlined } from '@ant-design/icons'

import api from '../../../services/project'
import { SUCCESS_CODE } from '../../../assets/constant'

const LabelLibCard = ({
  item,
  i,
  setSelectIndex,
  selectIndex,
  updateAllLabelList,
  selectGenLabel,
}) => {
  const [isHovered, setIsHovered] = useState(true)
  const [deleteShootingModalState, setDeleteShootingModalState] = useState(false)

  const changeSelectIndex = (i) => {
    setSelectIndex(i)
  }
  const handleLabelDelete = async () => {
    const res = await api.deleteLabel({
      id: item.id,
    })
    if (res?.data?.resCode === SUCCESS_CODE) {
      message.success('删除成功')
      updateAllLabelList()
      setDeleteShootingModalState(false)
    }
  }
  const handleMouseEnter = () => {
    setIsHovered(true)
  }
  const handleMouseLeave = () => {
    setIsHovered(false)
  }
  return (
    <div
      className="labelLibCard"
      style={{ marginBottom: 20 }}
      key={item.labelId}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        className="generateRecordsItem"
        key={i}
        src={item.image}
        width={80}
        height={100}
        style={{ border: selectIndex === i ? '2px solid #4d4099' : '2px solid #1f1f1f' }}
        preview={{
          mask: (
            <div>
              <div style={{ fontSize: 10, position: 'absolute', bottom: 5, right: 5 }}>
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  className="deleteIcon"
                  style={{ visibility: isHovered ? 'visible' : 'hidden' }}
                  onClick={() => {
                    setDeleteShootingModalState(true)
                  }}
                ></Button>
              </div>
            </div>
          ),
          visible: false,
        }}
        onClick={() => {
          changeSelectIndex(i)
          selectGenLabel(item)
        }}
      />
      <div style={{ textAlign: 'center' }}>{item.name}</div>
      <Modal
        title="提示"
        open={deleteShootingModalState}
        onOk={handleLabelDelete}
        onCancel={() => {
          setDeleteShootingModalState(false)
        }}
        okText="确认"
        cancelText="取消"
        zIndex={1001}
        centered
      >
        <p>您是否确定删除当前标签，确定后将无法再恢复</p>
      </Modal>
    </div>
  )
}

export default LabelLibCard
