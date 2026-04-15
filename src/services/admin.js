import { message } from 'antd'

let baseURL = `${process.env.REACT_APP_BASEAPI}/adm/api`

export async function doLogin(data) {
  // 用户登录
  return window.axiosInstance.post('/user/login/doLogin', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function resetPwd(data) {
  // 重置密码（验证码）
  return window.axiosInstance.post('/user/resetPwd', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function loginByVcode(data) {
  // 验证码登录
  return window.axiosInstance.post('/user/loginByVcode', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function sendVerifyCode(data) {
  // 获取验证码
  return window.axiosInstance.post('/vcode/sendVerifyCode', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function doLogout(data) {
  // 用户登出
  return window.axiosInstance.post('/user/login/doLogout', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getUser(data) {
  // 获取用户信息
  return window.axiosInstance.post('/user/getUser', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}
