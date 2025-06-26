import { getMainStore } from '../lib/store'
import * as window from 'share/main/lib/window'
import log from 'share/common/log'
import { IpcGetStore, IpcSetStore } from 'share/common/types'
import { handleEvent } from 'share/main/lib/util'
import once from 'licia/once'
import uuid from 'licia/uuid'
import { IpcGetWindowsDrives, IpcNewWindow } from 'common/types'
import childProcess from 'node:child_process'
import map from 'licia/map'
import trim from 'licia/trim'
import filter from 'licia/filter'
import endWith from 'licia/endWith'
import { BrowserWindow, dialog, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { t } from '../../common/util'

const logger = log('mainWin')

const store = getMainStore()

let focusedWin: BrowserWindow | null = null

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

  win.on('focus', () => (focusedWin = win))
  win.on('close', () => {
    if (focusedWin === win) {
      focusedWin = null
    }
    win?.destroy()
  })

  if (name) {
    window.loadPage(win, {
      name,
    })
  } else {
    window.loadPage(win)
  }
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
    return new Promise((resolve, reject) => {
      childProcess.exec('wmic logicaldisk get caption', (err, stdout) => {
        if (err) {
          reject(err)
          return
        }

        const lines = map(stdout.split('\n'), (line) => trim(line))

        resolve(filter(lines, (line) => endWith(line, ':')))
      })
    })
  }

  handleEvent('setMainStore', <IpcSetStore>(
    ((name, val) => store.set(name, val))
  ))
  handleEvent('getMainStore', <IpcGetStore>((name) => store.get(name)))
  store.on('change', (name, val) => {
    window.sendAll('changeMainStore', name, val)
  })
  handleEvent('newWindow', <IpcNewWindow>((name) => {
    const bounds = store.get('bounds')
    if (bounds.x) {
      bounds.x += 50
    }
    if (bounds.y) {
      bounds.y += 50
    }
    showWin(name)
  }))
  handleEvent('getWindowsDrives', getWindowsDrives)
})
