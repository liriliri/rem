import { handleEvent } from 'share/main/lib/util'
import { getMainStore } from './store'
import { IpcGetStore, IpcSetStore } from 'share/common/types'
import * as window from 'share/main/lib/window'

const store = getMainStore()

export function init() {
  handleEvent('setMainStore', <IpcSetStore>(
    ((name, val) => store.set(name, val))
  ))
  handleEvent('getMainStore', <IpcGetStore>((name) => store.get(name)))
  store.on('change', (name, val) => {
    window.sendAll('changeMainStore', name, val)
  })
}
