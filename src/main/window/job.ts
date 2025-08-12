import { BrowserWindow } from 'electron'
import * as window from 'share/main/lib/window'

let win: BrowserWindow | null = null

export function showWin() {
  if (win) {
    win.focus()
    return
  }

  win = window.create({
    name: 'mount',
    minWidth: 960,
    minHeight: 640,
    width: 960,
    height: 640,
  })

  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, {
    page: 'job',
  })
}
