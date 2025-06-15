import { getMainStore } from '../lib/store'
import * as window from 'share/main/lib/window'
import log from 'share/common/log'

const logger = log('mainWin')

const store = getMainStore()

export function showWin() {
  logger.info('show')

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
