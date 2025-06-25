import { BrowserWindow } from 'electron'
import { getAboutStore } from '../lib/store'
import * as window from 'share/main/lib/window'

const store = getAboutStore()

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  win = window.create({
    name: 'about',
    resizable: false,
    ...store.get('bounds'),
    minWidth: 360,
    minHeight: 240,
    width: 360,
    height: 240,
    onSavePos: () => window.savePos(win, store),
    menu: false,
  })

  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, {
    page: 'about',
  })
}
