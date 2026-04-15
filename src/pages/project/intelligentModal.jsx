import React, { useState, useRef, Suspense } from 'react'
import LoadingModal from './loadingModal'
import {
  message,
  Layout,
  Button,
  Space,
  Select,
  Divider,
  Image,
  Row,
  Col,
  Spin,
  theme,
  Steps,
  Alert,
  Checkbox,
  Popconfirm,
  Modal,
  Switch,
  ConfigProvider,
  Popover,
  Tooltip,
  Radio,
  Badge,
} from 'antd'

const IntelligentModal = ({
  intelligentModalOpen,
  manualKeywordCDisabled,
  mediumData,
  setIntelligentModalOpen,
  intelligentState,
  setIntelligentState,
  keywordPercentDetail,
  setInferenceModel,
  inferenceModel,
  intelligentSelectState, // 下拉选择框校验状态
  setSelectMediumRowKeys,
  selectMediumRowKeys,
  projectId,
  intelligentPercent,
  handleStartIntelligentSegmentation,
}) => {
  const [autoExtractLabelActivate, setAutoExtractLabelActivate] = useState(false)

  return (
    <LoadingModal
      title="智能推理"
      open={intelligentModalOpen}
      isRepeatProcessing={true}
      onOk={() => handleStartIntelligentSegmentation(autoExtractLabelActivate)}
      confirmLoading={manualKeywordCDisabled}
      mediumData={mediumData}
      onCancel={() => {
        // cancelTokenSource.cancel('请求被用户取消');
        setIntelligentModalOpen(!intelligentModalOpen)
        if (intelligentState === 2 || intelligentState === 4) {
          setIntelligentState(0)
        }
      }}
      renderPercentDetail={
        intelligentState === 3 ? (
          <Space size="large" split={<Divider type="vertical" />} wrap>
            <div>{keywordPercentDetail}</div>
          </Space>
        ) : (
          <Space size="large" split={<Divider type="vertical" />} wrap>
            <div>正在进行对话分割</div>
          </Space>
        )
      }
      inputExtra={
        <div style={{ textAlign: 'left', width: 400 }}>
          <div style={{ marginBottom: 5 }}>镜头</div>
          <Select
            defaultValue="all"
            disabled={intelligentState !== 0}
            style={{ width: '100%', marginBottom: 20 }}
            onChange={(value) => {
              setInferenceModel(value)
            }}
            value={inferenceModel}
            options={[
              { value: 'all', label: '全部分镜' },
              { value: 'select', label: '选择分镜' },
              { value: 'pending', label: '未完成分镜' },
            ]}
          />
          {inferenceModel === 'select' && (
            <div>
              <div style={{ marginBottom: 5 }}>所选镜头</div>

              <Select
                disabled={intelligentState !== 0}
                mode="multiple"
                allowClear
                status={intelligentSelectState}
                style={{ width: '100%', marginBottom: 20 }}
                onChange={(value) => {
                  console.log('mediumData: ', mediumData)
                  console.log('selectMediumRowKeys: ', selectMediumRowKeys)
                  if (value.length > 0) {
                    // setWindowHeightSub(280)
                  } else {
                    // setWindowHeightSub(220)
                  }
                  setSelectMediumRowKeys(value)
                }}
                value={inferenceModel === 'select' ? selectMediumRowKeys : []}
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
          {
            // <Row justify="space-between" align="stretch" style={{ marginTop: 10 }}>
            //     <Col>
            //         <Space>
            //             自动提取本章角色：
            //             <Switch
            //                 disabled={intelligentState !== 0}
            //                 checked={autoExtractLabelActivate}
            //                 onChange={(value) => {
            //                     setAutoExtractLabelActivate(value)
            //                 }}
            //             />
            //         </Space>
            //     </Col>
            // </Row>
          }
        </div>
      }
      runningState={intelligentState}
      projectId={projectId}
      percent={intelligentPercent}
      percentDetail={keywordPercentDetail}
      closeIcon={intelligentState === 3 ? null : true}
      {...(intelligentState ? { footer: null } : {})}

      // actionRender={
      //     (intelligentState === 1 || intelligentState === 3) &&
      //     <Popconfirm
      //         // placement="bottom"
      //         title="取消推理"
      //         description="当任务长时间没有任何响应时可以重新开始，确定要如此做吗?"
      //         onConfirm={async () => {
      //             console.log('取消推理')
      //         }}
      //         okText="确定"
      //         cancelText="取消"
      //     >
      //         <Button
      //             type="primary"
      //             block
      //         >取消推理</Button>
      //     </Popconfirm>
      // }
    />
  )
}

export default IntelligentModal
