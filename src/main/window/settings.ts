import { BrowserWindow } from 'electron'
import { getSettingsStore } from '../lib/store'
import * as window from 'share/main/lib/window'

const store = getSettingsStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  const width = 480
  const height = 640

  win = window.create({
    name: 'settings',
    resizable: false,
    ...store.get('bounds'),
    minWidth: width,
    minHeight: height,
    width,
    height,
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
