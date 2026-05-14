import { message } from 'antd'

let baseURL = `${process.env.REACT_APP_BASEAPI}/pnt/api`
let baseURLDICT = `${process.env.REACT_APP_BASEAPI}/pnt/dict`
// let axiosInstance = null

export async function autoLogin(data) {
  // 客户端-用户-自动注册并登录接口
  return window.axiosInstance.post('/user/autoLogin', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getModelPage(data) {
  // 客户端-模型-获取plotreel云模型
  return window.axiosInstance.post('/model/page', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function extractRole(data) {
  // 提取角色
  return window.axiosInstance
    .post('/v1/paint/label/role/extract', data, { baseURL })
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function extractScene(data) {
  // 提取场景
  return window.axiosInstance
    .post('/v1/paint/label/scene/extract', data, { baseURL })
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function uploadLabel(data) {
  // 标签库-同步标签
  return window.axiosInstance.post('/label/upload', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function deleteLabel(data) {
  // 标签库-删除标签
  return window.axiosInstance.post('/label/delete', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getAllLabel(data) {
  // 标签库-获取标签列表
  return window.axiosInstance.post('/label/getAll', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getStyleList(data) {
  // 画风-获取列表
  return window.axiosInstance.post('/style/list', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function textSeparator(data) {
  // 文本分割-2.2.0
  return window.axiosInstance.post('/v1/text/separate', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getTimbres(data) {
  // 文本分割-2.2.0
  return window.axiosInstance
    .post('/item/timbres', data, { baseURL: baseURLDICT })
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function infoExtract(data, config) {
  // 分镜信息提取
  return window.axiosInstance.post('/v1/mediumshooting/info/extract', data, {
    baseURL,
    ...config,
  })
}

export async function image2video(data) {
  // 图生视频
  return window.axiosInstance.post('/v1/video/image2video', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}
export async function image2videoCheck(data) {
  // 图生视频（任务查询）
  return window.axiosInstance
    .get(`/v1/video/image2video?taskId=${data.taskId}`, { baseURL })
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function assemble4Generations(data) {
  // 提示词组装-2.2.0
  return window.axiosInstance.post('/v1/prompt/generations', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function generations(data, config) {
  // 绘图（ 标签绘图/分镜绘图 ）
  return window.axiosInstance.post('/v1/images/generations', data, { baseURL })
}
export async function generationsCheck(data, config) {
  // 绘图查询任务（ 标签绘图/分镜绘图 ）
  return window.axiosInstance
    .get(`/v1/images/generations?taskId=${data.taskId}`, { baseURL, ...config })
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}
export async function queueCheck(data, config) {
  // 绘图排队查询
  return window.axiosInstance
    .get(`/v1/images/queue/query?taskId=${data.taskId}`, { baseURL, ...config })
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}
export async function queueRemove(data, config) {
  // 取消排队
  return window.axiosInstance.post('/v1/images/queue/remove', data, { baseURL })
}

export async function fileUpload(data) {
  // 文件-文件上传
  return window.axiosInstance.post('/file/upload', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function upgradeLast(data) {
  try {
    window.axiosInstance.post('/upgrade/last', data, { baseURL }).then((res) => {
      console.log('✨upgradeLast res', res)
    })
  } catch (error) {
    message.error(`Error posting user data: ${error}`)
  }
  // 更新-获取安装包
  // return window.axiosInstance.post('/upgrade/last', data, { baseURL }).catch((error) => {
  //   message.error(`Error posting user data: ${error}`)
  // })
}
