# PlotReel Business Map

## Product Areas

### Auth And Session

Files:

- `src/pages/login.jsx`
- `src/layout/index.jsx`
- `src/services/admin.js`
- `src/services/pnt.js`
- `src/services/videomaker.js`

Responsibilities:

- Login by password or verification code.
- Auto-login/register.
- Read and persist local `mtk`.
- Attach `mtk` and selected `dstcode` header in the global axios interceptor.
- Redirect to `/login` on `LOGOUT_CODE` or `MSG_CODE.LOGIN_EXPIRE`.

### App Shell

Files:

- `src/index.jsx`
- `src/layout/index.jsx`
- `src/layout/index.sass`
- `src/components/DragHeader/DragHeader.jsx`
- `src/pages/settings.jsx`
- `src/layout/payModal.jsx`

Responsibilities:

- Hash router and route tree.
- Dark compact Ant Design theme.
- Desktop draggable header.
- Header actions: refresh, settings, coin balance.
- Settings modal.
- Pay modal and recharge entry.
- Software update checks and restart through `window.pywebview`.

### Project Drafts And Works

Files:

- `src/pages/project/index.jsx`
- `src/pages/project/project.sass`
- `src/services/videomaker.js`

Responsibilities:

- Draft list via `RefreshProjectList`.
- Completed works via `getVideoList`.
- Create project via `createProject`.
- Rename via `editProjectBasicInformation`.
- Delete draft/video/Jianying draft.
- Preview, re-edit, download, and navigate into detail.

### Base Info

Files:

- `src/pages/project/detail.jsx`
- `src/pages/project/baseInfo/baseInfo.jsx`
- `src/pages/project/baseInfo/segmentContent.jsx`
- `src/pages/project/baseInfo/labelContent.jsx`
- `src/pages/project/baseInfo/addLabelModal.jsx`
- `src/services/videomaker.js`
- `src/services/pnt.js`

Responsibilities:

- Load project detail by `taskId`.
- Upload file through local backend `fileParse`.
- Split text through `textSeparator`.
- Enforce `SEGMENT.MAX_ROW_NUM`, `SEGMENT.MAX_ROW_WORD_LEN`, and `SEGMENT.MAX_WORD`.
- Save base metadata through `editProjectBasicInformation`.
- Save storyboard text through `setFileContent`.
- Load styles through `getStyleList`.
- Load voices through `getTimbres`.
- Extract role/scene labels with cloud APIs.
- Manage label library and user-defined labels.

### Paint And Storyboards

Files:

- `src/pages/project/paintInfo/paintInfo.jsx`
- `src/pages/project/paintInfo/storyboard.jsx`
- `src/pages/project/paintInfo/currentDetail.jsx`
- `src/pages/project/paintInfo/imageList.jsx`
- `src/common/util.js`
- `src/services/pnt.js`
- `src/services/videomaker.js`
- `src/services/gai.js`

Responsibilities:

- Maintain `mediumData` storyboard array and selected indexes.
- Add/delete storyboard rows with index reordering.
- Infer storyboard information with `infoExtract`.
- Assemble prompts with `assemble4Generations`.
- Generate images via cloud `generations` or local `generateSdImageSynchronous`.
- Poll image tasks with `generationsCheck` and queue APIs.
- Persist images locally with `saveStoryboardImage`.
- Convert image to video with `image2video` and poll `image2videoCheck`.
- Persist videos locally with `saveStoryboardVideo`.
- Generate per-storyboard audio with `genAudio` and `saveStoryboardAudio`.
- Compose final video with `makeVideo` and poll `getMakeVideoProgress`.
- Export Jianying draft with `exportJianyingDraft` and poll `getExportProgress`.

### Settings And Model Configuration

Files:

- `src/pages/settings.jsx`
- `src/layout/index.jsx`
- `src/services/videomaker.js`
- `src/services/pnt.js`

Responsibilities:

- Fetch cloud image/video models with `getModelPage`.
- Connect cloud model with `setCloudModel`, then verify with `getPaintingApiState`.
- Connect local SD/Flux with `connectSd`.
- Load/save local SD config with `getSdConfig` and `setSdConfig`.
- Switch local SD/Flux API state with `changeLocalSdApiState`.
- Load material path with `getShootingPath`.
- Load/save Jianying draft path with `getJianyingConfig` and `saveJianyingAddress`.
- Update shared drawing state shown in the header and used by paint flows.

### Coins, Recharge, And Paid Actions

Files:

- `src/layout/index.jsx`
- `src/layout/payModal.jsx`
- `src/pages/recharge/recharge.jsx`
- `src/pages/recharge/protocolModal.jsx`
- `src/services/sto.js`
- `src/assets/constant.js`

Responsibilities:

