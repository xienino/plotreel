import animeStyle from './paintingStyle/animeStyle.png'
import modernUrbanStyle from './paintingStyle/modernUrbanStyle.png'
import chineseAncientStyle from './paintingStyle/chineseAncientStyle.png'
import martialArtsFairyStyle from './paintingStyle/martialArtsFairyStyle.png'
import sciFiStyle from './paintingStyle/sciFiStyle.png'
import realisticStyle from './paintingStyle/realisticStyle.png'

export const BATCH_NUM = 3

export const paintingStyle = [
  { value: 1, label: '动漫', img: animeStyle },
  { value: 2, label: '现代都市', img: modernUrbanStyle },
  { value: 3, label: '国学古风', img: chineseAncientStyle },
  { value: 4, label: '武侠仙侠', img: martialArtsFairyStyle },
  { value: 5, label: '科幻', img: sciFiStyle },
  { value: 6, label: '写实', img: realisticStyle },
]

export const pictureSizeList = [
  { value: '768*1344', label: '9:16 抖音', tip: '768*1344', shortLabel: '9:16' },
  { value: '1024*1024', label: '1:1 正方形', tip: '1024*1024', shortLabel: '1:1' },
  { value: '1344*768', label: '16:9 西瓜视频', tip: '1344*768', shortLabel: '16:9' },
  { value: '1152*896', label: '4:3 怀旧艺术', tip: '1152*896', shortLabel: '4:3' },
]

export const bgmList = [
  { value: 1, label: '古风轻快' },
  { value: 2, label: '紧张震撼' },
  { value: 3, label: '宁静舒缓' },
  { value: 4, label: '赛博朋克-欢快' },
]

export const goodsNameMap = {
  DB: '充值算币',
  CN: '新用户注册赠送',
  CS: '签到赠送',
  SA: '后台更改',
  'SA-ID': '后台更改',
  CP: '绘制配图',
  CG: '推理提示词',
  PV: '图转视频',
  CB: '消耗金币', // 脏数据
  CR: '系统返还',
}
export const CONSUME_WAY = {
  // 0 推理 1绘图 2转视频
  ILLATION: 0,
  DRAW: 1,
  TRANS_VIDEO: 2,
}
export const CONSUME_WAY_NAME = {
  // 0 推理 1绘图 2转视频
  [CONSUME_WAY.ILLATION]: '推理',
  [CONSUME_WAY.DRAW]: '绘图',
  [CONSUME_WAY.TRANS_VIDEO]: '转视频',
}

export const enquiryCostMap = {
  'flux-pro': 10,
  'flux-dev': 6,
  'flux.1.1-pro': 20,
  'kling-v1': 8,
}

export const LACK_GOLD_CODE = -3
export const LOGOUT_CODE = -1
export const NETWORK_ERR = -2
export const SUCCESS_CODE = 1
export const ERROR_CODE = 0

export const TRANS_STATE = {
  // 重新生成图
  DONE: 0,
  ING: 1,
  ERROR: 2,
  LINEUP: 3, // 排队中
}
export const TRANS_VIDEO_STATE = {
  // 图转视频状态码 -1 排队 0 生成中 1完成 2失败
  DONE: 1, // 完成
  ING: 0, // 生成中
  ERROR: 2, // 失败
  LINEUP: -1, // 排队中
}
export const DRAW_STATE = {
  // 异步文生图状态码 -1 排队 0 生成中 1完成 2失败
  DONE: 1, // 完成
  ING: 0, // 生成中
  ERROR: 2, // 失败
  LINEUP: -1, // 排队中
}
export const TRANS_STATE_MAP = {
  // 重新生成图、图转视频状态码
  0: '已完成绘制',
  1: '正在绘制',
  2: '绘制出错，请重试',
  3: '绘制排队中',
}

export const dstcode = '1387571892197527552'

export const dstcodeUrl = [
  '/api/user/login/doLogin', // 登录
  '/api/user/loginByVcode', // 验证码登录
  '/api/user/autoLogin', // 注册
]

export const PROJECT_STAGE = {
  INIT: -1,
  UNUPLOAD: 0,
  UPLOADED: 1,
}

export const KEY_CODE = {
  UP: 38, // 上
  DOWN: 40, // 下
  LEFT: 37, // 左
  RIGHT: 39, // 右
  ENTER: 13, // 回车
  BACKSPACE: 8, // backspace 删除
}

export const LABEL_TYPE = {
  PERSON: 0, // 角色标签
  SCENCE: 1, // 场景标签
}

export const LABEL_TYPE_LABEL = {
  [LABEL_TYPE.PERSON]: '角色',
  [LABEL_TYPE.SCENCE]: '场景',
}

export const LABEL_TYPE_TAB = {
  [LABEL_TYPE.PERSON]: [
    { value: 'add', label: '新建角色' },
    { value: 'select', label: '角色库选择' },
  ],
  [LABEL_TYPE.SCENCE]: [
    { value: 'add', label: '新建场景' },
    { value: 'select', label: '场景库选择' },
  ],
}

