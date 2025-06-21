import { BrowserWindow } from 'electron'
import { getSettingsStore } from '../lib/store'
import * as window from 'share/main/lib/window'
import once from 'licia/once'
import { handleEvent } from 'share/main/lib/util'
import { IpcGetStore, IpcSetStore } from 'share/common/types'

const store = getSettingsStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  initIpc()

  win = window.create({
    name: 'settings',
    resizable: false,
    ...store.get('bounds'),
    minWidth: 480,
    minHeight: 360,
    width: 480,
    height: 360,
    onSavePos: () => window.savePos(win, store),
    menu: false,
  })

  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, {
    page: 'settings',
  })
}

const initIpc = once(() => {
  handleEvent('setSettingsStore', <IpcSetStore>((name, val) => {
    store.set(name, val)
  }))
  handleEvent('getSettingsStore', <IpcGetStore>((name) => store.get(name)))
})
