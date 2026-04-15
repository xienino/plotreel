import React, { useState, useRef, useEffect } from 'react'
import { Button, Image } from 'antd'
import { LoadingOutlined, EditOutlined } from '@ant-design/icons'
import './baseInfo.sass'
import { TAG_STATE } from '../../../assets/constant'
import { formatLocalAssets } from '../../../common/util'

const LabelCard = ({
  item,
  reDraw,
  size,
  handleClick,
  isSelect,
  isHideReDrawBtn,
  setCreateModel,
  setTargetLabel,
  labelType,
}) => {
  const handleEdit = () => {
    setTargetLabel({
      ...item,
      type: labelType,
    })
    setCreateModel(true)
  }
  return (
    <div>
      <div
        className="labelCard"
        onClick={handleClick}
        style={{
          border: isSelect ? '2px solid rgb(112, 99, 172)' : '2px solid #1f1f1f',
          width: size === 'big' ? 178 : 103,
          height: size === 'big' ? 212 : 124,
        }}
      >
        {item?.state === TAG_STATE.LOADING ? (
          <div>
            <LoadingOutlined />
            <div>绘制中</div>
          </div>
        ) : item?.img ? (
          <Image
            width={size === 'big' ? 178 : 103}
            height={size === 'big' ? 212 : 124}
            src={formatLocalAssets(item?.img, 0.4)}
            preview={{
              mask: (
                <div>
                  <div style={{ fontSize: 10, position: 'relative' }}>
                    <Button onClick={handleEdit}>
                      <EditOutlined />
                      编辑
                    </Button>
                  </div>
                </div>
              ),
              visible: false,
            }}
          />
        ) : isHideReDrawBtn ? (
          <></>
        ) : (
          <div style={{ padding: 10, boxSizing: 'border-box' }}>
            绘制异常，请重新绘制
            <Button onClick={() => reDraw(item.labelId, item)} type="primary">
              重试
            </Button>
          </div>
        )}
      </div>
      {item.names && <div style={{ fontSize: 14 }}>{item.names}</div>}
    </div>
  )
}

export default LabelCard
