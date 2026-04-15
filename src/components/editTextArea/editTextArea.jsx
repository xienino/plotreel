import { Button, Input, message, theme, Tooltip, Row, Col, Switch } from 'antd'
import React, { useEffect, useState, useRef } from 'react'
import { BorderBottomOutlined, CloseOutlined } from '@ant-design/icons'
import './editTextArea.sass'

const { TextArea } = Input
const EditTextArea = React.memo(function MyComponent({
  isDragging,
  setIsDragging,
  setMergeParams,
  mergeParams,
  onMerge,
  height,
  onEdit,
  value,
  labelValue,
  onLabelDelete,
  cIndex,
  intelligentKeyword,
  lockEdit = false,
  status,
  ...props
}) {
  const [textAreaValue, setTextAreaValue] = useState(value)
  const [lastTextAreaValue, setLastTextAreaValue] = useState(value)
  const [isSelect, setIsSelect] = useState(false)
  const [isSelectLock, setIsSelectLock] = useState(false)
  const [labelValueMapping, setLabelValueMapping] = useState({})
  const [saveStyleType, setSaveStyleType] = useState('default')
  const [saveLoading, setSaveLoading] = useState(false)
  const inputRef = useRef()

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [targetText, setTargetText] = useState()
  const [targetPlacement, setTargetPlacement] = useState()
  // const [targetIndex, setTargetIndex] = useState()

  const sourceTextRef = useRef()
  const sourceIndexRef = useRef()
  const sourceClientYRef = useRef()

  if (intelligentKeyword) {
    height -= 29
  }

  const handleDragStart = (e) => {
    // e.preventDefault(); // 阻止浏览器的默认行为
  }

  const handleDrag = (e) => {
    if (isDragging) {
      setPosition({
        x: position.x + e.movementX,
        y: position.y + e.movementY,
      })
    }
  }

  const { token } = theme.useToken()

  const handleFocus = () => {
    if (!lockEdit) {
      setIsSelectLock(true)
      inputRef.current.focus({
        preventScroll: true,
        cursor: 'end',
      })
    }
  }

  const handleBlur = () => {
    if (!isSelect) {
      setIsSelectLock(false)
    }
  }

  useEffect(() => {
    setTextAreaValue(value)
    setLastTextAreaValue(value)
  }, [value])

  const handleDeleteLabelValue = (key) => {
    delete labelValueMapping[key]
    setLabelValueMapping({ ...labelValueMapping })
    onLabelDelete(key)
  }
  useEffect(() => {
    if (labelValue !== labelValueMapping) {
      setLabelValueMapping(labelValue || {})
    }
  }, [labelValue])

  useEffect(() => {
    if (textAreaValue !== lastTextAreaValue) {
      setSaveStyleType('primary')
    } else {
      setSaveStyleType('default')
    }
  }, [textAreaValue, lastTextAreaValue])

  return (
    <>
      <div
        tabIndex={0} // 让 <div> 元素可以聚焦
        className="editTextArea"
        style={{
          border: status
            ? '1px solid red'
            : textAreaValue !== lastTextAreaValue
              ? '3px solid #51258f'
              : isSelect || isSelectLock
                ? `1px solid ${token.colorPrimary}`
                : `1px solid ${token.colorBorder}`,
        }}
        onMouseEnter={() => {
          setIsSelect(true)
        }}
        onMouseLeave={() => {
          setIsSelect(false)
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <div
          className="editTextAreaContent"
          style={{ height: isSelectLock && !intelligentKeyword ? height - 28 : height }}
        >
          {Object.keys(labelValueMapping).map((key) => {
            const value = labelValueMapping[key]['value']
            const borderColor = labelValueMapping[key]['borderColor']
            return (
              <div
                className="editTextAreaLabel"
                style={{
                  background: token.backgroundColor,
                  border: borderColor ? `1px solid ${borderColor}` : null,
                }}
                key={key}
              >
                <span
                  onClick={() =>
                    navigator.clipboard
                      .writeText(value)
                      .then(() => {
                        message.info('复制成功')
                      })
                      .catch((err) => {
                        console.error('复制失败', err)
                      })
                  }
                >
                  {value}
                </span>
                {labelValueMapping[key]['close'] && (
                  <Button
                    size="small"
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => {
                      if (onLabelDelete) {
                        handleDeleteLabelValue(key)
                      }
                    }}
                  />
                )}
              </div>
            )
          })}
          {lockEdit ? (
            <div
              style={{
                // height: 200,
                height: '100%',
                resize: 'none',
                // margin: 10,
                overflow: 'auto',
                borderRadius: '6px',
                // border: `1px solid #373737`,
                // padding: "0px 1px",
              }}
            >
              {textAreaValue.split('\n\n').map((text, index) => {
                if (!text) {
                  return
                }
                return (
                  <div
                    key={index}
                    style={{
                      background: '#373737',
                      border: '1px solid #373737',
                      borderRadius: text !== targetText ? '6px' : null,
                      padding: '2px 2px',
                      margin: '5px 3px 5px 0px',
                      top: position.y,
                      left: position.x,
                    }}
                  >
                    {text}
                  </div>
                )
              })}
            </div>
          ) : (
            <TextArea
              {...props}
              ref={inputRef}
              style={{ resize: 'none', padding: 0, userSelect: 'none' }}
              value={textAreaValue}
              onChange={(e) => {
                if (!lockEdit) {
                  setTextAreaValue(e.target.value)
                }
              }}
              spellCheck={false}
              onPressEnter={() => {
                if (onEdit && !lockEdit) {
                  onEdit(textAreaValue)
                }
              }}
              onFocus={() => {
                if (lockEdit) {
                  inputRef.current.focus({
                    preventScroll: true,
                    // cursor: 'none'
                  })
                }
              }}
              // autoSize
              autoSize={{ minRows: 3, maxRows: 5000 }}
              variant="borderless"
              // onChange={onChange}
            ></TextArea>
          )}
        </div>
        {((isSelectLock && onEdit) || intelligentKeyword) && (
          <Row justify="space-between" align="middle">
            {intelligentKeyword && (
              <Col flex="1 1 70px">
                <Button
                  block
                  onClick={(e) => {
                    setIsSelectLock(false)
                    intelligentKeyword()
                    e.stopPropagation()
                  }}
                >
                  推理关键词
                </Button>
              </Col>
            )}
            <Col flex="1 1 70px">
              <Button
                block
                type={saveStyleType}
                loading={saveLoading}
                onClick={async () => {
                  setSaveLoading(true)
                  await onEdit(textAreaValue)
                  setLastTextAreaValue(textAreaValue)
                  setSaveLoading(false)
                }}
              >
                保存
              </Button>
            </Col>
          </Row>
        )}
      </div>
    </>
  )
})

export default EditTextArea

// export default EditTextArea;
