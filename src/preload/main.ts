import {
  IpcGetFileIcon,
  IpcGetRcloneAuth,
  IpcGetRclonePort,
  IpcGetWindowsDrives,
  IpcIsRcloneRunning,
  IpcNewWindow,
} from 'common/types'
import { IpcGetStore, IpcSetStore } from 'share/common/types'
import mainObj from 'share/preload/main'
import { invoke } from 'share/preload/util'

export default Object.assign(mainObj, {
  getSettingsStore: invoke<IpcGetStore>('getSettingsStore'),
  setSettingsStore: invoke<IpcSetStore>('setSettingsStore'),
  getMainStore: invoke<IpcGetStore>('getMainStore'),
  setMainStore: invoke<IpcSetStore>('setMainStore'),
  getRclonePort: invoke<IpcGetRclonePort>('getRclonePort'),
  getRcloneAuth: invoke<IpcGetRcloneAuth>('getRcloneAuth'),
  isRcloneRunning: invoke<IpcIsRcloneRunning>('isRcloneRunning'),
  openRcloneCli: invoke('openRcloneCli'),
  newWindow: invoke<IpcNewWindow>('newWindow'),
  getWindowsDrives: invoke<IpcGetWindowsDrives>('getWindowsDrives'),
  getFileIcon: invoke<IpcGetFileIcon>('getFileIcon'),
  showMount: invoke('showMount'),
})
