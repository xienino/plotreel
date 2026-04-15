import React, { useState, useRef, Suspense } from 'react'
import LoadingModal from './loadingModal'
import { Space, Select, Divider } from 'antd'

const DrawingModal = ({
  drawingModalOpen,
  setDrawingModalOpen,
  drawingState,
  setDrawingState,
  drawingPercentDetail,
  setDrawingSkipOverShot,
  setDrawingSelectModel,
  drawingSelectState,
  setSelectMediumRowKeys,
  drawingSelectModel,
  selectMediumRowKeys,
  mediumData,
  setEnableHr,
  projectId,
  drawingPercent,
  setDrawingChapterSelectTitles,
  setDrawingStartIndex,
  handleStartDrawingImage,
  processDrawingChapter,
}) => {
  return (
    <LoadingModal
      title="绘制配图"
      open={drawingModalOpen}
      isRepeatProcessing={true}
      onOk={() => handleStartDrawingImage()}
      onCancel={() => {
        // cancelTokenSource.cancel('请求被用户取消');
        setDrawingModalOpen(!drawingModalOpen)
        if (drawingState === 2 || drawingState === 4) {
          setDrawingState(0)
          console.log('2 走到获取绘制状态了：', drawingState)
          setDrawingChapterSelectTitles([])
        }
      }}
      renderPercentDetail={
        <Space size="large" split={<Divider type="vertical" />} wrap>
          <div>{drawingPercentDetail}</div>
          <div>章节: {processDrawingChapter}</div>
        </Space>
      }
      inputExtra={
        <div style={{ textAlign: 'left', width: 400 }}>
          <div style={{ marginBottom: 5 }}>镜头</div>
          <Select
            defaultValue="all"
            disabled={drawingState !== 0}
            style={{ width: '100%', marginBottom: 20 }}
            onChange={(value) => {
              if (value === 'all') {
                setDrawingSkipOverShot(false)
              } else if (value === 'pending') {
                setDrawingSkipOverShot(true)
              } else {
                setDrawingSkipOverShot(false)
              }
              setDrawingSelectModel(value)
            }}
            value={drawingSelectModel}
            options={[
              { value: 'all', label: '全部分镜' },
              { value: 'select', label: '选择分镜' },
              { value: 'pending', label: '未完成分镜' },
            ]}
          />
          {drawingSelectModel === 'select' && (
            <div>
              <div style={{ marginBottom: 5 }}>所选镜头</div>

              <Select
                disabled={drawingState !== 0}
                mode="multiple"
                allowClear
                status={drawingSelectState}
                style={{ width: '100%', marginBottom: 20 }}
                onChange={(value) => {
                  if (value.length > 0) {
                    // setWindowHeightSub(280)
                  } else {
                    // setWindowHeightSub(220)
                  }
                  setSelectMediumRowKeys(value)
                }}
                value={drawingSelectModel === 'select' ? selectMediumRowKeys : []}
                placeholder="请选择镜头"
                maxTagCount={5}
                options={mediumData.map((item, index) => {
                  return {
                    label: `${index} -----> ${item['source']}`,
                    value: item['index'],
                  }
                })}
              />
            </div>
          )}
        </div>
      }
      runningState={drawingState}
      projectId={projectId}
      percent={drawingPercent}
      percentDetail={drawingPercentDetail}
      onSelect={(titles) => setDrawingChapterSelectTitles(titles)}
      onStartIndex={(startIndex) => setDrawingStartIndex(startIndex)}
      closeIcon={drawingState === 3 ? null : true}
      {...(drawingState ? { footer: null } : {})}
    />
  )
}

export default DrawingModal
