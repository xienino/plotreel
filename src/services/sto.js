import { message } from 'antd'

let baseURL = `${process.env.REACT_APP_BASEAPI}/sto/c`

export async function getCurrencyLogs(data) {
  // 客户端-商城-查用户余额流水
  return window.axiosInstance.post('/account/currency/logs', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function getAccountInfo(data) {
  // 客户端-商城-查用户余额等信息
  return window.axiosInstance.post('/account/info', data, { baseURL }).catch((error) => {
    // message.error(`Error posting user data: ${error}`)
  })
}

export async function getCurrencyCoin(data) {
  // 客户端-商城-获取算币商品列表
  return window.axiosInstance.post('/plate/currency/coin', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function goodsBuy(data) {
  // 商品-人民币-购买商品-智绘
  return window.axiosInstance.post('/goods/buy', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}

export async function orderStatus(data) {
  // 商品-人民币-获取订单状态-智绘
  return window.axiosInstance.post('/order/status', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}
