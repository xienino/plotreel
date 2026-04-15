import { Button, Input, message, theme } from 'antd'
import React, { useEffect, useState, useRef } from 'react'
import { CloseOutlined } from '@ant-design/icons'
import './editText.sass'

const { TextArea } = Input
const EditText = React.memo(function MyComponent({
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
  lockEdit = false,
  status,
  isSavePromptLoading,
  slot,
  drawingModel,
  drawingSdState,
  editTextRef,
  setIsEdit,
  ...props
}) {
  const [textAreaValue, setTextAreaValue] = useState(value)
  const [lastTextAreaValue, setLastTextAreaValue] = useState(value)
  const [isSelect, setIsSelect] = useState(false)
  const [isSelectLock, setIsSelectLock] = useState(false)
  const [labelValueMapping, setLabelValueMapping] = useState({})
  const [saveStyleType, setSaveStyleType] = useState('default')
  const inputRef = useRef()

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [targetText, setTargetText] = useState()

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

  React.useImperativeHandle(editTextRef, () => ({
    textAreaBlur,
    getCurrentText,
  }))

  const textAreaBlur = () => {
    inputRef.current.blur()
  }
  const getCurrentText = () => {
    return textAreaValue
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
        className="editText"
        style={{
          border:
            isSelect || isSelectLock
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
        {slot}
        <div className="editTextAreaContent" style={{ height }}>
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
                setIsEdit && setIsEdit(true)
                if (!lockEdit) {
                  setTextAreaValue(e.target.value)
                }
              }}
              spellCheck={false}
              onFocus={() => {
                if (lockEdit) {
                  inputRef.current.focus({
                    preventScroll: true,
                    // cursor: 'none'
                  })
                }
              }}
              onBlur={async () => {
                isSavePromptLoading.current = true
                onEdit(textAreaValue)
              }}
              // autoSize
              autoSize={{ minRows: 3, maxRows: 5000 }}
              variant="borderless"
              // onChange={onChange}
            ></TextArea>
          )}
        </div>
      </div>
    </>
  )
})

export default EditText

// export default EditText;
