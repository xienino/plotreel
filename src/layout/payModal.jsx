import React, { useState, useEffect } from 'react'
import { List, Pagination } from 'antd'
import './index.sass'
import api from '../services/project'
import { goodsNameMap, CONSUME_WAY_NAME } from '../assets/constant'

const PayModal = ({ payModal, sdTemplateOptionsCloud, childRef }) => {
  const [currencyListPageNum, setCurrencyListPageNum] = useState(1) // 页码
  const [currencyList, setCurrencyList] = useState([])
  const [currencyTotal, setCurrencyTotal] = useState(0)
  const [optionMap, setOptionMap] = useState({})

  const changeCurrencyListPageNum = async (value) => {
    setCurrencyListPageNum(value)
    const res = await api.getCurrencyLogs({
      type: 1,
      pageNum: value,
      pageSize: 20,
    })
    if (res?.data?.resData) {
      setCurrencyList(res?.data?.resData?.rows || [])
    }
  }
  const initCurrencyList = async () => {
    const res = await api.getCurrencyLogs({
      type: 1,
      pageNum: currencyListPageNum,
      pageSize: 20,
    })
    if (res?.data?.resData) {
      setCurrencyList(res?.data?.resData?.rows || [])
      setCurrencyTotal(res?.data?.resData?.total || 0)
    }
  }
  // 将子组件实例绑定到父组件传递的 ref 上
  React.useImperativeHandle(childRef, () => ({
    initCurrencyList,
  }))
  useEffect(() => {
    if (payModal) {
      initCurrencyList()
    }
  }, [payModal])
  useEffect(() => {
    const newOptionMap = {}
    sdTemplateOptionsCloud.forEach((i) => {
      newOptionMap[i.value] = i.label
    })
    setOptionMap(newOptionMap)
  }, [sdTemplateOptionsCloud])
  return (
    <>
      <div className="payDetailTitle flex-between">
        算币详情
        <div className="flex-center"></div>
      </div>
      <div className="currencyListWrap">
        <List
          dataSource={currencyList}
          renderItem={(item) => (
            <List.Item key={goodsNameMap[item.modifyWay]}>
              <List.Item.Meta
                title={
                  item.modifyWay === 'CP' && item?.content?.way
                    ? `${optionMap[item?.content?.model]} ${CONSUME_WAY_NAME[item?.content?.way]}`
                    : item.modifyWay === 'CR'
                      ? `${CONSUME_WAY_NAME[item?.content?.way]}回退`
                      : goodsNameMap[item.modifyWay]
                }
                description={item.createTime}
              />
              <div>{(item.content.status - item.content.bStatus).toFixed(2)}</div>
            </List.Item>
          )}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'end' }}>
        <Pagination
          defaultCurrent={currencyListPageNum}
          total={currencyTotal}
          className="currencyListPagination"
          onChange={changeCurrencyListPageNum}
          showSizeChanger={false}
          pageSize={20}
        />
      </div>
    </>
  )
}

export default PayModal
