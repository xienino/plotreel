import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DeleteOutlined,
  HomeOutlined,
  TagOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import {
  Popconfirm,
  Space,
  Button,
  Image,
  message,
  theme,
  Tooltip,
  Spin,
  Menu,
  Tabs,
  Modal,
  Pagination,
  Input,
} from 'antd'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import api from '../../services/project'
import { pictureSizeList, SUCCESS_CODE, LOGOUT_CODE } from '../../assets/constant'
import { formatLocalAssets } from '../../common/util'
import './project.sass'

const DraftDetail = ({ item, handleDeleteProject, canplay }) => {
  const [select, setSelect] = useState(false)
  const [showPlayBtn, setShowPlayBtn] = useState(false)
  const [imagePath, setImagePath] = useState()
  const [confirmClick, setConfirmClick] = useState(false)
  const [text, setText] = useState()
  const [composeState, setComposeState] = useState(false) // 合成中弹窗是否展示
  const [videoBase64, setVideoBase64] = useState() // 已合成视频的base64
  const [activeName, setActiveName] = useState()
  const [isShowInput, setIsShowInput] = useState(false)
  const [sizeBadge, setSizeBadge] = useState()
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false) // 我的作品删除时的二次确认弹窗
  const inputRef = useRef()
  const videoRef = useRef()

  const navigate = useNavigate()

  const onMouseEnter = () => {
    setSelect(true)
    if (canplay) {
      setShowPlayBtn(true)
    }
  }

  const onMouseLeave = () => {
    setSelect(false)
    if (canplay) {
      setShowPlayBtn(false)
    }
  }

  const onCancel = () => {
    setComposeState(false)
    videoRef.current.pause()
  }

  const onClickDetail = (e) => {
    if (typeof e?.target?.className == 'string' && e?.target?.className?.indexOf('ant-') > -1) {
      return
    }
    if (canplay) {
      if (!item.videoUrl) {
        message.warning('请前往剪映草稿操作')
      } else {
        setComposeState(true)
      }
    } else {
      navigate(`detail/base/${item.raw_file_id}`)
    }
  }
  const saveNewName = async () => {
    if (activeName === item.title) {
      inputRef.current?.blur()
      setIsShowInput(false)
      return
    }
    const result = await api.editProjectBasicInformation({
      taskId: item.taskId || item.raw_file_id,
      newName: activeName,
    })
    if (result.data.resCode === SUCCESS_CODE) {
      message.success('名称修改成功')
      inputRef.current?.blur()
    } else {
      message.success('名称修改失败，请联系管理员查看原因')
      setActiveName(item.title)
    }
    setIsShowInput(false)
  }

  const downloadVideo = async () => {
    const res = await api.copyVideo({ taskId: item.taskId })
    if (res?.data?.resCode !== SUCCESS_CODE) {
      message.error(res?.data?.resMsg?.msgText || '下载失败')
    } else {
      message.success('下载成功，已保存至“此电脑/下载”目录下')
    }
  }

  const copyAndOpen = async () => {
    // 复制并打开
    // todo 复制并打开接口
  }
  const reEdit = async () => {
    if (!item.videoUrl) {
      // 剪映
      await api.deleteJianyingDraft({
        taskId: item.taskId,
      })
    } else {
      // 本地
      await api.deleteVideo({
        taskId: item.taskId,
      })
    }
    navigate(`detail/paint/${item.taskId}`)
  }

  useEffect(() => {
    const target = pictureSizeList.find((i) => {
      return i.value === `${item.width}*${item.height}`
    })
    setSizeBadge(target?.shortLabel)
  }, [item])

  useEffect(() => {
    setActiveName(item.title)
    const maxLength = 12
    const originalText = item.title
    const ellipsis = '...'
    if (originalText.length > maxLength) {
      const halfLength = Math.floor((maxLength - ellipsis.length) / 2)
      const truncatedText =
        originalText.substring(0, halfLength) +
        ellipsis +
        originalText.substring(originalText.length - halfLength)
      setText(truncatedText)
    } else {
      setText(item.title)
    }
    if (canplay) {
      setVideoBase64(formatLocalAssets(item.videoUrl))
    }
  }, [item.title])

  return (
    <div style={{ cursor: 'default', userSelect: 'none' }}>
      <Space direction="vertical">
        <div
          className="draftDetailCover"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClickDetail}
        >
          <img
            alt=""
            src={
              item?.imageUrl
                ? formatLocalAssets(item?.imageUrl, 0.2)
                : formatLocalAssets(item?.coverUrl, 0.2)
            }
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
          {(select || confirmClick) && canplay && (
            <Popconfirm
              showCancel={false}
              placement="bottom"
              icon={<></>}
              description={
                <div
                  style={{
                    alignItems: 'flex-end',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Button
                    type="primary"
                    size="small"
                    style={{ marginBottom: 4, width: 64 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      copyAndOpen()
                    }}
                  >
                    复制并打开
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    style={{ marginBottom: 4, width: 64 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      reEdit()
                    }}
                  >
                    重新编辑
                  </Button>
                  {item.videoUrl && (
                    <Button
                      style={{ width: 64 }}
                      type="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadVideo()
                      }}
                    >
                      下载
                    </Button>
                  )}
                </div>
              }
              onConfirm={(e) => {
                e.stopPropagation()
                // handleDeleteProject(canplay ? item.taskId : item.raw_file_id)
                setDeleteConfirmModal(true)
              }}
              onCancel={(event) => {
                event.stopPropagation()
              }}
              onClick={(event) => {
                event.stopPropagation()
                setConfirmClick(true)
              }}
              onBlur={() => {
                setConfirmClick(false)
              }}
              okText="删除"
              okButtonProps={{ style: { width: '64px', marginLeft: 0 } }}
            >
              <Button
                style={{
                  position: 'absolute',
                  bottom: 3,
                  right: 3,
                  opacity: 0.7,
                  border: '0px',
                }}
                size="small"
                shape="circle"
                icon={<UnorderedListOutlined />}
              />
            </Popconfirm>
          )}
          {(select || confirmClick) && !canplay && (
            <Popconfirm
              title="删除项目"
              description="是否要删除此项目，删除后将无法再恢复"
              onConfirm={(event) => {
                handleDeleteProject(item.raw_file_id)
                event.stopPropagation()
              }}
              onCancel={(event) => {
                event.stopPropagation()
              }}
              onClick={(event) => {
                event.stopPropagation()
                setConfirmClick(true)
              }}
              onBlur={() => {
                setConfirmClick(false)
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button
                style={{
                  position: 'absolute',
                  bottom: 3,
                  right: 3,
                  opacity: 0.7,
                  border: '0px',
                }}
                size="small"
                shape="circle"
                icon={<DeleteOutlined key="delete" />}
              />
            </Popconfirm>
          )}
          {canplay && showPlayBtn && (
            <PlayCircleOutlined
              style={{ cursor: 'pointer', fontSize: '30px', position: 'absolute' }}
            />
          )}
          {sizeBadge && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                color: '#5748B0',
                background: '#A08EEA',
                borderRadius: 2,
                width: 40,
                height: 16,
                lineHeight: '16px',
              }}
            >
              {sizeBadge}
            </div>
          )}
        </div>
        <div style={{ padding: '0px 3px' }}>
          <div className="flex-between">
            <div
              style={{
                fontWeight: 'bold',
                color: '#E8E8E8',
                whiteSpace: 'nowrap',
                fontSize: 12,
                cursor: 'pointer',
                width: 120,
              }}
            >
              <Input
                value={activeName}
                ref={inputRef}
                style={{
                  border: isShowInput ? '' : '1px solid transparent',
                  paddingLeft: 0,
                }}
                onChange={(e) => setActiveName(e.target.value)}
                onPressEnter={() => {
                  inputRef.current?.blur()
                }}
                onClick={() => {
                  setIsShowInput(true)
                }}
                onBlur={saveNewName}
              />
            </div>
            {canplay && (
              <div
                style={{
                  background: '#B2B5C3',
                  color: '#5748B0',
                  borderRadius: 2,
                  width: 40,
                  textAlign: 'center',
                  height: 16,
                  lineHeight: '16px',
                }}
              >
                {item.videoUrl ? '本地' : '剪映'}
              </div>
            )}
          </div>
          <div style={{ color: '#59594D', fontSize: 11 }}>
            更新时间：{dayjs(item.latest_time * 1000).format('YYYY-MM-DD')}
          </div>
        </div>
      </Space>
      <Modal
        title=""
        open={composeState}
        zIndex={999}
        onCancel={onCancel}
        centered
        width={820}
        footer={
          <div>
            <Button onClick={onCancel} style={{ marginRight: 10 }}>
              取消
            </Button>
            <Button type="primary" style={{ marginRight: 10 }} onClick={downloadVideo}>
              下载
            </Button>
          </div>
        }
      >
        <div className="composeModal">
          <video
            src={videoBase64}
            width="500"
            type="video/mp4"
            controls
            ref={videoRef}
            style={{ maxHeight: '400px', maxWidth: '100%' }}
            controlsList="nodownload"
          ></video>
        </div>
      </Modal>
      <Modal
        title="提示"
        open={deleteConfirmModal}
        onOk={() => {
          handleDeleteProject(canplay ? item.taskId : item.raw_file_id)
        }}
        onCancel={() => setDeleteConfirmModal(false)}
        okText="确认"
        cancelText="取消"
        zIndex={999}
        centered
      >
        <p>是否要删除此作品，删除后将无法再恢复</p>
      </Modal>
    </div>
  )
}