- Fetch account balance with `getAccountInfo`.
- Fetch coin logs with `getCurrencyLogs`.
- Fetch products with `getCurrencyCoin`.
- Create purchase order with `goodsBuy`.
- Poll order status with `orderStatus`.
- Open recharge when backend returns `LACK_GOLD_CODE` or `MSG_CODE.COST_ERROR`.
- Track image/video model fees using cloud model `modelFee`.

## API Domains

### `/videomaker/aihost`

Local desktop/backend domain for project files, local assets, local SD, Jianying, update, and app integration.

Common functions:

- Project: `createProject`, `getProjectDetail`, `setFileContent`, `RefreshProjectList`, `deleteProject`, `editProjectBasicInformation`.
- Storyboard: `addMediumShooting`, `deleteMediumShooting`, `saveStoryboardImage`, `saveStoryboardVideo`, `saveStoryboardAudio`.
- Assets: `fileParse`, `uploadExampleImage`, `deleteExampleImage`, `openFolder`, `copyVideo`, `seekVideo`.
- Labels: `getLabel`, `setLabel`, `delLabel`, `saveLabelImage`, `generateLabelImage`, `findLabelImage`.
- Local model: `getSdConfig`, `setSdConfig`, `connectSd`, `changeLocalSdApiState`, `generateSdImageSynchronous`, `getPaintingApiState`.
- Export/update: `makeVideo`, `getMakeVideoProgress`, `exportJianyingDraft`, `getExportProgress`, `updater`, `updaterCheck`, `checkUpdateProgress`.

### `${REACT_APP_BASEAPI}/pnt/api`

Cloud AI/domain platform for model catalog, label extraction/library, text separation, prompt assembly, image generation, image-to-video, and file upload.

Common functions:

- Models/styles: `getModelPage`, `getStyleList`.
- Labels: `extractRole`, `extractScene`, `uploadLabel`, `deleteLabel`, `getAllLabel`.
- Text/prompt: `textSeparator`, `infoExtract`, `assemble4Generations`.
- Media tasks: `generations`, `generationsCheck`, `queueCheck`, `queueRemove`, `image2video`, `image2videoCheck`.
- Upload/update: `fileUpload`, `upgradeLast`.

### `${REACT_APP_BASEAPI}/pnt/dict`

Dictionary/config domain. Currently used for `getTimbres`.

### `${REACT_APP_BASEAPI}/adm/api`

User login domain: `doLogin`, `resetPwd`, `loginByVcode`, `sendVerifyCode`, `doLogout`, `getUser`.

### `${REACT_APP_BASEAPI}/sto/c`

Store/account domain: `getCurrencyLogs`, `getAccountInfo`, `getCurrencyCoin`, `goodsBuy`, `orderStatus`.

### `${REACT_APP_BASEAPI}/gai/api`

General AI utilities: `translation`, `genAudio`.

## State Enums To Reuse

Important constants in `src/assets/constant.js`:

- `SUCCESS_CODE`, `ERROR_CODE`, `LOGOUT_CODE`, `LACK_GOLD_CODE`, `NETWORK_ERR`.
- `MSG_CODE.LOGIN_EXPIRE`, `MSG_CODE.COST_ERROR`.
- `PROJECT_STAGE`: new/unuploaded/uploaded.
- `LABEL_TYPE`: person/scene.
- `DRAW_STATE`: cloud async image generation status.
- `TRANS_VIDEO_STATE`: image-to-video status.
- `STROYBOARD_STATE`: storyboard inference/drawing/video state machine.
- `SELECT_MODE`: storyboard batch selection modes.
- `SEGMENT`: script segmentation limits.
- `SD_TYPE`: local SD/Flux.

## Change Recipes

### Add A New Project Detail Step

1. Add the route under `/project/detail` in `src/index.jsx`.
2. Add the tab/segment entry and navigation handling in `src/pages/project/detail.jsx`.
3. Pass needed shared state through `Outlet` context.
4. Keep step validation in the current child via `useImperativeHandle(childRef, ...)` if the parent needs next/back orchestration.

### Add A New Backend Endpoint

1. Choose the service file by backend domain.
2. Add an exported async wrapper.
3. Import through `api` from `src/services/project.jsx`; the aggregator already spreads all domain exports.
4. Preserve backend naming if the existing API uses misspellings such as `Scence`.
5. Add constants for response states only if the value is used in more than one place.

### Add A Paid Cloud Action

1. Ensure the selected cloud model exposes `modelFee` or add the fee to the model option map.
2. Reuse `checkCoin` before starting expensive work.
3. Open recharge through existing lack-of-coin response handling.
4. Call `updateAccountInfo` after successful completion or after opening coin views.

### Add A Storyboard Batch Operation

1. Use `selectedList` for target indexes and `mediumDataRef.current` for current data.
2. Keep `mediumData` and `mediumDataRef.current` synchronized after mutations.
3. Recompute item `index` values after insert/delete/reorder.
4. Clear or update timers/abort controllers for affected items.
5. Preserve `currentIndex` and `selectedIndexRef.current` consistency.
