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
    minWidth: 640,
    minHeight: 480,
    width: 640,
    height: 480,
  })

  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, {
    page: 'mount',
  })
}
