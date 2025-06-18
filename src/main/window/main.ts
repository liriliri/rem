import { getMainStore } from '../lib/store'
import * as window from 'share/main/lib/window'
import log from 'share/common/log'
import { IpcGetStore, IpcSetStore } from 'share/common/types'
import { handleEvent } from 'share/main/lib/util'
import once from 'licia/once'

const logger = log('mainWin')

const store = getMainStore()

export function showWin() {
  logger.info('show')

  initIpc()

  const win = window.create({
    name: 'main',
    minWidth: 960,
    minHeight: 640,
    ...store.get('bounds'),
    maximized: store.get('maximized'),
    onSavePos: () => window.savePos(win, store, true),
    menu: true,
  })

  win.on('close', () => {
    win?.destroy()
  })

  window.loadPage(win)
}

const initIpc = once(() => {
  handleEvent('setMainStore', <IpcSetStore>(
    ((name, val) => store.set(name, val))
  ))
  handleEvent('getMainStore', <IpcGetStore>((name) => store.get(name)))
  store.on('change', (name, val) => {
    window.sendAll('changeMainStore', name, val)
  })
})
