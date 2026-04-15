import React from 'react'
import ReactDOM from 'react-dom'
import reportWebVitals from './reportWebVitals'

// import Header from './components/Header/Header'
// import Editor from './components/Editor/Editor'
// import Ticker from './components/Ticker/Ticker'

import ErrorPage from './error-page'
import Project from './pages/project'
import Detail from './pages/project/detail'
import Login from './pages/login'
import MyLayout from './layout'
import BaseInfo from './pages/project/baseInfo/baseInfo'
import PaintInfo from './pages/project/paintInfo/paintInfo'

import './index.css'
import './index.sass'

import { useState, useEffect } from 'react'
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom'

import { message } from 'antd'
message.config({
  maxCount: 1,
})

const root = ReactDOM.createRoot(document.getElementById('app'))
const MyStrictMode = () => {
  const [drawingModel, setDrawingModel] = useState() // 绘图模式（‘cloud’ 、‘custom’）
  const [loraList, setLoraList] = useState()
  const [modelName, setModelName] = useState() // plotreel云名称
  const [drawingSdState, setDrawingSdState] = useState() // 绘图云/本地sd连接状态
  const [jianYingState, setJianYingState] = useState(false) // 剪映草稿地址状态
  const [checkpointConfig, setCheckpointConfig] = useState()
  const [midjourneyMode, setMidjourneyMode] = useState('relax')

  // 设置
  const [sdConfig, setSdConfig] = useState({}) // 当前所选绘图大模型配置
  const [videoTemplateOptionsCloud, setVideoTemplateOptionsCloud] = useState([]) // 视频大模型列表
  const [sdTemplateOptionsCloud, setSdTemplateOptionsCloud] = useState([]) // 绘图大模型列表

  const router = createHashRouter([
    {
      path: '/',
      element: (
        <MyLayout
          modelName={modelName}
          setModelName={setModelName}
          setDrawingSdState={setDrawingSdState}
          drawingSdState={drawingSdState}
          sdConfig={sdConfig}
          setSdConfig={setSdConfig}
          sdTemplateOptionsCloud={sdTemplateOptionsCloud}
          setSdTemplateOptionsCloud={setSdTemplateOptionsCloud}
          videoTemplateOptionsCloud={videoTemplateOptionsCloud}
          setVideoTemplateOptionsCloud={setVideoTemplateOptionsCloud}
          jianYingState={jianYingState}
          setJianYingState={setJianYingState}
          loraList={loraList}
          drawingModel={drawingModel}
          setDrawingModel={setDrawingModel}
          setLoraList={setLoraList}
        />
      ),
      children: [
        {
          path: '', // Empty path for /project to redirect
          element: <Navigate to="/project" replace />,
        },
        {
          path: 'about',
          element: <div>关于</div>,
        },
        {
          path: '/project',
          children: [
            {
              path: '',
              element: <Project />,
            },
            {
              path: 'list',
              element: <Project />,
            },
            {
              path: 'detail',
              element: (
                <Detail
                  drawingModel={drawingModel}
                  drawingSdState={drawingSdState}
                  jianYingState={jianYingState}
                  modelName={modelName}
                  setModelName={setModelName}
                  checkpointConfig={checkpointConfig}
                  midjourneyMode={midjourneyMode}
                  setMidjourneyMode={setMidjourneyMode}
                  loraList={loraList}
                />
              ),
              children: [
                {
                  path: 'base/:id',
                  element: <BaseInfo drawingSdState={drawingSdState} />,
                },
                {
                  path: 'paint/:id',
                  element: <PaintInfo drawingSdState={drawingSdState} />,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: '/login',
      element: <Login />,
    },
  ])

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}
root.render(<MyStrictMode />)

// const App = function () {
//   return (
//     <>
//       <Header />
//       <Ticker />
//       <Editor />
//     </>
//   )
// }

// const view = App('pywebview')

// const element = document.getElementById('app')
// ReactDOM.render(view, element)

// export default App

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
