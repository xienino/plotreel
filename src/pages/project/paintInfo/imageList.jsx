import React, { useEffect, useState } from 'react'
import { theme } from 'antd'
import { FolderOutlined } from '@ant-design/icons'
import api from '../../../services/project'
import { formatLocalAssets } from '../../../common/util'
import { STROYBOARD_STATE, STROYBOARD_STATE_LABEL } from '../../../assets/constant'
import { urlToBlobBase64 } from '../../../common/util'

const ImageItem = React.memo(function ({ image }) {
  const [imgSrc, setImgSrc] = useState('')
  const getImgSrc = async (image) => {
    const fileInfo = await urlToBlobBase64(formatLocalAssets(image.mUrl, 0.1))
    return fileInfo
  }
  useEffect(() => {
    getImgSrc(image).then((fileInfo) => {
      setImgSrc(fileInfo.base64)
    })
  }, [image])
  return (
    <img
      alt="加载中..."
      src={imgSrc}
      style={{
        width: 151,
        height: 92,
        objectFit: 'contain',
        WebkitUserSelect: 'none',
      }}
      referrerPolicy="no-referrer"
    />
  )
})
ImageItem.displayName = 'ImageItem'

const ImageList = React.memo(function ({
  images,
  projectId,
  cIndex,
  detail,
  setContentInset,
  repaintingCount,
}) {
  const handleOpenFolder = () => {
    // 打开图片所在文件夹
    api.openFolder({
      taskId: projectId,
      index: cIndex,
    })
  }

  const { token } = theme.useToken()

  return (
    <div className="imageListWrap">
      {/* <Button className='scrollArrow scrollArrowLeft' icon={<LeftOutlined />}></Button> */}
      <div className="imageList">
        {images?.toReversed().map((image, index) => {
          return (
            <div
              key={image?.mIndex}
              className="imageCard"
              style={{
                border:
                  image.mIndex === detail.chosenPic ? `1px solid ${token.colorPrimary}` : null,
              }}
              onClick={() => {
                setContentInset(image.mIndex, cIndex)
              }}
            >
              {image.isLoading ? (
                <>{STROYBOARD_STATE_LABEL[detail.state].title}</>
              ) : (
                <>
                  {image.mIndex === detail.chosenPic ? (
                    <div className="selectTag">当前选中</div>
                  ) : (
                    ''
                  )}
                  <div className="indexTag">{index + 1}</div>
                  <FolderOutlined className="folderTag" onClick={handleOpenFolder} />
                  {image && image.mFormat === '.png' && (
                    <>
                      <ImageItem image={image} />
                      <div className="imgTag">图片</div>
                    </>
                  )}
                  {image && image.mFormat === '.mp4' && (
                    <div
                      style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <video
                        className="videoCard"
                        src={formatLocalAssets(image.mUrl)}
                        width="150"
                        type="video/mp4"
                        style={{
                          WebkitUserSelect: 'none',
                        }}
                      >
                        视频
                      </video>
                      <div className="imgTag">视频</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
      {/* <Button className='scrollArrow' icon={<RightOutlined />}></Button> */}
    </div>
  )
})

ImageList.displayName = 'ImageList'
export default ImageList
