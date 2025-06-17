import { IpcGetRclonePort } from 'common/types'
import { IpcGetStore, IpcSetStore } from 'share/common/types'
import mainObj from 'share/preload/main'
import { invoke } from 'share/preload/util'

export default Object.assign(mainObj, {
  getSettingsStore: invoke<IpcGetStore>('getSettingsStore'),
  setSettingsStore: invoke<IpcSetStore>('setSettingsStore'),
  getRclonePort: invoke<IpcGetRclonePort>('getRclonePort'),
})
