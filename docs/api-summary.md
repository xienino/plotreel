# PlotReel 前端接口汇总

> 依据 `src/services/*` 和前端调用处整理。  
> 说明：
> - “入参”优先来自实际调用代码；未调用或无法确定时写 `data/params`。
> - “出参”是前端当前读取到的字段，不代表后端完整返回契约。
> - 通用响应大多遵循 `{ resCode, resData, resMsg }`；部分本地 `videomaker` 接口直接在 `data` 根级返回字段。
> - `window.axiosInstance` 在 `src/layout/index.jsx` 内统一追加 `mtk`，特定登录接口追加 `dstcode`。

## 域名/服务分组

| 服务文件 | 接口域 | 用途 |
| --- | --- | --- |
| `admin.js` | `${REACT_APP_BASEAPI}/adm/api` | 登录、验证码、用户 |
| `pnt.js` | `${REACT_APP_BASEAPI}/pnt/api` | 云端模型、标签、文本分割、提示词、绘图、图生视频 |
| `pnt.js` | `${REACT_APP_BASEAPI}/pnt/dict` | 字典配置，目前用于音色 |
| `videomaker.js` | `/videomaker/aihost` | 本地桌面端后端、项目文件、素材、SD、剪映、更新 |
| `sto.js` | `${REACT_APP_BASEAPI}/sto/c` | 算币、商品、订单 |
| `gai.js` | `${REACT_APP_BASEAPI}/gai/api` | 翻译、TTS |

## 通用响应字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `resCode` | number | `1` 成功，`0` 错误，`-1` 登录过期，`-2` 网络错误，`-3` 算币不足等 |
| `resData` | any | 业务数据 |
| `resMsg` | array/object | 错误/提示信息；代码里既有 `resMsg[0].msgText`，也有 `resMsg.msgText` 的读取 |

## `admin.js`

| 前端函数 | 接口类型 | 路径 | 入参 | 前端读取的出参 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `doLogin` | 云端 ADM / POST | `/user/login/doLogin` | `{ account, pwd, flag: '0', sysId: 'pnt' }` | `resData.autoLogin`, `resData.mtk`, `resMsg[0].msgText` | 密码登录 |
| `resetPwd` | 云端 ADM / POST | `/user/resetPwd` | `{ mobileNo, verifyCode, uuid, pwd, sysId: 'pnt', flagSrc: '0' }` | `resCode`, `resMsg[0].msgText` | 找回密码/重置密码 |
| `loginByVcode` | 云端 ADM / POST | `/user/loginByVcode` | `{ account, vcode, flagSrc: '0', sysId: 'pnt', uuid }` | `resData.autoLogin`, `resData.mtk`, `resMsg.msgText` | 验证码登录 |
| `sendVerifyCode` | 云端 ADM / POST | `/vcode/sendVerifyCode` | `{ mobileNo, scene }`，`scene` 为 `login`/`reset` | `resData.uuid`, `resMsg[0].msgText` | 获取短信验证码 |
| `doLogout` | 云端 ADM / POST | `/user/login/doLogout` | `{}` | 未读取 | 登出时与本地 `setMtk` 并发调用 |
| `getUser` | 云端 ADM / POST | `/user/getUser` | `data` | 未在当前前端调用 | 获取用户信息 |

## `pnt.js`

