import { getMainStore } from '../lib/store'
import * as window from 'share/main/lib/window'
import log from 'share/common/log'
import { handleEvent } from 'share/main/lib/util'
import once from 'licia/once'
import uuid from 'licia/uuid'
import { IpcGetWindowsDrives, IpcNewWindow } from 'common/types'
import { BrowserWindow, dialog, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { t } from 'common/util'
import * as mount from './mount'
import remove from 'licia/remove'
import isEmpty from 'licia/isEmpty'
import last from 'licia/last'
import { getWindowsDrives as listWindowsDrives } from '../lib/windowsDrives'

const logger = log('mainWin')

const store = getMainStore()

let focusedWin: BrowserWindow | null = null
const wins: BrowserWindow[] = []

export function showWin(name?: string) {
  logger.info('show')

  init()
  initIpc()

  const win = window.create({
    name: `main-${uuid()}`,
    minWidth: 960,
    minHeight: 640,
    ...store.get('bounds'),
    maximized: store.get('maximized'),
    onSavePos: () => window.savePos(win, store, true),
    menu: true,
  })
  wins.push(win)

  win.on('focus', () => (focusedWin = win))
  win.on('close', () => {
    remove(wins, (w) => w === win)
    win?.destroy()
    if (focusedWin === win) {
      focusedWin = null
    }
    if (!isEmpty(wins)) {
      focusedWin = last(wins)
    }
  })

  if (name) {
    window.loadPage(win, {
      name,
    })
  } else {
    window.loadPage(win)
  }
}

export function showFocusedWin() {
  if (focusedWin) {
    focusedWin.show()
    return true
  }

  return false
}

export const newWin: IpcNewWindow = function (name) {
  if (focusedWin) {
    const bounds = store.get('bounds')
    const winBounds = focusedWin.getBounds()
    bounds.x = winBounds.x + 50
    bounds.y = winBounds.y + 50
  }
  showWin(name)
}

const init = once(() => {
  autoUpdater.on('update-not-available', () => {
    alert('info', t('updateNotAvailable'))
  })
  autoUpdater.on('update-available', async () => {
    const result = await confirm(t('updateAvailable'))
    if (result) {
      shell.openExternal('https://rem.liriliri.io')
    }
  })
  autoUpdater.on('error', () => {
    alert('error', t('updateErr'))
  })
  function alert(type: 'info' | 'error', message: string) {
    if (focusedWin) {
      dialog.showMessageBox(focusedWin, {
        type,
        message,
        buttons: [t('ok')],
      })
    }
  }
  async function confirm(message: string) {
    if (focusedWin) {
      const res = await dialog.showMessageBox(focusedWin, {
        type: 'question',
        message,
        buttons: [t('ok'), t('cancel')],
      })
      return res.response === 0
    }
    return false
  }
})

const initIpc = once(() => {
  const getWindowsDrives: IpcGetWindowsDrives = function () {
    return listWindowsDrives()
  }

  handleEvent('newWindow', newWin)
  handleEvent('getWindowsDrives', getWindowsDrives)
  handleEvent('showMount', () => mount.showWin())
})
