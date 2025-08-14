import { BrowserWindow } from 'electron'
import * as window from 'share/main/lib/window'

let win: BrowserWindow | null = null

export function showWin(url: string) {
  if (win) {
    win.focus()
    window.sendTo('video', 'setVideoUrl', url)
    return
  }

  win = window.create({
    name: 'video',
    minWidth: 480,
    minHeight: 320,
    width: 640,
    height: 480,
  })

  win.on('close', () => {
    win?.destroy()
    win = null
  })

  window.loadPage(win, {
    page: 'video',
    videoUrl: url,
  })
}
