import React, { useEffect, useState, useRef } from 'react'
import { Button, Input, message, Badge, Checkbox, Row, Tag, Space, theme, List } from 'antd'
// import VirtualList from 'rc-virtual-list';

const Labels = ({
  projectId,
  initLabelItems,
  height,
  selects,
  labelItemsHasMore,
  onChange,
  labelOptions,
  record,
}) => {
  const [labelItems, setLabelItems] = useState([])
  const [searchName, setSearchName] = useState()
  const [notData, setNotData] = useState(!labelItemsHasMore)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [lastSelects, setLastSelects] = useState(selects || [])
  const [mouseEntryLabel, setMouseEntryLabel] = useState()
  const [isSelect, setIsSelect] = useState(false)

  const dataSkip = useRef((initLabelItems || []).length)
  const labelItemsRef = useRef(initLabelItems || [])
  const searchState = useRef(false)
  const searchNameRef = useRef()

  const { token } = theme.useToken()

  const handleOnChecked = async (name) => {
    const hide = message.loading('正在修改标签', 10)
    let cSelects
    if (selects.includes(name)) {
      cSelects = selects.filter((ele) => ele !== name)
    } else {
      cSelects = [...selects, name]
    }
    if (onChange && lastSelects !== cSelects) {
      const status = await onChange(cSelects)
      if (status) {
        message.success('标签修改成功')
        setLastSelects(cSelects)
      }
      hide()
    }
  }

  return (
    <>
      <Badge.Ribbon text={selects.length} color="magenta">
        <div
          onMouseEnter={() => {
            setIsSelect(true)
          }}
          onMouseLeave={() => {
            setIsSelect(false)
          }}
          style={{
            padding: '10px 4px',
            border: isSelect ? `1px solid ${token.colorPrimary}` : `1px solid ${token.colorBorder}`,
            borderRadius: '6px',
            width: '100%',
            overflow: 'auto',
            height: height,
          }}
        >
          {['person', 'scence'].map((current_type, index) => {
            return (
              <div key={current_type}>
                {index !== 0 && <br />}
                <div>
                  {(labelOptions || []).map((item) => {
                    if (item.type === current_type) {
                      return (
                        <Tag
                          style={{
                            fontSize: 13,
                            padding: 5,
                            margin: 3,
                            cursor: 'pointer',
                            border: selects.includes(item.names[0]) ? '1px solid #1D4BD0' : '',
                          }}
                          onClick={() => {
                            handleOnChecked(item.names[0])
                          }}
                          key={item.index}
                        >
                          {item.names[0]}
                        </Tag>
                      )
                    }
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Badge.Ribbon>
    </>
  )
}

export default Labels
