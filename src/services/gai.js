import { message } from 'antd'

let baseURL = `${process.env.REACT_APP_BASEAPI}/gai/api`

export async function translation(data) {
  // 腾讯翻译-文本翻译
  return window.axiosInstance.post('/tmt/txt/translation', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function genAudio(data) {
  // 生成音频 语音-阿里云tts
  return window.axiosInstance.post('/ali/v1/tts', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}
