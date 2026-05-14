---
name: plotreel-business
description: Use this skill when working in the PlotReel React desktop frontend, especially when adding or modifying project creation, script segmentation, label libraries, storyboard inference, image generation, image-to-video, Jianying export, login, settings, cloud/local model configuration, or coin recharge business flows.
---

# PlotReel Business Development

## What This Project Is

PlotReel is a React 18 + CRA frontend for a pywebview-style desktop video-maker app. The core user journey is:

1. Login or auto-login.
2. Create/open a project draft.
3. Upload or enter a script.
4. Segment script text into storyboards.
5. Configure title, visual style, aspect ratio, voice, and labels.
6. Infer storyboard prompts, draw images, optionally convert images to videos.
7. Export a local video or Jianying draft.
8. Spend and recharge coins for cloud inference/drawing/video tasks.

Use this skill to preserve existing patterns. Prefer small, local changes in the relevant page/component/service file.

## Stack And Conventions

- React 18 with function components and hooks.
- Routing is `react-router-dom@6` with `createHashRouter`.
- UI is Ant Design v5 with dark compact theme from `src/layout/index.jsx`.
- Styles are mostly sibling `.sass` files imported by each page/component.
- Some components are TypeScript (`.tsx`), but most business pages are `.jsx`.
- API calls are plain functions under `src/services`, merged by `src/services/project.jsx`.
- Business constants and state enums live in `src/assets/constant.js`.
- Local desktop/backend integration uses `/videomaker/aihost/*` plus `window.pywebview`.
- `window.axiosInstance` is created in `src/layout/index.jsx`; do not create unrelated axios clients for normal business API calls.

## Key Files

- `src/index.jsx`: app bootstrap, hash routes, top-level drawing/model state.
- `src/layout/index.jsx`: global layout, AntD theme, auth token (`mtk`), axios interceptors, account balance, settings, recharge, update flow.
- `src/pages/login.jsx`: password/login-code/auto-login flow.
- `src/pages/project/index.jsx`: project draft list, completed video list, create/delete/rename/re-edit/download.
- `src/pages/project/detail.jsx`: detail shell and step navigation (`base`, `paint`, `preview`), project detail refresh, video/Jianying export orchestration.
- `src/pages/project/baseInfo/baseInfo.jsx`: script upload/input, text segmentation, base metadata, style/size/voice, labels before drawing.
- `src/pages/project/baseInfo/segmentContent.jsx`: storyboard text rows and save/delete behavior.
- `src/pages/project/baseInfo/labelContent.jsx`: role/scene label extraction and label editing entry.
- `src/pages/project/paintInfo/paintInfo.jsx`: main storyboard production workflow: inference, image generation, image-to-video, audio, export.
- `src/pages/project/paintInfo/storyboard.jsx`: storyboard list/sidebar behavior.
- `src/pages/project/paintInfo/currentDetail.jsx`: current storyboard detail, prompts, images, label edits, redraw/video actions.
- `src/pages/settings.jsx`: local SD/Flux config, cloud image/video model selection, Jianying path.
- `src/layout/payModal.jsx` and `src/pages/recharge/*`: coin logs, products, purchase and payment status.
- `src/common/util.js`: shared helpers for local asset URLs, base64/file conversion, label image generation/save.

For a fuller map of business domains and APIs, read `references/business-map.md`.

## Routing And State Flow

The main route tree is:

```text
/
  layout
  /project              project drafts / completed works
  /project/detail/base/:id
  /project/detail/paint/:id
/login
```

`src/index.jsx` owns cross-page drawing state such as `drawingModel`, `drawingSdState`, `modelName`, `sdConfig`, cloud model option lists, and `jianYingState`. It passes these into `MyLayout`, then layout/detail pages pass working state down through `Outlet` context.

When adding a new step-level feature, first check whether the state belongs in:

- The current leaf page/component, if it is purely local UI state.
- `detail.jsx`, if it coordinates `base` and `paint` or step navigation/export.
- `layout/index.jsx` or `src/index.jsx`, only if it must be shared globally across settings, header, and multiple project pages.

## API Layer Rules

Add API wrappers to the domain service, then use `api.someFunction()` from `src/services/project.jsx`.

- `admin.js`: `/adm/api`, login/logout/user.
- `pnt.js`: `${REACT_APP_BASEAPI}/pnt/api` and `/pnt/dict`, cloud models, cloud labels, text separation, prompt generation, cloud image/video task APIs, file upload.
- `videomaker.js`: `/videomaker/aihost`, local desktop/backend project, file parsing, local assets, storyboard persistence, SD config, Jianying export, update flow.
- `sto.js`: `${REACT_APP_BASEAPI}/sto/c`, coins, products, orders.
- `gai.js`: `${REACT_APP_BASEAPI}/gai/api`, translation and TTS.

Normal API wrapper pattern:

```js
export async function doThing(data) {
  return window.axiosInstance.post('/path', data, { baseURL }).catch((error) => {
    message.error(`Error posting user data: ${error}`)
  })
}
```

Some long-running APIs intentionally avoid `.catch` or accept config/AbortController. Preserve those shapes when adding cancellation, polling, or custom timeout behavior.

## Business Concepts

- Project/task id is usually `taskId`; older list items may also use `raw_file_id`.
- A project moves from new/unuploaded to uploaded/segmented using `PROJECT_STAGE`.
- Script rows become storyboard items with `index` and `source`.
- Labels have type `LABEL_TYPE.PERSON` or `LABEL_TYPE.SCENCE` and may come from extraction, library selection, or user-defined edits.
- Drawing mode is `cloud` or `custom`. Cloud uses `pnt` generation/task APIs; custom uses local SD/Flux APIs through `videomaker`.
- Storyboard status uses `STROYBOARD_STATE`; cloud image task status uses `DRAW_STATE`; image-to-video status uses `TRANS_VIDEO_STATE`.
- Cloud model fee is stored in model option `modelFee`; layout/settings use it to check coins and refresh balance.
- Local asset URLs often need `formatLocalAssets()` before display.

## Adding A New Business Feature

1. Locate the user flow first: project list, base info, label edit, paint/detail, settings, recharge, or layout/global.
2. Reuse existing constants from `src/assets/constant.js`; add new enums there only if multiple files need them.
3. Add or extend the right API wrapper in `src/services/*`, then consume via `import api from .../services/project`.
4. Keep page orchestration in the nearest route page; use child refs only where the existing parent/child step flow already does.
5. Preserve polling cleanup: timers live in refs and should be cleared in `clearFunc`, effect cleanup, or before replacing intervals.
6. For cloud paid actions, check balance where the surrounding flow already calls `checkCoin`, and call `updateAccountInfo` after successful paid work.
7. For storyboard mutations, keep `mediumData`, `mediumDataRef.current`, `selectedList`, and item `index` consistent.
8. For image/video display, run local backend URLs through `formatLocalAssets`.
9. Match existing AntD + Sass styling; avoid broad theme changes unless the task is explicitly global.
10. Verify with at least `npm run frontend:test -- --watchAll=false` or a focused build/test command when practical.

## Common Pitfalls

- `window.axiosInstance` is only available after layout initializes. Do not call service functions before the app layout/auth setup.
- The spelling `STROYBOARD_STATE` and `SCENCE` is existing API/code vocabulary; keep it when referencing existing constants.
- `src/services/pnt.js` currently contains local edits in some worktrees; inspect before changing.
- `upgradeLast` in `pnt.js` has a non-returning implementation in the current codebase. Treat update-flow work carefully.
- The package scripts include some malformed build variants; use `npm run dev`, `npm run build`, or `npm run frontend:test` unless asked otherwise.
- Do not remove user timers/abort controllers without replacing cleanup behavior.