| 前端函数 | 接口类型 | 路径 | 入参 | 前端读取的出参 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `autoLogin` | 云端 PNT / POST | `/user/autoLogin` | `{ mobileNo, loginPwd, flagSrc: '0' }` | `resData.mtk` | 设置新密码后自动注册/登录 |
| `getModelPage` | 云端 PNT / POST | `/model/page` | `{ pageNum, pageSize }` | `resData.rows[].{ type, name, remark, extra }`，`extra` 解析出 `steps/cfg_scale/modelFee` | 初始化云端绘图/视频模型 |
| `extractRole` | 云端 PNT / POST | `/v1/paint/label/role/extract` | `{ source }` | `resData.labels[].label.{ names, prompt }` | AI 提取角色标签 |
| `extractScene` | 云端 PNT / POST | `/v1/paint/label/scene/extract` | `{ source }` | `resData.labels[].label.{ names, prompt }` | AI 提取场景标签 |
| `uploadLabel` | 云端 PNT / POST | `/label/upload` | `[{ id?, labelId, name, image, prompt, priority, type }]` | `resCode` | 同步标签到云端标签库 |
| `deleteLabel` | 云端 PNT / POST | `/label/delete` | `{ id }` | `resCode` | 删除云端标签库条目 |
| `getAllLabel` | 云端 PNT / POST | `/label/getAll` | `{ pageSize, pageNum, type }` | `resData.rows`, `resData.total` | 获取角色/场景标签库 |
| `getStyleList` | 云端 PNT / POST | `/style/list` | 无/`data` | `resData[].{ name, url }` | 获取画风列表 |
| `textSeparator` | 云端 PNT / POST | `/v1/text/separate` | `{ source }` | `resData.content` | 文本自动分割 |
| `getTimbres` | 云端 PNT-DICT / POST | `/item/timbres` | `{}` | `resData[].{ name, gender, tag, value }` | 音色列表 |
| `infoExtract` | 云端 PNT / POST | `/v1/mediumshooting/info/extract` | `{ previous, source, person_labels, scence_labels }`，支持 `config.signal` | `resData.prompt.{ chinese, english }`, `resData.labels` | 单个分镜情节推理 |
| `image2video` | 云端 PNT / POST | `/v1/video/image2video` | `{ prompt, image, model }`，`image` 为 base64 去头 | `resCode`, `resData.taskId`, `resMsg` | 图生视频发起任务 |
| `image2videoCheck` | 云端 PNT / GET | `/v1/video/image2video?taskId=...` | `{ taskId }` | `resData.status`, `resData.videoUrl`, `resMsg.msgText` | 图生视频任务查询 |
| `assemble4Generations` | 云端 PNT / POST | `/v1/prompt/generations` | `{ prompt, style, lens, labels, common_prompt? }` | `resData.prompt` | 组装绘图提示词 |
| `generations` | 云端 PNT / POST | `/v1/images/generations` | `{ prompt, width, height, image?, model }` | `resCode`, `resData.taskId`, `resMsg[0].msgCode` | 云端绘图发起任务 |
| `generationsCheck` | 云端 PNT / GET | `/v1/images/generations?taskId=...` | `{ taskId }`，可传 `config.signal` | `resData.status`, `resData.imageList[].url`, `resMsg.msgText` | 云端绘图任务查询 |
| `queueCheck` | 云端 PNT / GET | `/v1/images/queue/query?taskId=...` | `{ taskId }` | `resData` 数字 | 查询排队位置 |
| `queueRemove` | 云端 PNT / POST | `/v1/images/queue/remove` | `{ taskId }` | `resCode` | 取消排队 |
| `fileUpload` | 云端 PNT / POST | `/file/upload` | `FormData(file)` | `resData` | 上传标签图片到云端 |
| `upgradeLast` | 云端 PNT / POST | `/upgrade/last` | 无/`data` | 期望 `resData.{ version, packageUrl, remark, upgradeType }` | 当前实现未 `return` Promise，调用方拿不到结果且网络错误会泄漏 |

## `videomaker.js`

