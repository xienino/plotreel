import React, { useState, useRef, useEffect } from 'react'
import { message, Modal } from 'antd'
import { WechatOutlined, CodeSandboxOutlined } from '@ant-design/icons'
import api from '../../services/project'
import './recharge.sass'
import moment from 'moment'
import qrcodeClose from '../../assets/qrcodeClose.png'
import { SUCCESS_CODE } from '../../assets/constant'
import ProtocolModal from './protocolModal'

const Recharge = ({ setPayModal, updateAccountInfo, expireTimer, statusTimer, sdTemplateOptionsCloud }) => {
  const [modal, contextHolder] = Modal.useModal()
  const [currencyCoinList, setCurrencyCoinList] = useState([]) // 商品列表
  const [selectGoodsId, setSelectGoodsId] = useState()
  const selectGoodsIdRef = useRef()
  const [amount, setAmount] = useState() // 应付金额
  const [buyInfo, setBuyInfo] = useState() // 商品信息 goodsId, beginTime,qrCode, amount
  const [protocolOpen, setProtocolOpen] = useState(false)
  const qrCodeTimeRef = useRef(moment().add(2, 's').format('YYYY-MM-DD HH:mm:ss')) //  获取二维码的时间
  const statusTimeRef = useRef(moment().format('YYYY-MM-DD HH:mm:ss')) // 定时器查订单状态的时间（需要比获取二维码的时间早2s）
  const isInit = useRef(false)
  const targetModal = useRef()

  const initCurrencyCoin = async () => {
    const res = await api.getCurrencyCoin({
      category: 21, // 算币类型
    })
    setCurrencyCoinList(res?.data?.resData)
    return res?.data?.resData
  }
  const fetchGoodsBuy = async (goodsId) => {
    const res = await api.goodsBuy({
      goodsId,
      createTime: qrCodeTimeRef.current,
    })
    if (res?.data?.resCode != SUCCESS_CODE) {
      // message.error('重新获取支付二维码报错，请联系管理员查看原因')
      return
    }
    const target = {
      goodsId,
      beginTime: new Date().getTime(),
      qrCode: res?.data?.resData?.qrCodeImg,
    }
    const storageData = JSON.parse(sessionStorage.getItem('memberData')) || {}
    storageData[goodsId] = target
    sessionStorage.setItem('memberData', JSON.stringify(storageData))
    console.log('更新二维码图片啦')
    setBuyInfo(target)
  }

  const getGoodsBuyInfo = async (goodsId) => {
    // 本地存了就从本地取，否则接口取
    let storageData = JSON.parse(sessionStorage.getItem('memberData')) || {}
    if (Object.keys(storageData).length > 0) {
      if (storageData[goodsId]) {
        setBuyInfo(storageData[goodsId])
      } else {
        await fetchGoodsBuy(goodsId)
      }
    } else {
      await fetchGoodsBuy(goodsId)
    }
  }

  const selectCoinItem = async (i) => {
    setSelectGoodsId(i.id)
    selectGoodsIdRef.current = i.id
    getGoodsBuyInfo(i.id)
    setAmount(i.price)
  }

  const updateExpireStorage = () => {
    expireTimer.current && clearInterval(expireTimer.current)
    const intervalTimer = setInterval(() => {
      const storageData = JSON.parse(sessionStorage.getItem('memberData')) || []
      const unExpireList = Object.values(storageData).filter(
        (item) => new Date().getTime() - item.beginTime <= 20 * 60 * 1000,
      ) // 每20分钟更新一次二维码
      const newMap = {}
      unExpireList.forEach((i) => {
        newMap[i.goodsId] = i
      })
      sessionStorage.setItem('memberData', JSON.stringify(newMap))
      // 更新获取二维码和状态定时器的时间
      if (!Object.keys(newMap).some((i) => i == selectGoodsIdRef.current)) {
        console.log('执行')
        qrCodeTimeRef.current = moment().add(2, 's').format('YYYY-MM-DD HH:mm:ss')
        statusTimeRef.current = moment().format('YYYY-MM-DD HH:mm:ss')
        initGoods(selectGoodsIdRef.current)
      }
    }, 5000)
    expireTimer.current = intervalTimer
  }

  const checkStatus = () => {
    statusTimer.current && clearInterval(statusTimer.current)
    const intervalTimer = setInterval(async () => {
      const res = await api.orderStatus({
        createTime: statusTimeRef.current,
        type: 21, // 购买算币
      })
      res?.data?.resData.forEach((item) => {
        if (item.status == 2) {
          // 交易成功
          let list = JSON.parse(sessionStorage.getItem('statusTypeSuccess')) || []
          if (list.indexOf(item.id) == -1) {
            list.push(item.id)
            sessionStorage.setItem('statusTypeSuccess', JSON.stringify(list))
            // //充值成功，更新金币
            qrCodeTimeRef.current = moment().add(2, 's').format('YYYY-MM-DD HH:mm:ss')
            statusTimeRef.current = moment().format('YYYY-MM-DD HH:mm:ss')
            fetchGoodsBuy(selectGoodsIdRef.current)
            targetModal.current = modal
              .info({
                content: '感谢您对plotreel的支持, 支付成功',
                okText: '确定',
              })
              .then(() => {
                clearInterval(statusTimer.current)
                clearInterval(expireTimer.current)
                setPayModal(false)
                updateAccountInfo()
                sessionStorage.setItem('memberData', JSON.stringify({}))
                if (window.location.href.indexOf('project/detail/paint') > -1) {
                  // 绘制配图页在支付成功后需刷新
                  window.location.reload()
                }
              })
          }
        } else if (item.status == 3) {
          // 交易失败
          let list = JSON.parse(sessionStorage.getItem('statusTypeError')) || []
          if (list.indexOf(item.id) == -1) {
            list.push(item.id)
            sessionStorage.setItem('statusTypeError', JSON.stringify(list))
            qrCodeTimeRef.current = moment().add(2, 's').format('YYYY-MM-DD HH:mm:ss')
            statusTimeRef.current = moment().format('YYYY-MM-DD HH:mm:ss')
            fetchGoodsBuy(selectGoodsIdRef.current)
            modal
              .confirm({
                content: '请尝试重新支付, 支付失败',
                okText: '确定',
                cancelText: '取消',
              })
              .then((confirmed) => {})
          }
        }
      })
    }, 1000)
    statusTimer.current = intervalTimer
  }

  const initGoods = async (goodsId) => {
    getGoodsBuyInfo(goodsId)
    updateExpireStorage()
    checkStatus()
  }

  useEffect(() => {
    if (!isInit.current) {
      isInit.current = true
      initCurrencyCoin().then((list) => {
        if (list[0]) {
          setSelectGoodsId(list[0].id)
          selectGoodsIdRef.current = list[0].id
          initGoods(list[0].id)
          setAmount(list[0].price)
        }
      })
    }
    return () => {
      clearInterval(statusTimer.current)
      clearInterval(expireTimer.current)
    }
  }, [])

  return (
    <div className="currencyCoinListWrap">
      <div className="currencyCoinList">
        {currencyCoinList.map((i) => (
          <div
            className="currencyCoinItem"
            onClick={() => selectCoinItem(i)}
            key={i.id}
            style={selectGoodsId === i.id ? { border: '1px solid rgba(87,72,176,1)' } : {}}
          >
            <div className="currencyCoinRow">
              <div className="flex-between">
                <div>
                  <CodeSandboxOutlined />
                  <span className="coinNum">{i.extra.unit_num}算币</span>
                  <span>永久</span>
                </div>
                <div className="coinPrice">
                  ￥<span style={{ fontSize: 16 }}>{i.price}</span>
                </div>
              </div>
              <div style={{ paddingLeft: 17 }}>{i.extra.avg_price}</div>
            </div>
            <div className="coinDetailRow">
              <div>-{i.extra.gpt}</div>
              <div>-{i.extra.pic}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="payContent">
        <div className="wechatTitle flex-center">
          <WechatOutlined style={{ paddingRight: 10, color: '#009931' }} />
          微信支付
        </div>
        <div className="qrCodeWrap flex-center">
          <img src={buyInfo?.qrCode} />
          {/* <img src={qrcodeClose}/> */}
        </div>
        <div>
          <div style={{ fontSize: 14, padding: '23px 0 15px' }}>
            应付金额：
            <span style={{ color: '#5748B0', fontWeight: 'bold' }}>￥{amount}</span>
          </div>
          <div>
            提交订单即代表您已阅读并同意
            <span
              style={{ color: '#5748B0', cursor: 'pointer' }}
              onClick={() => setProtocolOpen(true)}
            >
              《算币充值协议》
            </span>
            中的内容，算币购买为虚拟服务，购买后不支持退换，请谨慎选择后购买
          </div>
        </div>
      </div>
      {contextHolder}
      <ProtocolModal protocolOpen={protocolOpen} setProtocolOpen={setProtocolOpen} />
    </div>
  )
}
export default Recharge
