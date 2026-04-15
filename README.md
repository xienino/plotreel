# webview_http_video_maker-dev

环境：node
npm/yarn

执行：

## Project setup

```
yarn
```

## Compiles and hot-reloads for development

```
npm run dev
```

## Compiles and minifies for production

```
npm run build
```

### tips

1. 若用npm install安装，可能会报XXX错，待处理
2. build后会打包到./gui目录下
3. 若python在其他服务器上开启了http服务，前端本地开发需把127.0.0.1的proxy改为http服务相应的地址

```
zhihui
├─ 📁.vscode
│  └─ 📄settings.json
├─ 📁public
│  ├─ 📄favicon.ico
│  ├─ 📄index.html
│  ├─ 📄manifest.json
│  └─ 📄robots.txt
├─ 📁src
│  ├─ 📁assets
│  │  ├─ 📁paintingStyle
│  │  │  ├─ 📄animeStyle.png
│  │  │  ├─ 📄chineseAncientStyle.png
│  │  │  ├─ 📄martialArtsFairyStyle.png
│  │  │  ├─ 📄modernUrbanStyle.png
│  │  │  ├─ 📄realisticStyle.png
│  │  │  └─ 📄sciFiStyle.png
│  │  ├─ 📄constant.js
│  │  ├─ 📄defaultAvator.png
│  │  ├─ 📄defaultImage.png
│  │  ├─ 📄logo.icns
│  │  ├─ 📄logo.ico
│  │  ├─ 📄logoicon.png
│  │  ├─ 📄open-sans-v17-latin_cyrillic-italic.woff
│  │  ├─ 📄open-sans-v17-latin_cyrillic-regular.woff
│  │  ├─ 📄qrcodeClose.png
│  │  └─ 📄roboto-condensed-v18-latin_cyrillic-regular.woff
│  ├─ 📁common
│  │  ├─ 📄iconfont.js
│  │  └─ 📄util.js
│  ├─ 📁components
│  │  ├─ 📁DragHeader
│  │  │  ├─ 📄DragHeader.jsx
│  │  │  └─ 📄dragHeader.sass
│  │  ├─ 📁Editor
│  │  │  ├─ 📄Editor.sass
│  │  │  └─ 📄Editor.tsx
│  │  ├─ 📁editTextArea
│  │  │  ├─ 📄editText.jsx
│  │  │  ├─ 📄editText.sass
│  │  │  ├─ 📄editTextArea.jsx
│  │  │  └─ 📄editTextArea.sass
│  │  ├─ 📁Header
│  │  │  ├─ 📄Header.sass
│  │  │  └─ 📄Header.tsx
│  │  ├─ 📁Ticker
│  │  │  ├─ 📄Ticker.sass
│  │  │  └─ 📄Ticker.tsx
│  │  ├─ 📄integerStep.jsx
│  │  ├─ 📄Labels.jsx
│  │  ├─ 📄numericInput.jsx
│  │  └─ 📄videoPlayer.jsx
│  ├─ 📁layout
│  │  ├─ 📄index.jsx
│  │  ├─ 📄index.sass
│  │  └─ 📄payModal.jsx
│  ├─ 📁pages
│  │  ├─ 📁project
│  │  │  ├─ 📁baseInfo
│  │  │  │  ├─ 📄addLabelCard.jsx
│  │  │  │  ├─ 📄addLabelModal.jsx
│  │  │  │  ├─ 📄baseInfo.jsx
│  │  │  │  ├─ 📄baseInfo.sass
│  │  │  │  ├─ 📄labelCard.jsx
│  │  │  │  ├─ 📄labelContent.jsx
│  │  │  │  └─ 📄segmentContent.jsx
│  │  │  ├─ 📁labelInfo
│  │  │  │  ├─ 📄labelInfo.jsx
│  │  │  │  ├─ 📄labelInfo.sass
│  │  │  │  └─ 📄labelLibCard.jsx
│  │  │  ├─ 📁paintInfo
│  │  │  │  ├─ 📄currentDetail.jsx
│  │  │  │  ├─ 📄imageList.jsx
│  │  │  │  ├─ 📄paintInfo.jsx
│  │  │  │  ├─ 📄paintInfo.sass
│  │  │  │  └─ 📄storyboard.jsx
│  │  │  ├─ 📄detail.jsx
│  │  │  ├─ 📄drawingModal.jsx
│  │  │  ├─ 📄index.jsx
│  │  │  ├─ 📄intelligentModal.jsx
│  │  │  ├─ 📄loadingModal.jsx
│  │  │  ├─ 📄openPose.jsx
│  │  │  ├─ 📄project.sass
│  │  │  └─ 📄uploading.jsx
│  │  ├─ 📁recharge
│  │  │  ├─ 📄protocolModal.jsx
│  │  │  ├─ 📄recharge.jsx
│  │  │  └─ 📄recharge.sass
│  │  ├─ 📁userAgreement
│  │  │  ├─ 📄privacyPolicyModal.jsx
│  │  │  ├─ 📄userAgreement.jsx
│  │  │  └─ 📄userAgreementModal.jsx
│  │  ├─ 📄login.jsx
│  │  ├─ 📄login.sass
│  │  └─ 📄settings.jsx
│  ├─ 📁services
│  │  ├─ 📄admin.js
│  │  ├─ 📄dispatcher.js
│  │  ├─ 📄gai.js
│  │  ├─ 📄log.js
│  │  ├─ 📄pnt.js
│  │  ├─ 📄project.jsx
│  │  ├─ 📄sto.js
│  │  ├─ 📄videomaker.js
│  │  ├─ 📄WebSocketClient.js
│  │  └─ 📄wsDemo.js
│  ├─ 📁styles
│  │  └─ 📄fonts.sass
│  ├─ 📄App.test.tsx
│  ├─ 📄error-page.jsx
│  ├─ 📄index.css
│  ├─ 📄index.jsx
│  ├─ 📄index.sass
│  ├─ 📄react-app-env.d.ts
│  ├─ 📄reportWebVitals.ts
│  ├─ 📄setupProxy.js
│  └─ 📄setupTests.ts
├─ 📄.env
├─ 📄.env.production
├─ 📄.env.test
├─ 📄.eslintrc.json
├─ 📄.gitignore
├─ 📄.prettierrc.js
├─ 📄package.json
├─ 📄README.md
├─ 📄tsconfig.json
└─ 📄yarn.lock
```