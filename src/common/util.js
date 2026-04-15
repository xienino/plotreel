import api from '../services/project'
import { SUCCESS_CODE, DRAW_STATE } from '../assets/constant'

export function urlToBlobBase64(imgUrl) {
  return new Promise((resolve, reject) => {
    window.URL = window.URL || window.webkitURL
    var xhr = new XMLHttpRequest()
    xhr.open('get', imgUrl, true)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      if (Number(this.status) === 200) {
        var blob = this.response
        let oFileReader = new FileReader()
        oFileReader.onloadend = function (e) {
          resolve({ blob, base64: e.target.result })
        }
        oFileReader.readAsDataURL(blob)
      } else {
        reject(new Error('异常'))
      }
    }
    xhr.send()
    xhr.onerror = () => {
      reject(new Error('异常'))
    }
  })
}
// base64图转文件流
export function dataURLtoFile(dataurl, filename = 'example.png') {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export function formatLocalAssets(imgUrl, quality = 1) {
  return imgUrl?.indexOf('http://127.0.0.1:47845') > -1
    ? imgUrl?.replace('http://127.0.0.1:47845', process.env.REACT_APP_ENDPOINT) +
        `?quality=${quality}`
    : imgUrl
}
function isLocalAssets(imgUrl) {
  return imgUrl?.indexOf('http://127.0.0.1:47845') > -1 ? true : false
}

export async function saveLabel(
  labelId,
  label,
  type,
  imageData,
  projectName,
  taskId,
  userDefined = false,
) {
  let localImgRes = {}
  if (!isLocalAssets(imageData)) {
    localImgRes = await api.saveLabelImage({
      // 步骤 4： 标签图片保存本地
      taskId,
      imageList: [
        {
          format: 'url',
          imageData,
        },
      ],
      label: {
        labelId,
        label: { prompt: label.prompt },
      },
    })
    imageData = localImgRes?.data?.resData?.imageList[0]?.imageUrl
  }
  const imageName = imageData.split('/').pop()
  await api.setLabel({
    // 步骤 5： 保存标签信息
    labelId,
    label: {
      title: projectName, // 作品标题
      names: label.names, // 标签名字（可以有别名所以是array）
      type,
      prompt: label.prompt,
      lora: [],
      userDefined, // 是否用户自定义
      chosenImageName: imageName, // 被选中的图片素材的名字
    },
    taskId,
  })
  return {
    imageUrl: imageData,
    imageName,
  }
}

const drawingImageTimerMap = {}

export async function getLabelImage(english, type, projectInfo, configInfo) {
  const { style, pictureSize, taskId } = projectInfo
  const { model, drawingModel } = configInfo
  const res = await api.assemble4Generations({
    // 步骤 2： 提示词组装
    prompt: '',
    style,
    lens: 0, // 镜头要求 标签绘图固定为0,
    labels: [
      {
        label: {
          type,
          prompt: { english },
        },
      },
    ],
  })

  if (res?.data?.resData?.prompt) {
    const [width, height] = pictureSize.split('*')
    if (drawingModel === 'custom') {
      const imgRes = await api.generateSdImageSynchronous({
        taskId,
        prompt: res?.data?.resData?.prompt,
        width: Number(width),
        height: Number(height),
        repaintingCount: 1,
      })
      const fileInfo = dataURLtoFile(`data:image/png;base64,${imgRes?.data?.resData?.imageData[0]}`)
      const formdata = new FormData()
      formdata.append('file', fileInfo)
      const fileUploadRes = await api.fileUpload(formdata)
      return {
        imageData: fileUploadRes?.data?.resData,
        format: 'url',
      }
    } else {
      const genRes = await api.generations({
        // 步骤 3： 标签绘图
        prompt: res?.data?.resData?.prompt,
        width: Number(width),
        height: Number(height),
        image: '',
        model,
      })
      if (genRes?.data?.resCode === SUCCESS_CODE) {
        const imgList = await setSyncDrawInterval(genRes?.data?.resData?.taskId, Math.random())
        return {
          format: 'url',
          imageData: imgList,
        }
      } else {
        return {
          format: 'url',
          imageData: '',
          msgCode: genRes?.data?.resMsg ? Number(genRes?.data?.resMsg[0].msgCode) : '',
        }
      }
    }
  }
  return {
    format: 'url',
    imageData: '',
  }
}

const setSyncDrawInterval = (taskId, key) => {
  return new Promise((resole, reject) => {
    drawingImageProcess(taskId, key)
    if (drawingImageTimerMap[key]) {
      clearInterval(drawingImageTimerMap[key])
    }
    const id = setInterval(async () => {
      const imgList = await drawingImageProcess(taskId, key)
      if (imgList) {
        resole(imgList)
      }
    }, 5000)
    drawingImageTimerMap[key] = id
  })
}

const drawingImageProcess = async (taskId, key) => {
  const res = await api.generationsCheck({ taskId })
  const data = res?.data || {}
  let imgList = []
  let isDone = false
  if (data?.resCode === SUCCESS_CODE) {
    switch (data?.resData?.status) {
      case DRAW_STATE.DONE:
        isDone = true
        imgList = data?.resData?.imageList.map((i) => i.url)
        break
      case DRAW_STATE.ERROR:
        isDone = true
        break
      default:
        break
    }
  } else {
    isDone = true
  }
  if (isDone) {
    clearInterval(drawingImageTimerMap[key])
    delete drawingImageTimerMap[key]
    return imgList
  }
}

// const compressImage = async (mUrl) => {
//   const file = await urlToBlobBase64(formatLocalAssets(mUrl))
//   var options = {
//     quality: 0.5,
//     success: function (result) {
//       console.log('大图压缩后： ', result)
//       setTargetImgUrl(URL.createObjectURL(result))
//     },
//     error: function (err) {
//       console.log(err.message)
//     },
//   }
//   new Compressor(dataURLtoFile(file.base64), options)
// }