export const LABEL_TYPE_EDIT_TAB = {
  [LABEL_TYPE.PERSON]: [
    { value: 'add', label: '编辑角色' },
    { value: 'select', label: '角色库选择' },
  ],
  [LABEL_TYPE.SCENCE]: [
    { value: 'add', label: '编辑场景' },
    { value: 'select', label: '场景库选择' },
  ],
}

export const MSG_CODE = {
  // 方便调查bug
  // 10000 系统错误，请联系管理员
  // 10001 操作成功
  // 10002 操作失败
  // 10003 操作异常
  // 10004 参数异常
  LOGIN_EXPIRE: '10005', // 未登录或登录超时,
  // 10006 未授权，请联系管理员
  // 110050001 无效参数
  // 110050002 执行时间过长,已超时
  // 110050003 价格配置错误
  // 110050004 不支持的模型
  // 110050005 图转视频生成失败
  // 110080100 推理异常
  COST_ERROR: '110010104', // 扣费失败
  // 110090100 第三方接口调用返回错误结果
  // 110090101 第三方接口调用超时
  // 110090102 第三方接口调用返回错误结果，返回格式不是json
  // 110090103 第三方接口调用，未知异常
}

export const STROYBOARD_STATE = {
  STOP: 0, // 未推理
  ILLATION_WAIT: 1, // 推理等待
  ILLATION_LINEUP: 2, // 推理排队
  ILLATION_ING: 3, // 推理进行中
  ILLATION_DONE: 4, // 推理完成待绘图
  DRAWING_WAIT: 5, // 绘图等待
  DRAWING_LINEUP: 6, // 绘图排队
  DRAWING_ING: 7, // 绘图进行中
  TRANS_VIDEO_WAIT: 8, // 转视频等待中
  TRANS_VIDEO_LINEUP: 9, // 转视频排队中
  TRANS_VIDEO_ING: 10, // 转视频中
  ILLATION_FAIL: 11, // 推理失败
  DRAWING_FAIL: 12, // 绘图失败
  TRANS_VIDEO_FAIL: 13, // 转视频失败
  DRAWING_DONE: 14, // 绘图完
}

export const STROYBOARD_STATE_LABEL = {
  [STROYBOARD_STATE.STOP]: {
    title: '未推理',
    tip: '请选中分镜后，点击情节推理',
    isLoading: false,
  },
  [STROYBOARD_STATE.ILLATION_WAIT]: { title: '推理等待中', isLoading: true },
  [STROYBOARD_STATE.ILLATION_LINEUP]: { title: '推理排队中', isLoading: true },
  [STROYBOARD_STATE.ILLATION_ING]: { title: '推理中', isLoading: true },
  [STROYBOARD_STATE.DRAWING_WAIT]: { title: '绘图等待中', isLoading: true },
  [STROYBOARD_STATE.DRAWING_LINEUP]: { title: '绘图排队中', isLoading: true },
  [STROYBOARD_STATE.DRAWING_ING]: { title: '绘图中', isLoading: true },
  [STROYBOARD_STATE.TRANS_VIDEO_WAIT]: { title: '转视频等待中', isLoading: true },
  [STROYBOARD_STATE.TRANS_VIDEO_LINEUP]: { title: '转视频排队中', isLoading: true },
  [STROYBOARD_STATE.TRANS_VIDEO_ING]: {
    title: '转视频中',
    subTitle: '，退出后AI会继续合成',
    isLoading: true,
  },
  [STROYBOARD_STATE.ILLATION_FAIL]: { title: '推理失败', isLoading: false, isShowRetryBtn: true },
  [STROYBOARD_STATE.DRAWING_FAIL]: { title: '绘图失败', isLoading: false, isShowRetryBtn: true },
  [STROYBOARD_STATE.TRANS_VIDEO_FAIL]: {
    title: '转视频失败',
    isLoading: false,
    isShowRetryBtn: true,
  },
  [STROYBOARD_STATE.ILLATION_DONE]: {
    title: '推理完成待绘图',
    tip: '请选中分镜后，点击绘制配图',
    isLoading: false,
  },
  [STROYBOARD_STATE.DRAWING_DONE]: {},
}

export const SELECT_MODE = {
  ALL: 0,
  SELECT_UNILLATION: 1,
  SELECT_UNDRAWING: 2,
  UNSELECT: 3,
  CUSTOM: null, // 自定义选中
}
export const SELECT_MODE_LIST = [
  { label: '全选', value: SELECT_MODE.ALL },
  { label: '选中未推理', value: SELECT_MODE.SELECT_UNILLATION },
  { label: '选中待绘制', value: SELECT_MODE.SELECT_UNDRAWING },
  { label: '全不选', value: SELECT_MODE.UNSELECT },
  // { label: '全不选', value: SELECT_MODE.UNSELECT }
]

export const TAG_STATE = {
  LOADING: 1, // 绘制中
  NORMAL: 0, // 未绘制
}

export const SD_TYPE = {
  SD: 0,
  FLUX: 1,
}

export const SEGMENT = {
  MAX_ROW_NUM: 100,
  MAX_ROW_WORD_LEN: 60,
  MAX_WORD: 3000,
}
