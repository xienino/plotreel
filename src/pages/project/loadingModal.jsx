import { useState } from 'react'
import { Button, Space, Modal, Progress, TreeSelect, message, Row, Col, Select } from 'antd'
import { useEffect } from 'react'
import NumericInput from '../../components/numericInput'

// import './detail.css';

import { CheckCard } from '@ant-design/pro-components'

const { SHOW_PARENT } = TreeSelect

function splitArrayIntoChunks(array, chunkSize) {
  const result = []
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize))
  }
  return result
}

function LoadingModal({
  projectId,
  title,
  onOk,
  onCancel,
  runningState,
  open,
  percent,
  percentDetail,
  openDir,
  renderPercentDetail,
  onStartIndex,
  onCheck,
  inputExtra,
  actionRender,
  isRepeatProcessing,
  rightExtra,
  confirmLoading,
  mediumData,
  ...props
}) {
  const [treeSelectStatus, setTreeSelectStatus] = useState(null)
  const [startIndex, setStartIndex] = useState('')
  const [cIndexes, setCIndexes] = useState([])

  const handleCheck = async () => {
    if (onCheck !== undefined) {
      if (await onCheck()) {
        setTreeSelectStatus(null)
        return true
      } else {
        setTreeSelectStatus('error')
        return false
      }
    } else {
      return true
    }
  }

  useEffect(() => {
    if (mediumData) {
      setCIndexes(mediumData.map((ele) => ele.index))
    }
    if (onStartIndex) {
      onStartIndex(startIndex)
    }
    return () => {
      setTreeSelectStatus(null)
    }
  }, [startIndex, mediumData])

  return (
    <>
      <Modal
        title={title}
        open={open}
        // bodyStyle={{ textAlign: 'center' }}
        zIndex={999}
        confirmLoading={confirmLoading}
        onOk={async () => {
          setTreeSelectStatus(null)
          const checked = await handleCheck()
          if (onOk && checked) {
            onOk()
          }
        }}
        onCancel={() => {
          onCancel()
          setTreeSelectStatus(null)
        }}
        {...props}
      >
        <Row justify="space-between">
          <Col span={rightExtra ? 18 : 24}>
            <Space direction="vertical" size="small" style={{ padding: 5 }}>
              {inputExtra && inputExtra}
              {runningState >= 1 && (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Row justify="space-between">
                      <Col>
                        <div style={{ marginBottom: 5, textAlign: 'left' }}>处理进度</div>
                      </Col>
                      <Col>
                        {runningState === 2 &&
                          (openDir ? (
                            <Button
                              type="link"
                              onClick={() => {
                                // window.medium.openProjectDir({
                                //     dirPath: openDir
                                // })
                              }}
                            >
                              已完成（打开项目文件夹查看）
                            </Button>
                          ) : percentDetail ? (
                            <div>已完成: {percentDetail}</div>
                          ) : (
                            <div>已完成</div>
                          ))}
                        {renderPercentDetail === undefined &&
                          (runningState === 1 || runningState === 3) &&
                          percentDetail &&
                          `正在处理 ${percentDetail}`}
                        {(runningState === 1 || runningState === 3) && renderPercentDetail}
                        {runningState === 4 && `${percentDetail ? percentDetail : '失败！'}`}
                      </Col>
                    </Row>
                    <Progress
                      percent={percent}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      status={runningState === 4 ? 'exception' : ''}
                    />
                  </div>
                </Space>
              )}
              {actionRender && actionRender}
            </Space>
          </Col>
          <Col span={6}>{rightExtra && rightExtra}</Col>
        </Row>
      </Modal>
    </>
  )
}

export default LoadingModal