| 前端函数 | 接口类型 | 路径 | 入参 | 前端读取的出参 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `getPaintingStyle` | 本地 / POST | `/videomaker/aihost/getPaintingStyle` | `{}` | 未在当前前端调用 | 获取画风及样例图 |
| `getBackgroundMusicList` | 本地 / POST | `/videomaker/aihost/getBackgroundMusicList` | `data` | 未在当前前端调用 | 获取背景音乐 |
| `setProjectBackgroundMusic` | 本地 / POST | `/videomaker/aihost/setProjectBackgroundMusic` | `data` | 未在当前前端调用 | 设置项目背景音乐 |
| `getMtk` | 本地 / POST | `/videomaker/aihost/getMtk` | `{}` | `resCode`, `resData.{ mtk, account, password }` | 从本地读取登录态 |
| `setMtk` | 本地 / POST | `/videomaker/aihost/setMtk` | `{ mtk, account?, password? }` | 未读取 | 本地保存登录态 |
| `fileParse` | 本地 / POST | `/videomaker/aihost/fileParse` | `FormData(file, taskId)` | `resCode`, `resData.fileContent`, `resMsg.msgCode` | 解析上传脚本文档 |
| `uploadExampleImage` | 本地 / POST | `/videomaker/aihost/uploadExampleImage` | `data` | 未在当前前端调用 | 上传分镜参考图 |
| `deleteExampleImage` | 本地 / POST | `/videomaker/aihost/deleteExampleImage` | `data` | 未在当前前端调用 | 删除分镜参考图 |
| `createProject` | 本地 / POST | `/videomaker/aihost/createProject` | `{}` | `resCode`, `taskId` | 新建项目草稿 |
| `getProjectDetail` | 本地 / POST | `/videomaker/aihost/getProjectDetail` | `{ taskId, indexes? }` | 根级 `stage/title/type/width/height/fileName/fileSize/repaintingCount`, `resData` | 获取项目/分镜详情 |
| `contentExtract` | 本地 / POST | `/videomaker/aihost/contentExtract` | `params` | 未在当前前端调用 | 客户端内容解析 |
| `editRepaintingCount` | 本地 / POST | `/videomaker/aihost/editRepaintingCount` | `{ taskId, repaintingCount }` | `resCode` | 修改重绘数量 |
| `setFileContent` | 本地 / POST | `/videomaker/aihost/setFileContent` | `{ taskId, textList }` | `resCode`, `resMsg.msgText` | 保存分镜文本/提示词/素材选择/任务 id 等 |
| `RefreshProjectList` | 本地 / POST | `/videomaker/aihost/getProjectList` | `{ pageNum, pageSize }` | `resCode`, `resData`, `total` | 草稿项目列表 |
| `analyzeScence` | 本地 / POST | `/videomaker/aihost/analyzeScence` | `params` | 未在当前前端调用 | 旧场景分析接口 |
| `analyzeAndGenimage` | 本地 / POST | `/videomaker/aihost/analyzeAndGenimage` | `params` | 未在当前前端调用 | 旧分析+绘图合并接口 |
| `stopTaskAnalyzeAndGenimage` | 本地 / POST | `/videomaker/aihost/stopTaskAnalyzeAndGenimage` | `params` | 未在当前前端调用 | 停止旧合并任务 |
| `getAnalyzeAndGenimageProgress` | 本地 / POST | `/videomaker/aihost/getAnalyzeAndGenimageProgress` | `params` | 未在当前前端调用 | 旧合并任务进度 |
| `getVoiceList` | 本地 / POST | `/videomaker/aihost/getVoiceList` | `params` | 未在当前前端调用 | 旧音色列表 |
| `generateAudio` | 本地 / POST | `/videomaker/aihost/generateAudio` | `params` | 未在当前前端调用 | 旧生成音频接口 |
| `generateImage` | 本地 / POST | `/videomaker/aihost/generateImage` | `params` | 未在当前前端调用 | 旧生成图片接口 |
| `getPicByIndexes` | 本地 / POST | `/videomaker/aihost/getPicByIndexes` | `params` | 未在当前前端调用 | 旧获取图片接口 |
| `makeVideo` | 本地 / POST | `/videomaker/aihost/makeVideo` | `{ taskId, backgroundMusic, useExistingAudio, indexes }` | `resCode`, `resMsg.msgCode`, `resData.videoPath` | 合成最终视频 |
| `saveStoryboardAudio` | 本地 / POST | `/videomaker/aihost/saveStoryboardAudio` | `{ taskId, index, source, audioBase64, subtitles }` | `resCode`, `resData.audioUrl` | 保存分镜音频 |
| `exportJianyingDraft` | 本地 / POST | `/videomaker/aihost/exportJianyingDraft` | `{ taskId, backgroundMusic, useExistingAudio, indexes }` | `resCode` | 导出剪映草稿 |
| `copyVideo` | 本地 / POST | `/videomaker/aihost/copyVideo` | `{ taskId }` | `resCode`, `resMsg.msgText` | 下载/复制视频到下载目录 |
| `getMakeVideoProgress` | 本地 / POST | `/videomaker/aihost/getMakeVideoProgress` | `{ taskId }` | `resCode`, `resData.progress` 或根级 `progress` | 视频合成进度 |
| `getExportProgress` | 本地 / POST | `/videomaker/aihost/getExportProgress` | `{ taskId }` | `resCode`, 根级 `progress` | 剪映导出进度 |
| `seekVideo` | 本地 / POST | `/videomaker/aihost/seekVideo` | `{ taskId }` | 根级 `videoUrl` | 查找指定作品视频 |
| `getAnscenceProcess` | 本地 / POST | `/videomaker/aihost/getAnscenceProcess` | `params` | 未在当前前端调用 | 旧分析进度/结果 |
| `getGenImageProcess` | 本地 / POST | `/videomaker/aihost/getGenImageProcess` | `params` | 未在当前前端调用 | 旧绘图进度 |
| `deleteMediumShooting` | 本地 / POST | `/videomaker/aihost/deleteMediumShooting` | `{ taskId, indexes }` | `resCode` | 删除分镜 |
| `addMediumShooting` | 本地 / POST | `/videomaker/aihost/addMediumShooting` | `{ taskId, index }` | `resCode` | 插入分镜 |
| `deleteProject` | 本地 / POST | `/videomaker/aihost/deleteProject` | `{ taskId }` | `resCode`, `resMsg.msgText` | 删除草稿/作品 |
| `deleteVideo` | 本地 / POST | `/videomaker/aihost/deleteVideo` | `{ taskId }` | 未读取 | 重新编辑本地作品前删除成品视频 |
| `deleteJianyingDraft` | 本地 / POST | `/videomaker/aihost/deleteJianyingDraft` | `{ taskId }` | 未读取 | 重新编辑剪映作品前删除剪映输出 |
| `editProjectBasicInformation` | 本地 / POST | `/videomaker/aihost/editProjectBasicInformation` | `{ taskId, newName? , newType?, newSize? }` | `resCode` | 修改标题、画风、尺寸 |
| `getLabel` | 本地 / POST | `/videomaker/aihost/getLabel` | `{ taskId }` | `resCode`, `resData` | 获取项目标签 |
| `searchLabel` | 本地 / POST | `/videomaker/aihost/searchLabel` | `params` | 未在当前前端调用 | 查找本地标签 |
| `translators` | 本地 / POST | `/videomaker/aihost/translators` | `params` | 未在当前前端调用 | 旧翻译接口 |
| `setLabel` | 本地 / POST | `/videomaker/aihost/setLabel` | `{ taskId, labelId, label }` | 未读取 | 保存项目标签信息 |
| `delLabel` | 本地 / POST | `/videomaker/aihost/delLabel` | `{ taskId, labelIdList }` | `resCode` | 删除项目标签 |
| `getDefaultPrompt` | 本地 / POST | `/videomaker/aihost/getDefaultPrompt` | `params` | 未在当前前端调用 | 获取预设提示词 |
| `generateLabelImage` | 本地 / POST | `/videomaker/aihost/generateLabelImage` | `{ taskId, label: { title, prompt, lora } }` | `resCode`, `resMsg.msgText` | 标签图片绘制，随后用 `findLabelImage` 取结果 |
| `findLabelImage` | 本地 / POST | `/videomaker/aihost/findLabelImage` | `{ labelList }` | `resData[0].imageBase64` | 查询标签图片 |
| `getCloudModelList` | 本地 / POST | `/videomaker/aihost/getCloudModelList` | `params` | 未在当前前端调用 | 获取云模型列表，现主要用 `getModelPage` |
| `getSdConfig` | 本地 / POST | `/videomaker/aihost/getSdConfig` | `{}` | `resData.sd_url/username/password/current_model/current_vae/sampler_name/scheduler/steps/cfg_scale/seed/n_iter/available_* /state` | 获取本地 SD/Flux 配置 |
| `getTranslateConfig` | 本地 / POST | `/videomaker/aihost/getTranslateConfig` | `params` | 未在当前前端调用 | 翻译密钥配置读取，UI 已注释 |
| `saveTranslateSecret` | 本地 / POST | `/videomaker/aihost/saveTranslateSecret` | `params` | 未在当前前端调用 | 翻译密钥保存，UI 已注释 |
| `getShootingPath` | 本地 / POST | `/videomaker/aihost/getShootingPath` | `{}` | 根级 `path` | 分镜素材路径 |
| `getJianyingConfig` | 本地 / POST | `/videomaker/aihost/getJianyingConfig` | `{}` | `resData.{ jianying, jianyingDraftPath }` | 获取剪映配置 |
| `saveJianyingAddress` | 本地 / POST | `/videomaker/aihost/saveJianyingAddress` | `{ jianyingDraftPath }` | `resCode` | 保存/校验剪映地址 |
| `setSdConfig` | 本地 / POST | `/videomaker/aihost/setSdConfig` | `{ data: { current_model?/current_vae?/cfg_scale?/seed?/n_iter?/sampler_name?/scheduler?/steps?/sd_url?/username?/password? } }` | `resCode` | 修改本地 SD 配置 |
| `changeLocalSdApiState` | 本地 / POST | `/videomaker/aihost/changeLocalSdApiState` | `{ mode }` | `resCode` | 切换本地 SD/Flux |
| `getVideoList` | 本地 / POST | `/videomaker/aihost/getVideoList` | `{ pageNum, pageSize }` | `resCode`, `resData`, `total` | 作品视频列表 |
| `extractRoleLabels` | 本地 / POST | `/videomaker/aihost/extractRoleLabels` | `params` | 未在当前前端调用 | 废弃待删 |
| `stopAnalyzeScence` | 本地 / POST | `/videomaker/aihost/stopAnalyzeScence` | `params` | 未在当前前端调用 | 中止旧场景分析 |
| `stopGenerateImage` | 本地 / POST | `/videomaker/aihost/stopGenerateImage` | `params` | 未在当前前端调用 | 中止旧绘图任务 |
| `openFolder` | 本地 / POST | `/videomaker/aihost/openFolder` | `{ taskId, index }` | 未读取 | 打开图片所在文件夹 |
| `saveLabelImage` | 本地 / POST | `/videomaker/aihost/saveLabelImage` | `{ taskId, imageList: [{ format, imageData }], label: { labelId, label: { prompt } } }` | `resData.imageList[0].imageUrl` | 保存标签图片到本地 |
| `saveStoryboardImage` | 本地 / POST | `/videomaker/aihost/saveStoryboardImage` | `{ taskId, index, imageList: [{ format, imageData }] }` | `resData.materials[0].mIndex` | 保存分镜图片到本地 |
| `saveStoryboardVideo` | 本地 / POST | `/videomaker/aihost/saveStoryboardVideo` | `{ taskId, index, videoUrl }` | `resData.materials.mIndex` | 保存分镜视频到本地 |
| `getPaintingApiState` | 本地 / POST | `/videomaker/aihost/getPaintingApiState` | `{}` | `resCode`, `resData.{ imageModel, videoModel }` | 查询绘画工具/云模型连接状态 |
| `connectSd` | 本地 / POST | `/videomaker/aihost/connectSd` | `{ sd_url, username?, password? }` | `resCode` | 验证并连接本地 SD |
| `setCloudModel` | 本地 / POST | `/videomaker/aihost/setCloudModel` | 绘图：`{ remark, model, steps, cfg_scale, seed, mode: 0 }`；视频：`{ model, mode: 1 }` | `resCode` | 设置云端绘图/视频模型 |
| `generateSdImageSynchronous` | 本地 / POST | `/videomaker/aihost/generateSdImageSynchronous` | `{ taskId, prompt, width, height, repaintingCount }`，支持 `config.signal` | `resData.imageData[]` | 本地 SD 同步绘图 |
| `updater` | 本地 / POST | `/videomaker/aihost/updater` | `{ version, packageUrl }` | `resCode`, `resMsg.msgCode` | 软件更新安装 |
| `updaterCheck` | 本地 / POST | `/videomaker/aihost/updaterCheck` | `{ version }` | `resCode` | 检查是否需要更新 |
| `checkUpdateProgress` | 本地 / GET | `/videomaker/aihost/checkUpdateProgress` | 无/`params` | `resCode`, `resData.progress` | 更新包下载进度 |

