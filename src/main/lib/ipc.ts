import { handleEvent } from 'share/main/lib/util'
import { getMainStore, getSettingsStore } from './store'
import { IpcGetStore, IpcSetStore } from 'share/common/types'
import * as window from 'share/main/lib/window'

const store = getMainStore()

const settingsStore = getSettingsStore()

export function init() {
  handleEvent('setMainStore', <IpcSetStore>(
    ((name, val) => store.set(name, val))
  ))
  handleEvent('getMainStore', <IpcGetStore>((name) => store.get(name)))
  store.on('change', (name, val) => {
    window.sendAll('changeMainStore', name, val)
  })

  handleEvent('setSettingsStore', <IpcSetStore>((name, val) => {
    settingsStore.set(name, val)
  }))
  handleEvent('getSettingsStore', <IpcGetStore>(
    ((name) => settingsStore.get(name))
  ))
}
