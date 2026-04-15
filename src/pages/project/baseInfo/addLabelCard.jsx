import React, { useState, useRef, useEffect } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import './baseInfo.sass'
import { LABEL_TYPE_LABEL } from '../../../assets/constant'

const AddLabelCard = ({ labelType, size, setCreateModel, setTargetLabel }) => {
  // const [createModel, setCreateModel] = useState(false) // 是否打开新建弹窗

  return (
    <>
      <div
        className="addLabelCard"
        onClick={() => {
          setTargetLabel({
            type: labelType,
          })
          setCreateModel(true)
        }}
        style={size === 'big' ? { width: 180, height: 217, marginBottom: 34 } : {}}
      >
        <PlusOutlined className="plusIcon" />
        添加{LABEL_TYPE_LABEL[labelType]}
      </div>
    </>
  )
}
export default AddLabelCard