const DraftCreate = ({ newProject }) => {
  return (
    <div className="flex-column-center draftCreate" onClick={newProject}>
      <PlusOutlined className="flex-center plusIcon" />
      创建作品
    </div>
  )
}

const ListProject = () => {
  const navigate = useNavigate()
  const [projectList, setProjectList] = useState([]) // 视频作品列表
  const [draftList, setDraftList] = useState([])
  const [draftLoading, setDraftLoading] = useState(false)
  const [projectLoading, setProjectLoading] = useState(false)
  const [manualRefresh, setManualRefresh] = useState(false)
  const [windowHeight, setWindowHeight] = useState(window.innerHeight)
  const [videoListPageNum, setVideoListPageNum] = useState(1) // 作品视频列表页码
  const [draftListPageNum, setDraftListPageNum] = useState(1) // 草稿列表页码
  const [videoListTotal, setVideoListTotal] = useState() // 作品列表total
  const [draftListTotal, setDraftListTotal] = useState() // 草稿列表total
  const [currentTab, setCurrentTab] = useState('1')

  const { token } = theme.useToken()
  const initData = useRef()

  const newProject = async () => {
    // navigate(`detail/base/123`) // mock
    const result = await api.createProject({})
    if (result?.data && result?.data.resCode == SUCCESS_CODE) {
      navigate(`detail/base/${result?.data?.taskId}`)
    } else {
      message.error('创建作品出现错误，请联系管理员或稍后重试')
    }
  }

  const handleResize = () => {
    setWindowHeight(window.innerHeight)
  }

  const handleDeleteVideo = async (taskId) => {
    const { data } = await api.deleteProject({ taskId })
    if (data.resCode === SUCCESS_CODE) {
      await initVideoList()
      message.success('删除作品成功')
    } else {
      message.error(data?.resMsg?.msgText)
    }
  }

  const handleDeleteProject = async (projectId) => {
    const params = {
      taskId: projectId,
    }
    const response = await api.deleteProject(params)
    if (response?.data && response.data.resCode === SUCCESS_CODE) {
      message.success('删除草稿成功')
      initDraftList()
    } else {
      message.error(response?.data?.resMsg?.msgText)
    }
  }

  const changeTab = (value) => {
    setCurrentTab(value)
  }

  const changeVideoListPageNum = (value) => {
    setProjectLoading(true)
    setVideoListPageNum(value)
    initVideoList(value)
  }

  const changeDraftListPageNum = (value) => {
    setDraftLoading(true)
    setDraftListPageNum(value)
    initDraftList(value)
  }

  const initVideoList = async (newPageNum) => {
    const { data } =
      (await api.getVideoList({
        pageNum: newPageNum || videoListPageNum,
        pageSize: 30,
      })) || {}
    if (data.resCode === LOGOUT_CODE) return
    if (data?.videoList) {
      setProjectList(data.videoList)
      setVideoListTotal(data.totalNum)
    } else {
      message.error('获取作品列表失败')
      setProjectList([])
    }
    setProjectLoading(false)
  }
  const initDraftList = async (newPageNum) => {
    const { data } =
      (await api.RefreshProjectList({
        pageNum: newPageNum || draftListPageNum,
        pageSize: 30,
      })) || {}
    if (data?.resCode === LOGOUT_CODE) return
    if (data?.resCode === SUCCESS_CODE) {
      setDraftList(data.resData)
      initData.current = true
      setDraftListTotal(data.totalNum)
    } else {
      setDraftLoading(false)
      message.error('获取草稿列表失败')
      setDraftList([])
    }
    setDraftLoading(false)
  }

  useEffect(() => {
    if (initData.current) {
      return
    }

    // 作品列表初始化
    setProjectLoading(true)
    initVideoList()

    // 草稿列表初始化
    setDraftLoading(true)
    window.addEventListener('resize', handleResize)
    initDraftList()

    initData.current = true

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <div className="homePage">
        <div className="homePageLeft">
          <Menu
            defaultSelectedKeys={['1']}
            mode="inline"
            items={[
              { key: '1', icon: <HomeOutlined />, label: '首页' },
              { key: '2', icon: <TagOutlined />, label: '标签库', disabled: true },
            ]}
          />
        </div>
        <div className="homePageRight">
          <div className="flex-center createBlock" onClick={newProject}>
            <div className="plusIconWrap">
              <PlusOutlined />
            </div>
            创建作品
          </div>

          <Tabs
            defaultActiveKey="1"
            className="listContent"
            onChange={changeTab}
            items={[
              {
                label: '我的作品',
                key: '1',
                children: (
                  <>
                    {
                      <Spin spinning={projectLoading} size="large">
                        <Space size="large" wrap>
                          <DraftCreate newProject={newProject}></DraftCreate>
                          {projectList.map((item) => (
                            <DraftDetail
                              item={item}
                              key={item.taskId}
                              canplay={true}
                              handleDeleteProject={handleDeleteVideo}
                            />
                          ))}
                        </Space>
                      </Spin>
                    }
                  </>
                ),
              },
              {
                label: '草稿箱',
                key: '2',
                children: (
                  <>
                    {
                      <Spin spinning={draftLoading} size="large" style={{ minHeight: 100 }}>
                        <Space size="large" wrap>
                          {draftList.map((item) => (
                            <DraftDetail
                              item={item}
                              handleDeleteProject={handleDeleteProject}
                              key={item.id}
                              canplay={false}
                            />
                          ))}
                        </Space>
                      </Spin>
                    }
                  </>
                ),
              },
            ]}
          />
          {currentTab === '1' && (
            <Pagination
              defaultCurrent={videoListPageNum}
              total={videoListTotal}
              className="listPagination"
              onChange={changeVideoListPageNum}
              hideOnSinglePage={true}
              showSizeChanger={false}
              pageSize={40}
            />
          )}
          {currentTab === '2' && (
            <Pagination
              defaultCurrent={draftListPageNum}
              total={draftListTotal}
              className="listPagination"
              onChange={changeDraftListPageNum}
              hideOnSinglePage={true}
              showSizeChanger={false}
              pageSize={40}
            />
          )}
        </div>
      </div>
    </>
  )
}
export default ListProject