## `sto.js`

| 前端函数 | 接口类型 | 路径 | 入参 | 前端读取的出参 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `getCurrencyLogs` | 云端 STO / POST | `/account/currency/logs` | `{ type: 1, pageNum, pageSize }` | `resData.rows`, `resData.total` | 算币流水 |
| `getAccountInfo` | 云端 STO / POST | `/account/info` | 无/`data` | `resData.balance` | 用户余额 |
| `getCurrencyCoin` | 云端 STO / POST | `/plate/currency/coin` | `{ category: 21 }` | `resData` | 算币商品列表 |
| `goodsBuy` | 云端 STO / POST | `/goods/buy` | `{ goodsId, createTime }` | `resCode`, `resData.qrCodeImg` | 创建购买订单 |
| `orderStatus` | 云端 STO / POST | `/order/status` | `{ createTime, type: 21 }` | `resData[]`，遍历订单状态 | 轮询支付状态 |

## `gai.js`

| 前端函数 | 接口类型 | 路径 | 入参 | 前端读取的出参 | 备注 |
| --- | --- | --- | --- | --- | --- |
| `translation` | 云端 GAI / POST | `/tmt/txt/translation` | `{ text, sourceLang: 'zh', targetLang: 'en' }` | `resData.TargetText` | 中文转英文提示词 |
| `genAudio` | 云端 GAI / POST | `/ali/v1/tts` | `{ text, voice }` | `resData.data`, `resData.subtitles`, `resMsg.msgCode` | 阿里云 TTS |

## pywebview 本地窗口 API

这些不是 axios 接口，但也是前端调用的本地桥接能力：

| 调用 | 入参 | 出参/行为 | 文件 |
| --- | --- | --- | --- |
| `window.pywebview.api.maximize_window()` | 无 | 返回最大化状态 | `src/components/DragHeader/DragHeader.jsx` |
| `window.pywebview.api.minimize_window()` | 无 | 最小化窗口 | `src/components/DragHeader/DragHeader.jsx` |
| `window.pywebview.api.close_window()` | 无 | 关闭窗口 | `src/components/DragHeader/DragHeader.jsx`, `src/layout/index.jsx` |
| `window.pywebview.api.move_window(addX, addY)` | `addX`, `addY` | 拖动窗口 | `src/components/DragHeader/DragHeader.jsx` |

