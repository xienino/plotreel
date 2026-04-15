import React, { Row, Col, Slider, InputNumber } from 'antd'

import { useState, useRef } from 'react'

import { useEffect } from 'react'

const IntegerStep = ({
  onInputChange,
  width,
  defaultValue,
  min,
  max,
  disabled,
  value,
  step,
  ...props
}) => {
  const initValue = typeof value === 'string' ? parseFloat(value) : value
  const [inputValue, setInputValue] = useState(
    initValue
      ? initValue
      : typeof defaultValue === 'string'
        ? parseFloat(defaultValue)
        : defaultValue,
  )

  const onChange = (newValue) => {
    setInputValue(newValue)
    onInputChange(newValue)
  }

  return (
    <div style={{ width: '90%', padding: '0px 5px' }}>
      <Row style={{ width: width }} align="middle">
        <Col span={17}>
          <Slider
            min={min}
            max={max}
            onChange={onChange}
            disabled={disabled}
            step={step}
            {...props}
            value={value ? value : typeof inputValue === 'number' ? inputValue : 0}
          />
        </Col>
        <Col span={4}>
          <InputNumber
            min={min}
            max={max}
            style={{
              margin: '0px 0px 0px 8px',
              width: width / 3,
            }}
            step={step}
            disabled={disabled}
            value={value ? value : inputValue}
            onChange={onChange}
          />
        </Col>
      </Row>
    </div>
  )
}

export default IntegerStep
