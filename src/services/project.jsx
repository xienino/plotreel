// let axiosInstance = null
// export function initAxiosInstance(newAxiosInstance) {
//   axiosInstance = newAxiosInstance
// }

import * as admin from './admin.js'
import * as gai from './gai.js'
import * as pnt from './pnt.js'
import * as sto from './sto.js'
import * as videomaker from './videomaker.js'

export default {
  ...admin,
  ...gai,
  ...pnt,
  ...sto,
  ...videomaker,
}
