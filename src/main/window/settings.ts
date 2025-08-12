import { BrowserWindow } from 'electron'
import * as window from 'share/main/lib/window'

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
    minWidth: width,
    minHeight: height,
    width,
    height,
  })

  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, {
    page: 'settings',
  })
}
