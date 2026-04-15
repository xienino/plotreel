import { message } from 'antd'

export async function getPaintingStyle() {
  // 获得画风及样例图
  return window.axiosInstance.post('/videomaker/aihost/getPaintingStyle', {}).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getBackgroundMusicList(data) {
  // 获取背景音乐
  return window.axiosInstance
    .post('/videomaker/aihost/getBackgroundMusicList', data)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function setProjectBackgroundMusic(data) {
  // 设置项目背景音乐
  return window.axiosInstance
    .post('/videomaker/aihost/setProjectBackgroundMusic', data)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function getMtk(data) {
  // 从本地读取mtk
  return window.axiosInstance.post('/videomaker/aihost/getMtk', data).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function setMtk(data) {
  // mtk保存本地
  return window.axiosInstance.post('/videomaker/aihost/setMtk', data).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function fileParse(data) {
  return window.axiosInstance.post('/videomaker/aihost/fileParse', data).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function uploadExampleImage(data) {
  // 上传分镜参考图
  return window.axiosInstance.post('/videomaker/aihost/uploadExampleImage', data).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function deleteExampleImage(data) {
  // 删除分镜参考图
  return window.axiosInstance.post('/videomaker/aihost/deleteExampleImage', data).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function createProject(params) {
  // 新建项目草稿
  return window.axiosInstance.post('/videomaker/aihost/createProject', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getProjectDetail(params) {
  // 获取项目细节
  return window.axiosInstance.post('/videomaker/aihost/getProjectDetail', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function contentExtract(params) {
  // 客户端-内容解析
  return window.axiosInstance.post('/videomaker/aihost/contentExtract', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function editRepaintingCount(params) {
  // 修改重绘数量
  return window.axiosInstance
    .post('/videomaker/aihost/editRepaintingCount', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function setFileContent(params) {
  // 项目信息保存
  return window.axiosInstance.post('/videomaker/aihost/setFileContent', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function RefreshProjectList(params) {
  // 获得草稿项目预览
  return window.axiosInstance.post('/videomaker/aihost/getProjectList', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function analyzeScence(params) {
  // 分析场景
  return window.axiosInstance.post('/videomaker/aihost/analyzeScence', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function analyzeAndGenimage(params) {
  // 分析场景、绘图合并接口
  return window.axiosInstance
    .post('/videomaker/aihost/analyzeAndGenimage', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function stopTaskAnalyzeAndGenimage(params) {
  // 停止分析场景、绘图
  return window.axiosInstance
    .post('/videomaker/aihost/stopTaskAnalyzeAndGenimage', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function getAnalyzeAndGenimageProgress(params) {
  // 分析场景、绘图进度查询
  return window.axiosInstance
    .post('/videomaker/aihost/getAnalyzeAndGenimageProgress', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function getVoiceList(params) {
  // 获取音色列表
  return window.axiosInstance.post('/videomaker/aihost/getVoiceList', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function generateAudio(params) {
  // 生成场景音频
  return window.axiosInstance.post('/videomaker/aihost/generateAudio', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function generateImage(params) {
  // 生成场景图片
  return window.axiosInstance.post('/videomaker/aihost/generateImage', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getPicByIndexes(params) {
  // 获得指定分镜已绘制的图片
  return window.axiosInstance.post('/videomaker/aihost/getPicByIndexes', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function makeVideo(params) {
  // 合成视频
  return window.axiosInstance.post('/videomaker/aihost/makeVideo', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function saveStoryboardAudio(params) {
  // 分镜音频保存本地
  return window.axiosInstance
    .post('/videomaker/aihost/saveStoryboardAudio', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function exportJianyingDraft(params) {
  // 导出剪映草稿
  return window.axiosInstance.post('/videomaker/aihost/exportJianyingDraft', params)
}

export async function copyVideo(params) {
  // 下载视频（复制到指定路径）
  return window.axiosInstance.post('/videomaker/aihost/copyVideo', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getMakeVideoProgress(params) {
  // 获取视频合成进度
  return window.axiosInstance
    .post('/videomaker/aihost/getMakeVideoProgress', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function getExportProgress(params) {
  // 获取导出剪映进度
  return window.axiosInstance
    .post('/videomaker/aihost/getExportProgress', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function seekVideo(params) {
  // 查找指定作品视频
  return window.axiosInstance.post('/videomaker/aihost/seekVideo', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getAnscenceProcess(params) {
  // 获取分析场景进程、结果
  return window.axiosInstance
    .post('/videomaker/aihost/getAnscenceProcess', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function getGenImageProcess(params) {
  return window.axiosInstance
    .post('/videomaker/aihost/getGenImageProcess', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function deleteMediumShooting(params) {
  // 删除分镜
  return window.axiosInstance
    .post('/videomaker/aihost/deleteMediumShooting', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function addMediumShooting(params) {
  // 添加分镜
  return window.axiosInstance
    .post('/videomaker/aihost/addMediumShooting', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function deleteProject(params) {
  // 删除本地保存的项目
  return window.axiosInstance.post('/videomaker/aihost/deleteProject', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function deleteVideo(params) {
  // 删除视频成品（不删除草稿）
  return window.axiosInstance.post('/videomaker/aihost/deleteVideo', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function deleteJianyingDraft(params) {
  // 重新编辑-删除作品栏里剪映部分
  return window.axiosInstance
    .post('/videomaker/aihost/deleteJianyingDraft', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function editProjectBasicInformation(params) {
  // 修改项目基础信息（名称、类型、尺寸）
  return window.axiosInstance
    .post('/videomaker/aihost/editProjectBasicInformation', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function getLabel(params) {
  // 获得标签
  return window.axiosInstance.post('/videomaker/aihost/getLabel', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function searchLabel(params) {
  // 查找标签
  return window.axiosInstance.post('/videomaker/aihost/searchLabel', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function translators(params) {
  // 翻译
  return window.axiosInstance.post('/videomaker/aihost/translators', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function setLabel(params) {
  // 设置标签
  return window.axiosInstance.post('/videomaker/aihost/setLabel', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function delLabel(params) {
  // 删除标签
  return window.axiosInstance.post('/videomaker/aihost/delLabel', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getDefaultPrompt(params) {
  // 获取预设提示词
  return window.axiosInstance.post('/videomaker/aihost/getDefaultPrompt', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function generateLabelImage(params) {
  // 标签图片绘制
  return window.axiosInstance
    .post('/videomaker/aihost/generateLabelImage', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function findLabelImage(params) {
  // 标签图片查询
  return window.axiosInstance.post('/videomaker/aihost/findLabelImage', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getCloudModelList(params) {
  // 获得智绘云可选模型列表
  return window.axiosInstance
    .post('/videomaker/aihost/getCloudModelList', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function getSdConfig(params) {
  // 获得sd绘画配置
  return window.axiosInstance.post('/videomaker/aihost/getSdConfig', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getTranslateConfig(params) {
  // 客户端-腾讯翻译秘钥配置信息
  return window.axiosInstance
    .post('/videomaker/aihost/getTranslateConfig', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function saveTranslateSecret(params) {
  // 客户端-腾讯翻译秘钥配置、检验
  return window.axiosInstance
    .post('/videomaker/aihost/saveTranslateSecret', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function getShootingPath(params) {
  // 获得分镜素材路径
  return window.axiosInstance.post('/videomaker/aihost/getShootingPath', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getJianyingConfig(params) {
  // 剪映信息获取
  return window.axiosInstance
    .post('/videomaker/aihost/getJianyingConfig', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function saveJianyingAddress(params) {
  // 剪映配置、检验
  return window.axiosInstance
    .post('/videomaker/aihost/saveJianyingAddress', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function setSdConfig(params) {
  // 修改sd绘画配置
  return window.axiosInstance.post('/videomaker/aihost/setSdConfig', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}
export async function changeLocalSdApiState(params) {
  // 本地绘画sd/flux选择
  return window.axiosInstance
    .post('/videomaker/aihost/changeLocalSdApiState', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function getVideoList(params) {
  // 获得作品视频列表
  return window.axiosInstance.post('/videomaker/aihost/getVideoList', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function extractRoleLabels(params) {
  // 提取人物场景标签 废弃待删
  return window.axiosInstance
    .post('/videomaker/aihost/extractRoleLabels', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function stopAnalyzeScence(params) {
  // 中止场景分析任务
  return window.axiosInstance
    .post('/videomaker/aihost/stopAnalyzeScence', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function stopGenerateImage(params) {
  // 中止绘图任务
  return window.axiosInstance
    .post('/videomaker/aihost/stopGenerateImage', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function openFolder(params) {
  // 打开本地文件夹
  return window.axiosInstance.post('/videomaker/aihost/openFolder', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function saveLabelImage(params) {
  // 标签图片保存本地
  return window.axiosInstance.post('/videomaker/aihost/saveLabelImage', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function saveStoryboardImage(params) {
  // 分镜图片保存本地
  return window.axiosInstance
    .post('/videomaker/aihost/saveStoryboardImage', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function saveStoryboardVideo(params) {
  // 分镜视频保存本地
  return window.axiosInstance
    .post('/videomaker/aihost/saveStoryboardVideo', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}

export async function getPaintingApiState(params) {
  // 获取绘画工具连接情况
  return window.axiosInstance
    .post('/videomaker/aihost/getPaintingApiState', params)
    .catch((error) => {
      message.error(`Error posting user data: ${error}`)
    })
}
export async function connectSd(params) {
  // 验证、连接SD
  return window.axiosInstance.post('/videomaker/aihost/connectSd', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}
export async function setCloudModel(params) {
  // 连接智慧云绘画模型
  return window.axiosInstance.post('/videomaker/aihost/setCloudModel', params).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function generateSdImageSynchronous(params, config) {
  // 调用本地sd进行画图（同步接口）
  return window.axiosInstance.post('/videomaker/aihost/generateSdImageSynchronous', params, config)
}

export async function updater(params) {
  // 软件更新
  return window.axiosInstance.post('/videomaker/aihost/updater', params)
}

export async function updaterCheck(params) {
  // 软件更新检查
  return window.axiosInstance.post('/videomaker/aihost/updaterCheck', params)
}

export async function checkUpdateProgress(params) {
  // 软件更新进度查询
  return window.axiosInstance.get('/videomaker/aihost/checkUpdateProgress', params)
}
