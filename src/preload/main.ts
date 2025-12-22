import {
  IpcGetRcloneAuth,
  IpcGetRclonePort,
  IpcGetWindowsDrives,
  IpcIsRcloneRunning,
  IpcNewWindow,
  IpcValidatePassword,
} from '../common/types'
import { IpcGetStore, IpcSetStore } from 'share/common/types'
import mainObj from 'share/preload/main'
import { invoke } from 'share/preload/util'

export default Object.assign(mainObj, {
  getMainStore: invoke<IpcGetStore>('getMainStore'),
  setMainStore: invoke<IpcSetStore>('setMainStore'),
  getRclonePort: invoke<IpcGetRclonePort>('getRclonePort'),
  getRcloneAuth: invoke<IpcGetRcloneAuth>('getRcloneAuth'),
  isRcloneRunning: invoke<IpcIsRcloneRunning>('isRcloneRunning'),
  openRcloneCli: invoke('openRcloneCli'),
  newWindow: invoke<IpcNewWindow>('newWindow'),
  getWindowsDrives: invoke<IpcGetWindowsDrives>('getWindowsDrives'),
  showMount: invoke('showMount'),
  validatePassword: invoke<IpcValidatePassword>('validatePassword'),
  closePassword: invoke('closePassword'),
})
