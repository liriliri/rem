import { BrowserWindow } from 'electron'
import { getMountStore } from '../lib/store'
import * as window from 'share/main/lib/window'

const store = getMountStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  win = window.create({
    name: 'mount',
    minWidth: 640,
    minHeight: 480,
    ...store.get('bounds'),
    maximized: store.get('maximized'),
    onSavePos: () => window.savePos(win, store, true),
  })

  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, {
    page: 'mount',
  })
}
